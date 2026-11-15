import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import Distance
from django.contrib.gis.db.models.functions import Distance as DistanceFunction
from .models import ServiceChatSession, ServiceChatMessage, UploadedMultipleFile, Sector
from .services import OpenAIService, LocationService
from .utils import geocode_address
import uuid
import re

logger = logging.getLogger(__name__)

class ServiceProviderChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        
    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'chat_message':
                await self.handle_chat_message(data)
                print("Handle chat msg fun ended successfully")
            elif message_type == 'location_update':
                await self.handle_location_update(data)
            elif message_type == 'property_type_response':
                print("Handle property type response fun started")
                await self.handle_property_type_response(data)
                
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'An error occurred processing your request.'
            }))

    async def handle_chat_message(self, data):
        session_id = data.get('session_id')
        user_message = data.get('message', '').strip()
        user_location = data.get('location')
        
        if not user_message:
            print("User msg not found")
            return
            
        # Get or create session
        session = await self.get_or_create_session(session_id)
        
        # Save user message
        await self.save_message(session, 'user', user_message)
        
        # Store the original message for later use
        await self.update_session_original_message(session_id, user_message)
        
        # Use GPT to check if this is a service request and match to sectors
        service_match_result = await self.match_service_request_to_sector(user_message)
        
        if service_match_result['is_service_request'] and service_match_result['matched_sector'] != 'no_match':
            matched_sector = service_match_result['matched_sector']
            confidence = service_match_result['confidence']
            
            print(f"Service request matched to sector: {matched_sector} (confidence: {confidence})")
            
            # Extract location from message if provided
            extracted_location = self.extract_location_from_message(user_message)
            
            if extracted_location:
                # User specified a location in the message
                print("Extracted Loc is: ", extracted_location)
                try:
                    coordinates = await self.geocode_location(extracted_location)
                    if coordinates:
                        print("Coordinates of ", extracted_location, " are ", coordinates)
                        await self.update_session_data(session.session_id, coordinates['lat'], coordinates['lng'], matched_sector, matched_sector)
                        await self.ask_property_type(session.session_id)
                    else:
                        await self.send_message(f"I couldn't find the location '{extracted_location}'. Please provide a valid location.")
                except Exception as e:
                    logger.error(f"Error geocoding location: {str(e)}")
                    await self.send_message("Sorry, I had trouble finding that location. Please try again.")
            else:
                # No location in message, use provided location or request it
                if user_location:
                    lat = user_location.get('lat')
                    lng = user_location.get('lng')
                    
                    if lat and lng:
                        await self.update_session_data(session.session_id, lat, lng, matched_sector, matched_sector)
                        await self.ask_property_type(session.session_id)
                    else:
                        await self.request_location()
                else:
                    await self.request_location()
        elif service_match_result['is_service_request'] and service_match_result['matched_sector'] == 'no_match':
            # Service request but no matching sector
            response = f"Sorry, we don't currently offer the service you requested. Here's what our AI understood: {service_match_result.get('reasoning', 'Unable to match to available services')}.\n\nPlease try asking for a different service or contact us if you believe this is an error."
            await self.save_message(session, 'bot', response)
            await self.send_message(response)
        else:
            # Not a service request or low confidence
            response = "Hello! I can help you find service providers. Please tell me what service you need (e.g., 'I want roof reconstruction service in New York')."
            await self.save_message(session, 'bot', response)
            await self.send_message(response)

    # NEW METHOD: Combined service matching and permit retrieval
    async def match_service_and_get_permits_combined(self, user_message, lat, lng, address, property_type):
        """Combined method that does both service matching and permit retrieval in one call"""
        try:
            # Get all available sectors from database
            sectors = await self.get_all_sectors()
            sector_names = [sector['sector_name'] for sector in sectors]
            
            if not sector_names:
                logger.warning("No sectors found in database")
                return {
                    'is_service_request': False,
                    'matched_sector': 'no_match',
                    'confidence': 'low',
                    'reasoning': 'No sectors available in database',
                    'permit_info': None
                }
            
            # Use OpenAI service to match AND get permits
            openai_service = OpenAIService()
            result = await openai_service.match_service_and_get_permits(
                user_message, sector_names, lat, lng, address, property_type
            )
            
            # Validate that matched sector exists in our database
            if result['matched_sector'] != 'no_match':
                sector_exists = await self.check_sector_exists(result['matched_sector'])
                if not sector_exists:
                    logger.warning(f"GPT matched to non-existent sector: {result['matched_sector']}")
                    result['matched_sector'] = 'no_match'
                    result['reasoning'] += ' (Matched sector not found in database)'
                    result['permit_info'] = None
            
            return result
            
        except Exception as e:
            logger.error(f"Error in combined GPT matching: {str(e)}")
            return {
                'is_service_request': False,
                'matched_sector': 'no_match',
                'confidence': 'low',
                'reasoning': f'Error in matching: {str(e)}',
                'permit_info': None
            }

    async def match_service_request_to_sector(self, user_message):
        """Use GPT to match user message to available sectors"""
        try:
            # Get all available sectors from database
            sectors = await self.get_all_sectors()
            sector_names = [sector['sector_name'] for sector in sectors]
            
            if not sector_names:
                logger.warning("No sectors found in database")
                return {
                    'is_service_request': False,
                    'matched_sector': 'no_match',
                    'confidence': 'low',
                    'reasoning': 'No sectors available in database'
                }
            
            # Use OpenAI service to match
            openai_service = OpenAIService()
            result = await openai_service.match_service_to_sector(user_message, sector_names)
            
            # Validate that matched sector exists in our database
            if result['matched_sector'] != 'no_match':
                sector_exists = await self.check_sector_exists(result['matched_sector'])
                if not sector_exists:
                    logger.warning(f"GPT matched to non-existent sector: {result['matched_sector']}")
                    result['matched_sector'] = 'no_match'
                    result['reasoning'] += ' (Matched sector not found in database)'
            
            return result
            
        except Exception as e:
            logger.error(f"Error in GPT sector matching: {str(e)}")
            return {
                'is_service_request': False,
                'matched_sector': 'no_match',
                'confidence': 'low',
                'reasoning': f'Error in sector matching: {str(e)}'
            }

    async def handle_property_type_response(self, data):
        session_id = data.get('session_id')
        property_type = data.get('property_type')
        
        if not session_id or not property_type:
            await self.send_message("Please select a valid property type.")
            return
            
        session = await self.get_session_by_id(session_id)
        if not session:
            await self.send_message("Session not found. Please start a new conversation.")
            return
            
        # Update session with property type
        await self.update_session_property_type(session_id, property_type)
        
        # Get the original user message
        original_message = await self.get_session_original_message(session_id)
        if not original_message:
            await self.send_message("Original message not found. Please start a new conversation.")
            return
        
        # Process with combined call
        await self.process_service_request_with_combined_call(session, property_type, original_message)

    # NEW METHOD: Clean up permit information formatting
    def clean_permit_info(self, permit_info):
        """Clean up permit information to remove unwanted formatting and ensure proper line breaks"""
        if not permit_info:
            return "No permit information available."
        
        # Remove common JSON-like artifacts
        cleaned = permit_info.replace('{"Document Name":', '').replace('"}', '')
        cleaned = cleaned.replace('{', '').replace('}', '')
        cleaned = cleaned.replace('"Document Name":', '')
        cleaned = cleaned.replace('"', '')
        cleaned = cleaned.replace("'", "")
        
        # Handle the specific case where permits are concatenated without proper breaks
        # Look for patterns like "permit: url permit: url" and split them
        import re
        
        # Pattern to find permit entries (permit name followed by : and URL)
        permit_pattern = r'([^:]+):\s*(https?://[^\s]+)'
        matches = re.findall(permit_pattern, cleaned)
        
        if matches:
            # If we found structured permit entries, format them properly
            formatted_permits = []
            for permit_name, url in matches:
                # Clean up the permit name
                permit_name = permit_name.strip()
                # Remove any ** formatting that might be left over
                permit_name = permit_name.replace('*', '').strip()
                # Remove any leading text before the actual permit name
                if 'Service:' in permit_name:
                    permit_name = permit_name.split('Service:')[-1].strip()
                
                formatted_permits.append(f"**{permit_name}**: {url}")
            
            return '\n'.join(formatted_permits)
        else:
            # Fallback: split by common separators and clean up
            # Try to split by URLs to separate different permits
            url_pattern = r'(https?://[^\s]+)'
            parts = re.split(url_pattern, cleaned)
            
            cleaned_lines = []
            current_permit = ""
            
            for i, part in enumerate(parts):
                part = part.strip()
                if not part:
                    continue
                    
                if re.match(r'https?://', part):
                    # This is a URL
                    if current_permit:
                        cleaned_lines.append(f"**{current_permit.strip()}**: {part}")
                        current_permit = ""
                else:
                    # This might be permit name(s)
                    # Handle multiple permit names in one part
                    if current_permit and ':' not in part:
                        # Previous permit name with this URL
                        current_permit += " " + part
                    else:
                        # New permit name
                        if current_permit:
                            cleaned_lines.append(f"**{current_permit.strip()}**")
                        current_permit = part.replace(':', '').strip()
            
            # Handle any remaining permit without URL
            if current_permit:
                cleaned_lines.append(f"**{current_permit.strip()}**")
            
            return '\n'.join(cleaned_lines) if cleaned_lines else cleaned

    # MODIFIED METHOD: Process with single combined call
    async def process_service_request_with_combined_call(self, session, property_type, original_message):
        try:
            # Check if we have all required data
            if not session.user_latitude or not session.user_longitude:
                await self.send_message("Location information is missing. Please provide your location.")
                return
            
            # Get address from coordinates
            location_service = LocationService()
            address = await location_service.get_address_from_coordinates(
                session.user_latitude, 
                session.user_longitude
            )
            
            # Make the combined call to GPT
            combined_result = await self.match_service_and_get_permits_combined(
                original_message,
                session.user_latitude,
                session.user_longitude,
                address,
                property_type
            )
            
            # Verify the sector match is still valid
            if not combined_result['is_service_request'] or combined_result['matched_sector'] == 'no_match':
                await self.send_message("Sorry, I couldn't process your service request. Please try again.")
                return
            
            service_type = combined_result['matched_sector']
            raw_permit_info = combined_result['permit_info'] or "No permit information available."
            
            # Clean up the permit information
            permit_info = self.clean_permit_info(raw_permit_info)
            
            # Find nearby providers by sector
            providers = await self.find_nearby_providers_by_sector(
                session.user_latitude, 
                session.user_longitude, 
                service_type
            )
            
            # Send response with session ID
            await self.send_service_response(providers, permit_info, service_type, session.session_id)
            
        except Exception as e:
            logger.error(f"Error processing service request: {str(e)}")
            await self.send_message("Sorry, I encountered an error while processing your request. Please try again.")

    # NEW HELPER METHODS for storing/retrieving original message
    @database_sync_to_async
    def update_session_original_message(self, session_id, message):
        session = ServiceChatSession.objects.get(session_id=session_id)
        if hasattr(session, 'original_message'):
            session.original_message = message
        session.save()
        return session

    @database_sync_to_async
    def get_session_original_message(self, session_id):
        try:
            session = ServiceChatSession.objects.get(session_id=session_id)
            return getattr(session, 'original_message', None)
        except ServiceChatSession.DoesNotExist:
            return None

    async def handle_location_update(self, data):
        session_id = data.get('session_id')
        location = data.get('location')
        
        if session_id and location:
            await self.update_session_location(session_id, location)

    @database_sync_to_async
    def get_or_create_session(self, session_id):
        if session_id:
            try:
                return ServiceChatSession.objects.get(session_id=session_id)
            except ServiceChatSession.DoesNotExist:
                pass
        
        return ServiceChatSession.objects.create(
            session_id=session_id or str(uuid.uuid4())
        )

    @database_sync_to_async
    def save_message(self, session, role, content, metadata=None):
        return ServiceChatMessage.objects.create(
            session=session,
            role=role,
            content=content,
            metadata=metadata or {}
        )

    @database_sync_to_async
    def update_session_location(self, session_id, location):
        try:
            session = ServiceChatSession.objects.get(session_id=session_id)
            session.user_latitude = location.get('lat')
            session.user_longitude = location.get('lng')
            session.save()
            return session
        except ServiceChatSession.DoesNotExist:
            return None

    @database_sync_to_async
    def get_all_sectors(self):
        """Fetch all sectors from the database"""
        return list(Sector.objects.values('sector_name'))

    @database_sync_to_async
    def check_sector_exists(self, service_type):
        """Check if the service type exists in sectors table"""
        return Sector.objects.filter(sector_name__icontains=service_type).exists()

    def extract_location_from_message(self, message):
        """Extract location from user message using regex patterns"""
        # Common location patterns
        location_patterns = [
            r'\bin\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])',  # "in New York"
            r'\bat\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])',  # "at Boston"
            r'\bnear\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])', # "near Chicago"
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                location = match.group(1).strip().rstrip(',.')
                # Filter out common words that might be matched
                if location.lower() not in ['my', 'the', 'a', 'an', 'home', 'house', 'property']:
                    return location
        
        return None

    @database_sync_to_async
    def geocode_location(self, location):
        """Geocode location using the utility function"""
        try:
            lat, lng = geocode_address(location)
            if lat is not None and lng is not None:
                return {'lat': lat, 'lng': lng}
            return None
        except Exception as e:
            logger.error(f"Geocoding error: {str(e)}")
            return None

    async def ask_property_type(self, session_id):
        print("In ask property type function")
        """Ask user about their property type"""
        property_types = [
            "Residential",
            "Commercial", 
            "Mixed Use",
            "Institutional/Public",
            "Industrial"
        ]
        
        response = "To provide you with accurate permit information, please select your property type:"
        
        await self.send(text_data=json.dumps({
            'type': 'property_type_request',
            'message': response,
            'property_types': property_types,
            'session_id': session_id
        }))
        print("Ask property type ending")

    async def request_location(self):
        await self.send(text_data=json.dumps({
            'type': 'location_request',
            'message': 'I need your location to find nearby service providers. Please allow location access or specify a location in your message.'
        }))

    @database_sync_to_async
    def update_session_data(self, session_id, lat, lng, service_type, sector_name=None):
        session = ServiceChatSession.objects.get(session_id=session_id)
        session.user_latitude = lat
        session.user_longitude = lng
        session.service_type = service_type
        if hasattr(session, 'sector_name'):
            session.sector_name = sector_name
        session.save()
        return session

    @database_sync_to_async
    def update_session_property_type(self, session_id, property_type):
        session = ServiceChatSession.objects.get(session_id=session_id)
        if hasattr(session, 'property_type'):
            session.property_type = property_type
        session.save()
        return session

    @database_sync_to_async
    def find_nearby_providers_by_sector(self, user_lat, user_lng, sector, max_distance_km=500):
        """Find providers by sector first, then by proximity"""
        user_point = Point(float(user_lng), float(user_lat), srid=4326)
        print("User point is: ", user_point)
        # Filter providers by sector name first
        providers = UploadedMultipleFile.objects.filter(
            sector_name__icontains=sector,  # Assuming sector field exists in UploadedFile
            latitude__isnull=False,
            longitude__isnull=False
        ).exclude(
            latitude='',
            longitude=''
        )
        
        # Calculate distances and get nearest 3
        nearby_providers = []
        for provider in providers:
            try:
                provider_lat = float(provider.latitude)
                provider_lng = float(provider.longitude)
                provider_point = Point(provider_lng, provider_lat, srid=4326)
                
                distance = user_point.distance(provider_point) * 111  # Convert to km approximately
                
                if distance <= max_distance_km:
                    nearby_providers.append({
                        'provider': provider,
                        'distance': round(distance, 2)
                    })
                    
            except (ValueError, TypeError):
                continue
        
        # Sort by distance and return top 3
        nearby_providers.sort(key=lambda x: x['distance'])
        return nearby_providers[:3]

    async def process_service_request_with_property_type(self, session, property_type):
        try:
            # Check if we have all required data
            if not session.user_latitude or not session.user_longitude:
                await self.send_message("Location information is missing. Please provide your location.")
                return
            
            service_type = session.service_type
            sector_name = getattr(session, 'sector_name', service_type)
            
            # Find nearby providers by sector
            providers = await self.find_nearby_providers_by_sector(
                session.user_latitude, 
                session.user_longitude, 
                sector_name
            )
            
            # Get permit information with property type
            permit_info = await self.get_permit_information_with_property_type(
                session.user_latitude, 
                session.user_longitude, 
                service_type,
                property_type
            )
            
            # Send response with session ID
            await self.send_service_response(providers, permit_info, service_type, session.session_id)
            
        except Exception as e:
            logger.error(f"Error processing service request: {str(e)}")
            await self.send_message("Sorry, I encountered an error while processing your request. Please try again.")

    async def get_permit_information_with_property_type(self, lat, lng, service_type, property_type):
        try:
            openai_service = OpenAIService()
            location_service = LocationService()
            
            # Get address from coordinates
            address = await location_service.get_address_from_coordinates(lat, lng)
            
            prompt = f"""Give me all (if any) the necessary legal documents (if applicable) and permits (if applicable) 
            required for a {property_type.lower()} owner at {lat}, {lng} ({address}) to start {service_type} service. 
            Respond in the following format. Make sure that the links are valid i.e not giving 404. Just give the base url 
            of the website where the permit is available like https://www.mass.gov/. Do not exceed the url from base url in any case 
            If the service does not require a permit, do not provide any other link just say "No permit is required"
            Document Name: Downloadable link for that document/permit"""
            
            permit_response = await openai_service.get_permit_info(prompt)
            print(permit_response)
            return permit_response
            
        except Exception as e:
            logger.error(f"Error getting permit info: {str(e)}")
            return "Unable to retrieve permit information at this time."
        
    
    @database_sync_to_async
    def format_provider_data(self, providers):
        """Format provider data for response - sync function to access model fields"""
        formatted_providers = []
        for provider_data in providers:
            provider = provider_data['provider']
            distance = provider_data['distance']
            
            formatted_providers.append({
                'email': provider.user.email,
                'distance': distance,
                'address': provider.address,
                'company_name': str(provider)  # This will use the __str__ method
            })
        return formatted_providers

    async def send_service_response(self, providers, permit_info, service_type, session_id):
        print("In send_service_response function")
        
        # Format provider data using sync function
        formatted_providers = await self.format_provider_data(providers) if providers else []
        
        if not providers:
            response = f"I couldn't find any {service_type} service providers near your location. You might want to expand your search radius."
        else:
            response = f"Great! I found {len(providers)} {service_type} service providers near you:\n\n"
            for i, provider_data in enumerate(formatted_providers, 1):
                response += f"{i}. **{provider_data['company_name']}**\n"
                response += f"   - Distance: {provider_data['distance']} km away\n"
                response += f"   - Address: {provider_data['address']}\n"
                response += f"   - Contact: {provider_data['email']}\n\n"
            
        response += f"\n**Permit Information For {service_type.title()} Service:**\n{permit_info}"
        
        # Save bot response
        print("Calling get_session_by_id function")
        session = await self.get_session_by_id(session_id)
        if session:
            await self.save_message(session, 'bot', response, {
                'providers': formatted_providers,
                'permit_info': permit_info
            })
        else:
            print("Session not found, unable to save message")
        
        print("Calling send_message function")
        await self.send_message(response)

    async def send_message(self, message):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    @database_sync_to_async
    def get_session_by_id(self, session_id):
        try:
            return ServiceChatSession.objects.get(session_id=session_id)
        except ServiceChatSession.DoesNotExist:
            return None