from django.contrib import admin
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment


@admin.register(Procedure)
class ProcedureAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'base_price', 'requires_authorization', 'is_active']
    list_filter = ['category', 'requires_authorization', 'is_active']
    search_fields = ['code', 'name']
    readonly_fields = ['created_at', 'updated_at']


class GuideProcedureInline(admin.TabularInline):
    model = GuideProcedure
    extra = 1


class GuideAttachmentInline(admin.TabularInline):
    model = GuideAttachment
    extra = 1


@admin.register(TISSGuide)
class TISSGuideAdmin(admin.ModelAdmin):
    list_display = ['guide_number', 'protocol_number', 'guide_type', 'status', 'beneficiary', 'provider', 'request_date']
    list_filter = ['guide_type', 'status', 'request_date']
    search_fields = ['guide_number', 'protocol_number', 'beneficiary__full_name', 'provider__name']
    readonly_fields = ['guide_number', 'protocol_number', 'created_at', 'updated_at']
    inlines = [GuideProcedureInline, GuideAttachmentInline]
    
    fieldsets = (
        ('Identificação', {
            'fields': ('guide_number', 'protocol_number', 'guide_type', 'status')
        }),
        ('Paciente e Prestador', {
            'fields': ('beneficiary', 'provider')
        }),
        ('Datas', {
            'fields': ('request_date', 'authorization_date', 'expiry_date')
        }),
        ('Informações Médicas', {
            'fields': ('diagnosis', 'observations', 'requesting_physician_name', 'requesting_physician_crm')
        }),
        ('Resultado', {
            'fields': ('denial_reason', 'guide_pdf')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(GuideAttachment)
class GuideAttachmentAdmin(admin.ModelAdmin):
    list_display = ['guide', 'attachment_type', 'description']
    list_filter = ['attachment_type']
    search_fields = ['guide__guide_number', 'description']
