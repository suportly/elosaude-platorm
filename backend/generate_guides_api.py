# Script para gerar serializers e views do app Guides

serializers_content = """from rest_framework import serializers
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ['id', 'code', 'name', 'category', 'base_price', 'requires_authorization', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class GuideProcedureSerializer(serializers.ModelSerializer):
    procedure_name = serializers.CharField(source='procedure.name', read_only=True)
    procedure_code = serializers.CharField(source='procedure.code', read_only=True)
    
    class Meta:
        model = GuideProcedure
        fields = ['id', 'procedure', 'procedure_name', 'procedure_code', 'quantity', 'authorized_quantity', 'unit_price', 'total_price']


class GuideAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GuideAttachment
        fields = ['id', 'guide', 'attachment_type', 'description', 'file', 'file_url', 'created_at']
        read_only_fields = ['created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class TISSGuideSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    procedures = GuideProcedureSerializer(source='guideprocedure_set', many=True, read_only=True)
    attachments = GuideAttachmentSerializer(many=True, read_only=True)
    guide_type_display = serializers.CharField(source='get_guide_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TISSGuide
        fields = [
            'id', 'guide_number', 'protocol_number', 'guide_type', 'guide_type_display',
            'status', 'status_display', 'beneficiary', 'beneficiary_name',
            'provider', 'provider_name', 'procedures', 'attachments',
            'request_date', 'authorization_date', 'expiry_date',
            'diagnosis', 'observations', 'requesting_physician_name', 'requesting_physician_crm',
            'denial_reason', 'guide_pdf', 'created_at', 'updated_at'
        ]
        read_only_fields = ['guide_number', 'protocol_number', 'created_at', 'updated_at']


class TISSGuideCreateSerializer(serializers.ModelSerializer):
    procedure_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    quantities = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = TISSGuide
        fields = [
            'guide_type', 'beneficiary', 'provider', 'diagnosis', 'observations',
            'requesting_physician_name', 'requesting_physician_crm',
            'procedure_ids', 'quantities'
        ]
    
    def create(self, validated_data):
        procedure_ids = validated_data.pop('procedure_ids')
        quantities = validated_data.pop('quantities', None)
        
        guide = TISSGuide.objects.create(**validated_data)
        
        # Add procedures
        for idx, proc_id in enumerate(procedure_ids):
            procedure = Procedure.objects.get(id=proc_id)
            qty = quantities[idx] if quantities and idx < len(quantities) else 1
            GuideProcedure.objects.create(
                guide=guide,
                procedure=procedure,
                quantity=qty,
                unit_price=procedure.base_price,
                total_price=procedure.base_price * qty
            )
        
        return guide
"""

views_content = """from rest_framework import viewsets, filters, status
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
        guide = self.get_object()
        
        if guide.status != 'PENDING':
            return Response(
                {'error': 'Only pending guides can be authorized'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        guide.status = 'AUTHORIZED'
        guide.save()
        
        # TODO: Trigger PDF generation task
        # TODO: Send notification
        
        serializer = self.get_serializer(guide)
        return Response(serializer.data)


class GuideAttachmentViewSet(viewsets.ModelViewSet):
    queryset = GuideAttachment.objects.all()
    serializer_class = GuideAttachmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['guide', 'attachment_type']
"""

urls_content = """from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProcedureViewSet, TISSGuideViewSet, GuideAttachmentViewSet

router = DefaultRouter()
router.register(r'procedures', ProcedureViewSet, basename='procedure')
router.register(r'guides', TISSGuideViewSet, basename='guide')
router.register(r'attachments', GuideAttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]
"""

# Write files
with open('/home/alairjt/workspace/elosaude-platform/backend/apps/guides/serializers.py', 'w') as f:
    f.write(serializers_content)

with open('/home/alairjt/workspace/elosaude-platform/backend/apps/guides/views.py', 'w') as f:
    f.write(views_content)

with open('/home/alairjt/workspace/elosaude-platform/backend/apps/guides/urls.py', 'w') as f:
    f.write(urls_content)

print("✅ Guides App API generated successfully!")
