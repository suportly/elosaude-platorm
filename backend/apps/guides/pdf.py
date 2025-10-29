"""
PDF Generator for TISS Guides
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from apps.utils.pdf_generator import PDFGenerator, format_currency, format_date, format_datetime
from io import BytesIO
from datetime import datetime


class GuidePDFGenerator(PDFGenerator):
    """Generate PDF for TISS Guides"""

    def __init__(self, guide):
        super().__init__(title=f"Guia TISS - {guide.guide_number}")
        self.guide = guide

    def generate(self):
        """Generate the PDF and return bytes"""
        doc = self.create_document()

        # Build content
        story = []

        # Title
        story.append(Paragraph(f"GUIA TISS - {self.guide.get_guide_type_display().upper()}", self.styles['Title']))
        story.append(Spacer(1, 0.5*cm))

        # Guide Information
        story.append(Paragraph("Informações da Guia", self.styles['Subtitle']))
        guide_data = [
            ['Número da Guia:', self.guide.guide_number],
            ['Protocolo:', self.guide.protocol_number or 'Não gerado'],
            ['Status:', self.guide.get_status_display()],
            ['Data da Solicitação:', format_date(self.guide.request_date)],
        ]

        if self.guide.authorization_date:
            guide_data.append(['Data de Autorização:', format_datetime(self.guide.authorization_date)])

        if self.guide.expiry_date:
            guide_data.append(['Validade:', format_date(self.guide.expiry_date)])

        guide_table = Table(guide_data, colWidths=[5*cm, 12*cm])
        guide_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(guide_table)
        story.append(Spacer(1, 0.8*cm))

        # Beneficiary Information
        story.append(Paragraph("Dados do Beneficiário", self.styles['Subtitle']))
        beneficiary_data = [
            ['Nome:', self.guide.beneficiary.full_name],
            ['CPF:', self.guide.beneficiary.cpf],
            ['Matrícula:', self.guide.beneficiary.registration_number],
            ['Plano:', self.guide.beneficiary.health_plan.name if self.guide.beneficiary.health_plan else 'N/A'],
        ]

        beneficiary_table = Table(beneficiary_data, colWidths=[5*cm, 12*cm])
        beneficiary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(beneficiary_table)
        story.append(Spacer(1, 0.8*cm))

        # Provider Information
        story.append(Paragraph("Prestador", self.styles['Subtitle']))
        provider_data = [
            ['Nome:', self.guide.provider.name],
            ['Nome Fantasia:', self.guide.provider.trade_name],
            ['Tipo:', self.guide.provider.get_provider_type_display()],
        ]

        provider_table = Table(provider_data, colWidths=[5*cm, 12*cm])
        provider_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F0F0F0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(provider_table)
        story.append(Spacer(1, 0.8*cm))

        # Clinical Information
        if self.guide.diagnosis or self.guide.observations:
            story.append(Paragraph("Informações Clínicas", self.styles['Subtitle']))

            if self.guide.diagnosis:
                story.append(Paragraph(f"<b>Diagnóstico:</b> {self.guide.diagnosis}", self.styles['Normal']))
                story.append(Spacer(1, 0.3*cm))

            if self.guide.observations:
                story.append(Paragraph(f"<b>Observações:</b> {self.guide.observations}", self.styles['Normal']))
                story.append(Spacer(1, 0.5*cm))

        # Procedures
        procedures = self.guide.guideprocedure_set.select_related('procedure').all()
        if procedures:
            story.append(Spacer(1, 0.3*cm))
            story.append(Paragraph("Procedimentos Solicitados", self.styles['Subtitle']))

            procedure_data = [['Código', 'Procedimento', 'Qtd.', 'Autorizado']]
            for gp in procedures:
                procedure_data.append([
                    gp.procedure.code,
                    gp.procedure.name,
                    str(gp.quantity),
                    str(gp.authorized_quantity) if gp.authorized_quantity else '-'
                ])

            procedure_table = Table(procedure_data, colWidths=[3*cm, 9*cm, 2*cm, 3*cm])
            procedure_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#007AFF')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 8),
                ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(procedure_table)

        # Build PDF
        doc.build(story, onFirstPage=self.create_header, onLaterPages=self.create_header)

        return self.get_value()


def generate_guide_pdf(guide):
    """Helper function to generate guide PDF"""
    generator = GuidePDFGenerator(guide)
    return generator.generate()
