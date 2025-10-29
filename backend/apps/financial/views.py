from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Invoice, PaymentHistory, UsageHistory, TaxStatement
from .serializers import (
    InvoiceSerializer, PaymentHistorySerializer,
    UsageHistorySerializer, TaxStatementSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('beneficiary').prefetch_related('payments').all()
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'beneficiary', 'reference_month']
    ordering_fields = ['due_date', 'created_at', 'amount']

    @action(detail=False, methods=['get'])
    def my_invoices(self, request):
        '''Get invoices for current user'''
        try:
            beneficiary = request.user.beneficiary
            invoices = self.queryset.filter(beneficiary=beneficiary)
            
            status_filter = request.query_params.get('status')
            if status_filter:
                invoices = invoices.filter(status=status_filter)
            
            serializer = self.get_serializer(invoices, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class PaymentHistoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentHistory.objects.select_related('invoice').all()
    serializer_class = PaymentHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method']
    ordering_fields = ['payment_date', 'created_at']


class UsageHistoryViewSet(viewsets.ModelViewSet):
    queryset = UsageHistory.objects.select_related('beneficiary').all()
    serializer_class = UsageHistorySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'period']
    ordering_fields = ['period', 'total_amount']

    @action(detail=False, methods=['get'])
    def my_usage(self, request):
        '''Get usage history for current user'''
        try:
            beneficiary = request.user.beneficiary
            usage = self.queryset.filter(beneficiary=beneficiary)
            
            period = request.query_params.get('period')
            if period:
                usage = usage.filter(period=period)
            
            serializer = self.get_serializer(usage, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class TaxStatementViewSet(viewsets.ModelViewSet):
    queryset = TaxStatement.objects.select_related('beneficiary').all()
    serializer_class = TaxStatementSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'year']
    ordering_fields = ['year', 'created_at']

    @action(detail=False, methods=['get'])
    def my_statements(self, request):
        '''Get tax statements for current user'''
        try:
            beneficiary = request.user.beneficiary
            statements = self.queryset.filter(beneficiary=beneficiary)
            serializer = self.get_serializer(statements, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
