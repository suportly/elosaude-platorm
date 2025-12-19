#!/bin/bash
# =============================================================================
# Elosaude Backend - Build and Push Docker Image
# =============================================================================
# Usage: ./build-push.sh [environment] [tag]
# Example: ./build-push.sh prod latest
#          ./build-push.sh staging v1.2.3
# =============================================================================

set -e

# Default values
ENVIRONMENT="${1:-prod}"
TAG="${2:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

echo -e "${GREEN}=== Elosaude Backend - Build and Push ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Tag: $TAG"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth print-access-token &>/dev/null; then
    echo -e "${RED}Error: gcloud not authenticated. Run 'gcloud auth login' first.${NC}"
    exit 1
fi

# Get project ID and region from Terraform
cd "$TERRAFORM_DIR"

if [ ! -f "terraform.tfvars" ]; then
    echo -e "${RED}Error: terraform.tfvars not found. Copy terraform.tfvars.example and fill in your values.${NC}"
    exit 1
fi

# Extract values from tfvars (simple parsing)
PROJECT_ID=$(grep -E '^project_id\s*=' terraform.tfvars | sed 's/.*=\s*"\(.*\)"/\1/')
REGION=$(grep -E '^region\s*=' terraform.tfvars | sed 's/.*=\s*"\(.*\)"/\1/' || echo "us-central1")

if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: Could not extract project_id from terraform.tfvars${NC}"
    exit 1
fi

REGISTRY_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/elosaude-backend-${ENVIRONMENT}"
IMAGE_URL="${REGISTRY_URL}/backend:${TAG}"

echo -e "${YELLOW}Project ID: $PROJECT_ID${NC}"
echo -e "${YELLOW}Registry URL: $REGISTRY_URL${NC}"
echo -e "${YELLOW}Image URL: $IMAGE_URL${NC}"
echo ""

# Configure Docker for Artifact Registry
echo -e "${GREEN}Configuring Docker for Artifact Registry...${NC}"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
cd "$REPO_ROOT/backend"
docker build -t "$IMAGE_URL" .

# Also tag as latest if not already
if [ "$TAG" != "latest" ]; then
    docker tag "$IMAGE_URL" "${REGISTRY_URL}/backend:latest"
fi

# Push to Artifact Registry
echo -e "${GREEN}Pushing image to Artifact Registry...${NC}"
docker push "$IMAGE_URL"

if [ "$TAG" != "latest" ]; then
    docker push "${REGISTRY_URL}/backend:latest"
fi

echo ""
echo -e "${GREEN}=== Build and Push Complete ===${NC}"
echo -e "Image: ${YELLOW}$IMAGE_URL${NC}"
echo ""
echo "To deploy this image, update container_image in terraform.tfvars and run:"
echo "  cd infrastructure/terraform && terraform apply"
echo ""
echo "Or use the deploy script:"
echo "  ./infrastructure/scripts/deploy.sh $ENVIRONMENT"
