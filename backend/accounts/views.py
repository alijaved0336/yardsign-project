from collections import defaultdict
import requests
import random
import stripe
import os
import io
import csv
import psycopg2
import environ
import traceback
import xml.etree.ElementTree as ET
from .logs import logger
from django.core.paginator import Paginator
from datetime import datetime
from math import ceil
from django.contrib.auth.hashers import check_password
from rest_framework.exceptions import NotFound
from rest_framework.authentication import TokenAuthentication
from django.views.decorators.http import require_http_methods
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ExpiringToken as Token
from .models import ExpiringToken
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render
from geopy.distance import geodesic
from .models import *
from .serializers import *
from django.conf import settings
from django.utils.crypto import get_random_string
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.sites.shortcuts import get_current_site
from .tokens import account_activation_token
from django.contrib.gis.geos import Point
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from accounts.utils import get_required_documents
from datetime import timedelta
from dateutil.relativedelta import relativedelta
from django.core.exceptions import ObjectDoesNotExist
from postmarker.core import PostmarkClient
from stripe.error import SignatureVerificationError
from stripe import Webhook,Event
from django.http import JsonResponse
from django.utils.text import slugify
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from dotenv import load_dotenv
from django.db.models import Q, Case, When, IntegerField
from django.db import transaction
from .utils import geocode_address
import json
from .models import ChatSession, ChatMessage, User
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.template.loader import render_to_string
from datetime import datetime
import base64
from .utils import generate_providers_permits_pdf
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

env = environ.Env()
environ.Env.read_env()

load_dotenv()


stripe.api_key = settings.STRIPE_API_KEY
logger.info(f"Stripe API Key: {stripe.api_key}")
EMAIL_HOST_USER = 'contact@yardsignproshop.com'

postmark = PostmarkClient(server_token=settings.EMAIL_SERVER_TOKEN)

@csrf_exempt
@require_http_methods(["GET"])
def check_active_tasks(request):
    """Check if there are any active scraping tasks for the current user"""
    try:
        # Check for tasks created in the last 2 hours that might still be running
        cutoff_time = datetime.now() - timedelta(hours=2)
        
        # You'll need to modify your SectorHistory model to include a user field
        # or use a different way to track which tasks belong to which user
        active_tasks = SectorHistory.objects.filter(
            status__in=['pending', 'running'],
            created_at__gte=cutoff_time
        ).order_by('-created_at')
        
        if active_tasks.exists():
            latest_task = active_tasks.first()
            return JsonResponse({
                'success': True,
                'has_active_task': True,
                'task': {
                    'task_id': latest_task.task_id,
                    'service': latest_task.service,
                    'status': latest_task.status,
                    'created_at': latest_task.created_at.isoformat(),
                    'sector_name': latest_task.sector.sector_name if latest_task.sector else None
                }
            })
        else:
            return JsonResponse({
                'success': True,
                'has_active_task': False
            })
            
    except Exception as e:
        logger.error(f"Error checking active tasks: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Error checking active tasks: {str(e)}'
        }, status=500)


# Sector API Views
@require_http_methods(["GET"])
def get_sectors(request):
    """API endpoint to get all sectors"""
    try:
        sectors = Sector.objects.select_related('category').all().order_by('sector_name')
        sector_data = []
        for sector in sectors:
            sector_data.append({
                'id': sector.id,
                'sector_name': sector.sector_name,
                'category': sector.category.category_name if sector.category else 'No Category',
                'logo': sector.logo.url if sector.logo else None
            })
        return JsonResponse({
            'success': True,
            'sectors': sector_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error fetching sectors: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def get_task_status(request):
    """Get status of a background scraping task"""
    try:
        data = json.loads(request.body)
        task_id = data.get('task_id')
        
        if not task_id:
            return JsonResponse({
                'success': False,
                'message': 'Task ID is required'
            }, status=400)
        
        # Check database first
        try:
            task_history = SectorHistory.objects.get(task_id=task_id)
            return JsonResponse({
                'success': True,
                'task_id': task_id,
                'status': task_history.status,
                'progress': {
                    'processed_towns': 0,  # You might want to add these fields to your model
                    'total_towns': 100,
                    'found_results': task_history.results_count
                },
                'service': task_history.service,
                'created_at': task_history.created_at.isoformat(),
                'completed_at': task_history.completed_at.isoformat() if task_history.completed_at else None
            })
        except SectorHistory.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Task not found'
            }, status=404)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error getting task status: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def get_sector_history(request):
    """Get scraping history for a sector"""
    try:
        data = json.loads(request.body)
        sector_id = data.get('sector_id')

        if not sector_id:
            return JsonResponse({
                'success': False,
                'message': 'Sector ID is required'
            }, status=400)

        try:
            sector = Sector.objects.get(id=sector_id)
        except Sector.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Sector not found'
            }, status=400)

        history_qs = SectorHistory.objects.filter(sector=sector).order_by("-created_at")
        history = []
        for h in history_qs:
            history.append({
                "history_id": str(h.history_id),
                "task_id": h.task_id,
                "service": h.service,
                "locations": h.locations,
                "count": h.count,
                "results_count": h.results_count,
                "status": h.status,
                "created_at": h.created_at.isoformat(),
                "completed_at": h.completed_at.isoformat() if h.completed_at else None,
                "csv_url": h.csv_url,
            })

        return JsonResponse({
            'success': True,
            'sector_id': sector_id,
            'sector_name': sector.sector_name,
            'history': history
        })

    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Error getting sector history: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Error getting sector history: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def upload_csv_to_admin(request):
    """API endpoint to upload CSV data to admin panel"""
    logger.info(f"Upload_csv_to_admin func called")
    try:
        data = json.loads(request.body)
        csv_url = data.get('csv_url')
        sector_id = data.get('sector_id')
        
        if not csv_url or not sector_id:
            return JsonResponse({
                'success': False,
                'message': 'CSV URL and sector ID are required'
            }, status=400)
        
        # Get the sector
        try:
            sector = Sector.objects.get(id=sector_id)
        except Sector.DoesNotExist:
            return JsonResponse({
                'success': False,
                'message': 'Sector not found'
            }, status=400)
        
        # Download the CSV file
        try:
            response = requests.get(csv_url, timeout=30)
            response.raise_for_status()
            csv_content = response.text
        except requests.RequestException as e:
            return JsonResponse({
                'success': False,
                'message': f'Failed to download CSV: {str(e)}'
            }, status=400)
        
        # Process the CSV using the existing upload_csv logic
        result = process_csv_for_sector(csv_content, sector, request)
        
        return result
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        traceback_text = traceback.format_exc()
        print(f"Error uploading CSV to admin: {str(e)}")
        print(traceback_text)
        return JsonResponse({
            'success': False,
            'message': f'Error processing CSV: {str(e)}'
        }, status=500)

def process_csv_for_sector(csv_content, sector, request=None):
    """Process CSV content for a specific sector using the existing upload_csv logic"""
    logger.info(f"process_csv_for_sector function called")
    try:
        from accounts.admin import UnifiedCompanyDataAdmin
        from django.http import HttpRequest
        from django.contrib.messages.storage.fallback import FallbackStorage
        from io import StringIO

        admin_instance = UnifiedCompanyDataAdmin(CompanyData, HttpRequest)

        # Prepare CSV file
        csv_file = StringIO(csv_content)
        csv_file.name = f"{sector.sector_name.replace(' ', '_')}.csv"
        csv_file.size = len(csv_content.encode('utf-8'))

        # Create mock POST request
        mock_request = HttpRequest()
        mock_request.method = 'POST'

        # ✅ Handle request=None (auto-upload mode)
        if request and hasattr(request, "user"):
            mock_request.user = request.user
        else:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                # fallback: pick first superuser as "system" user
                mock_request.user = User.objects.filter(is_superuser=True).first()
            except Exception:
                mock_request.user = None

        mock_request.POST = {
            'sector': str(sector.id),
            'upload_type': 'user_info'
        }

        setattr(mock_request, 'session', {})
        setattr(mock_request, '_messages', FallbackStorage(mock_request))

        # Mock file object
        class MockFile:
            def __init__(self, content, name):
                self.content = content
                self.name = name
                self.size = len(content.encode('utf-8'))

            def read(self):
                return self.content.encode('utf-8')

            def seek(self, pos):
                pass

        mock_request.FILES = {
            'csv_file': MockFile(csv_content, csv_file.name)
        }

        logger.info(f"Calling upload csv function")
        result = admin_instance.upload_csv(mock_request)
        return result

    except Exception as e:
        traceback_text = traceback.format_exc()
        logger.error(f"Error processing CSV for sector: {str(e)}\n{traceback_text}")
        return JsonResponse({
            'success': False,
            'message': f'Error processing CSV: {str(e)}'
        }, status=500)


# Updated chat interface view
def chat_interface(request):
    """Main chat interface view"""
    return render(request, 'chat_interface.html')


def normalize_website_url(website_url):
    if not website_url:
        return None
    website_url = website_url.lower().strip()

    if website_url.startswith('http://'):
        website_url = website_url[7:]
    elif website_url.startswith('https://'):
        website_url = website_url[8:]

    if website_url.endswith('/'):
        website_url = website_url[:-1]

    if not website_url.startswith('www.'):
        website_url = 'www.' + website_url
    
    return website_url

def delete_existing_company_data(company_website):
    normalized_website = normalize_website_url(company_website)
    if not normalized_website:
        return
    
    try:
        with transaction.atomic():
            existing_user_infos = UserInfo.objects.filter(
                company_website__isnull=False
            )
            
            users_to_delete = []
            for user_info in existing_user_infos:
                if normalize_website_url(user_info.company_website) == normalized_website:
                    users_to_delete.append(user_info.user)
            
            for user in users_to_delete:
                logger.info(f"Deleting existing data for user {user.email} with website {company_website}")
                
                Pricing.objects.filter(user=user).delete()
                UnlimitedPricing.objects.filter(user=user).delete()
                SubscriptionModel.objects.filter(user=user).delete()
                FreeplanModel.objects.filter(user=user).delete()
                UploadedFile.objects.filter(user=user).delete()
                UploadedMultipleFile.objects.filter(user=user).delete()
                UserInfo.objects.filter(user=user).delete()
                Token.objects.filter(user=user).delete()
                OTP.objects.filter(email=user.email).delete()
                user.delete()
                
                logger.info(f"Successfully deleted all data for user {user.email}")
                
    except Exception as e:
        logger.error(f"Error deleting existing company data: {str(e)}")
        raise

@api_view(['GET'])
def get_chat_history(request, session_id):
    """Get chat history for a specific session"""
    try:
        session = ServiceChatSession.objects.get(session_id=session_id)
        messages = ServiceChatMessage.objects.filter(session=session).order_by('timestamp')
        
        message_data = []
        for message in messages:
            message_data.append({
                'role': message.role,
                'content': message.content,
                'timestamp': message.timestamp.isoformat(),
                'metadata': message.metadata
            })
        
        return Response({
            'session_id': session.session_id,
            'title': session.title,
            'messages': message_data,
            'service_type': session.service_type,
            'location': {
                'lat': float(session.user_latitude) if session.user_latitude else None,
                'lng': float(session.user_longitude) if session.user_longitude else None,
            }
        })
        
    except ServiceChatSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def get_user_sessions(request):
    """Get all sessions (for admin interface)"""
    try:
        sessions = ServiceChatSession.objects.all().order_by('-updated_at')[:20]
        
        session_data = []
        for session in sessions:
            last_message = ServiceChatMessage.objects.filter(
                session=session
            ).order_by('-timestamp').first()
            
            session_data.append({
                'session_id': session.session_id,
                'title': session.title,
                'service_type': session.service_type,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'last_message': last_message.content[:100] if last_message else None,
                'message_count': ServiceChatMessage.objects.filter(session=session).count()
            })
        
        return Response({
            'sessions': session_data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


last_request_time = None
RATE_LIMIT_DELAY = 1  # 1 second delay between requests

class NearbyServiceProvidersView(APIView):
    """
    API endpoint to find nearest service providers based on user address and sector/category names
    """
    permission_classes = [AllowAny]
    

    def post(self, request):
        try:
            # Extract data
            address = request.data.get('survey_address')
            sector_names = request.data.get('services', [])  # List of sector names
            category_names = request.data.get('categories', [])  # List of category names
            property_type = "Residential"
            user_email = request.data.get('email')

            print("Sector_names from frontend: ", sector_names)
            print("Category_names from frontend: ", category_names)
            # Additional user information
            full_name = request.data.get('full_name', 'User')
            phone_number = request.data.get('phone_number', 'N/A')
            street_address = request.data.get('survey_address', 'N/A')
            city = request.data.get('survey_city', 'N/A')
            zip_code = request.data.get('survey_zip', 'N/A')

            # Process categories to extract sector names
            if category_names:
                from .models import Category, Sector
                
                # Step 1: Get category IDs from category names
                category_ids = Category.objects.filter(
                    category_name__in=category_names
                ).values_list('id', flat=True)
                
                print(f"Found category IDs: {list(category_ids)} for category names: {category_names}")
                
                # Step 2: Get all sectors that belong to these categories
                category_sectors = Sector.objects.filter(
                    category_id__in=category_ids
                ).values_list('sector_name', flat=True)
                
                print(f"Found sector names from categories: {list(category_sectors)}")
                
                # Add category sectors to services list
                sector_names.extend(list(category_sectors))
            
            # Remove duplicates from services list while preserving order
            sector_names = list(dict.fromkeys(sector_names))
            
            print("Final sector names list (with category sectors):", sector_names)

            # Validate required fields
            if not address or not sector_names:
                return Response({
                    'error': 'Address and services are required',
                    'status': 'failed'
                }, status=status.HTTP_400_BAD_REQUEST)

            if not user_email:
                return Response({
                    'error': 'User email is required',
                    'status': 'failed'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Geocode the address
            lat, lng = geocode_address(address)
            if lat is None or lng is None:
                return Response({
                    'error': 'Failed to geocode the provided address',
                    'status': 'failed'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Data containers
            providers_data = []              # For email
            providers_data_frontend = []     # For frontend response
            permits_data = {}
            project_types = []
            services_without_providers = []  # Track services with no providers

            # Find providers for each service
            for sector_name in sector_names:
                print("Sector name before sending into the function:", sector_name)
                nearby_providers = self.find_nearby_providers(
                    lat, lng, sector_name, max_distance_miles=300
                )

                # Check if no providers found for this service
                if not nearby_providers:
                    print(f"No providers found for sector: {sector_name}")
                    services_without_providers.append(sector_name)
                    # Still add permits data even if no providers found
                    permits_data[sector_name] = get_required_documents(property_type, sector_name)
                    continue

                # Limit to 3 nearest providers
                for provider_data in nearby_providers[:3]:
                    provider = provider_data['provider']
                    distance = provider_data['distance']

                    # Get additional info from UserInfo table if exists
                    company_website = None
                    company_phone = None
                    company_email = None

                    if provider.user:
                        try:
                            from .models import UserInfo
                            user_info = UserInfo.objects.get(user=provider.user)
                            company_website = user_info.company_website
                            company_phone = user_info.company_phone
                            company_email = user_info.company_email
                        except UserInfo.DoesNotExist:
                            logger.warning(f"UserInfo not found for user {provider.user.id}")
                        except Exception as e:
                            logger.error(f"Error fetching UserInfo: {str(e)}")

                    # ---------- EMAIL DATA ----------
                    providers_data.append({
                        'id': provider.id,
                        'company_name': provider.company_name,
                        'sector_name': provider.sector_name,
                        'company_website': company_website,
                        'company_phone': company_phone,
                        'company_email': company_email,
                        'address': provider.address,
                        'distance_km': distance,
                    })

                    # ---------- FRONTEND DATA ----------
                    providers_data_frontend.append({
                        'id': provider.id,
                        'user_email': provider.user.email if provider.user else None,
                        'user_id': provider.user.id if provider.user else None,
                        'company_name': provider.company_name,
                        'company_website': company_website,
                        'sector': provider.sector,
                        'sector_name': provider.sector_name,
                        'sector_id': provider.sector_id,
                        'category_name': provider.category_name,
                        'category_id': provider.category_id,
                        'latitude': provider.latitude,
                        'longitude': provider.longitude,
                        'distance_km': distance,
                        'address': provider.address,
                        'city': provider.city,
                        'state': provider.state,
                        'zipcode': provider.zipcode,
                        'is_active': provider.is_active,
                        'expiry_date': provider.expiry_date.isoformat() if provider.expiry_date else None,
                    })

                # Collect project types
                if provider_data.get('provider'):
                    service_name = provider_data['provider'].sector_name
                    if service_name and service_name not in project_types:
                        project_types.append(service_name)

                # Get required permits/documents
                # permits_data[sector_name] = get_required_documents(property_type, sector_name)
                permits_data[sector_name] = "No data"

            # Format project types as comma-separated string
            project_type_str = ', '.join(project_types) if project_types else ', '.join(sector_names)

            # Log for debugging
            logger.info(f"Permits data structure: {permits_data}")

            # Check if NO providers found at all
            if not providers_data:
                logger.warning(f"No service providers found for any requested services: {sector_names}")
                return Response({
                    'status': 'no_providers',
                    'message': 'No service providers found',
                    'alert': {
                        'type': 'warning',
                        'title': 'No Service Providers Found',
                        'message': f'Unfortunately, we could not find any service providers for the requested services within 300 miles of your location. Please try expanding your search area or contact us for assistance.'
                    },
                    'user_location': {
                        'address': address,
                        'latitude': lat,
                        'longitude': lng
                    },
                    'property_type': property_type,
                    'services_requested': sector_names,
                    'permits_and_documents': permits_data
                }, status=status.HTTP_200_OK)

            # Prepare email context for user
            email_context = {
                'user_name': full_name,
                'user_location': {'address': address},
                'project_type': project_type_str,
                'total_providers_found': len(providers_data),
                'providers': providers_data,
            }

            # Render and send user email
            subject = "Your Service Providers - Geodaka"
            message = render_to_string('accounts/providers_email.html', email_context)

            email_sent = False
            email_error_message = None
            try:
                logger.info(f"Sending providers email to: {user_email}")
                response = postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=user_email,
                    Subject=subject,
                    HtmlBody=message
                )

                logger.info(f"Postmark API Response: {response}")

                email_sent = True
                logger.info(f"Email sent successfully to {user_email}")
            except Exception as email_error:
                logger.error(f"Failed to send email: {str(email_error)}")
                email_error_message = str(email_error)

            # Prepare admin notification
            admin_email_context = {
                'submission_date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'contact_info': {
                    'full_name': full_name,
                    'phone_number': phone_number,
                    'email': user_email
                },
                'location_info': {
                    'street_address': street_address,
                    'city': city,
                    'zip_code': zip_code,
                    'mailing_address': address,
                    'property_type': property_type
                },
                'services_requested': sector_names,
                'services_count': len(sector_names),
                'total_providers_found': len(providers_data),
                'providers': providers_data,
                'search_location': {
                    'latitude': lat,
                    'longitude': lng
                },
                'email_status': '✅ Success' if email_sent else '❌ Failed'
            }

            # Send admin notification
            try:
                admin_subject = f"New Form Submission - {full_name} - Geodaka"
                admin_message = render_to_string('accounts/admin_notification_email.html', admin_email_context)
                postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To='info@realmapinfo.com',
                    Subject=admin_subject,
                    HtmlBody=admin_message
                )
                logger.info("Admin notification sent successfully")
            except Exception as admin_email_error:
                logger.error(f"Failed to send admin notification: {str(admin_email_error)}")

            # ---------- FINAL FRONTEND RESPONSE ----------
            response_data = {
                'status': 'success',
                'email_sent': email_sent,
                'email_message': 'Email sent successfully' if email_sent else f'Email failed: {email_error_message}',
                'user_location': {
                    'address': address,
                    'latitude': lat,
                    'longitude': lng
                },
                'property_type': property_type,
                'total_providers_found': len(providers_data_frontend),
                'providers': providers_data_frontend,
                'permits_and_documents': permits_data
            }

            # Add alert if some services have no providers (but others do)
            if services_without_providers:
                response_data['alert'] = {
                    'type': 'info',
                    'title': 'Limited Service Providers',
                    'message': f'No service providers found for: {", ".join(services_without_providers)}. Results shown for other requested services.'
                }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return Response({
                'error': f'An unexpected error occurred: {str(e)}',
                'status': 'failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   

    def find_nearby_providers(self, user_lat, user_lng, sector_name, max_distance_miles=300, limit=5):
        """Find providers by sector_name:
        - Prefer one (nearest) yard sign per company
        - If not enough unique companies, fill remaining slots with next-nearest yard signs
        """
        user_coords = (float(user_lat), float(user_lng))
        print("User coordinates:", user_coords)
        print("Sector name is:", sector_name)

        providers_qs = UploadedMultipleFile.objects.filter(
            sector_name=sector_name,
            latitude__isnull=False,
            longitude__isnull=False
        ).exclude(latitude='', longitude='')

        print(f"Total providers found for sector_name={sector_name}:", providers_qs.count())

        # Group providers by company_key -> list of dicts {'provider':..., 'distance':...}
        groups = defaultdict(list)

        for provider in providers_qs:
            try:
                prov_lat = float(provider.latitude)
                prov_lng = float(provider.longitude)
                prov_coords = (prov_lat, prov_lng)
                dist = geodesic(user_coords, prov_coords).miles
            except (ValueError, TypeError):
                continue

            if dist > max_distance_miles:
                continue

            # Choose a key to identify company: use company_id if you have it, else normalized company_name
            company_key = None
            if hasattr(provider, 'company_id') and provider.company_id:
                company_key = f"id_{provider.company_id}"
            else:
                # fallback to company_name; normalize to avoid stray whitespace/casing issues
                company_name = (provider.company_name or "").strip().lower()
                company_key = f"name_{company_name}"

            groups[company_key].append({
                'provider': provider,
                'distance': round(dist, 2)
            })

        if not groups:
            print("No providers within distance.")
            return []

        # Sort each group's providers by distance (nearest first)
        for k in groups:
            groups[k].sort(key=lambda x: x['distance'])

        # Create a list of (company_key, nearest_distance, providers_list) and sort by nearest_distance
        companies_sorted = []
        for k, provs in groups.items():
            companies_sorted.append((k, provs[0]['distance'], provs))
        companies_sorted.sort(key=lambda x: x[1])

        picked = []
        picked_set = set()  # track picked provider ids (or object refs) so we don't duplicate

        # First pass: pick nearest yard sign for each company (in order of company nearest distance)
        for company_key, _, provs in companies_sorted:
            first = provs[0]
            prov_obj = first['provider']
            prov_id = getattr(prov_obj, 'id', id(prov_obj))  # use model id if available
            picked.append(first)
            picked_set.add(prov_id)
            if len(picked) >= limit:
                break

        # If we still need more results, create a pool of remaining yard signs (all companies) excluding already picked
        if len(picked) < limit:
            remaining = []
            for k, provs in groups.items():
                for entry in provs:
                    prov_obj = entry['provider']
                    prov_id = getattr(prov_obj, 'id', id(prov_obj))
                    if prov_id in picked_set:
                        continue
                    remaining.append(entry)

            # Sort remaining by distance and append until limit
            remaining.sort(key=lambda x: x['distance'])
            for entry in remaining:
                if len(picked) >= limit:
                    break
                prov_obj = entry['provider']
                prov_id = getattr(prov_obj, 'id', id(prov_obj))
                picked.append(entry)
                picked_set.add(prov_id)

        # Final sort (optional): if you want final results ordered strictly by distance
        picked.sort(key=lambda x: x['distance'])

        print(f"Returning {len(picked)} providers (limit={limit}). Unique companies first, then extras if needed.")
        return picked


class UserInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            user_info = UserInfo.objects.get(user=request.user)
        except UserInfo.DoesNotExist:
            return Response({'error': 'User info not found'}, status=status.HTTP_404_NOT_FOUND)

        user_plan = request.user
        uploaded_files = UploadedFile.objects.filter(user=request.user)

        if uploaded_files.exists():
            sector_id = int(uploaded_files.first().sector)
            sector = Sector.objects.filter(id=sector_id).values().first()
            if sector:
                category = Category.objects.filter(id=sector['category_id']).first()
                response_data = {
                    "user_info": UserInfoSerializer(user_info).data,
                    "profile": {
                        "sector_name": sector.get('sector_name'),
                        "logo": sector.get('logo'),
                        "sector_id": sector.get('id'),
                        "category_name": category.category_name if category else None
                    },
                    "plan": {
                        "plan_name": user_plan.plan_name,
                        "feature_count": user_plan.feature_count,
                        "expiry_date": user_plan.expiry_date,
                    },
                    "user_type": {
                        "is_admin": user_plan.is_admin
                    }
                }
            else:
                response_data = {
                    "user_info": UserInfoSerializer(user_info).data,
                    "plan": {
                        "plan_name": user_plan.plan_name,
                        "feature_count": user_plan.feature_count,
                        "expiry_date": user_plan.expiry_date,
                    },
                    "user_type": {
                        "is_admin": user_plan.is_admin
                    }
                }

        else:
            response_data = {
                "user_info": UserInfoSerializer(user_info).data,
                "plan": {
                    "plan_name": user_plan.plan_name,
                    "feature_count": user_plan.feature_count,
                    "expiry_date": user_plan.expiry_date,
                },
                "user_type": {
                    "is_admin": user_plan.is_admin
                }
            }

        return Response(response_data, status=status.HTTP_200_OK)

    def post(self, request):
        email = request.data.get('email')
        company_website = request.data.get('company_website')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

        if company_website:
            try:
                delete_existing_company_data(company_website)
                logger.info(f"Deleted existing company data for website: {company_website}")
            except Exception as e:
                logger.error(f"Error during company data deletion: {str(e)}")
                return Response({'error': 'Error processing existing company data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_info, created = UserInfo.objects.get_or_create(user=user)
        fields = ['company_phone', 'company_name', 'company_website', 'company_email', 'company_address', 'image', 'contact_name', 'sector', 'category_id']
        
        for field in fields:
            if field in request.data:
                if field == 'company_website':
                    setattr(user_info, field, normalize_website_url(request.data[field]))
                else:
                    setattr(user_info, field, request.data[field])

        user_info.save()
        if user_info.company_name and user_info.company_address:
            try:
                current_sector = None
                current_category = None
                
                if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                    try:
                        sector_id = int(user_info.sector.strip())
                        current_sector = Sector.objects.get(id=sector_id)
                        if current_sector.category:
                            current_category = current_sector.category
                    except (ValueError, Sector.DoesNotExist):
                        logger.warning(f"Invalid sector ID: {user_info.sector}")

                from .utils import geocode_address
                latitude, longitude = geocode_address(user_info.company_address) if user_info.company_address else (None, None)
                geom = Point(longitude, latitude) if latitude and longitude else None

                uploaded_multiple_file, multiple_created = UploadedMultipleFile.objects.update_or_create(
                    user=user,
                    defaults={
                        'company_name': user_info.company_name,
                        'address': user_info.company_address,
                        'sector_id': current_sector.id if current_sector else None,
                        'sector': str(current_sector.id) if current_sector else None,
                        'sector_name': current_sector.sector_name if current_sector else None,
                        'category_id': current_category.id if current_category else None,
                        'category_name': current_category.category_name if current_category else "",
                        'latitude': str(latitude) if latitude else None,
                        'longitude': str(longitude) if longitude else None,
                        'is_active': False,
                        'expiry_date': user.expiry_date,
                        'geom': geom
                    }
                )

                uploaded_file, file_created = UploadedFile.objects.update_or_create(
                    user=user,
                    defaults={
                        'sector': str(current_sector.id) if current_sector else None,
                        'category_id': current_category.id if current_category else None,
                        'latitude': str(latitude) if latitude else None,
                        'longitude': str(longitude) if longitude else None,
                        'address': user_info.company_address,
                        'geom': geom
                    }
                )

                logger.info(f"Created/updated company record for {user_info.company_name} - Multiple: {multiple_created}, File: {file_created}")

            except Exception as e:
                logger.error(f"Error creating company records: {str(e)}")
                pass

        serializer = UserInfoSerializer(user_info)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailsView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user = request.data.get('id')
        if not user:
            return Response({'error': 'Id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserInfo.objects.get(user=user)
            return Response(UserInfoSerializer(user).data, status=status.HTTP_200_OK)
        except UserInfo.DoesNotExist:
            return Response({'error': 'User with this email does not exist'}, status=status.HTTP_404_NOT_FOUND)

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        email_check = User.objects.filter(email=request.data['email'])

        company_website = request.data.get('company_website')
        if company_website:
            try:
                delete_existing_company_data(company_website)
                logger.info(f"Deleted existing company data for website: {company_website} during signup")
            except Exception as e:
                logger.error(f"Error during company data deletion in signup: {str(e)}")
                return Response({'error': 'Error processing existing company data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
           
        if not email_check.exists():
            if serializer.is_valid():
                user = serializer.save()
                user.is_active = True
                user.save()

                if any(field in request.data for field in ['company_name', 'company_website', 'company_address', 'contact_name', 'sector']):
                    user_info = UserInfo.objects.create(
                        user=user,
                        company_name=request.data.get('company_name', ''),
                        company_website=normalize_website_url(request.data.get('company_website', '')),
                        company_address=request.data.get('company_address', ''),
                        company_email=request.data.get('company_email', ''),
                        company_phone=request.data.get('company_phone', ''),
                        contact_name=request.data.get('contact_name', ''),
                        sector=request.data.get('sector', ''),
                        category_id=request.data.get('category_id')
                    )

                    if user_info.company_name and user_info.company_address:
                        self._create_company_records(user, user_info)

                email = request.data.get('email')
                password = request.data.get('password')

                user = authenticate(request, email=email, password=password)
                if user:
                    Token.objects.filter(user=user).delete()
                    token, _ = Token.objects.get_or_create(user=user)

                    return Response({
                        'status': True,
                        'token': token.key,
                        'user': serializer.data
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({'error': 'Authentication failed after signup'}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'status': False, 'error': 'User exists. Please try with another account.'}, status=status.HTTP_400_BAD_REQUEST)

    def _create_company_records(self, user, user_info):
        try:
            current_sector = None
            current_category = None
            
            if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                try:
                    sector_id = int(user_info.sector.strip())
                    current_sector = Sector.objects.get(id=sector_id)
                    if current_sector.category:
                        current_category = current_sector.category
                except (ValueError, Sector.DoesNotExist):
                    logger.warning(f"Invalid sector ID: {user_info.sector}")

            latitude, longitude = geocode_address(user_info.company_address) if user_info.company_address else (None, None)
            geom = Point(longitude, latitude) if latitude and longitude else None

            UploadedMultipleFile.objects.create(
                user=user,
                company_name=user_info.company_name,
                address=user_info.company_address,
                sector_id=current_sector.id if current_sector else None,
                sector=str(current_sector.id) if current_sector else None,
                sector_name=current_sector.sector_name if current_sector else None,
                category_id=current_category.id if current_category else None,
                category_name=current_category.category_name if current_category else "",
                latitude=str(latitude) if latitude else None,
                longitude=str(longitude) if longitude else None,
                is_active=False,
                expiry_date=user.expiry_date,
                geom=geom
            )

            UploadedFile.objects.create(
                user=user,
                sector=str(current_sector.id) if current_sector else None,
                category_id=current_category.id if current_category else None,
                latitude=str(latitude) if latitude else None,
                longitude=str(longitude) if longitude else None,
                address=user_info.company_address,
                geom=geom
            )

            logger.info(f"Created company records for {user_info.company_name}")

        except Exception as e:
            logger.error(f"Error creating company records during signup: {str(e)}")

class SignUpViewGoogle(APIView):
    permission_classes = [AllowAny]

    def login(self, user):
        """Handle user login and token generation."""
        if user.is_active:
            Token.objects.filter(user=user).delete()
            token, _ = Token.objects.get_or_create(user=user)
            return token

    def post(self, request):
        access_token = request.data.get('accessToken')
        is_login = request.data.get('is_login')
        company_website = request.data.get('company_website')

        if company_website:
            try:
                delete_existing_company_data(company_website)
                logger.info(f"Deleted existing company data for website: {company_website} during Google signup")
            except Exception as e:
                logger.error(f"Error during company data deletion in Google signup: {str(e)}")
                return Response({'error': 'Error processing existing company data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        url = f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}"
        response = requests.get(url)

        if response.status_code != 200:
            return Response({'status': False, 'message': 'Failed to retrieve user info from Google'}, status=status.HTTP_400_BAD_REQUEST)

        google_user_info = response.json()
        email = google_user_info.get('email')
        name = google_user_info.get('name')

        if not email:
            return Response({'status': False, 'message': 'No email found in Google user info'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()

        if user:
            user_info = UserInfo.objects.get_or_create(user = User.objects.get(email = email))[0]
            user_serializer = UserInfoSerializer(user_info)
            serialized_data = user_serializer.data
            serialized_data.pop('category_id')
            serialized_data.pop('state')
            serialized_data.pop('city')
            serialized_data.pop('zipcode')
            serialized_data.pop('image')

            if any(value is None for value in serialized_data.values()):
                token = self.login(user)
                return Response({'status': False, 'token':token.key, 'message': 'please fill the sign up information'})

            # Existing user found
            if user.is_google and is_login == False:
                print("Success")
                return Response({'status': False, 'message': 'Account with this email exists, try another login option.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = self.login(user)
            return Response({
                'status': True,
                'token': token.key,
                'message': 'Logged in successfully via Google',
            }, status=status.HTTP_200_OK)

        else:
            user_data = {
                'email': email,
                'is_active': True,
                'is_google': True,
            }

            serializer = UserSerializerGoogle(data=user_data)
            if serializer.is_valid():
                user = serializer.save()

                if any(field in request.data for field in ['company_name', 'company_website', 'company_address', 'contact_name', 'sector']):
                    user_info = UserInfo.objects.create(
                        user=user,
                        company_name=request.data.get('company_name', ''),
                        company_website=normalize_website_url(request.data.get('company_website', '')),
                        company_address=request.data.get('company_address', ''),
                        company_email=request.data.get('company_email', ''),
                        company_phone=request.data.get('company_phone', ''),
                        contact_name=request.data.get('contact_name', ''),
                        sector=request.data.get('sector', ''),
                        category_id=request.data.get('category_id')
                    )

                    if user_info.company_name and user_info.company_address:
                        self._create_company_records(user, user_info)

                admin_subject = "New User Account Created via Google"
                admin_message = f'A new user account has been created with email: {email}'
                postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=EMAIL_HOST_USER,
                    Subject=admin_subject,
                    HtmlBody=admin_message
                )

                token = self.login(user)

                return Response({
                    'status': True,
                    'token': token.key,
                    'email': serializer.data['email'],
                    'message': 'please fill the sign up information'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _create_company_records(self, user, user_info):
        """Helper method to create company records for admin views"""
        try:
            current_sector = None
            current_category = None
            
            if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                try:
                    sector_id = int(user_info.sector.strip())
                    current_sector = Sector.objects.get(id=sector_id)
                    if current_sector.category:
                        current_category = current_sector.category
                except (ValueError, Sector.DoesNotExist):
                    logger.warning(f"Invalid sector ID: {user_info.sector}")

            latitude, longitude = geocode_address(user_info.company_address) if user_info.company_address else (None, None)
            geom = Point(longitude, latitude) if latitude and longitude else None

            UploadedMultipleFile.objects.create(
                user=user,
                company_name=user_info.company_name,
                address=user_info.company_address,
                sector_id=current_sector.id if current_sector else None,
                sector=str(current_sector.id) if current_sector else None,
                sector_name=current_sector.sector_name if current_sector else None,
                category_id=current_category.id if current_category else None,
                category_name=current_category.category_name if current_category else "",
                latitude=str(latitude) if latitude else None,
                longitude=str(longitude) if longitude else None,
                is_active=False,
                expiry_date=user.expiry_date,
                geom=geom
            )

            UploadedFile.objects.create(
                user=user,
                sector=str(current_sector.id) if current_sector else None,
                category_id=current_category.id if current_category else None,
                latitude=str(latitude) if latitude else None,
                longitude=str(longitude) if longitude else None,
                address=user_info.company_address,
                geom=geom
            )

            logger.info(f"Created company records for {user_info.company_name}")

        except Exception as e:
            logger.error(f"Error creating company records during Google signup: {str(e)}")
            
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user_email = User.objects.filter(email=email).first()
        if not user_email:
            return Response({"error": "User Doesn't Exist"}, status=status.HTTP_404_NOT_FOUND)

        if user_email.is_google:
            return Response({'error': 'Account with this email exists, try another login option.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, email=email, password=password)
        if user:
            user_info = UserInfo.objects.get_or_create(user = User.objects.get(email = request.data['email']))[0]
            user_serializer = UserInfoSerializer(user_info)
            serialized_data = user_serializer.data
            serialized_data.pop('category_id')
            serialized_data.pop('state')
            serialized_data.pop('city')
            serialized_data.pop('zipcode')
            serialized_data.pop('image')

            Token.objects.filter(user=user).delete()

            token, _ = ExpiringToken.objects.get_or_create(user=user)
            if token.is_expired:
                token.delete()
                token = ExpiringToken.objects.create(user=user)


            if any(value is None for value in serialized_data.values()):

                return Response({'status': False, 'token': token.key, 'message': 'please fill the sign up information'})

            return Response({'status': True, 'token': token.key})
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        logout(request)
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)

class FileUploadAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = FileUploadSerializer

    def get(self, request):
        uploaded_data = UploadedFile.objects.filter(user=request.user)
        if uploaded_data.exists():
            serializer = FileUploadSerializer(uploaded_data, many=True)
            return Response(serializer.data)
        else:
            raise NotFound("No uploaded files found for this user.")
    
    def post(self, request, *args, **kwargs):
        uploaded_files = request.FILES.getlist('file')
        vid_files = request.FILES.getlist('video_file')

        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        address = request.data.get('address')

        if UploadedMultipleFile.objects.filter(
            Q(latitude=latitude, longitude=longitude) | Q(address=address),
            user=request.user
        ).exists():
            return Response(
                {"error": "You have already posted a yardsign at this location or address. Please choose a different one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for uploaded_file in uploaded_files:
            if not uploaded_file.content_type.startswith('image'):
                return Response({"error": "Only image files are allowed."}, status=status.HTTP_400_BAD_REQUEST)
        
        for uploaded_file in uploaded_files:
            user_upload = UploadedFile.objects.create(user=request.user)
            if 'sector' in request.data:
                user_upload.sector = request.data['sector']
            user_upload.file = uploaded_file
            if 'latitude' in request.data:
                user_upload.latitude = request.data['latitude']
            if 'longitude' in request.data:
                user_upload.longitude = request.data['longitude']
            if 'address' in request.data:
                user_upload.address = request.data['address']
            if 'category_id' in request.data:
                user_upload.category_id = request.data['category_id']
            user_upload.save()
            
        for vid_file in vid_files:
            user_upload = UploadedFile.objects.create(user=request.user)
            if 'sector' in request.data:
                user_upload.sector = request.data['sector']
            user_upload.video_file = vid_file
            if 'latitude' in request.data:
                user_upload.latitude = request.data['latitude']
            if 'longitude' in request.data:
                user_upload.longitude = request.data['longitude']
                point = Point(float(request.data['longitude']), float(request.data['latitude']))
                user_upload.geom = point
            if 'address' in request.data:
                user_upload.address = request.data['address']
            if 'category_id' in request.data:
                user_upload.category_id = request.data['category_id']
            user_upload.save()

        if not uploaded_files and not vid_files:
            user_upload = UploadedFile.objects.create(
                user=request.user,
                sector=request.data.get('sector'),
                latitude=request.data.get('latitude'),
                longitude=request.data.get('longitude'),
                address=request.data.get('address'),
                category_id = request.data.get('category_id')
            )
            if 'latitude' in request.data and 'longitude' in request.data:
                user_upload.geom = Point(float(request.data['longitude']), float(request.data['latitude']))
            user_upload.save()

        uploaded_file2 = UploadedMultipleFile.objects.create(
            user=request.user,
            latitude=request.data.get('latitude'),
            longitude=request.data.get('longitude'),
            sector=request.data.get('sector'),
            address=request.data.get('address'),
            category_id = request.data.get('category_id')
        )

        user_info_company = UserInfo.objects.filter(user=request.user).values().first()
        if user_info_company:
            uploaded_file2.company_name = user_info_company['company_name']

        if 'latitude' in request.data and 'longitude' in request.data:
            uploaded_file2.geom = Point(float(request.data['longitude']), float(request.data['latitude']))

        upload_sector = UploadedFile.objects.filter(user=request.user).first()
        if upload_sector:
            sector_info = Sector.objects.filter(id=upload_sector.sector).values().first()
            if sector_info:
                uploaded_file2.sector_name = sector_info['sector_name']
                uploaded_file2.sector_id = sector_info['id']
                category_info = Category.objects.filter(id=sector_info['category_id']).first()
                if category_info:
                    uploaded_file2.category_name = category_info.category_name
        
        userinfo = UserInfo.objects.filter(user=request.user).first()
        if userinfo and sector_info:
            userinfo.sector = sector_info['id']
            userinfo.save()

        uploaded_file2.save()

        serializer = FileUploadSerializer(user_upload)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FileUploadReplaceAPIView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = FileUploadSerializer

    def post(self, request):
        result = []
        uploaded_files = request.FILES.getlist('file')
        vid_files = request.FILES.getlist('video_file')

        # Get existing sector, latitude, longitude, address, and geom for the user
        user_files = UploadedFile.objects.filter(user=request.user)
        upload_sector = user_files.values('sector').first().get('sector')
        upload_latitude = user_files.values('latitude').first().get('latitude')
        upload_longitude = user_files.values('longitude').first().get('longitude')
        upload_address = user_files.values('address').first().get('address')
        point_geom = user_files.values('geom').exclude(geom=None).first().get('geom')

        # Delete existing uploaded files for the user
        user_files.delete()

        # Validate and save new uploaded files
        for uploaded_file in uploaded_files:
            if not uploaded_file.content_type.startswith('image'):
                return Response({"error": "Only image files are allowed."}, status=status.HTTP_400_BAD_REQUEST)
            user_upload = UploadedFile.objects.create(user=request.user, sector=request.data.get('sector', upload_sector), file=uploaded_file, geom=point_geom)
            user_upload.save()

        for vid_file in vid_files:
            user_upload = UploadedFile.objects.create(user=request.user, sector=request.data.get('sector', upload_sector), video_file=vid_file)
            user_upload.save()

        # Update the newly uploaded files with the old data
        uploaded_file2 = UploadedFile.objects.filter(user=request.user)
        uploaded_file2.update(address=upload_address, longitude=upload_longitude, latitude=upload_latitude, geom=point_geom)

        # Update the UploadedMultipleFile table with sector data
        sector_info_multiple = UploadedMultipleFile.objects.filter(user=request.user)
        sector_info_multiple.update(sector=request.data.get('sector', upload_sector), sector_id=request.data.get('sector_id', upload_sector), sector_name=request.data.get('sector_name'), geom=point_geom)

        # Serialize and return the uploaded files
        for data in uploaded_file2:
            result.append(FileUploadSerializer(data).data)

        return Response(result, status=status.HTTP_200_OK)

class FileUploadMultipleAPIView(APIView):
    
    permission_classes = [AllowAny]
    serializer_class = UploadedMultipleFileSerializer

    def get(self, request):
        uploaded_data = UploadedMultipleFile.objects.filter(user_id=request.user)
        if uploaded_data.exists():
            serializer = UploadedMultipleFileSerializer(uploaded_data, many=True)
            for entry in serializer.data:
                sector_value = Sector.objects.filter(id=entry['sector']).values().first()
                if sector_value:
                    entry['logo'] = sector_value['logo']
            data = serializer.data
            data_sorted = sorted(data, key=lambda x: x["id"])
            return Response(data_sorted)
        else:
            raise NotFound("No uploaded files found for this user.")


    def post(self, request, *args, **kwargs):
        uploaded_data = UploadedMultipleFile.objects.filter(user_id=request.user)
        existing_data_count = uploaded_data.count()

        user = request.user
        feature_count = user.feature_count  
        remaining_features = feature_count - existing_data_count 

        if remaining_features <= 0:
            return Response(
                {"error": "Limit Exceeded! You can't add more addresses. Please upgrade your plan."},
                status=status.HTTP_400_BAD_REQUEST
            )

        data_list = request.data
        new_entries_count = len(data_list)

        if new_entries_count > remaining_features:
            return Response(
                {"error": f"You can only add {remaining_features} more addresses. Please upgrade your plan."},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_files = []

        for data in data_list:
            point = Point(float(data['longitude']), float(data['latitude']))

            if UploadedMultipleFile.objects.filter(
                Q(latitude=data['latitude'], longitude=data['longitude']) | Q(address=data['address']),
                user=request.user
            ).exists():
                return Response(
                    {"error": "You have already posted a yardsign at this location or address. Please choose a different one."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            upload_sector = UploadedFile.objects.filter(user=request.user).first().sector
            user_info_company = UserInfo.objects.filter(user=request.user).values().first()
            sector_info = Sector.objects.filter(id=upload_sector).values().first()

            uploaded_file2 = UploadedMultipleFile.objects.create(
                user=request.user,
                geom=point,
                latitude=data['latitude'],
                longitude=data['longitude'],
                address=data['address'],
                sector=data['sector'],
                company_name=user_info_company['company_name'],
                sector_name=sector_info['sector_name'],
                category_id = sector_info['category_id'],
                sector_id=sector_info['id']
            )

            category_info = Category.objects.filter(id=sector_info['category_id']).first()
            if category_info:
                uploaded_file2.category_name = category_info.category_name

            uploaded_file2.save()

            uploaded_files.append(uploaded_file2)

        expiry_date = user.expiry_date
        all_data = UploadedMultipleFile.objects.filter(user_id=request.user)

        if feature_count != 0:
            active_feature = all_data[:feature_count] if len(all_data) > feature_count else all_data
            for feature in all_data:
                feature.is_active = feature in active_feature
                feature.expiry_date = expiry_date
                feature.save()

        serializer = UploadedMultipleFileSerializer(all_data, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_address_from_coordinates(self, latitude, longitude):
        """Fetch address from LocationIQ Reverse Geocoding API."""
        url = f"https://us1.locationiq.com/v1/reverse.php?key={os.getenv('LOCATIONIQ_API_KEY')}&lat={latitude}&lon={longitude}&format=json"

        try:
            response = requests.get(url)
            data = response.json()
            if "error" not in data:
                return data.get("display_name")
            return None
        except requests.exceptions.RequestException as e:
            print(f"LocationIQ API error: {e}")
            return None

    def put(self, request):
        if isinstance(request.data, list):
            data = request.data
            uploadedFile = UploadedMultipleFile.objects.filter(pk=request.data[0].get('id')).first()
            try:
                latitude = round(float(data[0]['latitude']), 6)
                longitude = round(float(data[0]['longitude']), 6)
                point = Point(longitude, latitude)
                data[0]['geom'] = point
                data[0]['address'] = self.get_address_from_coordinates(latitude, longitude) 
                
                serializer = UploadedMultipleFileSerializer(uploadedFile, data=data[0], partial=False)
                
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": "Invalid latitude or longitude format."}, status=status.HTTP_400_BAD_REQUEST)
            
        elif isinstance(request.data, dict):
            data = request.data
            if not all(key in request.data for key in ['id', 'latitude', 'longitude']):
                return Response({"error": "Missing required fields: id, latitude, or longitude."},
                                status=status.HTTP_400_BAD_REQUEST)
        
            try:
                uploaded_file = UploadedMultipleFile.objects.filter(pk=data.get('id')).first()
            except UploadedMultipleFile.DoesNotExist:
                return Response({"error": "File with the given ID not found."}, status=status.HTTP_404_NOT_FOUND)

            try:
                latitude = round(float(request.data['latitude']), 6)
                longitude = round(float(request.data['longitude']), 6)
                uploaded_file.latitude = latitude
                uploaded_file.longitude = longitude
                uploaded_file.geom = Point(longitude, latitude)
                uploaded_file.address = self.get_address_from_coordinates(latitude, longitude)
                uploaded_file.save()
            except ValueError:
                return Response({"error": "Invalid latitude or longitude format."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UploadedMultipleFileSerializer(uploaded_file)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        else:
            return Response({"error": "Invalid request format."}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        
        if not isinstance(request.data, list) or not all(isinstance(item, int) for item in request.data):
            return Response({"detail": "Invalid input. Expected a list of address IDs."}, status=status.HTTP_400_BAD_REQUEST)
        
        uploaded_data = UploadedMultipleFile.objects.filter(user_id=request.user)
        serializer = UploadedMultipleFileSerializer(uploaded_data, many=True)
        data = serializer.data
        data_sorted = sorted(data, key=lambda x: x["id"])
        
        primary_address_id = data_sorted[0]['id'] if data_sorted else None

        response_data = {
            "deleted": [],
            "not_deleted": [],
            "primary_address_protected": primary_address_id
        }
        
        for address_id in request.data:
            if address_id == primary_address_id:
                response_data["not_deleted"].append({
                    "id": address_id,
                    "reason": "Primary address cannot be deleted"
                })
            else:
                uploaded_file = UploadedMultipleFile.objects.filter(pk=address_id).first()
                if uploaded_file:
                    uploaded_file.delete()
                    response_data["deleted"].append(address_id)
                else:
                    response_data["not_deleted"].append({
                        "id": address_id,
                        "reason": "Address not found or already deleted"
                    })

        if response_data["deleted"]:
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)


class DashboardAPIView(APIView):
    permission_classes = [AllowAny] 

    def get(self, request):
        uploaded_files = UploadedFile.objects.all()
        serializer = FileUploadSerializer(uploaded_files, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

class ConsumerInfo(APIView):
    permission_classes = [AllowAny]
    serializer_class = FileUploadSerializer


    def post(self, request):
        uid = request.data.get('uid')  # Get the email from request data
        user = User.objects.filter(id=uid).first()  # Get the user object based on email
        if user is not None:
            uploaded_data = UploadedFile.objects.filter(user=user)
            user_info = UserInfo.objects.filter(user=user)
            if user_info.exists():
                
                serializer_info = UserInfoSerializer(user_info, many = True)
                sector_info = serializer_info.data[0]['sector']
                for record in serializer_info.data:
                    record['sector_name'] = Sector.objects.filter(id=sector_info).values()[0]['sector_name']

                if uploaded_data.exists():
                    serializer = FileUploadSerializer(uploaded_data, many=True)
                    return Response({"file":serializer.data, "user_info":serializer_info.data})
                else:
                  raise NotFound("No uploaded files found for this user.")  
            else:
                raise NotFound("No user data found for this user.")
        else:
            raise NotFound("User with provided email does not exist.")

## API to return the WMS info with static Images
## To be removed in future
class ConsumerInfoWMS(APIView):

    permission_classes = [AllowAny]
    serializer_class = FileUploadSerializerWMS

    def post(self, request):
        sector = request.data.get('sector')
        uploaded_data = UploadedFileWMS.objects.filter(sector=sector)

        print(f"Querying for sector: {sector}")
        print(f"Matching files found: {uploaded_data.count()}")

        if uploaded_data:
            serializer = FileUploadSerializerWMS(uploaded_data, many=True)
            return Response({"file":serializer.data})
        else:
            raise NotFound("No uploaded files found for this user.")

class EditProfileInfo(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserInfoSerializer

    def post(self, request):
        user_info = UserInfo.objects.filter(user=request.user).first()  # Get the user's UserInfo instance
        sector_info = UploadedFile.objects.filter(user=request.user)
        sector_info_multiple = UploadedMultipleFile.objects.filter(user=request.user)

        if user_info:
            if 'sector' in request.data:
                user_info.sector = request.data['sector']
                sector_info.update(sector=request.data['sector'])
                if sector_info_multiple.exists():
                    sector_info_multiple.update(sector=request.data['sector'])
                    if 'sector_id' in request.data:
                        sector_info_multiple.update(sector_id=request.data['sector_id'])
                    if 'sector_name' in request.data:
                        sector_info_multiple.update(sector_name=request.data['sector_name'])
                    
            if 'contact_name' in request.data:
                user_info.contact_name = request.data['contact_name']           
            if 'company_name' in request.data:
                user_info.company_name = request.data['company_name']
            if 'company_phone' in request.data:
                user_info.company_phone = request.data['company_phone']
            if 'company_email' in request.data:
                user_info.company_email = request.data['company_email']
            if 'company_address' in request.data:
                user_info.company_address = request.data['company_address']
            if 'hide' in request.data:
                user_info.hide = request.data['hide']
                if user_info.hide == 'false':
                    user_info.hide = False
                elif user_info.hide == 'true':
                    user_info.hide = True
            if 'image' in request.data:
                user_info.image = request.data['image']
            if 'company_website' in request.data:
                user_info.company_website = request.data['company_website']

            user_info.save() 
            serializer = UserInfoSerializer(user_info)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User information not found"}, status=status.HTTP_404_NOT_FOUND)

class EditProfileInfoLogoChange(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UploadedMultipleFileSerializer
    def post(self, request):
        user_info = UserInfo.objects.filter(user=request.user).first()
        if user_info:
            if 'image' in request.data:
                user_info.image = request.data['image']
            user_info.save() 
            serializer = UserInfoSerializer(user_info)

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response({"error": "User information not found"}, status=status.HTTP_404_NOT_FOUND)

class ContactUsMail(APIView):
    permission_classes = [AllowAny]
    serializer_class = ContactUsSerializer

    def post(self, request):
        user_email = request.data.get('to')  
        user_message = request.data.get('message') 
        user_first_name = request.data.get('contact_name') 
        user_phone = request.data.get('phone') 
        user_address = request.data.get('address') 
        user_city = request.data.get('city') 
        user_state = request.data.get('state') 
        user_zipcode = request.data.get('zipcode') 

        user_email_subject = 'Message Successfully Delivered!!'
        # user_email_content = f"Dear Customer,\nI hope this finds you well.\nThank you for reaching out! We've received your message and are currently working on addressing your inquiry.\nWe'll be in touch very soon with a response.\n\nBest regards,\nYard Sign Pro Shop"
        user_email_content = render_to_string('accounts/contact_us_user.html')

        postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=user_email,
            Subject=user_email_subject,
            HtmlBody=user_email_content
            )

        # Send notification email to host
        host_email_subject = 'New Enquiry Received'
        user_data = {
            'email':user_email,
            'contact_name': user_first_name,
            'phone': user_phone,
            'address':user_address,
            'city': user_city,
            'state': user_state,
            'zipcode': user_zipcode,
            'message': user_message
            }
        host_email_content = render_to_string('accounts/contact_us_host.html', {
            'user': user_data
        })
        postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=EMAIL_HOST_USER,
            Subject=host_email_subject,
            HtmlBody=host_email_content
            )

        # Save contact message to the database
        contact_message = ContactUsMailModel.objects.create(
            contact_name=user_first_name,
            email=user_email,
            phone=user_phone,
            address=user_address,
            city=user_city,
            state=user_state,
            zipcode=user_zipcode,
            message=user_message
        )

        # Serialize the contact message for response
        serializer = ContactUsSerializer(contact_message)

        return Response({'status': serializer.data, 'message': 'Emails sent successfully'})

class VerifyingMail(APIView):

    permission_classes = [AllowAny]
    def post(self, request):
        
        user_email = request.data.get('user_email')
        user_confirm = User.objects.filter(email=user_email).first()

        if user_confirm is not None:
            email=user_email
            current_site = get_current_site(request)
            subject = "Verify Email"
            message = render_to_string('accounts/verify_email_message.html', {
                'request': request,
                'user': user_confirm,
                'domain': current_site.domain,
                # 'uid':urlsafe_base64_encode(force_bytes(user_confirm.pk)),
                'uid':user_confirm.pk,
                'token':account_activation_token.make_token(user_confirm),
            })
            admin_subject = "New User Account Created"
            admin_message = f'A new user account is being created just now with email:  {email}'

            postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=email,
            Subject=subject,
            HtmlBody=message
            )

            postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=EMAIL_HOST_USER,
            Subject=admin_subject,
            HtmlBody=admin_message
            )

            return Response({'status': True, 'message': 'verification email send'})
        else:
            return Response({'status': False, 'message': 'verification unsuccessful'})

class VerifyingMailConfirm(APIView):
    
    permission_classes = [AllowAny]
    def post(self, request):
        
        uidb64 = request.data.get('uidb64')
        token = request.data.get('token')
        try:
            # uid = force_str(urlsafe_base64_decode(uidb64))
            uid = uidb64
            user = User.objects.get(pk=uid)
            email  = user.email
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.save()
            # messages.success(request, 'Your email has been verified.')
            return Response({'status': True, 'email': email, 'message': 'verified'})  
        else:
            # messages.warning(request, 'The link is invalid.')
            return Response({'status': False, 'email': email, 'message': 'verification unsuccessful'})

class ResendVerifyingMail(APIView):

    permission_classes = [AllowAny]
    def post(self, request):
        uidb64 = request.data.get('uidb64')
        
        user_check = User.objects.filter(pk=uidb64)
        if user_check.exists():
            is_active_check = User.objects.filter(pk=uidb64).values()[0]['is_active']
            
            if  is_active_check:
                return Response({'status': False, 'message': 'User already verified'})
            else:
                try:
                    user = User.objects.get(pk=uidb64)

                    user_confirm = User.objects.get(email=user)
                    email=user
                    current_site = get_current_site(request)
                    subject = "Verify Email"
                    message = render_to_string('accounts/verify_email_message.html', {
                        'request': request,
                        'user': user_confirm,
                        'domain': current_site.domain,
                        'uid':user_confirm.pk,
                        'token':account_activation_token.make_token(user_confirm),
                    })

                    postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=str(email),
                    Subject=subject,
                    HtmlBody=message
                    )
                except Exception as e:
                    return Response({'status': False, 'message': str(e)})

                return Response({'status': True, 'message': 'verification email send'})
        else: 
            return Response({'status': False, 'message': 'User doesnt exists'})

class SendWelcomeEmail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_email = request.data.get('email')
        user_contact_name = request.data.get('contact_name')
        user_company_name = request.data.get('company_name')
        
        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response({'status': False, 'message': 'User does not exist'}, status=400)
        
        user_data = {
            'contact_name': user_contact_name,
            'company_name': user_company_name
        }
        current_site = get_current_site(request)
        subject = "Welcome to YardSignProShop!"
        message = render_to_string('accounts/welcome_email.html', {
            'request': request,
            'user': user_data,
            'domain': current_site.domain,
            'uid':user.pk,
            'token': account_activation_token.make_token(user),
        })

        try:
            logger.info(f"Email Host User: {EMAIL_HOST_USER}")
            postmark.emails.send(
                From=EMAIL_HOST_USER,
                To=[user.email, EMAIL_HOST_USER],
                Subject=subject,
                HtmlBody=message
            )
            user.is_active = True
            user.save()

            return Response({'status': True, 'message': 'Welcome email sent successfully'}, status=200)

        except Exception as e:
            return Response({'status': False, 'message': str(e)}, status=500)

class EditProfileInfoMail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    serializer = UserInfoSerializer

    def  post(self,request):
        user_profile_info= UserInfo.objects.filter(user=request.user).values()
        
        if user_profile_info:
            user_first_name=user_profile_info[0]['contact_name']
            user_company_name=user_profile_info[0]['company_name']
            user_sector=user_profile_info[0]['sector']
            
            user_email=request.user.email
            user_email_subject = 'Successfully Updated Profile Information!'
            user_email_content = f"Dear Customer,\nWe hope this email finds you well. Thank you for your interest in Yard Sign Pro Shop.\nWe're pleased to provide you with the requested information:\n First Name {user_first_name}\n Business Name {user_company_name}\n Sector {user_sector}\n \nBest regards,\nYard Sign Pro Shop"
            postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=user_email,
            Subject=user_email_subject,
            HtmlBody=user_email_content
            )
            return Response({'status': True, 'message': 'Email sent successfully'})
        
        else:
            return Response({'status': False, 'message': 'Verification unsuccessful'})


class ResetVerifyMail(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_email = request.data.get('to') 
        user = User.objects.filter(email=user_email).first()

        if user:
            # Generate a new token key
            token_key = get_random_string(length=32)
            Token.objects.filter(user=user).delete()
            token, _ = Token.objects.get_or_create(user=user)
            token.key = token_key

            user_verification_link = f'https://yardsignproshop.com/verify?token={token.key}'
            user_email_subject = 'Verify your account'
            user_email_content = f"Dear Customer,\nFore reseting password please verify\nPlease click on the following link:\n {user_verification_link} \nBest regards,\nYard Sign Pro Shop"
            # user_email_message = EmailMessage(user_email_subject, user_email_content, EMAIL_HOST_USER, [user_email])
            # user_email_message.send(fail_silently=False)
            postmark.emails.send(
            From=EMAIL_HOST_USER,
            To=user_email,
            Subject=user_email_subject,
            HtmlBody=user_email_content
            )
            return Response({'status': True, 'message': 'Email sent successfully'})
        else:
            return Response({'status': False, 'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class ResetVerifyingMail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user_confirm = UserInfo.objects.filter(user=request.user).first()

        if user_confirm is not None:
            return Response({'status': True, 'message': 'Reset Verified'})
        else:
            return Response({'status': False, 'message': 'Reset Verification unsuccessful'})

class ForgotPassword(APIView):
    # authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)

class ChangePassword(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        email = request.data.get('email')
        user = authenticate(request, email=email, password=old_password)
        if user:
            try:
                user = User.objects.get(email=request.user.email)   
                if check_password(old_password, request.user.password):
                    if new_password == confirm_password:
                        user.set_password(confirm_password)
                        user.save()
                return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({'message': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Old Password is Incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)

class ChangeEmail(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_email = request.data.get('current_email')
        new_email = request.data.get('new_email')
        current_password = request.data.get('current_password')
        userauth = authenticate(request, email=current_email, password=current_password)
        
        if userauth:
            if current_email == request.user.email :
                user = User.objects.filter(email=request.user.email)
                if check_password(current_password,request.user.password):
                    user.update(email=new_email)
                    return Response({'message': 'Email updated successfully'}, status=status.HTTP_200_OK)
                
            else: 
                return Response({'message': 'Email Not Matching Attempt Unsuccessful'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'message': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

class GenerateOTP(APIView):
    permission_classes = [AllowAny]  
    def post(self, request):
        email = request.data.get('email')
 
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email=email).first()

        if(user):

            otp = random.randint(100000, 999999)
            check_otp_inst = OTP.objects.filter(email = email)

            if check_otp_inst.first():
                check_inst = OTP.objects.get(email = email)
                check_inst.delete()

            otp_instance = OTP.objects.create(email=email, otp=otp)
            otp_instance.save()

            current_site = get_current_site(request)
            subject = "OTP Verification for YardSign Pro"
            message = render_to_string('accounts/verify_otp_email.html', {
                'request': request,
                'user': {'email': email},
                'otp': otp,
                'domain': current_site.domain,
                'uid': user.pk,
                'token': account_activation_token.make_token(user),
            })

            try:
                postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=[email],
                    Subject=subject,
                    HtmlBody=message
                )
        
                return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'status': False, 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'message': 'Provided email doesnot exists'})
        

class VerifyOTP(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get('email')
        otp_entered = request.data.get('otp')

        if not email or not otp_entered:
            return Response({'error': 'Email and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get OTP from database
        try:
            otp_instance = OTP.objects.get(email=email)
        except OTP.DoesNotExist:
            return Response({'error': 'OTP does not exist or expired'}, status=status.HTTP_404_NOT_FOUND)

        # Check if OTP is expired (more than 3 minutes old)
        time_difference = timezone.now() - otp_instance.created_at
        if time_difference.total_seconds() > 180:
            # OTP expired, delete the instance
            otp_instance.delete()
            return Response({'error': 'OTP expired'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_instance.otp == int(otp_entered):
            # OTP matched, delete OTP instance
            otp_instance.delete()
            return Response({'message': 'OTP verified successfully', 'email':email}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

class CategoryList(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Retrieve all records from the UploadedFile table
        category_list = Category.objects.all()
        
        # Serialize the queryset
        serializer = CategoryListSerializer(category_list, many=True)
        
        # Return serialized data in the response
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SectorList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        sector_list = Sector.objects.all().values()
        sorted_list = sorted(sector_list, key=lambda x: x['sector_name'])
        return Response(sorted_list, status=status.HTTP_200_OK)

    def post(self, request):
        sector_list=Sector.objects.filter(category_id=request.data['category_id']).values()  
        sorted_list = sorted(sector_list, key=lambda x: x['sector_name'])
        return Response(sorted_list, status=status.HTTP_200_OK)


# ______________________________________PHASE 2___________________________________________________________________

class Checkout(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:

            # Extract items from the request body
            name = request.data.get('name')
            price = request.data.get('price')
            quantity = request.data.get('quantity')
            plan_id = request.data.get('plan_id')
            unit_amount=int(price * 100)
            # Create a checkout session
            session = stripe.checkout.Session.create(
                billing_address_collection='required',
                payment_method_types=['card'],
                mode='payment',
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': name,
                            },
                            'unit_amount': unit_amount, 
                        },
                        'quantity': quantity,
                        
                    } 
                ],
                # success_url="http://localhost:3000/success",
                # cancel_url="http://localhost:3000/failed",
                success_url="https://yardsignproshop.com/success",
                cancel_url="https://yardsignproshop.com/failed",
            )
            # pdb.set_trace()

            print(session)

            user_instance = User.objects.get(id=request.user.id)
            pricing_object = Pricing.objects.filter(user=user_instance)
            Pricing.objects.create(user=user_instance,
                                    stripe_payement_id= session.id,
                                    amount=price,
                                    plan_name=name,
                                    plan_id = plan_id) # add Plan id 
            # Return the session URL
            return JsonResponse({'url': session.url})
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

class Webhook(APIView):
    permission_classes=[AllowAny]
    # endpoint_secret = settings.STRIPE_ENDSECRET 
    endpoint_secret = 'YOUR_STRIPE_WEBHOOK_SECRET'

    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)
    
    def get(self, request):
        payement_id = request.data.get('data', {}).get('object', {}).get('id')
        
        try:
            price_serializer = Pricing.objects.get(stripe_payement_id=payement_id)
            serializer = PricingSerializer(price_serializer)
            return Response(serializer.data)
        except Pricing.DoesNotExist:
            return Response({'error': 'Pricing object does not exist for the provided payment ID'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


    def post(self, request, *args, **kwargs):
        endpoint_secret = 'YOUR_STRIPE_WEBHOOK_SECRET'
        payload = request.body.decode('utf-8')
        sig_header = request.headers['STRIPE_SIGNATURE']

        logger.info("Received Webhook Request")
        logger.info(f"Payload: {payload}")
        logger.info(f"Signature Header: {sig_header}")
        logger.info(f"Endpoint Secret: {endpoint_secret}")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e: 
            logger.error("Invalid Payload")
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError as e:
            logger.error("Invalid Signature - Signature Verification Failed: {e.args}")
            return Response({'error': 'Invalid signature'}, status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            invoice_id = session.get("invoice")
            invoice_url = None
            if invoice_id:
                invoice = stripe.Invoice.retrieve(invoice_id)
                invoice_url = invoice.get("hosted_invoice_url")

            payment_status = session.get("payment_status")
            customer_email = session.get("customer_details", {}).get("email", "Email not provided")
            stripe_payment_id = session.get("id")
            amount_total = session.get("amount_total") / 100  
            plan_name = session.get("metadata", {}).get("plan_name", "Unknown Plan")

            pricing_obj = Pricing.objects.filter(stripe_payement_id=event.data.object.id)
            if pricing_obj:
                pricing_obj[0].payment_status = event.data.object.payment_status  
                pricing_obj[0].amount =  event.data.object.amount_total/100 
                pricing_obj[0].start_date = timezone.now().replace(tzinfo=None)
                plan_id = pricing_obj[0].plan_id
                plan = PricingplanModel.objects.filter(id = plan_id)[0]
                plan_type = plan.validityType
                if plan_type == 'month':
                    current_datetime = pricing_obj[0].start_date
                    pricing_obj[0].end_date = current_datetime + relativedelta(months=1)
                elif plan_type == 'year':
                    current_datetime = pricing_obj[0].start_date
                    pricing_obj[0].end_date = current_datetime + relativedelta(years=1)
                pricing_obj[0].save()

                user_id = pricing_obj[0].user_id
                all_data = UploadedMultipleFile.objects.filter(user = user_id)
                plan_feature = int(plan.features)
                if len(all_data) > plan_feature:
                    active_feature = all_data[:plan_feature]
                else:
                    active_feature = all_data
                for features in all_data:
                    if features in active_feature:
                        features.is_active = True
                        features.expiry_date = pricing_obj[0].end_date
                        features.save()
                    else:
                        features.is_active = False
                        features.expiry_date = timezone.now().replace(tzinfo=None) - relativedelta(days=1)
                        features.save()
                
                user = User.objects.get(id = user_id)
                user.expiry_date = pricing_obj[0].end_date
                user.feature_count = plan_feature
                user.plan_name = pricing_obj[0].plan_name
                user.save()

                if not hasattr(user, 'userinfo'):
                    user_info = UserInfo.objects.create(user=user)  # Creating a new UserInfo if it does not exist
                else:
                    user_info = user.userinfo

                subject = "Payment Successful: Your Subscription Details"
                message = render_to_string('accounts/stripe_payment_success.html', {
                'request': request,
                'user_info': user_info.company_name if user_info else 'No Company name',
                'domain': get_current_site(request).domain,
                'uid': user.pk,
                'token': account_activation_token.make_token(user),
                'plan_name': pricing_obj[0].plan_name,
                'amount': amount_total,
                'start_date': pricing_obj[0].start_date, 
                'end_date': pricing_obj[0].end_date,
                'invoice_url': invoice_url,
            })
                
            try:
                postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=[customer_email, user_info.company_email, EMAIL_HOST_USER],
                    Subject=subject,
                    HtmlBody=message
                )
            except Exception as e:
                return JsonResponse({'success': False, 'email_error': str(e)}, status=500)

            else:
                return JsonResponse({'success': False, "message": "No payment done"})

        elif event['type'] == 'checkout.session.expired':
            session = event['data']['object']
            stripe_payment_id = session.get("id")
            pricing_obj = Pricing.objects.filter(stripe_payement_id=event.data.object.id)
            if pricing_obj:
                pricing_obj[0].payment_status = "expired"
                pricing_obj[0].save()

        elif event['type'] == 'payment_intent.payment_failed':
            intent = event['data']['object']
            stripe_payment_id = intent.get("id")
            customer_email = intent.get("last_payment_error", {}).get("payment_method", {}).get("billing_details", {}).get("email", None)
            failure_reason = intent.get("last_payment_error", {}).get("message", "Unknown error")
            
            try:
                pricing_obj = Pricing.objects.filter(stripe_payement_id=stripe_payment_id).first()
                user_info = UserInfo.objects.create(user=user)
                if pricing_obj:
                    pricing_obj.payment_status = "failed"
                    pricing_obj.save()

                subject = "Payment Failed"
                message = f"Dear Customer, your payment has failed due to the following reason: {failure_reason}. Please try again."
                
                postmark.emails.send(
                    From=EMAIL_HOST_USER,
                    To=[customer_email, user_info.company_email, EMAIL_HOST_USER],
                    Subject=subject,
                    HtmlBody=message
                )

            except Exception as e:
                return JsonResponse({'error': str(e)}, status=500)

            return JsonResponse({'success': True, 'message': 'Payment failed email sent.'})

        else:
            print(f'Unhandled event type {event["type"]}')

        return JsonResponse({'success': True})
    
class Subscription(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[TokenAuthentication]

    def post(self,request):
        discount_status = request.data.get('discountStatus')
        SubscriptionModel.objects.create(user=request.user,
                                        discount_status=discount_status,
                                        validity=request.data.get('validity'),
                                        price=request.data.get('price'),
                                        validity_type= request.data.get('validityType'),
                                        discount_start_date=request.data.get('discountStartDate'),
                                        discount_expiry_date=request.data.get('discountExpiaryDate'),
                                        status=request.data.get('status'),
                                        features=request.data.get('features'),
                                        created_at=request.data.get('createdAt'),
                                        updated_at=request.data.get('updatedAt'),
                                        discount_amount=request.data.get('discountAmount')
                                                                  )
        return JsonResponse({'success': True})
    
class Pricingplan(APIView):
        permission_classes=[AllowAny]

        def get(self,request):
            subscriptions = PricingplanModel.objects.annotate(
            custom_order=Case(
                When(planname="30 Day Free Trial", then=0),
                When(planname="Small Business", then=1),
                When(planname="Business", then=2),
                When(planname="Corporate", then=3),
                default=4,
                output_field=IntegerField()
            )
        ).order_by('custom_order')
            serializer = PricingplanSerializer(subscriptions, many=True)
            return Response(serializer.data)
            
class Freeplan(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[TokenAuthentication]

    def get(self, request):
        plan_detail = FreeplanModel.objects.filter(user = request.user)
        if plan_detail:
            serializer = FreeplanSerializer(plan_detail)
        return Response(serializer.data)

    def post(self, request):
            request.data['user']  = request.user.id
            request.data['start_date'] = timezone.now().replace(tzinfo=None)
            request.data['expiry_date'] = timezone.now().replace(tzinfo=None) + relativedelta(days=30)
            serializer = FreeplanSerializer(data=request.data)
            plan_check = FreeplanModel.objects.filter(user = request.user)
            feature_count = User.objects.get(id = request.user.id).feature_count
            if feature_count == 0:
                if not plan_check.exists():
                    if serializer.is_valid():
                        
                        serializer.save()
                        # update user table
                        feature_count = PricingplanModel.objects.filter(price = "Free").first().features
                        user = User.objects.get(id = request.user.id)
                        user.expiry_date = timezone.now().replace(tzinfo=None) + relativedelta(days=30)
                        user.feature_count = feature_count
                        user.plan_name = PricingplanModel.objects.filter(price = "Free").first().planname
                        user.save()

                        # update uploadmultiplefile table
                        all_data = UploadedMultipleFile.objects.filter(user_id=request.user)
                        expiry_date = user.expiry_date
                        feature_count = user.feature_count
                        if feature_count != 0:
                            if len(all_data) > feature_count:
                                active_feature = all_data[:feature_count]
                            else:
                                active_feature = all_data
                            
                            for feature in all_data:
                                if feature in active_feature:
                                    feature.expiry_date = expiry_date
                                    feature.is_active = True
                                    feature.save()
                                else:
                                    feature.expiry_date = expiry_date
                                    feature.is_active = False
                                    feature.save()

                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({'status': False, 'message': 'Free plan already expired.'} )
            return Response({'status': False, 'message': 'user plan already subscribed to paid plan.'} )

class UserinfoSearch(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]


    def post(self, request):
        search_term = request.data.get('search_term', '') 
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)

        users = User.objects.all()  
        if search_term:
            users = users.filter(email__icontains=search_term)

        if users:
            user_data = []
            for user in users:
                userInfo = UserInfo.objects.filter(user = user)
                if userInfo:
                    user_first_name = userInfo[0].contact_name
                    # user_last_name = userInfo[0].last_name
                    user_email = user.email
                    # if user_first_name and user_last_name:
                        # user_name = user_first_name + ' '+user_last_name
                    if user_first_name:
                        user_name = user_first_name
                    elif user_first_name:
                        user_name = user_first_name
                    else:
                        user_name = user_email
                    
                    user_info = {
                        'user_id': user.id,
                        'email': user.email,
                        'expiry_date': user.expiry_date,
                        'feature_count': user.feature_count,
                        'plan_name': user.plan_name,
                        'user_name': user_name
                    }
                    # Fetch pricing plan information based on the user's plan name
                    pricing_plan = PricingplanModel.objects.filter(planname=user.plan_name).first()
                    if pricing_plan:
                        user_info['price'] = pricing_plan.price
                        # Check if the expiry date is present and past the current date
                        if user.expiry_date:
                            if user.expiry_date < datetime.now().date():
                                user_info['status'] = 'inactive'
                            else:
                                user_info['status'] = 'active'
                        else:
                            user_info['status'] = 'unknown'
                    else:
                        user_info['price'] = None
                        user_info['status'] = None

                    user_data.append(user_info)

            # Pagination
            page_limit = request.data.get('limit', 10)
            paginator = Paginator(user_data, page_limit) 
            page_number = request.data.get('page_number', 1)
            page_obj = paginator.get_page(page_number)
            total_pages = ceil(len(user_data) / page_limit)

            response_data = {
                'total_pages': total_pages,
                'data': page_obj.object_list
            }

            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response("No users found", status=status.HTTP_200_OK)
              
class UserYards(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    def post(self, request):
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        data = UploadedMultipleFile.objects.filter(user=user_id)
        serializer = UploadedMultipleFileSerializer(data, many=True)
        data = serializer.data
        data_sorted = sorted(data, key=lambda x: x["id"])
        return Response(data_sorted, status=status.HTTP_200_OK)
        # return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserYardAdd(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)

        data_list = request.data
        user_id_params = request.GET.get('user_id')

        for data in data_list:
            point = Point(float(data['longitude']), float(data['latitude']))
            upload_sector = UploadedFile.objects.filter(user=user_id_params)[0].sector
            user_info_company = UserInfo.objects.filter(user=user_id_params).values()[0]

            sector_info = Sector.objects.filter(id=upload_sector).values()[0]

            uploaded_file2 = UploadedMultipleFile.objects.create(user=User.objects.filter(id=user_id_params)[0])
            uploaded_file2.geom = point
            uploaded_file2.latitude = data['latitude']
            uploaded_file2.longitude = data['longitude']
            uploaded_file2.address = data['address']
            uploaded_file2.sector = data['sector']
            uploaded_file2.company_name = user_info_company['company_name']
            uploaded_file2.sector_name = sector_info['sector_name']
            uploaded_file2.sector_id = sector_info['id']
            uploaded_file2.save()

            serializer = UploadedMultipleFileSerializer(uploaded_file2)

        all_data = UploadedMultipleFile.objects.filter(user_id=user_id_params)
        user = User.objects.get(id=user_id_params)
        expiry_date = user.expiry_date
        feature_count = user.feature_count
        if feature_count != 0:
            if len(all_data) > feature_count:
                active_feature = all_data[:feature_count]
            else:
                active_feature = all_data

            for feature in all_data:
                if feature in active_feature:
                    feature.expiry_date = expiry_date
                    feature.is_active = True
                    feature.save()
                else:
                    feature.expiry_date = expiry_date
                    feature.is_active = False
                    feature.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserYardRemove(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def delete(self, request):
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)
        
        uploaded_file_id = request.data.get('id')
        try:
            uploaded_file = UploadedMultipleFile.objects.get(id=uploaded_file_id)
            uploaded_file.delete()
            return Response("File deleted successfully", status=status.HTTP_200_OK)
        except UploadedMultipleFile.DoesNotExist:
            return Response("File not found", status=status.HTTP_404_NOT_FOUND)

class UserYardEdit(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def put(self, request):
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)
        
        uploaded_file_id = request.data.get('id')
        if not uploaded_file_id:
            return Response("Please provide an 'id' for the file", status=status.HTTP_400_BAD_REQUEST)

        try:
            uploaded_file = UploadedMultipleFile.objects.get(id=uploaded_file_id)
        except UploadedMultipleFile.DoesNotExist:
            return Response("File not found", status=status.HTTP_404_NOT_FOUND)

        # Update yard information based on provided data
        latitude = request.data.get('latitude')
        longitude = request.data.get('longitude')
        address = request.data.get('address')
        company_name = request.data.get('company_name')
        sector_id = request.data.get('sector_id')
        sector_name = request.data.get('sector_name')
        is_active = request.data.get('is_active')
        expiry_date = request.data.get('expiry_date')

        # Update the fields if provided
        if latitude is not None:
            uploaded_file.latitude = latitude
        if longitude is not None:
            uploaded_file.longitude = longitude
        if address is not None:
            uploaded_file.address = address
        if company_name is not None:
            uploaded_file.company_name = company_name
        if sector_id is not None:
            uploaded_file.sector_id = sector_id
        if sector_name is not None:
            uploaded_file.sector_name = sector_name
        if is_active is not None:
            uploaded_file.is_active = is_active
        if expiry_date is not None:
            uploaded_file.expiry_date = expiry_date
        if latitude is not None and longitude is not None:
            uploaded_file.geom = Point(float(longitude), float(latitude))

        uploaded_file.save()  # Save the changes
        return Response("File updated successfully", status=status.HTTP_200_OK)
    
class UserYardProfile(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        if not request.user.is_admin:
            return Response("Only admin users are allowed to access this endpoint", status=status.HTTP_403_FORBIDDEN)

        user_id = request.data.get('user_id')
        if not user_id:
            return Response("Please provide a 'user_id'", status=status.HTTP_400_BAD_REQUEST)

        user_info_values = UserInfo.objects.filter(user_id=user_id).values('contact_name', 'image').first()
        if not user_info_values:
            return Response("User information not found", status=status.HTTP_404_NOT_FOUND)

        user_info = UserInfo.objects.filter(user_id=user_id).first()
        user_email = user_info.user.email
        user_company_name = user_info.company_name
        user_company_website = user_info.company_website
        sector_info = Sector.objects.filter(id=user_info.sector).values().first()
        if not sector_info:
            return Response("Sector information not found", status=status.HTTP_404_NOT_FOUND)

        user = User.objects.filter(id=user_id).values('feature_count').first()
        if not user:
            return Response("User not found", status=status.HTTP_404_NOT_FOUND)

        json_object = {
            'contact_name': user_info_values['contact_name'],
            'image': UserInfoSerializer(user_info).data['image'],
            'email': user_email,
            'user_company_name': user_company_name,
            'user_company_website': user_company_website,
            'sector_id': sector_info['id'],
            'sector_name': sector_info['sector_name'],
            'logo': sector_info['logo'],
            'feature_count': user['feature_count']
        }

        return Response(json_object, status=status.HTTP_200_OK)

class NewCategory(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[TokenAuthentication]

    def post(self,request):
        is_admin=request.user.is_authenticated and request.user.is_admin
        if is_admin:
            new_category=request.data.get('category')
            #new_sector=request.data.get('sector')    #add sector in category table
            Category.objects.create(category_name=new_category)#,sector_name = new_sector )
            return Response("success", status=status.HTTP_200_OK)
        return Response("Only Admin user is allowed!!", status=status.HTTP_403_FORBIDDEN)  

    def delete(self,request):
        is_admin=request.user.is_authenticated and request.user.is_admin
        if is_admin:
            category_id=request.data.get('category_id')
            check_exists=Sector.objects.filter(category_id=category_id)
            if not check_exists:
                Category.objects.filter(id=category_id).delete()
                return Response("successfully deleted category!!", status=status.HTTP_200_OK)
            else:
                return Response("Please delete Sectors under this category", status=status.HTTP_400_BAD_REQUEST)

 
    def put(self, request):
        is_admin = request.user.is_authenticated and request.user.is_admin
        if is_admin:
            category_id = request.data.get('id')
            update_category_name = request.data.get('category')
            Category.objects.filter(id=category_id).update(category_name=update_category_name)
            return Response("successfully updated category!!", status=status.HTTP_200_OK) 
    
class NewSector(APIView):
    permission_classes=[IsAuthenticated]
    authentication_classes=[TokenAuthentication]

    def post(self,request):
        is_admin=request.user.is_authenticated and request.user.is_admin
        # check for admin
        if is_admin:
            category_id = request.data['category_id']
            if category_id == '':
                new_sector=request.data['sector_name']
                new_category=request.data['category']
                logo=request.data['image']
                original_filename, original_extension = os.path.splitext(logo.name)
                original_filename = original_filename.replace(' ', '_')

                filename = slugify(original_filename) + original_extension
                # Save the image to the media directory
                file_path = default_storage.save(f'sector/{filename}', ContentFile(logo.read()))
                # Get the URL of the saved image

                logo_url = settings.MEDIA_URL + file_path
                # logo_url = f'sector/{filename}'
                

                created_category=Category.objects.create(category_name=new_category)
                category = Category.objects.get(id=created_category.id)
                Sector.objects.create(sector_name=new_sector,category=category,logo=logo_url)
                try:
                    data = self.fetch_data()  # Fetch industry and icon data from the database
                    sld_xml = self.generate_sld(data)  # Generate SLD XML dynamically
                    status_code, response_text = self.update_geoserver_style(sld_xml)  # Update GeoServer style
                    print(f'Status Code: {status_code}')
                    print(f'Response: {response_text}')    
                    return Response("New category and sector created successfully!!", status=status.HTTP_200_OK)
                except Exception as e:
                    error_message = str(e)
                    print(f'Error: {error_message}')
                    return Response(data={"error": error_message}, status=status.HTTP_400_BAD_REQUEST)
            else:
                new_sector = request.data['sector_name']
                category_id = request.data['category_id']
                logo = request.data['image']
                original_filename, original_extension = os.path.splitext(logo.name)
                original_filename = original_filename.replace(' ', '_')
 
                filename = slugify(original_filename) + original_extension
                
                # Save the image to the media directory
                file_path = default_storage.save(f'sector/{filename}', ContentFile(logo.read()))
                # Get the URL of the saved image
                logo_url = settings.MEDIA_URL + file_path
                # Get the category
                category = Category.objects.get(id=category_id)
                # Create the sector with the image URL
                Sector.objects.create(sector_name=new_sector, category=category, logo=logo_url)
                try:
                    data = self.fetch_data()  # Fetch industry and icon data from the database
                    sld_xml = self.generate_sld(data)  # Generate SLD XML dynamically
                    status_code, response_text = self.update_geoserver_style(sld_xml)  # Update GeoServer style
                    print(f'Status Code: {status_code}')
                    print(f'Response: {response_text}')    
                    # pdb.set_trace()
                    # return Response(status=status.HTTP_200_OK)
                    return Response("New sector created successfully!!", status=status.HTTP_200_OK)                # logo=join(settings.MEDIA_URL, str(logo))
                except Exception as e:
                    error_message = str(e)
                    print(f'Error: {error_message}')
                    return Response(data={"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

        return Response("Only Admin user is allowed!!", status=status.HTTP_403_FORBIDDEN)
 
    def fetch_data(self):
        print("called")
        # Connect to the PostgreSQL database
        conn = psycopg2.connect("dbname=yardsigndev user=postgres password=fPWT01zgWNcB2NdOb2l6 host=yardsigndev.czbiko0d2y4q.us-east-1.rds.amazonaws.com")
        cur = conn.cursor()
        # Execute the query to retrieve industry names and corresponding icon URLs
        cur.execute("SELECT *, split_part(logo, '/', 4) as img FROM public.accounts_sector")
        data = cur.fetchall()  # Fetch all results
        cur.close()
        conn.close()  # Close the database connection
        return data
    def generate_sld(self,data):
        # Create the root element for the SLD XML
        sld = ET.Element('StyledLayerDescriptor', attrib={
            'version': '1.0.0',
            'xsi:schemaLocation': 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd',
            'xmlns': 'http://www.opengis.net/sld',
            'xmlns:ogc': 'http://www.opengis.net/ogc',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        })
        # Add NamedLayer element
        named_layer = ET.SubElement(sld, 'NamedLayer')
        name = ET.SubElement(named_layer, 'Name')
        name.text = 'yardsign'
        # Add UserStyle element
        user_style = ET.SubElement(named_layer, 'UserStyle')
        title = ET.SubElement(user_style, 'Title')
        title.text = 'Icon Mapping'
        
        # Add FeatureTypeStyle element
        feature_type_style = ET.SubElement(user_style, 'FeatureTypeStyle')
        link='https://yardsignproshop.com:9443'
        # Loop through the data to create rules for each industry and icon
        for element in data:
            _,sector_name,logo,category_id,img=element 
            rule = ET.SubElement(feature_type_style, 'Rule')
            rule_title = ET.SubElement(rule, 'Title')
            rule_title.text = sector_name  # Set the title to the industry name
            # Create filter to match the industry
            filter_tag = ET.SubElement(rule, 'ogc:Filter')
            ogc_and = ET.SubElement(filter_tag, 'ogc:And')
            prop_equal_1 = ET.SubElement(ogc_and, 'ogc:PropertyIsEqualTo')
            prop_name_1 = ET.SubElement(prop_equal_1, 'ogc:PropertyName')
            prop_name_1.text = 'category_id'
            literal_1 = ET.SubElement(prop_equal_1, 'ogc:Literal')
            literal_1.text = str(category_id)
            prop_equal_2 = ET.SubElement(ogc_and, 'ogc:PropertyIsEqualTo')
            prop_name_2 = ET.SubElement(prop_equal_2, 'ogc:PropertyName')
            prop_name_2.text = 'sector_name'
            literal_2 = ET.SubElement(prop_equal_2, 'ogc:Literal')
            literal_2.text = sector_name

            # Define PointSymbolizer with the icon URL
            point_symbolizer = ET.SubElement(rule, 'PointSymbolizer')
            graphic = ET.SubElement(point_symbolizer, 'Graphic')
            external_graphic = ET.SubElement(graphic, 'ExternalGraphic')
            online_resource = ET.SubElement(external_graphic, 'OnlineResource', attrib={
                'xlink:type': 'simple',
                'xlink:href':  link+logo # Use the icon URL from the database
            })
            format_tag = ET.SubElement(external_graphic, 'Format')
            format_tag.text = 'image/png'
            size = ET.SubElement(graphic, 'Size')
            size.text = '50'  # Set icon size

            # Define TextSymbolizer to label the points
            text_symbolizer = ET.SubElement(rule, 'TextSymbolizer')
            label = ET.SubElement(text_symbolizer, 'Label')
            prop_name_2 = ET.SubElement(label, 'ogc:PropertyName')
            prop_name_2.text = 'company_name'
            font = ET.SubElement(text_symbolizer, 'Font')
            css_param_font = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-family'})
            css_param_font.text = 'Arial'
            css_param_size = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-size'})
            css_param_size.text = '14'
            # Add CssParameter for font-size categorization
            css_param_categorize = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-size'})
            ogc_function = ET.SubElement(css_param_categorize, 'ogc:Function', attrib={'name': 'Categorize'})
            ogc_env = ET.SubElement(ogc_function, 'ogc:Function', attrib={'name': 'env'})
            ogc_env_literal = ET.SubElement(ogc_env, 'ogc:Literal')
            ogc_env_literal.text = 'wms_scale_denominator'
            ogc_literal_1 = ET.SubElement(ogc_function, 'ogc:Literal')
            ogc_literal_1.text = '12'
            ogc_literal_2 = ET.SubElement(ogc_function, 'ogc:Literal')
            ogc_literal_2.text = '1000'
            ogc_literal_3 = ET.SubElement(ogc_function, 'ogc:Literal')
            ogc_literal_3.text = '18'
            ogc_literal_4 = ET.SubElement(ogc_function, 'ogc:Literal')
            ogc_literal_4.text = '60000'
            ogc_literal_5 = ET.SubElement(ogc_function, 'ogc:Literal')
            ogc_literal_5.text = '0'
            fill = ET.SubElement(text_symbolizer, 'Fill')
            css_param_fill = ET.SubElement(fill, 'CssParameter', attrib={'name': 'fill'})
            css_param_fill.text = '#262626'
            # Add LabelPlacement and PointPlacement
            label_placement = ET.SubElement(text_symbolizer, 'LabelPlacement')
            point_placement = ET.SubElement(label_placement, 'PointPlacement')
            anchor_point = ET.SubElement(point_placement, 'AnchorPoint')
            anchor_point_x = ET.SubElement(anchor_point, 'AnchorPointX')
            anchor_point_x.text = '0.5'
            anchor_point_y = ET.SubElement(anchor_point, 'AnchorPointY')
            anchor_point_y.text = '0.5'
            displacement = ET.SubElement(point_placement, 'Displacement')
            displacement_x = ET.SubElement(displacement, 'DisplacementX')
            displacement_x.text = '0'
            displacement_y = ET.SubElement(displacement, 'DisplacementY')
            displacement_y.text = '-15'
            # Add Halo
            halo = ET.SubElement(text_symbolizer, 'Halo')
            radius = ET.SubElement(halo, 'Radius')
            ogc_literal_radius = ET.SubElement(radius, 'ogc:Literal')
            ogc_literal_radius.text = '2'
            fill_halo = ET.SubElement(halo, 'Fill')
            css_param_fill_halo = ET.SubElement(fill_halo, 'CssParameter', attrib={'name': 'fill'})
            css_param_fill_halo.text = '#FFFFFF'
            
        # Convert the XML tree to a string
        return ET.tostring(sld).decode()

    def update_geoserver_style(self,sld_xml):
        geoserver_url = 'https://yardsignproshop.com:8081/geoserver/rest/workspaces/yard_sign/styles/'

        headers = {
            'Content-type': 'application/vnd.ogc.sld+xml'
        }
        auth = ('admin', 'yardsign_geoserver')
        # Send PUT request to update the style on GeoServer
        response = requests.put(f'{geoserver_url}yard_db2', data=sld_xml, headers=headers, auth=auth, verify=False)
        print(response)
        return response.status_code, response.text

    def delete(self, request):
        is_admin = request.user.is_authenticated and request.user.is_admin
        if is_admin:
            sector_ids = request.data.get('sector_id')
            sectors_deleted = []
            sectors_not_found = []

            for sector_id in sector_ids:
                print(sector_id)
                sector = Sector.objects.filter(id=sector_id).first()  # Fetch sector object
                if not sector:
                    sectors_not_found.append(sector_id)
                else:
                    userinfo = UserInfo.objects.filter(sector=sector_id)
                    upload_file_info = UploadedFile.objects.filter(sector=sector_id)
                    upload_multiple_file_info = UploadedMultipleFile.objects.filter(sector=sector_id)

                    if userinfo.exists() or upload_file_info.exists() or upload_multiple_file_info.exists():
                        return Response("This Sector is already in use and cannot be deleted!!", status=status.HTTP_400_BAD_REQUEST)
                    else:
                        sector.delete()  # Delete the sector
                        sectors_deleted.append(sector)  # Store the deleted sector name
            
            response_data = {}
            if sectors_deleted:
                response_data['sectors_deleted'] = sectors_deleted
            if sectors_not_found:
                response_data['sectors_not_found'] = sectors_not_found
            

            try:
                data = self.fetch_data()  # Fetch industry and icon data from the database
                sld_xml = self.generate_sld(data)  # Generate SLD XML dynamically
                status_code, response_text = self.update_geoserver_style(sld_xml)  # Update GeoServer style
                print(f'Status Code: {status_code}')
                print(f'Response: {response_text}')
                if sectors_deleted:
                    response_data['message'] = "Sectors deleted successfully!!"
                else:
                    response_data['message'] = "No sectors were deleted."
                return Response(f'{response_data}', status=status.HTTP_200_OK)
            except Exception as e:
                error_message = str(e)
                # pdb.set_trace()
                print(f'Error: {error_message}')
                return Response(data={"error": error_message}, status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response("Unauthorized", status=status.HTTP_401_UNAUTHORIZED)
  
    def put(self, request):
        is_admin = request.user.is_authenticated and request.user.is_admin
        if is_admin:
            sector_id=request.data['sector_id']

            if 'sector' in request.data:
                update_sector_name = request.data['sector']
                Sector.objects.filter(id=sector_id).update(sector_name=update_sector_name)
            if 'category_id' in request.data:
                update_category_id = request.data['category_id']
                if Category.objects.filter(id=update_category_id).exists():
                    Sector.objects.filter(id=sector_id).update(category_id=update_category_id)
                else: 
                    return Response("category doesnt exists!!", status=status.HTTP_400_BAD_REQUEST)
            if 'logo' in request.data:
                updated_image = request.data['logo']
                # Assuming you want to update the Sector with id=sector_id
                sector = Sector.objects.get(id=sector_id)
                # Check if it's a valid image file
                if isinstance(updated_image, InMemoryUploadedFile):
                    sector.logo.save(updated_image.name.replace(' ', '_'), updated_image)
                    Sector.objects.filter(id=sector_id).update(logo='/media/sector/'+updated_image.name.replace(' ', '_')) 

            try:
                    data = self.fetch_data()  # Fetch industry and icon data from the database
                    sld_xml = self.generate_sld(data)  # Generate SLD XML dynamically
                    status_code, response_text = self.update_geoserver_style(sld_xml)  # Update GeoServer style
                    print(f'Status Code: {status_code}')
                    print(f'Response: {response_text}')    
                    return Response("successfully updated!!", status=status.HTTP_200_OK)           
            except Exception as e:
                    error_message = str(e)
                    print(f'Error: {error_message}')
                    return Response(data={"error": error_message}, status=status.HTTP_400_BAD_REQUEST)    
            
             
class ReccurentWebhook(APIView):
    permission_classes=[AllowAny]
    
    endpoint_secret = settings.STRIPE_ENDSECRET   
    def get(self, request):
        payement_id = request.data.get('data', {}).get('object', {}).get('id')
       
        try:
            price_serializer = Pricing.objects.get(stripe_payement_id=payement_id)
            serializer = PricingSerializer(price_serializer)
            return Response(serializer.data)
        except Pricing.DoesNotExist:
            return Response({'error': 'Pricing object does not exist for the provided payment ID'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


    def post(self, request, *args, **kwargs):
        payload = request.body.decode('utf-8')
        # payload = request.data
        sig_header = request.headers['STRIPE_SIGNATURE']
        try:
            event = stripe.Webhook.construct_event(
            payload, sig_header, self.endpoint_secret)

        except ValueError as e:
            raise e
        except SignatureVerificationError as e:
            raise e
        

        if event['type'] == 'checkout.session.completed':

            # payment_intent = event['data']['object']
            if (event):
                pricing_obj = Pricing.objects.filter(stripe_payement_id=event.data.object.id)
                if pricing_obj:
                    pricing_obj[0].payment_status = event.data.object.payment_status   # Update payment status
                    pricing_obj[0].amount =  event.data.object.amount_total/100  # Update amount
                    pricing_obj[0].start_date = timezone.now().replace(tzinfo=None)
                    plan_id = pricing_obj[0].plan_id
                    plan = PricingplanModel.objects.filter(id = plan_id)[0]
                    plan_type = plan.validityType
                    if plan_type == 'month':
                        current_datetime = pricing_obj[0].start_date
                        pricing_obj[0].end_date = current_datetime + relativedelta(months=1)
                    pricing_obj[0].save()

                    #update uploadmultiplefile table
                    user_id = pricing_obj[0].user_id
                    all_data = UploadedMultipleFile.objects.filter(user = user_id)

                    plan_feature = plan.features
                    if plan_feature is None:
                        active_feature = all_data

                    for features in all_data:
                        if features in active_feature:
                            features.is_active = True
                            features.expiry_date = pricing_obj[0].end_date
                            features.save()
                        else:
                            features.is_active = False
                            features.expiry_date = timezone.now().replace(tzinfo=None) - relativedelta(days=1)
                            features.save()
                   
                    # update user table
                    user = User.objects.get(id = user_id)
                    user.expiry_date = pricing_obj[0].end_date
                    user.feature_count = plan_feature
                    user.plan_name = pricing_obj[0].plan_name
                    user.save()

                else:
                    return JsonResponse({'success': False, "message": "No payment done"})
           
        else:
            print('Unhandled event type {}'.format(event['type']))

        return JsonResponse({'success': True})
 
class UnlimitedPlanCard(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
   
    def post(self, request):
        try:
            # Extract items from the request body
            
            name = request.data.get('name')
            price = request.data.get('price')
            quantity = request.data.get('quantity')
            plan_id = request.data.get('plan_id')
            validity_type = request.data.get('validityType')
            # pdb.set_trace()
            # Convert price to cents (Stripe expects price in smallest currency unit)
            unit_amount = int(price * 100)
 
            # Create a checkout session
            session = stripe.checkout.Session.create(
                billing_address_collection='required',
                payment_method_types=['card'],
                mode='subscription',
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': name,
                            },
                            'unit_amount': unit_amount,
                            'recurring': {
                                'interval': validity_type,  # Adjust interval as needed
                            }
                        },
                        'quantity': quantity,
                    }
                ],
                # success_url="http://localhost:3000/success",
                # cancel_url="http://localhost:3000/failed",
                success_url="https://yardsignproshop.com/success",
                cancel_url="https://yardsignproshop.com/failed",
            )
 
            # Save session ID and other details to your database
            user_instance = User.objects.get(id=request.user.id)
            Pricing.objects.create(
                user=user_instance,
                stripe_payement_id=session.id,
                amount=price,
                plan_name=name,
                plan_id=plan_id
            )
 
            # pdb.set_trace()
            UnlimitedPricing.objects.create(
                user=user_instance,
                stripe_payement_id=session.id,
                amount=price,
                plan_name=name,
                plan_id=plan_id,
                yard_list=[int(file_id) for file_id in UploadedMultipleFile.objects.filter(user=request.user).values_list('id', flat=True)]
            )
            # Return the session URL
            return JsonResponse({'url': session.url})
       
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)           
   
class UpdateUserInfo(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    
    def post(self, request):
        is_admin = request.user.is_authenticated and request.user.is_admin
        user_id = request.data.get('user_id')
        
        if is_admin:
            user_info = UserInfo.objects.filter(user=user_id).first()
            user_upload_sector = UploadedFile.objects.filter(user=user_id).first()
            user_multiple_upload = UploadedMultipleFile.objects.filter(user=user_id).first()
            
            if user_info:
                # Handle image update
                if 'image' in request.data:
                    user_info.image = request.data['image']
                    user_info.save()
                
                # Handle sector update
                if 'sector' in request.data:
                    sector_id = request.data['sector']
                    user_info.sector = sector_id
                    user_info.save()

                    # Update related sector in uploaded files
                    if user_upload_sector:
                        user_upload_sector.sector = sector_id
                        user_upload_sector.save()
                    
                    # Update related uploaded files
                    UploadedMultipleFile.objects.filter(user=user_id).update(sector=sector_id)
                
                # Serialize user info
                serializer = UserInfoSerializer(user_info)

                # Handle uploaded files
                uploaded_files = request.FILES.getlist('uploadedfile1')
                vid_files = request.FILES.getlist('uploadedfile2')
                
                # Get existing sector and address
                upload_sector = UploadedFile.objects.filter(user=user_id).values('sector').first().get('sector')
                upload_address = UploadedFile.objects.filter(user=user_id).values('address').first().get('address')
                upload_coordinates = UploadedFile.objects.filter(user=user_id).values_list('latitude', 'longitude').distinct()
                
                # Delete existing uploaded files
                UploadedFile.objects.filter(user=user_id).delete()
                
                # Handle image uploads
                for uploaded_file in uploaded_files:
                    if not uploaded_file.content_type.startswith('image'):
                        return Response({"error": "Only image files are allowed."}, status=status.HTTP_400_BAD_REQUEST)
                    user_upload = UploadedFile.objects.create(user=User.objects.get(id=user_id))
                    user_upload.sector = upload_sector
                    user_upload.address = upload_address
                    user_upload.file = uploaded_file
                    user_upload.save()
                
                # Handle video uploads
                for vid_file in vid_files:
                    user_upload = UploadedFile.objects.create(user=User.objects.get(id=user_id))
                    user_upload.sector = upload_sector
                    user_upload.address = upload_address
                    user_upload.video_file = vid_file
                    user_upload.save()
                
                # Update latitude and longitude in uploaded files
                uploaded_files = UploadedFile.objects.filter(user=User.objects.get(id=user_id))
                for index, ele in enumerate(upload_coordinates):
                    if index < len(uploaded_files):
                        uploaded_file = uploaded_files[index]
                        uploaded_file.latitude = ele[0]
                        uploaded_file.longitude = ele[1]
                        if ele[1] is not None:
                            uploaded_file.geom = Point(float(ele[1]), float(ele[0]))
                        uploaded_file.save()
                
                return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": "Unauthorized or user not found"}, status=status.HTTP_404_NOT_FOUND)



@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class ChatSessionView(APIView):
    
    def get(self, request):
        """Get all chat sessions for the current user"""
        try:
            sessions = ChatSession.objects.filter(user=request.user).select_related('user')
            
            sessions_data = []
            for session in sessions:
                # Get message count for each session
                message_count = session.messages.count()
                
                sessions_data.append({
                    'id': session.session_id,
                    'title': session.title,
                    'createdAt': session.created_at.isoformat(),
                    'updatedAt': session.updated_at.isoformat(),
                    'messageCount': message_count,
                    'isActive': session.is_active
                })
            
            return JsonResponse({
                'success': True,
                'sessions': sessions_data
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    def post(self, request):
        """Create a new chat session"""
        try:
            print("🔥 RAW request object type:", type(request))
            print("🔥 Available attributes:", dir(request)[:30])  # first 30 attrs
            print("🔥 DATA:", request.data) 
            data = request.data
            session_id = data.get('sessionId')
            title = data.get('title', 'New session')
            
            # Deactivate all other sessions for this user
            ChatSession.objects.filter(user=request.user).update(is_active=False)
            
            # Create new session
            session = ChatSession.objects.create(
                user=request.user,
                session_id=session_id,
                title=title,
                is_active=True
            )
            
            return JsonResponse({
                'success': True,
                'session': {
                    'id': session.session_id,
                    'title': session.title,
                    'createdAt': session.created_at.isoformat(),
                    'updatedAt': session.updated_at.isoformat(),
                    'messageCount': 0,
                    'isActive': True
                }
            })
        except Exception as e:
            import traceback
            print("🔥 ChatSessionView error:", e)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update a chat session (rename or set active)"""
        try:
            data = request.data
            session_id = data.get('sessionId')
            action = data.get('action')  # 'rename' or 'activate'
            
            session = ChatSession.objects.get(
                session_id=session_id, 
                user=request.user
            )
            
            if action == 'rename':
                new_title = data.get('title')
                if new_title:
                    session.title = new_title
                    session.save()
            
            elif action == 'activate':
                # Deactivate all sessions and activate this one
                ChatSession.objects.filter(user=request.user).update(is_active=False)
                session.is_active = True
                session.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Session {action}d successfully'
            })
        except ChatSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Session not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    def delete(self, request):
        """Delete a chat session"""
        try:
            data = request.data
            session_id = data.get('sessionId')
            
            session = ChatSession.objects.get(
                session_id=session_id,
                user=request.user
            )
            session.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Session deleted successfully'
            })
        except ChatSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Session not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
class ChatMessageView(APIView):
    
    def get(self, request, session_id):
        """Get all messages for a specific session"""
        try:
            session = ChatSession.objects.get(
                session_id=session_id,
                user=request.user
            )
            
            messages = session.messages.all()
            messages_data = []
            
            for message in messages:
                messages_data.append({
                    'role': message.role,
                    'content': message.content,
                    'timestamp': message.timestamp.isoformat()
                })
            
            return JsonResponse({
                'success': True,
                'messages': messages_data
            })
        except ChatSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Session not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    def post(self, request, session_id):
        """Add a new message to a session"""
        try:
            print("🔥 RAW request object type:", type(request))
            print("🔥 Available attributes:", dir(request)[:30])  # first 30 attrs
            print("🔥 DATA:", request.data) 
            data = request.data
            role = data.get('role')
            content = data.get('content')
            
            print(f"🔥 MESSAGE DEBUG - Role: {role}, Content: {content[:50]}...")
            
            session = ChatSession.objects.get(
                session_id=session_id,
                user=request.user
            )
            
            print(f"🔥 SESSION DEBUG - Current title: '{session.title}'")
            
            # Check current message counts
            total_messages = session.messages.count()
            user_messages = session.messages.filter(role__iexact='user').count()
            # Also count messages with role 'You' since that's what your frontend sends
            you_messages = session.messages.filter(role__iexact='you').count()
            total_user_messages = user_messages + you_messages
            
            print(f"🔥 MESSAGE COUNT DEBUG - Total: {total_messages}, User messages: {user_messages}, You messages: {you_messages}, Total user messages: {total_user_messages}")
            
            # Check if this is the first user message BEFORE creating the new message
            # Check for both 'user' and 'you' since frontend might send either
            is_first_user_message = (
                role.lower() in ['user', 'you'] and total_user_messages == 0
            )
            
            print(f"🔥 FIRST USER MESSAGE DEBUG - Is first user message: {is_first_user_message}")
            
            # Create the message
            message = ChatMessage.objects.create(
                session=session,
                role=role,
                content=content
            )
            
            print(f"🔥 MESSAGE CREATED - ID: {message.id}")
            
            # Update session's updated_at timestamp
            session.updated_at = timezone.now()
            
            # If this is the first user message, use it as title
            if is_first_user_message:
                # Make title from first 32 characters of content
                title = content.strip()[:32]
                if len(content.strip()) > 32:
                    title += "…"
                new_title = title or "New session"
                print(f"🔥 TITLE UPDATE DEBUG - Old title: '{session.title}', New title: '{new_title}'")
                session.title = new_title
            
            session.save()
            print(f"🔥 SESSION SAVED - Final title: '{session.title}'")
            
            response_data = {
                'success': True,
                'message': {
                    'role': message.role,
                    'content': message.content,
                    'timestamp': message.timestamp.isoformat()
                }
            }
            
            # If this was the first user message, include the updated session title
            if is_first_user_message:
                response_data['sessionUpdated'] = {
                    'title': session.title,
                    'updatedAt': session.updated_at.isoformat()
                }
            
            return JsonResponse(response_data)
        except ChatSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Session not found'
            }, status=404)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)