#!/bin/bash

# Start Django Server Script
# This script starts the Django development server with proper configuration

echo "🚀 Starting Elosaúde Backend Server..."
echo ""

# Check if pyenv is available
if ! command -v pyenv &> /dev/null; then
    echo "❌ Error: pyenv not found"
    echo "Please install pyenv or use: ~/.pyenv/versions/elosaude-platforma-3.11.11/bin/python manage.py runserver 0.0.0.0:8005"
    exit 1
fi

# Activate pyenv environment
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
pyenv shell elosaude-platforma-3.11.11

# Display configuration
echo "📋 Configuration:"
echo "  - Python: $(python --version)"
echo "  - Database: elosaude_db (PostgreSQL)"
echo "  - Host: 0.0.0.0:8005"
echo ""
echo "  - Access from:"
echo "    • Browser: http://localhost:8005"
echo "    • Android Emulator: http://10.0.2.2:8005"
echo "    • iOS/Physical Device: http://192.168.77.11:8005"
echo ""
echo "  - API Endpoints:"
echo "    • Swagger Docs: http://0.0.0.0:8005/swagger/"
echo "    • Django Admin: http://0.0.0.0:8005/admin/ (admin/admin123)"
echo "    • Test Login: POST http://0.0.0.0:8005/api/accounts/test-login/"
echo ""
echo "🌐 Starting server on 0.0.0.0:8005..."
echo "   Press Ctrl+C to stop"
echo ""

# Start Django server
python manage.py runserver 0.0.0.0:8005
