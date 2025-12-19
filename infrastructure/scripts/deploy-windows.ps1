# =============================================================================
# Elosaude Backend - Deploy para Windows Server
# =============================================================================
# Execute este script no servidor Windows via PowerShell (Admin)
#
# Pré-requisitos:
#   - Docker Desktop instalado e rodando
#   - Acesso à rede para copiar a imagem
#
# Uso: .\deploy-windows.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

# Configurações
$CONTAINER_NAME = "elosaude-backend"
$IMAGE_NAME = "elosaude-backend"
$IMAGE_TAG = "latest"
$PORT = 8005

# Variáveis de ambiente do backend
$DATABASE_URL = "postgresql://elosaude_user:mudar123@192.168.40.25:5432/elosaude"
$DJANGO_SECRET_KEY = "elosaude-production-secret-key-2024"

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Elosaude Backend - Deploy Windows    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verificar Docker
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version
    Write-Host "Docker OK" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    exit 1
}

# Carregar imagem (se existir arquivo tar)
$TAR_FILE = "C:\elosaude\elosaude-backend-latest.tar"
if (Test-Path $TAR_FILE) {
    Write-Host "[2/5] Carregando imagem do arquivo..." -ForegroundColor Yellow
    docker load -i $TAR_FILE
    Write-Host "Imagem carregada" -ForegroundColor Green
} else {
    Write-Host "[2/5] Arquivo tar não encontrado em $TAR_FILE" -ForegroundColor Yellow
    Write-Host "      Copie o arquivo elosaude-backend-latest.tar para C:\elosaude\" -ForegroundColor Yellow
}

# Parar container existente
Write-Host "[3/5] Parando container existente..." -ForegroundColor Yellow
docker stop $CONTAINER_NAME 2>$null
docker rm $CONTAINER_NAME 2>$null
Write-Host "Container antigo removido" -ForegroundColor Green

# Criar diretório para volumes
Write-Host "[4/5] Criando diretórios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "C:\elosaude\media" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\elosaude\staticfiles" | Out-Null

# Iniciar novo container
Write-Host "[5/5] Iniciando novo container..." -ForegroundColor Yellow
docker run -d `
    --name $CONTAINER_NAME `
    --restart unless-stopped `
    -p ${PORT}:${PORT} `
    -e DATABASE_URL="$DATABASE_URL" `
    -e DJANGO_SECRET_KEY="$DJANGO_SECRET_KEY" `
    -e DJANGO_DEBUG="False" `
    -e DJANGO_ALLOWED_HOSTS="*" `
    -v C:\elosaude\media:/app/media `
    -v C:\elosaude\staticfiles:/app/staticfiles `
    ${IMAGE_NAME}:${IMAGE_TAG}

Start-Sleep -Seconds 5

# Verificar status
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Status do Deploy                     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "Testando endpoint de saúde..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$PORT/api/status/" -UseBasicParsing -TimeoutSec 10
    Write-Host "API respondendo: $($response.StatusCode)" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Aguarde alguns segundos e teste: http://localhost:$PORT/api/status/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deploy Completo!                     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URL: http://192.168.40.185:$PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos úteis:" -ForegroundColor Yellow
Write-Host "  docker logs -f $CONTAINER_NAME    # Ver logs"
Write-Host "  docker restart $CONTAINER_NAME    # Reiniciar"
Write-Host "  docker stop $CONTAINER_NAME       # Parar"
