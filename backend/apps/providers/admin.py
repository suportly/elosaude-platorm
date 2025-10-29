from django.contrib import admin
from .models import Specialty, AccreditedProvider, ProviderReview


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AccreditedProvider)
class AccreditedProviderAdmin(admin.ModelAdmin):
    list_display = ['name', 'provider_type', 'city', 'state', 'rating', 'total_reviews', 'is_active']
    list_filter = ['provider_type', 'is_active', 'accepts_telemedicine', 'accepts_emergency', 'state']
    search_fields = ['name', 'trade_name', 'cnpj', 'crm']
    readonly_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']
    filter_horizontal = ['specialties']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('provider_type', 'name', 'trade_name', 'cnpj', 'crm', 'specialties')
        }),
        ('Contato', {
            'fields': ('phone', 'email', 'website')
        }),
        ('Endereço', {
            'fields': ('address', 'city', 'state', 'zip_code', 'latitude', 'longitude')
        }),
        ('Serviços', {
            'fields': ('accepts_telemedicine', 'accepts_emergency', 'working_hours')
        }),
        ('Avaliações', {
            'fields': ('rating', 'total_reviews')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )


@admin.register(ProviderReview)
class ProviderReviewAdmin(admin.ModelAdmin):
    list_display = ['provider', 'beneficiary', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['provider__name', 'beneficiary__full_name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
