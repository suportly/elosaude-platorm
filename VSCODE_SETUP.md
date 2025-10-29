# VS Code Setup Guide - Elosaúde Platform

Este guia irá configurar seu VS Code para uma experiência de desenvolvimento otimizada no projeto Elosaúde.

## 🚀 Setup Rápido (5 minutos)

### 1. Abrir o Projeto no VS Code

```bash
cd elosaude-platform
code .
```

### 2. Instalar Extensões Recomendadas

Quando abrir o projeto, o VS Code mostrará um popup perguntando se você quer instalar as extensões recomendadas.

**Clique em "Install All"** ou:

1. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
2. Digite: `Extensions: Show Recommended Extensions`
3. Clique em "Install" em cada extensão

#### Extensões Essenciais:
- ✅ **Python** - Suporte completo Python/Django
- ✅ **Pylance** - IntelliSense poderoso para Python
- ✅ **Django** - Syntax highlighting e snippets
- ✅ **ESLint** - Linting para JavaScript/TypeScript
- ✅ **Prettier** - Formatação de código
- ✅ **React Native Tools** - Debugging e IntelliSense
- ✅ **Docker** - Gerenciamento de containers
- ✅ **REST Client** - Testar APIs direto do VS Code

### 3. Configurar Python Interpreter

1. Pressione `Ctrl+Shift+P`
2. Digite: `Python: Select Interpreter`
3. Selecione o interpretador Python do sistema ou do venv

### 4. Pronto! 🎉

Agora você tem acesso a:
- ✅ Debug configurations prontas
- ✅ Tasks automatizadas
- ✅ Snippets personalizados
- ✅ Formatação automática
- ✅ Linting configurado

## 🎯 Recursos Principais

### Debug Configurations

Pressione `F5` e escolha uma das configurações:

#### Backend (Django)
- **Django: Backend Server** - Inicia o servidor Django com debug
  - Breakpoints funcionam normalmente
  - Hot reload automático
  - Console interativo

- **Django: Shell** - Abre o Django shell interativo
  - Perfeito para testar models e queries
  - IntelliSense completo

- **Celery: Worker** - Debug de tasks Celery
  - Breakpoints em tasks assíncronas
  - Visualização de filas

#### Frontend (React Native)
- **React Native: Start Metro** - Inicia o Metro bundler
  - Hot reload automático
  - Fast refresh

- **React Native: Run Android** - Executa no emulador Android
  - Debug remoto via Chrome DevTools
  - Logs em tempo real

#### Full Stack
- **Full Stack: Django + React Native** - Inicia tudo junto!
  - Backend e frontend simultaneamente
  - Perfect para desenvolvimento full-stack

### Tasks (Ctrl+Shift+B)

Acesse pelo Command Palette ou use o atalho `Ctrl+Shift+B`:

#### Django Tasks
```
Tasks: Run Task → Django: Run Server
Tasks: Run Task → Django: Make Migrations
Tasks: Run Task → Django: Migrate
Tasks: Run Task → Django: Create Superuser
Tasks: Run Task → Django: Shell
```

#### Docker Tasks
```
Tasks: Run Task → Docker: Start All Services  (ou Ctrl+Shift+B)
Tasks: Run Task → Docker: Stop All Services
Tasks: Run Task → Docker: View Logs
Tasks: Run Task → Docker: Restart Backend
```

#### React Native Tasks
```
Tasks: Run Task → React Native: Start Metro
Tasks: Run Task → React Native: Run Android
Tasks: Run Task → React Native: Run iOS
Tasks: Run Task → React Native: Install Dependencies
```

### Code Snippets

Digite os prefixes e pressione `Tab`:

#### Django
- `djmodel` - Cria um model completo
- `djserializer` - Cria um serializer
- `djviewset` - Cria um ViewSet
- `djaction` - Cria uma custom action
- `djtest` - Cria um test case

#### React Native
- `rnfc` - React Native Functional Component
- `rnscreen` - Screen component completo
- `rtkapi` - RTK Query API service
- `reduxslice` - Redux Toolkit slice
- `rntest` - React Native test

#### TypeScript
- `tsinterface` - TypeScript interface
- `tstype` - TypeScript type

## 🔧 Workflows de Desenvolvimento

### Workflow 1: Desenvolvimento Backend

```
1. Iniciar serviços Docker:
   Ctrl+Shift+B (ou F5 → "Django: Backend Server")

2. Fazer alterações no código Python

3. Testar com breakpoints:
   - Clique na margem esquerda para adicionar breakpoint
   - Faça request via Postman ou mobile app
   - VS Code pausa no breakpoint

4. Django shell para testes rápidos:
   F5 → "Django: Shell"
```

### Workflow 2: Desenvolvimento Mobile

```
1. Iniciar Metro bundler:
   F5 → "React Native: Start Metro"

2. Executar app:
   F5 → "React Native: Run Android" (ou iOS)

3. Fazer alterações no código TypeScript
   - Hot reload automático
   - Fast refresh preserva estado

4. Debug com Chrome DevTools:
   - Shake no device
   - Select "Debug"
```

### Workflow 3: Full Stack Development

```
1. Iniciar tudo:
   F5 → "Full Stack: Django + React Native"

2. Trabalhar em ambos os lados:
   - Backend: breakpoints em Python
   - Frontend: console.log aparece no terminal

3. Testar integração completa
```

### Workflow 4: Database Changes

```
1. Editar models.py

2. Criar migrations:
   Ctrl+Shift+P → "Tasks: Run Task" → "Django: Make Migrations"

3. Aplicar migrations:
   Ctrl+Shift+P → "Tasks: Run Task" → "Django: Migrate"

4. Verificar no DB:
   - Usar SQLTools extension
   - Ou Django Shell: F5 → "Django: Shell"
```

## 💡 Dicas Profissionais

### 1. Multi-cursor Editing
- `Alt+Click` - Adiciona cursor
- `Ctrl+Alt+Up/Down` - Cursor acima/abaixo
- `Ctrl+D` - Seleciona próxima ocorrência
- `Ctrl+Shift+L` - Seleciona todas ocorrências

### 2. Quick Navigation
- `Ctrl+P` - Quick open file
- `Ctrl+Shift+O` - Go to symbol
- `F12` - Go to definition
- `Alt+F12` - Peek definition
- `Shift+F12` - Find all references

### 3. Search & Replace
- `Ctrl+F` - Find in file
- `Ctrl+H` - Replace in file
- `Ctrl+Shift+F` - Find in all files
- `Ctrl+Shift+H` - Replace in all files

### 4. Terminal Integrado
- `` Ctrl+` `` - Toggle terminal
- `Ctrl+Shift+` `` - New terminal
- `Ctrl+\`` - Split terminal

### 5. Git Integration
- `Ctrl+Shift+G` - Open source control
- Stage/unstage files visualmente
- Commit messages com preview
- GitLens mostra blame inline

### 6. REST Client (Testando APIs sem Postman)

Crie arquivo `.vscode/api.http`:

```http
### Login
POST http://localhost:8000/api/accounts/test-login/
Content-Type: application/json

{
  "cpf": "12345678900",
  "password": "test"
}

###
@token = {{login.response.body.access}}

### Get Profile
GET http://localhost:8000/api/beneficiaries/beneficiaries/me/
Authorization: Bearer {{token}}

### Create Guide
POST http://localhost:8000/api/guides/tiss_guides/
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "guide_type": "CONSULTATION",
  "diagnosis": "Consulta de rotina"
}
```

Clique em "Send Request" acima de cada requisição!

### 7. Debugging Django no Docker

Se quiser debugar Django rodando no Docker:

1. Adicione ao `backend/requirements.txt`:
```
debugpy
```

2. Atualize `docker-compose.yml`:
```yaml
backend:
  command: python -m debugpy --listen 0.0.0.0:5678 manage.py runserver 0.0.0.0:8000
  ports:
    - "8000:8000"
    - "5678:5678"  # Debug port
```

3. Use a configuração: `F5 → "Attach to Django in Docker"`

## 🎨 Personalização

### Temas Recomendados
- **GitHub Dark** (já nas extensões recomendadas)
- **One Dark Pro**
- **Dracula Official**

Instalar: `Ctrl+K Ctrl+T` → Escolher tema

### Configurações Personalizadas

Adicione ao `.vscode/settings.json`:

```json
{
  // Seu tema favorito
  "workbench.colorTheme": "GitHub Dark",

  // Font ligatures
  "editor.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,

  // Mini map
  "editor.minimap.enabled": false,

  // Bracket pair colorization
  "editor.bracketPairColorization.enabled": true,

  // Smooth scrolling
  "editor.smoothScrolling": true,

  // Cursor
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on"
}
```

## 📚 Recursos Adicionais

### Documentação
- [VS Code Python Tutorial](https://code.visualstudio.com/docs/python/python-tutorial)
- [VS Code Django Tutorial](https://code.visualstudio.com/docs/python/tutorial-django)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [VS Code Tips & Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)

### Atalhos Úteis (Cheat Sheet)

#### Geral
- `Ctrl+Shift+P` - Command Palette
- `Ctrl+P` - Quick Open
- `Ctrl+,` - Settings
- `Ctrl+K Ctrl+S` - Keyboard Shortcuts

#### Edição
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Copy line up/down
- `Ctrl+Shift+K` - Delete line
- `Ctrl+Enter` - Insert line below
- `Ctrl+/` - Toggle comment

#### Debug
- `F5` - Start/Continue
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Shift+F5` - Stop

## 🐛 Troubleshooting

### Python interpreter não encontrado
```bash
# Linux/Mac
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Windows
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Depois: `Ctrl+Shift+P` → `Python: Select Interpreter`

### Node modules não encontrados
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### Docker tasks não funcionam
1. Verificar se Docker Desktop está rodando
2. Verificar se está na raiz do projeto
3. Tentar manualmente: `docker-compose up -d`

### Formatação não funciona
1. Instalar Prettier: `Ctrl+Shift+P` → `Extensions: Install Extensions` → "Prettier"
2. Verificar: `Ctrl+Shift+P` → `Format Document With...` → escolher "Prettier"

## ✅ Checklist de Setup

- [ ] VS Code instalado
- [ ] Extensões recomendadas instaladas
- [ ] Python interpreter configurado
- [ ] Node.js instalado
- [ ] Docker instalado e rodando
- [ ] Testado debug configuration Django
- [ ] Testado debug configuration React Native
- [ ] Testado tasks (Ctrl+Shift+B)
- [ ] Snippets funcionando
- [ ] Git configurado

## 🎓 Próximos Passos

1. **Explore os snippets**: Digite `dj` ou `rn` e veja as opções
2. **Configure seu tema**: `Ctrl+K Ctrl+T`
3. **Personalize atalhos**: `Ctrl+K Ctrl+S`
4. **Instale fontes com ligatures**: [Fira Code](https://github.com/tonsky/FiraCode)
5. **Configure GitLens**: Para ver histórico inline
6. **Experimente REST Client**: Crie `.vscode/api.http`

---

**Pronto para desenvolver! 🚀**

Qualquer dúvida, consulte:
- `.vscode/README.md` - Documentação completa das configs
- `README.md` - Documentação do projeto
- `QUICKSTART.md` - Guia de início rápido
