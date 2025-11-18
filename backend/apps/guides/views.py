from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
from io import BytesIO
from apps.common.pagination import StandardResultsSetPagination, SmallResultsSetPagination
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment
from .serializers import (
    ProcedureSerializer, TISSGuideSerializer, TISSGuideCreateSerializer,
    GuideAttachmentSerializer
)


class ProcedureViewSet(viewsets.ModelViewSet):
    queryset = Procedure.objects.all()
    serializer_class = ProcedureSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'requires_authorization', 'is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['name', 'base_price']


class TISSGuideViewSet(viewsets.ModelViewSet):
    queryset = TISSGuide.objects.select_related('beneficiary', 'provider').prefetch_related('guide_procedures__procedure', 'attachments').all()
    serializer_class = TISSGuideSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['guide_type', 'status', 'beneficiary']
    search_fields = ['guide_number', 'protocol_number', 'beneficiary__full_name']
    ordering_fields = ['request_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return TISSGuideCreateSerializer
        return TISSGuideSerializer

    @action(detail=False, methods=['get'])
    def my_guides(self, request):
        '''Get guides for current user'''
        try:
            beneficiary = request.user.beneficiary
        except AttributeError:
            # User doesn't have a beneficiary profile, return empty list
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': []
            })

        guides = self.queryset.filter(beneficiary=beneficiary)

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter and status_filter != 'Todas':
            guides = guides.filter(status=status_filter)

        # Apply pagination
        page = self.paginate_queryset(guides)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(guides, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def authorize(self, request, pk=None):
        '''Authorize a guide'''
        from apps.guides.tasks import generate_guide_pdf_task
        from apps.notifications.tasks import send_notification
        from django.utils import timezone
        from datetime import timedelta

        guide = self.get_object()

        if guide.status != 'PENDING':
            return Response(
                {'error': 'Only pending guides can be authorized'},
                status=status.HTTP_400_BAD_REQUEST
            )

        guide.status = 'AUTHORIZED'
        guide.authorization_date = timezone.now()
        guide.expiry_date = timezone.now().date() + timedelta(days=30)
        guide.save()

        # Trigger PDF generation task (async)
        generate_guide_pdf_task.delay(guide.id)

        # Send notification
        send_notification.delay(
            beneficiary_id=guide.beneficiary.id,
            title="Guia Autorizada",
            message=f"Sua guia {guide.guide_number} foi autorizada!",
            notification_type='GUIDE_AUTHORIZATION',
            priority='HIGH',
            data={'guide_id': guide.id, 'guide_number': guide.guide_number}
        )

        serializer = self.get_serializer(guide)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for TISS guide"""
        try:
            guide = self.get_object()
            beneficiary = guide.beneficiary
            provider = guide.provider

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            text_color = colors.HexColor('#333333')
            gray_color = colors.HexColor('#666666')

            # Header
            p.setFillColor(primary_color)
            p.rect(0, height - 2.5*cm, width, 2.5*cm, fill=True, stroke=False)

            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 20)
            p.drawString(2*cm, height - 1.7*cm, "GUIA DE AUTORIZAÇÃO - TISS")

            # Guide type and status
            p.setFont("Helvetica", 11)
            guide_type_label = dict(TISSGuide.GUIDE_TYPE_CHOICES).get(guide.guide_type, guide.guide_type)
            status_label = dict(TISSGuide.STATUS_CHOICES).get(guide.status, guide.status)

            p.drawString(2*cm, height - 2.2*cm, f"Tipo: {guide_type_label}")

            # Status badge
            status_x = width - 5*cm
            if guide.status == 'AUTHORIZED':
                status_bg = colors.HexColor('#4CAF50')
            elif guide.status == 'DENIED':
                status_bg = colors.HexColor('#F44336')
            elif guide.status == 'PENDING':
                status_bg = colors.HexColor('#FF9800')
            else:
                status_bg = colors.HexColor('#999999')

            p.setFillColor(status_bg)
            p.roundRect(status_x, height - 2.3*cm, 3*cm, 0.8*cm, 0.2*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 10)
            p.drawCentredString(status_x + 1.5*cm, height - 2*cm, status_label.upper())

            # Guide information section
            y_position = height - 4*cm
            p.setFillColor(text_color)
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_position, "INFORMAÇÕES DA GUIA")

            # Draw separator line
            y_position -= 0.3*cm
            p.setStrokeColor(primary_color)
            p.setLineWidth(2)
            p.line(2*cm, y_position, width - 2*cm, y_position)

            y_position -= 0.8*cm
            line_height = 0.6*cm

            # Guide details
            guide_data = [
                ("Número da Guia:", guide.guide_number),
                ("Protocolo:", guide.protocol_number),
                ("Data de Solicitação:", guide.request_date.strftime('%d/%m/%Y')),
            ]

            if guide.authorization_date:
                guide_data.append(("Data de Autorização:", guide.authorization_date.strftime('%d/%m/%Y')))

            if guide.expiry_date:
                guide_data.append(("Validade:", guide.expiry_date.strftime('%d/%m/%Y')))

            for label, value in guide_data:
                p.setFont("Helvetica-Bold", 10)
                p.setFillColor(gray_color)
                p.drawString(2*cm, y_position, label)
                p.setFont("Helvetica", 10)
                p.setFillColor(text_color)
                p.drawString(6*cm, y_position, str(value))
                y_position -= line_height

            # Beneficiary section
            y_position -= 0.5*cm
            p.setFont("Helvetica-Bold", 14)
            p.setFillColor(text_color)
            p.drawString(2*cm, y_position, "BENEFICIÁRIO")

            y_position -= 0.3*cm
            p.setStrokeColor(primary_color)
            p.line(2*cm, y_position, width - 2*cm, y_position)

            y_position -= 0.8*cm

            beneficiary_data = [
                ("Nome:", beneficiary.full_name),
                ("CPF:", f"{beneficiary.cpf[:3]}.{beneficiary.cpf[3:6]}.{beneficiary.cpf[6:9]}-{beneficiary.cpf[9:]}"),
                ("Cartão:", beneficiary.registration_number),
            ]

            for label, value in beneficiary_data:
                p.setFont("Helvetica-Bold", 10)
                p.setFillColor(gray_color)
                p.drawString(2*cm, y_position, label)
                p.setFont("Helvetica", 10)
                p.setFillColor(text_color)
                p.drawString(6*cm, y_position, str(value))
                y_position -= line_height

            # Provider section
            if provider:
                y_position -= 0.5*cm
                p.setFont("Helvetica-Bold", 14)
                p.setFillColor(text_color)
                p.drawString(2*cm, y_position, "PRESTADOR")

                y_position -= 0.3*cm
                p.setStrokeColor(primary_color)
                p.line(2*cm, y_position, width - 2*cm, y_position)

                y_position -= 0.8*cm

                provider_data = [
                    ("Nome:", provider.name),
                    ("CNPJ/CPF:", provider.cnpj_cpf),
                ]

                if provider.phone:
                    provider_data.append(("Telefone:", provider.phone))

                for label, value in provider_data:
                    p.setFont("Helvetica-Bold", 10)
                    p.setFillColor(gray_color)
                    p.drawString(2*cm, y_position, label)
                    p.setFont("Helvetica", 10)
                    p.setFillColor(text_color)
                    p.drawString(6*cm, y_position, str(value))
                    y_position -= line_height

            # Procedures section
            procedures = guide.guideprocedure_set.all()
            if procedures.exists():
                y_position -= 0.5*cm
                p.setFont("Helvetica-Bold", 14)
                p.setFillColor(text_color)
                p.drawString(2*cm, y_position, "PROCEDIMENTOS SOLICITADOS")

                y_position -= 0.3*cm
                p.setStrokeColor(primary_color)
                p.line(2*cm, y_position, width - 2*cm, y_position)

                y_position -= 0.6*cm

                # Table header
                p.setFont("Helvetica-Bold", 9)
                p.setFillColor(primary_color)
                p.drawString(2*cm, y_position, "Código")
                p.drawString(4.5*cm, y_position, "Procedimento")
                p.drawString(13*cm, y_position, "Qtd")
                p.drawString(15*cm, y_position, "Autorizado")

                y_position -= 0.5*cm

                # Table rows
                p.setFont("Helvetica", 9)
                p.setFillColor(text_color)

                for proc in procedures[:10]:  # Limit to 10 procedures per page
                    p.drawString(2*cm, y_position, proc.procedure.code)

                    # Truncate long procedure names
                    proc_name = proc.procedure.name
                    if len(proc_name) > 45:
                        proc_name = proc_name[:42] + "..."
                    p.drawString(4.5*cm, y_position, proc_name)

                    p.drawString(13*cm, y_position, str(proc.quantity))
                    p.drawString(15*cm, y_position, str(proc.authorized_quantity) if proc.authorized_quantity else "-")

                    y_position -= 0.5*cm

                    if y_position < 5*cm:  # New page if needed
                        p.showPage()
                        y_position = height - 3*cm

            # Clinical information
            if guide.diagnosis or guide.observations:
                y_position -= 0.5*cm

                if y_position < 8*cm:
                    p.showPage()
                    y_position = height - 3*cm

                p.setFont("Helvetica-Bold", 14)
                p.setFillColor(text_color)
                p.drawString(2*cm, y_position, "INFORMAÇÕES CLÍNICAS")

                y_position -= 0.3*cm
                p.setStrokeColor(primary_color)
                p.line(2*cm, y_position, width - 2*cm, y_position)

                y_position -= 0.6*cm

                if guide.diagnosis:
                    p.setFont("Helvetica-Bold", 10)
                    p.setFillColor(gray_color)
                    p.drawString(2*cm, y_position, "Diagnóstico:")
                    y_position -= 0.5*cm

                    p.setFont("Helvetica", 9)
                    p.setFillColor(text_color)
                    # Word wrap for long text
                    words = guide.diagnosis.split()
                    line = ""
                    for word in words:
                        test_line = line + word + " "
                        if p.stringWidth(test_line, "Helvetica", 9) > (width - 4*cm):
                            p.drawString(2.5*cm, y_position, line)
                            y_position -= 0.4*cm
                            line = word + " "
                        else:
                            line = test_line
                    if line:
                        p.drawString(2.5*cm, y_position, line)
                        y_position -= 0.6*cm

                if guide.observations:
                    p.setFont("Helvetica-Bold", 10)
                    p.setFillColor(gray_color)
                    p.drawString(2*cm, y_position, "Observações:")
                    y_position -= 0.5*cm

                    p.setFont("Helvetica", 9)
                    p.setFillColor(text_color)
                    # Word wrap for long text
                    words = guide.observations.split()
                    line = ""
                    for word in words:
                        test_line = line + word + " "
                        if p.stringWidth(test_line, "Helvetica", 9) > (width - 4*cm):
                            p.drawString(2.5*cm, y_position, line)
                            y_position -= 0.4*cm
                            line = word + " "
                        else:
                            line = test_line
                    if line:
                        p.drawString(2.5*cm, y_position, line)

            # Footer
            p.setFont("Helvetica", 8)
            p.setFillColor(gray_color)
            p.drawString(2*cm, 2*cm, f"Guia gerada em: {guide.created_at.strftime('%d/%m/%Y %H:%M')}")
            p.drawString(2*cm, 1.6*cm, "Documento válido somente com assinatura digital ou carimbo do prestador")

            # Finish PDF
            p.showPage()
            p.save()

            # Get PDF data
            buffer.seek(0)
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="guia_{guide.guide_number}.pdf"'
            return response

        except TISSGuide.DoesNotExist:
            return Response(
                {'error': 'Guide not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error generating PDF: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GuideAttachmentViewSet(viewsets.ModelViewSet):
    queryset = GuideAttachment.objects.all()
    serializer_class = GuideAttachmentSerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['guide', 'attachment_type']
