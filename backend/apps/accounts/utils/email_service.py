"""
Email Service Utility for Elosaúde
Provides easy-to-use functions for sending templated emails
"""

from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service class for sending emails using Django templates"""

    DEFAULT_FROM_EMAIL = settings.DEFAULT_FROM_EMAIL

    @staticmethod
    def send_templated_email(
        to_email: str | List[str],
        subject: str,
        template_name: str,
        context: Dict,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        fail_silently: bool = False
    ) -> bool:
        """
        Send an email using a Django HTML template

        Args:
            to_email: Recipient email address or list of addresses
            subject: Email subject
            template_name: Name of the template (without path or extension)
            context: Dictionary with variables for the template
            from_email: Sender email (defaults to DEFAULT_FROM_EMAIL)
            cc: List of CC recipients
            bcc: List of BCC recipients
            fail_silently: Whether to suppress exceptions

        Returns:
            bool: True if email was sent successfully, False otherwise

        Example:
            EmailService.send_templated_email(
                to_email='user@example.com',
                subject='Bem-vindo ao Elosaúde',
                template_name='first_access_activation',
                context={
                    'user_name': 'João Silva',
                    'activation_code': '123456'
                }
            )
        """
        try:
            # Ensure to_email is a list
            if isinstance(to_email, str):
                to_email = [to_email]

            # Set default from_email
            if from_email is None:
                from_email = EmailService.DEFAULT_FROM_EMAIL

            # Render HTML email
            html_content = render_to_string(
                f'accounts/email/{template_name}.html',
                context
            )

            # Create plain text version (strip HTML tags)
            text_content = strip_tags(html_content)

            # Create email message
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=from_email,
                to=to_email,
                cc=cc or [],
                bcc=bcc or []
            )

            # Attach HTML alternative
            email.attach_alternative(html_content, "text/html")

            # Send email
            email.send(fail_silently=fail_silently)

            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            if not fail_silently:
                raise
            return False

    @classmethod
    def send_password_reset(cls, user, reset_code: str) -> bool:
        """
        Send password reset email

        Args:
            user: User instance
            reset_code: Password reset code

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject='Redefinição de Senha - Elosaúde',
            template_name='password_reset_email',
            context={
                'user_name': user.get_full_name() or user.username,
                'reset_code': reset_code,
                'year': settings.CURRENT_YEAR if hasattr(settings, 'CURRENT_YEAR') else 2024
            }
        )

    @classmethod
    def send_activation_email(cls, user, activation_code: str) -> bool:
        """
        Send first access activation email

        Args:
            user: User instance
            activation_code: Activation code

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject='Bem-vindo ao Elosaúde!',
            template_name='first_access_activation',
            context={
                'user_name': user.get_full_name() or user.username,
                'activation_code': activation_code
            }
        )

    @classmethod
    def send_verification_token(cls, email: str, token: str, beneficiary_name: str) -> bool:
        """
        Send 6-digit verification token email for first access

        Args:
            email: Recipient email address
            token: 6-digit verification token
            beneficiary_name: Beneficiary's name for personalization

        Returns:
            bool: Success status
        """
        logger.info(f"[EMAIL] Enviando token de verificação para: {email[:3]}***@***")
        try:
            result = cls.send_templated_email(
                to_email=email,
                subject='Código de Verificação - Elosaúde',
                template_name='verification_email',
                context={
                    'beneficiary_name': beneficiary_name,
                    'token': token
                }
            )
            if result:
                logger.info(f"[EMAIL] Token enviado com sucesso para: {email[:3]}***@***")
            else:
                logger.warning(f"[EMAIL] Falha ao enviar token para: {email[:3]}***@***")
            return result
        except Exception as e:
            logger.error(f"[EMAIL] Erro ao enviar token: {str(e)}")
            return False

    @classmethod
    def send_guide_authorized(cls, user, guide_data: Dict) -> bool:
        """
        Send guide authorization notification

        Args:
            user: User instance
            guide_data: Dictionary with guide information

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject='Guia Autorizada - Elosaúde',
            template_name='guide_authorized',
            context={
                'user_name': user.get_full_name() or user.username,
                **guide_data
            }
        )

    @classmethod
    def send_reimbursement_approved(cls, user, reimbursement_data: Dict) -> bool:
        """
        Send reimbursement approval notification

        Args:
            user: User instance
            reimbursement_data: Dictionary with reimbursement information

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject='Reembolso Aprovado - Elosaúde',
            template_name='reimbursement_approved',
            context={
                'user_name': user.get_full_name() or user.username,
                **reimbursement_data
            }
        )

    @classmethod
    def send_invoice_reminder(cls, user, invoice_data: Dict) -> bool:
        """
        Send invoice due date reminder

        Args:
            user: User instance
            invoice_data: Dictionary with invoice information

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject='Lembrete de Pagamento - Elosaúde',
            template_name='invoice_due_reminder',
            context={
                'user_name': user.get_full_name() or user.username,
                **invoice_data
            }
        )

    @classmethod
    def send_notification(
        cls,
        user,
        title: str,
        message: str,
        subtitle: Optional[str] = None,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        additional_info: Optional[str] = None
    ) -> bool:
        """
        Send a generic notification email

        Args:
            user: User instance
            title: Notification title
            message: Main message (can include HTML)
            subtitle: Optional subtitle
            action_url: Optional URL for action button
            action_text: Text for action button
            additional_info: Additional information box content

        Returns:
            bool: Success status
        """
        return cls.send_templated_email(
            to_email=user.email,
            subject=f'{title} - Elosaúde',
            template_name='notification_email',
            context={
                'user_name': user.get_full_name() or user.username,
                'notification_title': title,
                'notification_subtitle': subtitle,
                'notification_message': message,
                'action_url': action_url,
                'action_text': action_text,
                'additional_info': additional_info
            }
        )


# Convenience functions for direct import
send_password_reset = EmailService.send_password_reset
send_activation_email = EmailService.send_activation_email
send_verification_token = EmailService.send_verification_token
send_guide_authorized = EmailService.send_guide_authorized
send_reimbursement_approved = EmailService.send_reimbursement_approved
send_invoice_reminder = EmailService.send_invoice_reminder
send_notification = EmailService.send_notification
