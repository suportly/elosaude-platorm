# Guia de Configuração do Celery + Redis

## 1. Instalar Redis

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install redis-server
```

### macOS:
```bash
brew install redis
```

### Verificar instalação:
```bash
redis-cli ping
# Deve retornar: PONG
```

## 2. Iniciar Redis

### Ubuntu/Debian (systemd):
```bash
sudo systemctl start redis
sudo systemctl enable redis  # Para iniciar automaticamente no boot
```

### macOS:
```bash
brew services start redis
```

### Manual (qualquer sistema):
```bash
redis-server
```

## 3. Verificar se Redis está rodando

```bash
redis-cli ping
```

Se retornar `PONG`, está funcionando!

## 4. Instalar dependências Python do Celery

As dependências já devem estar no `requirements.txt`:
```txt
celery==5.3.4
redis==5.0.1
```

Se não estiver instalado:
```bash
pip install celery redis
```

## 5. Iniciar Celery

### Opção 1: Usando os scripts fornecidos (RECOMENDADO)

```bash
cd backend
./start_celery.sh
```

Para parar:
```bash
./stop_celery.sh
```

### Opção 2: Manualmente

Terminal 1 - Celery Worker:
```bash
cd backend
celery -A elosaude_backend worker --loglevel=info
```

Terminal 2 - Celery Beat (scheduler):
```bash
cd backend
celery -A elosaude_backend beat --loglevel=info
```

## 6. Verificar se Celery está funcionando

### Verificar processos:
```bash
ps aux | grep celery
```

### Ver logs:
```bash
tail -f logs/celery_worker.log
tail -f logs/celery_beat.log
```

### Testar uma task:
```python
from apps.notifications.tasks import send_notification

# Executar de forma síncrona (para teste)
result = send_notification(
    beneficiary_id=1,
    title="Teste",
    message="Mensagem de teste",
    notification_type="SYSTEM"
)

# Executar de forma assíncrona (Celery)
result = send_notification.delay(
    beneficiary_id=1,
    title="Teste",
    message="Mensagem de teste",
    notification_type="SYSTEM"
)
```

## 7. Tasks Configuradas

### Tasks Imediatas (chamadas via código):
- `send_notification` - Enviar notificação para beneficiário
- `send_bulk_notification` - Enviar notificação em massa
- `process_guide_authorization` - Processar autorização de guia
- `generate_guide_pdf` - Gerar PDF de guia (TODO: implementar)
- `generate_invoice_pdf` - Gerar PDF de fatura (TODO: implementar)
- `generate_tax_statement_pdf` - Gerar PDF de declaração IR (TODO: implementar)

### Tasks Agendadas (executadas automaticamente):

**Diárias:**
- `02:00` - Limpeza de notificações antigas
- `08:00` - Verificar faturas vencidas
- `09:00` - Enviar lembretes de consultas
- `09:00` - Enviar lembretes de faturas
- `10:00` - Lembretes de guias pendentes
- `11:00` - Lembretes de reembolsos pendentes

**A cada hora:**
- Verificar guias expiradas

**A cada 6 horas:**
- Processar reembolsos pendentes

**Mensais:**
- `Dia 1, 01:00` - Gerar faturas mensais

**Anuais:**
- `2 de Janeiro, 03:00` - Gerar declarações de IR

## 8. Monitoramento

### Flower (UI Web para Celery) - OPCIONAL:

```bash
pip install flower
celery -A elosaude_backend flower
```

Acesse: http://localhost:5555

## 9. Configurações (settings.py)

As configurações do Celery já estão em `elosaude_backend/settings.py`:

```python
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'
```

## 10. Troubleshooting

### Redis não está rodando:
```bash
sudo systemctl status redis
sudo systemctl start redis
```

### Celery não encontra as tasks:
```bash
# Verificar se __init__.py tem a importação correta
# elosaude_backend/__init__.py deve ter:
from .celery import app as celery_app
__all__ = ('celery_app',)
```

### Tasks não estão sendo executadas:
1. Verificar se o worker está rodando
2. Verificar logs: `tail -f logs/celery_worker.log`
3. Verificar se Redis está acessível: `redis-cli ping`

### Para limpar a fila de tasks:
```bash
redis-cli FLUSHALL
```

## 11. Produção

### Usando Supervisor (recomendado):

Crie `/etc/supervisor/conf.d/celery.conf`:

```ini
[program:celery_worker]
command=/path/to/venv/bin/celery -A elosaude_backend worker --loglevel=info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
stdout_logfile=/var/log/celery/worker.log
stderr_logfile=/var/log/celery/worker_err.log

[program:celery_beat]
command=/path/to/venv/bin/celery -A elosaude_backend beat --loglevel=info
directory=/path/to/backend
user=www-data
autostart=true
autorestart=true
stdout_logfile=/var/log/celery/beat.log
stderr_logfile=/var/log/celery/beat_err.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start celery_worker celery_beat
```

### Usando systemd:

Crie `/etc/systemd/system/celery.service` e `/etc/systemd/system/celerybeat.service`

```bash
sudo systemctl daemon-reload
sudo systemctl enable celery celerybeat
sudo systemctl start celery celerybeat
```

## 12. Status Atual

✅ Celery configurado em `elosaude_backend/celery.py`
✅ Tasks criadas em todos os apps
✅ Beat schedule configurado
✅ Scripts de start/stop criados
⚠️  Redis precisa ser instalado
⚠️  Celery worker/beat precisam ser iniciados

## 13. Próximos Passos

1. Instalar Redis
2. Executar `./start_celery.sh`
3. Testar enviando uma notificação
4. Implementar tasks de geração de PDF (pendente)
5. Configurar FCM para push notifications (pendente)
