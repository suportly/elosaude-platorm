"""
Oracle Integration Admin
Read-only admin interface for Oracle models
"""
from django.contrib import admin
from .models import OracleCarteirinha, OracleUnimed, OracleReciprocidade


@admin.register(OracleCarteirinha)
class OracleCarteirinhaAdmin(admin.ModelAdmin):
    list_display = [
        'matricula_soul', 'nome_do_beneficiario', 'matricula',
        'empresa', 'primario', 'segmentacao', 'sn_ativo'
    ]
    list_filter = ['sn_ativo', 'segmentacao', 'contratacao']
    search_fields = ['nome_do_beneficiario', 'matricula', 'nr_cpf']
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OracleUnimed)
class OracleUnimedAdmin(admin.ModelAdmin):
    list_display = [
        'matricula_soul', 'nome_do_beneficiario', 'matricula_unimed',
        'plano', 'abrangencia', 'sn_ativo'
    ]
    list_filter = ['sn_ativo', 'abrangencia']
    search_fields = ['nome_do_beneficiario', 'matricula_unimed', 'cpf']
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(OracleReciprocidade)
class OracleReciprocidadeAdmin(admin.ModelAdmin):
    list_display = [
        'matricula_soul', 'nome_beneficiario', 'matricula',
        'prestador_reciprocidade', 'dt_validade_carteira', 'sn_ativo'
    ]
    list_filter = ['sn_ativo', 'prestador_reciprocidade']
    search_fields = ['nome_beneficiario', 'matricula', 'nr_cpf']
    list_per_page = 50

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
