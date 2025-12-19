# Feature Specification: Google Cloud Backend Deployment

**Feature Branch**: `005-gcloud-backend-deploy`
**Created**: 2025-12-17
**Status**: Draft
**Input**: User description: "preparar projeto para subir na gcloud com uma maquina basica para o backend, no projeto a seguir existe a estrutura funcionando com terraform para caso facilite a implementacao: /home/alairjt/workspace/suportly/api-forge-platform"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Backend to Production (Priority: P1)

As a DevOps engineer, I want to deploy the Elosaude Django backend to Google Cloud so that the mobile application can access the API from anywhere with reliable uptime.

**Why this priority**: This is the core functionality - without the backend running in the cloud, the mobile app cannot function for end users outside the local network.

**Independent Test**: Can be fully tested by accessing the deployed API endpoint and verifying it returns expected responses. Delivers immediate value by making the application accessible publicly.

**Acceptance Scenarios**:

1. **Given** the Terraform configuration is properly set up, **When** I run `terraform apply`, **Then** a Google Cloud VM instance is created and the backend service is running
2. **Given** the backend is deployed, **When** I make an HTTP request to the API health endpoint, **Then** I receive a successful response confirming the service is operational
3. **Given** the backend is deployed, **When** I attempt to authenticate via the mobile app, **Then** the authentication succeeds and I can access protected endpoints

---

### User Story 2 - Infrastructure as Code Management (Priority: P2)

As a DevOps engineer, I want all infrastructure defined in Terraform so that I can version control, review, and reproducibly deploy the infrastructure.

**Why this priority**: Essential for maintainability and disaster recovery, but the service can technically run without IaC (manual setup possible).

**Independent Test**: Can be tested by destroying and recreating the infrastructure from scratch using only the Terraform files.

**Acceptance Scenarios**:

1. **Given** I have the Terraform configuration files, **When** I run `terraform init` and `terraform apply` in a new GCP project, **Then** all required resources are created automatically
2. **Given** I want to modify the infrastructure, **When** I change the Terraform variables, **Then** I can preview changes with `terraform plan` before applying
3. **Given** the infrastructure exists, **When** I run `terraform destroy`, **Then** all resources are cleanly removed

---

### User Story 3 - Environment Configuration (Priority: P3)

As a DevOps engineer, I want to configure different environments (development, staging, production) so that I can test changes before deploying to production.

**Why this priority**: Important for safe deployments but can start with a single production environment.

**Independent Test**: Can be tested by deploying to different environments with distinct configurations.

**Acceptance Scenarios**:

1. **Given** I have environment-specific tfvars files, **When** I apply Terraform with a specific environment file, **Then** resources are created with environment-appropriate sizing and naming
2. **Given** multiple environments exist, **When** I deploy to staging, **Then** it does not affect the production environment

---

### Edge Cases

- What happens when the VM instance becomes unhealthy? System should allow manual restart or auto-recovery configuration
- How does the system handle database connection failures? Backend should gracefully handle connection retries
- What happens during deployment updates? Service should minimize downtime during updates
- How are secrets managed securely? Credentials should not be stored in plain text in version control

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provision a Google Cloud Compute Engine VM instance capable of running the Django backend
- **FR-002**: System MUST configure the VM with appropriate firewall rules to allow HTTP traffic on port 8005
- **FR-003**: System MUST deploy the Django application using Docker containers
- **FR-004**: System MUST configure the backend to connect to the existing online PostgreSQL database via secure connection
- **FR-005**: System MUST store sensitive configuration (database credentials, secret keys) securely, not in plain text in version control
- **FR-006**: System MUST create all infrastructure using Terraform configuration files
- **FR-007**: System MUST expose the API on a public IP address accessible by the mobile application
- **FR-008**: System MUST support configuration via Terraform variables for different environments
- **FR-009**: System MUST enable basic monitoring and logging via Google Cloud Operations

### Key Entities

- **Compute Instance**: The Google Cloud VM that hosts the backend application. Key attributes: machine type (e2-micro or e2-small for basic), zone, network configuration
- **Firewall Rules**: Network security rules defining allowed traffic. Attributes: allowed ports (8005, 22 for SSH), source ranges, target tags
- **Container Registry**: Storage for Docker images (Artifact Registry). Attributes: repository URL, image tags
- **Service Account**: IAM identity for the VM. Attributes: roles, permissions for logging and monitoring
- **VPC Network**: Virtual network for the infrastructure. Attributes: subnets, routes, firewall associations

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend API is accessible from any internet location within 500ms response time for health check endpoints
- **SC-002**: Infrastructure can be fully provisioned from scratch in under 15 minutes using Terraform
- **SC-003**: System achieves 99% uptime during normal operation (excluding planned maintenance)
- **SC-004**: Deployment of a new version can be completed in under 10 minutes
- **SC-005**: All API endpoints currently functional in local development work correctly when deployed
- **SC-006**: Mobile application can successfully authenticate and fetch data from the deployed backend

## Clarifications

### Session 2025-12-17

- Q: Is database provisioning required in GCP? → A: No, an existing online database is already in use and will be reused
- Q: HTTPS/SSL requirement for API? → A: HTTP only with direct IP access (no SSL, no domain required)

## Assumptions

- The existing PostgreSQL database is already online and accessible from the internet (no GCP database provisioning required)
- A Google Cloud project already exists or will be created manually before running Terraform
- The team has appropriate GCP credentials and permissions to create resources
- The current Dockerfile will be enhanced for production (using gunicorn instead of Django development server)
- Initial deployment uses HTTP only with direct IP access (no SSL certificate or domain name required)
- The reference Terraform project structure from api-forge-platform can be adapted for this simpler use case (using Compute Engine instead of Cloud Run)
- Basic machine means e2-micro or e2-small instance type (cost-effective for initial deployment)

## Dependencies

- Google Cloud Platform account with billing enabled
- Terraform CLI installed (version 1.0+)
- Docker installed for building container images
- gcloud CLI installed and configured
- Access to the reference project at `/home/alairjt/workspace/suportly/api-forge-platform` for Terraform patterns
- Existing online PostgreSQL database credentials and connection details
