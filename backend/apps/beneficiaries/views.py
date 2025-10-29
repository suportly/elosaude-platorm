from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Company, HealthPlan, Beneficiary, DigitalCard
from .serializers import (
    CompanySerializer, HealthPlanSerializer, BeneficiarySerializer,
    DigitalCardSerializer, BeneficiaryDetailSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'cnpj']
    ordering_fields = ['name', 'created_at']


class HealthPlanViewSet(viewsets.ModelViewSet):
    queryset = HealthPlan.objects.all()
    serializer_class = HealthPlanSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['plan_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'monthly_fee']


class BeneficiaryViewSet(viewsets.ModelViewSet):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['beneficiary_type', 'status', 'company', 'health_plan']
    search_fields = ['full_name', 'cpf', 'registration_number']
    ordering_fields = ['full_name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BeneficiaryDetailSerializer
        return BeneficiarySerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current beneficiary profile"""
        try:
            beneficiary = request.user.beneficiary
            serializer = BeneficiaryDetailSerializer(beneficiary)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current beneficiary profile"""
        try:
            beneficiary = request.user.beneficiary

            # Fields that can be updated by the user
            allowed_fields = [
                'phone', 'email', 'address', 'city', 'state',
                'zip_code', 'emergency_contact', 'emergency_phone'
            ]

            # Filter data to only allowed fields
            update_data = {
                key: value for key, value in request.data.items()
                if key in allowed_fields
            }

            serializer = BeneficiarySerializer(
                beneficiary,
                data=update_data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()
                # Return detailed serializer
                response_serializer = BeneficiaryDetailSerializer(beneficiary)
                return Response(response_serializer.data)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def my_dependents(self, request):
        """Get all dependents of current user"""
        try:
            beneficiary = request.user.beneficiary
            dependents = beneficiary.dependents.all()
            serializer = BeneficiarySerializer(dependents, many=True)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def add_dependent(self, request):
        """Add a new dependent to current user"""
        try:
            holder = request.user.beneficiary

            # Ensure holder is a titular
            if holder.beneficiary_type != 'TITULAR':
                return Response(
                    {'error': 'Only titular beneficiaries can add dependents'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create dependent data
            dependent_data = request.data.copy()
            dependent_data['holder'] = holder.id
            dependent_data['beneficiary_type'] = 'DEPENDENTE'
            dependent_data['company'] = holder.company.id
            dependent_data['health_plan'] = holder.health_plan.id
            dependent_data['status'] = 'PENDING'  # Pending approval

            serializer = BeneficiarySerializer(data=dependent_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['put', 'patch'])
    def update_dependent(self, request, pk=None):
        """Update a dependent of current user"""
        try:
            holder = request.user.beneficiary
            dependent = self.get_object()

            # Ensure the dependent belongs to this holder
            if dependent.holder != holder:
                return Response(
                    {'error': 'You can only update your own dependents'},
                    status=status.HTTP_403_FORBIDDEN
                )

            serializer = BeneficiarySerializer(
                dependent,
                data=request.data,
                partial=request.method == 'PATCH'
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'])
    def remove_dependent(self, request, pk=None):
        """Remove a dependent of current user"""
        try:
            holder = request.user.beneficiary
            dependent = self.get_object()

            # Ensure the dependent belongs to this holder
            if dependent.holder != holder:
                return Response(
                    {'error': 'You can only remove your own dependents'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Instead of deleting, set status to CANCELED
            dependent.status = 'CANCELED'
            dependent.save()

            return Response(
                {'message': 'Dependent removed successfully'},
                status=status.HTTP_200_OK
            )

        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def dependents(self, request, pk=None):
        """Get all dependents of a beneficiary"""
        beneficiary = self.get_object()
        dependents = beneficiary.dependents.all()
        serializer = BeneficiarySerializer(dependents, many=True)
        return Response(serializer.data)


class DigitalCardViewSet(viewsets.ModelViewSet):
    queryset = DigitalCard.objects.all()
    serializer_class = DigitalCardSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'is_active']
    search_fields = ['card_number', 'beneficiary__full_name']
    ordering_fields = ['issue_date', 'expiry_date']

    @action(detail=False, methods=['get'])
    def my_cards(self, request):
        """Get digital cards for current user"""
        try:
            beneficiary = request.user.beneficiary
            cards = DigitalCard.objects.filter(beneficiary=beneficiary, is_active=True)
            serializer = self.get_serializer(cards, many=True)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
