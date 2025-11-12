from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal
from apps.beneficiaries.models import Beneficiary
from apps.providers.models import AccreditedProvider, Specialty
from apps.guides.models import TISSGuide, Procedure, GuideProcedure
from apps.reimbursements.models import ReimbursementRequest
from apps.notifications.models import Notification
from apps.health_records.models import HealthRecord, Vaccination
from apps.financial.models import Invoice, TaxStatement
import random


class Command(BaseCommand):
    help = 'Populate database with comprehensive data for user with CPF 12345678900'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation even if data exists',
        )

    def handle(self, *args, **options):
        try:
            beneficiary = Beneficiary.objects.get(cpf='12345678900')
        except Beneficiary.DoesNotExist:
            self.stdout.write(self.style.ERROR('Beneficiário com CPF 12345678900 não encontrado'))
            return

        # Check if data already exists
        if HealthRecord.objects.filter(beneficiary=beneficiary).exists() and not options['force']:
            self.stdout.write(self.style.WARNING('Dados já existem para este beneficiário. Use --force para recriar.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Populando dados para: {beneficiary.full_name}'))

        # 1. Create general data (providers, specialties, procedures)
        self.create_general_data()

        # 2. Create specific user data
        self.create_health_records(beneficiary)
        self.create_vaccinations(beneficiary)
        self.create_guides(beneficiary)
        self.create_reimbursements(beneficiary)
        self.create_invoices(beneficiary)
        self.create_tax_statements(beneficiary)
        self.create_notifications(beneficiary)

        self.stdout.write(self.style.SUCCESS('✅ Dados criados com sucesso!'))

    def create_general_data(self):
        """Create general data: providers, specialties, procedures"""
        self.stdout.write('Criando dados gerais...')

        # Specialties
        specialties_data = [
            ('Cardiologia', 'Especialidade focada no sistema cardiovascular'),
            ('Ortopedia', 'Especialidade focada no sistema músculo-esquelético'),
            ('Dermatologia', 'Especialidade focada na pele e anexos'),
            ('Pediatria', 'Especialidade focada em crianças e adolescentes'),
            ('Ginecologia', 'Especialidade focada na saúde da mulher'),
            ('Clínica Médica', 'Especialidade generalista'),
        ]

        for name, description in specialties_data:
            Specialty.objects.get_or_create(
                name=name,
                defaults={'description': description, 'is_active': True}
            )

        # Providers
        providers_data = [
            {
                'name': 'Hospital São Lucas',
                'trade_name': 'Hospital São Lucas',
                'cnpj': '11222333000144',
                'provider_type': 'HOSPITAL',
                'phone': '1133334444',
                'email': 'contato@saolucas.com.br',
                'address': 'Av. Paulista, 1500',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01310100',
            },
            {
                'name': 'Clínica Vida Saudável',
                'trade_name': 'Vida Saudável',
                'cnpj': '22333444000155',
                'provider_type': 'CLINIC',
                'phone': '1144445555',
                'email': 'contato@vidasaudavel.com.br',
                'address': 'Rua Augusta, 2500',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01412100',
            },
            {
                'name': 'Laboratório Exame Certo',
                'trade_name': 'Exame Certo',
                'cnpj': '33444555000166',
                'provider_type': 'LABORATORY',
                'phone': '1155556666',
                'email': 'contato@examecerto.com.br',
                'address': 'Rua Consolação, 3000',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01416000',
            },
            {
                'name': 'Dr. João Silva - Cardiologista',
                'trade_name': 'Dr. João Silva',
                'provider_type': 'DOCTOR',
                'crm': '123456',
                'phone': '11999998888',
                'email': 'dr.joao@cardio.com',
                'address': 'Av. Brigadeiro Faria Lima, 1500',
                'city': 'São Paulo',
                'state': 'SP',
                'zip_code': '01452000',
            },
        ]

        for provider_data in providers_data:
            provider, created = AccreditedProvider.objects.get_or_create(
                cnpj=provider_data.get('cnpj', None) if provider_data.get('cnpj') else None,
                crm=provider_data.get('crm', None) if provider_data.get('crm') else None,
                defaults=provider_data
            )
            if created and provider_data['provider_type'] == 'DOCTOR':
                cardio = Specialty.objects.get(name='Cardiologia')
                provider.specialties.add(cardio)

        # Procedures
        procedures_data = [
            ('10101012', 'Consulta médica em consultório', 'CONSULTATION', 150.00),
            ('10101020', 'Consulta médica domiciliar', 'CONSULTATION', 250.00),
            ('40301010', 'Hemograma completo', 'EXAM', 80.00),
            ('40301028', 'Glicemia de jejum', 'EXAM', 30.00),
            ('40301036', 'Colesterol total', 'EXAM', 40.00),
            ('40301044', 'Colesterol HDL', 'EXAM', 45.00),
            ('40301052', 'Colesterol LDL', 'EXAM', 45.00),
            ('40801098', 'Eletrocardiograma', 'EXAM', 120.00),
            ('40801101', 'Ecocardiograma transtorácico', 'EXAM', 350.00),
        ]

        for code, name, category, price in procedures_data:
            Procedure.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'category': category,
                    'base_price': price,
                    'requires_authorization': category != 'CONSULTATION',
                    'is_active': True,
                }
            )

        self.stdout.write(self.style.SUCCESS('  ✓ Dados gerais criados'))

    def create_health_records(self, beneficiary):
        """Create health records for beneficiary"""
        self.stdout.write('Criando registros de saúde...')

        provider_hospital = AccreditedProvider.objects.get(cnpj='11222333000144')
        provider_clinic = AccreditedProvider.objects.get(cnpj='22333444000155')
        provider_doctor = AccreditedProvider.objects.filter(provider_type='DOCTOR').first()

        records_data = [
            {
                'record_type': 'CONSULTATION',
                'date': date.today() - timedelta(days=90),
                'provider': provider_doctor,
                'diagnosis': 'Hipertensão arterial sistêmica',
                'description': 'Paciente compareceu para consulta de rotina. PA: 140x90 mmHg. Solicitados exames complementares.',
                'prescribed_medications': 'Losartana 50mg - 1x ao dia\nHidroclorotiazida 25mg - 1x ao dia',
            },
            {
                'record_type': 'EXAM',
                'date': date.today() - timedelta(days=85),
                'provider': AccreditedProvider.objects.get(cnpj='33444555000166'),
                'diagnosis': 'Exames laboratoriais de rotina',
                'description': 'Hemograma completo, glicemia, colesterol total e frações.',
                'prescribed_medications': '',
            },
            {
                'record_type': 'CONSULTATION',
                'date': date.today() - timedelta(days=60),
                'provider': provider_doctor,
                'diagnosis': 'Hipertensão arterial controlada',
                'description': 'Retorno com exames. PA: 130x85 mmHg. Exames dentro da normalidade. Manter medicação.',
                'prescribed_medications': 'Losartana 50mg - 1x ao dia\nHidroclorotiazida 25mg - 1x ao dia',
            },
            {
                'record_type': 'CONSULTATION',
                'date': date.today() - timedelta(days=180),
                'provider': provider_clinic,
                'diagnosis': 'Dor lombar aguda',
                'description': 'Paciente com dor lombar há 3 dias, sem irradiação. Exame físico: dor à palpação de região lombar.',
                'prescribed_medications': 'Ibuprofeno 600mg - 8/8h por 5 dias\nRelaxante muscular - 12/12h por 5 dias',
            },
            {
                'record_type': 'EMERGENCY',
                'date': date.today() - timedelta(days=365),
                'provider': provider_hospital,
                'diagnosis': 'Crise hipertensiva',
                'description': 'Paciente deu entrada no PS com PA: 180x110 mmHg, cefaleia intensa. Medicado e liberado.',
                'prescribed_medications': 'Captopril 25mg sublingual\nDipirona 1g EV',
            },
        ]

        for record_data in records_data:
            HealthRecord.objects.create(
                beneficiary=beneficiary,
                **record_data
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(records_data)} registros de saúde criados'))

    def create_vaccinations(self, beneficiary):
        """Create vaccination records"""
        self.stdout.write('Criando registros de vacinação...')

        provider_clinic = AccreditedProvider.objects.get(cnpj='22333444000155')

        vaccinations_data = [
            {
                'vaccine_name': 'Influenza (Gripe)',
                'dose': 'Dose Anual 2024',
                'batch_number': 'INF2024001',
                'date_administered': date(2024, 4, 15),
                'next_dose_date': date(2025, 4, 15),
                'notes': 'Vacina contra gripe sazonal',
            },
            {
                'vaccine_name': 'COVID-19',
                'dose': '3ª Dose (Reforço)',
                'batch_number': 'COV2023R03',
                'date_administered': date(2023, 9, 20),
                'next_dose_date': None,
                'notes': 'Dose de reforço - Pfizer',
            },
            {
                'vaccine_name': 'Hepatite B',
                'dose': '3ª Dose',
                'batch_number': 'HEPB202201',
                'date_administered': date(2022, 11, 10),
                'next_dose_date': None,
                'notes': 'Esquema completo',
            },
            {
                'vaccine_name': 'Tétano e Difteria (dT)',
                'dose': 'Reforço',
                'batch_number': 'TET2021R01',
                'date_administered': date(2021, 6, 5),
                'next_dose_date': date(2031, 6, 5),
                'notes': 'Reforço a cada 10 anos',
            },
            {
                'vaccine_name': 'Febre Amarela',
                'dose': 'Dose Única',
                'batch_number': 'FA2020001',
                'date_administered': date(2020, 1, 20),
                'next_dose_date': None,
                'notes': 'Válida por toda vida',
            },
        ]

        for vacc_data in vaccinations_data:
            Vaccination.objects.create(
                beneficiary=beneficiary,
                provider=provider_clinic,
                **vacc_data
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(vaccinations_data)} vacinas registradas'))

    def create_guides(self, beneficiary):
        """Create TISS guides"""
        self.stdout.write('Criando guias médicas...')

        provider_hospital = AccreditedProvider.objects.get(cnpj='11222333000144')
        provider_clinic = AccreditedProvider.objects.get(cnpj='22333444000155')

        procedure_consultation = Procedure.objects.get(code='10101012')
        procedure_ecg = Procedure.objects.get(code='40801098')
        procedure_echo = Procedure.objects.get(code='40801101')
        procedure_hemogram = Procedure.objects.get(code='40301010')

        # Get highest guide number to avoid collisions
        last_guide = TISSGuide.objects.order_by('-guide_number').first()
        start_num = 1
        if last_guide and last_guide.guide_number:
            try:
                start_num = int(last_guide.guide_number[-4:]) + 1
            except:
                start_num = 1

        guides_data = [
            {
                'guide_type': 'CONSULTATION',
                'guide_number': f'G{timezone.now().strftime("%Y%m%d")}{start_num:04d}',
                'protocol_number': f'P{timezone.now().strftime("%Y%m%d")}{start_num:04d}',
                'provider': provider_clinic,
                'status': 'AUTHORIZED',
                'authorization_date': timezone.now() - timedelta(days=2),
                'expiry_date': timezone.now().date() + timedelta(days=28),
                'diagnosis': 'Hipertensão arterial sistêmica - acompanhamento',
                'requesting_physician_name': 'Dr. João Silva',
                'requesting_physician_crm': '123456',
                'observations': 'Consulta de retorno cardiologia',
                'procedures': [(procedure_consultation, 1, 150.00)],
            },
            {
                'guide_type': 'SP_SADT',
                'guide_number': f'G{timezone.now().strftime("%Y%m%d")}{start_num+1:04d}',
                'protocol_number': f'P{timezone.now().strftime("%Y%m%d")}{start_num+1:04d}',
                'provider': provider_hospital,
                'status': 'PENDING',
                'diagnosis': 'Avaliação cardiológica - HAS',
                'requesting_physician_name': 'Dr. João Silva',
                'requesting_physician_crm': '123456',
                'observations': 'Solicitação de ECG e Ecocardiograma',
                'procedures': [(procedure_ecg, 1, 120.00), (procedure_echo, 1, 350.00)],
            },
            {
                'guide_type': 'SP_SADT',
                'guide_number': f'G{timezone.now().strftime("%Y%m%d")}{start_num+2:04d}',
                'protocol_number': f'P{timezone.now().strftime("%Y%m%d")}{start_num+2:04d}',
                'provider': AccreditedProvider.objects.get(cnpj='33444555000166'),
                'status': 'AUTHORIZED',
                'authorization_date': timezone.now() - timedelta(days=5),
                'expiry_date': timezone.now().date() + timedelta(days=25),
                'diagnosis': 'Check-up de rotina',
                'requesting_physician_name': 'Dr. João Silva',
                'requesting_physician_crm': '123456',
                'observations': 'Exames laboratoriais de rotina',
                'procedures': [(procedure_hemogram, 1, 80.00)],
            },
        ]

        for guide_data in guides_data:
            procedures = guide_data.pop('procedures')
            guide = TISSGuide.objects.create(
                beneficiary=beneficiary,
                **guide_data
            )

            for procedure, quantity, price in procedures:
                GuideProcedure.objects.create(
                    guide=guide,
                    procedure=procedure,
                    quantity=quantity,
                    unit_price=price,
                    total_price=price * quantity
                )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(guides_data)} guias criadas'))

    def create_reimbursements(self, beneficiary):
        """Create reimbursement requests"""
        self.stdout.write('Criando solicitações de reembolso...')

        bank_details = {
            "bank": "033",
            "agency": "1234",
            "account": "56789-0",
            "account_type": "checking"
        }

        reimbursements_data = [
            {
                'protocol_number': f'R{timezone.now().strftime("%Y%m%d")}0001',
                'expense_type': 'CONSULTATION',
                'service_date': timezone.now().date() - timedelta(days=45),
                'service_description': 'Consulta com dermatologista particular',
                'provider_name': 'Dra. Maria Oliveira',
                'provider_cnpj_cpf': '12345678901',
                'requested_amount': Decimal('280.00'),
                'approved_amount': Decimal('280.00'),
                'status': 'PAID',
                'notes': 'Reembolso aprovado e pago',
            },
            {
                'protocol_number': f'R{timezone.now().strftime("%Y%m%d")}0002',
                'expense_type': 'EXAM',
                'service_date': timezone.now().date() - timedelta(days=20),
                'service_description': 'Ressonância magnética de coluna',
                'provider_name': 'Clínica de Imagem Total',
                'provider_cnpj_cpf': '44556677000188',
                'requested_amount': Decimal('850.00'),
                'approved_amount': Decimal('700.00'),
                'status': 'PARTIALLY_APPROVED',
                'notes': 'Aprovado parcialmente conforme tabela do plano',
            },
            {
                'protocol_number': f'R{timezone.now().strftime("%Y%m%d")}0003',
                'expense_type': 'MEDICATION',
                'service_date': timezone.now().date() - timedelta(days=10),
                'service_description': 'Medicamentos prescritos - anti-hipertensivos',
                'provider_name': 'Farmácia Saúde Total',
                'provider_cnpj_cpf': '55667788000199',
                'requested_amount': Decimal('320.00'),
                'status': 'IN_ANALYSIS',
                'notes': 'Documentação em análise',
            },
        ]

        for reimb_data in reimbursements_data:
            ReimbursementRequest.objects.create(
                beneficiary=beneficiary,
                bank_details=bank_details,
                **reimb_data
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(reimbursements_data)} reembolsos criados'))

    def create_invoices(self, beneficiary):
        """Create invoices"""
        self.stdout.write('Criando faturas...')

        # Create invoices for last 6 months
        for i in range(6):
            month_offset = i
            due_date = date.today().replace(day=10) - timedelta(days=30 * month_offset)
            ref_month = due_date.replace(day=1)

            if i < 2:  # Last 2 months - open
                status = 'OPEN'
                payment_date = None
            else:  # Older months - paid
                status = 'PAID'
                payment_date = due_date + timedelta(days=random.randint(-3, 5))

            Invoice.objects.create(
                beneficiary=beneficiary,
                reference_month=ref_month.strftime('%m/%Y'),
                due_date=due_date,
                amount=Decimal('450.00'),
                status=status,
                payment_date=payment_date
            )

        self.stdout.write(self.style.SUCCESS('  ✓ 6 faturas criadas'))

    def create_tax_statements(self, beneficiary):
        """Create tax statements"""
        self.stdout.write('Criando informes de IR...')

        current_year = date.today().year

        for year in [current_year - 1, current_year - 2]:
            monthly_breakdown = {f'{i:02d}': 450.00 for i in range(1, 13)}
            TaxStatement.objects.create(
                beneficiary=beneficiary,
                year=year,
                total_paid=Decimal('5400.00'),  # 12 * 450
                deductible_amount=Decimal('5400.00'),
                monthly_breakdown=monthly_breakdown
            )

        self.stdout.write(self.style.SUCCESS('  ✓ 2 informes de IR criados'))

    def create_notifications(self, beneficiary):
        """Create notifications"""
        self.stdout.write('Criando notificações...')

        notifications_data = [
            {
                'title': 'Guia Autorizada',
                'message': 'Sua guia para consulta cardiológica foi autorizada!',
                'notification_type': 'GUIDE_AUTHORIZATION',
                'priority': 'HIGH',
                'is_read': False,
                'created_at': timezone.now() - timedelta(hours=2),
            },
            {
                'title': 'Reembolso Aprovado',
                'message': 'Seu reembolso de R$ 280,00 foi aprovado e será pago em até 5 dias úteis.',
                'notification_type': 'REIMBURSEMENT_APPROVED',
                'priority': 'MEDIUM',
                'is_read': False,
                'created_at': timezone.now() - timedelta(days=1),
            },
            {
                'title': 'Vacina em Atraso',
                'message': 'Sua vacina contra gripe está atrasada. Agende sua dose!',
                'notification_type': 'GENERAL',
                'priority': 'MEDIUM',
                'is_read': True,
                'created_at': timezone.now() - timedelta(days=7),
            },
            {
                'title': 'Fatura Disponível',
                'message': f'Sua fatura de {date.today().strftime("%B/%Y")} já está disponível.',
                'notification_type': 'INVOICE_READY',
                'priority': 'LOW',
                'is_read': False,
                'created_at': timezone.now() - timedelta(days=3),
            },
            {
                'title': 'Lembrete: Consulta de Retorno',
                'message': 'Não esqueça de agendar sua consulta de retorno com Dr. João Silva.',
                'notification_type': 'GENERAL',
                'priority': 'MEDIUM',
                'is_read': True,
                'created_at': timezone.now() - timedelta(days=15),
            },
        ]

        for notif_data in notifications_data:
            Notification.objects.create(
                beneficiary=beneficiary,
                **notif_data
            )

        self.stdout.write(self.style.SUCCESS(f'  ✓ {len(notifications_data)} notificações criadas'))
