# Research: Google Cloud Backend Deployment

**Feature**: 005-gcloud-backend-deploy
**Date**: 2025-12-17
**Status**: Complete

## Technology Decision Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Compute | Google Compute Engine (GCE) | Simpler than Cloud Run for single backend; persistent VM with fixed cost; easier debugging |
| Instance Type | e2-small | 2 vCPUs, 2GB RAM; adequate for Django + gunicorn; ~$12/month |
| Container Runtime | Docker + Container-Optimized OS | Native Docker support; auto-updates; security hardening built-in |
| WSGI Server | Gunicorn | Production-grade; Django recommended; multi-worker support |
| IaC | Terraform 1.0+ | Matches reference project; declarative; state management |
| Secrets | Terraform variables + .tfvars | Simple for initial deployment; can migrate to Secret Manager later |
| Networking | Default VPC with firewall rules | Simpler than custom VPC; sufficient for single VM |
| Monitoring | Google Cloud Operations | Built-in; free tier sufficient; logs and metrics |

## Option Analysis

### Compute Platform

**Option A: Compute Engine VM (SELECTED)**
- Pros: Predictable cost, simpler architecture, easier debugging, persistent storage
- Cons: Manual scaling, single point of failure (acceptable for initial deployment)
- Cost: ~$12-15/month for e2-small

**Option B: Cloud Run**
- Pros: Auto-scaling, pay-per-request, managed SSL
- Cons: Cold starts affect latency, more complex networking for external DB, higher learning curve
- Cost: Variable, potentially higher for consistent traffic

**Option C: GKE (Kubernetes)**
- Pros: Production-grade orchestration, auto-healing, horizontal scaling
- Cons: Overkill for single service, $70+/month minimum for cluster, operational complexity
- Cost: ~$70-150/month minimum

**Decision**: Option A - Compute Engine provides the best balance of simplicity, cost, and reliability for the initial deployment of a single Django backend.

### Instance Type

| Type | vCPUs | Memory | Monthly Cost | Use Case |
|------|-------|--------|--------------|----------|
| e2-micro | 0.25 | 1GB | ~$6 | Not recommended (insufficient for Django) |
| e2-small | 2 | 2GB | ~$12 | **SELECTED** - Adequate for Django + gunicorn |
| e2-medium | 2 | 4GB | ~$24 | If memory issues arise |

**Decision**: e2-small provides sufficient resources for Django with 2-4 gunicorn workers while maintaining low cost.

### Container Strategy

**Option A: Container-Optimized OS + Docker (SELECTED)**
- Pre-installed Docker, automatic security updates
- Deploy via `docker run` with environment variables
- Simpler than Kubernetes, more production-ready than raw VM

**Option B: Standard Ubuntu + Docker**
- More control, but requires manual Docker installation
- Security patches are manual responsibility

**Decision**: Container-Optimized OS reduces operational burden and provides better security defaults.

### Database Connection

The existing PostgreSQL database is hosted externally (not in GCP). Connection strategy:

- **Connection**: Direct TCP connection over internet
- **Security**: Database should allow connections from GCP IP range or use fixed external IP
- **Credentials**: Passed via environment variables to Docker container
- **Latency**: Expected 10-50ms additional latency depending on database location

**Requirement**: Ensure PostgreSQL firewall allows connections from the GCE instance's external IP.

### Secrets Management

**Phase 1 (Initial)**: Environment variables via Terraform
- Simple, works with Container-Optimized OS
- Secrets in `.tfvars` file (gitignored)
- Acceptable for initial deployment

**Phase 2 (Future)**: Google Secret Manager
- Recommended for production with multiple services
- Automatic rotation support
- IAM-based access control

## Reference Project Adaptation

The reference project at `/home/alairjt/workspace/suportly/api-forge-platform` uses:
- Cloud Run (serverless containers) - **Not applicable**
- Cloud SQL (managed database) - **Not applicable** (using external DB)
- VPC with private service connection - **Simplified to default VPC**

**Modules to adapt**:
1. `networking/` - Simplify: use default VPC, add firewall rules only
2. `registry/` - Reuse: Artifact Registry for Docker images
3. `monitoring/` - Adapt: Change metrics from Cloud Run to GCE

**Modules NOT needed**:
- `database/` - External database already exists
- `redis/` - Not required for initial deployment
- `cloud-run/` - Using GCE instead
- `load-balancer/` - Direct IP access (no SSL)
- `secrets/` - Using tfvars for Phase 1

## Dockerfile Enhancement

Current Dockerfile uses Django development server. Production changes needed:

```dockerfile
# Production additions
RUN pip install gunicorn

# Production command
CMD ["gunicorn", "--bind", "0.0.0.0:8005", "--workers", "2", "elosaude_backend.wsgi:application"]
```

## Infrastructure Cost Estimate

| Resource | Monthly Cost |
|----------|--------------|
| e2-small VM | $12.17 |
| External IP (static) | $2.88 |
| Cloud Storage (Terraform state) | ~$0.50 |
| Artifact Registry | ~$0.50 (< 0.5GB) |
| **Total** | **~$16/month** |

## Constitution Compliance Check

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Security by Design | PARTIAL | HTTP only initially; credentials not in version control via .gitignore |
| Production HTTPS requirement | EXCEPTION | User explicitly chose HTTP for Phase 1; SSL can be added later |

**Exception Justification**: User requirement is HTTP-only with direct IP for initial deployment. HTTPS can be added in a future iteration with Cloud Load Balancer or Cloudflare.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| External DB latency | Medium | Monitor response times; consider Cloud SQL migration if problematic |
| Single VM failure | Medium | Container-Optimized OS auto-restarts containers; can add auto-healing later |
| No SSL | Low (internal app) | Phase 2: Add Cloud Load Balancer with managed SSL |
| Secret exposure | Medium | .tfvars in .gitignore; consider Secret Manager for Phase 2 |

## Recommended Implementation Order

1. Update Dockerfile for production (gunicorn)
2. Create Terraform configuration for GCE
3. Add firewall rules for port 8005
4. Configure Artifact Registry for Docker images
5. Create deployment script
6. Update mobile app API configuration
