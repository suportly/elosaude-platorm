from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


@shared_task
def process_pending_reimbursements():
    """
    Process pending reimbursement requests
    Auto-analyze requests older than 24 hours
    """
    from apps.reimbursements.models import ReimbursementRequest

    try:
        # Find reimbursements pending for more than 24 hours
        cutoff_date = timezone.now() - timedelta(hours=24)

        pending_reimbursements = ReimbursementRequest.objects.filter(
            status='IN_ANALYSIS',
            request_date__lt=cutoff_date
        ).select_related('beneficiary')

        count = 0
        for reimbursement in pending_reimbursements:
            # Trigger analysis task
            analyze_reimbursement.delay(reimbursement.id)
            count += 1

        logger.info(f"Triggered analysis for {count} pending reimbursements")
        return count

    except Exception as e:
        logger.error(f"Error processing pending reimbursements: {str(e)}")
        return 0


@shared_task
def analyze_reimbursement(reimbursement_id):
    """
    Analyze a specific reimbursement request
    Business rules for auto-approval:
    - Check beneficiary is active
    - Check service date is within coverage period
    - Check expense type coverage
    - Auto-approve low amounts (<= R$ 500)
    """
    from apps.reimbursements.models import ReimbursementRequest, ReimbursementDocument
    from apps.notifications.tasks import send_notification

    try:
        reimbursement = ReimbursementRequest.objects.select_related('beneficiary').get(id=reimbursement_id)

        # Already analyzed
        if reimbursement.status != 'IN_ANALYSIS':
            logger.info(f"Reimbursement {reimbursement.protocol_number} already analyzed")
            return False

        # Check if beneficiary is active
        if reimbursement.beneficiary.status != 'ACTIVE':
            reimbursement.status = 'DENIED'
            reimbursement.denial_reason = 'Beneficiário não está ativo no momento do pedido'
            reimbursement.analysis_date = timezone.now()
            reimbursement.save()

            send_notification.delay(
                beneficiary_id=reimbursement.beneficiary.id,
                title="Reembolso Negado",
                message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi negado: Beneficiário inativo",
                notification_type='REIMBURSEMENT',
                priority='HIGH',
                data={'reimbursement_id': reimbursement.id}
            )

            logger.info(f"Reimbursement {reimbursement.protocol_number} denied - inactive beneficiary")
            return False

        # Check if service date is not in the future
        if reimbursement.service_date > timezone.now().date():
            reimbursement.status = 'DENIED'
            reimbursement.denial_reason = 'Data do atendimento é posterior à data atual'
            reimbursement.analysis_date = timezone.now()
            reimbursement.save()

            send_notification.delay(
                beneficiary_id=reimbursement.beneficiary.id,
                title="Reembolso Negado",
                message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi negado: Data de atendimento inválida",
                notification_type='REIMBURSEMENT',
                priority='HIGH'
            )

            logger.info(f"Reimbursement {reimbursement.protocol_number} denied - future service date")
            return False

        # Check if service date is within 90 days
        max_days_ago = timezone.now().date() - timedelta(days=90)
        if reimbursement.service_date < max_days_ago:
            reimbursement.status = 'DENIED'
            reimbursement.denial_reason = 'Prazo para solicitação de reembolso expirado (máximo 90 dias)'
            reimbursement.analysis_date = timezone.now()
            reimbursement.save()

            send_notification.delay(
                beneficiary_id=reimbursement.beneficiary.id,
                title="Reembolso Negado",
                message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi negado: Prazo expirado",
                notification_type='REIMBURSEMENT',
                priority='HIGH'
            )

            logger.info(f"Reimbursement {reimbursement.protocol_number} denied - expired deadline")
            return False

        # Check if required documents are attached
        has_invoice = reimbursement.documents.filter(document_type='INVOICE').exists()
        if not has_invoice:
            reimbursement.status = 'DENIED'
            reimbursement.denial_reason = 'Nota fiscal ou recibo não anexado'
            reimbursement.analysis_date = timezone.now()
            reimbursement.save()

            send_notification.delay(
                beneficiary_id=reimbursement.beneficiary.id,
                title="Reembolso Negado",
                message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi negado: Documentação incompleta",
                notification_type='REIMBURSEMENT',
                priority='HIGH'
            )

            logger.info(f"Reimbursement {reimbursement.protocol_number} denied - missing invoice")
            return False

        # Auto-approve low amounts (consultation and exam types <= R$ 500)
        if reimbursement.expense_type in ['CONSULTATION', 'EXAM'] and reimbursement.requested_amount <= Decimal('500.00'):
            # Apply coverage percentage (80% for consultations and exams)
            coverage_percentage = Decimal('0.80')
            approved_amount = reimbursement.requested_amount * coverage_percentage

            reimbursement.status = 'APPROVED'
            reimbursement.approved_amount = approved_amount
            reimbursement.analysis_date = timezone.now()
            reimbursement.notes = f'Auto-aprovado (cobertura de {int(coverage_percentage * 100)}%)'
            reimbursement.save()

            send_notification.delay(
                beneficiary_id=reimbursement.beneficiary.id,
                title="Reembolso Aprovado",
                message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi aprovado! Valor: R$ {approved_amount:.2f}",
                notification_type='REIMBURSEMENT',
                priority='HIGH',
                data={'reimbursement_id': reimbursement.id, 'approved_amount': float(approved_amount)}
            )

            logger.info(f"Reimbursement {reimbursement.protocol_number} auto-approved - R$ {approved_amount}")
            return True

        # Auto-approve medications <= R$ 200 (60% coverage)
        if reimbursement.expense_type == 'MEDICATION' and reimbursement.requested_amount <= Decimal('200.00'):
            has_prescription = reimbursement.documents.filter(document_type='PRESCRIPTION').exists()

            if has_prescription:
                coverage_percentage = Decimal('0.60')
                approved_amount = reimbursement.requested_amount * coverage_percentage

                reimbursement.status = 'APPROVED'
                reimbursement.approved_amount = approved_amount
                reimbursement.analysis_date = timezone.now()
                reimbursement.notes = f'Auto-aprovado (cobertura de {int(coverage_percentage * 100)}%)'
                reimbursement.save()

                send_notification.delay(
                    beneficiary_id=reimbursement.beneficiary.id,
                    title="Reembolso Aprovado",
                    message=f"Seu pedido de reembolso {reimbursement.protocol_number} foi aprovado! Valor: R$ {approved_amount:.2f}",
                    notification_type='REIMBURSEMENT',
                    priority='HIGH',
                    data={'reimbursement_id': reimbursement.id, 'approved_amount': float(approved_amount)}
                )

                logger.info(f"Reimbursement {reimbursement.protocol_number} auto-approved - R$ {approved_amount}")
                return True

        # For high amounts or complex cases, keep as pending for manual review
        send_notification.delay(
            beneficiary_id=reimbursement.beneficiary.id,
            title="Reembolso em Análise",
            message=f"Seu pedido de reembolso {reimbursement.protocol_number} está sendo analisado por nossa equipe",
            notification_type='REIMBURSEMENT',
            data={'reimbursement_id': reimbursement.id}
        )

        logger.info(f"Reimbursement {reimbursement.protocol_number} requires manual review")
        return False

    except ReimbursementRequest.DoesNotExist:
        logger.error(f"Reimbursement {reimbursement_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error analyzing reimbursement: {str(e)}")
        return False


@shared_task
def send_pending_reimbursement_reminders():
    """
    Send reminders for reimbursements pending for more than 72 hours
    """
    from apps.reimbursements.models import ReimbursementRequest
    from apps.notifications.tasks import send_notification

    cutoff_date = timezone.now() - timedelta(hours=72)

    pending_reimbursements = ReimbursementRequest.objects.filter(
        status='IN_ANALYSIS',
        request_date__lt=cutoff_date
    ).select_related('beneficiary')

    count = 0
    for reimbursement in pending_reimbursements:
        send_notification.delay(
            beneficiary_id=reimbursement.beneficiary.id,
            title="Reembolso em Análise",
            message=f"Seu pedido de reembolso {reimbursement.protocol_number} está sendo analisado. Em breve você receberá uma resposta.",
            notification_type='REIMBURSEMENT',
            data={'reimbursement_id': reimbursement.id}
        )
        count += 1

    logger.info(f"Sent {count} pending reimbursement reminders")
    return count
