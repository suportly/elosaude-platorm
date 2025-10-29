from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def check_expired_guides():
    """
    Check and update status of expired guides
    Runs every hour
    """
    from apps.guides.models import TISSGuide
    from apps.notifications.tasks import send_notification
    
    try:
        # Find authorized guides that have expired
        expired_guides = TISSGuide.objects.filter(
            status='AUTHORIZED',
            expiry_date__lt=timezone.now().date()
        )
        
        count = 0
        for guide in expired_guides:
            guide.status = 'EXPIRED'
            guide.save(update_fields=['status', 'updated_at'])
            
            # Send notification to beneficiary
            send_notification.delay(
                beneficiary_id=guide.beneficiary.id,
                title="Guia Expirada",
                message=f"A guia {guide.guide_number} expirou em {guide.expiry_date.strftime('%d/%m/%Y')}",
                notification_type='GUIDE_AUTHORIZATION',
                data={'guide_id': guide.id, 'guide_number': guide.guide_number}
            )
            count += 1
        
        logger.info(f"Updated {count} expired guides")
        return count
        
    except Exception as e:
        logger.error(f"Error checking expired guides: {str(e)}")
        return 0


@shared_task
def process_guide_authorization(guide_id):
    """
    Process guide authorization automatically
    Business rules for auto-approval
    """
    from apps.guides.models import TISSGuide, GuideProcedure
    from apps.notifications.tasks import send_notification
    
    try:
        guide = TISSGuide.objects.select_related('beneficiary', 'provider').get(id=guide_id)
        
        # Check if beneficiary is active
        if guide.beneficiary.status != 'ACTIVE':
            guide.status = 'DENIED'
            guide.denial_reason = 'Beneficiário inativo'
            guide.save()
            
            send_notification.delay(
                beneficiary_id=guide.beneficiary.id,
                title="Guia Negada",
                message=f"A guia {guide.guide_number} foi negada: Beneficiário inativo",
                notification_type='GUIDE_AUTHORIZATION',
                priority='HIGH',
                data={'guide_id': guide.id}
            )
            return False
        
        # Check if provider is active
        if not guide.provider.is_active:
            guide.status = 'DENIED'
            guide.denial_reason = 'Prestador não credenciado'
            guide.save()
            
            send_notification.delay(
                beneficiary_id=guide.beneficiary.id,
                title="Guia Negada",
                message=f"A guia {guide.guide_number} foi negada: Prestador não credenciado",
                notification_type='GUIDE_AUTHORIZATION',
                priority='HIGH'
            )
            return False
        
        # Auto-approve consultations and emergency
        if guide.guide_type in ['CONSULTATION', 'EMERGENCY']:
            guide.status = 'AUTHORIZED'
            guide.authorization_date = timezone.now()
            guide.expiry_date = timezone.now().date() + timedelta(days=30)
            guide.save()
            
            # Auto-authorize all procedures
            GuideProcedure.objects.filter(guide=guide).update(
                authorized_quantity=models.F('quantity')
            )
            
            send_notification.delay(
                beneficiary_id=guide.beneficiary.id,
                title="Guia Autorizada",
                message=f"Sua guia {guide.guide_number} foi autorizada automaticamente!",
                notification_type='GUIDE_AUTHORIZATION',
                priority='HIGH',
                data={'guide_id': guide.id}
            )
            
            # TODO: Generate PDF
            # generate_guide_pdf.delay(guide_id)
            
            logger.info(f"Guide {guide.guide_number} auto-approved")
            return True
        
        # For SP_SADT and HOSPITALIZATION, keep as pending for manual review
        logger.info(f"Guide {guide.guide_number} requires manual review")
        return False
        
    except TISSGuide.DoesNotExist:
        logger.error(f"Guide {guide_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error processing guide authorization: {str(e)}")
        return False


@shared_task
def send_pending_guide_reminders():
    """
    Send reminders for guides pending for more than 48 hours
    """
    from apps.guides.models import TISSGuide
    from apps.notifications.tasks import send_notification
    
    cutoff_date = timezone.now() - timedelta(hours=48)
    
    pending_guides = TISSGuide.objects.filter(
        status='PENDING',
        request_date__lt=cutoff_date
    ).select_related('beneficiary')
    
    count = 0
    for guide in pending_guides:
        send_notification.delay(
            beneficiary_id=guide.beneficiary.id,
            title="Guia em Análise",
            message=f"Sua guia {guide.guide_number} está sendo analisada. Em breve você receberá uma resposta.",
            notification_type='GUIDE_AUTHORIZATION',
            data={'guide_id': guide.id}
        )
        count += 1
    
    logger.info(f"Sent {count} pending guide reminders")
    return count


@shared_task
def generate_guide_pdf_task(guide_id):
    """
    Generate PDF for a guide
    """
    from apps.guides.models import TISSGuide
    from apps.guides.pdf import generate_guide_pdf
    from django.core.files.base import ContentFile
    
    try:
        guide = TISSGuide.objects.select_related(
            'beneficiary',
            'provider',
            'beneficiary__health_plan'
        ).prefetch_related('guideprocedure_set__procedure').get(id=guide_id)
        
        # Generate PDF
        pdf_bytes = generate_guide_pdf(guide)
        
        # Save to guide
        filename = f"guia_{guide.guide_number}.pdf"
        guide.guide_pdf.save(filename, ContentFile(pdf_bytes), save=True)
        
        logger.info(f"PDF generated for guide {guide.guide_number}")
        return True
        
    except TISSGuide.DoesNotExist:
        logger.error(f"Guide {guide_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error generating guide PDF: {str(e)}")
        return False
