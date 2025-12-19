# Quickstart: Google Cloud Backend Deployment

**Feature**: 005-gcloud-backend-deploy
**Date**: 2025-12-17

## Prerequisites

Before deploying, ensure you have:

- [ ] Google Cloud account with billing enabled
- [ ] GCP project created (note the project ID)
- [ ] `gcloud` CLI installed and authenticated
- [ ] `terraform` CLI installed (v1.0+)
- [ ] `docker` installed and running
- [ ] External PostgreSQL database credentials

## Quick Deploy (5 Steps)

### Step 1: Authenticate with GCP

```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable compute.googleapis.com \
    artifactregistry.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com
```

### Step 2: Create Terraform State Bucket

```bash
# Create bucket for Terraform state
gsutil mb -l us-central1 gs://elosaude-terraform-state

# Enable versioning
gsutil versioning set on gs://elosaude-terraform-state
```

### Step 3: Configure Variables

```bash
cd infrastructure/terraform

# Copy example and edit
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
vim terraform.tfvars
```

Required variables in `terraform.tfvars`:
```hcl
project_id       = "your-gcp-project-id"
region           = "us-central1"
zone             = "us-central1-a"
environment      = "prod"

# Database (your existing PostgreSQL)
database_url     = "postgresql://user:password@host:5432/dbname"

# Django
django_secret_key = "your-secret-key-here"

# Optional: Restrict SSH access
allowed_ssh_ranges = ["YOUR_IP/32"]
```

### Step 4: Deploy Infrastructure

```bash
# Initialize Terraform
terraform init -backend-config="bucket=elosaude-terraform-state"

# Preview changes
terraform plan

# Apply (creates VM, firewall rules, registry)
terraform apply
```

Save the outputs:
```bash
# Note these values
terraform output instance_external_ip
terraform output registry_url
```

### Step 5: Build and Deploy Container

```bash
# Configure Docker for Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build image
cd ../../backend
docker build -t us-central1-docker.pkg.dev/YOUR_PROJECT/elosaude-backend-prod/backend:latest .

# Push to registry
docker push us-central1-docker.pkg.dev/YOUR_PROJECT/elosaude-backend-prod/backend:latest

# Restart VM to pull new image (or SSH and restart container)
gcloud compute instances reset elosaude-backend-prod --zone=us-central1-a
```

## Verify Deployment

```bash
# Get the external IP
EXTERNAL_IP=$(terraform output -raw instance_external_ip)

# Test health endpoint
curl http://$EXTERNAL_IP:8005/api/health/

# Expected response:
# {"status": "ok"}
```

## Deployment Script

For convenience, use the provided deployment script:

```bash
# Full deployment (infrastructure + container)
./infrastructure/scripts/deploy.sh prod

# Just rebuild and push container
./infrastructure/scripts/build-push.sh prod

# SSH into VM for debugging
./infrastructure/scripts/ssh-vm.sh prod
```

## Update Mobile App

After deployment, update the mobile app API configuration:

```typescript
// mobile/src/config/api.ts
export const API_CONFIG = {
  production: {
    baseUrl: 'http://EXTERNAL_IP:8005',
  },
  // ... other environments
};
```

## Common Operations

### View Logs

```bash
# Via gcloud
gcloud logging read "resource.type=gce_instance AND resource.labels.instance_id=INSTANCE_ID" --limit=50

# Or SSH into VM
gcloud compute ssh elosaude-backend-prod --zone=us-central1-a
docker logs elosaude-backend
```

### Restart Container

```bash
# SSH and restart
gcloud compute ssh elosaude-backend-prod --zone=us-central1-a
docker restart elosaude-backend
```

### Deploy New Version

```bash
# Build with new tag
docker build -t us-central1-docker.pkg.dev/PROJECT/elosaude-backend-prod/backend:v1.2.3 .
docker push us-central1-docker.pkg.dev/PROJECT/elosaude-backend-prod/backend:v1.2.3

# Update container image on VM
gcloud compute instances update-container elosaude-backend-prod \
    --zone=us-central1-a \
    --container-image=us-central1-docker.pkg.dev/PROJECT/elosaude-backend-prod/backend:v1.2.3
```

### Destroy Infrastructure

```bash
cd infrastructure/terraform
terraform destroy
```

## Troubleshooting

### Container Not Starting

1. SSH into VM: `gcloud compute ssh elosaude-backend-prod --zone=us-central1-a`
2. Check container logs: `docker logs elosaude-backend`
3. Check if container is running: `docker ps -a`

### Cannot Connect to Database

1. Verify DATABASE_URL in terraform.tfvars
2. Ensure PostgreSQL allows connections from GCP IP range
3. Test from VM: `docker exec elosaude-backend python manage.py dbshell`

### API Not Accessible

1. Verify firewall rule exists: `gcloud compute firewall-rules list`
2. Check VM has external IP: `gcloud compute instances describe elosaude-backend-prod`
3. Verify Django is listening on 0.0.0.0:8005

### Permission Denied on Artifact Registry

```bash
# Re-authenticate Docker
gcloud auth configure-docker us-central1-docker.pkg.dev

# Or use service account key
gcloud auth activate-service-account --key-file=key.json
```

## Cost Monitoring

Expected monthly cost: ~$16

```bash
# Check current billing
gcloud billing accounts list
gcloud billing projects describe YOUR_PROJECT_ID
```

## Next Steps

After successful deployment:

1. [ ] Update mobile app with production API URL
2. [ ] Configure PostgreSQL firewall to allow only GCP IP
3. [ ] Set up monitoring alerts (optional)
4. [ ] Consider adding SSL with Cloud Load Balancer (Phase 2)
