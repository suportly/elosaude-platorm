from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from apps.beneficiaries.models import Beneficiary


class CPFTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that accepts CPF instead of username
    """
    username_field = 'cpf'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with cpf
        self.fields['cpf'] = serializers.CharField()
        self.fields.pop('username', None)

    def validate(self, attrs):
        import logging
        logger = logging.getLogger(__name__)

        cpf = attrs.get('cpf')
        password = attrs.get('password')

        logger.info(f"[LOGIN] Tentativa de login - CPF recebido: {cpf[:3]}***{cpf[-2:] if cpf else 'None'}")

        if not cpf or not password:
            logger.warning("[LOGIN] CPF ou senha não fornecidos")
            raise serializers.ValidationError('CPF e senha são obrigatórios')

        # Clean CPF (remove formatting)
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        logger.info(f"[LOGIN] CPF limpo: {cpf_clean[:3]}***{cpf_clean[-2:]}, tamanho: {len(cpf_clean)}")

        if len(cpf_clean) != 11:
            logger.warning(f"[LOGIN] CPF inválido - tamanho: {len(cpf_clean)}")
            raise serializers.ValidationError('CPF inválido')

        # Find user by CPF
        try:
            beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
            user = beneficiary.user
            logger.info(f"[LOGIN] Beneficiário encontrado - ID: {beneficiary.id}, Nome: {beneficiary.full_name}")
        except Beneficiary.DoesNotExist:
            logger.warning(f"[LOGIN] Beneficiário não encontrado para CPF: {cpf_clean[:3]}***{cpf_clean[-2:]}")
            raise serializers.ValidationError('CPF ou senha incorretos')

        # Check password
        if not user.check_password(password):
            logger.warning(f"[LOGIN] Senha incorreta para usuário: {user.username}")
            raise serializers.ValidationError('CPF ou senha incorretos')

        # Check if user is active
        if not user.is_active:
            logger.warning(f"[LOGIN] Usuário inativo: {user.username}")
            raise serializers.ValidationError('Usuário inativo. Entre em contato com o suporte.')

        # Check if beneficiary is active
        if beneficiary.status not in ['ACTIVE', 'PENDING']:
            logger.warning(f"[LOGIN] Beneficiário inativo - Status: {beneficiary.status}")
            raise serializers.ValidationError('Beneficiário inativo. Entre em contato com o suporte.')

        logger.info(f"[LOGIN] Autenticação bem-sucedida para: {user.username}")

        # Set user for token generation
        attrs['user'] = user

        # Generate tokens
        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'beneficiary': {
                'id': beneficiary.id,
                'registration_number': beneficiary.registration_number,
                'cpf': beneficiary.cpf,
                'full_name': beneficiary.full_name,
                'birth_date': str(beneficiary.birth_date) if beneficiary.birth_date else None,
                'phone': beneficiary.phone,
                'email': beneficiary.email,
                'status': beneficiary.status,
                'beneficiary_type': beneficiary.beneficiary_type,
                'company': beneficiary.company.name,
                'health_plan': beneficiary.health_plan.name,
                'onboarding_completed': beneficiary.onboarding_completed,
                'onboarding_completed_at': beneficiary.onboarding_completed_at.isoformat() if beneficiary.onboarding_completed_at else None,
            }
        }

        return data
