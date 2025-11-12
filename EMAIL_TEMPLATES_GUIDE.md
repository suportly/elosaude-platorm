# Guia de Templates de Email - Elosaúde

**Status**: ✅ **7 Templates Criados e Prontos para Uso**

---

## 📧 Templates Disponíveis

### 1. **base_email.html** - Template Base
Layout profissional com branding Elosaúde que serve como base para todos os outros templates.

**Recursos:**
- Header com logo e gradiente da marca (#20a490)
- Estilos responsivos para mobile
- Footer com informações de contato
- Info boxes e warning boxes estilizados
- Botões call-to-action
- Compatível com todos os clientes de email

---

### 2. **password_reset_email.html** - Reset de Senha
Envia código de 6 dígitos para redefinição de senha.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `reset_code`: Código de reset (ex: "123456")

**Quando usar:**
- Usuário solicita "Esqueci minha senha"
- Código de reset é gerado

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_password_reset

send_password_reset(
    user=user,
    reset_code="123456"
)
```

---

### 3. **first_access_activation.html** - Primeiro Acesso
Email de boas-vindas com código de ativação para novos usuários.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `activation_code`: Código de ativação

**Recursos:**
- Explicação passo a passo de como ativar
- Lista de funcionalidades do app
- Links para App Store e Google Play
- Dica sobre notificações

**Quando usar:**
- Nova conta é criada
- Beneficiário é adicionado ao sistema

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_activation_email

send_activation_email(
    user=user,
    activation_code="789012"
)
```

---

### 4. **notification_email.html** - Notificação Genérica
Template flexível para qualquer tipo de notificação.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `notification_title`: Título da notificação
- `notification_message`: Mensagem (pode conter HTML)

**Variáveis opcionais:**
- `notification_subtitle`: Subtítulo
- `action_url`: URL para botão de ação
- `action_text`: Texto do botão
- `additional_info`: Info box adicional

**Quando usar:**
- Notificações customizadas
- Avisos gerais
- Comunicados

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_notification

send_notification(
    user=user,
    title="Nova Funcionalidade",
    message="<p>Agora você pode <strong>agendar consultas</strong> pelo app!</p>",
    action_url="elosaude://features/appointments",
    action_text="Conhecer Agora"
)
```

---

### 5. **guide_authorized.html** - Guia Autorizada
Notificação de autorização de guia TISS.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `guide_number`: Número da guia
- `protocol_number`: Número do protocolo
- `procedure_name`: Nome do procedimento
- `provider_name`: Nome do prestador
- `validity_date`: Data de validade
- `guide_id`: ID da guia (para deep link)

**Quando usar:**
- Guia é autorizada pelo sistema
- Status muda para "AUTHORIZED"

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_guide_authorized

send_guide_authorized(
    user=user,
    guide_data={
        'guide_number': 'G123456',
        'protocol_number': 'PROT789012',
        'procedure_name': 'Consulta Cardiológica',
        'provider_name': 'Dr. João Silva',
        'validity_date': '31/12/2025',
        'guide_id': 42
    }
)
```

---

### 6. **reimbursement_approved.html** - Reembolso Aprovado
Notificação de aprovação de reembolso com detalhes do pagamento.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `protocol_number`: Protocolo do reembolso
- `approved_amount`: Valor aprovado formatado (ex: "450,00")
- `requested_amount`: Valor solicitado formatado
- `expense_type`: Tipo de despesa
- `service_date`: Data do serviço
- `provider_name`: Nome do prestador
- `bank_name`: Nome do banco
- `agency`: Agência
- `account`: Número da conta
- `account_type`: Tipo de conta (Corrente/Poupança)
- `reimbursement_id`: ID do reembolso (para deep link)

**Quando usar:**
- Reembolso é aprovado
- Status muda para "APPROVED" ou "PAID"

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_reimbursement_approved

send_reimbursement_approved(
    user=user,
    reimbursement_data={
        'protocol_number': 'REIMB1234567890',
        'approved_amount': '450,00',
        'requested_amount': '500,00',
        'expense_type': 'Consulta Médica',
        'service_date': '15/11/2025',
        'provider_name': 'Clínica São Paulo',
        'bank_name': 'Banco do Brasil',
        'agency': '1234-5',
        'account': '12345-6',
        'account_type': 'Corrente',
        'reimbursement_id': 123
    }
)
```

---

### 7. **invoice_due_reminder.html** - Lembrete de Fatura
Lembrete de vencimento de fatura com formas de pagamento.

**Variáveis necessárias:**
- `user_name`: Nome do usuário
- `invoice_amount`: Valor da fatura formatado
- `due_date`: Data de vencimento formatada
- `days_remaining`: Dias restantes até vencimento
- `reference_month`: Mês de referência (ex: "11/2025")
- `digitable_line`: Linha digitável do boleto
- `invoice_id`: ID da fatura (para deep link)

**Quando usar:**
- 7 dias antes do vencimento
- 3 dias antes do vencimento
- No dia do vencimento

**Exemplo de uso:**
```python
from apps.accounts.utils.email_service import send_invoice_reminder

send_invoice_reminder(
    user=user,
    invoice_data={
        'invoice_amount': '500,00',
        'due_date': '15/11/2025',
        'days_remaining': 7,
        'reference_month': '11/2025',
        'digitable_line': '12345.67890 12345.678901 12345.678901 1 12345678901234',
        'invoice_id': 456
    }
)
```

---

## ⚙️ Configuração SMTP

### Opção 1: Gmail (Desenvolvimento e Testes)

**1. Configurar App Password no Gmail:**
- Acesse: https://myaccount.google.com/apppasswords
- Crie uma senha de app para "Mail"
- Copie a senha gerada (16 caracteres)

**2. Adicionar ao `settings.py` ou `.env`:**

```python
# settings.py

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'seuemail@gmail.com'  # Seu email Gmail
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx'  # App Password (16 chars)
DEFAULT_FROM_EMAIL = 'Elosaúde <noreply@elosaude.com.br>'

# Optional: Send emails to console in development
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

**Usando `.env` (recomendado):**

```bash
# .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seuemail@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxx
DEFAULT_FROM_EMAIL=Elosaúde <noreply@elosaude.com.br>
```

```python
# settings.py
import os

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Elosaúde <noreply@elosaude.com.br>')
```

---

### Opção 2: SendGrid (Produção Recomendada)

**Vantagens:**
- ✅ 100 emails/dia gratuitos
- ✅ Melhor deliverability
- ✅ Analytics e tracking
- ✅ Templates validation
- ✅ API robusta

**1. Criar conta no SendGrid:**
- Acesse: https://sendgrid.com
- Crie uma conta gratuita
- Verifique seu domínio (ou use o sandbox)

**2. Gerar API Key:**
- Settings → API Keys → Create API Key
- Nome: "Elosaúde Django App"
- Permissões: Full Access (ou Mail Send apenas)
- Copie a API Key (começa com "SG.")

**3. Instalar SDK:**
```bash
pip install sendgrid
```

**4. Configurar no Django:**

```python
# settings.py

EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_SANDBOX_MODE_IN_DEBUG = True  # Emails não são enviados em DEBUG=True
DEFAULT_FROM_EMAIL = 'noreply@elosaude.com.br'

# Para usar nome com email
DEFAULT_FROM_EMAIL = 'Elosaúde <noreply@elosaude.com.br>'
```

```bash
# .env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Opção 3: AWS SES (Escalabilidade)

Para alto volume (produção com muitos usuários):

```python
# settings.py

EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
AWS_SES_REGION_NAME = 'us-east-1'
AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'
```

**Instalar:**
```bash
pip install django-ses
```

---

## 🧪 Testar Emails

### 1. Console Backend (Desenvolvimento)

```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

Emails aparecerão no console/logs em vez de serem enviados.

---

### 2. Enviar Email de Teste

```bash
cd backend
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.accounts.utils.email_service import EmailService

User = get_user_model()
user = User.objects.first()

# Teste 1: Reset de senha
EmailService.send_password_reset(user, "123456")

# Teste 2: Ativação
EmailService.send_activation_email(user, "789012")

# Teste 3: Notificação genérica
EmailService.send_notification(
    user=user,
    title="Teste de Email",
    message="<p>Este é um <strong>teste</strong> do sistema de emails.</p>",
    action_url="https://www.elosaude.com.br",
    action_text="Acessar Site"
)
```

---

## 📝 Exemplos de Integração

### 1. Reset de Senha no View

```python
# apps/accounts/views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.accounts.utils.email_service import send_password_reset
import random
import string

@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')

    try:
        user = User.objects.get(email=email)

        # Generate 6-digit code
        reset_code = ''.join(random.choices(string.digits, k=6))

        # Save code in cache or database
        cache.set(f'reset_code_{user.id}', reset_code, timeout=3600)  # 1 hour

        # Send email
        send_password_reset(user, reset_code)

        return Response({'message': 'Email enviado com sucesso'})
    except User.DoesNotExist:
        # Don't reveal if user exists
        return Response({'message': 'Email enviado com sucesso'})
```

---

### 2. Autorização de Guia com Signal

```python
# apps/guides/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.accounts.utils.email_service import send_guide_authorized
from .models import TISSGuide

@receiver(post_save, sender=TISSGuide)
def notify_guide_authorization(sender, instance, created, **kwargs):
    # Notify when guide is authorized
    if instance.status == 'AUTHORIZED' and not created:
        user = instance.beneficiary.user

        send_guide_authorized(
            user=user,
            guide_data={
                'guide_number': instance.guide_number,
                'protocol_number': instance.protocol_number,
                'procedure_name': instance.requested_procedures[0]['name'] if instance.requested_procedures else 'Procedimento',
                'provider_name': instance.provider.name,
                'validity_date': instance.validity_date.strftime('%d/%m/%Y'),
                'guide_id': instance.id
            }
        )
```

---

### 3. Lembrete de Fatura Agendado

```python
# apps/financial/tasks.py (usando Celery)

from celery import shared_task
from datetime import datetime, timedelta
from apps.accounts.utils.email_service import send_invoice_reminder
from .models import Invoice

@shared_task
def send_invoice_reminders():
    """Send reminders for invoices due in 7 days"""

    due_date = datetime.now().date() + timedelta(days=7)
    invoices = Invoice.objects.filter(
        due_date=due_date,
        status='OPEN'
    ).select_related('beneficiary__user')

    for invoice in invoices:
        user = invoice.beneficiary.user

        send_invoice_reminder(
            user=user,
            invoice_data={
                'invoice_amount': f"{invoice.amount:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.'),
                'due_date': invoice.due_date.strftime('%d/%m/%Y'),
                'days_remaining': 7,
                'reference_month': invoice.reference_month,
                'digitable_line': invoice.digitable_line,
                'invoice_id': invoice.id
            }
        )
```

---

## 🎨 Personalização

### Alterar Cores do Template

Edite `base_email.html`:

```css
/* Header gradient */
background: linear-gradient(135deg, #20a490 0%, #1a8c7a 100%);

/* Primary color */
background-color: #20a490;
color: #20a490;
border-left: 4px solid #20a490;
```

---

### Adicionar Logo

```html
<!-- No header do base_email.html -->
<div class="email-header">
    <img src="https://www.elosaude.com.br/logo.png" alt="Elosaúde" style="max-width: 200px; margin-bottom: 10px;">
    <h1>ELOSAÚDE</h1>
</div>
```

---

## 📊 Monitoramento

### Log de Emails Enviados

```python
# settings.py

LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/emails.log',
        },
    },
    'loggers': {
        'apps.accounts.utils.email_service': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

---

## ✅ Checklist de Implementação

- [x] Templates HTML criados (7)
- [x] Base template com branding
- [x] EmailService utility criada
- [ ] SMTP configurado (Gmail/SendGrid)
- [ ] Variáveis de ambiente configuradas
- [ ] Email de teste enviado com sucesso
- [ ] Integração com views de autenticação
- [ ] Signals configurados para notificações automáticas
- [ ] Celery tasks para lembretes agendados (opcional)
- [ ] Monitoramento de emails configurado

---

## 🚀 Próximos Passos

1. **Configurar SMTP** (Gmail para dev, SendGrid para prod)
2. **Testar cada template** no shell do Django
3. **Integrar com views** de autenticação
4. **Configurar signals** para notificações automáticas
5. **Opcional:** Setup Celery para emails agendados

---

## 📞 Suporte

- Django Email Docs: https://docs.djangoproject.com/en/4.2/topics/email/
- SendGrid Django: https://github.com/sklarsa/django-sendgrid-v5
- Email Testing: https://mailtrap.io (ferramenta de teste)

---

**Última atualização**: Novembro 2025
**Versão**: 1.0
**Status**: ✅ Pronto para configuração SMTP
