from celery import shared_task
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


@shared_task
def generate_monthly_invoices():
    """
    Generate monthly invoices for all active beneficiaries
    Runs on the 1st day of each month
    """
    from apps.financial.models import Invoice
    from apps.beneficiaries.models import Beneficiary
    from apps.notifications.tasks import send_notification

    try:
        # Get current month/year
        now = timezone.now()
        reference_month = now.strftime('%m/%Y')

        # Due date: 10th of current month
        due_date = datetime(now.year, now.month, 10).date()

        # Get all active beneficiaries (holders only)
        active_beneficiaries = Beneficiary.objects.filter(
            status='ACTIVE',
            beneficiary_type='HOLDER'
        ).select_related('health_plan')

        count = 0
        for beneficiary in active_beneficiaries:
            # Check if invoice already exists for this month
            existing_invoice = Invoice.objects.filter(
                beneficiary=beneficiary,
                reference_month=reference_month
            ).exists()

            if existing_invoice:
                logger.info(f"Invoice for {beneficiary.full_name} already exists for {reference_month}")
                continue

            # Calculate invoice amount from health plan
            health_plan = beneficiary.health_plan
            amount = health_plan.monthly_price if health_plan else Decimal('500.00')

            # Count dependents to add to invoice
            dependents_count = Beneficiary.objects.filter(
                holder=beneficiary,
                status='ACTIVE'
            ).count()

            # Add dependent costs (usually 50% of holder cost per dependent)
            dependent_amount = amount * Decimal('0.50') * dependents_count
            total_amount = amount + dependent_amount

            # Create invoice
            invoice = Invoice.objects.create(
                beneficiary=beneficiary,
                reference_month=reference_month,
                amount=total_amount,
                due_date=due_date,
                status='OPEN'
            )

            # Send notification
            send_notification.delay(
                beneficiary_id=beneficiary.id,
                title="Nova Fatura Disponível",
                message=f"Sua fatura de {reference_month} no valor de R$ {total_amount:.2f} está disponível. Vencimento: {due_date.strftime('%d/%m/%Y')}",
                notification_type='INVOICE',
                priority='MEDIUM',
                data={
                    'invoice_id': invoice.id,
                    'amount': float(total_amount),
                    'due_date': due_date.isoformat()
                }
            )

            count += 1
            logger.info(f"Invoice generated for {beneficiary.full_name}: R$ {total_amount}")

        logger.info(f"Generated {count} monthly invoices for {reference_month}")
        return count

    except Exception as e:
        logger.error(f"Error generating monthly invoices: {str(e)}")
        return 0


@shared_task
def check_overdue_invoices():
    """
    Check and notify about overdue invoices
    Runs daily
    """
    from apps.financial.models import Invoice
    from apps.notifications.tasks import send_notification

    try:
        today = timezone.now().date()

        # Update status of open invoices that are now overdue
        overdue_invoices = Invoice.objects.filter(
            status='OPEN',
            due_date__lt=today
        ).select_related('beneficiary')

        count = 0
        for invoice in overdue_invoices:
            # Update status
            invoice.status = 'OVERDUE'
            invoice.save(update_fields=['status', 'updated_at'])

            # Calculate days overdue
            days_overdue = (today - invoice.due_date).days

            # Send notification on specific days (1, 3, 7, 15, 30)
            if days_overdue in [1, 3, 7, 15, 30]:
                send_notification.delay(
                    beneficiary_id=invoice.beneficiary.id,
                    title="Fatura Vencida",
                    message=f"Sua fatura de {invoice.reference_month} está vencida há {days_overdue} dia(s). Valor: R$ {invoice.amount:.2f}",
                    notification_type='INVOICE',
                    priority='HIGH',
                    data={
                        'invoice_id': invoice.id,
                        'amount': float(invoice.amount),
                        'days_overdue': days_overdue
                    }
                )

            count += 1

        logger.info(f"Updated {count} overdue invoices")
        return count

    except Exception as e:
        logger.error(f"Error checking overdue invoices: {str(e)}")
        return 0


@shared_task
def process_payment(payment_id):
    """
    Process a specific payment
    Updates invoice status and sends confirmation
    """
    from apps.financial.models import PaymentHistory, Invoice
    from apps.notifications.tasks import send_notification

    try:
        payment = PaymentHistory.objects.select_related('invoice', 'invoice__beneficiary').get(id=payment_id)
        invoice = payment.invoice

        # Check if payment amount matches invoice amount
        if payment.amount_paid >= invoice.amount:
            # Full payment
            invoice.status = 'PAID'
            invoice.payment_date = payment.payment_date
            invoice.save(update_fields=['status', 'payment_date', 'updated_at'])

            send_notification.delay(
                beneficiary_id=invoice.beneficiary.id,
                title="Pagamento Confirmado",
                message=f"Seu pagamento da fatura {invoice.reference_month} foi confirmado! Valor: R$ {payment.amount_paid:.2f}",
                notification_type='INVOICE',
                priority='MEDIUM',
                data={
                    'invoice_id': invoice.id,
                    'payment_id': payment.id,
                    'amount_paid': float(payment.amount_paid)
                }
            )

            logger.info(f"Payment processed for invoice {invoice.id}: R$ {payment.amount_paid}")
            return True
        else:
            # Partial payment - notify about remaining amount
            remaining = invoice.amount - payment.amount_paid

            send_notification.delay(
                beneficiary_id=invoice.beneficiary.id,
                title="Pagamento Parcial Recebido",
                message=f"Recebemos seu pagamento parcial de R$ {payment.amount_paid:.2f}. Valor restante: R$ {remaining:.2f}",
                notification_type='INVOICE',
                priority='MEDIUM',
                data={
                    'invoice_id': invoice.id,
                    'payment_id': payment.id,
                    'amount_paid': float(payment.amount_paid),
                    'remaining': float(remaining)
                }
            )

            logger.info(f"Partial payment processed for invoice {invoice.id}: R$ {payment.amount_paid}")
            return False

    except PaymentHistory.DoesNotExist:
        logger.error(f"Payment {payment_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error processing payment: {str(e)}")
        return False


@shared_task
def send_invoice_reminders():
    """
    Send reminders for invoices due in 3 days
    Runs daily
    """
    from apps.financial.models import Invoice
    from apps.notifications.tasks import send_notification

    try:
        # Get invoices due in 3 days
        reminder_date = timezone.now().date() + timedelta(days=3)

        upcoming_invoices = Invoice.objects.filter(
            status='OPEN',
            due_date=reminder_date
        ).select_related('beneficiary')

        count = 0
        for invoice in upcoming_invoices:
            send_notification.delay(
                beneficiary_id=invoice.beneficiary.id,
                title="Lembrete de Vencimento",
                message=f"Sua fatura de {invoice.reference_month} vence em 3 dias! Valor: R$ {invoice.amount:.2f}",
                notification_type='INVOICE',
                priority='MEDIUM',
                data={
                    'invoice_id': invoice.id,
                    'amount': float(invoice.amount),
                    'due_date': invoice.due_date.isoformat()
                }
            )
            count += 1

        logger.info(f"Sent {count} invoice reminders")
        return count

    except Exception as e:
        logger.error(f"Error sending invoice reminders: {str(e)}")
        return 0


@shared_task
def generate_annual_tax_statements():
    """
    Generate annual tax statements for all beneficiaries
    Runs in January for the previous year
    """
    from apps.financial.models import TaxStatement, Invoice
    from apps.beneficiaries.models import Beneficiary
    from apps.notifications.tasks import send_notification

    try:
        # Get previous year
        year = timezone.now().year - 1

        # Get all beneficiaries who had invoices last year
        beneficiaries_with_invoices = Beneficiary.objects.filter(
            invoices__created_at__year=year
        ).distinct()

        count = 0
        for beneficiary in beneficiaries_with_invoices:
            # Check if statement already exists
            existing_statement = TaxStatement.objects.filter(
                beneficiary=beneficiary,
                year=year
            ).exists()

            if existing_statement:
                continue

            # Get all paid invoices for the year
            invoices = Invoice.objects.filter(
                beneficiary=beneficiary,
                status='PAID',
                payment_date__year=year
            )

            if not invoices.exists():
                continue

            # Calculate totals
            total_paid = sum(invoice.amount for invoice in invoices)

            # Calculate monthly breakdown
            monthly_breakdown = {}
            for invoice in invoices:
                month = invoice.payment_date.strftime('%m')
                monthly_breakdown[month] = float(invoice.amount)

            # Create tax statement
            tax_statement = TaxStatement.objects.create(
                beneficiary=beneficiary,
                year=year,
                total_paid=total_paid,
                deductible_amount=total_paid,  # All health plan payments are deductible
                monthly_breakdown=monthly_breakdown
            )

            # Send notification
            send_notification.delay(
                beneficiary_id=beneficiary.id,
                title="Informe de Rendimentos Disponível",
                message=f"Seu informe de rendimentos de {year} está disponível. Total: R$ {total_paid:.2f}",
                notification_type='TAX_STATEMENT',
                priority='MEDIUM',
                data={
                    'tax_statement_id': tax_statement.id,
                    'year': year,
                    'total_paid': float(total_paid)
                }
            )

            count += 1
            logger.info(f"Tax statement generated for {beneficiary.full_name} - {year}")

        logger.info(f"Generated {count} tax statements for {year}")
        return count

    except Exception as e:
        logger.error(f"Error generating tax statements: {str(e)}")
        return 0


@shared_task
def generate_invoice_pdf_task(invoice_id):
    """
    Generate PDF for an invoice
    """
    from apps.financial.models import Invoice
    from apps.financial.pdf import generate_invoice_pdf
    from django.core.files.base import ContentFile
    
    try:
        invoice = Invoice.objects.select_related(
            'beneficiary',
            'beneficiary__health_plan'
        ).get(id=invoice_id)
        
        # Generate PDF
        pdf_bytes = generate_invoice_pdf(invoice)
        
        # Save to invoice
        filename = f"fatura_{invoice.reference_month.replace('/', '-')}.pdf"
        invoice.invoice_pdf.save(filename, ContentFile(pdf_bytes), save=True)
        
        logger.info(f"PDF generated for invoice {invoice.reference_month}")
        return True
        
    except Invoice.DoesNotExist:
        logger.error(f"Invoice {invoice_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error generating invoice PDF: {str(e)}")
        return False


@shared_task
def generate_tax_statement_pdf_task(statement_id):
    """
    Generate PDF for a tax statement
    """
    from apps.financial.models import TaxStatement
    from apps.financial.pdf import generate_tax_statement_pdf
    from django.core.files.base import ContentFile
    
    try:
        statement = TaxStatement.objects.select_related(
            'beneficiary'
        ).get(id=statement_id)
        
        # Generate PDF
        pdf_bytes = generate_tax_statement_pdf(statement)
        
        # Save to statement
        filename = f"declaracao_ir_{statement.year}.pdf"
        statement.statement_pdf.save(filename, ContentFile(pdf_bytes), save=True)
        
        logger.info(f"PDF generated for tax statement {statement.year}")
        return True
        
    except TaxStatement.DoesNotExist:
        logger.error(f"Tax statement {statement_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error generating tax statement PDF: {str(e)}")
        return False
