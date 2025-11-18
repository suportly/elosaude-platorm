from django.contrib import admin
from .models import Company, HealthPlan, Beneficiary


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'cnpj', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'cnpj']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(HealthPlan)
class HealthPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan_type', 'monthly_fee', 'is_active', 'created_at']
    list_filter = ['plan_type', 'is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'registration_number', 'cpf', 'beneficiary_type', 'status', 'company', 'health_plan']
    list_filter = ['beneficiary_type', 'status', 'gender', 'company', 'health_plan']
    search_fields = ['full_name', 'cpf', 'registration_number', 'email']
    readonly_fields = ['registration_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('user', 'registration_number', 'cpf', 'full_name', 'birth_date', 'gender')
        }),
        ('Tipo e Status', {
            'fields': ('beneficiary_type', 'status', 'titular', 'company', 'health_plan')
        }),
        ('Contato', {
            'fields': ('email', 'phone', 'mobile_phone')
        }),
        ('Endereço', {
            'fields': ('address', 'city', 'state', 'zip_code')
        }),
        ('Documentos', {
            'fields': ('rg_document', 'cpf_document', 'photo')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
