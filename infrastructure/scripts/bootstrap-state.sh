#!/bin/bash
# =============================================================================
# Elosaude Backend - Bootstrap Terraform State Bucket
# =============================================================================
# This script creates the GCS bucket for Terraform state storage.
# Run this ONCE before the first terraform init.
#
# Usage: ./bootstrap-state.sh <project-id> [region]
# Example: ./bootstrap-state.sh my-gcp-project us-central1
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: Project ID is required${NC}"
    echo "Usage: ./bootstrap-state.sh <project-id> [region]"
    exit 1
fi

PROJECT_ID="$1"
REGION="${2:-us-central1}"
BUCKET_NAME="elosaude-terraform-state-${PROJECT_ID}"

echo -e "${GREEN}=== Bootstrap Terraform State Bucket ===${NC}"
echo -e "Project ID: ${YELLOW}$PROJECT_ID${NC}"
echo -e "Region: ${YELLOW}$REGION${NC}"
echo -e "Bucket Name: ${YELLOW}$BUCKET_NAME${NC}"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth print-access-token &>/dev/null; then
    echo -e "${RED}Error: gcloud not authenticated. Run 'gcloud auth login' first.${NC}"
    exit 1
fi

# Set the project
gcloud config set project "$PROJECT_ID"

# Check if bucket already exists
if gsutil ls -b "gs://$BUCKET_NAME" &>/dev/null; then
    echo -e "${YELLOW}Bucket already exists: gs://$BUCKET_NAME${NC}"
else
    # Create the bucket
    echo -e "${GREEN}Creating bucket...${NC}"
    gsutil mb -l "$REGION" -p "$PROJECT_ID" "gs://$BUCKET_NAME"
    echo -e "${GREEN}✓ Bucket created${NC}"
fi

# Enable versioning for state history
echo -e "${GREEN}Enabling versioning...${NC}"
gsutil versioning set on "gs://$BUCKET_NAME"
echo -e "${GREEN}✓ Versioning enabled${NC}"

# Set lifecycle rule to delete old versions after 30 days (optional cost saving)
echo -e "${GREEN}Setting lifecycle rules...${NC}"
cat > /tmp/lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "numNewerVersions": 5,
          "isLive": false
        }
      }
    ]
  }
}
EOF
gsutil lifecycle set /tmp/lifecycle.json "gs://$BUCKET_NAME"
rm /tmp/lifecycle.json
echo -e "${GREEN}✓ Lifecycle rules set${NC}"

echo ""
echo -e "${GREEN}=== Bootstrap Complete ===${NC}"
echo ""
echo "To initialize Terraform with this backend, run:"
echo ""
echo "  cd infrastructure/terraform"
echo "  terraform init -backend-config=\"bucket=$BUCKET_NAME\""
echo ""
echo "Or add to your terraform.tfvars:"
echo ""
echo "  # Backend configuration (run terraform init after adding)"
echo "  # terraform init -backend-config=\"bucket=$BUCKET_NAME\""
