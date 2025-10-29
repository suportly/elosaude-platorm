from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.beneficiaries.models import Beneficiary
from apps.providers.models import AccreditedProvider
from apps.guides.models import TISSGuide, Procedure, GuideProcedure


class Command(BaseCommand):
    help = 'Populate database with sample guides'

    def handle(self, *args, **options):
        # Get or create a provider
        provider, _ = AccreditedProvider.objects.get_or_create(
            cnpj='12345678000190',
            defaults={
                'name': 'Clínica Exemplo LTDA',
                'trade_name': 'Clínica Exemplo',
                'provider_type': 'CLINIC',
                'phone': '11999999999',
                'email': 'contato@clinicaexemplo.com.br',
                'address': 'Rua Exemplo, 123',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01234567',
                'is_active': True,
            }
        )

        # Get or create procedures
        procedure1, _ = Procedure.objects.get_or_create(
            code='10101012',
            defaults={
                'name': 'Consulta médica em consultório',
                'category': 'CONSULTATION',
                'base_price': 150.00,
                'requires_authorization': False,
                'is_active': True,
            }
        )

        procedure2, _ = Procedure.objects.get_or_create(
            code='40301010',
            defaults={
                'name': 'Hemograma completo',
                'category': 'EXAM',
                'base_price': 80.00,
                'requires_authorization': False,
                'is_active': True,
            }
        )

        # Get beneficiaries
        beneficiaries = Beneficiary.objects.all()[:2]

        if not beneficiaries:
            self.stdout.write(self.style.ERROR('No beneficiaries found'))
            return

        guide_count = 0
        for beneficiary in beneficiaries:
            # Create authorized guide
            guide1 = TISSGuide.objects.create(
                beneficiary=beneficiary,
                provider=provider,
                guide_type='CONSULTATION',
                guide_number=f'G{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                protocol_number=f'P{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                expiry_date=timezone.now().date() + timedelta(days=25),
                status='AUTHORIZED',
                authorization_date=timezone.now() - timedelta(days=4),
                diagnosis='Hipertensão arterial',
                requesting_physician_name='Dr. João Silva',
                requesting_physician_crm='123456',
                observations='Guia autorizada para consulta médica'
            )
            GuideProcedure.objects.create(
                guide=guide1,
                procedure=procedure1,
                quantity=1,
                unit_price=150.00,
                total_price=150.00
            )
            guide_count += 1

            # Create pending guide
            guide2 = TISSGuide.objects.create(
                beneficiary=beneficiary,
                provider=provider,
                guide_type='SP_SADT',
                guide_number=f'G{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                protocol_number=f'P{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                status='PENDING',
                diagnosis='Investigação de anemia',
                requesting_physician_name='Dr. João Silva',
                requesting_physician_crm='123456',
                observations='Aguardando autorização para exames'
            )
            GuideProcedure.objects.create(
                guide=guide2,
                procedure=procedure2,
                quantity=1,
                unit_price=80.00,
                total_price=80.00
            )
            guide_count += 1

            # Create in analysis guide
            guide3 = TISSGuide.objects.create(
                beneficiary=beneficiary,
                provider=provider,
                guide_type='CONSULTATION',
                guide_number=f'G{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                protocol_number=f'P{timezone.now().strftime("%Y%m%d")}{guide_count:04d}',
                status='IN_ANALYSIS',
                diagnosis='Diabetes mellitus tipo 2',
                requesting_physician_name='Dra. Maria Santos',
                requesting_physician_crm='654321',
                observations='Em análise pela operadora'
            )
            GuideProcedure.objects.create(
                guide=guide3,
                procedure=procedure1,
                quantity=1,
                unit_price=150.00,
                total_price=150.00
            )
            guide_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully created {guide_count} guides'))
