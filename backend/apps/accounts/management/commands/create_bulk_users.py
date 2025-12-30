from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.beneficiaries.models import Beneficiary, Company, HealthPlan


class Command(BaseCommand):
    help = 'Cria usuários em lote para testes'

    def handle(self, *args, **options):
        # Lista de usuários para criar
        users_data = [
            {
                'full_name': 'EDUARDO ANTONIO GORI SATTAMINI',
                'cpf': '82111111791',
                'zip_code': '88015110',
            },
            {
                'full_name': 'MANOEL ARLINDO ZARONI TORRES',
                'cpf': '11511605634',
                'zip_code': '88015250',
            },
            {
                'full_name': 'MARIO WILSON CUSATIS',
                'cpf': '00540098981',  # Padded to 11 digits
                'zip_code': '88508410',
            },
            {
                'full_name': 'MARCIO DAIAN NEVES',
                'cpf': '02195236906',  # Padded to 11 digits
                'zip_code': '88034100',
            },
            {
                'full_name': 'GUILHERME SLOVINSKI FERRARI',
                'cpf': '98337874953',
                'zip_code': '88015400',
            },
        ]

        default_password = 'Elo@2024'

        self.stdout.write('Criando usuários em lote...\n')

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

        self.stdout.write('')

        created_users = []
        existing_users = []

        for user_data in users_data:
            cpf = user_data['cpf'].zfill(11)  # Ensure 11 digits
            full_name = user_data['full_name']
            zip_code = user_data['zip_code'].replace('-', '')

            # Check if beneficiary already exists
            try:
                beneficiary = Beneficiary.objects.get(cpf=cpf)
                existing_users.append({
                    'name': full_name,
                    'cpf': cpf,
                })
                self.stdout.write(self.style.WARNING(f'Usuário já existe: {full_name} (CPF: {cpf})'))
                continue
            except Beneficiary.DoesNotExist:
                pass

            # Generate email from name
            name_parts = full_name.lower().split()
            email = f'{name_parts[0]}.{name_parts[-1]}@elosaude.com.br'

            # Check if Django User already exists (from previous incomplete run)
            username = f'user_{cpf}'
            try:
                user = User.objects.get(username=username)
                self.stdout.write(f'User Django já existe: {username}, reutilizando...')
            except User.DoesNotExist:
                # Create user
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=default_password,
                    first_name=name_parts[0].title(),
                    last_name=name_parts[-1].title() if len(name_parts) > 1 else ''
                )

            # Create beneficiary
            beneficiary = Beneficiary.objects.create(
                user=user,
                cpf=cpf,
                full_name=full_name,
                birth_date='1980-01-01',
                gender='M',
                phone='',
                email=email,
                address='',
                city='Florianópolis',
                state='SC',
                zip_code=zip_code,
                beneficiary_type='TITULAR',
                company=company,
                health_plan=health_plan,
                status='ACTIVE',
            )

            created_users.append({
                'name': full_name,
                'cpf': cpf,
                'registration': beneficiary.registration_number,
            })
            self.stdout.write(self.style.SUCCESS(f'Usuário criado: {full_name}'))

        # Summary
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('RESUMO DA CRIAÇÃO DE USUÁRIOS'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')

        if created_users:
            self.stdout.write(self.style.SUCCESS(f'Usuários criados: {len(created_users)}'))
            self.stdout.write('')
            self.stdout.write('CREDENCIAIS DE ACESSO:')
            self.stdout.write(f'Senha padrão: {default_password}')
            self.stdout.write('')
            self.stdout.write(f'{"Nome":<40} {"CPF":<15} {"Registro"}')
            self.stdout.write('-' * 70)
            for u in created_users:
                self.stdout.write(f'{u["name"]:<40} {u["cpf"]:<15} {u["registration"]}')

        if existing_users:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING(f'Usuários já existentes: {len(existing_users)}'))
            for u in existing_users:
                self.stdout.write(f'  - {u["name"]} (CPF: {u["cpf"]})')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
