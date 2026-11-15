# authentication/serializers.py

from rest_framework import serializers
from .models import User, UserInfo, Category
from rest_framework import serializers
from .models import *

class SectorSerializer(serializers.ModelSerializer):
    model= Sector
    fields = '__all__'

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = '__all__'

## Remove this
class FileUploadSerializerWMS(serializers.ModelSerializer):
    class Meta:
        model = UploadedFileWMS
        fields = '__all__'


class UploadedMultipleFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedMultipleFile
        fields = '__all__'


class UserForgotSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UserSerializerGoogle(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('email', 'is_active', 'is_google')
        extra_kwargs = {
            'is_active': {'default': True},  
            'is_google': {'default': True},   
        }

    def create(self, validated_data):
        user = User(
            email=validated_data['email'],
            is_active=validated_data.get('is_active', True),
            is_google=validated_data.get('is_google', True)
        )
        user.save()
        return user
    
class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = '__all__'

class PricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pricing
        fields = '__all__'
    

class ContactUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUsMailModel
        fields = '__all__'

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ('email', 'otp')

class CategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionModel
        fields = '__all__'

class PricingplanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingplanModel
        fields = '__all__'

class FreeplanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreeplanModel
        fields = '__all__'

class UnlimitedPricingSerializer(serializers.ModelSerializer):
   class Meta:
       model = UnlimitedPricing
       fields = '__all__'
