from rest_framework import serializers
from .models import Procedure, TISSGuide, GuideProcedure, GuideAttachment


class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedure
        fields = ['id', 'code', 'name', 'category', 'base_price', 'requires_authorization', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class GuideProcedureSerializer(serializers.ModelSerializer):
    procedure_name = serializers.CharField(source='procedure.name', read_only=True)
    procedure_code = serializers.CharField(source='procedure.code', read_only=True)
    
    class Meta:
        model = GuideProcedure
        fields = ['id', 'procedure', 'procedure_name', 'procedure_code', 'quantity', 'authorized_quantity', 'unit_price', 'total_price']


class GuideAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = GuideAttachment
        fields = ['id', 'guide', 'attachment_type', 'description', 'file', 'file_url', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class TISSGuideSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.name', read_only=True)
    procedures = GuideProcedureSerializer(source='guideprocedure_set', many=True, read_only=True)
    attachments = GuideAttachmentSerializer(many=True, read_only=True)
    guide_type_display = serializers.CharField(source='get_guide_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TISSGuide
        fields = [
            'id', 'guide_number', 'protocol_number', 'guide_type', 'guide_type_display',
            'status', 'status_display', 'beneficiary', 'beneficiary_name',
            'provider', 'provider_name', 'procedures', 'attachments',
            'request_date', 'authorization_date', 'expiry_date',
            'diagnosis', 'observations', 'requesting_physician_name', 'requesting_physician_crm',
            'denial_reason', 'guide_pdf', 'created_at', 'updated_at'
        ]
        read_only_fields = ['guide_number', 'protocol_number', 'created_at', 'updated_at']


class TISSGuideCreateSerializer(serializers.ModelSerializer):
    procedure_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    quantities = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = TISSGuide
        fields = [
            'guide_type', 'beneficiary', 'provider', 'diagnosis', 'observations',
            'requesting_physician_name', 'requesting_physician_crm',
            'procedure_ids', 'quantities'
        ]
    
    def create(self, validated_data):
        procedure_ids = validated_data.pop('procedure_ids')
        quantities = validated_data.pop('quantities', None)
        
        guide = TISSGuide.objects.create(**validated_data)
        
        # Add procedures
        for idx, proc_id in enumerate(procedure_ids):
            procedure = Procedure.objects.get(id=proc_id)
            qty = quantities[idx] if quantities and idx < len(quantities) else 1
            GuideProcedure.objects.create(
                guide=guide,
                procedure=procedure,
                quantity=qty,
                unit_price=procedure.base_price,
                total_price=procedure.base_price * qty
            )
        
        return guide
