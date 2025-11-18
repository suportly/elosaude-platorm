"""
Oracle Integration Serializers
Serializers for Oracle database models
"""
from rest_framework import serializers
from .models import (
    OracleCarteirinha,
    OracleUnimed,
    OracleReciprocidade,
    OracleCarteirasUnificadas
)


class OracleCarteirinhaSerializer(serializers.ModelSerializer):
    """Serializer for OracleCarteirinha model"""

    class Meta:
        model = OracleCarteirinha
        fields = [
            'contrato', 'matricula_soul', 'nr_cpf', 'empresa',
            'nome_do_beneficiario', 'matricula', 'cd_plano',
            'primario', 'secundario', 'terciario', 'segmentacao',
            'nr_cns', 'nascto', 'contratacao', 'validade',
            'cpt', 'layout', 'nm_social', 'nome_titular', 'sn_ativo'
        ]


class OracleUnimedSerializer(serializers.ModelSerializer):
    """Serializer for OracleUnimed model"""

    class Meta:
        model = OracleUnimed
        fields = [
            'contrato', 'matricula_soul', 'plano_benef', 'cpf',
            'empresa_unimed', 'nr_cns', 'nome_do_beneficiario',
            'matricula_unimed', 'plano', 'abrangencia', 'acomodacao',
            'segmentacao', 'rede_atendimento', 'atend', 'nascto',
            'cob_parc_temp', 'via', 'validade', 'vigencia',
            'contratante', 'nm_social', 'nome_titular', 'sn_ativo'
        ]


class OracleReciprocidadeSerializer(serializers.ModelSerializer):
    """Serializer for OracleReciprocidade model"""

    class Meta:
        model = OracleReciprocidade
        fields = [
            'contrato', 'matricula_soul', 'nome_beneficiario',
            'nr_cns', 'nascto', 'nr_cpf', 'plano_elosaude',
            'matricula', 'cd_matricula_reciprocidade',
            'prestador_reciprocidade', 'dt_adesao',
            'dt_validade_carteira', 'nm_social', 'sn_ativo'
        ]


class OracleCarteirasUnificadasSerializer(serializers.ModelSerializer):
    """
    Serializer for OracleCarteirasUnificadas model
    Unified view that consolidates all 3 card types using UNION ALL
    """

    # Computed properties
    is_carteirinha_principal = serializers.BooleanField(read_only=True)
    is_unimed = serializers.BooleanField(read_only=True)
    is_reciprocidade = serializers.BooleanField(read_only=True)
    numero_carteirinha_display = serializers.CharField(read_only=True)
    cpf_formatado = serializers.CharField(read_only=True)

    class Meta:
        model = OracleCarteirasUnificadas
        fields = [
            # Tipo identificador
            'tipo_carteira',

            # Campos comuns
            'contrato',
            'matricula_soul',
            'nr_cpf',
            'cpf_formatado',
            'nome_beneficiario',
            'matricula',
            'nr_cns',
            'nascto',
            'nm_social',
            'sn_ativo',
            'segmentacao',

            # Campos específicos - Carteirinha principal
            'empresa',
            'cd_plano',
            'plano_nome',
            'plano_secundario',
            'plano_terciario',
            'tipo_contratacao',
            'data_validade',
            'cpt',
            'layout',
            'nome_titular',

            # Campos específicos - Redes
            'matricula_rede',
            'prestador_rede',
            'data_adesao',
            'abrangencia',
            'acomodacao',
            'rede_atendimento',

            # Properties computadas
            'is_carteirinha_principal',
            'is_unimed',
            'is_reciprocidade',
            'numero_carteirinha_display',
        ]
