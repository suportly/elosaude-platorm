from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment
from .serializers import (
    ProcedureSerializer, TISSGuideSerializer, TISSGuideCreateSerializer,
    GuideAttachmentSerializer
)


class ProcedureViewSet(viewsets.ModelViewSet):
    queryset = Procedure.objects.all()
    serializer_class = ProcedureSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'requires_authorization', 'is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['name', 'base_price']


class TISSGuideViewSet(viewsets.ModelViewSet):
    queryset = TISSGuide.objects.select_related('beneficiary', 'provider').prefetch_related('guideprocedure_set__procedure', 'attachments').all()
    serializer_class = TISSGuideSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['guide_type', 'status', 'beneficiary']
    search_fields = ['guide_number', 'protocol_number', 'beneficiary__full_name']
    ordering_fields = ['request_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TISSGuideCreateSerializer
        return TISSGuideSerializer

    @action(detail=False, methods=['get'])
    def my_guides(self, request):
        '''Get guides for current user'''
        try:
            beneficiary = request.user.beneficiary
            guides = self.queryset.filter(beneficiary=beneficiary)
            
            # Apply filters
            status_filter = request.query_params.get('status')
            if status_filter:
                guides = guides.filter(status=status_filter)
            
            serializer = self.get_serializer(guides, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def authorize(self, request, pk=None):
        '''Authorize a guide'''
        from apps.guides.tasks import generate_guide_pdf_task
        from apps.notifications.tasks import send_notification
        from django.utils import timezone
        from datetime import timedelta

        guide = self.get_object()

        if guide.status != 'PENDING':
            return Response(
                {'error': 'Only pending guides can be authorized'},
                status=status.HTTP_400_BAD_REQUEST
            )

        guide.status = 'AUTHORIZED'
        guide.authorization_date = timezone.now()
        guide.expiry_date = timezone.now().date() + timedelta(days=30)
        guide.save()

        # Trigger PDF generation task (async)
        generate_guide_pdf_task.delay(guide.id)

        # Send notification
        send_notification.delay(
            beneficiary_id=guide.beneficiary.id,
            title="Guia Autorizada",
            message=f"Sua guia {guide.guide_number} foi autorizada!",
            notification_type='GUIDE_AUTHORIZATION',
            priority='HIGH',
            data={'guide_id': guide.id, 'guide_number': guide.guide_number}
        )

        serializer = self.get_serializer(guide)
        return Response(serializer.data)


class GuideAttachmentViewSet(viewsets.ModelViewSet):
    queryset = GuideAttachment.objects.all()
    serializer_class = GuideAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['guide', 'attachment_type']
