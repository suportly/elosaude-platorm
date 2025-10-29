# VS Code Quick Reference - Elosaúde Platform

## 🚀 Comandos Mais Usados

### Iniciar Desenvolvimento

```
1. Abrir projeto: code .
2. Instalar extensões: Popup → "Install All"
3. Iniciar backend: Ctrl+Shift+B
4. Iniciar mobile: F5 → "React Native: Start Metro"
```

## ⌨️ Atalhos Essenciais

### Debug & Execução
| Atalho | Ação |
|--------|------|
| `F5` | Start/Continue Debug |
| `Ctrl+Shift+B` | Run Build Task (Docker Start) |
| `Ctrl+Shift+P` | Command Palette |
| `F9` | Toggle Breakpoint |
| `F10` | Step Over |
| `F11` | Step Into |
| `Shift+F5` | Stop Debug |

### Edição
| Atalho | Ação |
|--------|------|
| `Ctrl+/` | Toggle Comment |
| `Alt+Up/Down` | Move Line |
| `Shift+Alt+Up/Down` | Copy Line |
| `Ctrl+D` | Select Next Occurrence |
| `Ctrl+Shift+L` | Select All Occurrences |
| `Alt+Click` | Add Cursor |

### Navegação
| Atalho | Ação |
|--------|------|
| `Ctrl+P` | Quick Open File |
| `Ctrl+Shift+O` | Go to Symbol |
| `F12` | Go to Definition |
| `Alt+F12` | Peek Definition |
| `Ctrl+Shift+F` | Search in Files |

### Terminal
| Atalho | Ação |
|--------|------|
| `` Ctrl+` `` | Toggle Terminal |
| `Ctrl+Shift+` `` | New Terminal |

## 📝 Snippets

### Django
```python
djmodel    # → Full Django model
djserializer # → DRF serializer
djviewset  # → DRF ViewSet
djaction   # → Custom ViewSet action
djtest     # → Django test case
```

### React Native
```typescript
rnfc       # → Functional component
rnscreen   # → Screen component
rtkapi     # → RTK Query API
reduxslice # → Redux slice
rntest     # → React Native test
```

## 🎯 Debug Configurations

### Backend
```
F5 → Django: Backend Server    # Debug Django local
F5 → Django: Shell             # Interactive shell
F5 → Celery: Worker            # Debug Celery tasks
F5 → Attach to Django in Docker # Debug no container
```

### Mobile
```
F5 → React Native: Start Metro # Metro bundler
F5 → React Native: Run Android # Android emulator
F5 → React Native: Run iOS     # iOS simulator
```

### Full Stack
```
F5 → Full Stack: Django + React Native # Tudo junto!
F5 → Backend: Django + Celery          # Backend completo
```

## 🔧 Tasks Frequentes

### Via Command Palette (Ctrl+Shift+P → Tasks: Run Task)

```
Django: Run Server           # Inicia Django
Django: Make Migrations      # Cria migrations
Django: Migrate              # Aplica migrations
Django: Create Superuser     # Cria admin

Docker: Start All Services   # Inicia tudo (ou Ctrl+Shift+B)
Docker: Stop All Services    # Para tudo
Docker: View Logs            # Ver logs
Docker: Restart Backend      # Restart Django

React Native: Start Metro    # Metro bundler
React Native: Run Android    # Executar Android
React Native: Install Dependencies # npm install
```

## 🧪 Testar APIs (REST Client)

### No arquivo `.vscode/api-tests.http`:

1. Abrir arquivo: `Ctrl+P` → `api-tests.http`
2. Clicar em **"Send Request"** acima de cada teste
3. Ver resposta na aba que abre ao lado

### Exemplos disponíveis:
- ✅ Test Login
- ✅ Get Profile
- ✅ Create Guide
- ✅ Create Reimbursement
- ✅ List Providers
- ✅ E mais 50+ exemplos!

## 🎨 Formatação Automática

### Configurado para:
- **Python**: Black formatter
- **TypeScript/JavaScript**: Prettier
- **Auto format on save**: Ativado

### Formatar manualmente:
```
Shift+Alt+F  # Format Document
```

## 📦 Extensões Instaladas

### Backend
- ✅ Python
- ✅ Pylance
- ✅ Django
- ✅ Black Formatter

### Frontend
- ✅ ESLint
- ✅ Prettier
- ✅ React Native Tools
- ✅ ES7 React Snippets

### DevOps
- ✅ Docker
- ✅ REST Client

### Produtividade
- ✅ GitLens
- ✅ Error Lens
- ✅ Path Intellisense

## 🐛 Troubleshooting Rápido

### Python não encontrado?
```
Ctrl+Shift+P → Python: Select Interpreter
```

### Docker task não funciona?
```bash
# Verificar se Docker está rodando
docker ps

# Tentar manual
docker-compose up -d
```

### Hot reload não funciona?
```bash
# Mobile
cd mobile
npm start -- --reset-cache

# Django já tem por padrão
```

### Breakpoint não para?
```
1. Verificar se está em modo debug (F5)
2. Verificar console de debug (painel inferior)
3. Tentar parar e iniciar novamente
```

## 💡 Dicas Profissionais

### 1. Breadcrumbs
`Ctrl+Shift+.` - Toggle breadcrumbs (navegação de estrutura)

### 2. Zen Mode
`Ctrl+K Z` - Modo foco (esconde tudo exceto editor)

### 3. Split Editor
`Ctrl+\` - Divide editor verticalmente

### 4. Multi-cursor Column
`Ctrl+Alt+Up/Down` - Cursor em múltiplas linhas

### 5. Rename Symbol
`F2` - Renomear símbolo (refactoring seguro)

### 6. Problems Panel
`Ctrl+Shift+M` - Ver todos os erros/warnings

### 7. Source Control
`Ctrl+Shift+G` - Git interface

### 8. Extensions
`Ctrl+Shift+X` - Gerenciar extensões

## 📚 Workflows Comuns

### 1. Nova Feature Backend
```
1. F5 → Django: Shell (testar modelo)
2. Editar models.py
3. Ctrl+Shift+P → Django: Make Migrations
4. Ctrl+Shift+P → Django: Migrate
5. F5 → Django: Backend Server (testar)
```

### 2. Nova Feature Mobile
```
1. Criar component (usar snippet rnfc)
2. F5 → React Native: Start Metro
3. Editar código
4. Hot reload automático
5. Testar no emulador
```

### 3. Debug Full Stack
```
1. F5 → Full Stack: Django + React Native
2. Adicionar breakpoints em ambos
3. Fazer request do mobile
4. Debug no backend e frontend
```

### 4. Testar API
```
1. Abrir .vscode/api-tests.http
2. Executar login
3. Token salvo automaticamente
4. Testar outros endpoints
```

## ⚡ Performance Tips

### Excluir pastas da busca:
```json
// Já configurado em settings.json
"search.exclude": {
  "**/node_modules": true,
  "**/venv": true,
  "**/__pycache__": true
}
```

### Desabilitar features pesadas (se necessário):
```json
"editor.minimap.enabled": false,
"editor.renderWhitespace": "none"
```

## 🎓 Aprender Mais

### Dentro do VS Code:
- `Ctrl+Shift+P` → `Help: Interactive Playground`
- `Ctrl+Shift+P` → `Help: Keyboard Shortcuts Reference`

### Online:
- [VS Code Tips & Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [Python in VS Code](https://code.visualstudio.com/docs/python/python-tutorial)
- [React Native Debugging](https://reactnative.dev/docs/debugging)

## 📋 Checklist Diário

- [ ] `Ctrl+Shift+B` - Iniciar backend
- [ ] `F5 → Start Metro` - Iniciar mobile
- [ ] Verificar se há updates de extensões
- [ ] Usar snippets para código repetitivo
- [ ] Formatar antes de commit (`Shift+Alt+F`)
- [ ] Testar APIs com REST Client antes do commit

---

**Atalho do Atalho:** `Ctrl+K Ctrl+S` - Ver todos os atalhos! 🚀
