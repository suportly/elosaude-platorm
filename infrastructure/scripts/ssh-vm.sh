#!/bin/bash
# =============================================================================
# Elosaude Backend - SSH Helper Script
# =============================================================================
# Usage: ./ssh-vm.sh [environment] [command]
# Example: ./ssh-vm.sh prod
#          ./ssh-vm.sh prod "docker logs elosaude-backend"
#          ./ssh-vm.sh staging "docker ps"
# =============================================================================

set -e

# Default values
ENVIRONMENT="${1:-prod}"
COMMAND="${2:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be one of: dev, staging, prod${NC}"
    exit 1
fi

# Get VM info from Terraform
cd "$TERRAFORM_DIR"

if ! terraform output instance_name &>/dev/null; then
    echo -e "${RED}Error: Could not get instance name from Terraform.${NC}"
    echo "Make sure you have deployed the infrastructure first."
    exit 1
fi

INSTANCE_NAME=$(terraform output -raw instance_name)
ZONE=$(terraform output -raw zone 2>/dev/null || grep -E '^zone\s*=' terraform.tfvars | sed 's/.*=\s*"\(.*\)"/\1/' || echo "us-central1-a")

echo -e "${GREEN}=== SSH to Elosaude Backend VM ===${NC}"
echo -e "Instance: ${YELLOW}$INSTANCE_NAME${NC}"
echo -e "Zone: ${YELLOW}$ZONE${NC}"
echo ""

if [ -z "$COMMAND" ]; then
    # Interactive SSH session
    echo -e "${GREEN}Opening interactive SSH session...${NC}"
    echo -e "${YELLOW}Useful commands once connected:${NC}"
    echo "  docker ps                    # List running containers"
    echo "  docker logs elosaude-backend # View container logs"
    echo "  docker restart elosaude-backend # Restart the container"
    echo ""
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE"
else
    # Execute specific command
    echo -e "${GREEN}Executing command:${NC} $COMMAND"
    echo ""
    gcloud compute ssh "$INSTANCE_NAME" --zone="$ZONE" --command="$COMMAND"
fi
