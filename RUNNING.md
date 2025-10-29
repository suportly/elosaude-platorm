# Como Rodar o Elosaúde Platform - Guia Rápido

## 🚀 Inicio Rápido (2 Opções)

### Opção 1: Usando Emulador (Recomendado para Desenvolvimento)

#### Passo 1: Iniciar Backend
```bash
# Na raiz do projeto
docker-compose up -d

# Aguardar ~30 segundos para os serviços iniciarem
docker-compose ps
```

#### Passo 2: Rodar App no Emulador Android
```bash
cd mobile

# Iniciar Metro e abrir no emulador automaticamente
npm run android
```

**Ou para iOS (macOS apenas):**
```bash
npm run ios
```

---

### Opção 2: Usando Dispositivo Físico com Expo Go

#### Passo 1: Iniciar Backend
```bash
docker-compose up -d
```

#### Passo 2: Descobrir IP da sua máquina
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr /i "IPv4"

# Exemplo de resultado: 192.168.1.100
```

#### Passo 3: Atualizar API URL no mobile
Editar `mobile/src/config/api.ts`:

```typescript
export const API_URL = __DEV__
  ? 'http://192.168.1.100:8000/api'  // USAR SEU IP AQUI!
  : 'https://api.elosaude.com/api';
```

#### Passo 4: Iniciar Expo
```bash
cd mobile
npm start
```

#### Passo 5: Escanear QR Code
- **Android:** Abrir Expo Go → Scan QR code
- **iOS:** Abrir câmera nativa → Escanear QR code

⚠️ **Importante:** Certifique-se de que o Expo Go está atualizado (SDK 54 ou superior)

---

## 📱 Testando o App

### 1. Tela de Login
- Digite **qualquer CPF** (ex: `123.456.789-00`)
- Digite **qualquer senha** (ex: `test`)
- Clique em "Entrar"

O sistema irá:
- ✅ Criar automaticamente um usuário
- ✅ Criar um beneficiário
- ✅ Criar uma empresa de teste
- ✅ Criar um plano de saúde
- ✅ Gerar uma carteirinha digital com QR code
- ✅ Fazer login e ir para a Home

### 2. Navegação
- **Home:** 4 cards principais + atalhos rápidos
- **Carteirinha:** Ver carteirinha digital (placeholder)
- **Rede:** Buscar prestadores (placeholder)
- **Guias:** Solicitar guias TISS (placeholder)
- **Mais:** Menu com opções extras

### 3. Logout
- Ir em "Mais" → "Sair"
- Voltará para tela de login

---

## 🔍 Verificando se Está Funcionando

### Backend
```bash
# Ver se serviços estão rodando
docker-compose ps

# Deve mostrar:
# - backend    (port 8000)
# - db         (port 5432)
# - redis      (port 6379)
# - celery
# - celery-beat

# Testar API manualmente:
curl http://localhost:8000/swagger/
# Deve abrir a documentação da API
```

### Mobile
```bash
# Ver logs do Metro bundler
# Aparecem automaticamente quando executa npm start

# Ver logs do app
# Aparecem no console do Expo
```

---

## 🐛 Problemas Comuns

### "Unable to connect to Metro"
**Solução:** Verificar URL em `mobile/src/config/api.ts`
- Emulador Android: `http://10.0.2.2:8000/api`
- iOS Simulator: `http://localhost:8000/api`
- Dispositivo físico: `http://SEU_IP:8000/api`

### "Project is incompatible with Expo Go"
**Solução:** Use o emulador ao invés do Expo Go
```bash
npm run android
# ou
npm run ios
```

### Backend não responde
**Solução:**
```bash
# Reiniciar serviços
docker-compose restart

# Ver logs
docker-compose logs -f backend
```

### Login não funciona
**Solução:**
```bash
# Testar endpoint de login diretamente:
curl -X POST http://localhost:8000/api/accounts/test-login/ \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "test"}'

# Deve retornar JSON com access token
```

---

## 📊 Status dos Serviços

### Verificar se tudo está rodando:
```bash
# Docker
docker-compose ps

# Backend (deve retornar HTML da documentação)
curl http://localhost:8000/swagger/

# Database (deve retornar "1")
docker-compose exec db psql -U postgres -d elosaude_db -c "SELECT 1"

# Redis (deve retornar "PONG")
docker-compose exec redis redis-cli ping
```

---

## 🎯 Workflows de Desenvolvimento

### Desenvolvimento Backend
```bash
# 1. Fazer alterações no código Python
# 2. Django recarrega automaticamente
# 3. Testar no Postman ou app mobile
# 4. Ver logs: docker-compose logs -f backend
```

### Desenvolvimento Mobile
```bash
# 1. Fazer alterações no código TypeScript
# 2. Salvar arquivo (Ctrl+S)
# 3. App recarrega automaticamente (Fast Refresh)
# 4. Ver logs no terminal do Metro
```

### Criar Migrations
```bash
# Opção 1: Via Docker
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Opção 2: Via VS Code
# Pressionar F5 → Django: Make Migrations
# Pressionar F5 → Django: Migrate
```

### Acessar Django Admin
```bash
# Criar superuser
docker-compose exec backend python manage.py createsuperuser

# Acessar: http://localhost:8000/admin/
```

---

## 🛑 Parando os Serviços

### Parar tudo
```bash
# Backend
docker-compose down

# Mobile (Ctrl+C no terminal do npm start)
```

### Parar e limpar tudo (⚠️ Remove dados!)
```bash
docker-compose down -v
```

---

## 📖 Documentação Adicional

- **Setup inicial:** [QUICKSTART.md](QUICKSTART.md)
- **Problemas:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **VS Code:** [VSCODE_SETUP.md](VSCODE_SETUP.md)
- **Índice completo:** [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)

---

## ✅ Checklist de Início

Antes de começar a desenvolver:

- [ ] Docker Desktop está rodando
- [ ] `docker-compose up -d` executado
- [ ] Backend respondendo em http://localhost:8000/swagger/
- [ ] `npm install` executado em `mobile/`
- [ ] Emulador Android/iOS instalado (ou Expo Go atualizado)
- [ ] `npm run android` ou `npm run ios` executado
- [ ] Login de teste funcionando (qualquer CPF/senha)

---

**Pronto para desenvolver! 🚀**

Caso tenha problemas, consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
