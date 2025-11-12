from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment


@admin.register(Procedure)
class ProcedureAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'name', 'category', 'base_price_display',
        'authorization_badge', 'usage_count', 'status_badge'
    ]
    list_filter = ['category', 'requires_authorization', 'is_active', 'created_at']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    date_hierarchy = 'created_at'

    actions = ['activate_procedures', 'deactivate_procedures', 'require_authorization']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(usage_count=Count('guideprocedure'))

    def base_price_display(self, obj):
        return format_html(
            '<span style="font-weight: bold; color: #20a490;">R$ {:.2f}</span>',
            obj.base_price
        )
    base_price_display.short_description = 'Preço Base'
    base_price_display.admin_order_field = 'base_price'

    def authorization_badge(self, obj):
        if obj.requires_authorization:
            return format_html(
                '<span style="background-color: #FF9800; color: white; padding: 3px 8px; border-radius: 3px; font-size: 10px;">🔒 AUTORIZAÇÃO</span>'
            )
        return format_html(
            '<span style="background-color: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px; font-size: 10px;">✓ LIVRE</span>'
        )
    authorization_badge.short_description = 'Autorização'

    def usage_count(self, obj):
        return obj.usage_count
    usage_count.short_description = 'Nº Usos'
    usage_count.admin_order_field = 'usage_count'

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="color: #4CAF50; font-weight: bold;">✓</span>'
            )
        return format_html(
            '<span style="color: #F44336; font-weight: bold;">✗</span>'
        )
    status_badge.short_description = 'Ativo'
    status_badge.admin_order_field = 'is_active'

    # Actions
    def activate_procedures(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} procedimento(s) ativado(s).')
    activate_procedures.short_description = 'Ativar procedimentos'

    def deactivate_procedures(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} procedimento(s) desativado(s).')
    deactivate_procedures.short_description = 'Desativar procedimentos'

    def require_authorization(self, request, queryset):
        updated = queryset.update(requires_authorization=True)
        self.message_user(request, f'Autorização requerida para {updated} procedimento(s).')
    require_authorization.short_description = 'Requerer autorização'


class GuideProcedureInline(admin.TabularInline):
    model = GuideProcedure
    extra = 1


class GuideAttachmentInline(admin.TabularInline):
    model = GuideAttachment
    extra = 1


@admin.register(TISSGuide)
class TISSGuideAdmin(admin.ModelAdmin):
    list_display = [
        'guide_number', 'protocol_number', 'guide_type_badge', 'status_badge',
        'beneficiary', 'provider_name', 'request_date', 'days_since_request'
    ]
    list_filter = ['guide_type', 'status', 'request_date', 'authorization_date']
    search_fields = ['guide_number', 'protocol_number', 'beneficiary__full_name', 'provider__name']
    readonly_fields = ['guide_number', 'protocol_number', 'created_at', 'updated_at']
    inlines = [GuideProcedureInline, GuideAttachmentInline]
    list_per_page = 20
    date_hierarchy = 'request_date'

    actions = ['authorize_guides', 'deny_guides']

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
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('beneficiary', 'provider')

    def guide_type_badge(self, obj):
        colors = {
            'CONSULTATION': '#2196F3',
            'EXAM': '#9C27B0',
            'HOSPITALIZATION': '#F44336',
            'EMERGENCY': '#FF5722',
            'SURGERY': '#E91E63',
        }
        color = colors.get(obj.guide_type, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold;">{}</span>',
            color,
            obj.get_guide_type_display()
        )
    guide_type_badge.short_description = 'Tipo'

    def status_badge(self, obj):
        colors = {
            'PENDING': '#FF9800',
            'AUTHORIZED': '#4CAF50',
            'DENIED': '#F44336',
            'CANCELLED': '#9E9E9E',
            'USED': '#2196F3',
        }
        icons = {
            'PENDING': '⏳',
            'AUTHORIZED': '✓',
            'DENIED': '✗',
            'CANCELLED': '⊘',
            'USED': '✔',
        }
        color = colors.get(obj.status, '#757575')
        icon = icons.get(obj.status, '•')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 10px; font-weight: bold;">{} {}</span>',
            color,
            icon,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def provider_name(self, obj):
        return obj.provider.name if obj.provider else '—'
    provider_name.short_description = 'Prestador'

    def days_since_request(self, obj):
        from django.utils import timezone
        delta = timezone.now().date() - obj.request_date
        days = delta.days

        if days == 0:
            return format_html('<span style="color: #4CAF50;">Hoje</span>')
        elif days == 1:
            return format_html('<span style="color: #FF9800;">1 dia</span>')
        elif days <= 3:
            return format_html('<span style="color: #FF9800;">{} dias</span>', days)
        else:
            return format_html('<span style="color: #F44336;">{} dias</span>', days)
    days_since_request.short_description = 'Tempo'

    # Actions
    def authorize_guides(self, request, queryset):
        from django.utils import timezone
        from datetime import timedelta

        pending = queryset.filter(status='PENDING')
        updated = pending.update(
            status='AUTHORIZED',
            authorization_date=timezone.now(),
            expiry_date=timezone.now().date() + timedelta(days=30)
        )
        self.message_user(request, f'{updated} guia(s) autorizada(s).')
    authorize_guides.short_description = 'Autorizar guias selecionadas'

    def deny_guides(self, request, queryset):
        pending = queryset.filter(status='PENDING')
        updated = pending.update(status='DENIED')
        self.message_user(request, f'{updated} guia(s) negada(s).')
    deny_guides.short_description = 'Negar guias selecionadas'


@admin.register(GuideAttachment)
class GuideAttachmentAdmin(admin.ModelAdmin):
    list_display = ['guide', 'attachment_type', 'description']
    list_filter = ['attachment_type']
    search_fields = ['guide__guide_number', 'description']
