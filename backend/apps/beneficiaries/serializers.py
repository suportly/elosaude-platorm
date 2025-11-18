from rest_framework import serializers
from .models import Company, HealthPlan, Beneficiary


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class HealthPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthPlan
        fields = '__all__'


class BeneficiarySerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    health_plan_name = serializers.CharField(source='health_plan.name', read_only=True)
    dependents_count = serializers.SerializerMethodField()

    class Meta:
        model = Beneficiary
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True},
            'registration_number': {'required': False}
        }

    def get_dependents_count(self, obj):
        if obj.beneficiary_type == 'TITULAR':
            return obj.dependents.count()
        return 0


class BeneficiaryDetailSerializer(BeneficiarySerializer):
    """Detailed serializer with nested data"""
    company = CompanySerializer(read_only=True)
    health_plan = HealthPlanSerializer(read_only=True)
    dependents = BeneficiarySerializer(many=True, read_only=True)

    class Meta(BeneficiarySerializer.Meta):
        pass
