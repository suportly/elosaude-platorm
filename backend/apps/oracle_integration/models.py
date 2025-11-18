"""
Oracle Integration Models
Read-only models for Oracle database views
"""
from django.db import models


class OracleCarteirinha(models.Model):
    """
    Read-only model for DBAPS.ESAU_V_APP_CARTEIRINHA view
    Contains primary beneficiary card information
    """
    contrato = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CONTRATO', verbose_name='Contrato'
    )
    matricula_soul = models.DecimalField(
        max_digits=20, decimal_places=0,
        db_column='MATRICULA_SOUL', verbose_name='Matrícula Soul',
        primary_key=True
    )
    nr_cpf = models.DecimalField(
        max_digits=11, decimal_places=0, null=True, blank=True,
        db_column='NR_CPF', verbose_name='CPF'
    )
    empresa = models.CharField(
        max_length=170, null=True, blank=True,
        db_column='EMPRESA', verbose_name='Empresa'
    )
    nome_do_beneficiario = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_DO_BENEFICIARIO', verbose_name='Nome do Beneficiário'
    )
    matricula = models.CharField(
        max_length=20, null=True, blank=True,
        db_column='MATRICULA', verbose_name='Matrícula'
    )
    cd_plano = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CD_PLANO', verbose_name='Código do Plano'
    )
    primario = models.CharField(
        max_length=133, null=True, blank=True,
        db_column='PRIMARIO', verbose_name='Plano Primário'
    )
    secundario = models.CharField(
        max_length=115, null=True, blank=True,
        db_column='SECUNDARIO', verbose_name='Plano Secundário'
    )
    terciario = models.CharField(
        max_length=111, null=True, blank=True,
        db_column='TERCIARIO', verbose_name='Plano Terciário'
    )
    segmentacao = models.CharField(
        max_length=40, null=True, blank=True,
        db_column='SEGMENTACAO', verbose_name='Segmentação'
    )
    nr_cns = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NR_CNS', verbose_name='Cartão Nacional de Saúde'
    )
    nascto = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='NASCTO', verbose_name='Data de Nascimento'
    )
    contratacao = models.CharField(
        max_length=20, null=True, blank=True,
        db_column='CONTRATACAO', verbose_name='Tipo de Contratação'
    )
    validade = models.CharField(
        max_length=50, null=True, blank=True,
        db_column='VALIDADE', verbose_name='Validade'
    )
    cpt = models.CharField(
        max_length=13, null=True, blank=True,
        db_column='CPT', verbose_name='CPT'
    )
    layout = models.CharField(
        max_length=13, null=True, blank=True,
        db_column='LAYOUT', verbose_name='Layout'
    )
    nm_social = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NM_SOCIAL', verbose_name='Nome Social'
    )
    nome_titular = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_TITULAR', verbose_name='Nome do Titular'
    )
    sn_ativo = models.CharField(
        max_length=1, null=True, blank=True,
        db_column='SN_ATIVO', verbose_name='Ativo'
    )

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_CARTEIRINHA"'
        app_label = 'oracle_integration'
        verbose_name = 'Carteirinha Oracle'
        verbose_name_plural = 'Carteirinhas Oracle'

    def __str__(self):
        return f"{self.nome_do_beneficiario} - {self.matricula}"


class OracleUnimed(models.Model):
    """
    Read-only model for DBAPS.ESAU_V_APP_UNIMED view
    Contains Unimed reciprocity network information
    """
    contrato = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CONTRATO', verbose_name='Contrato'
    )
    matricula_soul = models.DecimalField(
        max_digits=20, decimal_places=0,
        db_column='MATRICULA_SOUL', verbose_name='Matrícula Soul',
        primary_key=True
    )
    plano_benef = models.DecimalField(
        max_digits=20, decimal_places=0,
        db_column='PLANO_BENEF', verbose_name='Plano Beneficiário'
    )
    cpf = models.DecimalField(
        max_digits=11, decimal_places=0, null=True, blank=True,
        db_column='CPF', verbose_name='CPF'
    )
    empresa_unimed = models.CharField(
        max_length=4, null=True, blank=True,
        db_column='EMPRESA_UNIMED', verbose_name='Empresa Unimed'
    )
    nr_cns = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NR_CNS', verbose_name='Cartão Nacional de Saúde'
    )
    nome_do_beneficiario = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_DO_BENEFICIARIO', verbose_name='Nome do Beneficiário'
    )
    matricula_unimed = models.CharField(
        max_length=200,
        db_column='MATRICULA_UNIMED', verbose_name='Matrícula Unimed'
    )
    plano = models.CharField(
        max_length=13, null=True, blank=True,
        db_column='PLANO', verbose_name='Plano'
    )
    abrangencia = models.CharField(
        max_length=8, null=True, blank=True,
        db_column='ABRANGENCIA', verbose_name='Abrangência'
    )
    acomodacao = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='ACOMODACAO', verbose_name='Acomodação'
    )
    segmentacao = models.CharField(
        max_length=41, null=True, blank=True,
        db_column='SEGMENTACAO', verbose_name='Segmentação'
    )
    rede_atendimento = models.CharField(
        max_length=11, null=True, blank=True,
        db_column='Rede_Atendimento', verbose_name='Rede de Atendimento'
    )
    atend = models.CharField(
        max_length=4, null=True, blank=True,
        db_column='Atend', verbose_name='Atendimento'
    )
    nascto = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='nascto', verbose_name='Data de Nascimento'
    )
    cob_parc_temp = models.CharField(
        max_length=6, null=True, blank=True,
        db_column='Cob_Parc_Temp', verbose_name='Cobertura Parcial Temporária'
    )
    via = models.CharField(
        max_length=5, null=True, blank=True,
        db_column='Via', verbose_name='Via'
    )
    validade = models.DateField(
        null=True, blank=True,
        db_column='Validade', verbose_name='Validade'
    )
    vigencia = models.DateField(
        null=True, blank=True,
        db_column='Vigencia', verbose_name='Vigência'
    )
    contratante = models.CharField(
        max_length=18, null=True, blank=True,
        db_column='contratante', verbose_name='Contratante'
    )
    nm_social = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='nm_social', verbose_name='Nome Social'
    )
    nome_titular = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='nome_titular', verbose_name='Nome do Titular'
    )
    sn_ativo = models.CharField(
        max_length=1, null=True, blank=True,
        db_column='sn_ativo', verbose_name='Ativo'
    )

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_UNIMED"'
        app_label = 'oracle_integration'
        verbose_name = 'Cartão Unimed Oracle'
        verbose_name_plural = 'Cartões Unimed Oracle'

    def __str__(self):
        return f"{self.nome_do_beneficiario} - Unimed {self.matricula_unimed}"


class OracleReciprocidade(models.Model):
    """
    Read-only model for DBAPS.ESAU_V_APP_RECIPROCIDADE view
    Contains reciprocity provider card information
    """
    contrato = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CONTRATO', verbose_name='Contrato'
    )
    matricula_soul = models.DecimalField(
        max_digits=20, decimal_places=0,
        db_column='MATRICULA_SOUL', verbose_name='Matrícula Soul',
        primary_key=True
    )
    nome_beneficiario = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_BENEFICIARIO', verbose_name='Nome do Beneficiário'
    )
    nr_cns = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NR_CNS', verbose_name='Cartão Nacional de Saúde'
    )
    nascto = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='NASCTO', verbose_name='Data de Nascimento'
    )
    nr_cpf = models.DecimalField(
        max_digits=11, decimal_places=0, null=True, blank=True,
        db_column='NR_CPF', verbose_name='CPF'
    )
    plano_elosaude = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='PLANO_ELOSAUDE', verbose_name='Plano Elosaúde'
    )
    matricula = models.CharField(
        max_length=20, null=True, blank=True,
        db_column='MATRICULA', verbose_name='Matrícula'
    )
    cd_matricula_reciprocidade = models.CharField(
        max_length=200,
        db_column='CD_MATRICULA_RECIPROCIDADE',
        verbose_name='Matrícula de Reciprocidade'
    )
    prestador_reciprocidade = models.CharField(
        max_length=9, null=True, blank=True,
        db_column='PRESTADOR_RECIPROCIDADE',
        verbose_name='Prestador de Reciprocidade'
    )
    dt_adesao = models.DateField(
        null=True, blank=True,
        db_column='DT_ADESAO', verbose_name='Data de Adesão'
    )
    dt_validade_carteira = models.DateField(
        null=True, blank=True,
        db_column='DT_VALIDADE_CARTEIRA',
        verbose_name='Data de Validade da Carteira'
    )
    nm_social = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NM_SOCIAL', verbose_name='Nome Social'
    )
    sn_ativo = models.CharField(
        max_length=1, null=True, blank=True,
        db_column='SN_ATIVO', verbose_name='Ativo'
    )

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_RECIPROCIDADE"'
        app_label = 'oracle_integration'
        verbose_name = 'Cartão de Reciprocidade Oracle'
        verbose_name_plural = 'Cartões de Reciprocidade Oracle'

    def __str__(self):
        return f"{self.nome_beneficiario} - {self.prestador_reciprocidade}"


class OracleCarteirasUnificadas(models.Model):
    """
    Read-only model for DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS view
    Unified view that consolidates all 3 card tables using UNION ALL
    (CARTEIRINHA + UNIMED + RECIPROCIDADE)
    """
    # Common fields (present in all sources)
    tipo_carteira = models.CharField(
        max_length=20,
        db_column='TIPO_CARTEIRA',
        verbose_name='Tipo de Carteira',
        help_text="CARTEIRINHA, UNIMED ou RECIPROCIDADE"
    )
    contrato = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CONTRATO', verbose_name='Contrato'
    )
    matricula_soul = models.DecimalField(
        max_digits=20, decimal_places=0,
        db_column='MATRICULA_SOUL', verbose_name='Matrícula Soul'
    )
    nr_cpf = models.DecimalField(
        max_digits=11, decimal_places=0, null=True, blank=True,
        db_column='NR_CPF', verbose_name='CPF'
    )
    nome_beneficiario = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_BENEFICIARIO', verbose_name='Nome do Beneficiário'
    )
    matricula = models.CharField(
        max_length=20, null=True, blank=True,
        db_column='MATRICULA', verbose_name='Matrícula'
    )
    nr_cns = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NR_CNS', verbose_name='Cartão Nacional de Saúde'
    )
    nascto = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='NASCTO', verbose_name='Data de Nascimento'
    )
    nm_social = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NM_SOCIAL', verbose_name='Nome Social'
    )
    sn_ativo = models.CharField(
        max_length=1, null=True, blank=True,
        db_column='SN_ATIVO', verbose_name='Ativo'
    )
    segmentacao = models.CharField(
        max_length=40, null=True, blank=True,
        db_column='SEGMENTACAO', verbose_name='Segmentação'
    )

    # Specific fields - Main card
    empresa = models.CharField(
        max_length=170, null=True, blank=True,
        db_column='EMPRESA', verbose_name='Empresa'
    )
    cd_plano = models.DecimalField(
        max_digits=20, decimal_places=0, null=True, blank=True,
        db_column='CD_PLANO', verbose_name='Código do Plano'
    )
    plano_nome = models.CharField(
        max_length=133, null=True, blank=True,
        db_column='PLANO_NOME', verbose_name='Nome do Plano'
    )
    plano_secundario = models.CharField(
        max_length=115, null=True, blank=True,
        db_column='PLANO_SECUNDARIO', verbose_name='Plano Secundário'
    )
    plano_terciario = models.CharField(
        max_length=111, null=True, blank=True,
        db_column='PLANO_TERCIARIO', verbose_name='Plano Terciário'
    )
    tipo_contratacao = models.CharField(
        max_length=20, null=True, blank=True,
        db_column='TIPO_CONTRATACAO', verbose_name='Tipo de Contratação'
    )
    data_validade = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='DATA_VALIDADE', verbose_name='Data de Validade'
    )
    cpt = models.CharField(
        max_length=13, null=True, blank=True,
        db_column='CPT', verbose_name='CPT'
    )
    layout = models.CharField(
        max_length=13, null=True, blank=True,
        db_column='LAYOUT', verbose_name='Layout'
    )
    nome_titular = models.CharField(
        max_length=100, null=True, blank=True,
        db_column='NOME_TITULAR', verbose_name='Nome do Titular'
    )

    # Specific fields - Network cards (Unimed/Reciprocity)
    matricula_rede = models.CharField(
        max_length=200, null=True, blank=True,
        db_column='MATRICULA_REDE', verbose_name='Matrícula da Rede'
    )
    prestador_rede = models.CharField(
        max_length=9, null=True, blank=True,
        db_column='PRESTADOR_REDE', verbose_name='Prestador da Rede'
    )
    data_adesao = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='DATA_ADESAO', verbose_name='Data de Adesão'
    )
    abrangencia = models.CharField(
        max_length=8, null=True, blank=True,
        db_column='ABRANGENCIA', verbose_name='Abrangência'
    )
    acomodacao = models.CharField(
        max_length=10, null=True, blank=True,
        db_column='ACOMODACAO', verbose_name='Acomodação'
    )
    rede_atendimento = models.CharField(
        max_length=11, null=True, blank=True,
        db_column='REDE_ATENDIMENTO', verbose_name='Rede de Atendimento'
    )

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_CARTEIRAS_UNIFICADAS"'
        app_label = 'oracle_integration'
        verbose_name = 'Carteira Unificada Oracle'
        verbose_name_plural = 'Carteiras Unificadas Oracle'
        ordering = ['tipo_carteira', 'matricula_soul']

    def __str__(self):
        return f"{self.nome_beneficiario} - {self.tipo_carteira}"

    @property
    def is_carteirinha_principal(self):
        """Check if this is a main Elosaúde card"""
        return self.tipo_carteira == 'CARTEIRINHA'

    @property
    def is_unimed(self):
        """Check if this is a Unimed reciprocity card"""
        return self.tipo_carteira == 'UNIMED'

    @property
    def is_reciprocidade(self):
        """Check if this is a reciprocity card"""
        return self.tipo_carteira == 'RECIPROCIDADE'

    @property
    def numero_carteirinha_display(self):
        """Return the appropriate card number based on card type"""
        if self.is_carteirinha_principal:
            return self.matricula
        else:
            return self.matricula_rede

    @property
    def cpf_formatado(self):
        """Return formatted CPF (XXX.XXX.XXX-XX)"""
        if self.nr_cpf:
            cpf_str = str(int(self.nr_cpf)).zfill(11)
            return f"{cpf_str[:3]}.{cpf_str[3:6]}.{cpf_str[6:9]}-{cpf_str[9:]}"
        return None
