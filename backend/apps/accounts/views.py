from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.db import connection
from apps.beneficiaries.models import Beneficiary, Company, HealthPlan
from .serializers import CPFTokenObtainPairSerializer
from .models import PasswordResetToken, ActivationToken, VerificationToken
from .utils.email_service import send_verification_token
from datetime import datetime
import hashlib
import logging

logger = logging.getLogger(__name__)


class CPFTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that accepts CPF instead of username
    """
    serializer_class = CPFTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Official login endpoint
    Accepts: cpf (with or without formatting) and password
    Returns: JWT tokens and user/beneficiary data
    """
    cpf = request.data.get('cpf')
    password = request.data.get('password')

    if not cpf or not password:
        return Response(
            {'error': 'CPF e senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF (remove formatting)
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    if len(cpf_clean) != 11:
        return Response(
            {'error': 'CPF inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find user by CPF
    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'CPF ou senha incorretos'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Authenticate user
    if not user.check_password(password):
        return Response(
            {'error': 'CPF ou senha incorretos'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Check if user is active
    if not user.is_active:
        return Response(
            {'error': 'Usuário inativo. Entre em contato com o suporte.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Check if beneficiary is active
    if beneficiary.status not in ['ACTIVE', 'PENDING']:
        return Response(
            {'error': 'Beneficiário inativo. Entre em contato com o suporte.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
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
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def test_login(request):
    """
    Accept ANY login/password for testing purposes.
    Creates a test user if it doesn't exist.
    """
    cpf = request.data.get('cpf', 'test')
    password = request.data.get('password', 'test')

    # Clean CPF (remove formatting)
    cpf_clean = ''.join(filter(str.isdigit, cpf))
    if not cpf_clean:
        cpf_clean = 'testuser'

    # Get or create user
    username = f"user_{cpf_clean}"
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': f"{username}@elosaude.com",
            'first_name': 'Test',
            'last_name': 'User'
        }
    )

    if created:
        user.set_password(password)
        user.save()

    # Get or create beneficiary
    try:
        beneficiary = Beneficiary.objects.get(user=user)
    except Beneficiary.DoesNotExist:
        # Create a basic beneficiary profile
        from apps.beneficiaries.models import Company, HealthPlan

        # Get or create test company
        company, _ = Company.objects.get_or_create(
            cnpj='00000000000001',
            defaults={
                'name': 'Test Company',
                'address': 'Test Address',
                'phone': '1234567890',
                'email': 'test@company.com'
            }
        )

        # Get or create test health plan
        health_plan, _ = HealthPlan.objects.get_or_create(
            name='Basic Plan',
            defaults={
                'plan_type': 'BASIC',
                'description': 'Basic health plan',
                'monthly_fee': 500.00,
            }
        )

        beneficiary = Beneficiary.objects.create(
            user=user,
            cpf=cpf_clean.zfill(11),
            full_name=f"{user.first_name} {user.last_name}",
            birth_date='1990-01-01',
            gender='M',
            phone='11999999999',
            email=user.email,
            address='Test Address, 123',
            city='São Paulo',
            state='SP',
            zip_code='01000000',
            beneficiary_type='TITULAR',
            company=company,
            health_plan=health_plan,
            status='ACTIVE'
        )

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
        },
        'beneficiary': {
            'id': beneficiary.id,
            'registration_number': beneficiary.registration_number,
            'cpf': beneficiary.cpf,
            'full_name': beneficiary.full_name,
            'status': beneficiary.status,
            'beneficiary_type': beneficiary.beneficiary_type,
            'company': beneficiary.company.name,
            'health_plan': beneficiary.health_plan.name,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    Requires: current_password, new_password
    """
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')

    # Validate inputs
    if not current_password or not new_password:
        return Response(
            {'error': 'Both current_password and new_password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verify current password
    if not user.check_password(current_password):
        return Response(
            {'current_password': ['Current password is incorrect']},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate new password length
    if len(new_password) < 8:
        return Response(
            {'new_password': ['Password must be at least 8 characters long']},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password strength (at least one uppercase, one lowercase, one number)
    if not any(c.isupper() for c in new_password):
        return Response(
            {'new_password': ['Password must contain at least one uppercase letter']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.islower() for c in new_password):
        return Response(
            {'new_password': ['Password must contain at least one lowercase letter']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.isdigit() for c in new_password):
        return Response(
            {'new_password': ['Password must contain at least one number']},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    return Response(
        {'message': 'Password changed successfully'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """
    Request password reset code
    Sends a 6-digit code to user's email
    """
    cpf = request.data.get('cpf')

    if not cpf:
        return Response(
            {'error': 'CPF é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    if len(cpf_clean) != 11:
        return Response(
            {'error': 'CPF inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find user by CPF
    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        # Don't reveal if CPF exists or not (security)
        return Response(
            {'message': 'Se o CPF estiver cadastrado, você receberá um código de recuperação por e-mail.'},
            status=status.HTTP_200_OK
        )

    # Create reset token
    reset_token = PasswordResetToken.create_for_user(user)

    # Send email
    try:
        context = {
            'user_name': beneficiary.full_name,
            'reset_code': reset_token.code,
            'year': datetime.now().year,
        }

        html_message = render_to_string('accounts/email/password_reset_email.html', context)
        plain_message = strip_tags(html_message)

        send_mail(
            subject='Recuperação de Senha - Elosaúde',
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[beneficiary.email if beneficiary.email else user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        # Log error but don't reveal to user
        print(f"Error sending email: {e}")

    return Response(
        {'message': 'Se o CPF estiver cadastrado, você receberá um código de recuperação por e-mail.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_code(request):
    """
    Verify if reset code is valid
    """
    cpf = request.data.get('cpf')
    code = request.data.get('code')

    if not cpf or not code:
        return Response(
            {'error': 'CPF e código são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid token
    try:
        reset_token = PasswordResetToken.objects.get(
            user=user,
            code=code,
            is_used=False
        )

        if not reset_token.is_valid():
            return Response(
                {'error': 'Código expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'message': 'Código válido'},
            status=status.HTTP_200_OK
        )

    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password with code
    """
    cpf = request.data.get('cpf')
    code = request.data.get('code')
    new_password = request.data.get('new_password')

    if not cpf or not code or not new_password:
        return Response(
            {'error': 'CPF, código e nova senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid token
    try:
        reset_token = PasswordResetToken.objects.get(
            user=user,
            code=code,
            is_used=False
        )

        if not reset_token.is_valid():
            return Response(
                {'error': 'Código expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password
    if len(new_password) < 8:
        return Response(
            {'new_password': ['A senha deve ter no mínimo 8 caracteres']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.isupper() for c in new_password):
        return Response(
            {'new_password': ['A senha deve conter pelo menos uma letra maiúscula']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.islower() for c in new_password):
        return Response(
            {'new_password': ['A senha deve conter pelo menos uma letra minúscula']},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.isdigit() for c in new_password):
        return Response(
            {'new_password': ['A senha deve conter pelo menos um número']},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set new password
    user.set_password(new_password)
    user.save()

    # Mark token as used
    reset_token.mark_as_used()

    return Response(
        {'message': 'Senha redefinida com sucesso'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def request_first_access(request):
    """
    Request first access verification token
    Validates CPF, registration number and email, sends 6-digit token via email
    """
    cpf = request.data.get('cpf')
    registration_number = request.data.get('registration_number')
    email = request.data.get('email')

    logger.info(f"[FIRST-ACCESS] Solicitação de primeiro acesso - CPF: {cpf[:3] if cpf else 'None'}***")

    if not cpf or not registration_number or not email:
        return Response(
            {'error': 'CPF, número de matrícula e email são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    if len(cpf_clean) != 11:
        return Response(
            {'error': 'CPF inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate CPF and registration number using v_app_carteiras_unificadas view
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT nr_cpf, matricula, nome_beneficiario, nascto, empresa, plano_nome,
                   tipo_contratacao, nome_titular
            FROM public.v_app_carteiras_unificadas
            WHERE (LPAD(nr_cpf::TEXT, 11, '0') = %s OR nr_cpf::TEXT = %s)
              AND matricula = %s
            LIMIT 1
        """, [cpf_clean.zfill(11), cpf_clean, registration_number])

        row = cursor.fetchone()

    if not row:
        logger.warning(f"[FIRST-ACCESS] CPF/Matrícula não encontrado na view para CPF: {cpf_clean[:3]}***")
        return Response(
            {'error': 'CPF, matrícula ou email não correspondem aos dados cadastrados'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Extract data from view
    view_data = {
        'cpf': str(row[0]).zfill(11),
        'registration_number': row[1],
        'full_name': row[2],
        'birth_date_str': row[3],  # Format: DD/MM/YYYY
        'company_name': row[4],
        'health_plan_name': row[5],
        'contract_type': row[6],
        'titular_name': row[7],
    }
    logger.info(f"[FIRST-ACCESS] CPF/Matrícula validado na view: {view_data['full_name']}")

    # Find or create beneficiary in Django model
    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
        logger.info(f"[FIRST-ACCESS] Beneficiário encontrado: {beneficiary.full_name}")
    except Beneficiary.DoesNotExist:
        logger.info(f"[FIRST-ACCESS] Beneficiário não existe, criando novo registro...")

        # Get or create User with unusable password
        username = f"cpf_{cpf_clean}"
        user, user_created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': view_data['full_name'].split()[0] if view_data['full_name'] else '',
                'last_name': ' '.join(view_data['full_name'].split()[1:]) if view_data['full_name'] else ''
            }
        )
        if user_created:
            user.set_unusable_password()
            user.save()
            logger.info(f"[FIRST-ACCESS] Usuário criado: {username}")
        else:
            logger.info(f"[FIRST-ACCESS] Usuário já existia: {username}")

        # Get or create Company
        company_name = view_data['company_name'] or 'Empresa Padrão'
        # Generate a unique placeholder CNPJ based on company name hash
        cnpj_hash = hashlib.md5(company_name.encode()).hexdigest()[:14]
        # Convert to numeric-only CNPJ (14 digits)
        placeholder_cnpj = ''.join(str(ord(c) % 10) for c in cnpj_hash).ljust(14, '0')[:14]

        company, _ = Company.objects.get_or_create(
            name=company_name,
            defaults={
                'cnpj': placeholder_cnpj,
                'address': 'Endereço não informado',
                'phone': '',
                'email': 'contato@empresa.com',
                'is_active': True
            }
        )

        # Get or create HealthPlan
        plan_name = view_data['health_plan_name'] or 'Plano Padrão'
        health_plan, _ = HealthPlan.objects.get_or_create(
            name=plan_name,
            defaults={
                'plan_type': 'BASIC',
                'description': f'Plano {plan_name}',
                'monthly_fee': 0,
                'coverage_details': {},
                'is_active': True
            }
        )

        # Parse birth date
        birth_date = None
        if view_data['birth_date_str']:
            try:
                birth_date = datetime.strptime(view_data['birth_date_str'], '%d/%m/%Y').date()
            except ValueError:
                birth_date = datetime.now().date()
        else:
            birth_date = datetime.now().date()

        # Determine beneficiary type
        is_titular = view_data['titular_name'] is None or view_data['titular_name'] == view_data['full_name']
        beneficiary_type = 'TITULAR' if is_titular else 'DEPENDENT'

        # Create Beneficiary
        beneficiary = Beneficiary.objects.create(
            user=user,
            registration_number=view_data['registration_number'],
            cpf=cpf_clean,
            full_name=view_data['full_name'],
            birth_date=birth_date,
            gender='OTHER',  # Default, will be updated in onboarding
            phone='',
            email=email,
            beneficiary_type=beneficiary_type,
            company=company,
            health_plan=health_plan,
            status='ACTIVE',
            onboarding_completed=False
        )
        logger.info(f"[FIRST-ACCESS] Beneficiário criado: {beneficiary.full_name}")

    # Check if user already has an active account (password is set)
    if user.has_usable_password():
        logger.warning(f"[FIRST-ACCESS] Conta já ativada para CPF: {cpf_clean[:3]}***")
        return Response(
            {'error': 'Esta conta já foi ativada. Use a opção "Esqueci minha senha" se necessário.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create 6-digit verification token
    verification_token = VerificationToken.create_for_user(user)
    logger.info(f"[FIRST-ACCESS] Token criado para usuário: {user.username}")

    # Send email with token
    email_sent = send_verification_token(
        email=email,
        token=verification_token.token,
        beneficiary_name=beneficiary.full_name
    )

    if not email_sent:
        logger.error(f"[FIRST-ACCESS] Falha ao enviar email para: {email[:3]}***@***")
        return Response(
            {'error': 'Não foi possível enviar o email. Tente novamente.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Mask email for response
    email_parts = email.split('@')
    if len(email_parts) == 2:
        local = email_parts[0]
        domain = email_parts[1]
        masked_email = f"{local[0]}***{local[-1] if len(local) > 1 else ''}@{domain}"
    else:
        masked_email = "***@***"

    logger.info(f"[FIRST-ACCESS] Token enviado com sucesso para: {masked_email}")

    return Response({
        'message': 'Código de verificação enviado para seu email',
        'email_masked': masked_email
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_activation_token(request):
    """
    Verify if 6-digit verification token is valid
    """
    cpf = request.data.get('cpf')
    token = request.data.get('token')

    logger.info(f"[VERIFY-TOKEN] Verificando token para CPF: {cpf[:3] if cpf else 'None'}***")

    if not cpf or not token:
        return Response(
            {'error': 'CPF e código são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate token format (6 digits)
    token_clean = ''.join(filter(str.isdigit, token))
    if len(token_clean) != 6:
        return Response(
            {'error': 'Código deve ter 6 dígitos'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid verification token
    try:
        verification_token = VerificationToken.objects.get(
            user=user,
            token=token_clean,
            is_used=False
        )

        if verification_token.is_expired():
            logger.warning(f"[VERIFY-TOKEN] Token expirado para CPF: {cpf_clean[:3]}***")
            return Response(
                {'error': 'Código expirado', 'expired': True},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not verification_token.is_valid():
            return Response(
                {'error': 'Código inválido ou expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"[VERIFY-TOKEN] Token válido para CPF: {cpf_clean[:3]}***")
        return Response({
            'message': 'Código verificado com sucesso',
            'valid': True
        }, status=status.HTTP_200_OK)

    except VerificationToken.DoesNotExist:
        logger.warning(f"[VERIFY-TOKEN] Token não encontrado para CPF: {cpf_clean[:3]}***")
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def activate_account(request):
    """
    Activate account with 6-digit verification token and set password
    """
    cpf = request.data.get('cpf')
    token = request.data.get('token')
    password = request.data.get('password') or request.data.get('new_password')

    logger.info(f"[ACTIVATE] Ativando conta para CPF: {cpf[:3] if cpf else 'None'}***")

    if not cpf or not token or not password:
        return Response(
            {'error': 'CPF, código e senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean and validate token (6 digits)
    token_clean = ''.join(filter(str.isdigit, token))
    if len(token_clean) != 6:
        return Response(
            {'error': 'Código deve ter 6 dígitos'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid verification token
    try:
        verification_token = VerificationToken.objects.get(
            user=user,
            token=token_clean,
            is_used=False
        )

        if verification_token.is_expired():
            logger.warning(f"[ACTIVATE] Token expirado para CPF: {cpf_clean[:3]}***")
            return Response(
                {'error': 'Código expirado. Solicite um novo código.', 'expired': True},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not verification_token.is_valid():
            return Response(
                {'error': 'Código inválido ou expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except VerificationToken.DoesNotExist:
        logger.warning(f"[ACTIVATE] Token não encontrado para CPF: {cpf_clean[:3]}***")
        return Response(
            {'error': 'Código inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate password
    if len(password) < 8:
        return Response(
            {'error': 'A senha deve ter no mínimo 8 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.isupper() for c in password):
        return Response(
            {'error': 'A senha deve conter pelo menos uma letra maiúscula'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.islower() for c in password):
        return Response(
            {'error': 'A senha deve conter pelo menos uma letra minúscula'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not any(c.isdigit() for c in password):
        return Response(
            {'error': 'A senha deve conter pelo menos um número'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Set password and activate user
    user.set_password(password)
    user.is_active = True
    user.save()

    # Mark token as used
    verification_token.mark_as_used()

    logger.info(f"[ACTIVATE] Conta ativada com sucesso para CPF: {cpf_clean[:3]}***")

    return Response(
        {'message': 'Conta ativada com sucesso'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_token(request):
    """
    Resend verification token with rate limiting
    - 60 second cooldown between resends
    - Maximum 5 resends per token series
    """
    cpf = request.data.get('cpf')

    logger.info(f"[RESEND] Solicitação de reenvio para CPF: {cpf[:3] if cpf else 'None'}***")

    if not cpf:
        return Response(
            {'error': 'CPF é obrigatório'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    if len(cpf_clean) != 11:
        return Response(
            {'error': 'CPF inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'CPF não encontrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find the latest unused token for this user
    try:
        verification_token = VerificationToken.objects.filter(
            user=user,
            is_used=False
        ).order_by('-created_at').first()

        if not verification_token:
            # No existing token, create a new one
            verification_token = VerificationToken.create_for_user(user)
        else:
            # Check if resend is allowed
            allowed, message, wait_seconds = verification_token.is_resend_allowed()
            if not allowed:
                logger.warning(f"[RESEND] Rate limit atingido para CPF: {cpf_clean[:3]}***")
                return Response({
                    'error': message,
                    'wait_seconds': wait_seconds,
                    'resend_count': verification_token.resend_count
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            # Increment resend (this also regenerates the token)
            verification_token.increment_resend()

        # Send email with new token
        email = beneficiary.email if beneficiary.email else user.email
        if not email:
            return Response(
                {'error': 'Email não cadastrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        email_sent = send_verification_token(
            email=email,
            token=verification_token.token,
            beneficiary_name=beneficiary.full_name
        )

        if not email_sent:
            logger.error(f"[RESEND] Falha ao enviar email para CPF: {cpf_clean[:3]}***")
            return Response(
                {'error': 'Não foi possível enviar o email. Tente novamente.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        logger.info(f"[RESEND] Novo token enviado com sucesso para CPF: {cpf_clean[:3]}***")

        return Response({
            'message': 'Novo código enviado',
            'resend_count': verification_token.resend_count,
            'max_resends': VerificationToken.MAX_RESENDS
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"[RESEND] Erro ao reenviar token: {str(e)}")
        return Response(
            {'error': 'Erro ao reenviar código. Tente novamente.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
