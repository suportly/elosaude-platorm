from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    """Serializer for uploaded files"""

    url = serializers.SerializerMethodField()
    upload_type_display = serializers.CharField(
        source='get_upload_type_display',
        read_only=True
    )

    class Meta:
        model = UploadedFile
        fields = [
            'id',
            'file',
            'url',
            'original_filename',
            'upload_type',
            'upload_type_display',
            'file_size',
            'content_type',
            'uploaded_at',
        ]
        read_only_fields = ['id', 'uploaded_at', 'file_size', 'content_type']

    def get_url(self, obj):
        """Get full URL for the file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def create(self, validated_data):
        """Create uploaded file with beneficiary from request"""
        request = self.context.get('request')
        if request and hasattr(request.user, 'beneficiary'):
            validated_data['beneficiary'] = request.user.beneficiary

        # Get file info
        file_obj = validated_data.get('file')
        if file_obj:
            validated_data['original_filename'] = file_obj.name
            validated_data['file_size'] = file_obj.size
            validated_data['content_type'] = file_obj.content_type

        return super().create(validated_data)
