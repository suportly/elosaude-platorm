# Implementation Plan: iOS App Store Build & Deploy via GitHub Actions

**Branch**: `003-ios-appstore-deploy` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ios-appstore-deploy/spec.md`

## Summary

Implement automated iOS app builds and App Store deployment using GitHub Actions with EAS (Expo Application Services). The pipeline will compile the React Native/Expo app, sign it with Apple certificates, upload to App Store Connect, and distribute via TestFlight.

## Technical Context

**Language/Version**: TypeScript 5+ (Mobile), YAML (GitHub Actions)
**Primary Dependencies**: Expo SDK, EAS CLI, GitHub Actions
**Storage**: N/A (CI/CD configuration only)
**Testing**: Manual verification of pipeline execution
**Target Platform**: iOS 15+ via App Store
**Project Type**: Mobile CI/CD Pipeline
**Performance Goals**: Build completion < 30 minutes
**Constraints**: Requires Apple Developer Program membership
**Scale/Scope**: Single workflow, 3 build profiles (dev/preview/prod)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. LGPD & Privacy First | ✅ N/A | CI/CD does not handle user data |
| II. API-First Design | ✅ N/A | No API changes |
| III. Healthcare Standards | ✅ N/A | No healthcare workflow changes |
| IV. Security by Design | ✅ PASS | Credentials stored in GitHub Secrets (encrypted) |
| V. Mobile-Accessible UX | ✅ N/A | Pipeline configuration only |

**Gate Result**: PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/003-ios-appstore-deploy/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Configuration entities
├── quickstart.md        # Implementation guide
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── ios-build.yml       # GitHub Actions workflow (NEW)

mobile/
├── app.json                # Expo config (existing)
├── eas.json                # EAS Build config (NEW)
└── package.json            # Dependencies (existing)
```

**Structure Decision**: CI/CD configuration files at repository root level. Minimal changes to existing mobile project structure.

## Implementation Approach

### Phase 1: Apple Developer Setup (Manual)

Prerequisites that must be done in Apple's portals:

1. **App Store Connect**:
   - Register app if not exists
   - Create API Key for automation
   - Note App ID and Issuer ID

2. **Apple Developer Portal**:
   - Verify App ID registration
   - Distribution certificate available

### Phase 2: EAS Configuration

Create `mobile/eas.json` with build profiles:

| Profile | Distribution | Purpose |
|---------|-------------|---------|
| development | internal | Dev builds with dev client |
| preview | internal | Testing builds |
| production | store | App Store releases |

### Phase 3: GitHub Actions Workflow

Create `.github/workflows/ios-build.yml`:

1. **Triggers**:
   - Push to `main` (auto deploy)
   - Manual dispatch (on-demand)

2. **Jobs**:
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Run EAS Build
   - Submit to App Store (on main)

### Phase 4: Secrets Configuration

GitHub Secrets required:

| Secret | Source |
|--------|--------|
| `EXPO_TOKEN` | expo.dev account |
| `APPLE_ID` | Apple Developer email |
| `ASC_KEY_ID` | App Store Connect |
| `ASC_ISSUER_ID` | App Store Connect |
| `ASC_API_KEY` | Base64 encoded .p8 file |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Certificate expiration | Medium | High | Calendar reminders, monitoring |
| EAS service outage | Low | Medium | Manual fallback documented |
| Apple API changes | Low | Medium | Pin EAS CLI version |
| Secrets misconfiguration | Medium | High | Verification checklist in quickstart |

## Rollback Plan

If pipeline causes issues:

1. Disable workflow by renaming file to `.yml.disabled`
2. Manual builds can still be done via `eas build` locally
3. Manual upload via Transporter app as fallback

## Artifacts Generated

| Artifact | Purpose |
|----------|---------|
| [research.md](./research.md) | Technology decisions and rationale |
| [data-model.md](./data-model.md) | Configuration entities |
| [quickstart.md](./quickstart.md) | Step-by-step setup guide |

## Files to Create

| File | Description |
|------|-------------|
| `mobile/eas.json` | EAS Build configuration |
| `.github/workflows/ios-build.yml` | GitHub Actions workflow |

## Next Steps

Run `/speckit.tasks` to generate the implementation task list.
