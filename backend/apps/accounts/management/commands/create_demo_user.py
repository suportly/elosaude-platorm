from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.beneficiaries.models import Beneficiary, Company, HealthPlan


class Command(BaseCommand):
    help = 'Cria um usuário de demonstração para testes'

    def handle(self, *args, **options):
        # Demo user credentials
        demo_cpf = '95197494972'
        demo_password = 'Demo@123'

        self.stdout.write('Criando usuário de demonstração...')

        # Create or get company
        company, created = Company.objects.get_or_create(
            cnpj='12345678000100',
            defaults={
                'name': 'Elosaúde Demonstração',
                'address': 'Rua das Flores, 123 - São Paulo/SP - CEP: 01310-100',
                'phone': '1130001000',
                'email': 'contato@elosaude.com.br',
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Empresa criada: {company.name}'))
        else:
            self.stdout.write(f'Empresa já existe: {company.name}')

        # Create or get health plan
        health_plan, created = HealthPlan.objects.get_or_create(
            name='Plano Elosaúde Premium',
            defaults={
                'plan_type': 'PREMIUM',
                'description': 'Plano completo com cobertura nacional e atendimento 24h',
                'monthly_fee': 850.00,
                'coverage_details': {
                    'cobertura': 'nacional',
                    'copay_consulta': 50.00,
                    'copay_exame': 30.00,
                    'atendimento_24h': True,
                },
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Plano criado: {health_plan.name}'))
        else:
            self.stdout.write(f'Plano já existe: {health_plan.name}')

        # Check if user already exists
        try:
            beneficiary = Beneficiary.objects.get(cpf=demo_cpf)
            user = beneficiary.user
            self.stdout.write(self.style.WARNING('Usuário já existe!'))
            self.stdout.write(f'CPF: {demo_cpf}')
            self.stdout.write(f'Senha: {demo_password}')
            return
        except Beneficiary.DoesNotExist:
            pass

        # Create user
        user = User.objects.create_user(
            username=f'demo_{demo_cpf}',
            email='demo@elosaude.com.br',
            password=demo_password,
            first_name='João',
            last_name='Silva'
        )
        self.stdout.write(self.style.SUCCESS(f'Usuário criado: {user.username}'))

        # Create beneficiary
        beneficiary = Beneficiary.objects.create(
            user=user,
            cpf=demo_cpf,
            full_name='João Silva Santos',
            birth_date='1985-03-15',
            gender='MALE',
            phone='11987654321',
            mobile_phone='11987654321',
            email='demo@elosaude.com.br',
            address='Avenida Paulista, 1000',
            city='São Paulo',
            state='SP',
            zip_code='01310100',
            beneficiary_type='TITULAR',
            company=company,
            health_plan=health_plan,
            status='ACTIVE',
        )
        self.stdout.write(self.style.SUCCESS(f'Beneficiário criado: {beneficiary.full_name}'))
        self.stdout.write(f'Número de registro: {beneficiary.registration_number}')

        # Print credentials
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write(self.style.SUCCESS('USUÁRIO DE DEMONSTRAÇÃO CRIADO COM SUCESSO!'))
        self.stdout.write(self.style.SUCCESS('=' * 50))
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Credenciais de acesso:'))
        self.stdout.write(f'CPF: {demo_cpf}')
        self.stdout.write(f'Senha: {demo_password}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Dados do usuário:'))
        self.stdout.write(f'Nome: {beneficiary.full_name}')
        self.stdout.write(f'Registro: {beneficiary.registration_number}')
        self.stdout.write(f'Plano: {health_plan.name}')
        self.stdout.write(f'Empresa: {company.name}')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 50))
