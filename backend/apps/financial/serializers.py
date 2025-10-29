from rest_framework import serializers
from .models import Invoice, PaymentHistory, UsageHistory, TaxStatement


class PaymentHistorySerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = PaymentHistory
        fields = ['id', 'invoice', 'payment_method', 'payment_method_display', 'payment_date', 'amount_paid', 'transaction_id', 'created_at']
        read_only_fields = ['created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    payments = PaymentHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    invoice_pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'beneficiary', 'beneficiary_name', 'reference_month',
            'amount', 'due_date', 'payment_date', 'status', 'status_display',
            'barcode', 'digitable_line', 'invoice_pdf', 'invoice_pdf_url', 'payments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['barcode', 'digitable_line', 'created_at', 'updated_at']
    
    def get_invoice_pdf_url(self, obj):
        if obj.invoice_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.invoice_pdf.url)
        return None


class UsageHistorySerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    
    class Meta:
        model = UsageHistory
        fields = [
            'id', 'beneficiary', 'beneficiary_name', 'period',
            'consultations_count', 'exams_count', 'procedures_count', 'hospitalizations_count',
            'total_amount', 'copayment_amount', 'usage_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TaxStatementSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    statement_pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TaxStatement
        fields = [
            'id', 'beneficiary', 'beneficiary_name', 'year',
            'total_paid', 'deductible_amount', 'monthly_breakdown',
            'statement_pdf', 'statement_pdf_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_statement_pdf_url(self, obj):
        if obj.statement_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.statement_pdf.url)
        return None
