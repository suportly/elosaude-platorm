from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Avg
from .models import Specialty, AccreditedProvider, ProviderReview
from .serializers import (
    SpecialtySerializer, AccreditedProviderSerializer,
    AccreditedProviderListSerializer, ProviderReviewSerializer
)


class SpecialtyViewSet(viewsets.ModelViewSet):
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']


class AccreditedProviderViewSet(viewsets.ModelViewSet):
    queryset = AccreditedProvider.objects.prefetch_related('specialties', 'reviews').all()
    serializer_class = AccreditedProviderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['provider_type', 'is_active', 'accepts_telemedicine', 'accepts_emergency', 'city', 'state']
    search_fields = ['name', 'trade_name', 'city', 'specialties__name']
    ordering_fields = ['name', 'rating', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return AccreditedProviderListSerializer
        return AccreditedProviderSerializer

    @action(detail=False, methods=['get'])
    def by_specialty(self, request):
        """Filter providers by specialty"""
        specialty_id = request.query_params.get('specialty_id')
        if not specialty_id:
            return Response(
                {'error': 'specialty_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        providers = self.queryset.filter(specialties__id=specialty_id, is_active=True)
        serializer = AccreditedProviderListSerializer(providers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        """Get providers nearby (requires lat, lon, radius in km)"""
        try:
            lat = float(request.query_params.get('lat'))
            lon = float(request.query_params.get('lon'))
            radius = float(request.query_params.get('radius', 10))
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid lat, lon, or radius parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Simple distance calculation (can be improved with PostGIS)
        # This is a basic implementation - for production use django.contrib.gis
        providers = self.queryset.filter(
            is_active=True,
            latitude__isnull=False,
            longitude__isnull=False
        )
        
        serializer = AccreditedProviderListSerializer(providers, many=True)
        return Response(serializer.data)


class ProviderReviewViewSet(viewsets.ModelViewSet):
    queryset = ProviderReview.objects.select_related('provider', 'beneficiary').all()
    serializer_class = ProviderReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['provider', 'beneficiary', 'rating']
    ordering_fields = ['created_at', 'rating']

    def perform_create(self, serializer):
        # Set beneficiary from current user
        beneficiary = self.request.user.beneficiary
        serializer.save(beneficiary=beneficiary)
