# Data Model: Email Token & Onboarding

**Feature**: 013-email-token-onboarding
**Date**: 2026-01-07

## Entity Changes

### 1. VerificationToken (NEW or modify ActivationToken)

Stores verification tokens sent via email during registration.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID/BigInt | Primary key | Auto-generated |
| user | ForeignKey | Reference to User | CASCADE delete |
| token | CharField(6) | 6-digit numeric code | Generated randomly |
| created_at | DateTimeField | When token was created | Auto-set |
| expires_at | DateTimeField | When token expires | created_at + 10 min |
| is_used | BooleanField | Whether token was used | Default: False |
| used_at | DateTimeField | When token was used | Nullable |
| last_resent_at | DateTimeField | Last resend timestamp | Nullable |
| resend_count | IntegerField | Number of resends | Default: 0 |

**Methods**:
- `generate_token()` → string: Creates random 6-digit code
- `is_valid()` → bool: Checks not expired and not used
- `is_resend_allowed()` → bool: Checks 60s cooldown and < 5 resends
- `mark_as_used()` → void: Sets is_used=True, used_at=now
- `increment_resend()` → void: Updates resend_count and last_resent_at

**Indexes**:
- `token` (for lookup)
- `user_id, created_at` (for finding latest token)

---

### 2. Beneficiary (MODIFY)

Add onboarding tracking field.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| onboarding_completed | BooleanField | Whether user completed/skipped onboarding | Default: False |
| onboarding_completed_at | DateTimeField | When onboarding was completed | Nullable |

**Migration**:
```python
# Add to beneficiaries/migrations/XXXX_add_onboarding_fields.py
migrations.AddField(
    model_name='beneficiary',
    name='onboarding_completed',
    field=models.BooleanField(default=False),
),
migrations.AddField(
    model_name='beneficiary',
    name='onboarding_completed_at',
    field=models.DateTimeField(null=True, blank=True),
),
```

---

### 3. EmailLog (MODIFY or use existing)

Track email sending for audit purposes.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | UUID/BigInt | Primary key | Auto-generated |
| recipient_email | EmailField | Destination email | Required |
| email_type | CharField | Type of email | Choices: TOKEN, NOTIFICATION, etc. |
| subject | CharField | Email subject | Max 200 chars |
| status | CharField | Delivery status | Choices: SENT, FAILED, PENDING |
| error_message | TextField | Error details if failed | Nullable |
| sent_at | DateTimeField | When email was sent | Nullable |
| created_at | DateTimeField | When record was created | Auto-set |
| beneficiary | ForeignKey | Related beneficiary | Nullable, CASCADE |

---

## State Transitions

### Verification Token Lifecycle

```
[CREATED] → [VALIDATED] → [USED]
    ↓            ↓
[EXPIRED]   [EXPIRED]

States:
- CREATED: Token generated, email sent
- VALIDATED: Token verified but password not yet set
- USED: Token used to complete registration
- EXPIRED: Token past expiry time (10 min)
```

### Onboarding Status Lifecycle

```
[NOT_STARTED] → [COMPLETED] (user updated data)
       ↓
   [SKIPPED] (user chose "later")

Both COMPLETED and SKIPPED set onboarding_completed=True
```

---

## API Response Changes

### Login Response (MODIFY)

Add onboarding_completed to beneficiary object:

```json
{
  "access": "JWT_TOKEN",
  "refresh": "JWT_TOKEN",
  "user": { ... },
  "beneficiary": {
    "id": 123,
    "registration_number": "ELO12345678",
    "cpf": "12345678900",
    "full_name": "João da Silva",
    "phone": "11999999999",
    "email": "joao@email.com",
    "birth_date": "1980-01-15",
    "onboarding_completed": false,
    ...
  }
}
```

---

## Relationships Diagram

```
User (Django Auth)
  │
  ├── 1:N ──▶ VerificationToken
  │
  └── 1:1 ──▶ Beneficiary
                 │
                 └── 1:N ──▶ EmailLog
```

---

## Validation Rules

### VerificationToken
- Token must be exactly 6 digits
- Token expires 10 minutes after creation
- Maximum 5 resends per token series
- Minimum 60 seconds between resends
- Token invalidated after successful use
- Previous tokens invalidated when new one created

### Beneficiary Update (Onboarding)
- Phone: Optional, Brazilian format (11 digits)
- Email: Optional, valid email format
- At least one contact field recommended (soft validation)

---

## Data Migration Strategy

1. **Add new fields** with defaults (no data loss)
2. **Create VerificationToken model** (new table)
3. **Existing users**: Set onboarding_completed=True to skip onboarding
4. **New users**: Default onboarding_completed=False
