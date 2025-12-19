# Data Model: Google Cloud Backend Deployment

**Feature**: 005-gcloud-backend-deploy
**Date**: 2025-12-17

## Infrastructure Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Google Cloud Project                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐     ┌──────────────────────────────────────┐  │
│  │  Artifact       │     │         Default VPC Network           │  │
│  │  Registry       │     │                                        │  │
│  │                 │     │  ┌────────────────────────────────┐   │  │
│  │  ┌───────────┐  │     │  │      Firewall Rules            │   │  │
│  │  │ elosaude- │  │     │  │  - allow-http-8005             │   │  │
│  │  │ backend   │──┼─────┼──│  - allow-ssh                   │   │  │
│  │  │ repository│  │     │  │  - allow-health-checks         │   │  │
│  │  └───────────┘  │     │  └────────────────────────────────┘   │  │
│  └─────────────────┘     │                                        │  │
│           │              │  ┌────────────────────────────────┐   │  │
│           │              │  │      Compute Engine            │   │  │
│           │              │  │                                │   │  │
│           └──────────────┼──│  ┌──────────────────────────┐  │   │  │
│                          │  │  │   elosaude-backend-vm    │  │   │  │
│                          │  │  │   (Container-Optimized)  │  │   │  │
│                          │  │  │                          │  │   │  │
│                          │  │  │   ┌──────────────────┐   │  │   │  │
│                          │  │  │   │ Docker Container │   │  │   │  │
│                          │  │  │   │ - Django Backend │   │  │   │  │
│                          │  │  │   │ - Gunicorn WSGI  │   │  │   │  │
│                          │  │  │   │ - Port 8005      │   │  │   │  │
│                          │  │  │   └──────────────────┘   │  │   │  │
│                          │  │  │                          │  │   │  │
│                          │  │  │   External IP: x.x.x.x   │  │   │  │
│                          │  │  └──────────────────────────┘  │   │  │
│                          │  └────────────────────────────────┘   │  │
│                          └──────────────────────────────────────┘  │
│                                          │                          │
│  ┌─────────────────┐                     │                          │
│  │  Service        │                     │                          │
│  │  Account        │─────────────────────┘                          │
│  │  (IAM)          │                                                 │
│  └─────────────────┘                                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Internet
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             ┌──────┴──────┐              ┌────────┴────────┐
             │   Mobile    │              │   External      │
             │   App       │              │   PostgreSQL    │
             │   (Client)  │              │   Database      │
             └─────────────┘              └─────────────────┘
```

## Entity Definitions

### 1. Compute Instance (google_compute_instance)

Primary entity - the VM running the Django backend.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | `elosaude-backend-${environment}` |
| machine_type | string | Yes | `e2-small` (2 vCPU, 2GB RAM) |
| zone | string | Yes | GCP zone (e.g., `us-central1-a`) |
| boot_disk.image | string | Yes | `cos-cloud/cos-stable` (Container-Optimized OS) |
| network_interface.network | reference | Yes | Default VPC network |
| network_interface.access_config | block | Yes | Enables external IP |
| metadata.gce-container-declaration | string | Yes | Container spec (image, env vars, ports) |
| service_account.email | reference | Yes | Service account for permissions |
| tags | list(string) | Yes | Network tags for firewall rules |
| labels | map(string) | No | Resource labels for organization |

**Container Declaration Metadata**:
```yaml
spec:
  containers:
    - name: elosaude-backend
      image: REGION-docker.pkg.dev/PROJECT/elosaude-backend/backend:TAG
      ports:
        - containerPort: 8005
      env:
        - name: DATABASE_URL
          value: postgresql://...
        - name: DJANGO_SECRET_KEY
          value: ...
        - name: DJANGO_DEBUG
          value: "False"
  restartPolicy: Always
```

### 2. Firewall Rules (google_compute_firewall)

Network security rules controlling traffic to the VM.

#### 2.1 HTTP Access Rule

| Attribute | Type | Value |
|-----------|------|-------|
| name | string | `elosaude-allow-http-${environment}` |
| network | reference | Default VPC |
| direction | string | `INGRESS` |
| priority | number | `1000` |
| source_ranges | list(string) | `["0.0.0.0/0"]` |
| target_tags | list(string) | `["elosaude-backend"]` |
| allow.protocol | string | `tcp` |
| allow.ports | list(string) | `["8005"]` |

#### 2.2 SSH Access Rule

| Attribute | Type | Value |
|-----------|------|-------|
| name | string | `elosaude-allow-ssh-${environment}` |
| network | reference | Default VPC |
| direction | string | `INGRESS` |
| source_ranges | list(string) | Admin IP ranges or IAP range |
| target_tags | list(string) | `["elosaude-backend"]` |
| allow.protocol | string | `tcp` |
| allow.ports | list(string) | `["22"]` |

#### 2.3 Health Check Rule

| Attribute | Type | Value |
|-----------|------|-------|
| name | string | `elosaude-allow-health-${environment}` |
| network | reference | Default VPC |
| direction | string | `INGRESS` |
| source_ranges | list(string) | `["35.191.0.0/16", "130.211.0.0/22"]` (GCP health checkers) |
| target_tags | list(string) | `["elosaude-backend"]` |
| allow.protocol | string | `tcp` |
| allow.ports | list(string) | `["8005"]` |

### 3. Artifact Registry (google_artifact_registry_repository)

Docker image storage.

| Attribute | Type | Value |
|-----------|------|-------|
| repository_id | string | `elosaude-backend-${environment}` |
| location | string | Same as compute region |
| format | string | `DOCKER` |
| description | string | `Elosaude backend Docker images` |
| cleanup_policies | block | Keep last 5 tagged versions |

### 4. Service Account (google_service_account)

IAM identity for the VM.

| Attribute | Type | Value |
|-----------|------|-------|
| account_id | string | `elosaude-backend-${environment}` |
| display_name | string | `Elosaude Backend Service Account` |
| roles | list(string) | `logging.logWriter`, `monitoring.metricWriter`, `artifactregistry.reader` |

## Terraform Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| project_id | string | Required | GCP project ID |
| region | string | `us-central1` | GCP region |
| zone | string | `us-central1-a` | GCP zone |
| environment | string | `prod` | Environment name |
| machine_type | string | `e2-small` | VM machine type |
| container_image | string | Required | Docker image URL |
| database_url | string | Required (sensitive) | PostgreSQL connection string |
| django_secret_key | string | Required (sensitive) | Django secret key |
| allowed_ssh_ranges | list(string) | `[]` | IP ranges allowed for SSH |

## Terraform Outputs

| Output | Type | Description |
|--------|------|-------------|
| instance_external_ip | string | Public IP of the VM |
| instance_name | string | Name of the VM instance |
| api_url | string | Full API URL (`http://IP:8005`) |
| registry_url | string | Artifact Registry URL for Docker push |
| service_account_email | string | Service account email |

## State Management

Terraform state stored in Google Cloud Storage:

```hcl
terraform {
  backend "gcs" {
    bucket = "elosaude-terraform-state"
    prefix = "backend"
  }
}
```

## Resource Dependencies

```
google_project_service (APIs)
    │
    ├── google_artifact_registry_repository
    │       │
    │       └── (Docker image pushed externally)
    │
    ├── google_service_account
    │       │
    │       └── google_project_iam_member (roles)
    │
    └── google_compute_firewall (x3)
            │
            └── google_compute_instance
                    │
                    └── (Container runs on startup)
```
