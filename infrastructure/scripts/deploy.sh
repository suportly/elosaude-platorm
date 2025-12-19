#!/bin/bash
# =============================================================================
# Elosaude Backend - Full Deployment Script
# =============================================================================
# Usage: ./deploy.sh [environment] [--build] [--apply]
# Example: ./deploy.sh prod --build --apply
#          ./deploy.sh staging --apply
# =============================================================================

set -e

# Default values
ENVIRONMENT="${1:-prod}"
DO_BUILD=false
DO_APPLY=false

# Parse flags
shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            DO_BUILD=true
            shift
            ;;
        --apply)
            DO_APPLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Elosaude Backend - Deployment Script          ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Build Image: ${YELLOW}$DO_BUILD${NC}"
echo -e "Apply Terraform: ${YELLOW}$DO_APPLY${NC}"
echo ""

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be one of: dev, staging, prod${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: terraform not found. Please install Terraform 1.0+${NC}"
    exit 1
fi

if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud not found. Please install Google Cloud SDK${NC}"
    exit 1
fi

if ! gcloud auth print-access-token &>/dev/null; then
    echo -e "${RED}Error: gcloud not authenticated. Run 'gcloud auth login' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Build Docker image if requested
if [ "$DO_BUILD" = true ]; then
    echo -e "${BLUE}Building and pushing Docker image...${NC}"
    "$SCRIPT_DIR/build-push.sh" "$ENVIRONMENT" "latest"
    echo ""
fi

# Change to Terraform directory
cd "$TERRAFORM_DIR"

# Check for tfvars file
TFVARS_FILE="terraform.tfvars"
if [ -f "environments/${ENVIRONMENT}.tfvars" ]; then
    TFVARS_FILE="environments/${ENVIRONMENT}.tfvars"
fi

if [ ! -f "$TFVARS_FILE" ]; then
    echo -e "${RED}Error: $TFVARS_FILE not found${NC}"
    echo "Copy terraform.tfvars.example and fill in your values:"
    echo "  cp terraform.tfvars.example terraform.tfvars"
    exit 1
fi

echo -e "${BLUE}Using tfvars: $TFVARS_FILE${NC}"

# Initialize Terraform
echo -e "${BLUE}Initializing Terraform...${NC}"
terraform init -upgrade

# Run Terraform plan
echo ""
echo -e "${BLUE}Running Terraform plan...${NC}"
terraform plan -var-file="$TFVARS_FILE" -out=tfplan

# Apply if requested
if [ "$DO_APPLY" = true ]; then
    echo ""
    echo -e "${BLUE}Applying Terraform configuration...${NC}"
    terraform apply tfplan

    # Clean up plan file
    rm -f tfplan

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           Deployment Complete!                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
    echo ""

    # Show outputs
    echo -e "${BLUE}Deployment Information:${NC}"
    echo ""
    terraform output

    echo ""
    echo -e "${YELLOW}Test the deployment:${NC}"
    EXTERNAL_IP=$(terraform output -raw instance_external_ip 2>/dev/null || echo "PENDING")
    echo "  curl http://$EXTERNAL_IP:8005/api/status/"
else
    echo ""
    echo -e "${YELLOW}Plan generated. Review above and run with --apply to deploy:${NC}"
    echo "  ./deploy.sh $ENVIRONMENT --apply"

    # Clean up plan file
    rm -f tfplan
fi
