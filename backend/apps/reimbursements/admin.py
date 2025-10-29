from django.contrib import admin
from .models import ReimbursementRequest, ReimbursementDocument


class ReimbursementDocumentInline(admin.TabularInline):
    model = ReimbursementDocument
    extra = 1


@admin.register(ReimbursementRequest)
class ReimbursementRequestAdmin(admin.ModelAdmin):
    list_display = ['protocol_number', 'beneficiary', 'expense_type', 'service_date', 'requested_amount', 'approved_amount', 'status']
    list_filter = ['expense_type', 'status', 'service_date']
    search_fields = ['protocol_number', 'beneficiary__full_name', 'provider_name']
    readonly_fields = ['protocol_number', 'created_at', 'updated_at']
    inlines = [ReimbursementDocumentInline]
    
    fieldsets = (
        ('Identificação', {
            'fields': ('protocol_number', 'beneficiary')
        }),
        ('Serviço', {
            'fields': ('expense_type', 'service_date', 'provider_name', 'provider_cnpj_cpf')
        }),
        ('Valores', {
            'fields': ('requested_amount', 'approved_amount')
        }),
        ('Status e Análise', {
            'fields': ('status', 'denial_reason')
        }),
        ('Dados Bancários', {
            'fields': ('bank_details',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ReimbursementDocument)
class ReimbursementDocumentAdmin(admin.ModelAdmin):
    list_display = ['reimbursement', 'document_type', 'description']
    list_filter = ['document_type']
    search_fields = ['reimbursement__protocol_number', 'description']
