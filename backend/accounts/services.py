import os
import openai
import httpx
import asyncio
import json
from django.conf import settings
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        self.client = openai.AsyncOpenAI(
            api_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        )
    
    async def match_service_and_get_permits(self, user_message: str, available_sectors: List[str], 
                                          lat: float = None, lng: float = None, 
                                          address: str = None, property_type: str = None) -> Dict[str, Any]:
        """
        Single GPT call to match service to sector AND get permit information
        """
        try:
            sectors_list = "\n".join([f"- {sector}" for sector in available_sectors])
            
            # Base prompt for service matching
            
            prompt = f"""
            User Request: "{user_message}"
            
            Available Service Sectors:
            {sectors_list}
            
            Please analyze the user's request and determine:
            1. Is this a service request? (yes/no)
            2. If yes, which sector from the available list best matches their request?
            3. If no exact match, suggest the closest matching sector or respond "no_match"
            """
            
            # Add permit information request if we have all required data
            if lat is not None and lng is not None and property_type:
                prompt += f"""
            
            Additionally, if this is a valid service request with a matched sector:
            4. Provide all necessary legal documents and permits required for a {property_type.lower()} 
               property owner at {lat}, {lng} ({address}) to start the matched service.
               
            For permits, respond in this format:
            Document Name: Base URL only (like https://www.mass.gov/)
            
            If no permit is required, state "No permit is required"
            Make sure all URLs are valid base URLs only.
            """
            
            prompt += """
            
            Respond in JSON format:
            {
                "is_service_request": true/false,
                "matched_sector": "sector_name_from_list_or_no_match",
                "confidence": "high/medium/low",
                "reasoning": "brief explanation",
                "permit_info": "permit information if requested, otherwise null"
            }
            
            Be strict about matching - only match if there's a clear connection between the request and available sectors.
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a service matching and permit information assistant. 
                        
                        For service matching: Match user requests to available service sectors accurately.
                        
                        For permit information: 
                        - Each permit must be on a separate line with proper newline characters (\\n)
                        - Use this exact format:
                        Building Permit: https://example.gov/
                        Contractor License: https://city.gov/
                        Plumbing Permit: https://state.gov/
                        
                        - NEVER put multiple permits on the same line
                        - NEVER use JSON formatting, curly braces, or quotes around permit information
                        - Each permit entry should be: "Permit Name: URL" and no unnecessary permits should be there
                        - Separate each permit with a newline character
                        
                        Only return valid JSON for the overall response structure, but keep permit_info as clean separated text."""
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=800,  # Increased for permit info
                temperature=0.1  # Low temperature for consistent matching
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
                return {
                    'is_service_request': result.get('is_service_request', False),
                    'matched_sector': result.get('matched_sector', 'no_match'),
                    'confidence': result.get('confidence', 'low'),
                    'reasoning': result.get('reasoning', ''),
                    'permit_info': result.get('permit_info')
                }
            except json.JSONDecodeError:
                logger.error(f"Failed to parse GPT response as JSON: {response_text}")
                return {
                    'is_service_request': False,
                    'matched_sector': 'no_match',
                    'confidence': 'low',
                    'reasoning': 'Failed to parse response',
                    'permit_info': None
                }
                
        except Exception as e:
            logger.error(f"OpenAI service and permit matching error: {str(e)}")
            return {
                'is_service_request': False,
                'matched_sector': 'no_match',
                'confidence': 'low',
                'reasoning': f'API error: {str(e)}',
                'permit_info': None
            }
    
    # Keep the old method for backward compatibility (optional)
    async def match_service_to_sector(self, user_message: str, available_sectors: List[str]) -> Dict[str, Any]:
        """
        Legacy method - now calls the combined method
        """
        result = await self.match_service_and_get_permits(user_message, available_sectors)
        # Remove permit_info from result for backward compatibility
        return {k: v for k, v in result.items() if k != 'permit_info'}
    
    async def get_permit_info(self, prompt: str) -> str:
        """
        Legacy method - kept for backward compatibility but not recommended for new usage
        """
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that provides accurate information about permits and legal documents required for home services. Always verify that links are valid and current. If no permits are required, clearly state 'No permit is required'."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return "Unable to retrieve permit information at this time. Please contact your local authorities for permit requirements."

class LocationService:
    async def get_address_from_coordinates(self, lat: float, lng: float) -> str:
        try:
            # Using a free geocoding service - you might want to use Google Maps API instead
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://nominatim.openstreetmap.org/reverse",
                    params={
                        'lat': lat,
                        'lon': lng,
                        'format': 'json'
                    },
                    headers={'User-Agent': 'YourAppName/1.0'}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get('display_name', f"{lat}, {lng}")
                else:
                    return f"{lat}, {lng}"
                    
        except Exception as e:
            logger.error(f"Geocoding error: {str(e)}")
            return f"{lat}, {lng}"