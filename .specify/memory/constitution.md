<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                           SYNC IMPACT REPORT                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Version Change: N/A → 1.0.0 (Initial ratification)                          ║
║                                                                              ║
║ Added Principles:                                                            ║
║   • I. LGPD & Privacy First                                                  ║
║   • II. API-First Design                                                     ║
║   • III. Healthcare Standards Compliance                                     ║
║   • IV. Security by Design                                                   ║
║   • V. Mobile-Accessible UX                                                  ║
║                                                                              ║
║ Added Sections:                                                              ║
║   • Technology Standards                                                     ║
║   • Development Workflow                                                     ║
║   • Governance                                                               ║
║                                                                              ║
║ Templates Requiring Updates:                                                 ║
║   • .specify/templates/plan-template.md ✅ No changes needed                 ║
║   • .specify/templates/spec-template.md ✅ No changes needed                 ║
║   • .specify/templates/tasks-template.md ✅ No changes needed                ║
║                                                                              ║
║ Follow-up TODOs: None                                                        ║
╚══════════════════════════════════════════════════════════════════════════════╝
-->

# Elosaúde Platform Constitution

## Core Principles

### I. LGPD & Privacy First

All features handling personal or health data MUST comply with LGPD (Lei Geral de Proteção de Dados).

- Personal health information (PHI) MUST be encrypted at rest and in transit
- User consent MUST be obtained before collecting or processing personal data
- Data export and deletion requests MUST be supported within 15 business days
- Audit logs MUST track all access to sensitive health records
- Beneficiary data MUST NOT be shared with third parties without explicit consent
- Session tokens MUST expire within 24 hours for mobile apps

**Rationale**: Healthcare platforms handle sensitive protected health information. Brazilian law (LGPD) and healthcare regulations require strict privacy controls to protect beneficiaries.

### II. API-First Design

The backend MUST expose all functionality through well-documented REST APIs before mobile implementation begins.

- Every endpoint MUST be documented in OpenAPI/Swagger format
- API contracts MUST be defined before mobile screens are built
- Breaking API changes MUST follow a deprecation cycle of at least 2 releases
- All API responses MUST use consistent JSON structure with proper error codes
- Pagination MUST be implemented for list endpoints (using DRF's PageNumberPagination)

**Rationale**: The mobile app depends entirely on backend APIs. Well-defined contracts prevent integration issues and enable parallel development.

### III. Healthcare Standards Compliance

Features involving healthcare operations MUST comply with ANS (Agência Nacional de Saúde) and TISS standards.

- TISS guides MUST follow ANS XML schema specifications
- Provider network data MUST include mandatory ANS registration fields
- Authorization workflows MUST support TISS guide types (consultation, SADT, hospitalization)
- Medical procedure codes MUST reference the TUSS (Terminologia Unificada da Saúde Suplementar) table
- Document storage MUST retain records per ANS requirements (minimum 5 years)

**Rationale**: Brazilian health insurance regulations require compliance with ANS/TISS standards for interoperability and legal operation.

### IV. Security by Design

Security controls MUST be implemented as first-class features, not afterthoughts.

- Authentication MUST use JWT with short-lived access tokens (15 min) and refresh tokens
- Passwords MUST be hashed using bcrypt or argon2 with proper salt
- API endpoints MUST validate all input parameters against injection attacks
- File uploads MUST be validated for type, size, and scanned for malware signatures
- Production environments MUST enforce HTTPS-only connections
- Sensitive credentials MUST NOT be committed to version control

**Rationale**: Healthcare data is a high-value target. Defense in depth protects beneficiaries and maintains regulatory compliance.

### V. Mobile-Accessible UX

The mobile application MUST be accessible and usable by beneficiaries aged 35-65+.

- Touch targets MUST be minimum 48x48dp for accessibility
- Text MUST support dynamic type scaling without layout breaking
- Critical actions MUST provide visual and haptic feedback
- Offline capability MUST be implemented for viewing cached health cards
- Error messages MUST be user-friendly, not technical jargon
- Navigation MUST follow platform conventions (iOS/Android)

**Rationale**: The target demographic includes older users who may have visual or motor limitations. Accessible design ensures all beneficiaries can use the platform effectively.

## Technology Standards

### Backend Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Django + DRF | 4.2+ |
| Database | PostgreSQL | 14+ |
| Cache/Queue | Redis | 7+ |
| Task Queue | Celery | 5.3+ |
| Auth | JWT (simplejwt) | 5+ |
| Docs | drf-yasg | Latest |

### Mobile Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native + Expo | 0.73+ |
| Language | TypeScript | 5+ |
| State | Redux Toolkit + RTK Query | Latest |
| UI | React Native Paper | 5+ |
| Navigation | React Navigation | 6+ |
| Forms | React Hook Form + Yup | Latest |

### Code Quality Requirements

- Python code MUST pass `ruff` linting with project configuration
- TypeScript code MUST pass `tsc --noEmit` with strict mode
- All API endpoints MUST have corresponding type definitions
- Database migrations MUST be reversible where possible

## Development Workflow

### Branch Strategy

- `master` branch MUST always be deployable
- Feature branches MUST follow pattern: `feature/[ticket-id]-description`
- Bugfix branches MUST follow pattern: `fix/[ticket-id]-description`
- Pull requests MUST be reviewed before merging

### Testing Requirements

- API endpoints MUST have integration tests covering happy path and error cases
- Critical business logic (guides, reimbursements) MUST have unit test coverage
- Mobile screens SHOULD have snapshot tests for UI regressions
- Test data MUST NOT use real beneficiary information

### Documentation Requirements

- API changes MUST update Swagger documentation
- New features MUST update relevant README sections
- Breaking changes MUST be documented in CHANGELOG

## Governance

### Amendment Procedure

1. Proposed amendments MUST be documented with rationale
2. Amendments affecting security or compliance require stakeholder review
3. Version MUST be incremented following semantic versioning:
   - MAJOR: Principle removals or incompatible governance changes
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All pull requests MUST be checked against applicable principles
- Security-related changes MUST be flagged for additional review
- LGPD-impacting changes MUST document privacy implications
- Constitution violations MUST be justified with documented rationale

### Guidance Reference

For runtime development guidance, refer to:
- Backend: `backend/README.md`
- Mobile: `mobile/README.md`
- API: Swagger at `/swagger/`

**Version**: 1.0.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-15
