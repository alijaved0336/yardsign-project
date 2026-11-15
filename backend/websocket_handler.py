import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

import io
import csv
import asyncio
import requests
import json
import uuid
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from accounts.models import Sector
from accounts.views import process_csv_for_sector
from dataclasses import dataclass
from typing import Dict, List, Optional, Any

import websockets
import boto3
import environ
from openai import OpenAI
from botocore.exceptions import BotoCoreError, NoCredentialsError
from dotenv import load_dotenv
from django.conf import settings
from asgiref.sync import sync_to_async

from accounts.utils import (
    query_google_maps,
    geocode_address,
    locations_list,
    system_msg,
)
from accounts.models import SectorHistory  # ✅ using DB history model

# Django setup
os.environ.pop("HTTP_PROXY", None)
os.environ.pop("HTTPS_PROXY", None)

env = environ.Env()
environ.Env.read_env()
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


@dataclass
class ScrapingTask:
    """Data class to track scraping tasks"""
    task_id: str
    sector_id: Optional[int]
    service: str
    locations: List[str]
    count: Optional[int]
    status: str
    results: List[Dict]
    created_at: str
    updated_at: str
    progress: Dict[str, Any]
    websocket_id: Optional[str] = None


class TaskManager:
    """Manages background scraping tasks"""

    def __init__(self):
        self.tasks: Dict[str, ScrapingTask] = {}
        self.websockets: Dict[str, websockets.WebSocketServerProtocol] = {}
        self.executor = ThreadPoolExecutor(max_workers=5)

    def create_task(self, service: str, locations: List[str], count: Optional[int],
                   sector_id: Optional[int] = None, websocket_id: Optional[str] = None) -> str:
        """Create a new scraping task"""
        task_id = str(uuid.uuid4())
        task = ScrapingTask(
            task_id=task_id,
            sector_id=sector_id,
            service=service,
            locations=locations,
            count=count,
            status='pending',
            results=[],
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            progress={'processed_towns': 0, 'total_towns': len(locations_list), 'found_results': 0},
            websocket_id=websocket_id
        )
        self.tasks[task_id] = task
        return task_id

    def get_task(self, task_id: str) -> Optional[ScrapingTask]:
        return self.tasks.get(task_id)

    def update_task_status(self, task_id: str, status: str, **kwargs):
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = status
            task.updated_at = datetime.now().isoformat()
            for key, value in kwargs.items():
                if hasattr(task, key):
                    setattr(task, key, value)

            # ✅ broadcast status change
            if task.websocket_id:
                asyncio.create_task(
                    self.send_to_websocket(
                        task.websocket_id,
                        json.dumps({
                            "type": "status_update",
                            "task_id": task_id,
                            "status": task.status,
                            "progress": task.progress,
                        })
                    )
                )


    async def create_sector_history(self, sector_id: int, task: ScrapingTask):
        """Create history entry when task is created"""
        if not sector_id:
            return None
        try:
            history = await sync_to_async(SectorHistory.objects.create)(
                sector_id=sector_id,
                task_id=task.task_id,
                service=task.service,
                locations=task.locations,
                count=task.count,
                results_count=0,
                status="pending",
            )
            return history
        except Exception as e:
            logger.error(f"Error creating sector history: {str(e)}")
            return None

    async def update_sector_history(self, task: ScrapingTask, csv_url: Optional[str] = None):
        """Update history when task completes"""
        if not task.sector_id:
            return
        try:
            qs = SectorHistory.objects.filter(task_id=task.task_id, sector_id=task.sector_id)
            exists = await sync_to_async(qs.exists)()
            if exists:
                await sync_to_async(qs.update)(
                    results_count=len(task.results),
                    status=task.status,
                    completed_at=datetime.fromisoformat(task.updated_at)
                    if task.status in ['completed', 'failed'] else None,
                    csv_url=csv_url,
                )
        except Exception as e:
            logger.error(f"Error updating sector history: {str(e)}")

    def register_websocket(self, websocket_id: str, websocket: websockets.WebSocketServerProtocol):
        self.websockets[websocket_id] = websocket

    def unregister_websocket(self, websocket_id: str):
        self.websockets.pop(websocket_id, None)

    async def send_to_websocket(self, websocket_id: str, message: str):
        if websocket_id in self.websockets:
            try:
                await self.websockets[websocket_id].send(message)
                return True
            except:
                self.unregister_websocket(websocket_id)
        return False


task_manager = TaskManager()


class WebSocketHandler:
    def __init__(self):
        self.client = OpenAI()

    async def handle_socket(self, websocket, path):
        websocket_id = str(uuid.uuid4())

        # Log remote address if available
        remote = None
        try:
            remote = websocket.remote_address
        except Exception:
            remote = None

        logger.info(f"Incoming WebSocket connection attempt from {remote}, assigned id {websocket_id}")
        print(f"Client connected: {websocket_id}")  # fixed to f-string
        task_manager.register_websocket(websocket_id, websocket)

        try:
            while True:
                try:
                    # Removed 600s wait_for wrapper. The `websockets` module handles keepalive via pings.
                    message = await websocket.recv()
                    if message == "ping":
                        await websocket.send("pong")
                        continue
                        
                    try:
                        parsed = json.loads(message)
                        if parsed.get("type") == "get_task_status":
                            await self.handle_task_status_request(websocket, parsed)
                        elif parsed.get("type") == "get_sector_history":
                            await self.handle_sector_history_request(websocket, parsed)
                        elif parsed.get("type") == "confirm_upload":  # already handled
                            await self.handle_upload_confirmation(websocket, parsed)
                        else:
                            await self.process_prompt(websocket, message, websocket_id)
                    except json.JSONDecodeError:
                        await self.process_prompt(websocket, message, websocket_id)
                except asyncio.TimeoutError:
                    # TimeoutError is mostly obsolete without wait_for, but included for safety
                    logger.info(f"WebSocket timeout, continuing instead of closing: {websocket_id}")
                    continue
        except websockets.ConnectionClosed as e:
            logger.info(f"WebSocket closed for {websocket_id}: {e}")
        except Exception as e:
            logger.exception(f"Unexpected error in handle_socket for {websocket_id}: {e}")
        finally:
            task_manager.unregister_websocket(websocket_id)
            logger.info(f"Unregistered websocket {websocket_id}")


    async def handle_task_status_request(self, websocket, message):
        task_id = message.get("task_id")
        if not task_id:
            return
        task = task_manager.get_task(task_id)
        if task:
            response = {
                "type": "task_status",
                "task_id": task_id,
                "status": task.status,
                "progress": task.progress,
                "results_count": len(task.results),
            }
            await websocket.send(json.dumps(response))

    async def handle_sector_history_request(self, websocket, message):
        sector_id = message.get("sector_id")
        if not sector_id:
            return
        qs = SectorHistory.objects.filter(sector_id=sector_id).order_by("-created_at")
        history = await sync_to_async(list)(qs.values())
        response = {"type": "sector_history", "sector_id": sector_id, "history": history}
        await websocket.send(json.dumps(response, default=str))

    async def optimize_prompt(self, prompt):
        try:
            def _call_openai():
                return self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "system", "content": system_msg}, {"role": "user", "content": prompt}],
                )
            response = await sync_to_async(_call_openai)()
            return json.loads(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"Prompt optimization failed: {str(e)}")
            return {"service": "", "locations": [], "count": None}

    def upload_to_s3(self, data, filename):
        csv_buffer = io.StringIO()
        if data:
            writer = csv.DictWriter(csv_buffer, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        else:
            return None
        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION"),
        )
        try:
            s3_key = f"{os.getenv('S3_PREFIX').rstrip('/')}/{filename}"
            s3.put_object(
                Bucket=os.getenv("S3_BUCKET_NAME"),
                Key=s3_key,
                Body=csv_buffer.getvalue(),
                ContentType="text/csv",
            )
            return f"https://{os.getenv('S3_BUCKET_NAME')}.s3.amazonaws.com/{s3_key}"
        except (BotoCoreError, NoCredentialsError) as e:
            logger.error(f"S3 upload failed: {str(e)}")
            return None

    async def process_prompt(self, websocket, prompt, websocket_id=None):
        logger.info(f"Processing prompt: {prompt}")
        sector_id = None
        if isinstance(prompt, str):
            try:
                parsed = json.loads(prompt)
                if "sector_id" in parsed:
                    sector_id = parsed["sector_id"]
                    prompt = parsed["prompt"]
            except json.JSONDecodeError:
                pass

        await websocket.send("Scraping in progress...")
        optimized = await self.optimize_prompt(prompt)
        service, location, count = optimized.get("service") or "", optimized.get("locations", []), optimized.get("count")

        if not service.strip():
            await websocket.send("You haven't specified a service. Please re-enter.")
            return

        task_id = task_manager.create_task(service, location if location else [], count, sector_id, websocket_id)
        task = task_manager.get_task(task_id)

        if task.sector_id:
            await task_manager.create_sector_history(task.sector_id, task)

        asyncio.create_task(self.run_scraping_task(task_id))

        response = {"type": "task_created", "task_id": task_id, "message": f"Scraping task created. Processing {service}..."}
        await websocket.send(json.dumps(response))

    async def run_scraping_task(self, task_id: str):
        task = task_manager.get_task(task_id)
        if not task:
            return
        try:
            task_manager.update_task_status(task_id, "running")
            results = []
            if task.locations:
                lat, lon = await sync_to_async(geocode_address)(task.locations)
                query = f"{task.count or ''} {task.service} services in {task.locations} Massachusetts"
                results = await sync_to_async(query_google_maps)(query, task.count, lat, lon)
            else:
                await self.process_all_towns_background(task_id, task.service, task.count, results)

            unique = []
            seen_final = set()
            for r in results:
                key = (r.get("Company Name"), r.get("Company Address"))
                if key not in seen_final:
                    unique.append(r)
                    seen_final.add(key)

            results = unique
            
            task_manager.update_task_status(task_id, "completed", results=results)
            filename = f"{task.service.replace(' ', '_')}_{task.task_id[:8]}.csv"
            link = await sync_to_async(self.upload_to_s3)(results, filename)

            if task.sector_id:
                # ✅ Update DB history with CSV link
                await task_manager.update_sector_history(task, link)

            # ✅ Send download_ready with sector info - let frontend decide
            response = {
                "type": "download_ready",
                "task_id": task_id,
                "message": f"Scraping complete. Found {len(results)} companies.",
                "download_link": link,
                "filename": filename,
                "sector_id": task.sector_id,  # Frontend will use this to show upload option
                "requires_confirmation": task.sector_id is not None,  # Flag for popup
            }
            if task.websocket_id:
                await task_manager.send_to_websocket(task.websocket_id, json.dumps(response))
                
        except Exception as e:
            logger.error(f"Task {task_id} failed: {str(e)}")
            task_manager.update_task_status(task_id, "failed")
            if task.websocket_id:
                await task_manager.send_to_websocket(
                    task.websocket_id, json.dumps({"type": "task_failed", "task_id": task_id, "message": str(e)})
                )

    # ✅ Add new method to handle upload confirmation
    async def handle_upload_confirmation(self, websocket, message):
        """Handle CSV upload confirmation from frontend"""
        task_id = message.get("task_id")
        sector_id = message.get("sector_id")
        csv_url = message.get("csv_url")
        
        if not all([task_id, sector_id, csv_url]):
            await websocket.send(json.dumps({
                "type": "upload_failed",
                "message": "Missing required parameters"
            }))
            return
        
        try:
            def fetch_csv():
                response = requests.get(csv_url, timeout=30)
                response.raise_for_status()
                return response.text
            csv_content = await sync_to_async(fetch_csv)()
            
            sector = await sync_to_async(Sector.objects.get)(id=sector_id)
            
            # Run in thread so Django ORM stays sync-safe
            result = await sync_to_async(process_csv_for_sector)(csv_content, sector, None)
            
            await websocket.send(json.dumps({
                "type": "upload_complete",
                "task_id": task_id,
                "message": f"Successfully uploaded {result.get('records_processed', 0)} records to admin panel.",
                "success": True
            }))
            
            logger.info(f"CSV uploaded to admin for sector {sector_id}")
            
        except Exception as e:
            logger.error(f"CSV upload failed for sector {sector_id}: {str(e)}")
            await websocket.send(json.dumps({
                "type": "upload_failed",
                "task_id": task_id,
                "message": f"Upload failed: {str(e)}",
                "success": False
            }))


    async def process_all_towns_background(self, task_id: str, service: str, count: Optional[int], results: List):
        task = task_manager.get_task(task_id)
        if not task:
            return
        total, processed = len(locations_list), 0
        for town, data in locations_list.items():
            current = task_manager.get_task(task_id)
            if not current or current.status != "running":
                break
            try:
                town_name, lat, lon = data
            except Exception as e:
                logger.error(f"Data error {town}: {e}")
                continue
            if count and len(results) >= count:
                break
            try:
                query = f"{service} services in {town_name} Massachusetts"
                town_results = await sync_to_async(query_google_maps)(query, None if not count else count - len(results), lat, lon)
                if town_results:
                    results.extend(town_results)
                    if count and len(results) > count:
                        results[:] = results[:count]
                        break
            except Exception as e:
                logger.error(f"Scraping failed {town_name}: {e}")
                continue
            processed += 1
            progress = {"processed_towns": processed, "total_towns": total, "found_results": len(results)}
            task_manager.update_task_status(task_id, "running", progress=progress, results=results)
            if task.websocket_id:
                await task_manager.send_to_websocket(
                    task.websocket_id,
                    json.dumps(
                        {
                            "type": "progress_update",
                            "task_id": task_id,
                            "message": f"Processed {processed}/{total} towns. Found {len(results)} companies.",
                            "progress": progress,
                        }
                    ),
                )


handler = WebSocketHandler()


async def handle_socket(websocket, path):
    await handler.handle_socket(websocket, path)


def start_websocket_server():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    logger.info("WebSocket server starting on ws://0.0.0.0:8002")
    # Set ping_interval=20, ping_timeout=60 to keep the LB connections alive
    server = websockets.serve(
        handle_socket, 
        "0.0.0.0", 
        8002, 
        ping_interval=20, 
        ping_timeout=60
    )
    loop.run_until_complete(server)
    loop.run_forever()


if __name__ == "__main__":
    start_websocket_server()
