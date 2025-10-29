#!/bin/bash

# Script para iniciar Celery worker e beat para o projeto Elosaúde

echo "======================================"
echo "Iniciando Celery para Elosaúde"
echo "======================================"

# Check if Redis is running (via Docker or locally)
echo "Verificando Redis..."
if docker exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✓ Redis está rodando (Docker)"
elif redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    echo "✓ Redis está rodando (local)"
else
    echo "ERRO: Redis não está rodando!"
    echo "Por favor, inicie o Redis primeiro:"
    echo "  docker start redis"
    echo "  ou"
    echo "  redis-server"
    exit 1
fi

echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "../.venv" ]; then
    echo "Ativando virtualenv..."
    source ../.venv/bin/activate
elif [ -d ".venv" ]; then
    echo "Ativando virtualenv..."
    source .venv/bin/activate
fi

# Start Celery worker in background
echo "Iniciando Celery Worker..."
celery -A elosaude_backend worker --loglevel=info --logfile=logs/celery_worker.log --detach

# Wait a bit
sleep 2

# Start Celery beat in background
echo "Iniciando Celery Beat (scheduler)..."
celery -A elosaude_backend beat --loglevel=info --logfile=logs/celery_beat.log --detach

echo ""
echo "======================================"
echo "✓ Celery iniciado com sucesso!"
echo "======================================"
echo ""
echo "Worker log: logs/celery_worker.log"
echo "Beat log: logs/celery_beat.log"
echo ""
echo "Para verificar o status:"
echo "  ps aux | grep celery"
echo ""
echo "Para parar o Celery:"
echo "  pkill -f 'celery worker'"
echo "  pkill -f 'celery beat'"
echo ""
echo "Para ver os logs em tempo real:"
echo "  tail -f logs/celery_worker.log"
echo "  tail -f logs/celery_beat.log"
echo ""
