from django.contrib import admin
from django.db.models import Count, Avg
from django.utils.html import format_html
from .models import Specialty, AccreditedProvider, ProviderReview


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'provider_count', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']
    list_per_page = 20

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(provider_count=Count('accreditedprovider'))

    def provider_count(self, obj):
        return obj.provider_count
    provider_count.short_description = 'Nº Prestadores'
    provider_count.admin_order_field = 'provider_count'


class ProviderReviewInline(admin.TabularInline):
    model = ProviderReview
    extra = 0
    readonly_fields = ['beneficiary', 'rating', 'comment', 'created_at']
    can_delete = False
    max_num = 5
    verbose_name = 'Avaliação Recente'
    verbose_name_plural = 'Avaliações Recentes (últimas 5)'

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(AccreditedProvider)
class AccreditedProviderAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'provider_type_badge', 'location', 'rating_display',
        'review_count', 'services_offered', 'status_badge'
    ]
    list_filter = [
        'provider_type', 'is_active', 'accepts_telemedicine',
        'accepts_emergency', 'state', 'created_at'
    ]
    search_fields = ['name', 'trade_name', 'cnpj_cpf', 'city', 'specialties__name']
    readonly_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']
    filter_horizontal = ['specialties']
    list_per_page = 20
    date_hierarchy = 'created_at'
    inlines = [ProviderReviewInline]

    actions = ['activate_providers', 'deactivate_providers', 'enable_telemedicine']

    fieldsets = (
        ('Informações Básicas', {
            'fields': ('provider_type', 'name', 'trade_name', 'cnpj_cpf', 'specialties')
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
            'fields': ('rating', 'total_reviews'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related().prefetch_related('specialties', 'reviews')

    def provider_type_badge(self, obj):
        colors = {
            'HOSPITAL': '#2196F3',
            'CLINIC': '#4CAF50',
            'DOCTOR': '#9C27B0',
            'LABORATORY': '#FF9800',
        }
        color = colors.get(obj.provider_type, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_provider_type_display()
        )
    provider_type_badge.short_description = 'Tipo'

    def location(self, obj):
        return f"{obj.city}, {obj.state}"
    location.short_description = 'Localização'

    def rating_display(self, obj):
        if obj.rating > 0:
            stars = '⭐' * int(obj.rating)
            return format_html(
                '{} <span style="color: #666;">({:.1f})</span>',
                stars,
                obj.rating
            )
        return '—'
    rating_display.short_description = 'Avaliação'
    rating_display.admin_order_field = 'rating'

    def review_count(self, obj):
        return obj.total_reviews
    review_count.short_description = 'Nº Avaliações'
    review_count.admin_order_field = 'total_reviews'

    def services_offered(self, obj):
        services = []
        if obj.accepts_telemedicine:
            services.append('📱 Telemedicina')
        if obj.accepts_emergency:
            services.append('🚨 Emergência')
        return format_html('<br>'.join(services)) if services else '—'
    services_offered.short_description = 'Serviços'

    def status_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #4CAF50; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✓ ATIVO</span>'
            )
        return format_html(
            '<span style="background-color: #F44336; color: white; padding: 3px 10px; border-radius: 3px; font-size: 11px;">✗ INATIVO</span>'
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'is_active'

    # Actions
    def activate_providers(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} prestador(es) ativado(s) com sucesso.')
    activate_providers.short_description = 'Ativar prestadores selecionados'

    def deactivate_providers(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} prestador(es) desativado(s) com sucesso.')
    deactivate_providers.short_description = 'Desativar prestadores selecionados'

    def enable_telemedicine(self, request, queryset):
        updated = queryset.update(accepts_telemedicine=True)
        self.message_user(request, f'Telemedicina habilitada para {updated} prestador(es).')
    enable_telemedicine.short_description = 'Habilitar telemedicina'


@admin.register(ProviderReview)
class ProviderReviewAdmin(admin.ModelAdmin):
    list_display = ['provider', 'beneficiary', 'rating_stars', 'comment_preview', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['provider__name', 'beneficiary__full_name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 20
    date_hierarchy = 'created_at'

    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        empty = '☆' * (5 - obj.rating)
        return format_html(
            '<span style="font-size: 14px;">{}{}</span>',
            stars,
            empty
        )
    rating_stars.short_description = 'Avaliação'
    rating_stars.admin_order_field = 'rating'

    def comment_preview(self, obj):
        if obj.comment:
            preview = obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
            return preview
        return '—'
    comment_preview.short_description = 'Comentário'
