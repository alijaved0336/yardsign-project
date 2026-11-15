import random
import string
import os
import environ
import requests
import time
from openai import OpenAI
import re
import json
import logging
import html
from django.core.exceptions import ValidationError
import unicodedata
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from io import BytesIO
from datetime import datetime
import logging


logging.basicConfig(
    level=logging.INFO,  # or DEBUG for more details
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

serp_api_key = os.getenv("SERP_API_KEY") or settings.SERP_API_KEY


# Initialize OpenAI client with API key from .env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_providers_permits_pdf(data):
    """
    Generate a PDF with provider information and permits
    
    Args:
        data: Dictionary containing user_location, property_type, providers, and permits_and_documents
    
    Returns:
        BytesIO object containing the PDF
    """
    try:
        # Create a BytesIO buffer to hold the PDF
        buffer = BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a73e8'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#1a73e8'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        subheading_style = ParagraphStyle(
            'CustomSubHeading',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#333333'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        
        normal_style = styles['Normal']
        
        # Title
        elements.append(Paragraph("Geodaka", title_style))
        elements.append(Paragraph("Service Providers & Required Permits", subheading_style))
        elements.append(Spacer(1, 0.3*inch))
        
        # Date
        date_text = f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        elements.append(Paragraph(date_text, normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Location Information
        elements.append(Paragraph("📍 Your Location", heading_style))
        
        location_data = [
            ['Address:', data['user_location']['address']],
            ['Property Type:', data['property_type']],
            ['Latitude:', str(data['user_location']['latitude'])],
            ['Longitude:', str(data['user_location']['longitude'])]
        ]
        
        location_table = Table(location_data, colWidths=[1.5*inch, 4.5*inch])
        location_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f7ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))
        
        elements.append(location_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Service Providers Section
        providers = data.get('providers', [])
        elements.append(Paragraph(f"🏢 Nearby Service Providers ({len(providers)})", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        if providers:
            for i, provider in enumerate(providers, 1):
                # Provider header
                provider_title = f"{i}. {provider['company_name']}"
                elements.append(Paragraph(provider_title, subheading_style))
                
                # Provider details
                provider_details = [
                    ['Service:', provider.get('category_name', 'N/A')],
                    ['Sector:', provider.get('sector_name', 'N/A')],
                    ['Company:', provider.get('company_name', 'N/A')],
                    ['Distance:', f"{provider.get('distance_km', 0):.2f} km"],
                    ['City:', f"{provider.get('city', 'N/A')}, {provider.get('state', 'N/A')}"],
                    ['Zipcode:', provider.get('zipcode', 'N/A')],
                    ['Address:', provider.get('address', 'N/A')],
                    ['Contact:', provider.get('user_email', 'N/A')],
                    ['Status:', '✅ Active' if provider.get('is_active') else '❌ Inactive']
                ]
                
                provider_table = Table(provider_details, colWidths=[1.5*inch, 4.5*inch])
                provider_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#fafafa')),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#1a73e8'))
                ]))
                
                elements.append(provider_table)
                elements.append(Spacer(1, 0.15*inch))
        else:
            elements.append(Paragraph("No providers found in your area.", normal_style))
            elements.append(Spacer(1, 0.2*inch))
        
        # Page break before permits section
        elements.append(PageBreak())
        
        # Permits and Documents Section
        elements.append(Paragraph("📋 Required Permits & Documents", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        permits_data = data.get('permits_and_documents', {})
        
        if permits_data:
            for service_id, permits in permits_data.items():
                if permits:
                    elements.append(Paragraph(f"Service: {service_id}", subheading_style))
                    
                    # Create permit table
                    permit_rows = [['#', 'Permit/Document', 'Link']]
                    
                    for idx, permit in enumerate(permits, 1):
                        title = permit.get('title', 'N/A')
                        url = permit.get('url', 'N/A')
                        if url and url.startswith('http'):
                            url_display = Paragraph(f'<a href="{url}" color="blue">{url}</a>', normal_style)
                        else:
                            url_display = url if url else 'N/A'
                        
                        permit_rows.append([str(idx), title, url_display])
                    
                    permit_table = Table(permit_rows, colWidths=[0.5*inch, 2.5*inch, 3*inch])
                    permit_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ffc107')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 11),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                        ('TOPPADDING', (0, 0), (-1, -1), 10),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#ffc107')),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fff8e1')])
                    ]))
                    
                    elements.append(permit_table)
                    elements.append(Spacer(1, 0.2*inch))
        else:
            elements.append(Paragraph("No permit information available at this time.", normal_style))
        
        # Footer
        elements.append(Spacer(1, 0.3*inch))
        footer_text = """
        <para align=center>
        <b>Geodaka</b><br/>
        Customer Support Team<br/>
        support@geodaka.com | www.geodaka.com
        </para>
        """
        elements.append(Paragraph(footer_text, normal_style))
        
        # Build PDF
        doc.build(elements)
        
        # Get the value of the BytesIO buffer and return it
        pdf_data = buffer.getvalue()
        buffer.close()
        
        logger.info("PDF generated successfully")
        return pdf_data
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise


def get_required_documents(property_type: str, service: str):
    """
    Ask GPT to provide necessary legal documents and permits
    for a given property type and service in Massachusetts.
    """
    try:
        prompt = (
          f"Give me (if any) necessary legal documents and permits required "
          f"for a {property_type} owner to start {service}. "
          f"Make sure the response is in strict JSON format with this schema:\n\n"
          f"[\n"
          f"  {{\"title\": \"Permit Name\", \"url\": \"https://www.mass.gov/\"}}\n"
          f"]\n\n"
          f"Rules:\n"
          f"- Every 'url' field must be EXACTLY like 'https://www.mass.gov/' (do not add any paths).\n"
          f"- Do not generate any URLs that contain slashes after the domain.\n"
          f"- Only return valid JSON as per the schema.\n"
          f"- Do NOT wrap the JSON in markdown code blocks or any other formatting.\n"
          f"- Return ONLY the raw JSON array, nothing else."
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",   # or gpt-4o
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        content = response.choices[0].message.content.strip()
        
        # Clean markdown code blocks if present
        cleaned_content = content
        
        # Check if response is wrapped in markdown code blocks
        if cleaned_content.startswith('```'):
            logger.warning("GPT returned JSON wrapped in markdown code blocks, cleaning...")
            # Extract content between ``` markers
            # Pattern matches ```json\n[...]\n``` or ```[...]```
            match = re.search(r'```(?:json)?\s*(\[.*?\])\s*```', cleaned_content, re.DOTALL)
            if match:
                cleaned_content = match.group(1).strip()
                logger.info("Successfully removed markdown code blocks")
            else:
                logger.warning("Could not extract JSON from markdown blocks")
        
        try:
            # Try to parse the cleaned JSON
            docs = json.loads(cleaned_content)
            logger.info(f"Successfully parsed {len(docs)} permits for {service}")
            return docs
        except json.JSONDecodeError as e:
            # Fallback: return error message
            logger.warning(f"GPT returned non-JSON response: {cleaned_content}")
            logger.error(f"JSON parse error: {str(e)}")
            return [{
                "title": "Error: Could not parse permits", 
                "url": None,
                "description": "The permit information could not be retrieved. Please try again or contact support."
            }]

    except Exception as e:
        logger.error(f"Error in get_required_documents: {str(e)}")
        return [{
            "title": "Error retrieving permits", 
            "url": None,
            "description": f"Failed to fetch legal documents: {str(e)}"
        }]


# SERP_API_KEY = settings.SERP_API_KEY

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}
last_request_time = None
RATE_LIMIT_DELAY = 0.5

def generate_secure_password(length=8):
    if length < 8:
        raise ValueError("Password length must be at least 8")

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    digits = string.digits
    special_characters = string.punctuation

    password_characters = [
        random.choice(uppercase),
        random.choice(lowercase),
        random.choice(digits),
        random.choice(special_characters),
    ]

    remaining_length = length - len(password_characters)
    all_characters = string.ascii_letters + string.digits + string.punctuation
    password_characters.extend(random.choices(all_characters, k=remaining_length))

    random.shuffle(password_characters)

    return ''.join(password_characters)

def geocode_address(address):
    """
    Geocode an address using the LocationIQ API and return latitude and longitude.
    """
    global last_request_time

    if last_request_time:
        elapsed_time = time.time() - last_request_time
        if elapsed_time < RATE_LIMIT_DELAY:
            time.sleep(RATE_LIMIT_DELAY - elapsed_time)

    base_url = "https://us1.locationiq.com/v1/search.php"
    params = {
        "key": os.getenv('LOCATIONIQ_API_KEY'),
        "q": address,
        "format": "json"
    }
    try:
        response = requests.get(base_url, params=params, timeout=60)
        last_request_time = time.time()
        response.raise_for_status()
        data = response.json()
        if data and isinstance(data, list) and len(data) > 0:
            location = data[0]
            return round(float(location["lat"]), 6), round(float(location["lon"]), 6)
        else:
            print(f"Geocoding failed for address: {address}")
            return None, None
    except requests.exceptions.Timeout:
        print(f"Geocoding timed out for address: {address}")
        return 40.7128, -74.0060  # Default to New York City coordinates
    except Exception as e:
        print(f"Error during geocoding: {str(e)}")
        return 40.7128, -74.0060

def validate_csv_file(file):
    """
    Validate that the uploaded file is a CSV file.
    """
    if not file.name.endswith('.csv'):
        raise ValidationError("Please upload a valid CSV file.")

def decode_csv_file(csv_file):
    """
    Decode the uploaded CSV file.
    """
    return csv_file.read().decode('utf-8').splitlines()


def get_sample_data():
    """Return some sample companies for testing deduplication or CSV output."""
    return [
        {
            "Company Name": "Stump Grinding",
            "Company Website": "",
            "Company Address": "8 Elliott Rd, Westford, MA 01886",
            "Company Phone": "(978) 692-2284",
            "Company Email": "",
            "Contact Name": "",
        },
        {
            "Company Name": "Grin & Grind Stump Removal",
            "Company Website": "www.grinandgrindstump.com",
            "Company Address": "522 Grove St, Worcester, MA 01605",
            "Company Phone": "(508) 618-1000",
            "Company Email": "",
            "Contact Name": "",
        },
        {
            "Company Name": "Stump Grinding",
            "Company Website": "",
            "Company Address": "8 Elliott Rd, Westford, MA 01886",
            "Company Phone": "(978) 692-2284",
            "Company Email": "",
            "Contact Name": "",
        },
        {
            "Company Name": "Down to Earth Stump Grinding",
            "Company Website": "www.downtoearthstump.com",
            "Company Address": "1865 Monterey Rd, Otis, MA 01253",
            "Company Phone": "(413) 329-8174",
            "Company Email": "down2earthstump@gmail.com",
            "Contact Name": "",
        },
        {
            "Company Name": "Grin & Grind Stump Removal",
            "Company Website": "www.grinandgrindstump.com",
            "Company Address": "522 Grove St, Worcester, MA 01605",
            "Company Phone": "(508) 618-1000",
            "Company Email": "",
            "Contact Name": "",
        },
    ]


def clean_company_name(name):
    """Normalize and clean company names for consistent deduplication."""
    if not name:
        return ""
    name = html.unescape(name)
    name = unicodedata.normalize("NFKD", name)
    name = name.lower().strip()
    name = name.replace("&", "and")
    name = re.sub(r'[^\x00-\x7F]+', '', name)  # remove non-ascii
    name = re.sub(r'\s+', ' ', name)  # collapse multiple spaces
    name = re.sub(r'[,.\'"]', '', name)  # remove punctuation
    name = re.sub(r'\b(inc|llc|co|corp|corporation|company)\b', '', name)
    name = name.strip()
    return name


def clean_address(address):
    """Normalize and clean addresses for consistent deduplication."""
    if not address:
        return ""
    address = address.lower().strip()
    address = re.sub(r'\s+', ' ', address)
    address = re.sub(r'[.,]', '', address)
    address = address.replace("massachusetts", "ma")
    address = re.sub(r'\b(united states|usa)\b', '', address)
    address = address.strip()
    return address


def normalize_website(url):
    """Standardize website URLs to comparable domains."""
    if not url:
        return None
    parsed = urlparse(url)
    domain = parsed.netloc or parsed.path
    domain = domain.lower().strip()
    domain = domain.replace("https://", "").replace("http://", "")
    domain = domain.rstrip("/")
    if not domain.startswith("www."):
        domain = "www." + domain
    return domain


def extract_email_and_contact(website_url):
    try:
        response = requests.get("http://" + website_url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        email = None

        for a in soup.select('a[href^=mailto]'):
            email_candidate = a.get('href').replace('mailto:', '').split('?')[0]
            if re.match(r"[^@]+@[^@]+\.[^@]+", email_candidate):
                email = email_candidate
                break

        if not email:
            footer = soup.find("footer")
            if footer:
                text = footer.get_text(separator=' ', strip=True)
                emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
                if emails:
                    email = emails[0]

        if not email:
            all_text = soup.get_text(separator=' ', strip=True)
            emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", all_text)
            if emails:
                email = emails[0]

        contact_name = None
        for tag in soup.find_all(["p", "span", "li", "div", "footer"], string=re.compile(r"(Director|CEO)", re.I)):
            line = tag.get_text(strip=True)
            match = re.search(r"(Director|CEO)[:\-]?\s*(.*)", line, re.I)
            if match and match.group(2) and len(match.group(2).split()) <= 4:
                contact_name = match.group(2).strip()
                break

        return email, contact_name

    except Exception:
        return None, None

last_request_time = None
RATE_LIMIT_DELAY = 1.5


def query_google_maps(search_query, count, lat, lon):
    """
    Improved Google Maps scraper using SerpApi.
    - Cleans and deduplicates results by name + address + website.
    - Normalizes name/address before comparison.
    - Handles overlapping pages from SerpApi.
    """
    if not serp_api_key:
        logger.warning("SERP_API_KEY not found! Make sure it's set.")
    else:
        os.environ["SERP_API_KEY"] = serp_api_key
        logger.info("SERP_API_KEY loaded successfully.")

    print(f"Searching for: {search_query}")
    print(f"Target count: {'unlimited' if count is None else count}")

    results = []
    seen_name_address = set()
    seen_domains = set()
    seen_names = set()
    start = 0
    page = 1
    total_clean_time = 0
    ll_param = f"@{lat},{lon},12z"

    # Extract keywords for filtering
    service_words = re.findall(r"[A-Za-z]+", search_query.lower())
    stop_words = {
        "service", "services", "company", "companies", "contractor", "contractors",
        "massachusetts", "boston", "near", "best", "local", "area", "based",
        "cleaning", "inc", "llc", "the", "and", "in", "of", "for"
    }
    sector_keywords = {w for w in service_words if len(w) > 3 and w not in stop_words}
    print(f"Filtering results using keywords: {sector_keywords}")

    serpapi_url = os.getenv("SERPAPI_URL")

    while True:
        if count is not None and len(results) >= count:
            break

        print(f"\nScraping page {page}...")

        params = {
            "engine": "google_maps",
            "type": "search",
            "q": search_query,
            "api_key": serp_api_key,
            "ll": ll_param,
        }
        if start > 0:
            params["start"] = start

        response = requests.get(serpapi_url, params=params)
        if response.status_code != 200:
            print(f"API Error on page {page}: {response.status_code}")
            break

        data = response.json()
        local_results = data.get("local_results", [])
        if not local_results:
            print(f"No more results found on page {page}. Stopping.")
            break

        page_results = 0

        for entry in local_results:
            name = entry.get("title")
            raw_website = entry.get("website")
            address = entry.get("address")

            if not name or not address or not raw_website:
                continue

            # Keyword filter
            if sector_keywords and not any(k in name.lower() for k in sector_keywords):
                continue

            cleaning_start = time.time()
            cleaned_name = clean_company_name(name)
            cleaned_address = clean_address(address)
            website = normalize_website(raw_website) if raw_website else None
            cleaning_end = time.time()
            total_clean_time += cleaning_end - cleaning_start

            # Deduplication
            key = (cleaned_name, cleaned_address)
            if key in seen_name_address:
                continue

            seen_name_address.add(key)

            # Optional: email/contact scraping
            email, contact_name = extract_email_and_contact(website)

            results.append({
                "Company Name": cleaned_name.title(),
                "Company Website": website,
                "Company Address": address,
                "Company Phone": entry.get("phone"),
                "Company Email": email,
                "Contact Name": contact_name,
            })

            page_results += 1
            if count is not None and len(results) >= count:
                break

        print(f"Page {page}: Found {page_results} new unique companies. Total: {len(results)}")

        if page_results == 0:
            print("No new relevant companies found. Stopping.")
            break

        start += 20
        page += 1
        if page > 50:
            print("Reached maximum page limit (50). Stopping.")
            break
        
    # --- Add sample data for testing ---
    
    # sample_data = get_sample_data()
    # print(f"\n📦 Appending {len(sample_data)} sample companies for testing...")
    # results.append(sample_data)


    # Final deduplication (safety pass)
    unique = []
    seen_final = set()
    for r in results:
        key = (r["Company Name"], r["Company Address"])
        if key not in seen_final:
            unique.append(r)
            seen_final.add(key)

    print(f"\n✅ Scraping completed.")
    print(f"Total unique companies: {len(unique)}")
    print(f"Cleaning took {total_clean_time:.2f} seconds")
    return unique

locations_list = {
  "Abington": [
    "Abington",
    42.104823,
    -70.945322
  ],
  "Acton": [
    "Acton",
    42.485093,
    -71.43284
  ],
  "Acushnet": [
    "Acushnet",
    41.680659,
    -70.907816
  ],
  "Adams": [
    "Adams",
    42.620943,
    -73.120413
  ],
  "Agawam": [
    "Agawam",
    42.068862,
    -72.61516
  ],
  "Alford": [
    "Alford",
    42.235937,
    -73.413462
  ],
  "Amesbury": [
    "Amesbury",
    42.857954,
    -70.930092
  ],
  "Amherst": [
    "Amherst",
    42.373195,
    -72.519876
  ],
  "Andover": [
    "Andover",
    42.65717,
    -71.140878
  ],
  "Arlington": [
    "Arlington",
    42.415374,
    -71.156443
  ],
  "Ashburnham": [
    "Ashburnham",
    42.635765,
    -71.90868
  ],
  "Ashby": [
    "Ashby",
    42.677672,
    -71.819828
  ],
  "Ashfield": [
    "Ashfield",
    42.52604,
    -72.790915
  ],
  "Ashland": [
    "Ashland",
    42.260661,
    -71.464134
  ],
  "Athol": [
    "Athol",
    42.594001,
    -72.226814
  ],
  "Attleboro": [
    "Attleboro",
    41.94397,
    -71.28043
  ],
  "Auburn": [
    "Auburn",
    42.194547,
    -71.835809
  ],
  "Avon": [
    "Avon",
    42.132622,
    -71.040126
  ],
  "Ayer": [
    "Ayer",
    42.559581,
    -71.588256
  ],
  "Barnstable": [
    "Barnstable",
    41.701694,
    -70.303616
  ],
  "Barre": [
    "Barre",
    42.422801,
    -72.105159
  ],
  "Becket": [
    "Becket",
    42.332373,
    -73.083763
  ],
  "Bedford": [
    "Bedford",
    42.49173,
    -71.281795
  ],
  "Belchertown": [
    "Belchertown",
    42.277273,
    -72.400797
  ],
  "Bellingham": [
    "Bellingham",
    42.086949,
    -71.474644
  ],
  "Belmont": [
    "Belmont",
    42.39593,
    -71.178665
  ],
  "Berkley": [
    "Berkley",
    41.845935,
    -71.082822
  ],
  "Berlin": [
    "Berlin",
    42.381366,
    -71.637264
  ],
  "Bernardston": [
    "Bernardston",
    42.67076,
    -72.547474
  ],
  "Beverly": [
    "Beverly",
    42.548974,
    -70.878188
  ],
  "Billerica": [
    "Billerica",
    42.558426,
    -71.268947
  ],
  "Blackstone": [
    "Blackstone",
    42.017835,
    -71.541113
  ],
  "Blandford": [
    "Blandford",
    42.180758,
    -72.927816
  ],
  "Bolton": [
    "Bolton",
    42.434234,
    -71.609774
  ],
  "Boston": [
    "Boston",
    42.355433,
    -71.060511
  ],
  "Bourne": [
    "Bourne",
    41.741217,
    -70.59892
  ],
  "Boxborough": [
    "Boxborough",
    42.482751,
    -71.514273
  ],
  "Boxford": [
    "Boxford",
    42.662576,
    -70.997746
  ],
  "Boylston": [
    "Boylston",
    42.353279,
    -71.734358
  ],
  "Braintree": [
    "Braintree",
    42.220596,
    -71.004123
  ],
  "Brewster": [
    "Brewster",
    41.760109,
    -70.082796
  ],
  "Bridgewater": [
    "Bridgewater",
    41.990221,
    -70.975443
  ],
  "Brimfield": [
    "Brimfield",
    42.122403,
    -72.200311
  ],
  "Brockton": [
    "Brockton",
    42.083433,
    -71.018379
  ],
  "Brookfield": [
    "Brookfield",
    42.216056,
    -72.102181
  ],
  "Brookline": [
    "Brookline",
    42.332902,
    -71.118742
  ],
  "Buckland": [
    "Buckland",
    42.592252,
    -72.791299
  ],
  "Burlington": [
    "Burlington",
    42.504817,
    -71.195611
  ],
  "Cambridge": [
    "Cambridge",
    42.365635,
    -71.104002
  ],
  "Canton": [
    "Canton",
    42.158432,
    -71.144773
  ],
  "Carlisle": [
    "Carlisle",
    42.52926,
    -71.349503
  ],
  "Carver": [
    "Carver",
    41.883436,
    -70.762538
  ],
  "Charlemont": [
    "Charlemont",
    42.627535,
    -72.874488
  ],
  "Charlton": [
    "Charlton",
    42.134081,
    -71.969808
  ],
  "Chatham": [
    "Chatham",
    41.682056,
    -69.959738
  ],
  "Chelmsford": [
    "Chelmsford",
    42.596862,
    -71.35176
  ],
  "Chelsea": [
    "Chelsea",
    42.391224,
    -71.03693
  ],
  "Cheshire": [
    "Cheshire",
    42.562186,
    -73.161596
  ],
  "Chester": [
    "Chester",
    42.279128,
    -72.980128
  ],
  "Chesterfield": [
    "Chesterfield",
    42.391971,
    -72.840923
  ],
  "Chicopee": [
    "Chicopee",
    42.148769,
    -72.607112
  ],
  "Chilmark": [
    "Chilmark",
    41.343056,
    -70.744023
  ],
  "Clarksburg": [
    "Clarksburg",
    42.726592,
    -73.105681
  ],
  "Clinton": [
    "Clinton",
    42.421246,
    -71.68741
  ],
  "Cohasset": [
    "Cohasset",
    42.240973,
    -70.803594
  ],
  "Colrain": [
    "Colrain",
    42.67283,
    -72.697183
  ],
  "Concord": [
    "Concord",
    42.460519,
    -71.348896
  ],
  "Conway": [
    "Conway",
    42.507856,
    -72.696159
  ],
  "Cummington": [
    "Cummington",
    42.462817,
    -72.896463
  ],
  "Dalton": [
    "Dalton",
    42.474171,
    -73.15997
  ],
  "Danvers": [
    "Danvers",
    42.566751,
    -70.936831
  ],
  "Dartmouth": [
    "Dartmouth",
    41.633227,
    -70.987993
  ],
  "Dedham": [
    "Dedham",
    42.248914,
    -71.175573
  ],
  "Deerfield": [
    "Deerfield",
    42.54426,
    -72.604477
  ],
  "Dennis": [
    "Dennis",
    41.735387,
    -70.193909
  ],
  "Dighton": [
    "Dighton",
    41.81449,
    -71.119615
  ],
  "Douglas": [
    "Douglas",
    42.053595,
    -71.73916
  ],
  "Dover": [
    "Dover",
    42.245247,
    -71.282359
  ],
  "Dracut": [
    "Dracut",
    42.668817,
    -71.303366
  ],
  "Dudley": [
    "Dudley",
    42.048225,
    -71.890104
  ],
  "Dunstable": [
    "Dunstable",
    42.674585,
    -71.481899
  ],
  "Duxbury": [
    "Duxbury",
    42.04177,
    -70.672259
  ],
  "East Bridgewater": [
    "East Bridgewater",
    42.033434,
    -70.95921
  ],
  "East Brookfield": [
    "East Brookfield",
    42.226196,
    -72.049816
  ],
  "East Longmeadow": [
    "East Longmeadow",
    42.064906,
    -72.51293
  ],
  "Eastham": [
    "Eastham",
    41.830108,
    -69.973907
  ],
  "Easthampton": [
    "Easthampton",
    42.27088,
    -72.671958
  ],
  "Easton": [
    "Easton",
    42.024544,
    -71.128659
  ],
  "Edgartown": [
    "Edgartown",
    41.38942,
    -70.512968
  ],
  "Egremont": [
    "Egremont",
    42.167127,
    -73.44395
  ],
  "Erving": [
    "Erving",
    42.599976,
    -72.400287
  ],
  "Essex": [
    "Essex",
    42.632039,
    -70.782826
  ],
  "Everett": [
    "Everett",
    42.40843,
    -71.053663
  ],
  "Fairhaven": [
    "Fairhaven",
    41.637604,
    -70.903649
  ],
  "Fall River": [
    "Fall River",
    41.701064,
    -71.154637
  ],
  "Falmouth": [
    "Falmouth",
    41.551498,
    -70.614752
  ],
  "Fitchburg": [
    "Fitchburg",
    42.585437,
    -71.804602
  ],
  "Florida": [
    "Florida",
    42.695046,
    -73.034628
  ],
  "Foxborough": [
    "Foxborough",
    42.065377,
    -71.247831
  ],
  "Framingham": [
    "Framingham",
    42.277318,
    -71.41659
  ],
  "Franklin": [
    "Franklin",
    42.589621,
    -72.611064
  ],
  "Freetown": [
    "Freetown",
    41.795026,
    -71.067639
  ],
  "Gardner": [
    "Gardner",
    42.576352,
    -71.995274
  ],
  "Aquinnah": [
    "Aquinnah",
    41.343148,
    -70.813679
  ],
  "Georgetown": [
    "Georgetown",
    42.724563,
    -70.991968
  ],
  "Gill": [
    "Gill",
    42.641197,
    -72.499342
  ],
  "Gloucester": [
    "Gloucester",
    42.615359,
    -70.662461
  ],
  "Goshen": [
    "Goshen",
    42.441747,
    -72.800037
  ],
  "Gosnold": [
    "Gosnold",
    41.42114,
    -70.92879
  ],
  "Grafton": [
    "Grafton",
    42.20634,
    -71.685388
  ],
  "Granby": [
    "Granby",
    42.257017,
    -72.516477
  ],
  "Granville": [
    "Granville",
    42.067095,
    -72.861165
  ],
  "Great Barrington": [
    "Great Barrington",
    42.193936,
    -73.362773
  ],
  "Greenfield": [
    "Greenfield",
    42.587634,
    -72.600207
  ],
  "Groton": [
    "Groton",
    42.611224,
    -71.57454
  ],
  "Groveland": [
    "Groveland",
    42.75988,
    -71.031821
  ],
  "Hadley": [
    "Hadley",
    42.342415,
    -72.589211
  ],
  "Halifax": [
    "Halifax",
    41.990955,
    -70.862022
  ],
  "Hamilton": [
    "Hamilton",
    42.636205,
    -70.843105
  ],
  "Hampden": [
    "Hampden",
    42.128532,
    -72.606344
  ],
  "Hancock": [
    "Hancock",
    42.543185,
    -73.318461
  ],
  "Hanover": [
    "Hanover",
    42.113157,
    -70.811986
  ],
  "Hanson": [
    "Hanson",
    42.075101,
    -70.880042
  ],
  "Hardwick": [
    "Hardwick",
    42.349309,
    -72.199278
  ],
  "Harvard": [
    "Harvard",
    42.501419,
    -71.584582
  ],
  "Harwich": [
    "Harwich",
    41.686222,
    -70.075851
  ],
  "Hatfield": [
    "Hatfield",
    42.373209,
    -72.596091
  ],
  "Haverhill": [
    "Haverhill",
    42.777783,
    -71.076772
  ],
  "Heath": [
    "Heath",
    42.673678,
    -72.822271
  ],
  "Hingham": [
    "Hingham",
    42.241767,
    -70.889768
  ],
  "Hinsdale": [
    "Hinsdale",
    42.438857,
    -73.125151
  ],
  "Holbrook": [
    "Holbrook",
    42.155223,
    -71.008958
  ],
  "Holden": [
    "Holden",
    42.356084,
    -71.862355
  ],
  "Holland": [
    "Holland",
    42.065824,
    -72.160773
  ],
  "Holliston": [
    "Holliston",
    42.200097,
    -71.424505
  ],
  "Holyoke": [
    "Holyoke",
    42.207118,
    -72.607585
  ],
  "Hopedale": [
    "Hopedale",
    42.130077,
    -71.540622
  ],
  "Hopkinton": [
    "Hopkinton",
    42.228887,
    -71.519644
  ],
  "Hubbardston": [
    "Hubbardston",
    42.476565,
    -72.00872
  ],
  "Hudson": [
    "Hudson",
    42.39135,
    -71.56769
  ],
  "Hull": [
    "Hull",
    42.302044,
    -70.907824
  ],
  "Huntington": [
    "Huntington",
    42.234393,
    -72.879901
  ],
  "Ipswich": [
    "Ipswich",
    42.679273,
    -70.841158
  ],
  "Kingston": [
    "Kingston",
    41.994547,
    -70.724482
  ],
  "Lakeville": [
    "Lakeville",
    41.845935,
    -70.949485
  ],
  "Lancaster": [
    "Lancaster",
    42.456977,
    -71.673125
  ],
  "Lanesborough": [
    "Lanesborough",
    42.519022,
    -73.227784
  ],
  "Lawrence": [
    "Lawrence",
    42.707035,
    -71.163114
  ],
  "Lee": [
    "Lee",
    42.307348,
    -73.250491
  ],
  "Leicester": [
    "Leicester",
    42.2459,
    -71.908151
  ],
  "Lenox": [
    "Lenox",
    42.356822,
    -73.285085
  ],
  "Leominster": [
    "Leominster",
    42.526744,
    -71.761489
  ],
  "Leverett": [
    "Leverett",
    42.451443,
    -72.501253
  ],
  "Lexington": [
    "Lexington",
    42.447317,
    -71.2245
  ],
  "Leyden": [
    "Leyden",
    42.70174,
    -72.630534
  ],
  "Lincoln": [
    "Lincoln",
    42.425928,
    -71.303947
  ],
  "Littleton": [
    "Littleton",
    42.537592,
    -71.51201
  ],
  "Longmeadow": [
    "Longmeadow",
    42.05045,
    -72.582464
  ],
  "Lowell": [
    "Lowell",
    42.641444,
    -71.308533
  ],
  "Ludlow": [
    "Ludlow",
    42.158998,
    -72.480326
  ],
  "Lunenburg": [
    "Lunenburg",
    42.595089,
    -71.724481
  ],
  "Lynn": [
    "Lynn",
    42.466763,
    -70.949494
  ],
  "Lynnfield": [
    "Lynnfield",
    42.538984,
    -71.048108
  ],
  "Malden": [
    "Malden",
    42.426848,
    -71.068374
  ],
  "Manchester-by-the-Sea": [
    "Manchester-by-the-Sea",
    42.577873,
    -70.768935
  ],
  "Mansfield": [
    "Mansfield",
    42.033433,
    -71.218941
  ],
  "Marblehead": [
    "Marblehead",
    42.500096,
    -70.857825
  ],
  "Marion": [
    "Marion",
    41.700104,
    -70.762813
  ],
  "Marlborough": [
    "Marlborough",
    42.345927,
    -71.552287
  ],
  "Marshfield": [
    "Marshfield",
    42.091769,
    -70.705594
  ],
  "Mashpee": [
    "Mashpee",
    41.648442,
    -70.481138
  ],
  "Mattapoisett": [
    "Mattapoisett",
    41.658047,
    -70.813519
  ],
  "Maynard": [
    "Maynard",
    42.432106,
    -71.453968
  ],
  "Medfield": [
    "Medfield",
    42.186561,
    -71.30546
  ],
  "Medford": [
    "Medford",
    42.41843,
    -71.106164
  ],
  "Medway": [
    "Medway",
    42.141764,
    -71.396726
  ],
  "Melrose": [
    "Melrose",
    42.456432,
    -71.064182
  ],
  "Mendon": [
    "Mendon",
    42.107571,
    -71.55352
  ],
  "Merrimac": [
    "Merrimac",
    42.833678,
    -71.002428
  ],
  "Methuen": [
    "Methuen",
    42.726202,
    -71.190892
  ],
  "Middleborough": [
    "Middleborough",
    41.893158,
    -70.911152
  ],
  "Middlefield": [
    "Middlefield",
    42.348865,
    -73.015305
  ],
  "Middleton": [
    "Middleton",
    42.595101,
    -71.015915
  ],
  "Milford": [
    "Milford",
    42.142891,
    -71.516462
  ],
  "Millbury": [
    "Millbury",
    42.191382,
    -71.760393
  ],
  "Millis": [
    "Millis",
    42.167496,
    -71.357221
  ],
  "Millville": [
    "Millville",
    42.027891,
    -71.58071
  ],
  "Milton": [
    "Milton",
    42.250143,
    -71.065573
  ],
  "Monroe": [
    "Monroe",
    42.721536,
    -72.941284
  ],
  "Monson": [
    "Monson",
    42.103088,
    -72.31894
  ],
  "Montague": [
    "Montague",
    42.535643,
    -72.535088
  ],
  "Monterey": [
    "Monterey",
    42.179389,
    -73.212187
  ],
  "Montgomery": [
    "Montgomery",
    42.207234,
    -72.804538
  ],
  "Mount Washington": [
    "Mount Washington",
    42.099591,
    -73.45405
  ],
  "Nahant": [
    "Nahant",
    42.426486,
    -70.918937
  ],
  "Nantucket": [
    "Nantucket",
    41.315731,
    -70.009014
  ],
  "Natick": [
    "Natick",
    42.283639,
    -71.346996
  ],
  "Needham": [
    "Needham",
    42.280265,
    -71.236062
  ],
  "New Ashford": [
    "New Ashford",
    42.604877,
    -73.2394
  ],
  "New Bedford": [
    "New Bedford",
    41.636215,
    -70.934205
  ],
  "New Braintree": [
    "New Braintree",
    42.316639,
    -72.126544
  ],
  "New Marlborough": [
    "New Marlborough",
    42.122434,
    -73.230894
  ],
  "New Salem": [
    "New Salem",
    42.503559,
    -72.332485
  ],
  "Newbury": [
    "Newbury",
    42.766497,
    -70.845802
  ],
  "Newburyport": [
    "Newburyport",
    42.813285,
    -70.881919
  ],
  "Newton": [
    "Newton",
    42.337041,
    -71.209221
  ],
  "Norfolk": [
    "Norfolk",
    42.153861,
    -71.182801
  ],
  "North Adams": [
    "North Adams",
    42.699035,
    -73.1119
  ],
  "North Andover": [
    "North Andover",
    42.683989,
    -71.112707
  ],
  "North Attleborough": [
    "North Attleborough",
    41.984133,
    -71.33228
  ],
  "North Brookfield": [
    "North Brookfield",
    42.268632,
    -72.085024
  ],
  "North Reading": [
    "North Reading",
    42.575094,
    -71.078665
  ],
  "Northampton": [
    "Northampton",
    42.317899,
    -72.631101
  ],
  "Northborough": [
    "Northborough",
    42.319601,
    -71.642241
  ],
  "Northbridge": [
    "Northbridge",
    42.154464,
    -71.651881
  ],
  "Northfield": [
    "Northfield",
    42.69439,
    -72.455851
  ],
  "Norton": [
    "Norton",
    41.966767,
    -71.186994
  ],
  "Norwell": [
    "Norwell",
    42.161768,
    -70.793931
  ],
  "Norwood": [
    "Norwood",
    42.194543,
    -71.199498
  ],
  "Oak Bluffs": [
    "Oak Bluffs",
    41.453622,
    -70.568434
  ],
  "Oakham": [
    "Oakham",
    42.354851,
    -72.043466
  ],
  "Orange": [
    "Orange",
    42.590866,
    -72.309777
  ],
  "Orleans": [
    "Orleans",
    41.789831,
    -69.98974
  ],
  "Otis": [
    "Otis",
    42.194091,
    -73.092737
  ],
  "Oxford": [
    "Oxford",
    42.117016,
    -71.864439
  ],
  "Palmer": [
    "Palmer",
    42.157449,
    -72.329978
  ],
  "Paxton": [
    "Paxton",
    42.311472,
    -71.927477
  ],
  "Peabody": [
    "Peabody",
    42.527873,
    -70.928661
  ],
  "Pelham": [
    "Pelham",
    42.392417,
    -72.403471
  ],
  "Pembroke": [
    "Pembroke",
    42.071491,
    -70.809207
  ],
  "Pepperell": [
    "Pepperell",
    42.664997,
    -71.578595
  ],
  "Peru": [
    "Peru",
    42.43784,
    -73.046118
  ],
  "Petersham": [
    "Petersham",
    42.488368,
    -72.186559
  ],
  "Phillipston": [
    "Phillipston",
    42.549399,
    -72.132998
  ],
  "Pittsfield": [
    "Pittsfield",
    42.448478,
    -73.254107
  ],
  "Plainfield": [
    "Plainfield",
    42.515893,
    -72.916207
  ],
  "Plainville": [
    "Plainville",
    42.003993,
    -71.335666
  ],
  "Plymouth": [
    "Plymouth",
    41.95838,
    -70.667385
  ],
  "Plympton": [
    "Plympton",
    41.95288,
    -70.814484
  ],
  "Princeton": [
    "Princeton",
    42.448411,
    -71.876808
  ],
  "Provincetown": [
    "Provincetown",
    42.052561,
    -70.185864
  ],
  "Quincy": [
    "Quincy",
    42.250991,
    -71.003737
  ],
  "Randolph": [
    "Randolph",
    42.162602,
    -71.041339
  ],
  "Raynham": [
    "Raynham",
    41.948712,
    -71.073101
  ],
  "Reading": [
    "Reading",
    42.52603,
    -71.102026
  ],
  "Rehoboth": [
    "Rehoboth",
    41.840379,
    -71.249494
  ],
  "Revere": [
    "Revere",
    42.40843,
    -71.011995
  ],
  "Richmond": [
    "Richmond",
    42.372338,
    -73.367806
  ],
  "Rochester": [
    "Rochester",
    41.731725,
    -70.820299
  ],
  "Rockland": [
    "Rockland",
    42.130656,
    -70.916155
  ],
  "Rockport": [
    "Rockport",
    42.655651,
    -70.620322
  ],
  "Rowe": [
    "Rowe",
    42.695238,
    -72.89848
  ],
  "Rowley": [
    "Rowley",
    42.713698,
    -70.881836
  ],
  "Royalston": [
    "Royalston",
    42.676209,
    -72.187871
  ],
  "Russell": [
    "Russell",
    42.189785,
    -72.855911
  ],
  "Rutland": [
    "Rutland",
    42.376772,
    -71.954385
  ],
  "Salem": [
    "Salem",
    42.519529,
    -70.896723
  ],
  "Salisbury": [
    "Salisbury",
    42.841758,
    -70.860608
  ],
  "Sandisfield": [
    "Sandisfield",
    42.111557,
    -73.139966
  ],
  "Sandwich": [
    "Sandwich",
    41.757904,
    -70.496815
  ],
  "Saugus": [
    "Saugus",
    42.464818,
    -71.010051
  ],
  "Savoy": [
    "Savoy",
    42.569054,
    -73.0391
  ],
  "Scituate": [
    "Scituate",
    42.192449,
    -70.726197
  ],
  "Seekonk": [
    "Seekonk",
    41.808434,
    -71.336997
  ],
  "Sharon": [
    "Sharon",
    42.123733,
    -71.178728
  ],
  "Sheffield": [
    "Sheffield",
    42.110474,
    -73.353336
  ],
  "Shelburne": [
    "Shelburne",
    42.590755,
    -72.687523
  ],
  "Sherborn": [
    "Sherborn",
    42.239784,
    -71.370142
  ],
  "Shirley": [
    "Shirley",
    42.543805,
    -71.649797
  ],
  "Shrewsbury": [
    "Shrewsbury",
    42.296019,
    -71.71351
  ],
  "Shutesbury": [
    "Shutesbury",
    42.452152,
    -72.409797
  ],
  "Somerset": [
    "Somerset",
    41.769546,
    -71.128656
  ],
  "Somerville": [
    "Somerville",
    42.387597,
    -71.099497
  ],
  "South Hadley": [
    "South Hadley",
    42.259139,
    -72.575134
  ],
  "Southampton": [
    "Southampton",
    42.22942,
    -72.729626
  ],
  "Southborough": [
    "Southborough",
    42.30565,
    -71.524509
  ],
  "Southbridge": [
    "Southbridge",
    42.075191,
    -72.033194
  ],
  "Southwick": [
    "Southwick",
    42.054817,
    -72.770394
  ],
  "Spencer": [
    "Spencer",
    42.243632,
    -71.993488
  ],
  "Springfield": [
    "Springfield",
    42.101876,
    -72.588673
  ],
  "Sterling": [
    "Sterling",
    42.437441,
    -71.760187
  ],
  "Stockbridge": [
    "Stockbridge",
    42.282398,
    -73.312368
  ],
  "Stoneham": [
    "Stoneham",
    42.480263,
    -71.099358
  ],
  "Stoughton": [
    "Stoughton",
    42.125208,
    -71.102202
  ],
  "Stow": [
    "Stow",
    42.436595,
    -71.505001
  ],
  "Sturbridge": [
    "Sturbridge",
    42.108201,
    -72.081058
  ],
  "Sudbury": [
    "Sudbury",
    42.383428,
    -71.416173
  ],
  "Sunderland": [
    "Sunderland",
    42.463692,
    -72.580564
  ],
  "Sutton": [
    "Sutton",
    42.149928,
    -71.762966
  ],
  "Swampscott": [
    "Swampscott",
    42.469924,
    -70.917151
  ],
  "Swansea": [
    "Swansea",
    41.748157,
    -71.189768
  ],
  "Taunton": [
    "Taunton",
    41.901926,
    -71.093148
  ],
  "Templeton": [
    "Templeton",
    42.555755,
    -72.067708
  ],
  "Tewksbury": [
    "Tewksbury",
    42.610648,
    -71.234225
  ],
  "Tisbury": [
    "Tisbury",
    41.457622,
    -70.615697
  ],
  "Tolland": [
    "Tolland",
    42.081525,
    -73.012309
  ],
  "Topsfield": [
    "Topsfield",
    42.639084,
    -70.950747
  ],
  "Townsend": [
    "Townsend",
    42.667294,
    -71.705436
  ],
  "Truro": [
    "Truro",
    41.993437,
    -70.049746
  ],
  "Tyngsborough": [
    "Tyngsborough",
    42.676145,
    -71.422773
  ],
  "Tyringham": [
    "Tyringham",
    42.245769,
    -73.204021
  ],
  "Upton": [
    "Upton",
    42.173556,
    -71.603052
  ],
  "Uxbridge": [
    "Uxbridge",
    42.076817,
    -71.629848
  ],
  "Wakefield": [
    "Wakefield",
    42.506484,
    -71.072831
  ],
  "Wales": [
    "Wales",
    42.072721,
    -72.2206
  ],
  "Walpole": [
    "Walpole",
    42.145902,
    -71.253876
  ],
  "Waltham": [
    "Waltham",
    42.37564,
    -71.2358
  ],
  "Ware": [
    "Ware",
    42.25993,
    -72.239781
  ],
  "Wareham": [
    "Wareham",
    41.762604,
    -70.721702
  ],
  "Warren": [
    "Warren",
    42.212863,
    -72.192649
  ],
  "Warwick": [
    "Warwick",
    42.682386,
    -72.338382
  ],
  "Washington": [
    "Washington",
    42.366301,
    -73.143122
  ],
  "Watertown": [
    "Watertown",
    42.365252,
    -71.184324
  ],
  "Wayland": [
    "Wayland",
    42.363206,
    -71.360672
  ],
  "Webster": [
    "Webster",
    42.050137,
    -71.880331
  ],
  "Wellesley": [
    "Wellesley",
    42.296486,
    -71.292557
  ],
  "Wellfleet": [
    "Wellfleet",
    41.937605,
    -70.0328
  ],
  "Wendell": [
    "Wendell",
    42.548522,
    -72.397171
  ],
  "Wenham": [
    "Wenham",
    42.604621,
    -70.887351
  ],
  "West Boylston": [
    "West Boylston",
    42.368007,
    -71.784533
  ],
  "West Bridgewater": [
    "West Bridgewater",
    42.019106,
    -71.007674
  ],
  "West Brookfield": [
    "West Brookfield",
    42.236244,
    -72.137949
  ],
  "West Newbury": [
    "West Newbury",
    42.801479,
    -70.989778
  ],
  "West Springfield": [
    "West Springfield",
    42.105237,
    -72.621371
  ],
  "West Stockbridge": [
    "West Stockbridge",
    42.334319,
    -73.367837
  ],
  "West Tisbury": [
    "West Tisbury",
    41.381005,
    -70.674493
  ],
  "Westborough": [
    "Westborough",
    42.269431,
    -71.612991
  ],
  "Westfield": [
    "Westfield",
    42.120541,
    -72.748916
  ],
  "Westford": [
    "Westford",
    42.579258,
    -71.437841
  ],
  "Westhampton": [
    "Westhampton",
    42.304339,
    -72.774959
  ],
  "Westminster": [
    "Westminster",
    42.544769,
    -71.910845
  ],
  "Weston": [
    "Weston",
    42.366763,
    -71.303113
  ],
  "Westport": [
    "Westport",
    41.62204,
    -71.078019
  ],
  "Westwood": [
    "Westwood",
    42.218691,
    -71.223383
  ],
  "Weymouth": [
    "Weymouth",
    42.221219,
    -70.939162
  ],
  "Whately": [
    "Whately",
    42.439925,
    -72.634908
  ],
  "Whitman": [
    "Whitman",
    42.080662,
    -70.935599
  ],
  "Wilbraham": [
    "Wilbraham",
    42.122919,
    -72.431458
  ],
  "Williamsburg": [
    "Williamsburg",
    42.392627,
    -72.730247
  ],
  "Williamstown": [
    "Williamstown",
    42.713547,
    -73.209457
  ],
  "Wilmington": [
    "Wilmington",
    42.546483,
    -71.173667
  ],
  "Winchendon": [
    "Winchendon",
    42.681513,
    -72.049977
  ],
  "Winchester": [
    "Winchester",
    42.452318,
    -71.136998
  ],
  "Windsor": [
    "Windsor",
    42.512883,
    -73.058854
  ],
  "Winthrop": [
    "Winthrop",
    42.374653,
    -70.982581
  ],
  "Woburn": [
    "Woburn",
    42.479262,
    -71.152277
  ],
  "Worcester": [
    "Worcester",
    42.262562,
    -71.801888
  ],
  "Worthington": [
    "Worthington",
    42.395999,
    -72.935834
  ],
  "Wrentham": [
    "Wrentham",
    42.066765,
    -71.328111
  ],
  "Yarmouth": [
    "Yarmouth",
    41.705666,
    -70.228631
  ]
}

system_msg = (
        "You are an expert query optimizer. Extract the service type, a specific location (if any), "
        "and count from user input. If the user says 'in Massachusetts' or no location at all, "
        "return location as null."
        "If user has not specified a services return service as null"
        "Respond ONLY with JSON in the format: {\"service\": str, \"locations\": list[str], \"count\": int|null}"
    )
