#!/bin/bash

# Script para parar Celery worker e beat

echo "======================================"
echo "Parando Celery"
echo "======================================"

# Stop Celery worker
echo "Parando Celery Worker..."
pkill -f 'celery.*worker'

# Stop Celery beat
echo "Parando Celery Beat..."
pkill -f 'celery.*beat'

# Wait a bit
sleep 2

# Check if processes are still running
if pgrep -f 'celery' > /dev/null; then
    echo ""
    echo "AVISO: Alguns processos Celery ainda estão rodando:"
    ps aux | grep celery | grep -v grep
    echo ""
    echo "Para forçar a parada, execute:"
    echo "  pkill -9 -f 'celery'"
else
    echo ""
    echo "✓ Celery parado com sucesso!"
fi

echo ""
