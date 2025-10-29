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
