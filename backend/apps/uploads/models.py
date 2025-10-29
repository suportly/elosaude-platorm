from django.db import models
from apps.beneficiaries.models import Beneficiary
import uuid
import os


def upload_to(instance, filename):
    """Generate upload path for files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', instance.upload_type, filename)


class UploadedFile(models.Model):
    """Model for storing uploaded files"""

    UPLOAD_TYPES = [
        ('GUIDE_ATTACHMENT', 'Anexo de Guia'),
        ('REIMBURSEMENT_DOCUMENT', 'Documento de Reembolso'),
        ('PROFILE_PHOTO', 'Foto de Perfil'),
        ('PRESCRIPTION', 'Receita Médica'),
        ('MEDICAL_REPORT', 'Relatório Médico'),
        ('INVOICE', 'Nota Fiscal'),
        ('RECEIPT', 'Comprovante'),
        ('OTHER', 'Outro'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    beneficiary = models.ForeignKey(
        Beneficiary,
        on_delete=models.CASCADE,
        related_name='uploaded_files',
        verbose_name='Beneficiário'
    )
    file = models.FileField(
        upload_to=upload_to,
        verbose_name='Arquivo',
        max_length=500
    )
    original_filename = models.CharField(
        max_length=255,
        verbose_name='Nome Original'
    )
    upload_type = models.CharField(
        max_length=50,
        choices=UPLOAD_TYPES,
        default='OTHER',
        verbose_name='Tipo de Upload'
    )
    file_size = models.IntegerField(
        verbose_name='Tamanho do Arquivo (bytes)',
        null=True,
        blank=True
    )
    content_type = models.CharField(
        max_length=100,
        verbose_name='Tipo de Conteúdo',
        blank=True
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Data de Upload'
    )

    class Meta:
        db_table = 'uploads_uploaded_file'
        verbose_name = 'Arquivo Enviado'
        verbose_name_plural = 'Arquivos Enviados'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_filename} ({self.get_upload_type_display()})"

    def delete(self, *args, **kwargs):
        """Delete file from storage when model is deleted"""
        if self.file:
            self.file.delete(save=False)
        super().delete(*args, **kwargs)
