from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.beneficiaries.models import Beneficiary
from ..serializers import (
    BeneficiaryListSerializer,
    BeneficiaryDetailSerializer,
    BeneficiaryCreateSerializer,
    BeneficiaryUpdateSerializer
)
from ..permissions import IsAdminUser, CanEditPermission
from ..signals import log_admin_action


class UserListCreateView(generics.ListCreateAPIView):
    """List and create users (beneficiaries)"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BeneficiaryCreateSerializer
        return BeneficiaryListSerializer

    def get_queryset(self):
        queryset = Beneficiary.objects.select_related(
            'company', 'health_plan', 'titular'
        ).order_by('-created_at')

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                full_name__icontains=search
            ) | queryset.filter(
                cpf__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by type
        beneficiary_type = self.request.query_params.get('beneficiary_type')
        if beneficiary_type:
            queryset = queryset.filter(beneficiary_type=beneficiary_type)

        return queryset

    def perform_create(self, serializer):
        instance = serializer.save()
        log_admin_action(
            request=self.request,
            action='CREATE',
            entity=instance
        )


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Get and update user details"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]
    queryset = Beneficiary.objects.select_related(
        'company', 'health_plan', 'titular'
    ).prefetch_related('dependents')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return BeneficiaryUpdateSerializer
        return BeneficiaryDetailSerializer

    def perform_update(self, serializer):
        old_data = BeneficiaryDetailSerializer(self.get_object()).data
        instance = serializer.save()
        new_data = BeneficiaryDetailSerializer(instance).data

        changes = {
            k: {'old': old_data.get(k), 'new': v}
            for k, v in new_data.items()
            if old_data.get(k) != v
        }

        log_admin_action(
            request=self.request,
            action='UPDATE',
            entity=instance,
            changes=changes
        )


class UserDeactivateView(APIView):
    """Deactivate a user (soft delete)"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]

    def post(self, request, pk):
        beneficiary = get_object_or_404(Beneficiary, pk=pk)

        if beneficiary.status == 'CANCELLED':
            return Response(
                {'error': 'User is already deactivated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = beneficiary.status
        beneficiary.status = 'CANCELLED'
        beneficiary.save()

        log_admin_action(
            request=request,
            action='UPDATE',
            entity=beneficiary,
            changes={'status': {'old': old_status, 'new': 'CANCELLED'}}
        )

        return Response({'message': 'User deactivated successfully'})
