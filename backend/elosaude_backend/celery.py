"""
Celery configuration for elosaude_backend project.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elosaude_backend.settings')

app = Celery('elosaude_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure Celery Beat schedule
app.conf.beat_schedule = {
    # ============ NOTIFICATIONS ============
    # Send notification reminders every day at 9 AM
    'send-appointment-reminders': {
        'task': 'apps.notifications.tasks.send_appointment_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    # Cleanup old notifications every day at 2 AM
    'cleanup-old-notifications': {
        'task': 'apps.notifications.tasks.cleanup_old_notifications',
        'schedule': crontab(hour=2, minute=0),
    },

    # ============ GUIDES ============
    # Check expired guides every hour
    'check-expired-guides': {
        'task': 'apps.guides.tasks.check_expired_guides',
        'schedule': crontab(minute=0),
    },
    # Send pending guide reminders every day at 10 AM
    'send-pending-guide-reminders': {
        'task': 'apps.guides.tasks.send_pending_guide_reminders',
        'schedule': crontab(hour=10, minute=0),
    },

    # ============ REIMBURSEMENTS ============
    # Process pending reimbursements every 6 hours
    'process-pending-reimbursements': {
        'task': 'apps.reimbursements.tasks.process_pending_reimbursements',
        'schedule': crontab(minute=0, hour='*/6'),
    },
    # Send pending reimbursement reminders every day at 11 AM
    'send-pending-reimbursement-reminders': {
        'task': 'apps.reimbursements.tasks.send_pending_reimbursement_reminders',
        'schedule': crontab(hour=11, minute=0),
    },

    # ============ FINANCIAL ============
    # Generate monthly invoices on the 1st of each month at 1 AM
    'generate-monthly-invoices': {
        'task': 'apps.financial.tasks.generate_monthly_invoices',
        'schedule': crontab(hour=1, minute=0, day_of_month=1),
    },
    # Check overdue invoices every day at 8 AM
    'check-overdue-invoices': {
        'task': 'apps.financial.tasks.check_overdue_invoices',
        'schedule': crontab(hour=8, minute=0),
    },
    # Send invoice reminders every day at 9 AM
    'send-invoice-reminders': {
        'task': 'apps.financial.tasks.send_invoice_reminders',
        'schedule': crontab(hour=9, minute=0),
    },
    # Generate annual tax statements in January (2nd day at 3 AM)
    'generate-annual-tax-statements': {
        'task': 'apps.financial.tasks.generate_annual_tax_statements',
        'schedule': crontab(hour=3, minute=0, day_of_month=2, month_of_year=1),
    },
}

# Celery configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery."""
    print(f'Request: {self.request!r}')
