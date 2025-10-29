# Troubleshooting Guide - Elosaúde Platform

## 🔧 Problemas Comuns e Soluções

### Mobile App

#### 1. Erro: "ERESOLVE unable to resolve dependency tree"

**Problema:** Conflitos de versão entre pacotes npm

**Solução:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

Se persistir, use:
```bash
npm install --legacy-peer-deps
```

---

#### 2. Erro: "Project is incompatible with this version of Expo Go"

**Problema:** Versão do Expo Go instalada no dispositivo é diferente da versão do SDK do projeto

**Mensagem de erro:**
```
Project is incompatible with this version of Expo Go
• The installed version of Expo Go is for SDK 54.0.0.
• The project you opened uses SDK 50.
```

**Solução:**
O projeto agora usa **Expo SDK 54** (atualizado em 2025-10-28). Se você ainda encontrar este erro:

**Opção 1: Atualizar Expo Go no dispositivo (Recomendado)**
- Atualizar o app Expo Go na App Store/Google Play para SDK 54
- Deve funcionar perfeitamente

**Opção 2: Usar emulador/simulador**
```bash
# Android
npm run android

# iOS (macOS apenas)
npm run ios
```

**Opção 3: Build standalone (desenvolvimento avançado)**
```bash
npx expo run:android
# ou
npx expo run:ios
```

**Se ainda tiver problemas de dependências ao atualizar:**
```bash
cd mobile
rm -rf node_modules package-lock.json .expo
npm install --legacy-peer-deps
```

---

#### 3. Erro: "ERESOLVE unable to resolve dependency tree" ao atualizar para SDK 54

**Problema:** Conflitos de peer dependencies ao atualizar Expo SDK, especialmente com React 19.1.0

**Mensagem de erro:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error Could not resolve dependency:
npm error peer react@"^18.2.0" from react-native@0.76.5
```

**Solução (2025-10-28 - Confirmado Funcionando):**
```bash
cd mobile
rm -rf node_modules package-lock.json .expo
npm install --legacy-peer-deps
```

Esta solução instala todas as dependências corretamente contornando os conflitos de peer dependencies. O projeto usa:
- Expo SDK 54.0.20
- React 19.1.0
- React Native 0.81.5

**Resultado esperado:**
```
added 776 packages, and audited 777 packages
found 0 vulnerabilities
```

---

#### 4. Expo não inicia ou Metro bundler trava

**Problema:** Metro bundler não inicia ou trava

**Solução:**
```bash
cd mobile
npm start -- --clear
# ou
npx expo start -c
```

---

#### 3. "Unable to connect to Metro"

**Problema:** App não consegue conectar ao servidor de desenvolvimento

**Solução Android (Emulador):**
```bash
# Verificar URL em src/config/api.ts
# Deve ser: http://10.0.2.2:8000/api
```

**Solução iOS (Simulador):**
```bash
# URL deve ser: http://localhost:8000/api
```

**Solução Device Físico:**
```bash
# Use o IP da sua máquina
# Exemplo: http://192.168.1.100:8000/api
```

Para descobrir seu IP:
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr /i "IPv4"
```

---

#### 4. Ícones não aparecem

**Problema:** react-native-vector-icons não carrega

**Solução:**
```bash
# Reinstalar app
npx expo start --clear

# Se usar bare React Native (não Expo):
npx react-native link react-native-vector-icons
```

---

#### 5. QR Code não aparece na carteirinha

**Problema:** react-native-qrcode-svg não funciona

**Solução:**
```bash
# Verificar se react-native-svg está instalado
npm list react-native-svg

# Se não estiver:
npm install react-native-svg@14.1.0
```

---

### Backend (Django)

#### 1. Erro: "No module named 'decouple'"

**Problema:** Dependências Python não instaladas

**Solução com Docker:**
```bash
docker-compose down
docker-compose up -d --build
```

**Solução sem Docker:**
```bash
cd backend
pip install -r requirements.txt
```

---

#### 2. Erro: "connection to server ... failed"

**Problema:** PostgreSQL não está rodando

**Solução:**
```bash
# Verificar se Docker está rodando
docker ps

# Se não estiver, iniciar:
docker-compose up -d db

# Verificar logs:
docker-compose logs db
```

---

#### 3. Erro: "relation does not exist"

**Problema:** Migrations não foram aplicadas

**Solução:**
```bash
# Via Docker:
docker-compose exec backend python manage.py migrate

# Sem Docker:
cd backend
python manage.py migrate
```

---

#### 4. Erro: "CORS header 'Access-Control-Allow-Origin' missing"

**Problema:** CORS não configurado corretamente

**Solução:**
```bash
# Verificar backend/.env:
DEBUG=True
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:8081

# Reiniciar backend:
docker-compose restart backend
```

---

#### 5. Login não funciona (qualquer credencial)

**Problema:** Endpoint de test login não acessível

**Solução:**
```bash
# Verificar se backend está rodando:
curl http://localhost:8000/api/accounts/test-login/

# Se retornar erro 404, verificar urls.py

# Testar manualmente:
curl -X POST http://localhost:8000/api/accounts/test-login/ \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "test"}'
```

---

### Docker

#### 1. "Cannot connect to Docker daemon"

**Problema:** Docker não está rodando

**Solução:**
```bash
# Linux
sudo systemctl start docker

# Mac/Windows
# Abrir Docker Desktop
```

---

#### 2. "Port 8000 is already allocated"

**Problema:** Porta já está em uso

**Solução:**
```bash
# Parar container que está usando a porta:
docker-compose down

# Ou verificar qual processo está usando:
# Linux/Mac
lsof -i :8000
# Matar o processo:
kill -9 [PID]

# Windows
netstat -ano | findstr :8000
taskkill /PID [PID] /F
```

---

#### 3. Docker Compose não encontra arquivo .env

**Problema:** Variáveis de ambiente não carregadas

**Solução:**
```bash
# Copiar arquivo de exemplo:
cp backend/.env.example backend/.env

# Editar conforme necessário:
nano backend/.env
```

---

#### 4. "no space left on device"

**Problema:** Disco cheio ou Docker usando muito espaço

**Solução:**
```bash
# Limpar containers, imagens e volumes não usados:
docker system prune -a --volumes

# ⚠️ Cuidado: isso remove TUDO que não está em uso!
```

---

### VS Code

#### 1. Python interpreter não encontrado

**Solução:**
```bash
# Criar virtual environment:
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt

# No VS Code:
# Ctrl+Shift+P → "Python: Select Interpreter"
# Escolher ./backend/venv/bin/python
```

---

#### 2. ESLint/Prettier não funciona

**Solução:**
```bash
cd mobile
npm install --save-dev eslint prettier

# Reabrir VS Code
```

---

#### 3. Debug não para em breakpoints

**Solução:**
```bash
# 1. Verificar se está em modo debug (F5)
# 2. Verificar se o código está sendo executado
# 3. Reiniciar debug (Shift+F5, depois F5)
# 4. Verificar console de debug no painel inferior
```

---

### Geral

#### 1. "Module not found" ou "Cannot find module"

**Solução JavaScript/TypeScript:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

**Solução Python:**
```bash
cd backend
pip install -r requirements.txt
```

---

#### 2. Permissões negadas

**Solução Linux/Mac:**
```bash
# Dar permissões de execução:
chmod +x start.sh
chmod +x backend/manage.py

# Se for problema com Docker:
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

---

#### 3. Tudo está lento

**Solução:**
```bash
# 1. Limpar cache do npm:
cd mobile
npm cache clean --force

# 2. Limpar cache do Expo:
npx expo start --clear

# 3. Limpar cache do Docker:
docker system prune

# 4. Reiniciar serviços:
docker-compose restart

# 5. Verificar uso de recursos:
docker stats
```

---

## 🆘 Comandos de Emergência

### Reset Completo (⚠️ Apaga todos os dados!)

```bash
# Parar tudo:
docker-compose down -v

# Limpar mobile:
cd mobile
rm -rf node_modules package-lock.json .expo
npm install

# Reconstruir Docker:
cd ..
docker-compose up -d --build

# Aguardar 1 minuto e verificar:
docker-compose ps
```

---

### Verificação de Saúde do Sistema

```bash
# 1. Docker está rodando?
docker ps

# 2. Backend responde?
curl http://localhost:8000/swagger/

# 3. Database está acessível?
docker-compose exec db psql -U postgres -c "SELECT 1"

# 4. Migrations aplicadas?
docker-compose exec backend python manage.py showmigrations

# 5. Mobile compila?
cd mobile && npm run android -- --no-packager
```

---

## 📋 Checklist de Diagnóstico

Quando algo não funciona, verifique na ordem:

- [ ] Docker Desktop está rodando?
- [ ] `docker-compose ps` mostra todos os serviços "Up"?
- [ ] Backend responde em http://localhost:8000/swagger/?
- [ ] Arquivo `.env` existe em `backend/`?
- [ ] Migrations foram aplicadas?
- [ ] `npm install` foi executado em `mobile/`?
- [ ] Expo está rodando? (`npm start`)
- [ ] API URL está correta em `mobile/src/config/api.ts`?
- [ ] Não há conflitos de porta (8000, 5432, 6379)?

---

## 🔍 Logs Úteis

### Ver logs do backend:
```bash
docker-compose logs -f backend
```

### Ver logs do database:
```bash
docker-compose logs -f db
```

### Ver logs de todos os serviços:
```bash
docker-compose logs -f
```

### Ver logs do Expo:
```bash
# Os logs aparecem automaticamente ao executar:
cd mobile && npm start
```

---

## 💡 Dicas de Performance

### Acelerar rebuild do Docker:
```bash
# Usar cache de builds:
docker-compose build --parallel

# Remover apenas imagens dangling:
docker image prune
```

### Acelerar npm install:
```bash
# Usar npm ci (mais rápido que install):
cd mobile
npm ci

# Ou usar yarn (geralmente mais rápido):
yarn install
```

---

## 📞 Onde Buscar Ajuda

1. **Documentação do Projeto:**
   - [README.md](README.md)
   - [QUICKSTART.md](QUICKSTART.md)
   - [VSCODE_SETUP.md](VSCODE_SETUP.md)

2. **Logs:**
   - `docker-compose logs -f`
   - Console do Expo
   - VS Code Debug Console

3. **Documentação Oficial:**
   - [Django](https://docs.djangoproject.com/)
   - [DRF](https://www.django-rest-framework.org/)
   - [Expo](https://docs.expo.dev/)
   - [React Native](https://reactnative.dev/)

---

## ✅ Problema Resolvido?

Após resolver o problema, considere:

1. Documentar a solução (adicione a este arquivo)
2. Compartilhar com a equipe
3. Atualizar o `.vscode/QUICK_REFERENCE.md` se for um problema comum

---

**Última atualização:** 2024-10-28
