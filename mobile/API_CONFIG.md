# API Configuration Guide

## Backend está rodando em: `http://0.0.0.0:8000`

## Mobile App - Como Configurar a URL da API

A URL da API está configurada em: [src/config/api.ts](src/config/api.ts)

### Opções de Conexão:

#### 1. Android Emulator (Padrão - Já Configurado)
```typescript
export const API_URL = 'http://10.0.2.2:8000/api';
```
- `10.0.2.2` é o IP especial que o emulador Android usa para acessar o localhost da máquina host

#### 2. iOS Simulator
```typescript
export const API_URL = 'http://localhost:8000/api';
```
- iOS Simulator pode acessar diretamente `localhost`

#### 3. Dispositivo Físico (Android ou iOS)
```typescript
export const API_URL = 'http://192.168.77.11:8000/api';
```
- Use o IP da sua máquina na rede local
- **Importante:** Certifique-se de que o dispositivo está na mesma rede WiFi

#### 4. Expo Go (Recomendado para Desenvolvimento)
```typescript
export const API_URL = 'http://192.168.77.11:8000/api';
```
- Expo Go no dispositivo físico requer o IP da máquina
- Verifique o IP executando: `hostname -I` (Linux) ou `ipconfig` (Windows)

## Como Trocar a Configuração

1. Abra o arquivo [src/config/api.ts](src/config/api.ts)
2. Modifique a linha 8 com a URL apropriada:

```typescript
export const API_URL = __DEV__
  ? 'http://SEU_IP_AQUI:8000/api'  // Altere aqui
  : 'https://api.elosaude.com/api';
```

## Testando a Conexão

### Do Terminal (Linux/Mac):
```bash
# Android Emulator
curl -X POST http://10.0.2.2:8000/api/accounts/test-login/ \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "test"}'

# Dispositivo Físico (use o IP da sua máquina)
curl -X POST http://192.168.77.11:8000/api/accounts/test-login/ \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "test"}'
```

### Do Navegador:
- Acesse: http://0.0.0.0:8000/swagger/
- Teste o endpoint `/api/accounts/test-login/`

## Credenciais de Teste

O endpoint `/api/accounts/test-login/` aceita **QUALQUER** CPF e senha:

```json
{
  "cpf": "12345678900",
  "password": "test"
}
```

- Usuário será criado automaticamente se não existir
- Retorna tokens JWT (access + refresh)
- Cria perfil de beneficiário automaticamente

## Verificação

### Backend Funcionando?
```bash
curl http://0.0.0.0:8000/api/
```

### Swagger Docs:
- http://0.0.0.0:8000/swagger/
- http://0.0.0.0:8000/redoc/

### Django Admin:
- http://0.0.0.0:8000/admin/
- Username: `admin`
- Password: `admin123`

## Solução de Problemas

### Erro: "Network request failed"
- ✅ Verifique se o backend está rodando (`python manage.py runserver 0.0.0.0:8000`)
- ✅ Verifique se a URL está correta para seu ambiente
- ✅ Para dispositivos físicos, verifique se estão na mesma rede WiFi
- ✅ Verifique o firewall da máquina

### Erro: "Invalid HTTP_HOST header"
- ✅ Adicione o IP/hostname ao `ALLOWED_HOSTS` em [backend/.env](../backend/.env)
- Já configurado: `localhost,127.0.0.1,0.0.0.0,192.168.77.11,backend`

### Erro: "Connection refused"
- ✅ Certifique-se de que o servidor está rodando em `0.0.0.0:8000` (não em `127.0.0.1:8000`)
- ✅ Verifique portas de firewall

## IP Atual da Máquina

Para descobrir o IP da sua máquina:

```bash
# Linux
hostname -I

# Mac
ipconfig getifaddr en0

# Windows
ipconfig
```

**IP Atual Detectado:** `192.168.77.11`
