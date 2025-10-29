from django.db import models
from apps.beneficiaries.models import Beneficiary
from apps.providers.models import AccreditedProvider
import uuid


class HealthRecord(models.Model):
    """Model to store health records for beneficiaries"""
    
    RECORD_TYPES = [
        ('CONSULTATION', 'Consulta'),
        ('EXAM', 'Exame'),
        ('SURGERY', 'Cirurgia'),
        ('HOSPITALIZATION', 'Internação'),
        ('EMERGENCY', 'Emergência'),
        ('PROCEDURE', 'Procedimento'),
        ('OTHER', 'Outro'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        related_name='health_records',
        verbose_name='Beneficiário'
    )
    record_type = models.CharField(
        max_length=20,
        choices=RECORD_TYPES,
        verbose_name='Tipo de Registro'
    )
    date = models.DateField(verbose_name='Data')
    provider = models.ForeignKey(
        AccreditedProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='health_records',
        verbose_name='Prestador'
    )
    provider_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Nome do Prestador'
    )
    professional_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Nome do Profissional'
    )
    specialty = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Especialidade'
    )
    diagnosis = models.TextField(
        blank=True,
        verbose_name='Diagnóstico/CID'
    )
    description = models.TextField(
        verbose_name='Descrição/Observações'
    )
    prescribed_medications = models.TextField(
        blank=True,
        verbose_name='Medicamentos Prescritos'
    )
    attachments = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Anexos'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'health_records'
        verbose_name = 'Registro de Saúde'
        verbose_name_plural = 'Registros de Saúde'
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.get_record_type_display()} - {self.date}"


class Vaccination(models.Model):
    """Model to store vaccination records"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        related_name='vaccinations',
        verbose_name='Beneficiário'
    )
    vaccine_name = models.CharField(
        max_length=200,
        verbose_name='Nome da Vacina'
    )
    dose = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='Dose'
    )
    batch_number = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Lote'
    )
    date_administered = models.DateField(verbose_name='Data de Aplicação')
    next_dose_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='Próxima Dose'
    )
    provider = models.ForeignKey(
        AccreditedProvider,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vaccinations',
        verbose_name='Local de Aplicação'
    )
    provider_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Nome do Local'
    )
    professional_name = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Profissional Responsável'
    )
    notes = models.TextField(
        blank=True,
        verbose_name='Observações'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        db_table = 'vaccinations'
        verbose_name = 'Vacinação'
        verbose_name_plural = 'Vacinações'
        ordering = ['-date_administered', '-created_at']
    
    def __str__(self):
        return f"{self.beneficiary.full_name} - {self.vaccine_name} - {self.date_administered}"
