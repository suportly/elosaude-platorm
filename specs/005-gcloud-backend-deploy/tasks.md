# Tasks: Google Cloud Backend Deployment

**Input**: Design documents from `/specs/005-gcloud-backend-deploy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested for this feature (infrastructure deployment).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

## Path Conventions

This feature uses:
- **Infrastructure**: `infrastructure/terraform/` for Terraform files
- **Scripts**: `infrastructure/scripts/` for deployment scripts
- **Backend**: `backend/` for Dockerfile updates

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create directory structure and initialize Terraform project

- [x] T001 Create infrastructure directory structure: `infrastructure/terraform/`, `infrastructure/terraform/modules/`, `infrastructure/scripts/`
- [x] T002 [P] Create Terraform versions.tf with provider requirements in `infrastructure/terraform/versions.tf`
- [x] T003 [P] Create .gitignore entries for Terraform state and tfvars secrets in `infrastructure/terraform/.gitignore`
- [x] T004 Create terraform.tfvars.example with all required variables (no secrets) in `infrastructure/terraform/terraform.tfvars.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Terraform configuration and backend Dockerfile that MUST be complete before deployment

**⚠️ CRITICAL**: User story implementation cannot proceed until this phase is complete

- [x] T005 Update backend/Dockerfile for production: add gunicorn, change CMD to use gunicorn WSGI in `backend/Dockerfile`
- [x] T006 Create Terraform variables.tf with all variable definitions in `infrastructure/terraform/variables.tf`
- [x] T007 [P] Create Terraform outputs.tf with instance_external_ip, api_url, registry_url in `infrastructure/terraform/outputs.tf`
- [x] T008 Create main.tf with provider configuration and module calls in `infrastructure/terraform/main.tf`
- [x] T009 [P] Add health check endpoint to Django backend (if not exists) in `backend/elosaude_backend/urls.py`

**Checkpoint**: Foundation ready - Terraform structure complete, Dockerfile production-ready

---

## Phase 3: User Story 1 - Deploy Backend to Production (Priority: P1) 🎯 MVP

**Goal**: Deploy Django backend to a single GCE VM accessible via public IP on port 8005

**Independent Test**: `curl http://EXTERNAL_IP:8005/api/health/` returns successful response

### Implementation for User Story 1

#### Terraform Modules

- [x] T010 [P] [US1] Create compute module main.tf with GCE instance configuration in `infrastructure/terraform/modules/compute/main.tf`
- [x] T011 [P] [US1] Create compute module variables.tf with instance config variables in `infrastructure/terraform/modules/compute/variables.tf`
- [x] T012 [P] [US1] Create compute module outputs.tf with external_ip, instance_name in `infrastructure/terraform/modules/compute/outputs.tf`
- [x] T013 [P] [US1] Create networking module main.tf with firewall rules (HTTP 8005, SSH, health checks) in `infrastructure/terraform/modules/networking/main.tf`
- [x] T014 [P] [US1] Create networking module variables.tf with firewall config variables in `infrastructure/terraform/modules/networking/variables.tf`
- [x] T015 [P] [US1] Create networking module outputs.tf in `infrastructure/terraform/modules/networking/outputs.tf`
- [x] T016 [P] [US1] Create registry module main.tf with Artifact Registry repository in `infrastructure/terraform/modules/registry/main.tf`
- [x] T017 [P] [US1] Create registry module variables.tf with registry config variables in `infrastructure/terraform/modules/registry/variables.tf`
- [x] T018 [P] [US1] Create registry module outputs.tf with repository_url in `infrastructure/terraform/modules/registry/outputs.tf`

#### Service Account & IAM

- [x] T019 [US1] Add service account resource to compute module for VM IAM identity in `infrastructure/terraform/modules/compute/main.tf`
- [x] T020 [US1] Add IAM role bindings for logging and monitoring in `infrastructure/terraform/modules/compute/main.tf`

#### Deployment Scripts

- [x] T021 [P] [US1] Create build-push.sh script to build and push Docker image to Artifact Registry in `infrastructure/scripts/build-push.sh`
- [x] T022 [P] [US1] Create deploy.sh script for full deployment workflow in `infrastructure/scripts/deploy.sh`
- [x] T023 [P] [US1] Create ssh-vm.sh helper script for VM access in `infrastructure/scripts/ssh-vm.sh`

#### Integration

- [x] T024 [US1] Wire up all modules in main.tf with correct dependencies in `infrastructure/terraform/main.tf`
- [ ] T025 [US1] Test Terraform plan validates without errors (run `terraform init && terraform plan`) ⚠️ MANUAL
- [ ] T026 [US1] Deploy infrastructure with `terraform apply` and verify VM is running ⚠️ MANUAL
- [ ] T027 [US1] Build and push Docker image using build-push.sh script ⚠️ MANUAL
- [ ] T028 [US1] Verify API health endpoint accessible at http://EXTERNAL_IP:8005/api/status/ ⚠️ MANUAL

**Checkpoint**: User Story 1 complete - Backend deployed and accessible publicly

---

## Phase 4: User Story 2 - Infrastructure as Code Management (Priority: P2)

**Goal**: Ensure all infrastructure is version-controlled and reproducibly deployable

**Independent Test**: Run `terraform destroy` followed by `terraform apply` - infrastructure recreates identically

### Implementation for User Story 2

- [x] T029 [US2] Create GCS bucket for Terraform state backend (manual or via bootstrap script) in `infrastructure/scripts/bootstrap-state.sh`
- [x] T030 [US2] Configure Terraform backend for GCS state storage in `infrastructure/terraform/versions.tf`
- [x] T031 [US2] Document state bucket creation in quickstart.md (already exists, verify accuracy)
- [x] T032 [US2] Add validation rules to Terraform variables (environment must be dev/staging/prod) in `infrastructure/terraform/variables.tf`
- [ ] T033 [US2] Test destroy and recreate cycle: `terraform destroy -auto-approve && terraform apply -auto-approve` ⚠️ MANUAL
- [ ] T034 [US2] Verify state file stored in GCS bucket and versioned ⚠️ MANUAL

**Checkpoint**: User Story 2 complete - Infrastructure fully reproducible from code

---

## Phase 5: User Story 3 - Environment Configuration (Priority: P3)

**Goal**: Support multiple environments (dev, staging, prod) with environment-specific configuration

**Independent Test**: Deploy to staging environment with different instance name and verify isolation from prod

### Implementation for User Story 3

- [x] T035 [P] [US3] Create terraform.tfvars.prod example file with production values in `infrastructure/terraform/environments/prod.tfvars.example`
- [x] T036 [P] [US3] Create terraform.tfvars.staging example file with staging values in `infrastructure/terraform/environments/staging.tfvars.example`
- [x] T037 [P] [US3] Create terraform.tfvars.dev example file with development values in `infrastructure/terraform/environments/dev.tfvars.example`
- [x] T038 [US3] Update deploy.sh to accept environment parameter and use correct tfvars in `infrastructure/scripts/deploy.sh`
- [x] T039 [US3] Add environment-based naming to all resources (e.g., `elosaude-backend-${environment}`) in all module main.tf files
- [x] T040 [US3] Update Terraform state backend prefix to include environment in `infrastructure/terraform/versions.tf`
- [x] T041 [US3] Document multi-environment workflow in quickstart.md

**Checkpoint**: User Story 3 complete - Multiple environments supported with isolation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and operational improvements

- [x] T042 [P] Add README.md to infrastructure/terraform/ with usage instructions in `infrastructure/terraform/README.md`
- [x] T043 [P] Make all scripts executable: `chmod +x infrastructure/scripts/*.sh`
- [ ] T044 [P] Verify all Terraform files pass `terraform fmt` and `terraform validate` ⚠️ MANUAL
- [ ] T045 Update mobile app API configuration with production URL in `mobile/src/config/api.ts` ⚠️ AFTER DEPLOY
- [ ] T046 Run full quickstart.md validation from scratch ⚠️ MANUAL
- [x] T047 Document VM SSH access and log viewing commands in README

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core deployment
- **User Story 2 (Phase 4)**: Depends on User Story 1 (needs working infrastructure to test reproducibility)
- **User Story 3 (Phase 5)**: Can start after Foundational, but best after US1 is stable
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 being complete (need infrastructure to test state management)
- **User Story 3 (P3)**: Can start after Foundational, integrates with US1/US2 patterns

### Within Each User Story

- Terraform modules can be created in parallel (marked [P])
- Module integration (main.tf wiring) must wait for modules to exist
- Deployment testing must wait for all Terraform to be complete
- Scripts can be created in parallel with Terraform modules

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003 can run in parallel

**Phase 2 (Foundational)**:
- T007, T009 can run in parallel with other tasks

**Phase 3 (User Story 1)** - Maximum parallelization:
- All module tasks (T010-T018) can run in parallel (9 files, different directories)
- All script tasks (T021-T023) can run in parallel (3 files)
- Total: 12 parallel tasks possible

**Phase 5 (User Story 3)**:
- T035, T036, T037 can run in parallel (3 environment files)

---

## Parallel Example: User Story 1

```bash
# Launch all Terraform modules in parallel:
Task: "Create compute module main.tf in infrastructure/terraform/modules/compute/main.tf"
Task: "Create compute module variables.tf in infrastructure/terraform/modules/compute/variables.tf"
Task: "Create compute module outputs.tf in infrastructure/terraform/modules/compute/outputs.tf"
Task: "Create networking module main.tf in infrastructure/terraform/modules/networking/main.tf"
Task: "Create networking module variables.tf in infrastructure/terraform/modules/networking/variables.tf"
Task: "Create networking module outputs.tf in infrastructure/terraform/modules/networking/outputs.tf"
Task: "Create registry module main.tf in infrastructure/terraform/modules/registry/main.tf"
Task: "Create registry module variables.tf in infrastructure/terraform/modules/registry/variables.tf"
Task: "Create registry module outputs.tf in infrastructure/terraform/modules/registry/outputs.tf"

# Launch all scripts in parallel:
Task: "Create build-push.sh in infrastructure/scripts/build-push.sh"
Task: "Create deploy.sh in infrastructure/scripts/deploy.sh"
Task: "Create ssh-vm.sh in infrastructure/scripts/ssh-vm.sh"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (5 tasks)
3. Complete Phase 3: User Story 1 (19 tasks)
4. **STOP and VALIDATE**: Test API accessible at http://EXTERNAL_IP:8005/api/health/
5. Backend is now deployed and accessible - MVP complete!

### Incremental Delivery

1. Complete Setup + Foundational → Terraform structure ready
2. Add User Story 1 → Test deployment → **MVP deployed!**
3. Add User Story 2 → Test state management → Infrastructure reproducible
4. Add User Story 3 → Test multi-env → Full flexibility
5. Each story adds operational capability without breaking deployment

### Task Count Summary

| Phase | Tasks | Parallel Tasks |
|-------|-------|----------------|
| Phase 1: Setup | 4 | 2 |
| Phase 2: Foundational | 5 | 2 |
| Phase 3: User Story 1 | 19 | 12 |
| Phase 4: User Story 2 | 6 | 0 |
| Phase 5: User Story 3 | 7 | 3 |
| Phase 6: Polish | 6 | 3 |
| **Total** | **47** | **22** |

---

## Notes

- No tests included (not requested for infrastructure deployment)
- All Terraform module files can be created in parallel
- Scripts should be made executable after creation
- Deployment validation requires GCP credentials and project access
- State bucket must be created manually before remote state can be used
- Mobile app config update (T045) requires production IP from deployment
