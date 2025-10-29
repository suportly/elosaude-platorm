from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.beneficiaries.models import Beneficiary
from apps.reimbursements.models import ReimbursementRequest


class Command(BaseCommand):
    help = 'Populate database with sample reimbursements'

    def handle(self, *args, **options):
        beneficiaries = Beneficiary.objects.all()[:2]

        if not beneficiaries:
            self.stdout.write(self.style.ERROR('No beneficiaries found'))
            return

        reimbursement_count = 0
        bank_details = {
            "bank": "001",
            "agency": "1234",
            "account": "56789-0",
            "account_type": "checking"
        }

        for beneficiary in beneficiaries:
            # Create approved reimbursement
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                protocol_number=f'R{timezone.now().strftime("%Y%m%d")}{reimbursement_count:04d}',
                expense_type='CONSULTATION',
                provider_name='Clínica São Lucas',
                provider_cnpj_cpf='12345678000190',
                service_date=timezone.now().date() - timedelta(days=20),
                service_description='Consulta com cardiologista',
                requested_amount=250.00,
                approved_amount=250.00,
                bank_details=bank_details,
                status='APPROVED',
                notes='Reembolso aprovado integralmente'
            )
            reimbursement_count += 1

            # Create in analysis reimbursement
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                protocol_number=f'R{timezone.now().strftime("%Y%m%d")}{reimbursement_count:04d}',
                expense_type='EXAM',
                provider_name='Laboratório Vida',
                provider_cnpj_cpf='98765432000111',
                service_date=timezone.now().date() - timedelta(days=5),
                service_description='Exames de sangue',
                requested_amount=180.00,
                bank_details=bank_details,
                status='IN_ANALYSIS',
                notes='Aguardando análise de documentos'
            )
            reimbursement_count += 1

            # Create partially approved reimbursement
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                protocol_number=f'R{timezone.now().strftime("%Y%m%d")}{reimbursement_count:04d}',
                expense_type='MEDICATION',
                provider_name='Farmácia Popular',
                provider_cnpj_cpf='11122233000144',
                service_date=timezone.now().date() - timedelta(days=10),
                service_description='Medicamentos prescritos',
                requested_amount=350.00,
                approved_amount=280.00,
                bank_details=bank_details,
                status='PARTIALLY_APPROVED',
                notes='Aprovado parcialmente conforme cobertura do plano'
            )
            reimbursement_count += 1

            # Create denied reimbursement
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                protocol_number=f'R{timezone.now().strftime("%Y%m%d")}{reimbursement_count:04d}',
                expense_type='OTHER',
                provider_name='Clínica Estética',
                provider_cnpj_cpf='55566677000188',
                service_date=timezone.now().date() - timedelta(days=30),
                service_description='Procedimento estético',
                requested_amount=500.00,
                approved_amount=0.00,
                bank_details=bank_details,
                status='DENIED',
                denial_reason='Procedimento não coberto pelo plano'
            )
            reimbursement_count += 1

            # Create paid reimbursement
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                protocol_number=f'R{timezone.now().strftime("%Y%m%d")}{reimbursement_count:04d}',
                expense_type='CONSULTATION',
                provider_name='Clínica Médica Central',
                provider_cnpj_cpf='33344455000166',
                service_date=timezone.now().date() - timedelta(days=45),
                service_description='Consulta com ortopedista',
                requested_amount=300.00,
                approved_amount=300.00,
                bank_details=bank_details,
                status='PAID',
                notes='Reembolso pago em conta bancária'
            )
            reimbursement_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {reimbursement_count} reimbursements'))
