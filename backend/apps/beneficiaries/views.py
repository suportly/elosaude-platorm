from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import connection
from apps.common.pagination import StandardResultsSetPagination, SmallResultsSetPagination
from .models import Company, HealthPlan, Beneficiary
from .serializers import (
    CompanySerializer, HealthPlanSerializer, BeneficiarySerializer,
    BeneficiaryDetailSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'cnpj']
    ordering_fields = ['name', 'created_at']


class HealthPlanViewSet(viewsets.ModelViewSet):
    queryset = HealthPlan.objects.all()
    serializer_class = HealthPlanSerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['plan_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'monthly_fee']


class BeneficiaryViewSet(viewsets.ModelViewSet):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer
    pagination_class = StandardResultsSetPagination
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
            titular = request.user.beneficiary

            # Ensure titular is a titular
            if titular.beneficiary_type != 'TITULAR':
                return Response(
                    {'error': 'Only titular beneficiaries can add dependents'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create dependent data
            dependent_data = request.data.copy()

            # Convert gender from frontend format (MALE/FEMALE) to backend format (M/F)
            if 'gender' in dependent_data:
                gender_map = {'MALE': 'M', 'FEMALE': 'F', 'OTHER': 'OTHER'}
                dependent_data['gender'] = gender_map.get(dependent_data['gender'], dependent_data['gender'])

            # Set required fields from titular
            dependent_data['titular'] = titular.id
            dependent_data['beneficiary_type'] = 'DEPENDENT'
            dependent_data['company'] = titular.company.id
            dependent_data['health_plan'] = titular.health_plan.id
            dependent_data['status'] = 'ACTIVE'

            # Inherit address from titular if not provided
            if not dependent_data.get('address'):
                dependent_data['address'] = titular.address
            if not dependent_data.get('city'):
                dependent_data['city'] = titular.city
            if not dependent_data.get('state'):
                dependent_data['state'] = titular.state
            if not dependent_data.get('zip_code'):
                dependent_data['zip_code'] = titular.zip_code

            # Email and phone are optional for dependents, don't auto-fill them

            serializer = BeneficiarySerializer(data=dependent_data)
            if serializer.is_valid():
                dependent = serializer.save()
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
            titular = request.user.beneficiary
            dependent = self.get_object()

            # Ensure the dependent belongs to this titular
            if dependent.titular != titular:
                return Response(
                    {'error': 'You can only update your own dependents'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Prepare update data
            update_data = request.data.copy()

            # Convert gender from frontend format (MALE/FEMALE) to backend format (M/F)
            if 'gender' in update_data:
                gender_map = {'MALE': 'M', 'FEMALE': 'F', 'OTHER': 'OTHER'}
                update_data['gender'] = gender_map.get(update_data['gender'], update_data['gender'])

            serializer = BeneficiarySerializer(
                dependent,
                data=update_data,
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
            titular = request.user.beneficiary
            dependent = self.get_object()

            # Ensure the dependent belongs to this titular
            if dependent.titular != titular:
                return Response(
                    {'error': 'You can only remove your own dependents'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Instead of deleting, set status to CANCELLED
            dependent.status = 'CANCELLED'
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

    @action(detail=False, methods=['get'])
    def my_cards(self, request):
        """Get all cards for current user from PostgreSQL view"""
        try:
            beneficiary = request.user.beneficiary
            cpf = beneficiary.cpf

            # Remove any formatting from CPF
            cpf_clean = ''.join(filter(str.isdigit, cpf))

            carteirinha = []
            unimed = []
            reciprocidade = []

            with connection.cursor() as cursor:
                # Query the unified view by CPF
                cursor.execute("""
                    SELECT
                        tipo_carteira,
                        contrato,
                        matricula_soul,
                        nr_cpf,
                        nome_beneficiario,
                        matricula,
                        nr_cns,
                        nascto,
                        nm_social,
                        sn_ativo,
                        segmentacao,
                        empresa,
                        cd_plano,
                        plano_nome,
                        plano_secundario,
                        plano_terciario,
                        tipo_contratacao,
                        data_validade,
                        cpt,
                        layout,
                        nome_titular,
                        matricula_rede,
                        prestador_rede,
                        data_adesao,
                        abrangencia,
                        acomodacao,
                        rede_atendimento
                    FROM public.v_app_carteiras_unificadas
                    WHERE LPAD(nr_cpf::TEXT, 11, '0') = %s
                       OR nr_cpf::TEXT = %s
                """, [cpf_clean.zfill(11), cpf_clean])

                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()

                for row in rows:
                    record = dict(zip(columns, row))
                    tipo = record.get('tipo_carteira', '').upper()

                    # Helper to format date fields
                    def format_date(val):
                        if val is None:
                            return None
                        if hasattr(val, 'strftime'):
                            return val.strftime('%d/%m/%Y')
                        return str(val)

                    def format_date_iso(val):
                        if val is None:
                            return None
                        if hasattr(val, 'isoformat'):
                            return val.isoformat()
                        return str(val)

                    if tipo == 'CARTEIRINHA':
                        # Format for OracleCarteirinha interface
                        carteirinha.append({
                            'CONTRATO': record.get('contrato'),
                            'MATRICULA_SOUL': record.get('matricula_soul'),
                            'NR_CPF': record.get('nr_cpf'),
                            'NOME_DO_BENEFICIARIO': record.get('nome_beneficiario'),
                            'MATRICULA': record.get('matricula'),
                            'CD_PLANO': record.get('cd_plano'),
                            'PRIMARIO': record.get('plano_nome'),
                            'SEGMENTACAO': record.get('segmentacao'),
                            'NR_CNS': record.get('nr_cns'),
                            'NASCTO': format_date(record.get('nascto')),
                            'NM_SOCIAL': record.get('nm_social'),
                            'SN_ATIVO': record.get('sn_ativo'),
                            'SECUNDARIO': record.get('plano_secundario'),
                            'TERCIARIO': record.get('plano_terciario'),
                            'CONTRATACAO': record.get('tipo_contratacao'),
                            'VALIDADE': record.get('data_validade'),
                            'CPT': record.get('cpt'),
                            'LAYOUT': record.get('layout'),
                            'NOME_TITULAR': record.get('nome_titular'),
                            'EMPRESA': record.get('empresa'),
                        })
                    elif tipo == 'UNIMED':
                        # Format for OracleUnimed interface
                        unimed.append({
                            'MATRICULA_UNIMED': record.get('matricula_rede'),
                            'PLANO': record.get('plano_nome'),
                            'ABRANGENCIA': record.get('abrangencia'),
                            'ACOMODACAO': record.get('acomodacao'),
                            'Validade': record.get('data_validade'),
                            'CPF': record.get('nr_cpf'),
                            'NOME': record.get('nome_beneficiario'),
                            'DATA_NASCIMENTO': format_date(record.get('nascto')),
                            'SN_ATIVO': record.get('sn_ativo'),
                            'MATRICULA_SOUL': record.get('matricula_soul'),
                            'CONTRATO': record.get('contrato'),
                            'NR_CNS': record.get('nr_cns'),
                            'NM_SOCIAL': record.get('nm_social'),
                            'CONTRATANTE': record.get('tipo_contratacao'),
                            'NOME_TITULAR': record.get('nome_titular'),
                            'REDE_ATENDIMENTO': record.get('rede_atendimento'),
                            'VIGENCIA': format_date_iso(record.get('data_adesao')),
                        })
                    elif tipo == 'RECIPROCIDADE':
                        # Format for OracleReciprocidade interface
                        reciprocidade.append({
                            'CD_MATRICULA_RECIPROCIDADE': record.get('matricula_rede'),
                            'PRESTADOR_RECIPROCIDADE': record.get('prestador_rede'),
                            'DT_VALIDADE_CARTEIRA': record.get('data_validade'),
                            'PLANO_ELOSAUDE': record.get('plano_nome'),
                            'NR_CPF': record.get('nr_cpf'),
                            'NOME_BENEFICIARIO': record.get('nome_beneficiario'),
                            'DT_NASCIMENTO': format_date(record.get('nascto')),
                            'SN_ATIVO': record.get('sn_ativo'),
                            'MATRICULA_SOUL': record.get('matricula_soul'),
                            'CONTRATO': record.get('contrato'),
                            'MATRICULA': record.get('matricula'),
                            'NR_CNS': record.get('nr_cns'),
                            'NM_SOCIAL': record.get('nm_social'),
                            'DT_ADESAO': format_date_iso(record.get('data_adesao')),
                        })

            total_cards = len(carteirinha) + len(unimed) + len(reciprocidade)

            return Response({
                'carteirinha': carteirinha,
                'unimed': unimed,
                'reciprocidade': reciprocidade,
                'total_cards': total_cards,
            })

        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
