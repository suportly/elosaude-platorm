from rest_framework import serializers
from .models import ReimbursementRequest, ReimbursementDocument


class ReimbursementDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)

    class Meta:
        model = ReimbursementDocument
        fields = ['id', 'reimbursement', 'document_type', 'document_type_display', 'description', 'file', 'file_url', 'uploaded_at']
        read_only_fields = ['uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class ReimbursementRequestSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    documents = ReimbursementDocumentSerializer(many=True, read_only=True)
    expense_type_display = serializers.CharField(source='get_expense_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ReimbursementRequest
        fields = [
            'id', 'protocol_number', 'beneficiary', 'beneficiary_name',
            'expense_type', 'expense_type_display', 'service_date',
            'provider_name', 'provider_cnpj_cpf', 'requested_amount', 'approved_amount',
            'status', 'status_display', 'documents', 'bank_details',
            'denial_reason', 'analysis_date', 'request_date'
        ]
        read_only_fields = ['protocol_number', 'approved_amount', 'analysis_date', 'request_date']


class ReimbursementRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReimbursementRequest
        fields = [
            'beneficiary', 'expense_type', 'service_date',
            'provider_name', 'provider_cnpj_cpf', 'requested_amount', 'bank_details'
        ]
