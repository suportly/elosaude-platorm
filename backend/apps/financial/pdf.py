"""
PDF Generator for Invoices and Tax Statements
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from apps.utils.pdf_generator import PDFGenerator, format_currency, format_date
from decimal import Decimal


class InvoicePDFGenerator(PDFGenerator):
    """Generate PDF for Invoices"""

    def __init__(self, invoice):
        super().__init__(title=f"Fatura - {invoice.reference_month}")
        self.invoice = invoice

    def generate(self):
        """Generate the PDF and return bytes"""
        doc = self.create_document()

        # Build content
        story = []

        # Title
        story.append(Paragraph("FATURA MENSAL", self.styles['Title']))
        story.append(Spacer(1, 0.5*cm))

        # Invoice Information
        story.append(Paragraph("Dados da Fatura", self.styles['Subtitle']))
        invoice_data = [
            ['Referência:', self.invoice.reference_month],
            ['Vencimento:', format_date(self.invoice.due_date)],
            ['Status:', self.invoice.get_status_display()],
        ]

        if self.invoice.payment_date:
            invoice_data.append(['Data de Pagamento:', format_date(self.invoice.payment_date)])

        invoice_table = Table(invoice_data, colWidths=[5*cm, 12*cm])
        invoice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(invoice_table)
        story.append(Spacer(1, 0.8*cm))

        # Beneficiary Information
        story.append(Paragraph("Beneficiário", self.styles['Subtitle']))
        beneficiary_data = [
            ['Nome:', self.invoice.beneficiary.full_name],
            ['CPF:', self.invoice.beneficiary.cpf],
            ['Matrícula:', self.invoice.beneficiary.registration_number],
            ['Plano:', self.invoice.beneficiary.health_plan.name if self.invoice.beneficiary.health_plan else 'N/A'],
        ]

        beneficiary_table = Table(beneficiary_data, colWidths=[5*cm, 12*cm])
        beneficiary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(beneficiary_table)
        story.append(Spacer(1, 0.8*cm))

        # Amount Details
        story.append(Paragraph("Valores", self.styles['Subtitle']))

        # Calculate totals
        monthly_fee = self.invoice.beneficiary.health_plan.monthly_fee if self.invoice.beneficiary.health_plan else Decimal('0')
        discount = self.invoice.discount or Decimal('0')
        late_fee = self.invoice.late_fee or Decimal('0')

        amount_data = [
            ['Mensalidade do Plano:', format_currency(monthly_fee)],
            ['Desconto:', format_currency(discount)],
            ['Multa/Juros:', format_currency(late_fee)],
            ['', ''],
            ['TOTAL A PAGAR:', format_currency(self.invoice.amount)],
        ]

        amount_table = Table(amount_data, colWidths=[12*cm, 5*cm])
        amount_table.setStyle(TableStyle([
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, 2), 'Helvetica'),
            ('FONTNAME', (0, 4), (0, 4), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTSIZE', (0, 4), (-1, 4), 12),
            ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#007AFF')),
            ('TEXTCOLOR', (0, 4), (-1, 4), colors.whitesmoke),
            ('GRID', (0, 0), (-1, 2), 0.5, colors.grey),
            ('GRID', (0, 4), (-1, 4), 1, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(amount_table)
        story.append(Spacer(1, 0.8*cm))

        # Payment Information
        if self.invoice.barcode or self.invoice.digitable_line:
            story.append(Paragraph("Dados para Pagamento", self.styles['Subtitle']))

            if self.invoice.digitable_line:
                story.append(Paragraph(f"<b>Linha Digitável:</b>", self.styles['Normal']))
                story.append(Paragraph(f"<font face='Courier'>{self.invoice.digitable_line}</font>", self.styles['Normal']))
                story.append(Spacer(1, 0.3*cm))

            if self.invoice.barcode:
                story.append(Paragraph(f"<b>Código de Barras:</b>", self.styles['Normal']))
                story.append(Paragraph(f"<font face='Courier'>{self.invoice.barcode}</font>", self.styles['Normal']))

        # Build PDF
        doc.build(story, onFirstPage=self.create_header, onLaterPages=self.create_header)

        return self.get_value()


class TaxStatementPDFGenerator(PDFGenerator):
    """Generate PDF for Tax Statements"""

    def __init__(self, statement):
        super().__init__(title=f"Declaração IR - {statement.year}")
        self.statement = statement

    def generate(self):
        """Generate the PDF and return bytes"""
        doc = self.create_document()

        # Build content
        story = []

        # Title
        story.append(Paragraph(f"DECLARAÇÃO DE IMPOSTO DE RENDA - {self.statement.year}", self.styles['Title']))
        story.append(Spacer(1, 0.5*cm))

        # Beneficiary Information
        story.append(Paragraph("Dados do Beneficiário", self.styles['Subtitle']))
        beneficiary_data = [
            ['Nome:', self.statement.beneficiary.full_name],
            ['CPF:', self.statement.beneficiary.cpf],
            ['Ano de Referência:', str(self.statement.year)],
        ]

        beneficiary_table = Table(beneficiary_data, colWidths=[5*cm, 12*cm])
        beneficiary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(beneficiary_table)
        story.append(Spacer(1, 0.8*cm))

        # Summary
        story.append(Paragraph("Resumo Anual", self.styles['Subtitle']))
        summary_data = [
            ['Total Pago no Ano:', format_currency(self.statement.total_paid)],
            ['Valor Dedutível (IR):', format_currency(self.statement.deductible_amount)],
        ]

        summary_table = Table(summary_data, colWidths=[10*cm, 7*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.8*cm))

        # Monthly Breakdown
        story.append(Paragraph("Detalhamento Mensal", self.styles['Subtitle']))

        monthly_data = [['Mês', 'Valor Pago']]
        months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

        monthly_breakdown = self.statement.monthly_breakdown or {}
        total = Decimal('0')

        for i, month in enumerate(months, 1):
            amount = Decimal(str(monthly_breakdown.get(str(i), 0)))
            monthly_data.append([month, format_currency(amount)])
            total += amount

        monthly_data.append(['TOTAL', format_currency(total)])

        monthly_table = Table(monthly_data, colWidths=[12*cm, 5*cm])
        monthly_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#007AFF')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#F0F0F0')),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(monthly_table)

        # Build PDF
        doc.build(story, onFirstPage=self.create_header, onLaterPages=self.create_header)

        return self.get_value()


def generate_invoice_pdf(invoice):
    """Helper function to generate invoice PDF"""
    generator = InvoicePDFGenerator(invoice)
    return generator.generate()


def generate_tax_statement_pdf(statement):
    """Helper function to generate tax statement PDF"""
    generator = TaxStatementPDFGenerator(statement)
    return generator.generate()
