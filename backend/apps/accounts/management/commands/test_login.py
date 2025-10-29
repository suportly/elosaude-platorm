from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.beneficiaries.models import Beneficiary


class Command(BaseCommand):
    help = 'Testa o login com usuário demo'

    def handle(self, *args, **options):
        demo_cpf = '12345678900'
        demo_password = 'Demo@123'

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('TESTE DE AUTENTICAÇÃO'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')

        # 1. Verificar se beneficiário existe
        self.stdout.write(self.style.WARNING('1. Verificando beneficiário...'))
        try:
            beneficiary = Beneficiary.objects.get(cpf=demo_cpf)
            self.stdout.write(self.style.SUCCESS(f'   ✓ Beneficiário encontrado: {beneficiary.full_name}'))
            self.stdout.write(f'   - ID: {beneficiary.id}')
            self.stdout.write(f'   - CPF: {beneficiary.cpf}')
            self.stdout.write(f'   - Status: {beneficiary.status}')
            self.stdout.write(f'   - Tipo: {beneficiary.beneficiary_type}')
            self.stdout.write(f'   - Registro: {beneficiary.registration_number}')
        except Beneficiary.DoesNotExist:
            self.stdout.write(self.style.ERROR('   ✗ Beneficiário NÃO encontrado!'))
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('Execute: python manage.py create_demo_user'))
            return

        # 2. Verificar usuário associado
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('2. Verificando usuário Django...'))
        user = beneficiary.user
        if user:
            self.stdout.write(self.style.SUCCESS(f'   ✓ Usuário encontrado: {user.username}'))
            self.stdout.write(f'   - ID: {user.id}')
            self.stdout.write(f'   - Email: {user.email}')
            self.stdout.write(f'   - Ativo: {user.is_active}')
            self.stdout.write(f'   - Staff: {user.is_staff}')
        else:
            self.stdout.write(self.style.ERROR('   ✗ Usuário NÃO encontrado!'))
            return

        # 3. Verificar senha
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('3. Verificando senha...'))
        if user.check_password(demo_password):
            self.stdout.write(self.style.SUCCESS('   ✓ Senha correta!'))
        else:
            self.stdout.write(self.style.ERROR('   ✗ Senha incorreta!'))
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('   Resetando senha para: Demo@123'))
            user.set_password(demo_password)
            user.save()
            self.stdout.write(self.style.SUCCESS('   ✓ Senha resetada com sucesso!'))

        # 4. Verificar empresa e plano
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('4. Verificando empresa e plano...'))
        self.stdout.write(f'   - Empresa: {beneficiary.company.name}')
        self.stdout.write(f'   - Plano: {beneficiary.health_plan.name}')
        self.stdout.write(f'   - Mensalidade: R$ {beneficiary.health_plan.monthly_fee}')

        # 5. Listar todos os beneficiários (debug)
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('5. Listando todos os beneficiários cadastrados...'))
        all_beneficiaries = Beneficiary.objects.all()
        if all_beneficiaries.count() == 0:
            self.stdout.write(self.style.WARNING('   Nenhum beneficiário cadastrado!'))
        else:
            for b in all_beneficiaries:
                self.stdout.write(f'   - {b.full_name} (CPF: {b.cpf}, Status: {b.status})')

        # 6. Teste de autenticação via API (usando curl)
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('6. Para testar API de login...'))
        self.stdout.write('   Execute o script: ./test_auth.sh')
        self.stdout.write('   Ou use curl:')
        self.stdout.write(f'''   curl -X POST http://localhost:8000/api/auth/login/ \\
     -H "Content-Type: application/json" \\
     -d '{{"cpf":"{demo_cpf}","password":"{demo_password}"}}\'''')

        # Resumo final
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('CREDENCIAIS PARA LOGIN:'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(f'CPF: {demo_cpf} (ou 123.456.789-00)')
        self.stdout.write(f'Senha: {demo_password}')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Para iniciar o servidor:'))
        self.stdout.write('python manage.py runserver')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Para ver logs em tempo real:'))
        self.stdout.write('python manage.py runserver --verbosity 2')
        self.stdout.write('')
