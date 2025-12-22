from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.providers.models import AccreditedProvider
from ..serializers import (
    ProviderListSerializer,
    ProviderDetailSerializer,
    ProviderUpdateSerializer
)
from ..permissions import IsAdminUser, CanEditPermission
from ..signals import log_admin_action


class ProviderListView(generics.ListAPIView):
    """List providers with filters"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    serializer_class = ProviderListSerializer

    def get_queryset(self):
        queryset = AccreditedProvider.objects.prefetch_related(
            'specialties'
        ).order_by('-created_at')

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)

        # Filter by type
        provider_type = self.request.query_params.get('provider_type')
        if provider_type:
            queryset = queryset.filter(provider_type=provider_type)

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Filter by specialty
        specialty = self.request.query_params.get('specialty')
        if specialty:
            queryset = queryset.filter(specialties__id=specialty)

        return queryset.distinct()


class ProviderDetailView(generics.RetrieveUpdateAPIView):
    """Get and update provider details"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]
    queryset = AccreditedProvider.objects.prefetch_related('specialties')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProviderUpdateSerializer
        return ProviderDetailSerializer

    def perform_update(self, serializer):
        old_data = ProviderDetailSerializer(self.get_object()).data
        instance = serializer.save()
        new_data = ProviderDetailSerializer(instance).data

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


class ProviderApproveView(APIView):
    """Approve a provider"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]

    def post(self, request, pk):
        provider = get_object_or_404(AccreditedProvider, pk=pk)

        if provider.is_active:
            return Response(
                {'error': 'Provider is already active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider.is_active = True
        provider.save()

        log_admin_action(
            request=request,
            action='APPROVE',
            entity=provider,
            changes={'is_active': {'old': False, 'new': True}}
        )

        # TODO: Send notification email to provider
        # from apps.notifications.tasks import send_provider_approval_email
        # send_provider_approval_email.delay(provider.id)

        return Response({'message': 'Provider approved successfully'})


class ProviderRejectView(APIView):
    """Reject a provider"""
    permission_classes = [IsAuthenticated, IsAdminUser, CanEditPermission]

    def post(self, request, pk):
        provider = get_object_or_404(AccreditedProvider, pk=pk)
        reason = request.data.get('reason', '')

        if not reason:
            return Response(
                {'error': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        provider.is_active = False
        provider.save()

        log_admin_action(
            request=request,
            action='REJECT',
            entity=provider,
            changes={
                'is_active': {'old': True, 'new': False},
                'rejection_reason': reason
            }
        )

        # TODO: Send notification email to provider
        # from apps.notifications.tasks import send_provider_rejection_email
        # send_provider_rejection_email.delay(provider.id, reason)

        return Response({'message': 'Provider rejected successfully'})
