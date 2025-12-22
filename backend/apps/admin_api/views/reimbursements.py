from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.reimbursements.models import ReimbursementRequest
from ..models import AuditLog
from ..serializers import (
    ReimbursementListSerializer,
    ReimbursementDetailSerializer,
    AuditLogSerializer
)
from ..permissions import IsAdminUser, CanEditPermission
from ..signals import log_admin_action


class ReimbursementListView(generics.ListAPIView):
    """List reimbursements with filters"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ReimbursementListSerializer

    def get_queryset(self):
        queryset = ReimbursementRequest.objects.select_related(
            'beneficiary'
        ).order_by('-request_date')

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                protocol_number__icontains=search
            ) | queryset.filter(
                beneficiary__full_name__icontains=search
            )

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by expense type
        expense_type = self.request.query_params.get('expense_type')
        if expense_type:
            queryset = queryset.filter(expense_type=expense_type)

        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(request_date__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(request_date__date__lte=date_to)

        return queryset


class ReimbursementDetailView(generics.RetrieveAPIView):
    """Get reimbursement details with documents"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ReimbursementDetailSerializer
    queryset = ReimbursementRequest.objects.select_related(
        'beneficiary'
    ).prefetch_related('documents')


class ReimbursementApproveView(APIView):
    """Approve a reimbursement"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]

    def post(self, request, pk):
        reimbursement = get_object_or_404(ReimbursementRequest, pk=pk)

        if reimbursement.status != 'IN_ANALYSIS':
            return Response(
                {'error': 'Only pending reimbursements can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )

        approved_amount = request.data.get('approved_amount')
        notes = request.data.get('notes', '')

        if approved_amount is None:
            return Response(
                {'error': 'Approved amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = reimbursement.status
        reimbursement.approved_amount = approved_amount
        reimbursement.notes = notes
        reimbursement.analysis_date = timezone.now()

        if float(approved_amount) < float(reimbursement.requested_amount):
            reimbursement.status = 'PARTIALLY_APPROVED'
        else:
            reimbursement.status = 'APPROVED'

        reimbursement.save()

        log_admin_action(
            request=request,
            action='APPROVE',
            entity=reimbursement,
            changes={
                'status': {'old': old_status, 'new': reimbursement.status},
                'approved_amount': {'old': None, 'new': str(approved_amount)},
                'notes': notes
            }
        )

        # TODO: Send notification to beneficiary
        # from apps.notifications.tasks import send_reimbursement_approved_email
        # send_reimbursement_approved_email.delay(reimbursement.id)

        return Response({
            'message': 'Reimbursement approved successfully',
            'status': reimbursement.status
        })


class ReimbursementRejectView(APIView):
    """Reject a reimbursement"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]

    def post(self, request, pk):
        reimbursement = get_object_or_404(ReimbursementRequest, pk=pk)

        if reimbursement.status != 'IN_ANALYSIS':
            return Response(
                {'error': 'Only pending reimbursements can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )

        denial_reason = request.data.get('denial_reason', '')

        if not denial_reason:
            return Response(
                {'error': 'Denial reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = reimbursement.status
        reimbursement.status = 'DENIED'
        reimbursement.denial_reason = denial_reason
        reimbursement.analysis_date = timezone.now()
        reimbursement.save()

        log_admin_action(
            request=request,
            action='REJECT',
            entity=reimbursement,
            changes={
                'status': {'old': old_status, 'new': 'DENIED'},
                'denial_reason': denial_reason
            }
        )

        # TODO: Send notification to beneficiary
        # from apps.notifications.tasks import send_reimbursement_rejected_email
        # send_reimbursement_rejected_email.delay(reimbursement.id)

        return Response({'message': 'Reimbursement rejected successfully'})


class ReimbursementHistoryView(APIView):
    """Get reimbursement status change history"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        reimbursement = get_object_or_404(ReimbursementRequest, pk=pk)

        history = AuditLog.objects.filter(
            entity_type='ReimbursementRequest',
            entity_id=pk
        ).order_by('-timestamp')

        serializer = AuditLogSerializer(history, many=True)
        return Response(serializer.data)
