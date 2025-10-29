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
from apps.beneficiaries.models import Beneficiary
from .serializers import CPFTokenObtainPairSerializer
from .models import PasswordResetToken, ActivationToken
from datetime import datetime


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
            'status': beneficiary.status,
            'beneficiary_type': beneficiary.beneficiary_type,
            'company': beneficiary.company.name,
            'health_plan': beneficiary.health_plan.name,
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

        # Create digital card for beneficiary
        from apps.beneficiaries.models import DigitalCard
        from datetime import datetime, timedelta

        DigitalCard.objects.create(
            beneficiary=beneficiary,
            expiry_date=datetime.now().date() + timedelta(days=365)
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
    Request first access activation token
    Validates CPF and registration number, sends activation token via email
    """
    cpf = request.data.get('cpf')
    registration_number = request.data.get('registration_number')

    if not cpf or not registration_number:
        return Response(
            {'error': 'CPF e número de matrícula são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    if len(cpf_clean) != 11:
        return Response(
            {'error': 'CPF inválido'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find beneficiary by CPF and registration number
    try:
        beneficiary = Beneficiary.objects.get(
            cpf=cpf_clean,
            registration_number=registration_number
        )
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        # Don't reveal if combination exists (security)
        return Response(
            {'message': 'Se os dados estiverem corretos, você receberá um token de ativação por e-mail.'},
            status=status.HTTP_200_OK
        )

    # Check if user already has an active account (password is set)
    if user.has_usable_password():
        return Response(
            {'error': 'Esta conta já foi ativada. Use a opção "Esqueci minha senha" se necessário.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create activation token
    activation_token = ActivationToken.create_for_user(user)

    # Send email with token
    try:
        context = {
            'user_name': beneficiary.full_name,
            'activation_token': activation_token.token,
            'year': datetime.now().year,
        }

        # Simple text email for now (you can create HTML template later)
        email_subject = 'Token de Ativação - Elosaúde'
        email_message = f"""
Olá {beneficiary.full_name},

Bem-vindo ao Elosaúde! Para ativar sua conta, use o token abaixo:

Token de Ativação: {activation_token.token}

Este token é válido por 24 horas.

Se você não solicitou este token, ignore este email.

Atenciosamente,
Equipe Elosaúde
        """

        send_mail(
            subject=email_subject,
            message=email_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[beneficiary.email if beneficiary.email else user.email],
            fail_silently=False,
        )
    except Exception as e:
        # Log error but don't reveal to user
        print(f"Error sending email: {e}")

    return Response(
        {'message': 'Se os dados estiverem corretos, você receberá um token de ativação por e-mail.'},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_activation_token(request):
    """
    Verify if activation token is valid
    """
    cpf = request.data.get('cpf')
    token = request.data.get('token')

    if not cpf or not token:
        return Response(
            {'error': 'CPF e token são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Token inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid token
    try:
        activation_token = ActivationToken.objects.get(
            user=user,
            token=token,
            is_used=False
        )

        if not activation_token.is_valid():
            return Response(
                {'error': 'Token expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'message': 'Token válido'},
            status=status.HTTP_200_OK
        )

    except ActivationToken.DoesNotExist:
        return Response(
            {'error': 'Token inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def activate_account(request):
    """
    Activate account with token and set password
    """
    cpf = request.data.get('cpf')
    token = request.data.get('token')
    new_password = request.data.get('new_password')

    if not cpf or not token or not new_password:
        return Response(
            {'error': 'CPF, token e nova senha são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Clean CPF
    cpf_clean = ''.join(filter(str.isdigit, cpf))

    try:
        beneficiary = Beneficiary.objects.get(cpf=cpf_clean)
        user = beneficiary.user
    except Beneficiary.DoesNotExist:
        return Response(
            {'error': 'Token inválido ou expirado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find valid token
    try:
        activation_token = ActivationToken.objects.get(
            user=user,
            token=token,
            is_used=False
        )

        if not activation_token.is_valid():
            return Response(
                {'error': 'Token expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except ActivationToken.DoesNotExist:
        return Response(
            {'error': 'Token inválido ou expirado'},
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

    # Set password and activate user
    user.set_password(new_password)
    user.is_active = True
    user.save()

    # Mark token as used
    activation_token.mark_as_used()

    return Response(
        {'message': 'Conta ativada com sucesso'},
        status=status.HTTP_200_OK
    )
