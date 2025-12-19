from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime
from apps.common.pagination import StandardResultsSetPagination, SmallResultsSetPagination
from .models import ReimbursementRequest, ReimbursementDocument
from .serializers import (
    ReimbursementRequestSerializer, ReimbursementRequestCreateSerializer,
    ReimbursementDocumentSerializer
)


class ReimbursementRequestViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementRequest.objects.select_related('beneficiary').prefetch_related('documents').all()
    serializer_class = ReimbursementRequestSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['expense_type', 'status', 'beneficiary']
    search_fields = ['protocol_number', 'provider_name', 'beneficiary__full_name']
    ordering_fields = ['service_date', 'created_at', 'requested_amount']

    def get_serializer_class(self):
        if self.action == 'create':
            return ReimbursementRequestCreateSerializer
        return ReimbursementRequestSerializer

    @action(detail=False, methods=['get'])
    def my_reimbursements(self, request):
        '''Get reimbursements for current user'''
        try:
            beneficiary = request.user.beneficiary
            reimbursements = self.queryset.filter(beneficiary=beneficiary)

            status_filter = request.query_params.get('status')
            if status_filter:
                reimbursements = reimbursements.filter(status=status_filter)

            # Apply pagination
            page = self.paginate_queryset(reimbursements)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(reimbursements, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        '''Get reimbursement summary for current user'''
        try:
            beneficiary = request.user.beneficiary
            reimbursements = self.queryset.filter(beneficiary=beneficiary)

            total_requested = sum(r.requested_amount for r in reimbursements)
            total_approved = sum(r.approved_amount or 0 for r in reimbursements.filter(status__in=['APPROVED', 'PARTIALLY_APPROVED', 'PAID']))

            return Response({
                'total_requested': float(total_requested),
                'total_approved': float(total_approved),
                'pending_count': reimbursements.filter(status='IN_ANALYSIS').count(),
                'approved_count': reimbursements.filter(status__in=['APPROVED', 'PAID']).count(),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'], url_path='receipt-pdf')
    def receipt_pdf(self, request, pk=None):
        """Generate reimbursement receipt PDF"""
        try:
            reimbursement = self.get_object()
            beneficiary = reimbursement.beneficiary

            # Check if reimbursement was paid
            if reimbursement.status != 'PAID' or not reimbursement.payment_date:
                return Response({'error': 'Reimbursement has not been paid yet'},
                              status=status.HTTP_400_BAD_REQUEST)

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            success_color = colors.HexColor('#4CAF50')
            gray_color = colors.HexColor('#666666')
            light_gray = colors.HexColor('#F5F9F8')

            # Header
            p.setFillColor(primary_color)
            p.rect(0, height - 3*cm, width, 3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 24)
            p.drawString(2*cm, height - 2*cm, "ELOSAÚDE")
            p.setFont("Helvetica", 14)
            p.drawString(2*cm, height - 2.5*cm, "Comprovante de Reembolso")

            # Success badge
            y_pos = height - 4*cm
            p.setFillColor(success_color)
            p.roundRect(2*cm, y_pos, 4*cm, 0.8*cm, 0.3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2.5*cm, y_pos + 0.25*cm, "✓ PAGO")

            # Amount paid
            y_pos -= 2*cm
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 18)
            p.drawString(2*cm, y_pos, f"Valor Reembolsado: R$ {reimbursement.approved_amount:,.2f}")

            # Protocol information
            y_pos -= 1.5*cm
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_pos, "Informações do Reembolso")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            reimbursement_details = [
                ("Protocolo:", reimbursement.protocol_number),
                ("Data do Pagamento:", reimbursement.payment_date.strftime('%d/%m/%Y')),
                ("Data do Serviço:", reimbursement.service_date.strftime('%d/%m/%Y')),
                ("Tipo de Despesa:", dict(ReimbursementRequest.EXPENSE_TYPES).get(reimbursement.expense_type, reimbursement.expense_type)),
            ]

            for label, value in reimbursement_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(8*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Financial summary box
            y_pos -= 1*cm
            p.setFillColor(light_gray)
            p.rect(2*cm, y_pos - 2*cm, width - 4*cm, 2.5*cm, fill=True, stroke=True)

            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 11)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "Resumo Financeiro")

            y_pos -= 1.1*cm
            p.setFont("Helvetica", 9)
            p.drawString(2.5*cm, y_pos, "Valor Solicitado:")
            p.drawString(12*cm, y_pos, f"R$ {reimbursement.requested_amount:,.2f}")

            y_pos -= 0.6*cm
            p.setFont("Helvetica-Bold", 9)
            p.drawString(2.5*cm, y_pos, "Valor Aprovado:")
            p.drawString(12*cm, y_pos, f"R$ {reimbursement.approved_amount:,.2f}")

            # Beneficiary information
            y_pos -= 2*cm
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_pos, "Dados do Beneficiário")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            ben_details = [
                ("Nome:", beneficiary.full_name),
                ("CPF:", beneficiary.cpf),
            ]

            for label, value in ben_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(8*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Provider information
            y_pos -= 0.5*cm
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_pos, "Dados do Prestador")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            provider_details = [
                ("Nome:", reimbursement.provider_name),
                ("CNPJ/CPF:", reimbursement.provider_cnpj_cpf),
            ]

            for label, value in provider_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(8*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Service description
            y_pos -= 0.5*cm
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_pos, "Descrição do Serviço")

            y_pos -= 0.7*cm
            p.setFont("Helvetica", 9)
            # Word wrap for long descriptions
            desc_lines = []
            words = reimbursement.service_description.split()
            current_line = []
            for word in words:
                test_line = ' '.join(current_line + [word])
                if p.stringWidth(test_line, "Helvetica", 9) < (width - 5*cm):
                    current_line.append(word)
                else:
                    if current_line:
                        desc_lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line:
                desc_lines.append(' '.join(current_line))

            for line in desc_lines[:5]:  # Max 5 lines
                p.drawString(2*cm, y_pos, line)
                y_pos -= 0.5*cm

            # Bank details
            if reimbursement.bank_details:
                y_pos -= 1*cm
                p.setFont("Helvetica-Bold", 12)
                p.drawString(2*cm, y_pos, "Dados Bancários do Crédito")

                y_pos -= 0.8*cm
                p.setFont("Helvetica", 9)
                bank_info = [
                    ("Banco:", reimbursement.bank_details.get('bank', 'N/A')),
                    ("Agência:", reimbursement.bank_details.get('agency', 'N/A')),
                    ("Conta:", reimbursement.bank_details.get('account', 'N/A')),
                    ("Tipo:", dict({'checking': 'Corrente', 'savings': 'Poupança'}).get(
                        reimbursement.bank_details.get('account_type', ''), 'N/A')),
                ]

                for label, value in bank_info:
                    p.setFont("Helvetica-Bold", 9)
                    p.drawString(2*cm, y_pos, label)
                    p.setFont("Helvetica", 9)
                    p.drawString(6*cm, y_pos, str(value))
                    y_pos -= 0.5*cm

            # Verification box
            y_pos -= 1.5*cm
            if y_pos < 7*cm:
                p.showPage()
                y_pos = height - 2*cm

            p.setFillColor(colors.HexColor('#E8F5E9'))
            p.rect(2*cm, y_pos - 2*cm, width - 4*cm, 2.5*cm, fill=True, stroke=True)
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "Autenticidade do Comprovante")
            p.setFont("Helvetica", 9)
            p.drawString(2.5*cm, y_pos - 1*cm, f"Código de Verificação: REIMB-{reimbursement.id:06d}-{reimbursement.payment_date.strftime('%Y%m%d')}")
            p.drawString(2.5*cm, y_pos - 1.5*cm, "Este comprovante pode ser verificado em: www.elosaude.com.br/verificar")

            # Footer
            p.setFont("Helvetica", 8)
            p.setFillColor(gray_color)
            p.drawString(2*cm, 2*cm, f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
            p.drawString(2*cm, 1.5*cm, "ELOSAÚDE - Planos de Saúde | CNPJ: 00.000.000/0001-00")
            p.drawString(2*cm, 1*cm, "www.elosaude.com.br | reembolso@elosaude.com.br | (11) 3000-0000")

            # Save PDF
            p.showPage()
            p.save()

            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="comprovante_reembolso_{reimbursement.protocol_number}.pdf"'
            return response

        except Exception as e:
            return Response({'error': f'Error generating PDF: {str(e)}'},
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(detail=True, methods=['post'], url_path='add-documents')
    def add_documents(self, request, pk=None):
        """
        Add additional documents to an existing reimbursement request.
        Only available for reimbursements with status IN_ANALYSIS.

        Request body:
            documents: list of document IDs to associate with this reimbursement

        Returns:
            message: success message
            documents: list of added documents
        """
        try:
            reimbursement = self.get_object()

            # Validate status - only IN_ANALYSIS can receive additional documents
            if reimbursement.status != 'IN_ANALYSIS':
                return Response(
                    {'error': 'Documentos só podem ser adicionados a reembolsos em análise'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get document IDs from request
            document_ids = request.data.get('documents', [])
            if not document_ids:
                return Response(
                    {'error': 'Nenhum documento informado'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate document IDs exist
            documents = ReimbursementDocument.objects.filter(id__in=document_ids)
            if documents.count() != len(document_ids):
                return Response(
                    {'error': 'Um ou mais documentos não foram encontrados'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Associate documents with this reimbursement
            documents.update(reimbursement=reimbursement)

            # Return success response
            serializer = ReimbursementDocumentSerializer(documents, many=True, context={'request': request})
            return Response({
                'message': f'{documents.count()} documento(s) adicionado(s) com sucesso',
                'documents': serializer.data
            })

        except Exception as e:
            return Response(
                {'error': f'Erro ao adicionar documentos: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReimbursementDocumentViewSet(viewsets.ModelViewSet):
    queryset = ReimbursementDocument.objects.all()
    serializer_class = ReimbursementDocumentSerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['reimbursement', 'document_type']
