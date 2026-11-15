import csv
import os
import requests
import psycopg2
import traceback
import io
import csv as csv_module
import xml.etree.ElementTree as ET
import re
import json
from django.http import HttpResponse
from django.db.models import Q, Count
from django.contrib import admin
from django.urls import path, reverse
from django import forms
from .models import *
from rest_framework.authtoken.models import Token
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.hashers import make_password
from datetime import timedelta, date
from django.contrib.gis.geos import Point
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.conf import settings
from postmarker.core import PostmarkClient
from .tokens import account_activation_token
from .utils import generate_secure_password, geocode_address, validate_csv_file, decode_csv_file
from django.utils.text import slugify
from .models import ServiceProviderChatbotInterface
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils.html import format_html
from django.shortcuts import render
from django.contrib import messages
import logging
logging.basicConfig(
    level=logging.INFO,  # or DEBUG for more details
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


postmark = PostmarkClient(server_token=settings.EMAIL_SERVER_TOKEN)


class ChatbotInterface(models.Model):
    """
    Fake model for displaying chatbot interface in Django admin
    This model has no database table and is used only for admin interface
    """
    class Meta:
        verbose_name = 'YardSign Scraper Chatbot'
        verbose_name_plural = 'YardSign Scraper Chatbot'
        app_label = 'accounts'
        managed = False


@admin.register(ChatbotInterface)
class ChatbotAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return True

    def get_queryset(self, request):
        return ChatbotInterface.objects.none()

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context.update({
            'title': 'YardSign Scraper Chatbot',
            'subtitle': 'AI-Powered Data Scraping Assistant',
        })
        return render(request, 'admin/accounts/chat_interface.html', extra_context)
    

@admin.register(ServiceProviderChatbotInterface)
class ServiceProviderChatbotAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_view_permission(self, request, obj=None):
        return True

    def get_queryset(self, request):
        return ServiceProviderChatbotInterface.objects.none()

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context.update({
            'title': 'Service Provider Chatbot',
            'subtitle': 'AI-Powered Service Matching Assistant',
        })
        return render(request, 'admin/accounts/service_chat_interface.html', extra_context)


class HiddenModelAdmin(admin.ModelAdmin):
    def has_module_permission(self, request):
        return False 
    def has_view_permission(self, request, obj=None):
        return False

# Hide models that are now managed through the unified interface
admin.site.register(UploadedMultipleFile, HiddenModelAdmin)

# Remove the old CompanyDataUpload admin if it exists
try:
    admin.site.unregister(CompanyDataUpload)
except admin.sites.NotRegistered:
    pass

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'is_active', 'plan_name', 'expiry_date', 'feature_count']
    search_fields = ['email']
    list_filter = ['is_active', 'is_staff', 'is_google', 'plan_name']
    
    fieldsets = (
        ('Account Info', {
            'fields': ('email', 'password', 'is_active', 'is_staff', 'is_admin', 'is_google')
        }),
        ('Plan Details', {
            'fields': ('plan_name', 'feature_count', 'expiry_date')
        }),
    )
    
    def has_add_permission(self, request, obj=None):
        return True
    def has_change_permission(self, request, obj=None):
        return True
    def has_delete_permission(self, request, obj=None):
        return True
    def has_view_permission(self, request, obj=None):
        return True
    
    def delete_model(self, request, obj):
        """Delete individual user with GeoServer update"""
        if not obj.is_superuser:  # Don't delete superusers
            user_email = obj.email
            user_has_companies = UploadedMultipleFile.objects.filter(user=obj).exists()
            
            with transaction.atomic():
                # Delete related records
                UploadedMultipleFile.objects.filter(user=obj).delete()
                UploadedFile.objects.filter(user=obj).delete()
                try:
                    user_info = UserInfo.objects.get(user=obj)
                    user_info.delete()
                except UserInfo.DoesNotExist:
                    pass
                
                # Delete the user
                super().delete_model(request, obj)
                
                # Trigger GeoServer update if user had companies
                if user_has_companies:
                    transaction.on_commit(lambda: self.trigger_geoserver_update(request, user_email))
                    messages.success(request, f"User '{user_email}' and associated company data deleted successfully. GeoServer map will be updated.")
                else:
                    messages.success(request, f"User '{user_email}' deleted successfully.")
        else:
            messages.error(request, "Cannot delete superuser accounts.")
    
    def delete_queryset(self, request, queryset):
        """Delete multiple users with GeoServer update"""
        deleted_count = 0
        users_with_companies = 0
        
        with transaction.atomic():
            for user in queryset:
                if not user.is_superuser:  # Don't delete superusers
                    user_has_companies = UploadedMultipleFile.objects.filter(user=user).exists()
                    if user_has_companies:
                        users_with_companies += 1
                    
                    # Delete related records
                    UploadedMultipleFile.objects.filter(user=user).delete()
                    UploadedFile.objects.filter(user=user).delete()
                    try:
                        user_info = UserInfo.objects.get(user=user)
                        user_info.delete()
                    except UserInfo.DoesNotExist:
                        pass
                    
                    user.delete()
                    deleted_count += 1
            
            # Trigger GeoServer update if any users had companies
            if users_with_companies > 0:
                transaction.on_commit(lambda: self.trigger_geoserver_update(request, f"admin bulk deletion of {deleted_count} users"))
                messages.success(request, f"Successfully deleted {deleted_count} users and their associated company data. GeoServer map will be updated.")
            else:
                messages.success(request, f"Successfully deleted {deleted_count} users.")
    
    def trigger_geoserver_update(self, request, operation_description):
        """Trigger GeoServer update after user deletion"""
        try:
            print(f"Triggering GeoServer update for: {operation_description}")
            
            # Fetch current data from database
            conn = psycopg2.connect("dbname=yardsigndev user=postgres password=fPWT01zgWNcB2NdOb2l6 host=yardsigndev.czbiko0d2y4q.us-east-1.rds.amazonaws.com")
            conn.set_session(autocommit=True)
            cur = conn.cursor()
            cur.execute("SELECT *, split_part(logo, '/', 4) as img FROM public.accounts_sector")
            data = cur.fetchall()
            cur.close()
            conn.close()
            
            if not data:
                messages.warning(request, "GeoServer update skipped: No sector data found.")
                return
            
            # Generate SLD XML
            sld_xml = self.generate_geoserver_sld(data)
            if not sld_xml:
                messages.warning(request, "GeoServer update skipped: Could not generate SLD.")
                return
            
            # Update GeoServer
            status_code, response_text = self.update_geoserver_style(sld_xml)
            if status_code == 200:
                messages.info(request, f"GeoServer map updated successfully after {operation_description}.")
                print(f"GeoServer updated successfully for {operation_description}")
            else:
                messages.warning(request, f"GeoServer update had issues: HTTP {status_code}")
                print(f"GeoServer update failed: {status_code} - {response_text}")
                
        except Exception as e:
            messages.warning(request, f"GeoServer update failed: {str(e)}")
            print(f"Exception during GeoServer update: {str(e)}")
    
    def generate_geoserver_sld(self, data):
        """Generate SLD XML for GeoServer styling"""
        try:
            sld = ET.Element('StyledLayerDescriptor', attrib={
                'version': '1.0.0',
                'xsi:schemaLocation': 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd',
                'xmlns': 'http://www.opengis.net/sld',
                'xmlns:ogc': 'http://www.opengis.net/ogc',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
            })

            named_layer = ET.SubElement(sld, 'NamedLayer')
            name = ET.SubElement(named_layer, 'Name')
            name.text = 'yardsign'

            user_style = ET.SubElement(named_layer, 'UserStyle')
            title = ET.SubElement(user_style, 'Title')
            title.text = 'Icon Mapping'

            feature_type_style = ET.SubElement(user_style, 'FeatureTypeStyle')
            link = 'https://yardsignproshop.com:9443'

            for element in data:
                _, sector_name, logo, category_id, img = element 
                rule = ET.SubElement(feature_type_style, 'Rule')
                rule_title = ET.SubElement(rule, 'Title')
                rule_title.text = sector_name 
     
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

                point_symbolizer = ET.SubElement(rule, 'PointSymbolizer')
                graphic = ET.SubElement(point_symbolizer, 'Graphic')
                external_graphic = ET.SubElement(graphic, 'ExternalGraphic')
                online_resource = ET.SubElement(external_graphic, 'OnlineResource', attrib={
                    'xlink:type': 'simple',
                    'xlink:href': link + logo
                })
                format_tag = ET.SubElement(external_graphic, 'Format')
                format_tag.text = 'image/png'
                size = ET.SubElement(graphic, 'Size')
                size.text = '50' 

                text_symbolizer = ET.SubElement(rule, 'TextSymbolizer')
                label = ET.SubElement(text_symbolizer, 'Label')
                prop_name_2 = ET.SubElement(label, 'ogc:PropertyName')
                prop_name_2.text = 'company_name'
                font = ET.SubElement(text_symbolizer, 'Font')
                css_param_font = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-family'})
                css_param_font.text = 'Arial'
                css_param_size = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-size'})
                css_param_size.text = '14'

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

                halo = ET.SubElement(text_symbolizer, 'Halo')
                radius = ET.SubElement(halo, 'Radius')
                ogc_literal_radius = ET.SubElement(radius, 'ogc:Literal')
                ogc_literal_radius.text = '2'
                fill_halo = ET.SubElement(halo, 'Fill')
                css_param_fill_halo = ET.SubElement(fill_halo, 'CssParameter', attrib={'name': 'fill'})
                css_param_fill_halo.text = '#FFFFFF'

            return ET.tostring(sld).decode()
        except Exception as e:
            print(f"Error generating GeoServer SLD: {str(e)}")
            return None
    
    def update_geoserver_style(self, sld_xml):
        """Update GeoServer style using PUT request"""
        try:
            geoserver_url = 'https://yardsignproshop.com:8081/geoserver/rest/workspaces/yard_sign/styles/'
            headers = {'Content-type': 'application/vnd.ogc.sld+xml'}
            auth = ('admin', 'yardsign_geoserver')
            response = requests.put(f'{geoserver_url}yard_db2', data=sld_xml, headers=headers, auth=auth, verify=False)
            return response.status_code, response.text
        except Exception as e:
            print(f"Error updating GeoServer style: {str(e)}")
            return 500, str(e)

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['user', 'sector', 'uploaded_on', 'latitude', 'longitude', 'address']
    search_fields = ['user__email', 'address', 'city', 'state']
    list_filter = ['uploaded_on', 'sector', 'state']
    date_hierarchy = 'uploaded_on'
    readonly_fields = ['uploaded_on', 'geom']

@admin.register(UserInfo)
class UserInfoAdmin(admin.ModelAdmin):
    list_display = ['user', 'company_name', 'contact_name', 'get_sector_name', 'company_phone']
    search_fields = ['user__email', 'company_name', 'contact_name', 'company_phone']
    list_filter = ['sector']
    readonly_fields = ['user']
    
    fieldsets = (
        ('User Account', {
            'fields': ('user',)
        }),
        ('Company Information', {
            'fields': ('company_name', 'company_address', 'company_phone', 'company_email', 'company_website')
        }),
        ('Contact Information', {
            'fields': ('contact_name',)
        }),
        ('Sector Information', {
            'fields': ('sector', 'category_id')
        }),
    )
    
    def get_sector_name(self, obj):
        if obj.sector and obj.sector.strip() and obj.sector != 'None':
            try:
                sector_id = int(obj.sector.strip())
                sector = Sector.objects.get(id=sector_id)
                return sector.sector_name
            except (ValueError, Sector.DoesNotExist):
                return "Invalid Sector"
        return "No Sector"
    get_sector_name.short_description = 'Sector'
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Add success message
        if change:
            messages.success(request, f"User information for {obj.company_name} updated successfully.")
    
    def response_change(self, request, obj):
        """
        Override to redirect back to the unified company data interface
        """
        # Check if the request came from the unified interface
        referer = request.META.get('HTTP_REFERER', '')
        
        # If coming from unified interface, redirect back there
        if '/admin/accounts/companydata/' in referer and 'view=users' in referer:
            messages.success(request, f"User information for {obj.company_name or obj.user.email} updated successfully.")
            return HttpResponseRedirect('/admin/accounts/companydata/?view=users')
        
        # If coming from a specific sector companies page, redirect back there
        elif '/admin/accounts/companydata/sector/' in referer:
            # Extract sector ID from referer if possible
            sector_match = re.search(r'/admin/accounts/companydata/sector/(\d+)/companies/', referer)
            if sector_match:
                sector_id = sector_match.group(1)
                messages.success(request, f"User information for {obj.company_name or obj.user.email} updated successfully.")
                return HttpResponseRedirect(f'/admin/accounts/companydata/sector/{sector_id}/companies/')
        
        # Check for next parameter in the request
        next_url = request.GET.get('next')
        if next_url:
            messages.success(request, f"User information for {obj.company_name or obj.user.email} updated successfully.")
            return HttpResponseRedirect(next_url)
        
        # Default: redirect to unified users view
        messages.success(request, f"User information for {obj.company_name or obj.user.email} updated successfully.")
        return HttpResponseRedirect('/admin/accounts/companydata/?view=users')
    # Custom admin URL
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                "upload-csv/",
                self.admin_site.admin_view(UnifiedCompanyDataAdmin.upload_csv),
                name="upload_csv",   # <== This is the name your template looks for
            ),
        ]
        return custom_urls + urls
    
    
    def response_add(self, request, obj, post_url_continue=None):
        """
        Override to redirect back to the unified company data interface after adding
        """
        # Check for next parameter in the request
        next_url = request.GET.get('next')
        if next_url:
            messages.success(request, f"User information for {obj.company_name or obj.user.email} created successfully.")
            return HttpResponseRedirect(next_url)
        
        # Default: redirect to unified users view
        messages.success(request, f"User information for {obj.company_name or obj.user.email} created successfully.")
        return HttpResponseRedirect('/admin/accounts/companydata/?view=users')

class CSVUploadForm(forms.Form):
    csv_file = forms.FileField()
    sector = forms.ModelChoiceField(queryset=Sector.objects.all(), required=False)

class SectorForm(forms.ModelForm):
    class Meta:
        model = Sector
        fields = ['sector_name', 'category', 'logo']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['category'].queryset = Category.objects.all()

class UserInfoForm(forms.ModelForm):
    sector = forms.ModelChoiceField(queryset=Sector.objects.all())
    
    class Meta:
        model = UserInfo
        fields = ['contact_name', 'sector', 'company_phone', 'company_name', 
                 'company_email', 'company_address', 'company_website']

@admin.register(CompanyData)
class UnifiedCompanyDataAdmin(admin.ModelAdmin):
    """
    Unified Company Data Admin that handles all company-related operations:
    - View sectors and companies
    - Edit/Delete companies, users, sectors
    - CSV upload with proper data synchronization
    - Bulk operations
    - GeoServer updates for data changes
    
    Note: Works with CharField sector fields in UserInfo model
    """
    
    class Meta:
        verbose_name = 'Company Data Management'
        verbose_name_plural = 'Company Data Management'
    
    def has_add_permission(self, request):
        return True
        
    def has_delete_permission(self, request, obj=None):
        return True
        
    def has_change_permission(self, request, obj=None):
        return True

    def get_queryset(self, request):
        return super().get_queryset(request).none()
    
    # ===== GEOSERVER UPDATE METHODS =====
    def fetch_geoserver_data(self):
        """Fetch sector-related data from the database for GeoServer updates."""
        try:
            conn = psycopg2.connect("dbname=yardsigndev user=postgres password=fPWT01zgWNcB2NdOb2l6 host=yardsigndev.czbiko0d2y4q.us-east-1.rds.amazonaws.com")
            conn.set_session(autocommit=True)
            cur = conn.cursor()
            cur.execute("SELECT *, split_part(logo, '/', 4) as img FROM public.accounts_sector")
            data = cur.fetchall()
            cur.close()
            conn.close()
            return data
        except Exception as e:
            print(f"Error fetching GeoServer data: {str(e)}")
            return None

    def generate_geoserver_sld(self, data):
        """Generate SLD XML for GeoServer styling."""
        try:
            sld = ET.Element('StyledLayerDescriptor', attrib={
                'version': '1.0.0',
                'xsi:schemaLocation': 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd',
                'xmlns': 'http://www.opengis.net/sld',
                'xmlns:ogc': 'http://www.opengis.net/ogc',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
            })

            named_layer = ET.SubElement(sld, 'NamedLayer')
            name = ET.SubElement(named_layer, 'Name')
            name.text = 'yardsign'

            user_style = ET.SubElement(named_layer, 'UserStyle')
            title = ET.SubElement(user_style, 'Title')
            title.text = 'Icon Mapping'

            feature_type_style = ET.SubElement(user_style, 'FeatureTypeStyle')
            link = 'https://yardsignproshop.com:9443'

            for element in data:
                _, sector_name, logo, category_id, img = element 
                rule = ET.SubElement(feature_type_style, 'Rule')
                rule_title = ET.SubElement(rule, 'Title')
                rule_title.text = sector_name 
     
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

                point_symbolizer = ET.SubElement(rule, 'PointSymbolizer')
                graphic = ET.SubElement(point_symbolizer, 'Graphic')
                external_graphic = ET.SubElement(graphic, 'ExternalGraphic')
                online_resource = ET.SubElement(external_graphic, 'OnlineResource', attrib={
                    'xlink:type': 'simple',
                    'xlink:href': link + logo
                })
                format_tag = ET.SubElement(external_graphic, 'Format')
                format_tag.text = 'image/png'
                size = ET.SubElement(graphic, 'Size')
                size.text = '50' 

                text_symbolizer = ET.SubElement(rule, 'TextSymbolizer')
                label = ET.SubElement(text_symbolizer, 'Label')
                prop_name_2 = ET.SubElement(label, 'ogc:PropertyName')
                prop_name_2.text = 'company_name'
                font = ET.SubElement(text_symbolizer, 'Font')
                css_param_font = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-family'})
                css_param_font.text = 'Arial'
                css_param_size = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-size'})
                css_param_size.text = '14'

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

                halo = ET.SubElement(text_symbolizer, 'Halo')
                radius = ET.SubElement(halo, 'Radius')
                ogc_literal_radius = ET.SubElement(radius, 'ogc:Literal')
                ogc_literal_radius.text = '2'
                fill_halo = ET.SubElement(halo, 'Fill')
                css_param_fill_halo = ET.SubElement(fill_halo, 'CssParameter', attrib={'name': 'fill'})
                css_param_fill_halo.text = '#FFFFFF'

            return ET.tostring(sld).decode()
        except Exception as e:
            print(f"Error generating GeoServer SLD: {str(e)}")
            return None

    def update_geoserver_style(self, sld_xml):
        """Update GeoServer style using PUT request."""
        try:
            geoserver_url = 'https://yardsignproshop.com:8081/geoserver/rest/workspaces/yard_sign/styles/'
            headers = {'Content-type': 'application/vnd.ogc.sld+xml'}
            auth = ('admin', 'yardsign_geoserver')
            response = requests.put(f'{geoserver_url}yard_db2', data=sld_xml, headers=headers, auth=auth, verify=False)
            return response.status_code, response.text
        except Exception as e:
            print(f"Error updating GeoServer style: {str(e)}")
            return 500, str(e)

    def trigger_geoserver_update(self, request, operation_type="data_change"):
        """Trigger GeoServer update after data changes."""
        try:
            print(f"Triggering GeoServer update for: {operation_type}")
            data = self.fetch_geoserver_data()
            if data is None:
                messages.warning(request, "GeoServer update skipped: Could not fetch sector data.")
                return

            sld_xml = self.generate_geoserver_sld(data)
            if sld_xml is None:
                messages.warning(request, "GeoServer update skipped: Could not generate SLD.")
                return

            status_code, response_text = self.update_geoserver_style(sld_xml)
            if status_code == 200:
                messages.success(request, f"GeoServer map updated successfully after {operation_type}.")
                print(f"GeoServer updated successfully for {operation_type}")
            else:
                messages.warning(request, f"GeoServer update had issues: HTTP {status_code}")
                print(f"GeoServer update failed: {status_code} - {response_text}")

        except Exception as e:
            messages.error(request, f"Error updating GeoServer: {str(e)}")
            print(f"Exception during GeoServer update: {str(e)}")
    
    # ===== VIEW METHODS =====
    def changelist_view(self, request, extra_context=None):
        """
        Main view showing sectors with search functionality and management options
        """
        search_query = request.GET.get('q', '').strip()
        view_type = request.GET.get('view', 'sectors')  # sectors, companies, users

        if view_type == 'sectors':
            return self._sectors_view(request, search_query, extra_context)
        elif view_type == 'companies':
            return self._companies_view(request, search_query, extra_context)
        elif view_type == 'users':
            return self._users_view(request, search_query, extra_context)
        else:
            return self._sectors_view(request, search_query, extra_context)

    def _sectors_view(self, request, search_query, extra_context):
        """Show all sectors with company counts - Optimized with bulk queries"""
        from django.db.models import Q, Min
        from collections import defaultdict
        
        sectors_queryset = Sector.objects.all()

        # Apply search filter
        if search_query:
            sectors_queryset = sectors_queryset.filter(
                Q(sector_name__icontains=search_query) |
                Q(category__category_name__icontains=search_query)
            )

        sectors_queryset = sectors_queryset.order_by('sector_name')
        
        # Get all entries from UploadedMultipleFile
        # Select only the first entry (smallest id) per user per sector
        all_uploaded_files = UploadedMultipleFile.objects.values('user_id', 'sector_id').annotate(
            min_id=Min('id')
        ).values_list('min_id', flat=True)
        
        # Get the actual records with user information
        unique_companies = UploadedMultipleFile.objects.filter(
            id__in=all_uploaded_files
        ).select_related('user')
        
        # Create dictionaries to store counts per sector
        sector_counts = defaultdict(lambda: {'total': 0, 'registered': 0})
        
        # Process all unique company entries
        for company in unique_companies:
            sector_id = str(company.sector_id)
            
            # Increment total count for this sector
            sector_counts[sector_id]['total'] += 1
            
            # Increment registered count if user exists and is active
            if company.user and company.user.is_active:
                sector_counts[sector_id]['registered'] += 1
        
        # Build the final result
        sectors_with_counts = []
        for sector in sectors_queryset:
            sector_id = str(sector.id)
            counts = sector_counts.get(sector_id, {'total': 0, 'registered': 0})
            
            company_count = counts['total']
            registered_count = counts['registered']
            unregistered_count = company_count - registered_count
            
            sectors_with_counts.append({
                'sector': sector,
                'company_count': company_count,
                'registered_count': registered_count,
                'unregistered_count': unregistered_count,
            })

        # Prepare context
        extra_context = extra_context or {}
        extra_context.update({
            'title': 'Company Data Management - Sectors Overview',
            'sectors_with_counts': sectors_with_counts,
            'view_type': 'sectors',
            'search_query': search_query,
            'total_sectors': len(sectors_with_counts),
        })

        return render(request, 'admin/accounts/companydata/unified_sectors_list.html', extra_context)

    def _companies_view(self, request, search_query, extra_context):
        """Show all companies across all sectors from UserInfo table"""
        user_infos = UserInfo.objects.all().select_related('user')
        
        if search_query:
            logger.info("Search Query is: ", search_query)
            # Create the main search query
            search_q = (
                Q(company_name__icontains=search_query) |
                Q(company_address__icontains=search_query) |
                Q(user__email__icontains=search_query) |
                Q(contact_name__icontains=search_query) |
                Q(company_phone__icontains=search_query) |
                Q(company_website__icontains=search_query)
            )

            # Also search by sector name if the search query matches a sector
            sector_matches = Sector.objects.filter(sector_name__icontains=search_query)
            if sector_matches.exists():
                sector_ids = [str(sector.id) for sector in sector_matches]
                search_q |= Q(sector__in=sector_ids)
            
            user_infos = user_infos.filter(search_q)

        user_infos = user_infos.order_by('company_name')
        companies_with_details = []
        
        for user_info in user_infos:
            # Get ALL corresponding UploadedMultipleFile entries for this user (not just first)
            company_entries = []
            if user_info.user:
                company_entries = list(UploadedMultipleFile.objects.filter(
                    user=user_info.user,
                    is_active=True
                ).order_by('-id'))  # Most recent first
            
            # If UploadedMultipleFile entries exist, create one display entry for each
            if company_entries:
                logger.info(company_entries)
                for company_entry in company_entries:
                    companies_with_details.append({
                        'company': company_entry,
                        'user_info': user_info,
                        'is_registered': user_info.user.is_active if user_info.user else False,
                        'company_website': user_info.company_website if user_info.company_website else '-',
                        'company_phone': user_info.company_phone if user_info.company_phone else '-',
                        'contact_name': user_info.contact_name if user_info.contact_name else '-',
                    })
            else:
                # If no UploadedMultipleFile entry exists, create a virtual one for display
                # Get sector information
                logger.info("No YS found in uploadedmultiplefiles")
                sector = None
                if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                    try:
                        sector_id = int(user_info.sector.strip())
                        sector = Sector.objects.get(id=sector_id)
                    except (ValueError, Sector.DoesNotExist):
                        pass
                
                company_entry = type('MockCompany', (), {
                    'id': f"userinfo_{user_info.id}",
                    'company_name': user_info.company_name,
                    'address': user_info.company_address,
                    'user': user_info.user,
                    'latitude': None,
                    'longitude': None,
                    'sector_name': sector.sector_name if sector else 'No Sector',
                    'is_active': False
                })()

                companies_with_details.append({
                    'company': company_entry,
                    'user_info': user_info,
                    'is_registered': user_info.user.is_active if user_info.user else False,
                    'company_website': user_info.company_website if user_info.company_website else '-',
                    'company_phone': user_info.company_phone if user_info.company_phone else '-',
                    'contact_name': user_info.contact_name if user_info.contact_name else '-',
                })
        
        extra_context = extra_context or {}
        extra_context.update({
            'title': 'Company Data Management - All Companies',
            'companies_with_details': companies_with_details,
            'view_type': 'companies',
            'search_query': search_query,
            'total_companies': len(companies_with_details),
        })
        
        return render(request, 'admin/accounts/companydata/unified_companies_list.html', extra_context)

    def _users_view(self, request, search_query, extra_context):
        """Show all users with their company information"""
        users = User.objects.all()
        
        if search_query:
            # Create more precise search logic
            search_terms = search_query.strip().split()
            q_objects = Q()
            
            # For each search term, create precise matches
            for term in search_terms:
                term_q = Q()
                
                # Exact email matches (most precise)
                term_q |= Q(email__iexact=term)
                
                # Email domain matches (e.g., @treesevice.com)
                term_q |= Q(email__icontains=f"@{term}")
                
                # Company name matches (exact and word boundaries)
                term_q |= Q(userinfo__company_name__iexact=term)
                term_q |= Q(userinfo__company_name__icontains=f" {term} ")  # Word boundaries
                term_q |= Q(userinfo__company_name__istartswith=f"{term} ")  # Starts with term
                term_q |= Q(userinfo__company_name__iendswith=f" {term}")    # Ends with term
                
                # Contact name matches
                term_q |= Q(userinfo__contact_name__icontains=term)
                
                # Phone number matches (exact digits)
                if term.replace('-', '').replace('(', '').replace(')', '').replace(' ', '').isdigit():
                    clean_term = term.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')
                    term_q |= Q(userinfo__company_phone__icontains=clean_term)
                
                q_objects &= term_q
            
            # Also search by sector name if the search query matches a sector
            sector_matches = Sector.objects.filter(sector_name__icontains=search_query)
            if sector_matches.exists():
                sector_ids = [str(sector.id) for sector in sector_matches]
                q_objects |= Q(userinfo__sector__in=sector_ids)
            
            # Apply the search filter
            users = users.filter(q_objects).distinct()

            # If no results found with precise search, fall back to broader search
            if not users.exists():
                print("DEBUG: No precise results, falling back to broad search")
                users = User.objects.filter(
                    Q(email__icontains=search_query) |
                    Q(userinfo__company_name__icontains=search_query) |
                    Q(userinfo__contact_name__icontains=search_query) |
                    Q(userinfo__company_phone__icontains=search_query)
                ).distinct()

        users = users.order_by('email')
        users_with_details = []
        
        for user in users:
            try:
                user_info = UserInfo.objects.get(user=user)
                sector = None
                # Handle CharField sector field - get actual Sector object
                if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                    try:
                        # sector field is CharField containing sector ID
                        sector_id = int(user_info.sector.strip())
                        sector = Sector.objects.get(id=sector_id)
                    except (ValueError, Sector.DoesNotExist):
                        sector = None
                
                users_with_details.append({
                    'user': user,
                    'user_info': user_info,
                    'sector': sector,
                })
            except UserInfo.DoesNotExist:
                users_with_details.append({
                    'user': user,
                    'user_info': None,
                    'sector': None,
                })
        
        extra_context = extra_context or {}
        extra_context.update({
            'title': 'Company Data Management - All Users',
            'users_with_details': users_with_details,
            'view_type': 'users',
            'search_query': search_query,
            'total_users': len(users_with_details),
        })
        
        return render(request, 'admin/accounts/companydata/unified_users_list.html', extra_context)
    
    def companies_in_sector(self, request, sector_id):
        """Show all companies in a specific sector from UploadedMultipleFile table (with UserInfo details)"""
        from django.db.models import Q, Min
        from accounts.models import UploadedMultipleFile, Sector, UserInfo

        try:
            sector = Sector.objects.get(id=sector_id)
        except Sector.DoesNotExist:
            messages.error(request, f"Sector with ID {sector_id} does not exist.")
            return HttpResponseRedirect(reverse('admin:accounts_companydata_changelist'))

        # Base queryset for this sector
        base_queryset = UploadedMultipleFile.objects.filter(
            sector_id=sector_id
        ).select_related('user')

        # Handle search
        search_query = request.GET.get('q', '')
        if search_query:
            base_queryset = base_queryset.filter(
                Q(company_name__icontains=search_query) |
                Q(address__icontains=search_query) |
                Q(user__email__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(state__icontains=search_query)
            )

        # ✅ Select only the first company (smallest id) per user
        # Step 1: Get the smallest UploadedMultipleFile ID per user
        min_ids = base_queryset.values('user_id').annotate(min_id=Min('id')).values_list('min_id', flat=True)

        # Step 2: Filter to include only those entries
        companies = base_queryset.filter(id__in=min_ids).order_by('company_name')

        # Fetch all related UserInfo records in a single query
        user_ids = [c.user.id for c in companies if c.user]
        userinfo_map = {
            info.user_id: info for info in UserInfo.objects.filter(user_id__in=user_ids)
        }

        companies_with_details = []
        for company in companies:
            user = company.user
            user_info = userinfo_map.get(user.id) if user else None

            companies_with_details.append({
                'company': company,
                'user': user,
                'is_registered': user.is_active if user else False,
                'company_name': company.company_name or (user_info.company_name if user_info else '-'),
                'address': company.address or (user_info.company_address if user_info else '-'),
                'company_website': getattr(user_info, 'company_website', '-') if user_info else '-',
                'company_phone': getattr(user_info, 'company_phone', '-') if user_info else '-',
                'contact_name': getattr(user_info, 'contact_name', '-') if user_info else '-',
            })

        context = {
            'title': f'Companies in {sector.sector_name}',
            'sector': sector,
            'companies_with_details': companies_with_details,
            'search_query': search_query,
            'company_count': len(companies_with_details),
            'opts': self.model._meta,
        }

        return render(request, 'admin/accounts/companydata/sector_companies_list.html', context)

    def edit_company(self, request, company_id):
        """Edit individual company record - now works with UserInfo-based IDs"""
        try:
            # Check if this is a UserInfo-based ID (format: userinfo_123)
            if str(company_id).startswith('userinfo_'):
                user_info_id = str(company_id).replace('userinfo_', '')
                user_info = UserInfo.objects.get(id=user_info_id)
                
                # Try to find corresponding UploadedMultipleFile
                company = None
                if user_info.user:
                    company = UploadedMultipleFile.objects.filter(
                        user=user_info.user,
                        is_active=True
                    ).first()
            else:
                # Traditional UploadedMultipleFile ID
                company = UploadedMultipleFile.objects.get(id=company_id)
                user_info = UserInfo.objects.get(user=company.user) if company.user else None
        except (UploadedMultipleFile.DoesNotExist, UserInfo.DoesNotExist):
            messages.error(request, "Company or user information not found.")
            return HttpResponseRedirect(reverse('admin:accounts_companydata_changelist'))

        if request.method == 'POST':
            # Get new values
            new_company_name = request.POST.get('company_name', '')
            new_address = request.POST.get('address', '')
            
            # Update UserInfo (primary source of truth)
            if user_info:
                user_info.company_name = new_company_name
                user_info.company_address = new_address
                user_info.company_website = request.POST.get('company_website', user_info.company_website)
                user_info.company_phone = request.POST.get('company_phone', user_info.company_phone)
                user_info.contact_name = request.POST.get('contact_name', user_info.contact_name)
                user_info.company_email = request.POST.get('company_email', user_info.company_email)
                
                # Handle sector as CharField (store sector ID as string)
                sector_id = request.POST.get('sector')
                if sector_id:
                    try:
                        sector = Sector.objects.get(id=sector_id)
                        user_info.sector = str(sector.id)
                        user_info.category_id = sector.category.id if sector.category else None
                    except Sector.DoesNotExist:
                        messages.error(request, "Selected sector does not exist.")
                
                user_info.save()
                
                # Update UploadedMultipleFile if it exists
                if company:
                    # Check if address changed for geocoding
                    if new_address.strip() != company.address.strip():
                        print(f"Address changed from '{company.address}' to '{new_address}' - updating coordinates")
                        latitude, longitude = geocode_address(new_address)
                        if latitude and longitude:
                            print(f"New coordinates: {latitude}, {longitude}")
                            company.latitude = str(latitude)
                            company.longitude = str(longitude)
                            company.geom = Point(longitude, latitude)
                            messages.success(request, f"Address updated and geocoded to coordinates: {latitude}, {longitude}")
                        else:
                            messages.warning(request, f"Address updated but could not geocode new address: {new_address}")
                    
                    company.company_name = new_company_name
                    company.address = new_address
                    
                    # Update sector information in UploadedMultipleFile too
                    if sector_id:
                        try:
                            sector = Sector.objects.get(id=sector_id)
                            company.sector_id = sector.id
                            company.sector = str(sector.id)
                            company.sector_name = sector.sector_name
                            company.category_id = sector.category.id if sector.category else None
                            company.category_name = sector.category.category_name if sector.category else ""
                        except Sector.DoesNotExist:
                            pass
                    
                    company.save()
                else:
                    # Create new UploadedMultipleFile entry if it doesn't exist and we have location info
                    if new_address:
                        latitude, longitude = geocode_address(new_address)
                        if latitude and longitude:
                            geom = Point(longitude, latitude)
                            
                            # Get sector info
                            sector = None
                            if sector_id:
                                try:
                                    sector = Sector.objects.get(id=sector_id)
                                except Sector.DoesNotExist:
                                    pass
                            
                            UploadedMultipleFile.objects.create(
                                user=user_info.user,
                                sector_id=sector.id if sector else None,
                                sector=str(sector.id) if sector else None,
                                sector_name=sector.sector_name if sector else "",
                                category_id=sector.category.id if sector and sector.category else None,
                                category_name=sector.category.category_name if sector and sector.category else "",
                                company_name=new_company_name,
                                latitude=str(latitude),
                                longitude=str(longitude),
                                address=new_address,
                                is_active=False,
                                geom=geom
                            )
                            messages.success(request, f"Company entry created and geocoded to coordinates: {latitude}, {longitude}")

            messages.success(request, f"Company '{new_company_name}' updated successfully.")
            return HttpResponseRedirect(reverse('admin:accounts_companydata_changelist'))

        # For GET request, prepare context
        # Create a company object for template compatibility
        if not company and user_info:
            company = type('MockCompany', (), {
                'id': f"userinfo_{user_info.id}",
                'company_name': user_info.company_name,
                'address': user_info.company_address,
                'user': user_info.user,
                'latitude': None,
                'longitude': None,
                'sector_name': '',
                'sector_id': None
            })()
            
            # Try to get sector info
            if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                try:
                    sector_id = int(user_info.sector.strip())
                    sector = Sector.objects.get(id=sector_id)
                    company.sector_name = sector.sector_name
                    company.sector_id = sector.id
                except (ValueError, Sector.DoesNotExist):
                    pass

        context = {
            'title': f'Edit Company: {company.company_name if company else "Unknown"}',
            'company': company,
            'user_info': user_info,
            'sectors': Sector.objects.all(),
        }
        
        return render(request, 'admin/accounts/companydata/edit_company.html', context)

    def delete_company_yard_sign(self, request, company_id):
        """Enhanced individual company deletion with primary yardsign protection"""

        if request.method == 'POST':
            try:
                logger.info(f"Inside delete_company_yard_sign with company_id = {company_id}")

                with transaction.atomic():
                    user = None
                    company_name = None
                    company = None

                    # STEP 1 — Identify user and company
                    if str(company_id).startswith('userinfo_'):
                        # deleting by userinfo (deletes ALL companies for that user)
                        user_info_id = str(company_id).replace('userinfo_', '')
                        user_info = UserInfo.objects.get(id=user_info_id)
                        user = user_info.user
                        company_name = user_info.company_name

                    else:
                        # Normal yardsign deletion (single company)
                        company = UploadedMultipleFile.objects.get(id=company_id)
                        user = company.user
                        company_name = company.company_name

                        # -----------------------------
                        # PRIMARY YARDSIGN RESTRICTIONS
                        # -----------------------------
                        yard_signs = UploadedMultipleFile.objects.filter(user=user).order_by('id')
                        count = yard_signs.count()

                        if count == 1:
                            # Only 1 yardsign → cannot delete
                            return JsonResponse({
                                "success": False,
                                "message": "This is the primary (only) yardsign. You cannot delete it."
                            })

                        # Multiple → check if this entry is the smallest ID
                        primary_id = yard_signs.first().id  # smallest ID = primary
                        if company.id == primary_id:
                            return JsonResponse({
                                "success": False,
                                "message": "This is the primary yardsign. You cannot delete it. Please delete a different one."
                            })
                        # -----------------------------

                    # STEP 2 — Admin deletion rule removed completely

                    # STEP 3 — Continue normal deletion
                    if str(company_id).startswith('userinfo_'):
                        logger.info("Deleting UserInfo and all related company entries")
                        UploadedMultipleFile.objects.filter(user=user).delete()
                        user_info.delete()
                    else:
                        logger.info("Deleting UploadedMultipleFile entry")
                        company.delete()

                    # STEP 4 — Clean related records
                    remaining_user_info = UserInfo.objects.filter(user=user).exists()
                    remaining_companies = UploadedMultipleFile.objects.filter(user=user).exists()
                    remaining_files = UploadedFile.objects.filter(user=user).exists()

                    user_deleted = False
                    if not remaining_user_info and not remaining_companies and not remaining_files:
                        try:
                            from .models import Pricing, UnlimitedPricing, FreeplanModel, SubscriptionModel
                            Pricing.objects.filter(user=user).delete()
                            UnlimitedPricing.objects.filter(user=user).delete()
                            FreeplanModel.objects.filter(user=user).delete()
                            SubscriptionModel.objects.filter(user=user).delete()
                        except ImportError:
                            pass

                        UploadedFile.objects.filter(user=user).delete()
                        user.delete()
                        user_deleted = True

                    # Trigger geoserver update
                    transaction.on_commit(lambda: self.trigger_geoserver_update(request, "company deletion"))

                    message = f"Company '{company_name}' deleted successfully"
                    if user_deleted:
                        message += " and associated user account cleaned up."
                    else:
                        message += "."

                    return JsonResponse({"success": True, "message": message})

            except (UploadedMultipleFile.DoesNotExist, UserInfo.DoesNotExist):
                return JsonResponse({"success": False, "message": "Company not found."})

            except Exception as e:
                logger.exception("Error in delete_company_yard_sign")
                return JsonResponse({"success": False, "message": f"Error deleting company: {str(e)}"})

        return JsonResponse({"success": False, "message": "Invalid request method."})


    def delete_company(self, request, company_id):
        """Enhanced individual company deletion with admin protection"""
        if request.method == 'POST':
            try:
                logger.info(f"Inside delete_company function with company_id = {company_id}")
                with transaction.atomic():
                    # --- STEP 1: Get the user associated with this company ---
                    user = None
                    company_name = None

                    if str(company_id).startswith('userinfo_'):
                        user_info_id = str(company_id).replace('userinfo_', '')
                        user_info = UserInfo.objects.get(id=user_info_id)
                        user = user_info.user
                        company_name = user_info.company_name
                    else:
                        company = UploadedMultipleFile.objects.get(id=company_id)
                        user = company.user
                        company_name = company.company_name

                    # --- STEP 2: Check if this user is an admin ---
                    if user and user.is_admin:
                        logger.warning(f"Attempted deletion of admin user: {user.email}")
                        return JsonResponse({
                            "success": False,
                            "message": f"Cannot delete company '{company_name}' because the associated user is an admin."
                        })

                    # --- STEP 3: Proceed with normal deletion ---
                    if str(company_id).startswith('userinfo_'):
                        logger.info("In userinfo_ block: deleting related UploadedMultipleFile entries")
                        UploadedMultipleFile.objects.filter(user=user).delete()
                        user_info.delete()
                    else:
                        logger.info("In else block: deleting UploadedMultipleFile entry directly")
                        company.delete()

                    # --- STEP 4: Enhanced user cleanup ---
                    user_deleted = False
                    if user:
                        logger.info(f"Cleaning up related data for user: {user.email}")
                        try:
                            from .models import Pricing, UnlimitedPricing, FreeplanModel, SubscriptionModel
                            Pricing.objects.filter(user=user).delete()
                            logger.info("Deleted Pricing entries")
                            UnlimitedPricing.objects.filter(user=user).delete()
                            logger.info("Deleted UnlimitedPricing entries")
                            FreeplanModel.objects.filter(user=user).delete()
                            logger.info("Deleted FreeplanModel entries")
                            SubscriptionModel.objects.filter(user=user).delete()
                            logger.info("Deleted SubscriptionModel entries")
                        except ImportError:
                            pass

                        UploadedFile.objects.filter(user=user).delete()
                        logger.info("Deleted UploadedFile entries")
                        UserInfo.objects.filter(user=user).delete()
                        logger.info("Deleted UserInfo entries")
                        UploadedMultipleFile.objects.filter(user=user).delete()
                        logger.info("Deleted UploadedMultipleFile entries")

                        logger.info(f"Deleting user: {user}")
                        user.delete()
                        user_deleted = True

                    # --- STEP 5: Trigger GeoServer update ---
                    transaction.on_commit(lambda: self.trigger_geoserver_update(request, "company deletion"))

                    # --- STEP 6: Prepare response ---
                    message = f"Company '{company_name}' deleted successfully"
                    if user_deleted:
                        message += " and associated user account cleaned up."
                    else:
                        message += "."

                    return JsonResponse({"success": True, "message": message})

            except (UploadedMultipleFile.DoesNotExist, UserInfo.DoesNotExist):
                return JsonResponse({"success": False, "message": "Company not found."})
            except Exception as e:
                logger.exception("Error deleting company")
                return JsonResponse({"success": False, "message": f"Error deleting company: {str(e)}"})

        return JsonResponse({"success": False, "message": "Invalid request method."})

    def bulk_delete_companies(self, request):
        """Enhanced bulk delete for companies - skips admin users"""
        if request.method == 'POST':
            try:
                if request.content_type == 'application/json':
                    data = json.loads(request.body)
                    company_ids = data.get('company_ids', [])
                else:
                    company_ids = request.POST.getlist('company_ids')
                
                if not company_ids:
                    return JsonResponse({"success": False, "message": "No companies selected."})

                with transaction.atomic():
                    deleted_companies = []
                    affected_users = set()
                    errors = []
                    skipped_admins = []

                    for company_id in company_ids:
                        try:
                            if str(company_id).startswith('userinfo_'):
                                user_info_id = str(company_id).replace('userinfo_', '')
                                user_info = UserInfo.objects.get(id=user_info_id)
                                company_name = user_info.company_name
                                user = user_info.user

                                # ✅ Skip if user is admin
                                if user and user.is_admin:
                                    skipped_admins.append(company_name)
                                    print(f"Skipping {company_name} — belongs to admin {user.email}")
                                    continue

                                if user:
                                    affected_users.add(user)
                                
                                UploadedMultipleFile.objects.filter(user=user).delete()
                                user_info.delete()
                                deleted_companies.append(company_name)
                            
                            else:
                                company = UploadedMultipleFile.objects.get(id=company_id)
                                company_name = company.company_name
                                user = company.user

                                # ✅ Skip if user is admin
                                if user and user.is_admin:
                                    skipped_admins.append(company_name)
                                    print(f"Skipping {company_name} — belongs to admin {user.email}")
                                    continue

                                if user:
                                    affected_users.add(user)

                                company.delete()
                                deleted_companies.append(company_name)

                        except (UploadedMultipleFile.DoesNotExist, UserInfo.DoesNotExist):
                            errors.append(f"Company with ID {company_id} not found")
                            continue
                        except Exception as e:
                            errors.append(f"Error deleting company ID {company_id}: {str(e)}")
                            continue

                    cleaned_users = []
                    for user in affected_users:
                        try:
                            # ✅ Skip cleanup if user is admin
                            if user.is_admin:
                                print(f"Skipping cleanup for admin user {user.email}")
                                continue

                            remaining_user_info = UserInfo.objects.filter(user=user).exists()
                            remaining_companies = UploadedMultipleFile.objects.filter(user=user).exists()
                            remaining_files = UploadedFile.objects.filter(user=user).exists()
                            
                            if not remaining_user_info and not remaining_companies and not remaining_files:
                                try:
                                    Pricing.objects.filter(user=user).delete()
                                    UnlimitedPricing.objects.filter(user=user).delete()
                                    SubscriptionModel.objects.filter(user=user).delete()
                                    FreeplanModel.objects.filter(user=user).delete()
                                    UploadedFile.objects.filter(user=user).delete()
                                    UploadedMultipleFile.objects.filter(user=user).delete()
                                    UserInfo.objects.filter(user=user).delete()

                                    from rest_framework.authtoken.models import Token
                                    Token.objects.filter(user=user).delete()
                                    OTP.objects.filter(email=user.email).delete()
                                    ContactUsMailModel.objects.filter(email=user.email).delete()

                                    user_email = user.email
                                    user.delete()
                                    cleaned_users.append(user_email)
                                except Exception as cleanup_error:
                                    errors.append(f"Error cleaning up user {user.email}: {str(cleanup_error)}")
                            else:
                                print(f"User {user.email} still has remaining data, keeping account")

                        except User.DoesNotExist:
                            continue
                        except Exception as e:
                            errors.append(f"Error cleaning up user: {str(e)}")

                    if deleted_companies:
                        transaction.on_commit(lambda: self.trigger_geoserver_update(request, f"bulk deletion of {len(deleted_companies)} companies"))

                    message_parts = []
                    if deleted_companies:
                        if len(deleted_companies) <= 5:
                            message_parts.append(f"Successfully deleted {len(deleted_companies)} companies: {', '.join(deleted_companies)}")
                        else:
                            message_parts.append(f"Successfully deleted {len(deleted_companies)} companies: {', '.join(deleted_companies[:3])} and {len(deleted_companies) - 3} more")
                    
                    if skipped_admins:
                        message_parts.append(f"Skipped {len(skipped_admins)} admin-owned companies: {', '.join(skipped_admins[:3])}" + (f" and {len(skipped_admins)-3} more" if len(skipped_admins) > 3 else ""))

                    if cleaned_users:
                        if len(cleaned_users) <= 3:
                            message_parts.append(f"Performed comprehensive cleanup for {len(cleaned_users)} user accounts: {', '.join(cleaned_users)}")
                        else:
                            message_parts.append(f"Performed comprehensive cleanup for {len(cleaned_users)} user accounts: {', '.join(cleaned_users[:2])} and {len(cleaned_users) - 2} more")
                    
                    if errors:
                        message_parts.append(f"Note: {len(errors)} errors occurred during cleanup")
                    
                    success_message = ". ".join(message_parts) + "." if message_parts else "No companies were deleted."
                    
                    response_data = {
                        "success": True,
                        "message": success_message,
                        "details": {
                            "deleted_companies": len(deleted_companies),
                            "skipped_admins": len(skipped_admins),
                            "cleaned_users": len(cleaned_users),
                            "errors": errors,
                            "companies_deleted": deleted_companies[:10],
                            "companies_skipped": skipped_admins[:10],
                            "users_cleaned": cleaned_users[:10]
                        }
                    }
                    
                    return JsonResponse(response_data)
                        
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON data."})
            except Exception as e:
                return JsonResponse({"success": False, "message": f"Error deleting companies: {str(e)}"})
        
        return JsonResponse({"success": False, "message": "Invalid request method."})

    def bulk_delete_users(self, request):
        """Enhanced bulk delete for users with comprehensive cleanup"""
        if request.method == 'POST':
            try:
                data = json.loads(request.body)
                user_ids = data.get('user_ids', [])
                
                if not user_ids:
                    return JsonResponse({"success": False, "message": "No users selected."})

                with transaction.atomic():
                    deleted_count = 0
                    deleted_user_emails = []
                    skipped_superusers = []
                    errors = []
                    
                    for user_id in user_ids:
                        try:
                            user = User.objects.get(id=user_id)
                            
                            # Don't delete superusers
                            if user.is_superuser:
                                skipped_superusers.append(user.email)
                                continue
                            if user.is_admin:
                                continue
                                
                            user_email = user.email
                            
                            # Delete all related records comprehensively
                            try:
                                # Delete company records
                                company_count = UploadedMultipleFile.objects.filter(user=user).count()
                                UploadedMultipleFile.objects.filter(user=user).delete()
                                
                                # Delete uploaded files
                                file_count = UploadedFile.objects.filter(user=user).count()
                                UploadedFile.objects.filter(user=user).delete()
                                
                                # Delete user info
                                try:
                                    user_info = UserInfo.objects.get(user=user)
                                    user_info.delete()
                                except UserInfo.DoesNotExist:
                                    pass
                                
                                # Delete pricing records if they exist
                                try:
                                    from .models import Pricing, UnlimitedPricing, FreeplanModel, SubscriptionModel
                                    Pricing.objects.filter(user=user).delete()
                                    UnlimitedPricing.objects.filter(user=user).delete()
                                    FreeplanModel.objects.filter(user=user).delete()
                                    SubscriptionModel.objects.filter(user=user).delete()
                                except ImportError:
                                    pass  # Models don't exist
                                
                                # Delete the user
                                user.delete()
                                
                                deleted_count += 1
                                deleted_user_emails.append(f"{user_email} ({company_count} companies, {file_count} files)")
                                
                            except Exception as e:
                                errors.append(f"Error deleting data for {user_email}: {str(e)}")
                                
                        except User.DoesNotExist:
                            errors.append(f"User with ID {user_id} not found")
                            continue
                        except Exception as e:
                            errors.append(f"Error processing user ID {user_id}: {str(e)}")

                    # Trigger GeoServer update after bulk user deletion
                    if deleted_count > 0:
                        transaction.on_commit(lambda: self.trigger_geoserver_update(request, f"bulk deletion of {deleted_count} users"))

                    # Prepare response message
                    message_parts = []
                    if deleted_count > 0:
                        message_parts.append(f"Successfully deleted {deleted_count} users and all their associated data")
                    
                    if skipped_superusers:
                        message_parts.append(f"Skipped {len(skipped_superusers)} superuser accounts")
                    
                    if errors:
                        message_parts.append(f"Note: {len(errors)} errors occurred")
                    
                    response_data = {
                        "success": True,
                        "message": ". ".join(message_parts) + ". GeoServer map will be updated.",
                        "details": {
                            "deleted_users": deleted_count,
                            "skipped_superusers": len(skipped_superusers),
                            "errors": errors,
                            "deleted_details": deleted_user_emails[:10]  # Show first 10 for details
                        }
                    }
                    
                    return JsonResponse(response_data)
                        
            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON data."})
            except Exception as e:
                return JsonResponse({"success": False, "message": f"Error deleting users: {str(e)}"})
        
        return JsonResponse({"success": False, "message": "Invalid request method."})

    def upload_csv(self, request):
        print("Upload csv function called")
        """Enhanced CSV upload with proper data synchronization for CharField sector fields"""
        if not request.user.is_authenticated:
            return JsonResponse({"success": False, "message": "Only Admin users are allowed."}, status=403)
        
        # Handle GET request - show upload form
        if request.method == 'GET':
            context = {
                'title': 'Upload CSV Data',
                'sectors': Sector.objects.all().order_by('sector_name'),
                'opts': self.model._meta,
            }
            return render(request, 'admin/accounts/companydata/upload_csv.html', context)
            
        # Handle POST request - process uploaded file
        elif request.method == 'POST':
            try:
                csv_file = request.FILES.get('csv_file')
                sector_id = request.POST.get('sector')
                upload_type = request.POST.get('upload_type', 'user_info')  # user_info or company_data
                
                if not csv_file:
                    return JsonResponse({"success": False, "message": "No CSV file provided."}, status=400)

                # Determine sector based on upload type
                sector = None
                category = None
                
                if sector_id:
                    try:
                        sector = Sector.objects.get(id=sector_id)
                        category = Category.objects.filter(id=sector.category.id).first() if sector.category else None
                    except Sector.DoesNotExist:
                        return JsonResponse({"success": False, "message": "Selected sector does not exist."}, status=400)

                validate_csv_file(csv_file)
                csv_file.seek(0)

                try:
                    file_content = csv_file.read().decode('utf-8')
                except UnicodeDecodeError:
                    csv_file.seek(0)
                    file_content = csv_file.read().decode('latin-1')
                
                csv_data = io.StringIO(file_content)
                reader = csv_module.reader(csv_data)

                try:
                    headers = next(reader)
                    clean_headers = [h.strip().replace('"', '') for h in headers]
                except StopIteration:
                    return JsonResponse({"success": False, "message": "CSV file is empty"}, status=400)

                # Process based on upload type
                if upload_type == 'user_info':
                    result = self._process_user_info_csv(reader, clean_headers, sector, category, request)
                else:
                    result = self._process_company_data_csv(reader, clean_headers, sector, category, request)
                
                # Trigger GeoServer update after CSV upload
                if result.status_code == 200:
                    transaction.on_commit(lambda: self.trigger_geoserver_update(request, f"CSV upload ({upload_type})"))
                
                return result
                    
            except Exception as e:
                traceback_text = traceback.format_exc()
                print(f"Error processing CSV: {str(e)}")
                print(traceback_text)
                return JsonResponse({"success": False, "message": f"Error processing file: {str(e)}"}, status=500)
        
        return JsonResponse({"success": False, "message": "Invalid request method."}, status=400)

    def _process_user_info_csv(self, reader, headers, sector, category, request):
        """Process user info CSV with CharField sector field handling"""
        # Find required columns
        required_columns = ['Company Name', 'Company Email', 'Company Address']
        optional_columns = ['Contact Name', 'Company Phone', 'Company Website', 'Service Type']
        
        column_mapping = {}
        for i, header in enumerate(headers):
            header_clean = header.strip().replace('"', '')
            if header_clean in required_columns + optional_columns:
                column_mapping[header_clean] = i

        # Check for missing required columns
        missing_required = [col for col in required_columns if col not in column_mapping]
        if missing_required:
            return JsonResponse({
                "success": False, 
                "message": f"Missing required columns: {', '.join(missing_required)}"
            }, status=400)

        processed_count = 0
        errors = []
        duplicates = []

        for row_num, row in enumerate(reader, start=1):
            try:
                row = [val.strip().replace('"', '') for val in row]
                
                # Extract data
                company_name = row[column_mapping['Company Name']] if column_mapping.get('Company Name', -1) < len(row) else ""
                company_email = row[column_mapping['Company Email']] if column_mapping.get('Company Email', -1) < len(row) else ""
                company_address = row[column_mapping['Company Address']] if column_mapping.get('Company Address', -1) < len(row) else ""
                contact_name = row[column_mapping.get('Contact Name', -1)] if column_mapping.get('Contact Name', -1) < len(row) and column_mapping.get('Contact Name', -1) >= 0 else ""
                company_phone = row[column_mapping.get('Company Phone', -1)] if column_mapping.get('Company Phone', -1) < len(row) and column_mapping.get('Company Phone', -1) >= 0 else ""
                company_website = row[column_mapping.get('Company Website', -1)] if column_mapping.get('Company Website', -1) < len(row) and column_mapping.get('Company Website', -1) >= 0 else ""
                service_type = row[column_mapping.get('Service Type', -1)] if column_mapping.get('Service Type', -1) < len(row) and column_mapping.get('Service Type', -1) >= 0 else ""

                if not all([company_name, company_email, company_address]):
                    errors.append(f"Row {row_num}: Missing required fields")
                    continue

                # Determine sector
                current_sector = sector
                current_category = category
                
                if service_type and not sector:
                    current_sector = Sector.objects.filter(sector_name=service_type.strip()).first()
                    if current_sector:
                        current_category = Category.objects.filter(id=current_sector.category.id).first() if current_sector.category else None
                
                if not current_sector:
                    errors.append(f"Row {row_num}: No valid sector found")
                    continue

                # Create/update user with proper password and settings
                random_password = generate_secure_password(8)
                expiry_date = date.today() + timedelta(days=30)

                user, user_created = User.objects.update_or_create(
                    email=company_email.strip(),
                    defaults={
                        'password': make_password(random_password),
                        'is_active': False,
                        'is_staff': False,
                        'is_admin': False,
                        'is_google': False,
                        'expiry_date': expiry_date,
                        'feature_count': 100,
                        'plan_name': '30 Day Free Trial',
                    }
                )

                # Create/update UserInfo with CharField sector field (store sector ID as string)
                user_info, userinfo_created = UserInfo.objects.update_or_create(
                    user=user,
                    defaults={
                        'contact_name': contact_name,
                        'sector': str(current_sector.id),  # Store sector ID as string in CharField
                        'category_id': current_category.id if current_category else None,
                        'company_phone': company_phone,
                        'company_name': company_name,
                        'company_email': company_email,
                        'company_address': company_address,
                        'company_website': company_website,
                    }
                )

                # Check for duplicates
                existing_entry = UploadedMultipleFile.objects.filter(
                    company_name=company_name,
                    address=company_address,
                    is_active=True
                ).first()

                if existing_entry:
                    duplicates.append(f"Row {row_num}: Duplicate company at same address")
                    continue

                # Geocode address
                latitude, longitude = geocode_address(company_address) if company_address else (None, None)
                geom = Point(longitude, latitude) if latitude and longitude else None

                # Create UploadedFile record
                uploaded_file, file_created = UploadedFile.objects.update_or_create(
                    user=user,
                    defaults={
                        'sector': str(current_sector.id),  # CharField
                        'category_id': current_category.id if current_category else None,
                        'file': None,
                        'video_file': None,
                        'latitude': str(latitude) if latitude else None,
                        'longitude': str(longitude) if longitude else None,
                        'address': company_address,
                        'geom': geom
                    }
                )

                # Create/update UploadedMultipleFile record
                uploaded_multiple_file, multiple_created = UploadedMultipleFile.objects.update_or_create(
                    user=user,
                    company_name=company_name,
                    address=company_address,
                    defaults={
                        'sector_id': current_sector.id,
                        'sector': str(current_sector.id),  # CharField compatibility
                        'sector_name': current_sector.sector_name,
                        'category_id': current_category.id if current_category else None,
                        'category_name': current_category.category_name if current_category else "",
                        'latitude': str(latitude) if latitude else None,
                        'longitude': str(longitude) if longitude else None,
                        'is_active': False,
                        'expiry_date': expiry_date,
                        'geom': geom
                    }
                )

                # Send welcome email if user was created
                if user_created:
                    try:
                        current_site = get_current_site(request)
                        subject = "Welcome to YardSignProShop!"
                        message = render_to_string('accounts/welcome_email_bulk_users.html', {
                            'user': {
                                'contact_name': contact_name,
                                'company_name': company_name,
                                'email': company_email,
                                'password': random_password,
                            },
                            'domain': current_site.domain,
                            'uid': user.pk,
                            'token': account_activation_token.make_token(user),
                        })

                        postmark.emails.send(
                            From=settings.EMAIL_HOST_USER,
                            To=[company_email, settings.EMAIL_HOST_USER],
                            Subject=subject,
                            HtmlBody=message
                        )
                    except Exception as e:
                        print(f"Error sending email to {company_email}: {str(e)}")

                processed_count += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue

        response_data = {
            "success": True,
            "message": f"Processed {processed_count} users successfully."
        }
        
        if errors:
            response_data["errors"] = errors
        if duplicates:
            response_data["duplicates"] = duplicates

        return JsonResponse(response_data)

    def _process_company_data_csv(self, reader, headers, sector, category, request):
        """Process company data CSV for yard sign placement with CharField sector handling"""
        required_columns = ['Company Name', 'Company Website', 'Company Address']
        optional_columns = ['Company Email', 'Contact Name', 'Company Phone']
        
        column_mapping = {}
        for i, header in enumerate(headers):
            header_clean = header.strip().replace('"', '')
            if header_clean in required_columns + optional_columns:
                column_mapping[header_clean] = i

        missing_required = [col for col in required_columns if col not in column_mapping]
        if missing_required:
            return JsonResponse({
                "success": False, 
                "message": f"Missing required columns: {', '.join(missing_required)}"
            }, status=400)

        if not sector:
            return JsonResponse({"success": False, "message": "Sector is required for company data upload."}, status=400)

        processed_count = 0
        errors = []
        duplicates = []

        for row_num, row in enumerate(reader, start=1):
            try:
                row = [val.strip().replace('"', '') for val in row]
                
                company_name = row[column_mapping['Company Name']] if column_mapping.get('Company Name', -1) < len(row) else ""
                company_website = row[column_mapping['Company Website']] if column_mapping.get('Company Website', -1) < len(row) else ""
                company_address = row[column_mapping['Company Address']] if column_mapping.get('Company Address', -1) < len(row) else ""
                company_email = row[column_mapping.get('Company Email', -1)] if column_mapping.get('Company Email', -1) < len(row) and column_mapping.get('Company Email', -1) >= 0 else ""
                contact_name = row[column_mapping.get('Contact Name', -1)] if column_mapping.get('Contact Name', -1) < len(row) and column_mapping.get('Contact Name', -1) >= 0 else ""
                company_phone = row[column_mapping.get('Company Phone', -1)] if column_mapping.get('Company Phone', -1) < len(row) and column_mapping.get('Company Phone', -1) >= 0 else ""

                if not all([company_name, company_website, company_address]):
                    errors.append(f"Row {row_num}: Missing required fields")
                    continue

                # Check for duplicates
                existing_entry = UploadedMultipleFile.objects.filter(
                    company_name=company_name,
                    address=company_address
                ).first()

                if existing_entry:
                    duplicates.append(
                        f"Row {row_num}: Duplicate found — '{company_name}' at address '{company_address}' already exists."
                    )
                    continue

                # Geocode address
                latitude, longitude = geocode_address(company_address)
                if not latitude or not longitude:
                    errors.append(f"Row {row_num}: Unable to geocode address")
                    continue

                # Create or get user
                user_email = company_email if company_email else f"csv-import-{slugify(company_name)}@example.com"
                user, user_created = User.objects.get_or_create(
                    email=user_email,
                    defaults={
                        'is_active': False,
                        'password': make_password(generate_secure_password(12)),
                    }
                )

                # Create or update UserInfo
                user_info, info_created = UserInfo.objects.get_or_create(
                    user=user,
                    defaults={
                        'contact_name': contact_name if contact_name else 'None',
                        'sector': str(sector.id),
                        'category_id': category.id if category else None,
                        'company_phone': company_phone if company_phone else None,
                        'company_name': company_name,
                        'company_email': company_email if company_email else None,
                        'company_address': company_address,
                        'company_website': company_website,
                        'hide': False
                    }
                )
                
                # # If UserInfo already exists but this is a new upload, update the fields
                # if not info_created:
                #     user_info.contact_name = contact_name if contact_name else user_info.contact_name
                #     user_info.sector = str(sector.id)
                #     user_info.category_id = category.id if category else user_info.category_id
                #     user_info.company_phone = company_phone if company_phone else user_info.company_phone
                #     user_info.company_name = company_name
                #     user_info.company_email = company_email if company_email else user_info.company_email
                #     user_info.company_address = company_address
                #     user_info.company_website = company_website
                #     user_info.save()

                # Create yard sign record
                geom = Point(longitude, latitude)
                UploadedMultipleFile.objects.create(
                    user=user,
                    sector_id=sector.id,
                    sector=str(sector.id),
                    sector_name=sector.sector_name,
                    category_id=category.id if category else None,
                    category_name=category.category_name if category else "",
                    company_name=company_name,
                    latitude=str(latitude),
                    longitude=str(longitude),
                    address=company_address,
                    is_active=False,
                    geom=geom
                )

                processed_count += 1

            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue

        response_data = {
            "success": True,
            "message": f"Processed {processed_count} companies successfully."
        }
        
        if errors:
            response_data["errors"] = errors
        if duplicates:
            response_data["duplicates"] = duplicates

        return JsonResponse(response_data)
    
    def bulk_activate_users(self, request):
        """Bulk activate selected users"""
        if request.method == 'POST':
            data = json.loads(request.body)
            user_ids = data.get('user_ids', [])
            
            if not user_ids:
                return JsonResponse({"success": False, "message": "No users selected."})

            try:
                updated_count = User.objects.filter(id__in=user_ids).update(is_active=True)
                return JsonResponse({
                    "success": True, 
                    "message": f"Successfully activated {updated_count} users."
                })
            except Exception as e:
                return JsonResponse({"success": False, "message": f"Error activating users: {str(e)}"})
        
        return JsonResponse({"success": False, "message": "Invalid request method."})

    def bulk_deactivate_users(self, request):
        """Bulk deactivate selected users"""
        if request.method == 'POST':
            data = json.loads(request.body)
            user_ids = data.get('user_ids', [])
            
            if not user_ids:
                return JsonResponse({"success": False, "message": "No users selected."})

            try:
                # Don't deactivate superusers
                updated_count = User.objects.filter(
                    id__in=user_ids, 
                    is_superuser=False
                ).update(is_active=False)
                return JsonResponse({
                    "success": True, 
                    "message": f"Successfully deactivated {updated_count} users."
                })
            except Exception as e:
                return JsonResponse({"success": False, "message": f"Error deactivating users: {str(e)}"})
        
        return JsonResponse({"success": False, "message": "Invalid request method."})

    def export_companies(self, request):
        """Enhanced export with better filtering and more data - now based on UserInfo"""
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="companies_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Company Name', 'Sector', 'Category', 'Address', 'Website', 
            'Contact Name', 'Phone', 'Email', 'Status', 'User Active', 'Registration Date', 
            'Latitude', 'Longitude', 'Expiry Date', 'Plan Name', 'Sector ID'
        ])
        
        # Get selected companies or all companies from UserInfo
        company_ids = request.POST.getlist('company_ids') if request.method == 'POST' else []
        
        if company_ids:
            # Handle mixed ID types (userinfo_123 and regular IDs)
            user_info_ids = []
            regular_company_ids = []
            
            for company_id in company_ids:
                if str(company_id).startswith('userinfo_'):
                    user_info_ids.append(str(company_id).replace('userinfo_', ''))
                else:
                    regular_company_ids.append(company_id)
            
            # Get UserInfo records
            user_infos = UserInfo.objects.filter(id__in=user_info_ids) if user_info_ids else UserInfo.objects.none()
            
            # Get UserInfo for regular company IDs
            if regular_company_ids:
                companies = UploadedMultipleFile.objects.filter(id__in=regular_company_ids, is_active=True)
                company_users = [company.user for company in companies if company.user]
                additional_user_infos = UserInfo.objects.filter(user__in=company_users)
                user_infos = user_infos.union(additional_user_infos)
        else:
            user_infos = UserInfo.objects.all()
        
        user_infos = user_infos.select_related('user').order_by('company_name')
        
        for user_info in user_infos:
            try:
                # Get sector information
                sector = None
                sector_name = ""
                category_name = ""
                sector_id = ""
                
                if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                    try:
                        sector_id_int = int(user_info.sector.strip())
                        sector = Sector.objects.get(id=sector_id_int)
                        sector_name = sector.sector_name
                        category_name = sector.category.category_name if sector.category else ""
                        sector_id = str(sector_id_int)
                    except (ValueError, Sector.DoesNotExist):
                        pass
                
                # Try to get coordinates from UploadedMultipleFile if available
                latitude = ""
                longitude = ""
                expiry_date = ""
                
                if user_info.user:
                    company_entry = UploadedMultipleFile.objects.filter(
                        user=user_info.user,
                        is_active=True
                    ).first()
                    
                    if company_entry:
                        latitude = company_entry.latitude or ""
                        longitude = company_entry.longitude or ""
                        expiry_date = company_entry.expiry_date.strftime('%Y-%m-%d') if company_entry.expiry_date else ""
                
                writer.writerow([
                    f"userinfo_{user_info.id}",  # Use UserInfo ID with prefix
                    user_info.company_name or '',
                    sector_name,
                    category_name,
                    user_info.company_address or '',
                    user_info.company_website or '',
                    user_info.contact_name or '',
                    user_info.company_phone or '',
                    user_info.user.email if user_info.user else '',
                    'Registered' if user_info.user and user_info.user.is_active else 'Unregistered',
                    'Yes' if user_info.user and user_info.user.is_active else 'No',
                    user_info.user.date_joined.strftime('%Y-%m-%d') if user_info.user and hasattr(user_info.user, 'date_joined') else '',
                    latitude,
                    longitude,
                    expiry_date,
                    user_info.user.plan_name if user_info.user and hasattr(user_info.user, 'plan_name') else '',
                    sector_id,
                ])
                
            except Exception as e:
                # Log error but continue processing
                print(f"Error exporting user info {user_info.id}: {str(e)}")
                continue
        
        return response
    
    def refresh_all_data(self, request):
        """Force refresh of all cached data and trigger updates"""
        if request.method == 'POST':
            try:
                with transaction.atomic():
                    # Clean up any orphaned records
                    self._cleanup_orphaned_records()
                    
                    # Trigger GeoServer update
                    transaction.on_commit(lambda: self.trigger_geoserver_update(request, "data refresh"))
                    
                    return JsonResponse({
                        "success": True, 
                        "message": "All data refreshed and synchronized successfully."
                    })
            except Exception as e:
                return JsonResponse({
                    "success": False, 
                    "message": f"Error refreshing data: {str(e)}"
                })
        
        return JsonResponse({"success": False, "message": "Invalid request method."})

    def _cleanup_orphaned_records(self):
        """Clean up any orphaned records in the database"""
        try:
            # Find UserInfo records without corresponding Users
            orphaned_userinfo = UserInfo.objects.filter(user__isnull=True)
            userinfo_count = orphaned_userinfo.count()
            orphaned_userinfo.delete()
            
            # Find UploadedFile records without corresponding Users
            orphaned_files = UploadedFile.objects.filter(user__isnull=True)
            files_count = orphaned_files.count()
            orphaned_files.delete()
            
            # Find UploadedMultipleFile records without corresponding Users
            orphaned_companies = UploadedMultipleFile.objects.filter(user__isnull=True)
            companies_count = orphaned_companies.count()
            orphaned_companies.delete()
            
            if userinfo_count > 0 or files_count > 0 or companies_count > 0:
                print(f"Cleaned up orphaned records: {userinfo_count} UserInfo, {files_count} UploadedFile, {companies_count} UploadedMultipleFile")
                
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")

    def export_users(self, request):
        """Export users to CSV"""
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Email', 'Company Name', 'Contact Name', 'Sector', 'Category',
            'Phone', 'Website', 'Address', 'Status', 'Plan', 'Expiry Date',
            'Last Login', 'Is Staff', 'Is Superuser'
        ])
        
        # Get selected users or all users
        user_ids = request.POST.getlist('user_ids') if request.method == 'POST' else []
        
        if user_ids:
            users = User.objects.filter(id__in=user_ids)
        else:
            users = User.objects.all()
        
        for user in users:
            try:
                user_info = UserInfo.objects.get(user=user)
                sector = None
                sector_name = ""
                category_name = ""
                
                # Handle CharField sector field
                if user_info.sector and user_info.sector.strip() and user_info.sector != 'None':
                    try:
                        sector_id = int(user_info.sector.strip())
                        sector = Sector.objects.get(id=sector_id)
                        sector_name = sector.sector_name
                        category_name = sector.category.category_name if sector.category else ""
                    except (ValueError, Sector.DoesNotExist):
                        pass
                
                writer.writerow([
                    user.id,
                    user.email,
                    user_info.company_name,
                    user_info.contact_name,
                    sector_name,
                    category_name,
                    user_info.company_phone,
                    user_info.company_website,
                    user_info.company_address,
                    'Active' if user.is_active else 'Inactive',
                    user.plan_name if hasattr(user, 'plan_name') else '',
                    user.expiry_date.strftime('%Y-%m-%d') if hasattr(user, 'expiry_date') and user.expiry_date else '',
                    user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else '',
                    'Yes' if user.is_staff else 'No',
                    'Yes' if user.is_superuser else 'No',
                ])
            except UserInfo.DoesNotExist:
                writer.writerow([
                    user.id,
                    user.email,
                    '', '', '', '', '', '', '',
                    'Active' if user.is_active else 'Inactive',
                    user.plan_name if hasattr(user, 'plan_name') else '',
                    user.expiry_date.strftime('%Y-%m-%d') if hasattr(user, 'expiry_date') and user.expiry_date else '',
                    user.last_login.strftime('%Y-%m-%d %H:%M') if user.last_login else '',
                    'Yes' if user.is_staff else 'No',
                    'Yes' if user.is_superuser else 'No',
                ])
        
        return response

    def bulk_delete_sectors(self, request):
        """Bulk delete selected sectors with cascade deletion of associated data (skips admin users)"""
        if request.method == 'POST':
            try:
                # Handle JSON data (sent from JavaScript)
                if request.content_type == 'application/json':
                    data = json.loads(request.body)
                    sector_ids = data.get('sector_ids', [])
                else:
                    # Handle form data (traditional POST)
                    sector_ids = request.POST.getlist('sector_ids')
                
                if not sector_ids:
                    return JsonResponse({"success": False, "message": "No sectors selected."})

                with transaction.atomic():
                    deleted_sectors = []
                    cascade_deleted_data = []
                    skipped_admins = []

                    for sector_id in sector_ids:
                        try:
                            sector = Sector.objects.get(id=sector_id)
                            users_to_delete = []

                            # --- UserInfo-based users linked with this sector ---
                            userinfos_with_sector = UserInfo.objects.filter(sector=str(sector_id))
                            for user_info in userinfos_with_sector:
                                user = user_info.user
                                if not user:
                                    continue
                                if user.is_admin:
                                    skipped_admins.append(user.email)
                                    print(f"Skipping admin (UserInfo): {user.email}")
                                    continue
                                if user not in users_to_delete:
                                    users_to_delete.append(user)

                            # --- UploadedFile-based users linked with this sector ---
                            uploaded_files_with_sector = UploadedFile.objects.filter(sector=str(sector_id))
                            for uploaded_file in uploaded_files_with_sector:
                                user = uploaded_file.user
                                if not user:
                                    continue
                                if user.is_admin:
                                    skipped_admins.append(user.email)
                                    print(f"Skipping admin (UploadedFile): {user.email}")
                                    continue
                                if user not in users_to_delete:
                                    users_to_delete.append(user)

                            # --- UploadedMultipleFile-based users linked with this sector ---
                            uploaded_multiple_with_sector = UploadedMultipleFile.objects.filter(sector_id=sector_id)
                            for uploaded_multiple in uploaded_multiple_with_sector:
                                user = uploaded_multiple.user
                                if not user:
                                    continue
                                if user.is_admin:
                                    skipped_admins.append(user.email)
                                    print(f"Skipping admin (UploadedMultipleFile): {user.email}")
                                    continue
                                if user not in users_to_delete:
                                    users_to_delete.append(user)

                            # --- Cascade delete user data (non-admins only) ---
                            for user in users_to_delete:
                                try:
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

                                    cascade_deleted_data.append(user.email)
                                except Exception as user_error:
                                    print(f"Error deleting user {user.email}: {user_error}")
                                    continue

                            # --- Delete the sector itself ---
                            deleted_sectors.append(sector.sector_name)
                            sector.delete()

                        except Sector.DoesNotExist:
                            continue
                        except Exception as e:
                            print(f"Error processing sector {sector_id}: {e}")
                            continue

                    # --- Prepare response message ---
                    message_parts = []
                    if deleted_sectors:
                        message_parts.append(
                            f"Successfully deleted {len(deleted_sectors)} sectors: {', '.join(deleted_sectors[:3])}"
                            + (f" and {len(deleted_sectors) - 3} more." if len(deleted_sectors) > 3 else ".")
                        )
                    if cascade_deleted_data:
                        message_parts.append(
                            f"Deleted associated data for {len(cascade_deleted_data)} users: {', '.join(cascade_deleted_data[:3])}"
                            + (f" and {len(cascade_deleted_data) - 3} more." if len(cascade_deleted_data) > 3 else ".")
                        )
                    if skipped_admins:
                        message_parts.append(
                            f"Skipped {len(skipped_admins)} admin users: {', '.join(skipped_admins[:3])}"
                            + (f" and {len(skipped_admins) - 3} more." if len(skipped_admins) > 3 else ".")
                        )

                    # --- Trigger GeoServer update after sector deletion ---
                    if deleted_sectors:
                        transaction.on_commit(lambda: self.trigger_geoserver_update(
                            request, f"bulk deletion of {len(deleted_sectors)} sectors"
                        ))

                    return JsonResponse({
                        "success": True,
                        "message": " ".join(message_parts),
                        "details": {
                            "deleted_sectors": len(deleted_sectors),
                            "deleted_users": len(cascade_deleted_data),
                            "skipped_admins": len(skipped_admins),
                            "sectors_deleted": deleted_sectors[:10],
                            "users_deleted": cascade_deleted_data[:10],
                            "admins_skipped": skipped_admins[:10],
                        }
                    })

            except json.JSONDecodeError:
                return JsonResponse({"success": False, "message": "Invalid JSON data."})
            except Exception as e:
                return JsonResponse({"success": False, "message": f"Error deleting sectors: {str(e)}"})

        return JsonResponse({"success": False, "message": "Invalid request method."})

    def get_urls(self):
        urls = super().get_urls()
        info = self.model._meta.app_label, self.model._meta.model_name
        
        custom_urls = [
            # Company management
            path('sector/<int:sector_id>/companies/', 
                self.admin_site.admin_view(self.companies_in_sector), 
                name='%s_%s_sector_companies' % info),
            path('company/<int:company_id>/edit/', 
                self.admin_site.admin_view(self.edit_company), 
                name='%s_%s_edit_company' % info),
            path('company/<int:company_id>/delete_yard_sign/', 
                self.admin_site.admin_view(self.delete_company_yard_sign), 
                name='%s_%s_delete_company_yard_sign' % info),
            path('company/<int:company_id>/delete/', 
                self.admin_site.admin_view(self.delete_company), 
                name='%s_%s_delete_company' % info),
            
            # Bulk operations
            path('companies/bulk-delete/', 
                self.admin_site.admin_view(self.bulk_delete_companies), 
                name='%s_%s_bulk_delete_companies' % info),
            path('sectors/bulk-delete/', 
                self.admin_site.admin_view(self.bulk_delete_sectors), 
                name='%s_%s_bulk_delete_sectors' % info),
            path('users/bulk-activate/', 
                self.admin_site.admin_view(self.bulk_activate_users), 
                name='%s_%s_bulk_activate_users' % info),
            path('users/bulk-deactivate/', 
                self.admin_site.admin_view(self.bulk_deactivate_users), 
                name='%s_%s_bulk_deactivate_users' % info),
            path('users/bulk-delete/', 
                self.admin_site.admin_view(self.bulk_delete_users), 
                name='%s_%s_bulk_delete_users' % info),

            path('refresh-data/', 
                self.admin_site.admin_view(self.refresh_all_data), 
                name='%s_%s_refresh_data' % info),

            path('export/companies/', 
                self.admin_site.admin_view(self.export_companies), 
                name='%s_%s_export_companies' % info),
            path('export/users/', 
                self.admin_site.admin_view(self.export_users), 
                name='%s_%s_export_users' % info),

            path('upload-csv/', 
                self.admin_site.admin_view(self.upload_csv), 
                name='%s_%s_upload_csv' % info),
        ]
        return custom_urls + urls

# Keep sector management as separate admin for GeoServer integration
@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ['sector_name', 'logo', 'get_category_name', 'get_company_count']
    search_fields = ['sector_name', 'logo']
    list_filter = ['category']
    ordering = ['sector_name']
    form = SectorForm
    actions = ['delete_selected']

    def get_category_name(self, obj):
        return obj.category.category_name if obj.category else "No Category"
    get_category_name.short_description = 'Category'
    get_category_name.admin_order_field = 'category__category_name'
    
    def get_company_count(self, obj):
        # Count companies from UserInfo table instead of UploadedMultipleFile to avoid duplicates
        count = UserInfo.objects.filter(sector=str(obj.id)).count()
        return format_html(
            '<a href="/admin/accounts/companydata/sector/{}/companies/">{} companies</a>',
            obj.id, count
        )

    get_company_count.short_description = 'Companies'

    def fetch_data(self):
        """Fetch sector-related data from the database."""
        conn = psycopg2.connect("dbname=yardsigndev user=postgres password=fPWT01zgWNcB2NdOb2l6 host=yardsigndev.czbiko0d2y4q.us-east-1.rds.amazonaws.com")
        conn.set_session(autocommit=True)
        cur = conn.cursor()
        cur.execute("SELECT *, split_part(logo, '/', 4) as img FROM public.accounts_sector")
        data = cur.fetchall()
        cur.close()
        conn.close()
        return data

    def generate_sld(self, data):
        sld = ET.Element('StyledLayerDescriptor', attrib={
            'version': '1.0.0',
            'xsi:schemaLocation': 'http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd',
            'xmlns': 'http://www.opengis.net/sld',
            'xmlns:ogc': 'http://www.opengis.net/ogc',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        })

        named_layer = ET.SubElement(sld, 'NamedLayer')
        name = ET.SubElement(named_layer, 'Name')
        name.text = 'yardsign'

        user_style = ET.SubElement(named_layer, 'UserStyle')
        title = ET.SubElement(user_style, 'Title')
        title.text = 'Icon Mapping'

        feature_type_style = ET.SubElement(user_style, 'FeatureTypeStyle')
        link = 'https://yardsignproshop.com:9443'

        for element in data:
            _, sector_name, logo, category_id, img = element 
            rule = ET.SubElement(feature_type_style, 'Rule')
            rule_title = ET.SubElement(rule, 'Title')
            rule_title.text = sector_name 
 
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

            point_symbolizer = ET.SubElement(rule, 'PointSymbolizer')
            graphic = ET.SubElement(point_symbolizer, 'Graphic')
            external_graphic = ET.SubElement(graphic, 'ExternalGraphic')
            online_resource = ET.SubElement(external_graphic, 'OnlineResource', attrib={
                'xlink:type': 'simple',
                'xlink:href': link + logo
            })
            format_tag = ET.SubElement(external_graphic, 'Format')
            format_tag.text = 'image/png'
            size = ET.SubElement(graphic, 'Size')
            size.text = '50' 

            text_symbolizer = ET.SubElement(rule, 'TextSymbolizer')
            label = ET.SubElement(text_symbolizer, 'Label')
            prop_name_2 = ET.SubElement(label, 'ogc:PropertyName')
            prop_name_2.text = 'company_name'
            font = ET.SubElement(text_symbolizer, 'Font')
            css_param_font = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-family'})
            css_param_font.text = 'Arial'
            css_param_size = ET.SubElement(font, 'CssParameter', attrib={'name': 'font-size'})
            css_param_size.text = '14'

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

            halo = ET.SubElement(text_symbolizer, 'Halo')
            radius = ET.SubElement(halo, 'Radius')
            ogc_literal_radius = ET.SubElement(radius, 'ogc:Literal')
            ogc_literal_radius.text = '2'
            fill_halo = ET.SubElement(halo, 'Fill')
            css_param_fill_halo = ET.SubElement(fill_halo, 'CssParameter', attrib={'name': 'fill'})
            css_param_fill_halo.text = '#FFFFFF'

        return ET.tostring(sld).decode()

    def update_geoserver_style(self, sld_xml):
        """Update GeoServer style using PUT request."""
        geoserver_url = 'https://yardsignproshop.com:8081/geoserver/rest/workspaces/yard_sign/styles/'
        headers = {'Content-type': 'application/vnd.ogc.sld+xml'}
        auth = ('admin', 'yardsign_geoserver')
        response = requests.put(f'{geoserver_url}yard_db2', data=sld_xml, headers=headers, auth=auth, verify=False)
        return response.status_code, response.text

    def save_model(self, request, obj, form, change):
        if not request.user.is_authenticated or not request.user.is_superuser:
            messages.error(request, "Only Admin user is allowed.")
            return
        
        with transaction.atomic():
            if not change:
                category_name = form.cleaned_data.get('category')
                if category_name:
                    category, created = Category.objects.get_or_create(category_name=category_name)

                    if created:
                        messages.info(request, f"New category '{category_name}' created.")
                    else:
                        messages.info(request, f"Using existing category '{category_name}'.")

                sector_name = form.cleaned_data.get('sector_name')
                logo = request.FILES.get('logo')

                if not logo:
                    messages.error(request, "Logo is required.")
                    return

                original_filename, original_extension = os.path.splitext(logo.name)
                original_filename = original_filename.replace(' ', '_')
                filename = slugify(original_filename) + original_extension

                file_path = default_storage.save(f'sector/{filename}', ContentFile(logo.read()))
                logo_url = settings.MEDIA_URL + file_path

                obj.sector_name = sector_name
                obj.category = category
                obj.logo = logo_url

            else:
                sector_name = form.cleaned_data.get('sector_name')
                logo = request.FILES.get('logo')

                if logo:
                    original_filename, original_extension = os.path.splitext(logo.name)
                    original_filename = original_filename.replace(' ', '_')
                    filename = slugify(original_filename) + original_extension

                    file_path = default_storage.save(f'sector/{filename}', ContentFile(logo.read()))
                    logo_url = settings.MEDIA_URL + file_path

                    obj.logo = logo_url

                category_obj = form.cleaned_data.get('category')
                if category_obj:
                    obj.category = category_obj

                obj.sector_name = form.cleaned_data.get('sector_name')

            super().save_model(request, obj, form, change)

            transaction.on_commit(lambda: self.update_geoserver(request, obj, change))

    def update_geoserver(self, request, obj, is_update):
        try:
            data = self.fetch_data()
            if data is None:
                messages.error(request, "No data fetched for the sector.")
                return

            sld_xml = self.generate_sld(data)
            if sld_xml is None:
                messages.error(request, "Failed to generate SLD.")
                return

            status_code, response_text = self.update_geoserver_style(sld_xml)
            if status_code != 200:
                messages.error(request, f"Failed to update GeoServer: {response_text}")
                return

            messages.success(request, f"{'Sector updated' if is_update else 'Sector created'} successfully!")
        except Exception as e:
            messages.error(request, f"Error occurred: {str(e)}")

    def delete_model(self, request, obj):
        """Override the delete_model method to add the delete logic"""
        if not request.user.is_authenticated or not request.user.is_superuser:
            messages.error(request, "Only Admin user is allowed.")
            return
        
        with transaction.atomic():
            sector_id = obj.id
            
            # Check CharField fields for sector usage
            userinfo = UserInfo.objects.filter(sector=str(sector_id))
            upload_file_info = UploadedFile.objects.filter(sector=str(sector_id))
            upload_multiple_file_info = UploadedMultipleFile.objects.filter(sector_id=sector_id)

            if userinfo.exists() or upload_file_info.exists() or upload_multiple_file_info.exists():
                messages.error(request, "This Sector is already in use and cannot be deleted!!")
                return
            else:
                sector_name = obj.sector_name
                super().delete_model(request, obj)
                messages.success(request, f"Successfully deleted sector: {sector_name}")
                transaction.on_commit(lambda: self.update_geoserver_after_delete(request))

    def delete_queryset(self, request, queryset):
        """Handle bulk deletion of sectors"""
        if not request.user.is_authenticated or not request.user.is_superuser:
            messages.error(request, "Only Admin user is allowed.")
            return

        with transaction.atomic():
            sectors_deleted = []
            sectors_in_use = []

            for sector in queryset:
                # Check CharField fields for sector usage
                userinfo = UserInfo.objects.filter(sector=str(sector.id))
                upload_file_info = UploadedFile.objects.filter(sector=str(sector.id))
                upload_multiple_file_info = UploadedMultipleFile.objects.filter(sector_id=sector.id)

                if userinfo.exists() or upload_file_info.exists() or upload_multiple_file_info.exists():
                    sectors_in_use.append(sector.sector_name)
                    continue

                sectors_deleted.append(sector.sector_name)
                sector.delete()

            if sectors_deleted:
                deleted_names = ", ".join(sectors_deleted)
                messages.success(request, f"Successfully deleted sectors: {deleted_names}")

            if sectors_in_use:
                in_use_names = ", ".join(sectors_in_use)
                messages.error(request, f"Could not delete sectors in use: {in_use_names}")

            if sectors_deleted:
                transaction.on_commit(lambda: self.update_geoserver_after_delete(request))

    def update_geoserver_after_delete(self, request):
        """Update GeoServer after any type of deletion"""
        try:
            data = self.fetch_data()
            if data is None:
                messages.error(request, "No data fetched after sector deletion.")
                return

            sld_xml = self.generate_sld(data)
            if sld_xml is None:
                messages.error(request, "Failed to generate SLD after deletion.")
                return

            status_code, response_text = self.update_geoserver_style(sld_xml)
            print(f'Status Code: {status_code}')
            print(f'Response: {response_text}')

            if status_code == 200:
                messages.success(request, "GeoServer updated successfully after deletion.")
            else:
                messages.error(request, f"Failed to update GeoServer: {response_text}")

        except Exception as e:
            messages.error(request, f"Error updating GeoServer after deletion: {str(e)}")

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'category_name']
    search_fields = ['id', 'category_name']
    ordering = ['id']