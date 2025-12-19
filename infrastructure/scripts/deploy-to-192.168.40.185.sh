#!/bin/bash
# =============================================================================
# Elosaude Backend - Deploy to Server 192.168.40.185
# =============================================================================
# This script builds the Docker image locally and deploys to the server.
#
# Prerequisites on server:
#   - Docker installed
#   - Docker Compose installed
#   - .env.prod file with environment variables
#
# Usage: ./deploy-to-192.168.40.185.sh
# =============================================================================

set -e

# Configuration
SERVER_IP="192.168.40.185"
SERVER_USER="victor"
TAG="latest"
CONTAINER_NAME="elosaude-backend"
IMAGE_NAME="elosaude-backend"
REMOTE_DIR="/opt/elosaude"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Elosaude Backend - Deploy to 192.168.40.185           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Server: ${YELLOW}${SERVER_USER}@${SERVER_IP}${NC}"
echo ""

# Step 1: Build Docker image locally
echo -e "${BLUE}[1/5] Building Docker image...${NC}"
cd "$REPO_ROOT/backend"
docker build -t "${IMAGE_NAME}:${TAG}" .
echo -e "${GREEN}✓ Image built${NC}"

# Step 2: Save image to tar file
echo -e "${BLUE}[2/5] Exporting image...${NC}"
TEMP_FILE="/tmp/${IMAGE_NAME}-${TAG}.tar"
docker save "${IMAGE_NAME}:${TAG}" -o "$TEMP_FILE"
echo -e "${GREEN}✓ Image exported to $TEMP_FILE${NC}"

# Step 3: Copy files to server
echo -e "${BLUE}[3/5] Copying files to server...${NC}"
echo -e "${YELLOW}You will be prompted for the password (VVV01inova)${NC}"

# Create remote directory and copy files
ssh "${SERVER_USER}@${SERVER_IP}" "mkdir -p ${REMOTE_DIR}"
scp "$TEMP_FILE" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"
scp "$REPO_ROOT/backend/docker-compose.prod.yml" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/docker-compose.yml"
echo -e "${GREEN}✓ Files copied${NC}"

# Step 4: Deploy on server
echo -e "${BLUE}[4/5] Deploying on server...${NC}"
ssh "${SERVER_USER}@${SERVER_IP}" << 'ENDSSH'
cd /opt/elosaude

echo "Loading Docker image..."
docker load -i elosaude-backend-latest.tar
rm elosaude-backend-latest.tar

echo "Stopping existing container..."
docker stop elosaude-backend 2>/dev/null || true
docker rm elosaude-backend 2>/dev/null || true

echo "Starting container..."
docker run -d \
    --name elosaude-backend \
    --restart unless-stopped \
    -p 8005:8005 \
    -e DATABASE_URL="postgresql://elosaude_user:mudar123@192.168.40.25:5432/elosaude" \
    -e DJANGO_SECRET_KEY="elosaude-production-secret-key-2024" \
    -e DJANGO_DEBUG="False" \
    -e DJANGO_ALLOWED_HOSTS="*" \
    -v /opt/elosaude/media:/app/media \
    elosaude-backend:latest

echo "Waiting for container to start..."
sleep 5

echo "Container status:"
docker ps | grep elosaude-backend || echo "Container not running!"

echo "Testing health endpoint..."
curl -s http://localhost:8005/api/status/ || echo "Health check failed"
ENDSSH

echo -e "${GREEN}✓ Deployed${NC}"

# Step 5: Cleanup local temp file
echo -e "${BLUE}[5/5] Cleaning up...${NC}"
rm -f "$TEMP_FILE"
echo -e "${GREEN}✓ Cleanup done${NC}"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Deployment Complete!                         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Backend URL: ${YELLOW}http://${SERVER_IP}:8005${NC}"
echo -e "Health Check: ${YELLOW}http://${SERVER_IP}:8005/api/status/${NC}"
echo ""
echo -e "To check logs: ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'docker logs -f elosaude-backend'${NC}"
