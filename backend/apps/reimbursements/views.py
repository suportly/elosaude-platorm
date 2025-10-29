from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import ReimbursementRequest, ReimbursementDocument
from .serializers import (
    ReimbursementRequestSerializer, ReimbursementRequestCreateSerializer,
    ReimbursementDocumentSerializer
)


class ReimbursementRequestViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementRequest.objects.select_related('beneficiary').prefetch_related('documents').all()
    serializer_class = ReimbursementRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['expense_type', 'status', 'beneficiary']
    search_fields = ['protocol_number', 'provider_name', 'beneficiary__full_name']
    ordering_fields = ['service_date', 'created_at', 'requested_amount']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReimbursementRequestCreateSerializer
        return ReimbursementRequestSerializer

    @action(detail=False, methods=['get'])
    def my_reimbursements(self, request):
        '''Get reimbursements for current user'''
        try:
            beneficiary = request.user.beneficiary
            reimbursements = self.queryset.filter(beneficiary=beneficiary)
            
            status_filter = request.query_params.get('status')
            if status_filter:
                reimbursements = reimbursements.filter(status=status_filter)
            
            serializer = self.get_serializer(reimbursements, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        '''Get reimbursement summary for current user'''
        try:
            beneficiary = request.user.beneficiary
            reimbursements = self.queryset.filter(beneficiary=beneficiary)
            
            total_requested = sum(r.requested_amount for r in reimbursements)
            total_approved = sum(r.approved_amount or 0 for r in reimbursements.filter(status__in=['APPROVED', 'PARTIALLY_APPROVED', 'PAID']))
            
            return Response({
                'total_requested': float(total_requested),
                'total_approved': float(total_approved),
                'pending_count': reimbursements.filter(status='IN_ANALYSIS').count(),
                'approved_count': reimbursements.filter(status__in=['APPROVED', 'PAID']).count(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class ReimbursementDocumentViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementDocument.objects.all()
    serializer_class = ReimbursementDocumentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reimbursement', 'document_type']
