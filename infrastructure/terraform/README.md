# Elosaude Backend - Terraform Infrastructure

This directory contains Terraform configurations for deploying the Elosaude Django backend to Google Cloud Platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Project                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐     ┌─────────────────────────────┐   │
│  │  Artifact       │     │    Default VPC Network       │   │
│  │  Registry       │     │                              │   │
│  │                 │     │  ┌───────────────────────┐  │   │
│  │  Docker images  │     │  │   Firewall Rules      │  │   │
│  └────────┬────────┘     │  │  - HTTP (8005)        │  │   │
│           │              │  │  - SSH (IAP)          │  │   │
│           │              │  │  - Health Checks      │  │   │
│           │              │  └───────────────────────┘  │   │
│           │              │                              │   │
│           └──────────────┼───► GCE VM (e2-small)       │   │
│                          │    - Container-Optimized OS │   │
│                          │    - Docker container       │   │
│                          │    - External IP            │   │
│                          └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Terraform CLI 1.0+
- Google Cloud SDK (`gcloud`)
- Docker
- GCP project with billing enabled

## Quick Start

### 1. Authenticate with GCP

```bash
gcloud auth login
gcloud auth application-default login
```

### 2. Create State Bucket (First Time Only)

```bash
../scripts/bootstrap-state.sh YOUR_PROJECT_ID us-central1
```

### 3. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 4. Initialize Terraform

```bash
terraform init -backend-config="bucket=elosaude-terraform-state-YOUR_PROJECT_ID"
```

### 5. Deploy

```bash
# Preview changes
terraform plan

# Apply changes
terraform apply
```

## Directory Structure

```
terraform/
├── main.tf                    # Main configuration with module calls
├── variables.tf               # Variable definitions
├── outputs.tf                 # Output values
├── versions.tf                # Provider requirements and backend
├── terraform.tfvars.example   # Example variables (copy to terraform.tfvars)
├── .gitignore                 # Ignore sensitive files
├── environments/              # Environment-specific configurations
│   ├── prod.tfvars.example
│   ├── staging.tfvars.example
│   └── dev.tfvars.example
└── modules/
    ├── compute/               # GCE VM configuration
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── networking/            # Firewall rules
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── registry/              # Artifact Registry
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## Modules

### compute/

Creates a Compute Engine VM with Container-Optimized OS running the Django backend.

- **Service Account**: IAM identity with logging, monitoring, and registry access
- **Container Spec**: Docker container declaration for automatic startup
- **Machine Type**: Configurable (default: e2-small)

### networking/

Configures firewall rules for the backend VM.

- **HTTP (8005)**: Allow public access to the API
- **SSH via IAP**: Secure SSH access through Identity-Aware Proxy
- **Health Checks**: Allow GCP health checker traffic

### registry/

Creates Artifact Registry repository for Docker images.

- **Cleanup Policies**: Automatically remove old/untagged images
- **Format**: Docker

## Multiple Environments

Deploy to different environments using environment-specific tfvars:

```bash
# Production
terraform plan -var-file="environments/prod.tfvars"
terraform apply -var-file="environments/prod.tfvars"

# Staging
terraform plan -var-file="environments/staging.tfvars"
terraform apply -var-file="environments/staging.tfvars"
```

Or use the deploy script:

```bash
../scripts/deploy.sh prod --apply
../scripts/deploy.sh staging --build --apply
```

## Outputs

After deployment, useful outputs are available:

```bash
terraform output                    # Show all outputs
terraform output instance_external_ip   # Get external IP
terraform output api_url            # Get API URL
terraform output ssh_command        # Get SSH command
```

## Common Operations

### SSH into VM

```bash
# Via IAP (recommended)
gcloud compute ssh elosaude-backend-prod --zone=us-central1-a

# Or use the helper script
../scripts/ssh-vm.sh prod
```

### View Container Logs

```bash
../scripts/ssh-vm.sh prod "docker logs elosaude-backend"
```

### Restart Container

```bash
../scripts/ssh-vm.sh prod "docker restart elosaude-backend"
```

### Update Container Image

```bash
# Build and push new image
../scripts/build-push.sh prod v1.2.3

# Update VM to use new image
gcloud compute instances update-container elosaude-backend-prod \
    --zone=us-central1-a \
    --container-image=NEW_IMAGE_URL
```

### Destroy Infrastructure

```bash
terraform destroy
```

## Troubleshooting

### Container Not Starting

1. Check container logs: `../scripts/ssh-vm.sh prod "docker logs elosaude-backend"`
2. Verify image exists in registry
3. Check service account permissions

### Cannot Connect to API

1. Verify firewall rules: `gcloud compute firewall-rules list`
2. Check VM has external IP
3. Verify container is running: `../scripts/ssh-vm.sh prod "docker ps"`

### Database Connection Failed

1. Verify DATABASE_URL is correct
2. Ensure database allows connections from GCP IP
3. Check network connectivity from VM

## Cost Estimate

| Resource | Monthly Cost (approx) |
|----------|----------------------|
| e2-small VM | $12 |
| External IP | $3 |
| Artifact Registry | $0.50 |
| **Total** | **~$16** |

## Security Notes

- **Never commit** `terraform.tfvars` or any file with secrets
- Use **IAP** for SSH access instead of opening port 22 to the internet
- Consider **Secret Manager** for production secrets
- Review firewall rules regularly
