from django.contrib import admin
from .models import UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ['original_filename', 'upload_type', 'beneficiary', 'file_size_mb', 'uploaded_at']
    list_filter = ['upload_type', 'uploaded_at']
    search_fields = ['original_filename', 'beneficiary__full_name']
    readonly_fields = ['id', 'uploaded_at', 'file_size', 'content_type']
    date_hierarchy = 'uploaded_at'

    def file_size_mb(self, obj):
        """Display file size in MB"""
        if obj.file_size:
            return f"{obj.file_size / (1024*1024):.2f} MB"
        return "N/A"
    file_size_mb.short_description = 'Tamanho'
