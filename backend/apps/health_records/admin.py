from django.contrib import admin
from .models import HealthRecord, Vaccination


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'record_type', 'date', 'provider_name', 'professional_name', 'created_at']
    list_filter = ['record_type', 'date', 'created_at']
    search_fields = ['beneficiary__full_name', 'provider_name', 'professional_name', 'diagnosis']
    date_hierarchy = 'date'
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('id', 'beneficiary', 'record_type', 'date')
        }),
        ('Prestador/Profissional', {
            'fields': ('provider', 'provider_name', 'professional_name', 'specialty')
        }),
        ('Detalhes', {
            'fields': ('diagnosis', 'description', 'prescribed_medications')
        }),
        ('Anexos', {
            'fields': ('attachments',)
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Vaccination)
class VaccinationAdmin(admin.ModelAdmin):
    list_display = ['beneficiary', 'vaccine_name', 'dose', 'date_administered', 'next_dose_date', 'created_at']
    list_filter = ['date_administered', 'next_dose_date', 'created_at']
    search_fields = ['beneficiary__full_name', 'vaccine_name', 'provider_name', 'professional_name']
    date_hierarchy = 'date_administered'
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('id', 'beneficiary', 'vaccine_name', 'dose', 'batch_number')
        }),
        ('Datas', {
            'fields': ('date_administered', 'next_dose_date')
        }),
        ('Local/Profissional', {
            'fields': ('provider', 'provider_name', 'professional_name')
        }),
        ('Observações', {
            'fields': ('notes',)
        }),
        ('Sistema', {
            'fields': ('created_at', 'updated_at')
        }),
    )
