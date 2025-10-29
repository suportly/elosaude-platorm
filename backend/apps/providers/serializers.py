from rest_framework import serializers
from .models import Specialty, AccreditedProvider, ProviderReview


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ProviderReviewSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    
    class Meta:
        model = ProviderReview
        fields = ['id', 'provider', 'beneficiary', 'beneficiary_name', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AccreditedProviderSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(many=True, read_only=True)
    specialty_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Specialty.objects.all(), source='specialties'
    )
    provider_type_display = serializers.CharField(source='get_provider_type_display', read_only=True)
    recent_reviews = ProviderReviewSerializer(source='reviews', many=True, read_only=True)
    
    class Meta:
        model = AccreditedProvider
        fields = [
            'id', 'provider_type', 'provider_type_display', 'name', 'trade_name', 'cnpj', 'crm',
            'phone', 'email', 'website',
            'address', 'city', 'state', 'zip_code', 'latitude', 'longitude',
            'specialties', 'specialty_ids',
            'accepts_telemedicine', 'accepts_emergency', 'working_hours',
            'rating', 'total_reviews', 'recent_reviews',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'rating', 'total_reviews']


class AccreditedProviderListSerializer(serializers.ModelSerializer):
    """Optimized serializer for list view"""
    specialties = SpecialtySerializer(many=True, read_only=True)
    provider_type_display = serializers.CharField(source='get_provider_type_display', read_only=True)
    
    class Meta:
        model = AccreditedProvider
        fields = [
            'id', 'provider_type', 'provider_type_display', 'name', 'trade_name',
            'phone', 'city', 'state', 'latitude', 'longitude',
            'specialties', 'rating', 'total_reviews',
            'accepts_telemedicine', 'accepts_emergency', 'is_active'
        ]
