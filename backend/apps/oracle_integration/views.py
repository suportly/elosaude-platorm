"""
Oracle Integration Views
API views for Oracle card data
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from .connection import OracleConnection
from .models import OracleCarteirasUnificadas
from .serializers import OracleCarteirasUnificadasSerializer


class OracleCardViewSet(viewsets.ViewSet):
    """
    ViewSet for Oracle digital cards
    Provides read-only access to Oracle card data using direct connection
    """

    @action(detail=False, methods=['get'])
    def my_oracle_cards(self, request):
        """
        Get all Oracle cards for current user's beneficiary
        Returns cards from all 3 Oracle views: Carteirinha, Unimed, Reciprocidade
        """
        try:
            beneficiary = request.user.beneficiary
            # Convert CPF to number format (remove dots and dashes)
            cpf_clean = beneficiary.cpf.replace('.', '').replace('-', '')
            cpf_number = int(cpf_clean)

            # Query Carteirinha view
            carteirinha_query = """
                SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
                WHERE NR_CPF = :cpf AND SN_ATIVO = 'S'
                ORDER BY CD_PLANO
            """
            carteirinha = OracleConnection.execute_query(carteirinha_query, {'cpf': cpf_number})

            # Query Unimed view (filter by CPF only, check active status in result)
            unimed_query = """
                SELECT * FROM DBAPS.ESAU_V_APP_UNIMED
                WHERE CPF = :cpf
            """
            unimed_raw = OracleConnection.execute_query(unimed_query, {'cpf': cpf_number})
            # Filter active records (handle case sensitivity)
            unimed = [card for card in unimed_raw if card.get('sn_ativo') == 'S' or card.get('SN_ATIVO') == 'S']

            # Query Reciprocidade view
            reciprocidade_query = """
                SELECT * FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
                WHERE NR_CPF = :cpf AND SN_ATIVO = 'S'
            """
            reciprocidade = OracleConnection.execute_query(reciprocidade_query, {'cpf': cpf_number})

            return Response({
                'carteirinha': carteirinha,
                'unimed': unimed,
                'reciprocidade': reciprocidade,
                'total_cards': len(carteirinha) + len(unimed) + len(reciprocidade)
            })

        except AttributeError:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': f'Invalid CPF format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching Oracle cards: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def test_connection(self, request):
        """
        Test Oracle database connection
        Returns connection status and sample data count
        """
        try:
            # Test connection
            OracleConnection.test_connection()

            # Count active records
            carteirinha_count_query = """
                SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_CARTEIRINHA WHERE SN_ATIVO = 'S'
            """
            # Unimed view has all records (no active filter available in Oracle)
            unimed_count_query = """
                SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_UNIMED
            """
            reciprocidade_count_query = """
                SELECT COUNT(*) AS CNT FROM DBAPS.ESAU_V_APP_RECIPROCIDADE WHERE SN_ATIVO = 'S'
            """

            carteirinha_result = OracleConnection.execute_query(carteirinha_count_query)
            unimed_result = OracleConnection.execute_query(unimed_count_query)
            reciprocidade_result = OracleConnection.execute_query(reciprocidade_count_query)

            carteirinha_count = carteirinha_result[0]['CNT'] if carteirinha_result else 0
            unimed_count = unimed_result[0]['CNT'] if unimed_result else 0
            reciprocidade_count = reciprocidade_result[0]['CNT'] if reciprocidade_result else 0

            return Response({
                'status': 'connected',
                'database': 'Oracle 192.168.40.29:1521/SIML',
                'active_records': {
                    'carteirinha': carteirinha_count,
                    'unimed': unimed_count,
                    'reciprocidade': reciprocidade_count,
                    'total': carteirinha_count + unimed_count + reciprocidade_count
                }
            })
        except Exception as e:
            return Response(
                {
                    'status': 'error',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OracleCarteirasUnificadasViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for unified Oracle cards view
    Provides read-only access to ESAU_V_APP_CARTEIRAS_UNIFICADAS view

    This view consolidates all 3 card types (CARTEIRINHA, UNIMED, RECIPROCIDADE)
    using UNION ALL, simplifying queries and providing a unified interface.

    Endpoints:
    - GET /api/oracle/carteirinhas-unificadas/ - List all cards
    - GET /api/oracle/carteirinhas-unificadas/?cpf=12345678901 - Filter by CPF
    - GET /api/oracle/carteirinhas-unificadas/?tipo_carteira=UNIMED - Filter by type
    - GET /api/oracle/carteirinhas-unificadas/minhas_carteirinhas/ - Current user's cards
    - GET /api/oracle/carteirinhas-unificadas/estatisticas/ - Statistics
    """
    queryset = OracleCarteirasUnificadas.objects.using('oracle').all()
    serializer_class = OracleCarteirasUnificadasSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo_carteira', 'nr_cpf', 'matricula_soul', 'prestador_rede', 'sn_ativo']
    search_fields = ['nome_beneficiario', 'nr_cns', 'matricula', 'matricula_rede']
    ordering_fields = ['tipo_carteira', 'nome_beneficiario', 'data_validade', 'matricula_soul']
    ordering = ['tipo_carteira', 'matricula_soul']

    @action(detail=False, methods=['get'])
    def minhas_carteirinhas(self, request):
        """
        Get all cards for the currently logged-in beneficiary
        Returns cards grouped by type for easy consumption
        """
        try:
            beneficiary = request.user.beneficiary
            # Convert CPF to number format (remove dots and dashes)
            cpf_clean = beneficiary.cpf.replace('.', '').replace('-', '')
            cpf_number = int(cpf_clean)

            # Query unified view
            carteirinhas = self.queryset.filter(nr_cpf=cpf_number)

            # Group by type
            resultado = {
                'total': carteirinhas.count(),
                'carteirinha_principal': [],
                'unimed': [],
                'reciprocidade': [],
            }

            for carteirinha in carteirinhas:
                serialized = self.get_serializer(carteirinha).data

                if carteirinha.is_carteirinha_principal:
                    resultado['carteirinha_principal'].append(serialized)
                elif carteirinha.is_unimed:
                    resultado['unimed'].append(serialized)
                elif carteirinha.is_reciprocidade:
                    resultado['reciprocidade'].append(serialized)

            # Add summary info
            resultado['tem_unimed'] = len(resultado['unimed']) > 0
            resultado['tem_reciprocidade'] = len(resultado['reciprocidade']) > 0

            return Response(resultado)

        except AttributeError:
            return Response(
                {'error': 'Beneficiary profile not found for current user'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {'error': f'Invalid CPF format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching cards: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """
        Get general statistics about cards in the unified view
        Returns total counts by card type
        """
        try:
            # Count by card type
            stats_por_tipo = self.queryset.values('tipo_carteira').annotate(
                total=Count('matricula_soul')
            ).order_by('-total')

            # Count by provider (for reciprocity/unimed)
            stats_por_prestador = self.queryset.exclude(
                prestador_rede__isnull=True
            ).values('prestador_rede').annotate(
                total=Count('matricula_soul')
            ).order_by('-total')

            # Overall totals
            total_geral = sum(item['total'] for item in stats_por_tipo)

            return Response({
                'total_geral': total_geral,
                'por_tipo': list(stats_por_tipo),
                'por_prestador': list(stats_por_prestador),
            })

        except Exception as e:
            return Response(
                {'error': f'Error generating statistics: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def por_beneficiario(self, request):
        """
        Get cards for a specific beneficiary by CPF or MATRICULA_SOUL
        Query params: cpf=XXX or matricula_soul=XXX
        """
        cpf = request.query_params.get('cpf')
        matricula_soul = request.query_params.get('matricula_soul')

        if not cpf and not matricula_soul:
            return Response(
                {'error': 'Either cpf or matricula_soul parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            if cpf:
                # Clean CPF
                cpf_clean = cpf.replace('.', '').replace('-', '')
                cpf_number = int(cpf_clean)
                carteirinhas = self.queryset.filter(nr_cpf=cpf_number)
            else:
                carteirinhas = self.queryset.filter(matricula_soul=int(matricula_soul))

            # Group by type
            resultado = {
                'total': carteirinhas.count(),
                'carteirinha_principal': [],
                'unimed': [],
                'reciprocidade': [],
            }

            if resultado['total'] == 0:
                return Response(
                    {'error': 'No cards found for this beneficiary'},
                    status=status.HTTP_404_NOT_FOUND
                )

            for carteirinha in carteirinhas:
                serialized = self.get_serializer(carteirinha).data

                if carteirinha.is_carteirinha_principal:
                    resultado['carteirinha_principal'].append(serialized)
                elif carteirinha.is_unimed:
                    resultado['unimed'].append(serialized)
                elif carteirinha.is_reciprocidade:
                    resultado['reciprocidade'].append(serialized)

            return Response(resultado)

        except ValueError as e:
            return Response(
                {'error': f'Invalid parameter format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error fetching cards: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
