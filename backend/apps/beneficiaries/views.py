from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from io import BytesIO
import qrcode
from datetime import datetime
from apps.common.pagination import StandardResultsSetPagination, SmallResultsSetPagination
from .models import Company, HealthPlan, Beneficiary, DigitalCard
from .serializers import (
    CompanySerializer, HealthPlanSerializer, BeneficiarySerializer,
    DigitalCardSerializer, BeneficiaryDetailSerializer
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


class DigitalCardViewSet(viewsets.ModelViewSet):
    queryset = DigitalCard.objects.all()
    serializer_class = DigitalCardSerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'is_active']
    search_fields = ['card_number', 'beneficiary__full_name']
    ordering_fields = ['issue_date', 'expiry_date']

    @action(detail=False, methods=['get'])
    def my_cards(self, request):
        """Get digital cards for current user"""
        try:
            beneficiary = request.user.beneficiary
            show_all = request.query_params.get('show_all', 'false').lower() == 'true'

            if show_all:
                cards = DigitalCard.objects.filter(beneficiary=beneficiary).order_by('-issue_date')
            else:
                cards = DigitalCard.objects.filter(beneficiary=beneficiary, is_active=True).order_by('-issue_date')

            serializer = self.get_serializer(cards, many=True)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def get_by_version(self, request):
        """Get specific card version for current user"""
        try:
            beneficiary = request.user.beneficiary
            version = request.query_params.get('version')

            if not version:
                return Response(
                    {'error': 'Version parameter is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            card = DigitalCard.objects.filter(
                beneficiary=beneficiary,
                version=version
            ).first()

            if card:
                serializer = self.get_serializer(card)
                return Response(serializer.data)

            return Response(
                {'error': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """Set a card as active/inactive"""
        try:
            card = self.get_object()
            beneficiary = request.user.beneficiary

            # Ensure the card belongs to this user
            if card.beneficiary != beneficiary:
                return Response(
                    {'error': 'Unauthorized'},
                    status=status.HTTP_403_FORBIDDEN
                )

            is_active = request.data.get('is_active', True)
            card.is_active = is_active
            card.save()

            serializer = self.get_serializer(card)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Beneficiary profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for digital card"""
        try:
            card = self.get_object()
            beneficiary = card.beneficiary

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            secondary_color = colors.HexColor('#1a8c7a')

            # Header with company/plan name
            p.setFillColor(primary_color)
            p.rect(0, height - 2*cm, width, 2*cm, fill=True, stroke=False)

            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 18)
            p.drawString(2*cm, height - 1.5*cm, "ELOSAÚDE")

            p.setFont("Helvetica", 12)
            p.drawString(2*cm, height - 1.8*cm, beneficiary.health_plan.name if beneficiary.health_plan else "Plano de Saúde")

            # Card title
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(2*cm, height - 3.5*cm, "CARTEIRINHA DIGITAL")

            # Beneficiary info
            y_position = height - 5*cm
            line_height = 0.6*cm

            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))

            # Name
            p.drawString(2*cm, y_position, "NOME:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            p.drawString(5*cm, y_position, beneficiary.full_name.upper())

            y_position -= line_height

            # Registration number
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))
            p.drawString(2*cm, y_position, "MATRÍCULA:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            p.drawString(5*cm, y_position, beneficiary.registration_number)

            y_position -= line_height

            # Card number
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))
            p.drawString(2*cm, y_position, "CARTÃO:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            p.drawString(5*cm, y_position, card.card_number)

            y_position -= line_height

            # Birth date
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))
            p.drawString(2*cm, y_position, "DATA NASC:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            if beneficiary.birth_date:
                p.drawString(5*cm, y_position, beneficiary.birth_date.strftime('%d/%m/%Y'))

            y_position -= line_height

            # CPF
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))
            p.drawString(2*cm, y_position, "CPF:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            # Format CPF: 000.000.000-00
            cpf_formatted = f"{beneficiary.cpf[:3]}.{beneficiary.cpf[3:6]}.{beneficiary.cpf[6:9]}-{beneficiary.cpf[9:]}"
            p.drawString(5*cm, y_position, cpf_formatted)

            y_position -= line_height * 1.5

            # Validity
            p.setFont("Helvetica-Bold", 11)
            p.setFillColor(colors.HexColor('#666666'))
            p.drawString(2*cm, y_position, "VALIDADE:")
            p.setFont("Helvetica", 11)
            p.setFillColor(colors.black)
            p.drawString(5*cm, y_position, card.expiry_date.strftime('%d/%m/%Y'))

            # Generate QR Code
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(card.qr_code_data)
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")

            # Save QR code to BytesIO
            qr_buffer = BytesIO()
            qr_img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)

            # Draw QR code
            qr_size = 4*cm
            p.drawImage(qr_buffer, width - 6*cm, height - 10*cm, qr_size, qr_size)

            # Footer
            p.setFont("Helvetica", 8)
            p.setFillColor(colors.HexColor('#999999'))
            p.drawString(2*cm, 2*cm, f"Emitido em: {card.issue_date.strftime('%d/%m/%Y')}")
            p.drawString(2*cm, 1.7*cm, "Em caso de dúvidas, entre em contato com a operadora.")

            # Important info box
            p.setStrokeColor(primary_color)
            p.setFillColor(colors.HexColor('#E8F5E9'))
            p.rect(2*cm, height - 14*cm, width - 4*cm, 2.5*cm, fill=True, stroke=True)

            p.setFillColor(primary_color)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.3*cm, height - 12.2*cm, "IMPORTANTE:")

            p.setFillColor(colors.black)
            p.setFont("Helvetica", 9)
            p.drawString(2.3*cm, height - 12.7*cm, "• Apresente esta carteirinha junto com um documento com foto")
            p.drawString(2.3*cm, height - 13.2*cm, "• Guarde o número da carteirinha em local seguro")
            p.drawString(2.3*cm, height - 13.7*cm, "• Em caso de perda, solicite uma segunda via imediatamente")

            # Finish PDF
            p.showPage()
            p.save()

            # Get PDF data
            buffer.seek(0)
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="carteirinha_{card.card_number}.pdf"'
            return response

        except DigitalCard.DoesNotExist:
            return Response(
                {'error': 'Card not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error generating PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
