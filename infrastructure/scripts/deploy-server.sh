#!/bin/bash
# =============================================================================
# Elosaude Backend - Deploy para Servidor Linux
# =============================================================================
# Servidor: 192.168.40.25
# Usuário: elosaude
# =============================================================================

set -e

SERVER_IP="192.168.40.25"
SERVER_USER="elosaude"
TAG="${1:-latest}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Elosaude Backend - Deploy to Server             ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo -e "Server: ${YELLOW}${SERVER_USER}@${SERVER_IP}${NC}"
echo ""

# Step 1: Build Docker image
echo -e "${BLUE}[1/5] Construindo imagem Docker...${NC}"
cd "$REPO_ROOT/backend"
docker build -t elosaude-backend:${TAG} .
echo -e "${GREEN}✓ Imagem construída${NC}"

# Step 2: Save image
echo -e "${BLUE}[2/5] Exportando imagem...${NC}"
docker save elosaude-backend:${TAG} | gzip > /tmp/elosaude-backend.tar.gz
echo -e "${GREEN}✓ Imagem exportada$(ls -lh /tmp/elosaude-backend.tar.gz | awk '{print " ("$5")"}')${NC}"

# Step 3: Create remote deploy script
echo -e "${BLUE}[3/5] Criando script de deploy...${NC}"
cat > /tmp/deploy-remote.sh << 'REMOTESCRIPT'
#!/bin/bash
set -e

echo "=========================================="
echo "Carregando imagem Docker..."
echo "=========================================="
gunzip -c /tmp/elosaude-backend.tar.gz | sudo docker load
rm /tmp/elosaude-backend.tar.gz

echo ""
echo "=========================================="
echo "Parando containers anteriores..."
echo "=========================================="
sudo docker stop elosaude-backend elosaude-celery elosaude-redis 2>/dev/null || true
sudo docker rm elosaude-backend elosaude-celery elosaude-redis 2>/dev/null || true

echo ""
echo "=========================================="
echo "Criando rede e diretórios..."
echo "=========================================="
sudo docker network create elosaude-network 2>/dev/null || true
sudo mkdir -p /opt/elosaude/media
sudo mkdir -p /opt/elosaude/redis

echo ""
echo "=========================================="
echo "[1/3] Iniciando Redis..."
echo "=========================================="
sudo docker run -d \
    --name elosaude-redis \
    --restart unless-stopped \
    --network elosaude-network \
    -v /opt/elosaude/redis:/data \
    redis:7-alpine

echo "Aguardando Redis iniciar..."
sleep 3

echo ""
echo "=========================================="
echo "[2/3] Iniciando Backend (Django + Gunicorn)..."
echo "=========================================="
sudo docker run -d \
    --name elosaude-backend \
    --restart unless-stopped \
    --network elosaude-network \
    --add-host=host.docker.internal:host-gateway \
    -p 8005:8005 \
    -e SECRET_KEY="django-insecure-test-key-for-development-only" \
    -e DEBUG="False" \
    -e ALLOWED_HOSTS="*" \
    -e DB_NAME="elosaude_app" \
    -e DB_HOST="host.docker.internal" \
    -e DB_PORT="5432" \
    -e DB_USER="junior_app" \
    -e DB_PASSWORD="junior_app_2025" \
    -e REDIS_URL="redis://elosaude-redis:6379/0" \
    -e CELERY_BROKER_URL="redis://elosaude-redis:6379/0" \
    -e CELERY_RESULT_BACKEND="redis://elosaude-redis:6379/0" \
    -v /opt/elosaude/media:/app/media \
    elosaude-backend:latest

echo ""
echo "=========================================="
echo "[3/3] Iniciando Celery Worker..."
echo "=========================================="
sudo docker run -d \
    --name elosaude-celery \
    --restart unless-stopped \
    --network elosaude-network \
    --add-host=host.docker.internal:host-gateway \
    -e SECRET_KEY="django-insecure-test-key-for-development-only" \
    -e DEBUG="False" \
    -e ALLOWED_HOSTS="*" \
    -e DB_NAME="elosaude_app" \
    -e DB_HOST="host.docker.internal" \
    -e DB_PORT="5432" \
    -e DB_USER="junior_app" \
    -e DB_PASSWORD="junior_app_2025" \
    -e REDIS_URL="redis://elosaude-redis:6379/0" \
    -e CELERY_BROKER_URL="redis://elosaude-redis:6379/0" \
    -e CELERY_RESULT_BACKEND="redis://elosaude-redis:6379/0" \
    -v /opt/elosaude/media:/app/media \
    elosaude-backend:latest \
    celery -A elosaude_backend worker -l info

echo ""
echo "Aguardando inicialização..."
sleep 5

echo ""
echo "=========================================="
echo "Status dos containers:"
echo "=========================================="
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep elosaude || true

echo ""
echo "Testando API..."
curl -s http://localhost:8005/api/status/ || echo "Aguarde mais alguns segundos..."

echo ""
echo "=========================================="
echo "Deploy concluído!"
echo "=========================================="

# Cleanup
rm -f /tmp/deploy-remote.sh
REMOTESCRIPT

echo -e "${GREEN}✓ Script criado${NC}"

# Step 4: Copy files to server
echo -e "${BLUE}[4/5] Copiando arquivos para o servidor...${NC}"
echo -e "${YELLOW}Senha SSH: elosaude@1${NC}"
scp /tmp/elosaude-backend.tar.gz /tmp/deploy-remote.sh ${SERVER_USER}@${SERVER_IP}:/tmp/
echo -e "${GREEN}✓ Arquivos copiados${NC}"

# Step 5: Execute deploy on server (with TTY for sudo password)
echo -e "${BLUE}[5/5] Executando deploy no servidor...${NC}"
echo -e "${YELLOW}Senha SSH: elosaude@1${NC}"
echo -e "${YELLOW}Senha SUDO: (mesma senha do usuário)${NC}"
ssh -t ${SERVER_USER}@${SERVER_IP} "chmod +x /tmp/deploy-remote.sh && /tmp/deploy-remote.sh"

# Cleanup local
rm -f /tmp/elosaude-backend.tar.gz /tmp/deploy-remote.sh

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deploy Completo!                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo -e "URL: ${YELLOW}http://${SERVER_IP}:8005${NC}"
echo -e "Health: ${YELLOW}http://${SERVER_IP}:8005/api/status/${NC}"
