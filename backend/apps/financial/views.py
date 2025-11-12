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
from datetime import datetime
from apps.common.pagination import StandardResultsSetPagination, SmallResultsSetPagination
from .models import Invoice, PaymentHistory, UsageHistory, TaxStatement
from .serializers import (
    InvoiceSerializer, PaymentHistorySerializer,
    UsageHistorySerializer, TaxStatementSerializer
)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('beneficiary').prefetch_related('payments').all()
    serializer_class = InvoiceSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'beneficiary', 'reference_month']
    ordering_fields = ['due_date', 'created_at', 'amount']

    @action(detail=False, methods=['get'])
    def my_invoices(self, request):
        '''Get invoices for current user'''
        try:
            beneficiary = request.user.beneficiary
            invoices = self.queryset.filter(beneficiary=beneficiary)

            status_filter = request.query_params.get('status')
            if status_filter:
                invoices = invoices.filter(status=status_filter)

            # Apply pagination
            page = self.paginate_queryset(invoices)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(invoices, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for invoice"""
        try:
            invoice = self.get_object()
            beneficiary = invoice.beneficiary

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            gray_color = colors.HexColor('#666666')
            light_gray = colors.HexColor('#F5F9F8')

            # Header
            p.setFillColor(primary_color)
            p.rect(0, height - 3*cm, width, 3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 24)
            p.drawString(2*cm, height - 2*cm, "ELOSAÚDE")
            p.setFont("Helvetica", 12)
            p.drawString(2*cm, height - 2.5*cm, "Fatura de Plano de Saúde")

            # Invoice status badge
            y_pos = height - 4*cm
            status_colors = {
                'OPEN': colors.HexColor('#FF9800'),
                'PAID': colors.HexColor('#4CAF50'),
                'OVERDUE': colors.HexColor('#F44336'),
                'CANCELLED': colors.HexColor('#9E9E9E')
            }
            status_bg = status_colors.get(invoice.status, gray_color)
            p.setFillColor(status_bg)
            p.roundRect(2*cm, y_pos, 3*cm, 0.7*cm, 0.2*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 10)
            status_text = dict(Invoice.STATUS_CHOICES).get(invoice.status, invoice.status)
            p.drawString(2.3*cm, y_pos + 0.2*cm, status_text)

            # Invoice details
            y_pos -= 1.5*cm
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_pos, "Informações da Fatura")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            details = [
                ("Mês de Referência:", invoice.reference_month),
                ("Vencimento:", invoice.due_date.strftime('%d/%m/%Y')),
                ("Valor:", f"R$ {invoice.amount:,.2f}"),
            ]
            if invoice.payment_date:
                details.append(("Data de Pagamento:", invoice.payment_date.strftime('%d/%m/%Y')))

            for label, value in details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(7*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Beneficiary information
            y_pos -= 1*cm
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_pos, "Dados do Beneficiário")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            ben_details = [
                ("Nome:", beneficiary.full_name),
                ("CPF:", beneficiary.cpf),
                ("Carteirinha:", f"{beneficiary.card_number if hasattr(beneficiary, 'card_number') else 'N/A'}"),
            ]

            for label, value in ben_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(7*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Payment information (barcode and digitable line)
            y_pos -= 1*cm
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_pos, "Formas de Pagamento")

            y_pos -= 1*cm
            # Digitable line box
            p.setFillColor(light_gray)
            p.rect(2*cm, y_pos - 1.2*cm, width - 4*cm, 1.5*cm, fill=True, stroke=True)
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 9)
            p.drawString(2.5*cm, y_pos - 0.4*cm, "Linha Digitável:")
            p.setFont("Courier", 8)
            p.drawString(2.5*cm, y_pos - 0.9*cm, invoice.digitable_line)

            # Barcode
            y_pos -= 2*cm
            p.setFont("Helvetica-Bold", 9)
            p.drawString(2.5*cm, y_pos, "Código de Barras:")
            p.setFont("Courier", 7)
            p.drawString(2.5*cm, y_pos - 0.5*cm, invoice.barcode)

            # Payment methods
            y_pos -= 1.5*cm
            p.setFont("Helvetica", 9)
            p.drawString(2*cm, y_pos, "• Pague no aplicativo ou site do seu banco")
            y_pos -= 0.5*cm
            p.drawString(2*cm, y_pos, "• Utilize a linha digitável ou código de barras")
            y_pos -= 0.5*cm
            p.drawString(2*cm, y_pos, "• PIX: Use o QR Code disponível no app Elosaúde")

            # Important notes
            y_pos -= 2*cm
            p.setFillColor(colors.HexColor('#FFF3E0'))
            p.rect(2*cm, y_pos - 2*cm, width - 4*cm, 2.5*cm, fill=True, stroke=True)
            p.setFillColor(colors.HexColor('#E65100'))
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "IMPORTANTE:")
            p.setFont("Helvetica", 8)
            p.setFillColor(colors.black)
            notes = [
                "• Fatura vencida está sujeita a juros e multa",
                "• Em caso de dúvidas, entre em contato: (11) 3000-0000",
                "• Email: financeiro@elosaude.com.br",
                "• Mantenha seu plano ativo para garantir cobertura"
            ]
            y_note = y_pos - 1*cm
            for note in notes:
                p.drawString(2.7*cm, y_note, note)
                y_note -= 0.5*cm

            # Footer
            p.setFont("Helvetica", 8)
            p.setFillColor(gray_color)
            p.drawString(2*cm, 1.5*cm, f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
            p.drawString(2*cm, 1*cm, "ELOSAÚDE - Planos de Saúde | CNPJ: 00.000.000/0001-00")

            # Save PDF
            p.showPage()
            p.save()

            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="fatura_{invoice.reference_month.replace("/", "-")}.pdf"'
            return response

        except Exception as e:
            return Response({'error': f'Error generating PDF: {str(e)}'},
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='receipt-pdf')
    def receipt_pdf(self, request, pk=None):
        """Generate payment receipt PDF"""
        try:
            invoice = self.get_object()
            beneficiary = invoice.beneficiary

            if invoice.status != 'PAID' or not invoice.payment_date:
                return Response({'error': 'Invoice is not paid yet'},
                              status=status.HTTP_400_BAD_REQUEST)

            # Get payment history
            payment = invoice.payment_history.first()

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            success_color = colors.HexColor('#4CAF50')
            gray_color = colors.HexColor('#666666')

            # Header
            p.setFillColor(primary_color)
            p.rect(0, height - 3*cm, width, 3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 24)
            p.drawString(2*cm, height - 2*cm, "ELOSAÚDE")
            p.setFont("Helvetica", 14)
            p.drawString(2*cm, height - 2.5*cm, "Comprovante de Pagamento")

            # Success badge
            y_pos = height - 4*cm
            p.setFillColor(success_color)
            p.roundRect(2*cm, y_pos, 4*cm, 0.8*cm, 0.3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2.5*cm, y_pos + 0.25*cm, "✓ PAGO")

            # Payment information
            y_pos -= 2*cm
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(2*cm, y_pos, f"R$ {invoice.amount:,.2f}")

            y_pos -= 1.5*cm
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2*cm, y_pos, "Informações do Pagamento")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            payment_details = [
                ("Data do Pagamento:", invoice.payment_date.strftime('%d/%m/%Y')),
                ("Mês de Referência:", invoice.reference_month),
                ("Forma de Pagamento:", payment.get_payment_method_display() if payment else "Não especificado"),
            ]

            if payment and payment.transaction_id:
                payment_details.append(("ID da Transação:", payment.transaction_id))

            for label, value in payment_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(8*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Beneficiary information
            y_pos -= 1*cm
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

            # Verification box
            y_pos -= 2*cm
            p.setFillColor(colors.HexColor('#E8F5E9'))
            p.rect(2*cm, y_pos - 2*cm, width - 4*cm, 2.5*cm, fill=True, stroke=True)
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "Autenticidade do Comprovante")
            p.setFont("Helvetica", 9)
            p.drawString(2.5*cm, y_pos - 1*cm, f"Código de Verificação: ELOSA-{invoice.id:06d}-{invoice.payment_date.strftime('%Y%m%d')}")
            p.drawString(2.5*cm, y_pos - 1.5*cm, "Este comprovante pode ser verificado em: www.elosaude.com.br/verificar")

            # Footer
            y_pos = 2*cm
            p.setFont("Helvetica", 8)
            p.setFillColor(gray_color)
            p.drawString(2*cm, y_pos, f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
            y_pos -= 0.5*cm
            p.drawString(2*cm, y_pos, "ELOSAÚDE - Planos de Saúde | CNPJ: 00.000.000/0001-00")
            y_pos -= 0.5*cm
            p.drawString(2*cm, y_pos, "www.elosaude.com.br | financeiro@elosaude.com.br | (11) 3000-0000")

            # Save PDF
            p.showPage()
            p.save()

            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="comprovante_{invoice.reference_month.replace("/", "-")}.pdf"'
            return response

        except Exception as e:
            return Response({'error': f'Error generating PDF: {str(e)}'},
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentHistoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentHistory.objects.select_related('invoice').all()
    serializer_class = PaymentHistorySerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method']
    ordering_fields = ['payment_date', 'created_at']


class UsageHistoryViewSet(viewsets.ModelViewSet):
    queryset = UsageHistory.objects.select_related('beneficiary').all()
    serializer_class = UsageHistorySerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'period']
    ordering_fields = ['period', 'total_amount']

    @action(detail=False, methods=['get'])
    def my_usage(self, request):
        '''Get usage history for current user'''
        try:
            beneficiary = request.user.beneficiary
            usage = self.queryset.filter(beneficiary=beneficiary)

            period = request.query_params.get('period')
            if period:
                usage = usage.filter(period=period)

            # Apply pagination
            page = self.paginate_queryset(usage)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(usage, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


class TaxStatementViewSet(viewsets.ModelViewSet):
    queryset = TaxStatement.objects.select_related('beneficiary').all()
    serializer_class = TaxStatementSerializer
    pagination_class = SmallResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['beneficiary', 'year']
    ordering_fields = ['year', 'created_at']

    @action(detail=False, methods=['get'])
    def my_statements(self, request):
        '''Get tax statements for current user'''
        try:
            beneficiary = request.user.beneficiary
            statements = self.queryset.filter(beneficiary=beneficiary)

            # Apply pagination
            page = self.paginate_queryset(statements)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(statements, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate PDF for tax statement"""
        try:
            statement = self.get_object()
            beneficiary = statement.beneficiary

            # Create PDF in memory
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Colors
            primary_color = colors.HexColor('#20a490')
            gray_color = colors.HexColor('#666666')
            light_gray = colors.HexColor('#F5F9F8')

            # Header
            p.setFillColor(primary_color)
            p.rect(0, height - 3*cm, width, 3*cm, fill=True, stroke=False)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 24)
            p.drawString(2*cm, height - 2*cm, "ELOSAÚDE")
            p.setFont("Helvetica", 14)
            p.drawString(2*cm, height - 2.5*cm, f"Informe de Rendimentos - Ano {statement.year}")

            # Year badge
            y_pos = height - 4.5*cm
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 16)
            p.drawString(2*cm, y_pos, f"Ano-base: {statement.year}")

            # Summary box
            y_pos -= 1.5*cm
            p.setFillColor(light_gray)
            p.rect(2*cm, y_pos - 2.5*cm, width - 4*cm, 3*cm, fill=True, stroke=True)

            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 12)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "RESUMO ANUAL")

            y_pos -= 1.2*cm
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.5*cm, y_pos, "Total Pago:")
            p.setFont("Helvetica", 10)
            p.drawString(10*cm, y_pos, f"R$ {statement.total_paid:,.2f}")

            y_pos -= 0.7*cm
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.5*cm, y_pos, "Valor Dedutível (IR):")
            p.setFont("Helvetica", 10)
            p.drawString(10*cm, y_pos, f"R$ {statement.deductible_amount:,.2f}")

            # Beneficiary information
            y_pos -= 2*cm
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_pos, "Dados do Beneficiário")

            y_pos -= 0.8*cm
            p.setFont("Helvetica", 10)
            ben_details = [
                ("Nome:", beneficiary.full_name),
                ("CPF:", beneficiary.cpf),
                ("Data de Nascimento:", beneficiary.birth_date.strftime('%d/%m/%Y') if beneficiary.birth_date else 'N/A'),
            ]

            for label, value in ben_details:
                p.setFont("Helvetica-Bold", 10)
                p.drawString(2*cm, y_pos, label)
                p.setFont("Helvetica", 10)
                p.drawString(7*cm, y_pos, str(value))
                y_pos -= 0.6*cm

            # Monthly breakdown table
            y_pos -= 1.5*cm
            p.setFont("Helvetica-Bold", 14)
            p.drawString(2*cm, y_pos, "Discriminação Mensal")

            y_pos -= 0.8*cm

            # Create table data
            months_pt = {
                '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
                '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
                '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
            }

            table_data = [['Mês', 'Valor Pago']]
            for month, amount in sorted(statement.monthly_breakdown.items()):
                month_name = months_pt.get(month, month)
                table_data.append([month_name, f"R$ {float(amount):,.2f}"])

            # Draw table
            col_widths = [8*cm, 6*cm]
            row_height = 0.6*cm
            table_width = sum(col_widths)

            # Table header
            p.setFillColor(primary_color)
            p.rect(2*cm, y_pos - row_height, table_width, row_height, fill=True, stroke=True)
            p.setFillColor(colors.white)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(2.3*cm, y_pos - row_height + 0.15*cm, table_data[0][0])
            p.drawString(10.3*cm, y_pos - row_height + 0.15*cm, table_data[0][1])

            # Table rows
            y_pos -= row_height
            p.setFillColor(colors.black)
            p.setFont("Helvetica", 9)

            for i, row in enumerate(table_data[1:], 1):
                # Alternate row colors
                if i % 2 == 0:
                    p.setFillColor(light_gray)
                    p.rect(2*cm, y_pos - row_height, table_width, row_height, fill=True, stroke=True)
                else:
                    p.rect(2*cm, y_pos - row_height, table_width, row_height, fill=False, stroke=True)

                p.setFillColor(colors.black)
                p.drawString(2.3*cm, y_pos - row_height + 0.15*cm, row[0])
                p.drawString(10.3*cm, y_pos - row_height + 0.15*cm, row[1])
                y_pos -= row_height

                # Check if we need a new page
                if y_pos < 5*cm:
                    p.showPage()
                    y_pos = height - 2*cm

            # Important information
            y_pos -= 1.5*cm
            if y_pos < 7*cm:
                p.showPage()
                y_pos = height - 2*cm

            p.setFillColor(colors.HexColor('#FFF3E0'))
            p.rect(2*cm, y_pos - 4*cm, width - 4*cm, 4.5*cm, fill=True, stroke=True)
            p.setFillColor(colors.HexColor('#E65100'))
            p.setFont("Helvetica-Bold", 11)
            p.drawString(2.5*cm, y_pos - 0.5*cm, "INFORMAÇÕES IMPORTANTES:")

            p.setFont("Helvetica", 8)
            p.setFillColor(colors.black)
            info_text = [
                "• Este documento serve como comprovante para declaração de Imposto de Renda.",
                f"• Valores referentes a pagamentos efetuados no ano-base {statement.year}.",
                "• O valor dedutível considera as despesas elegíveis conforme legislação do IR.",
                "• Mantenha este informe junto aos seus documentos fiscais.",
                "• Em caso de dúvidas, consulte seu contador ou a Receita Federal.",
                "• Código de verificação disponível em: www.elosaude.com.br/verificar",
                f"• Código: IR-{statement.year}-{beneficiary.id:06d}"
            ]

            y_info = y_pos - 1*cm
            for line in info_text:
                p.drawString(2.7*cm, y_info, line)
                y_info -= 0.5*cm

            # Footer
            p.setFont("Helvetica", 8)
            p.setFillColor(gray_color)
            p.drawString(2*cm, 2*cm, f"Emitido em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
            p.drawString(2*cm, 1.5*cm, "ELOSAÚDE - Planos de Saúde | CNPJ: 00.000.000/0001-00")
            p.drawString(2*cm, 1*cm, "www.elosaude.com.br | financeiro@elosaude.com.br | (11) 3000-0000")

            # Save PDF
            p.showPage()
            p.save()

            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()

            # Return PDF
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="informe_rendimentos_{statement.year}.pdf"'
            return response

        except Exception as e:
            return Response({'error': f'Error generating PDF: {str(e)}'},
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
