# Research: Email Token & Onboarding

**Feature**: 013-email-token-onboarding
**Date**: 2026-01-07

## Research Tasks Completed

### 1. Existing Email Infrastructure

**Decision**: Utilize existing email service and templates

**Findings**:
- Email service exists at `backend/apps/accounts/utils/email_service.py`
- Base template exists at `backend/apps/accounts/templates/accounts/email/base_email.html`
- Django settings already configured for Gmail SMTP (via environment variables)
- Current settings use `console.EmailBackend` as default (needs override)

**Environment Variables Required**:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=naoresponda@elosaude.com.br
EMAIL_HOST_PASSWORD=mcls eaui jbgo iqum
DEFAULT_FROM_EMAIL=naoresponda@elosaude.com.br
```

**Rationale**: Reuse existing infrastructure to minimize new code and maintain consistency.

---

### 2. Token Generation Mechanism

**Decision**: Use existing PasswordResetToken model pattern (6-digit numeric)

**Findings**:
- `ActivationToken` model uses 32-character alphanumeric tokens
- `PasswordResetToken` model uses 6-digit numeric codes (matches spec requirement)
- Both models have expiry and single-use functionality

**Implementation Approach**:
- Reuse `PasswordResetToken` model for verification token during registration
- OR create new `VerificationToken` model following same pattern
- Token expiry: 10 minutes (as per spec)

**Rationale**: 6-digit numeric tokens are easier for users to type and remember.

---

### 3. Registration Flow Analysis

**Decision**: Modify existing First Access flow

**Findings**:
- Current flow: Request activation → Verify token → Set password
- Mobile screen: `FirstAccessScreen.tsx` with 3-step flow
- API endpoints: `/accounts/first-access/request/`, `/verify/`, `/activate/`

**Gap Analysis**:
- Current token is 32-char (need to change to 6-digit)
- Token expiry is 24 hours (need to change to 10 minutes)
- Need to add email field to request step
- Need to ensure email is sent during registration

**Rationale**: Modifying existing flow reduces complexity vs creating parallel system.

---

### 4. Onboarding Post-Login

**Decision**: Create new OnboardingScreen and add flag to Beneficiary model

**Findings**:
- No existing onboarding mechanism
- Auth state managed in Redux (`authSlice.ts`)
- Navigation conditional on `isAuthenticated` flag
- Beneficiary model has basic data fields but no onboarding_completed flag

**Required Changes**:
1. Add `onboarding_completed` field to Beneficiary model
2. Include field in login response
3. Create OnboardingScreen in mobile app
4. Modify AppNavigator to check flag after login

**Alternatives Considered**:
- Store flag in AsyncStorage only → Rejected (not persisted across reinstalls)
- Use User model instead → Rejected (Beneficiary is the domain entity)

**Rationale**: Backend persistence ensures onboarding status survives app reinstalls.

---

### 5. Email Template Design

**Decision**: Create new verification email template based on existing base

**Findings**:
- Base template has Elosaude branding (gradient header #20a490)
- Existing templates: password reset, activation, notifications
- Templates are HTML with inline CSS for email compatibility

**Template Elements Needed**:
- Elosaude logo (already in base)
- Personalized greeting with beneficiary name
- 6-digit token prominently displayed
- Expiration notice (10 minutes)
- Instructions for using the token
- Security warning about not sharing

**Rationale**: Consistent branding with existing emails while being specific to verification.

---

### 6. Rate Limiting & Security

**Decision**: Implement token resubmission controls in backend

**Findings**:
- No existing rate limiting for token requests
- Need to track: last_sent_at, resend_count
- Spec requires: 60s between resends, max 5 per hour

**Implementation Approach**:
- Add fields to token model or create separate tracking table
- Check rate limits before generating new token
- Return appropriate error responses with wait time

**Rationale**: Prevents abuse while allowing legitimate retry scenarios.

---

## Technology Decisions Summary

| Component | Decision | Rationale |
|-----------|----------|-----------|
| Email Backend | Gmail SMTP | User requirement, already configured |
| Token Format | 6-digit numeric | User-friendly, matches password reset |
| Token Expiry | 10 minutes | Spec requirement, shorter is more secure |
| Onboarding Flag | Beneficiary model field | Persists across reinstalls |
| Email Template | New template, existing base | Consistent branding |
| Rate Limiting | Backend validation | Server-side control is more secure |

---

## Files to Modify/Create

### Backend
- `backend/apps/accounts/models.py` - Add VerificationToken model or modify ActivationToken
- `backend/apps/beneficiaries/models.py` - Add onboarding_completed field
- `backend/apps/accounts/views.py` - Update first-access endpoints
- `backend/apps/accounts/serializers.py` - Include onboarding_completed in login response
- `backend/apps/accounts/templates/accounts/email/verification_email.html` - New template
- `backend/.env` - Configure Gmail SMTP credentials

### Mobile
- `mobile/src/screens/Auth/FirstAccessScreen.tsx` - Update for 6-digit token
- `mobile/src/screens/Onboarding/OnboardingScreen.tsx` - NEW
- `mobile/src/navigation/AppNavigator.tsx` - Add onboarding check
- `mobile/src/store/slices/authSlice.ts` - Add onboarding_completed to state
