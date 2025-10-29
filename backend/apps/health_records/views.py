from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import HealthRecord, Vaccination
from .serializers import HealthRecordSerializer, VaccinationSerializer


class HealthRecordViewSet(viewsets.ModelViewSet):
    queryset = HealthRecord.objects.all()
    serializer_class = HealthRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['record_type', 'date']
    search_fields = ['provider_name', 'professional_name', 'diagnosis', 'description']
    ordering_fields = ['date', 'created_at']
    
    def get_queryset(self):
        """Filter records for current user's beneficiary only"""
        try:
            beneficiary = self.request.user.beneficiary
            return self.queryset.filter(beneficiary=beneficiary)
        except:
            return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def my_records(self, request):
        """Get health records for current user"""
        queryset = self.get_queryset()
        
        # Apply filters
        record_type = request.query_params.get('record_type')
        if record_type:
            queryset = queryset.filter(record_type=record_type)
        
        # Order by date (newest first)
        queryset = queryset.order_by('-date', '-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of health records"""
        queryset = self.get_queryset()
        
        summary = {
            'total': queryset.count(),
            'by_type': {}
        }
        
        for record_type, display_name in HealthRecord.RECORD_TYPES:
            count = queryset.filter(record_type=record_type).count()
            if count > 0:
                summary['by_type'][record_type] = {
                    'name': display_name,
                    'count': count
                }
        
        return Response(summary)


class VaccinationViewSet(viewsets.ModelViewSet):
    queryset = Vaccination.objects.all()
    serializer_class = VaccinationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['vaccine_name', 'date_administered']
    search_fields = ['vaccine_name', 'provider_name', 'professional_name']
    ordering_fields = ['date_administered', 'next_dose_date', 'created_at']
    
    def get_queryset(self):
        """Filter vaccinations for current user's beneficiary only"""
        try:
            beneficiary = self.request.user.beneficiary
            return self.queryset.filter(beneficiary=beneficiary)
        except:
            return self.queryset.none()
    
    @action(detail=False, methods=['get'])
    def my_vaccinations(self, request):
        """Get vaccinations for current user"""
        queryset = self.get_queryset().order_by('-date_administered', '-created_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming vaccinations (where next_dose_date is in the future or today)"""
        from django.utils import timezone
        queryset = self.get_queryset().filter(
            next_dose_date__isnull=False,
            next_dose_date__gte=timezone.now().date()
        ).order_by('next_dose_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue vaccinations"""
        from django.utils import timezone
        queryset = self.get_queryset().filter(
            next_dose_date__isnull=False,
            next_dose_date__lt=timezone.now().date()
        ).order_by('next_dose_date')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
