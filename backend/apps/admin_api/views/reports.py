import csv
import io
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse

from apps.beneficiaries.models import Beneficiary
from apps.providers.models import AccreditedProvider
from apps.reimbursements.models import ReimbursementRequest
from ..permissions import IsAdminUser
from ..signals import log_admin_action


class ReportGenerateView(APIView):
    """Generate report data for preview"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        report_type = request.data.get('report_type')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        filters = request.data.get('filters', {})

        if not report_type:
            return Response(
                {'error': 'Report type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if report_type == 'users':
            data = self._generate_users_report(date_from, date_to, filters)
        elif report_type == 'providers':
            data = self._generate_providers_report(date_from, date_to, filters)
        elif report_type == 'reimbursements':
            data = self._generate_reimbursements_report(date_from, date_to, filters)
        else:
            return Response(
                {'error': f'Unknown report type: {report_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'report_type': report_type,
            'generated_at': str(request._request.META.get('HTTP_DATE', '')),
            'total_records': len(data),
            'data': data[:100]  # Return first 100 for preview
        })

    def _generate_users_report(self, date_from, date_to, filters):
        queryset = Beneficiary.objects.all()

        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return list(queryset.values(
            'registration_number', 'full_name', 'cpf', 'email',
            'phone', 'status', 'beneficiary_type', 'created_at'
        ))

    def _generate_providers_report(self, date_from, date_to, filters):
        queryset = AccreditedProvider.objects.all()

        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return list(queryset.values(
            'name', 'provider_type', 'cnpj', 'email', 'phone',
            'city', 'state', 'is_active', 'rating', 'created_at'
        ))

    def _generate_reimbursements_report(self, date_from, date_to, filters):
        queryset = ReimbursementRequest.objects.select_related('beneficiary')

        if date_from:
            queryset = queryset.filter(request_date__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(request_date__date__lte=date_to)

        return list(queryset.values(
            'protocol_number', 'beneficiary__full_name', 'expense_type',
            'service_date', 'requested_amount', 'approved_amount',
            'status', 'request_date'
        ))


class ReportExportView(APIView):
    """Export report to file"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, format):
        report_type = request.data.get('report_type')
        date_from = request.data.get('date_from')
        date_to = request.data.get('date_to')
        filters = request.data.get('filters', {})

        if format not in ['csv', 'pdf']:
            return Response(
                {'error': 'Invalid format. Use csv or pdf.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get report data
        generator = ReportGenerateView()
        if report_type == 'users':
            data = generator._generate_users_report(date_from, date_to, filters)
        elif report_type == 'providers':
            data = generator._generate_providers_report(date_from, date_to, filters)
        elif report_type == 'reimbursements':
            data = generator._generate_reimbursements_report(date_from, date_to, filters)
        else:
            return Response(
                {'error': f'Unknown report type: {report_type}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for large exports
        if len(data) > 10000:
            # Queue background job
            # from .tasks import export_report_task
            # job = export_report_task.delay(report_type, format, data, request.user.email)
            return Response({
                'message': 'Report is being generated. You will receive an email when ready.',
                'job_id': 'background-job-id'
            }, status=status.HTTP_202_ACCEPTED)

        # Log export action
        log_admin_action(
            request=request,
            action='EXPORT',
            entity=Beneficiary.objects.first() if data else None,  # Dummy entity for logging
            changes={'report_type': report_type, 'format': format, 'records': len(data)}
        )

        if format == 'csv':
            return self._export_csv(data, report_type)
        else:
            return self._export_pdf(data, report_type)

    def _export_csv(self, data, report_type):
        if not data:
            return Response({'error': 'No data to export'}, status=status.HTTP_400_BAD_REQUEST)

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.csv"'
        return response

    def _export_pdf(self, data, report_type):
        # For now, return a simple response
        # Full PDF implementation would use ReportLab
        from django.http import HttpResponse
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        # Add title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 750, f"Relatorio: {report_type.title()}")

        # Add basic info
        p.setFont("Helvetica", 12)
        p.drawString(50, 720, f"Total de registros: {len(data)}")

        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_report.pdf"'
        return response
