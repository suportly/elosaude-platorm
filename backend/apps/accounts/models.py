from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
import string


class PasswordResetToken(models.Model):
    """Model to store password reset tokens"""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        verbose_name='Usuário'
    )
    code = models.CharField(
        max_length=6,
        verbose_name='Código'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    expires_at = models.DateTimeField(
        verbose_name='Expira em'
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name='Usado'
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Usado em'
    )

    class Meta:
        db_table = 'accounts_password_reset_token'
        verbose_name = 'Token de Redefinição de Senha'
        verbose_name_plural = 'Tokens de Redefinição de Senha'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.code}"

    @staticmethod
    def generate_code():
        """Generate a 6-digit numeric code"""
        return ''.join(random.choices(string.digits, k=6))

    @classmethod
    def create_for_user(cls, user):
        """Create a new reset token for a user"""
        # Invalidate all previous tokens for this user
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        code = cls.generate_code()
        expires_at = timezone.now() + timedelta(hours=1)

        return cls.objects.create(
            user=user,
            code=code,
            expires_at=expires_at
        )

    def is_valid(self):
        """Check if token is still valid"""
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True

    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()


class ActivationToken(models.Model):
    """Model to store activation tokens for first access"""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='activation_tokens',
        verbose_name='Usuário'
    )
    token = models.CharField(
        max_length=32,
        verbose_name='Token'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    expires_at = models.DateTimeField(
        verbose_name='Expira em'
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name='Usado'
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Usado em'
    )

    class Meta:
        db_table = 'accounts_activation_token'
        verbose_name = 'Token de Ativação'
        verbose_name_plural = 'Tokens de Ativação'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.token[:8]}..."

    @staticmethod
    def generate_token():
        """Generate a random 32-character token"""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    @classmethod
    def create_for_user(cls, user):
        """Create a new activation token for a user"""
        # Invalidate all previous tokens for this user
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(hours=24)  # 24 hour expiry

        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

    def is_valid(self):
        """Check if token is still valid"""
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True

    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save()


class VerificationToken(models.Model):
    """6-digit verification token for first access via email"""

    TOKEN_EXPIRY_MINUTES = 10
    RESEND_COOLDOWN_SECONDS = 60
    MAX_RESENDS = 5

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='verification_tokens',
        verbose_name='Usuário'
    )
    token = models.CharField(
        max_length=6,
        verbose_name='Token'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Criado em'
    )
    expires_at = models.DateTimeField(
        verbose_name='Expira em'
    )
    is_used = models.BooleanField(
        default=False,
        verbose_name='Usado'
    )
    used_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Usado em'
    )
    last_resent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último reenvio em'
    )
    resend_count = models.IntegerField(
        default=0,
        verbose_name='Contagem de reenvios'
    )

    class Meta:
        db_table = 'accounts_verification_token'
        verbose_name = 'Token de Verificação'
        verbose_name_plural = 'Tokens de Verificação'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.token}"

    @staticmethod
    def generate_token():
        """Generate a random 6-digit numeric token"""
        return ''.join(random.choices(string.digits, k=6))

    @classmethod
    def create_for_user(cls, user):
        """Create a new verification token for a user, invalidating previous ones"""
        # Invalidate all previous unused tokens for this user
        cls.objects.filter(user=user, is_used=False).update(is_used=True)

        token = cls.generate_token()
        expires_at = timezone.now() + timedelta(minutes=cls.TOKEN_EXPIRY_MINUTES)

        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )

    def is_valid(self):
        """Check if token is still valid (not used and not expired)"""
        if self.is_used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True

    def is_expired(self):
        """Check if token has expired"""
        return timezone.now() > self.expires_at

    def is_resend_allowed(self):
        """Check if resend is allowed (cooldown and max limit)"""
        if self.resend_count >= self.MAX_RESENDS:
            return False, "Limite de reenvios atingido. Aguarde 30 minutos.", 0

        if self.last_resent_at:
            cooldown_end = self.last_resent_at + timedelta(seconds=self.RESEND_COOLDOWN_SECONDS)
            if timezone.now() < cooldown_end:
                wait_seconds = int((cooldown_end - timezone.now()).total_seconds())
                return False, f"Aguarde {wait_seconds} segundos para reenviar.", wait_seconds

        return True, None, 0

    def mark_as_used(self):
        """Mark token as used"""
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])

    def increment_resend(self):
        """Increment resend counter and update new token"""
        self.resend_count += 1
        self.last_resent_at = timezone.now()
        self.token = self.generate_token()
        self.expires_at = timezone.now() + timedelta(minutes=self.TOKEN_EXPIRY_MINUTES)
        self.save(update_fields=['resend_count', 'last_resent_at', 'token', 'expires_at'])
