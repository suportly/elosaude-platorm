"""
PDF Generator utilities using ReportLab
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.pdfgen import canvas
from io import BytesIO
from datetime import datetime


class PDFGenerator:
    """Base class for generating PDFs"""

    def __init__(self, title="Documento"):
        self.title = title
        self.buffer = BytesIO()
        self.pagesize = A4
        self.width, self.height = self.pagesize
        self.styles = getSampleStyleSheet()

        # Custom styles
        self.styles.add(ParagraphStyle(
            name='Title',
            parent=self.styles['Heading1'],
            fontSize=18,
            alignment=TA_CENTER,
            spaceAfter=20,
            textColor=colors.HexColor('#007AFF')
        ))

        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#333333')
        ))

        self.styles.add(ParagraphStyle(
            name='RightAlign',
            parent=self.styles['Normal'],
            alignment=TA_RIGHT,
        ))

    def create_header(self, canvas, doc):
        """Draw header on each page"""
        canvas.saveState()

        # Logo placeholder (you can add an actual logo later)
        canvas.setFont('Helvetica-Bold', 16)
        canvas.setFillColor(colors.HexColor('#007AFF'))
        canvas.drawString(2*cm, self.height - 2*cm, '🏥 Elosaúde')

        # Date
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.black)
        canvas.drawRightString(
            self.width - 2*cm,
            self.height - 2*cm,
            f'Gerado em: {datetime.now().strftime("%d/%m/%Y %H:%M")}'
        )

        # Line
        canvas.setStrokeColor(colors.HexColor('#007AFF'))
        canvas.setLineWidth(2)
        canvas.line(2*cm, self.height - 2.5*cm, self.width - 2*cm, self.height - 2.5*cm)

        canvas.restoreState()

    def create_footer(self, canvas, doc):
        """Draw footer on each page"""
        canvas.saveState()

        # Line
        canvas.setStrokeColor(colors.HexColor('#CCCCCC'))
        canvas.setLineWidth(1)
        canvas.line(2*cm, 2*cm, self.width - 2*cm, 2*cm)

        # Footer text
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.HexColor('#666666'))
        canvas.drawCentredString(
            self.width / 2,
            1.5*cm,
            'Elosaúde - Gestão de Saúde'
        )

        # Page number
        canvas.drawRightString(
            self.width - 2*cm,
            1.5*cm,
            f'Página {doc.page}'
        )

        canvas.restoreState()

    def create_document(self):
        """Create and return a SimpleDocTemplate"""
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=self.pagesize,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=3.5*cm,
            bottomMargin=3*cm,
            title=self.title
        )
        return doc

    def get_value(self):
        """Get the PDF bytes"""
        return self.buffer.getvalue()


def format_currency(value):
    """Format value as Brazilian Real"""
    if value is None:
        return 'R$ 0,00'
    return f'R$ {value:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')


def format_date(date_obj):
    """Format date as dd/mm/yyyy"""
    if not date_obj:
        return ''
    if isinstance(date_obj, str):
        try:
            date_obj = datetime.strptime(date_obj, '%Y-%m-%d').date()
        except:
            return date_obj
    return date_obj.strftime('%d/%m/%Y')


def format_datetime(dt_obj):
    """Format datetime as dd/mm/yyyy HH:MM"""
    if not dt_obj:
        return ''
    if isinstance(dt_obj, str):
        try:
            dt_obj = datetime.strptime(dt_obj, '%Y-%m-%dT%H:%M:%S')
        except:
            return dt_obj
    return dt_obj.strftime('%d/%m/%Y %H:%M')
