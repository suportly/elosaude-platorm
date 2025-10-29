from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import UploadedFile
from .serializers import UploadedFileSerializer


class UploadedFileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for uploading and managing files

    Supports multipart/form-data for file uploads
    """
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['upload_type']
    ordering_fields = ['uploaded_at', 'file_size']

    def get_queryset(self):
        """Filter files for current user's beneficiary only"""
        try:
            beneficiary = self.request.user.beneficiary
            return self.queryset.filter(beneficiary=beneficiary)
        except:
            return self.queryset.none()

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        """Upload multiple files at once"""
        files = request.FILES.getlist('files')
        upload_type = request.data.get('upload_type', 'OTHER')

        if not files:
            return Response(
                {'error': 'No files provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            beneficiary = request.user.beneficiary
        except:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        uploaded_files = []
        for file_obj in files:
            uploaded_file = UploadedFile.objects.create(
                beneficiary=beneficiary,
                file=file_obj,
                original_filename=file_obj.name,
                upload_type=upload_type,
                file_size=file_obj.size,
                content_type=file_obj.content_type
            )
            uploaded_files.append(uploaded_file)

        serializer = self.get_serializer(uploaded_files, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_files(self, request):
        """Get all files for current user"""
        queryset = self.get_queryset()

        upload_type = request.query_params.get('upload_type')
        if upload_type:
            queryset = queryset.filter(upload_type=upload_type)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
