from rest_framework import serializers
from django.contrib.auth.models import User
from apps.beneficiaries.models import Beneficiary, Company, HealthPlan
from apps.providers.models import AccreditedProvider, Specialty
from apps.reimbursements.models import ReimbursementRequest, ReimbursementDocument
from .models import AdminProfile, AuditLog, SystemConfiguration


class AdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    last_login = serializers.DateTimeField(source='user.last_login', read_only=True)

    class Meta:
        model = AdminProfile
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'department', 'phone', 'last_login', 'last_activity',
            'login_count'
        ]
        read_only_fields = ['login_count', 'last_activity']


class AuditLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id', 'admin_name', 'action', 'entity_type', 'entity_id',
            'entity_repr', 'changes', 'timestamp', 'ip_address'
        ]

    def get_admin_name(self, obj):
        if obj.admin:
            return f"{obj.admin.first_name} {obj.admin.last_name}".strip() or obj.admin.email
        return "Unknown"


class SystemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = [
            'key', 'value', 'category', 'description',
            'is_sensitive', 'updated_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Hide sensitive values
        if instance.is_sensitive and not self.context.get('show_sensitive', False):
            data['value'] = '********'
        return data


class CompanyRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name']


class HealthPlanRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthPlan
        fields = ['id', 'name', 'plan_type']


class BeneficiaryRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = ['id', 'full_name', 'registration_number']


class BeneficiaryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = [
            'id', 'registration_number', 'cpf', 'full_name',
            'email', 'phone', 'status', 'beneficiary_type', 'created_at'
        ]


class BeneficiaryDetailSerializer(serializers.ModelSerializer):
    company = CompanyRefSerializer(read_only=True)
    health_plan = HealthPlanRefSerializer(read_only=True)
    titular = BeneficiaryRefSerializer(read_only=True)
    dependents = BeneficiaryRefSerializer(many=True, read_only=True)

    class Meta:
        model = Beneficiary
        fields = [
            'id', 'registration_number', 'cpf', 'full_name', 'birth_date',
            'gender', 'phone', 'email', 'address', 'city', 'state', 'zip_code',
            'beneficiary_type', 'titular', 'dependents', 'company', 'health_plan',
            'status', 'enrollment_date', 'created_at', 'updated_at'
        ]


class BeneficiaryCreateSerializer(serializers.ModelSerializer):
    company_id = serializers.IntegerField(write_only=True)
    health_plan_id = serializers.IntegerField(write_only=True)
    titular_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Beneficiary
        fields = [
            'cpf', 'full_name', 'birth_date', 'gender', 'phone', 'email',
            'address', 'city', 'state', 'zip_code', 'beneficiary_type',
            'company_id', 'health_plan_id', 'titular_id'
        ]

    def create(self, validated_data):
        company_id = validated_data.pop('company_id')
        health_plan_id = validated_data.pop('health_plan_id')
        titular_id = validated_data.pop('titular_id', None)

        validated_data['company'] = Company.objects.get(pk=company_id)
        validated_data['health_plan'] = HealthPlan.objects.get(pk=health_plan_id)
        if titular_id:
            validated_data['titular'] = Beneficiary.objects.get(pk=titular_id)

        return super().create(validated_data)


class BeneficiaryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beneficiary
        fields = [
            'full_name', 'phone', 'email', 'address', 'city',
            'state', 'zip_code', 'status'
        ]


class SpecialtyRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name']


class ProviderListSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccreditedProvider
        fields = [
            'id', 'name', 'trade_name', 'provider_type', 'cnpj',
            'city', 'state', 'is_active', 'rating', 'total_reviews'
        ]


class ProviderDetailSerializer(serializers.ModelSerializer):
    specialties = SpecialtyRefSerializer(many=True, read_only=True)

    class Meta:
        model = AccreditedProvider
        fields = [
            'id', 'name', 'trade_name', 'provider_type', 'cnpj', 'crm',
            'phone', 'email', 'website', 'address', 'city', 'state', 'zip_code',
            'latitude', 'longitude', 'specialties', 'accepts_telemedicine',
            'accepts_emergency', 'working_hours', 'rating', 'total_reviews',
            'is_active', 'created_at', 'updated_at'
        ]


class ProviderUpdateSerializer(serializers.ModelSerializer):
    specialty_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = AccreditedProvider
        fields = [
            'name', 'trade_name', 'phone', 'email', 'website',
            'address', 'city', 'state', 'zip_code', 'specialty_ids',
            'accepts_telemedicine', 'accepts_emergency', 'working_hours', 'is_active'
        ]

    def update(self, instance, validated_data):
        specialty_ids = validated_data.pop('specialty_ids', None)
        instance = super().update(instance, validated_data)
        if specialty_ids is not None:
            instance.specialties.set(Specialty.objects.filter(pk__in=specialty_ids))
        return instance


class ReimbursementDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ReimbursementDocument
        fields = ['id', 'document_type', 'file_url', 'description', 'uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class ReimbursementListSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)

    class Meta:
        model = ReimbursementRequest
        fields = [
            'id', 'protocol_number', 'beneficiary_name', 'expense_type',
            'service_date', 'requested_amount', 'approved_amount',
            'status', 'request_date'
        ]


class ReimbursementDetailSerializer(serializers.ModelSerializer):
    beneficiary = BeneficiaryRefSerializer(read_only=True)
    documents = ReimbursementDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = ReimbursementRequest
        fields = [
            'id', 'protocol_number', 'beneficiary', 'expense_type',
            'service_date', 'service_description', 'provider_name',
            'provider_cnpj_cpf', 'requested_amount', 'approved_amount',
            'bank_details', 'status', 'request_date', 'analysis_date',
            'payment_date', 'notes', 'denial_reason', 'documents'
        ]
