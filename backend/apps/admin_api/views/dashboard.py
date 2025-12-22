from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from apps.beneficiaries.models import Beneficiary
from apps.providers.models import AccreditedProvider
from apps.reimbursements.models import ReimbursementRequest
from ..models import AuditLog
from ..serializers import AuditLogSerializer
from ..permissions import IsAdminUser


class DashboardMetricsView(APIView):
    """Get dashboard metrics"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        period = request.query_params.get('period', 'month')

        # Calculate date range
        now = timezone.now()
        if period == 'today':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:  # month
            start_date = now - timedelta(days=30)

        # Get metrics
        metrics = {
            'total_beneficiaries': Beneficiary.objects.count(),
            'active_beneficiaries': Beneficiary.objects.filter(status='ACTIVE').count(),
            'total_providers': AccreditedProvider.objects.filter(is_active=True).count(),
            'pending_reimbursements': ReimbursementRequest.objects.filter(
                status='IN_ANALYSIS'
            ).count(),
            'total_reimbursement_value': ReimbursementRequest.objects.filter(
                status__in=['APPROVED', 'PAID']
            ).aggregate(total=Sum('approved_amount'))['total'] or 0,
            'approved_this_period': ReimbursementRequest.objects.filter(
                status='APPROVED',
                analysis_date__gte=start_date
            ).count(),
            'rejected_this_period': ReimbursementRequest.objects.filter(
                status='DENIED',
                analysis_date__gte=start_date
            ).count(),
            'new_users_this_period': Beneficiary.objects.filter(
                created_at__gte=start_date
            ).count(),
        }

        return Response(metrics)


class RecentActivityView(APIView):
    """Get recent admin activity"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        limit = int(request.query_params.get('limit', 20))
        limit = min(limit, 50)  # Cap at 50

        activities = AuditLog.objects.select_related('admin').order_by('-timestamp')[:limit]
        serializer = AuditLogSerializer(activities, many=True)

        return Response(serializer.data)


class AuditLogListView(generics.ListAPIView):
    """List all audit logs with filtering"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        queryset = AuditLog.objects.select_related('admin').order_by('-timestamp')

        # Filter by admin
        admin_id = self.request.query_params.get('admin_id')
        if admin_id:
            queryset = queryset.filter(admin_id=admin_id)

        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)

        # Filter by entity type
        entity_type = self.request.query_params.get('entity_type')
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)

        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(timestamp__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(timestamp__date__lte=date_to)

        return queryset
