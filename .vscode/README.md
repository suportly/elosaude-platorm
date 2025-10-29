# VS Code Configuration for Elosaúde Platform

This directory contains VS Code configuration files to enhance your development experience.

## 📁 Files Included

### `launch.json` - Debug Configurations
Pre-configured debug launchers for:

**Single Configurations:**
- **Django: Backend Server** - Run Django development server with debugging
- **Django: Migrations** - Run database migrations
- **Django: Make Migrations** - Create new migrations
- **Django: Shell** - Open Django shell
- **Django: Create Superuser** - Create admin user
- **Celery: Worker** - Run Celery worker with debugging
- **React Native: Start Metro** - Start Metro bundler
- **React Native: Run Android** - Launch Android app
- **React Native: Run iOS** - Launch iOS app (macOS only)
- **Attach to Django in Docker** - Debug Django running in Docker container

**Compound Configurations:**
- **Full Stack: Django + React Native** - Run both backend and mobile simultaneously
- **Backend: Django + Celery** - Run Django server and Celery worker together

### `tasks.json` - Automated Tasks
Quick tasks accessible via Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

**Django Tasks:**
- Django: Run Server
- Django: Make Migrations
- Django: Migrate
- Django: Create Superuser
- Django: Shell

**Celery Tasks:**
- Celery: Start Worker
- Celery: Start Beat

**Docker Tasks:**
- Docker: Start All Services (Default Build Task - Ctrl+Shift+B)
- Docker: Stop All Services
- Docker: View Logs
- Docker: Restart Backend

**React Native Tasks:**
- React Native: Start Metro
- React Native: Run Android
- React Native: Run iOS
- React Native: Install Dependencies

**Other Tasks:**
- Backend: Install Dependencies
- Full Stack: Start All

### `settings.json` - Workspace Settings
Optimized settings for:
- Python/Django development
- TypeScript/React Native development
- Code formatting (Black for Python, Prettier for JS/TS)
- File associations
- Auto-save
- Linting

### `extensions.json` - Recommended Extensions
List of recommended VS Code extensions for optimal development experience.

## 🚀 Quick Start

### 1. Install Recommended Extensions
When you open the workspace, VS Code will prompt you to install recommended extensions. Click "Install All" or install them manually:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Type "Extensions: Show Recommended Extensions"
3. Install all recommended extensions

### 2. Start Debugging

#### Option A: Using Debug Panel (F5)
1. Open the Debug panel (Ctrl+Shift+D / Cmd+Shift+D)
2. Select a configuration from the dropdown
3. Press F5 or click "Start Debugging"

**Recommended Configurations:**
- **Full Stack: Django + React Native** - Best for full-stack development
- **Django: Backend Server** - For backend-only development
- **React Native: Start Metro** - For mobile-only development

#### Option B: Using Tasks
1. Press Ctrl+Shift+B (Cmd+Shift+B on Mac) to run the default build task
   - This will start all Docker services
2. Or open Command Palette and type "Tasks: Run Task"
3. Select the task you want to run

### 3. Debugging Workflow Examples

#### Debug Django Backend (Local)
```
1. Stop Docker backend: Ctrl+Shift+P → "Docker: Stop All Services"
2. Start debug: F5 → Select "Django: Backend Server"
3. Set breakpoints in Python files
4. Make API requests (use Postman or mobile app)
5. VS Code will pause at breakpoints
```

#### Debug Django in Docker
```
1. Add to backend/Dockerfile:
   RUN pip install debugpy

2. Update docker-compose.yml backend service:
   command: python -m debugpy --listen 0.0.0.0:5678 manage.py runserver 0.0.0.0:8000
   ports:
     - "5678:5678"

3. Start Docker: Ctrl+Shift+B
4. Attach debugger: F5 → "Attach to Django in Docker"
5. Set breakpoints
```

#### Debug React Native
```
1. Start Metro: F5 → "React Native: Start Metro"
2. Run app: F5 → "React Native: Run Android" or "Run iOS"
3. Use React Native Debugger or Chrome DevTools
```

### 4. Useful Keyboard Shortcuts

**Debugging:**
- `F5` - Start/Continue debugging
- `F9` - Toggle breakpoint
- `F10` - Step over
- `F11` - Step into
- `Shift+F11` - Step out
- `Shift+F5` - Stop debugging

**Tasks:**
- `Ctrl+Shift+B` - Run default build task
- `Ctrl+Shift+P` → "Tasks: Run Task" - Show all tasks

**Terminal:**
- `` Ctrl+` `` - Toggle terminal
- `Ctrl+Shift+` `` - New terminal

**Navigation:**
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search in files
- `F12` - Go to definition
- `Alt+F12` - Peek definition

## 🔧 Customization

### Adding Custom Tasks
Edit `.vscode/tasks.json`:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "echo 'Hello World'",
  "problemMatcher": []
}
```

### Adding Custom Debug Configurations
Edit `.vscode/launch.json`:

```json
{
  "name": "My Debug Config",
  "type": "python",
  "request": "launch",
  "program": "${file}",
  "console": "integratedTerminal"
}
```

## 💡 Tips & Tricks

### 1. Multi-root Workspace (Alternative)
If you prefer to work with backend and mobile as separate projects:

```
File → Add Folder to Workspace → Select backend/
File → Add Folder to Workspace → Select mobile/
File → Save Workspace As... → elosaude.code-workspace
```

### 2. Python Virtual Environment
If running Django locally (not in Docker):

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Then update `.vscode/settings.json`:
```json
"python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python"
```

### 3. Database Inspection
Install SQLTools extensions and add connection:

```json
{
  "sqltools.connections": [
    {
      "name": "Elosaúde PostgreSQL",
      "driver": "PostgreSQL",
      "server": "localhost",
      "port": 5432,
      "database": "elosaude_db",
      "username": "postgres",
      "password": "postgres"
    }
  ]
}
```

### 4. REST Client
Create `.vscode/api-tests.http`:

```http
### Test Login
POST http://localhost:8000/api/accounts/test-login/
Content-Type: application/json

{
  "cpf": "12345678900",
  "password": "test"
}

### Get Profile
GET http://localhost:8000/api/beneficiaries/beneficiaries/me/
Authorization: Bearer {{access_token}}
```

### 5. Terminal Profiles
Add to `.vscode/settings.json`:

```json
"terminal.integrated.profiles.linux": {
  "Django": {
    "path": "bash",
    "args": ["-c", "cd backend && source venv/bin/activate && bash"]
  },
  "Mobile": {
    "path": "bash",
    "args": ["-c", "cd mobile && bash"]
  }
}
```

## 🐛 Troubleshooting

### Python Interpreter Not Found
1. Open Command Palette (Ctrl+Shift+P)
2. Type "Python: Select Interpreter"
3. Choose the correct Python interpreter

### Django Not Detected
1. Ensure `.env` file exists in `backend/`
2. Check `DJANGO_SETTINGS_MODULE` is set
3. Reload VS Code window

### React Native Debugger Not Connecting
1. Ensure Metro is running
2. In app, shake device and select "Debug"
3. Check port 8081 is not blocked

### Docker Tasks Not Working
1. Ensure Docker Desktop is running
2. Check `docker-compose.yml` is in workspace root
3. Try running manually: `docker-compose up -d`

## 📚 Additional Resources

- [VS Code Python Tutorial](https://code.visualstudio.com/docs/python/python-tutorial)
- [VS Code Django Tutorial](https://code.visualstudio.com/docs/python/tutorial-django)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [VS Code Tasks](https://code.visualstudio.com/docs/editor/tasks)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)

## ✅ Checklist

- [ ] Install recommended extensions
- [ ] Configure Python interpreter
- [ ] Test "Django: Backend Server" debug configuration
- [ ] Test "React Native: Start Metro" configuration
- [ ] Try running a task (Ctrl+Shift+B)
- [ ] Set a breakpoint and test debugging
- [ ] Install SQLTools for database inspection (optional)
- [ ] Configure REST Client for API testing (optional)

---

**Happy Coding!** 🚀
