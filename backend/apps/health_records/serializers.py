from rest_framework import serializers
from .models import HealthRecord, Vaccination


class HealthRecordSerializer(serializers.ModelSerializer):
    record_type_display = serializers.CharField(source='get_record_type_display', read_only=True)
    
    class Meta:
        model = HealthRecord
        fields = [
            'id', 'beneficiary', 'record_type', 'record_type_display', 'date',
            'provider', 'provider_name', 'professional_name', 'specialty',
            'diagnosis', 'description', 'prescribed_medications', 'attachments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VaccinationSerializer(serializers.ModelSerializer):
    is_due = serializers.SerializerMethodField()
    
    class Meta:
        model = Vaccination
        fields = [
            'id', 'beneficiary', 'vaccine_name', 'dose', 'batch_number',
            'date_administered', 'next_dose_date', 'provider', 'provider_name',
            'professional_name', 'notes', 'is_due', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_due(self, obj):
        """Check if next dose is due"""
        from django.utils import timezone
        if obj.next_dose_date:
            return obj.next_dose_date <= timezone.now().date()
        return False
