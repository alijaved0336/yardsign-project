from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.gis.db import models
from django.db.models import Manager as GeoManager
from django.contrib.postgres.fields import ArrayField
from django.conf import settings
import uuid

from datetime import timedelta
from django.utils import timezone
from rest_framework.authtoken.models import Token

class ExpiringToken(Token):
    """
    Extends DRF Token model with an expiration check.
    """
    class Meta:
        proxy = True  # no new table will be created

    @property
    def is_expired(self):
        # Set your expiration duration here
        expiration_time = self.created + timedelta(hours=2)
        return timezone.now() > expiration_time



class UserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        user = self.create_user(
            email=self.normalize_email(email),
            password=password,
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=True)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    is_google = models.BooleanField(default=False)
    expiry_date = models.DateField(blank=True, null=True)
    feature_count = models.IntegerField(blank=True, null=True, default= 0)
    plan_name = models.CharField(max_length=255,blank=True, null=True)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        if self.is_admin:
            return True
        return super().has_perm(perm, obj)

    def has_module_perms(self, app_label):
        if self.is_admin:
            return True
        return super().has_module_perms(app_label)


class SectorHistory(models.Model):
    """Database model for sector scraping history"""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    history_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sector = models.ForeignKey("Sector", on_delete=models.CASCADE, related_name="histories")
    task_id = models.CharField(max_length=255)
    service = models.CharField(max_length=255)
    locations = models.JSONField(default=list)  # Store list of towns/cities
    count = models.IntegerField(null=True, blank=True)
    results_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    csv_url = models.URLField(null=True, blank=True)

    def __str__(self):
        return f"{self.sector.sector_name} - {self.service} ({self.status})"

class ServiceProviderChatbotInterface(models.Model):
    """
    Fake model for displaying service provider chatbot interface in Django admin
    """
    class Meta:
        verbose_name = 'Service Provider Chatbot'
        verbose_name_plural = 'Service Provider Chatbot'
        app_label = 'accounts'
        managed = False

class ServiceChatSession(models.Model):
    session_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    title = models.CharField(max_length=255, default='New Service Request')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user_latitude = models.DecimalField(max_digits=20, decimal_places=15, null=True, blank=True)
    user_longitude = models.DecimalField(max_digits=20, decimal_places=15, null=True, blank=True)
    service_type = models.CharField(max_length=255, blank=True, null=True)
    original_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Session {self.session_id} - {self.title}"

class ServiceChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('bot', 'Bot'),
        ('system', 'System'),
    ]
    
    session = models.ForeignKey(ServiceChatSession, on_delete=models.CASCADE, related_name='service_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # For storing providers, permits, etc.
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.session.session_id} - {self.role}: {self.content[:50]}..."


class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    session_id = models.CharField(max_length=50, unique=True)  # Frontend generated ID
    title = models.CharField(max_length=255, default='New session')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=False)  # Track which session is currently active
    
    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['user', 'session_id']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('server', 'Server'),
        ('system', 'System'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['session', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.session.title} - {self.role}: {self.content[:50]}..."
    
class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    contact_name =  models.CharField(max_length=255,blank=True,null=True, default = 'None')
    sector= models.CharField(max_length=255,blank=True,null=True, default = 'None')
    category_id = models.IntegerField(blank=True, null=True)
    company_phone = models.CharField(max_length=255,blank=True, null=True)
    company_name = models.CharField(max_length=255,blank=True, null=True)
    company_email= models.CharField(max_length=255,blank=True, null=True)
    city= models.CharField(max_length=255,blank=True, null=True)
    state= models.CharField(max_length=255,blank=True, null=True)
    zipcode= models.IntegerField(blank=True, null=True)
    company_address= models.CharField(max_length=255,blank=True, null=True)
    company_website= models.CharField(max_length=255,blank=True, null=True)
    image = models.ImageField(upload_to='user_images/', blank=True, null=True, default = 'None')
    hide = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'User Information'
        verbose_name_plural = 'User Information'

    def __str__(self):
        return self.user.email
    
class UploadedFile(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    sector = models.CharField(max_length=255,blank=True, null=True)
    category_id = models.IntegerField(blank=True, null=True)
    file = models.FileField(null=True)
    video_file = models.FileField(null=True)
    uploaded_on = models.DateTimeField(auto_now_add=True)
    latitude = models.CharField(max_length=255,blank=True, null=True)
    longitude = models.CharField(max_length=255,blank=True, null=True)
    zipcode = models.CharField(max_length=255,blank=True, null=True)
    state = models.CharField(max_length=255,blank=True, null=True)
    city = models.CharField(max_length=255,blank=True, null=True)
    address = models.CharField(max_length=255,blank=True, null=True)
    geom = models.PointField(srid=4326, dim=2, null=True)
    objects = GeoManager()
    def __str__(self):
        return self.user.email
    
class UploadedFileWMS(models.Model):
    sector = models.CharField(max_length=255, blank=True, null=True)
    file = models.FileField(upload_to='wms/', blank=True, null=True)
    video_file = models.FileField(upload_to='wms/', blank=True, null=True)


class UploadedMultipleFile(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE, null=True, blank=True)
    sector = models.CharField(max_length=255,blank=True, null=True)
    latitude = models.CharField(max_length=255,blank=True, null=True)
    longitude = models.CharField(max_length=255,blank=True, null=True)
    zipcode = models.CharField(max_length=255,blank=True, null=True)
    state = models.CharField(max_length=255,blank=True, null=True)
    city = models.CharField(max_length=255,blank=True, null=True)
    address = models.CharField(max_length=255,blank=True, null=True)
    company_name = models.CharField(max_length=255,blank=True, null=True)
    category_name = models.CharField(max_length=255,blank=True, null=True)
    sector_id = models.IntegerField(blank=True, null=True)
    sector_name =  models.CharField(max_length=255,blank=True, null=True)
    category_id = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    geom = models.PointField(srid=4326, dim=2, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    objects = GeoManager()

    class Meta:
        verbose_name = 'Companies Dashboard'
        verbose_name_plural = 'Companies Dashboard'

    def __str__(self):
        return f"{self.company_name} - {self.sector_name}" if self.company_name and self.sector_name else "Company Record"
    

class ContactUsMailModel(models.Model):
    message =  models.CharField(max_length=255,blank=True, null=True)
    phone =  models.CharField(max_length=255,blank=True, null=True)
    address =  models.CharField(max_length=255,blank=True, null=True) 
    city =  models.CharField(max_length=255,blank=True, null=True) 
    contact_name =  models.CharField(max_length=255,blank=True, null=True)
    state =  models.CharField(max_length=255,blank=True, null=True)
    address =  models.CharField(max_length=255,blank=True, null=True)
    zipcode =  models.CharField(max_length=255,blank=True, null=True)
    email =  models.CharField(max_length=255,blank=True, null=True)
    def __str__(self):
        return self.contact_name or "Contact Request"
    

class OTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Category(models.Model):
    id = models.BigAutoField(primary_key=True)
    category_name = models.CharField(max_length=255,blank=True, null=True)
    
    def __str__(self):
        return self.category_name or "No Category Name"

class Sector(models.Model):
    id = models.BigAutoField(primary_key=True)
    sector_name = models.CharField(max_length=255,blank=True, null=True)
    category = models.ForeignKey(Category,on_delete=models.CASCADE)
    logo =  models.ImageField(upload_to='sector/')
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.logo and not self.logo.name.startswith(settings.MEDIA_URL):
            self.logo.name = f"{settings.MEDIA_URL}{self.logo.name}"
            super().save(update_fields=['logo'])
    
    def __str__(self):
        return self.sector_name or "No Sector Name"

class Pricing(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255,blank=True, null=True)
    stripe_payement_id = models.CharField(max_length=255,blank=True, null=True)
    payment_status = models.CharField(max_length=255,blank=True, null=True,default='pending')
    amount = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    plan_name = models.CharField(max_length=255,blank=True,null=True)
    plan_id = models.IntegerField(blank=True, null=True)
    subscription_period = models.CharField(max_length=255,blank=True, null=True,default='month')
    id=models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)

class SubscriptionModel(models.Model):
    _id = models.BigAutoField(primary_key=True)
    user =  models.ForeignKey(User,on_delete=models.CASCADE)
    discount_status = models.BooleanField(default=False)
    price = models.IntegerField(blank=True, null=True)
    validity = models.IntegerField(blank=True, null=True)
    validity_type = models.CharField(max_length=50)
    discount_start_date = models.DateTimeField(blank=True, null=True)
    discount_expiry_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50,default='active')
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    discount_amount = models.IntegerField(blank=True,null=True)
    features = models.JSONField(blank=True, null=True)

class PricingplanModel(models.Model):
    id=models.BigAutoField(primary_key=True)
    price= models.CharField(max_length=100, blank=True, null=True)
    validityType = models.CharField(max_length=100, blank=True, null=True)
    planname = models.CharField(max_length=100, blank=True, null=True)
    status = models.BooleanField(default=True)
    features = models.IntegerField(blank=True,null=True)
    popular = models.BooleanField(default=False)


class FreeplanModel(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField(blank=True, null=True)
    expiry_date = models.DateTimeField(blank=True, null=True)


class UnlimitedPricing(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    stripe_customer_id = models.CharField(max_length=255,blank=True, null=True)
    stripe_payement_id = models.CharField(max_length=255,blank=True, null=True)
    payment_status = models.CharField(max_length=255,blank=True, null=True,default='pending')
    amount = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=False)
    start_date =  models.DateTimeField(blank=True, null=True)
    end_date =  models.DateTimeField(blank=True, null=True)
    plan_name = models.CharField(max_length=255,blank=True,null=True)
    plan_id = models.IntegerField(blank=True, null=True)
    subscription_period = models.CharField(max_length=255,blank=True, null=True,default='month')
    id=models.BigAutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    yard_list = ArrayField(models.IntegerField(),null=True)

class CompanyData(UploadedMultipleFile):
    class Meta:
        proxy = True
        verbose_name = 'Company Data'
        verbose_name_plural = 'Company Data'
        
    def __str__(self):
        return "Company Data Management"

class CompanyDataUpload(UploadedMultipleFile):
    class Meta:
        verbose_name = 'Add Company Data'
        verbose_name_plural = 'Add Company Data'
        proxy = True
        
    def __str__(self):
        return "Company Data Upload"