# Implementation Tasks: iOS App Store Build & Deploy

**Feature**: 003-ios-appstore-deploy
**Generated**: 2025-12-16
**Source**: [plan.md](./plan.md) | [spec.md](./spec.md)

## Task Overview

| Phase | Description | Tasks | Priority |
|-------|-------------|-------|----------|
| Setup | Prerequisites and verification | 3 | P1 |
| Foundation | EAS configuration | 2 | P1 |
| US1+US2 | Build and signing workflow | 4 | P1 |
| US3+US4 | Upload and TestFlight | 2 | P2 |
| US5 | Auto versioning | 2 | P3 |
| Polish | Documentation and verification | 2 | P1 |

**Total Tasks**: 15

---

## Phase 1: Setup (Prerequisites)

### Task 1.1: Verify Apple Developer Account Status
**Priority**: P1 | **Estimate**: Manual | **Dependencies**: None

Verify that Apple Developer Program membership is active and has the necessary permissions.

**Checklist**:
- [ ] Apple Developer Program membership is active
- [ ] User has admin access to App Store Connect
- [ ] App ID `com.elosaude.app` is registered in Apple Developer Portal

**Files**: None (manual verification)

---

### Task 1.2: Create App Store Connect API Key
**Priority**: P1 | **Estimate**: Manual | **Dependencies**: Task 1.1

Create API key for automated authentication with App Store Connect.

**Steps**:
1. Go to App Store Connect → Users and Access → Keys
2. Create new key with "App Manager" role
3. Name it "GitHub Actions CI/CD"
4. Download .p8 file (only available once!)
5. Note Key ID and Issuer ID

**Output**:
- API Key ID: `__________`
- Issuer ID: `__________`
- .p8 file saved securely

**Files**: None (manual configuration)

---

### Task 1.3: Get Expo Access Token
**Priority**: P1 | **Estimate**: Manual | **Dependencies**: None

Create Expo access token for EAS CLI authentication.

**Steps**:
1. Go to expo.dev → Account Settings → Access Tokens
2. Create new token named "GitHub Actions"
3. Copy token value

**Output**:
- EXPO_TOKEN: `__________`

**Files**: None (manual configuration)

---

## Phase 2: Foundation (EAS Configuration)

### Task 2.1: Create EAS Build Configuration [X]
**Priority**: P1 | **Estimate**: 5min | **Dependencies**: None

Create `mobile/eas.json` with build profiles for development, preview, and production.

**Implementation**:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "[APPLE_ID_EMAIL]",
        "ascAppId": "[APP_STORE_CONNECT_APP_ID]"
      }
    }
  }
}
```

**Files**:
- CREATE: `mobile/eas.json`

**Acceptance**:
- [ ] File created with valid JSON
- [ ] Three build profiles defined (development, preview, production)
- [ ] Submit configuration includes iOS settings

---

### Task 2.2: Configure GitHub Repository Secrets
**Priority**: P1 | **Estimate**: Manual | **Dependencies**: Task 1.2, Task 1.3

Add required secrets to GitHub repository settings.

**Steps**:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add each secret:

| Secret Name | Value Source |
|-------------|--------------|
| `EXPO_TOKEN` | From Task 1.3 |
| `APPLE_ID` | Apple Developer email |
| `ASC_KEY_ID` | From Task 1.2 |
| `ASC_ISSUER_ID` | From Task 1.2 |
| `ASC_API_KEY` | Base64 encoded .p8 file* |

*Encode .p8 file:
```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n'
```

**Files**: None (GitHub configuration)

**Acceptance**:
- [ ] All 5 secrets configured in GitHub
- [ ] Secrets are properly encrypted (GitHub handles this)

---

## Phase 3: US1+US2 - Build and Signing (P1)

### Task 3.1: Create GitHub Actions Workflow File [X]
**Priority**: P1 | **Estimate**: 10min | **Dependencies**: Task 2.1

Create the main GitHub Actions workflow for iOS builds.

**Implementation**:
```yaml
name: iOS Build & Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      profile:
        description: 'Build profile'
        required: true
        default: 'production'
        type: choice
        options:
          - production
          - preview

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: mobile/package-lock.json

      - name: Install dependencies
        working-directory: mobile
        run: npm ci

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        working-directory: mobile
        run: |
          eas build --platform ios --profile ${{ inputs.profile || 'production' }} --non-interactive
```

**Files**:
- CREATE: `.github/workflows/ios-build.yml`

**Acceptance**:
- [ ] Workflow file created with valid YAML
- [ ] Triggers on push to main and manual dispatch
- [ ] Uses expo-github-action for EAS setup
- [ ] Build command uses correct profile

**User Stories**: US1, US2

---

### Task 3.2: Create .github/workflows Directory [X]
**Priority**: P1 | **Estimate**: 1min | **Dependencies**: None

Ensure the workflows directory exists.

**Implementation**:
```bash
mkdir -p .github/workflows
```

**Files**:
- CREATE: `.github/workflows/` (directory)

---

### Task 3.3: Add EAS Credentials Configuration
**Priority**: P1 | **Estimate**: Manual | **Dependencies**: Task 2.1

Configure EAS credentials for iOS signing (first-time setup).

**Steps**:
1. Run locally: `cd mobile && npx eas credentials`
2. Select iOS → production profile
3. Choose "Let EAS manage credentials" (recommended)
4. Or upload existing certificates if available

**Note**: EAS can auto-manage iOS credentials, generating:
- Distribution certificate
- Provisioning profile

**Acceptance**:
- [ ] Credentials configured in EAS (visible at expo.dev)
- [ ] Distribution certificate valid
- [ ] Provisioning profile matches bundle ID

**User Stories**: US2

---

### Task 3.4: Test Local Build Command
**Priority**: P1 | **Estimate**: 15min | **Dependencies**: Task 2.1, Task 3.3

Verify EAS build works locally before GitHub Actions.

**Steps**:
```bash
cd mobile
npx eas build --platform ios --profile preview --non-interactive
```

**Acceptance**:
- [ ] Build queued successfully in EAS
- [ ] Build completes without errors
- [ ] .ipa artifact generated

**User Stories**: US1, US2

---

## Phase 4: US3+US4 - Upload and TestFlight (P2)

### Task 4.1: Add Submit Step to Workflow [X]
**Priority**: P2 | **Estimate**: 5min | **Dependencies**: Task 3.1

Add the App Store submission step to the GitHub Actions workflow.

**Implementation** (add to ios-build.yml):
```yaml
      - name: Submit to App Store
        if: github.ref == 'refs/heads/main'
        working-directory: mobile
        run: |
          eas submit --platform ios --profile production --non-interactive
```

**Files**:
- MODIFY: `.github/workflows/ios-build.yml`

**Acceptance**:
- [ ] Submit step added after build step
- [ ] Conditional on main branch only
- [ ] Uses production profile

**User Stories**: US3, US4

---

### Task 4.2: Configure TestFlight Internal Testing
**Priority**: P2 | **Estimate**: Manual | **Dependencies**: Task 4.1

Configure App Store Connect for automatic internal testing distribution.

**Steps**:
1. Go to App Store Connect → App → TestFlight
2. Add internal testers group if not exists
3. Enable "Automatically distribute to testers"
4. Add team members as internal testers

**Acceptance**:
- [ ] Internal testers group exists
- [ ] Automatic distribution enabled
- [ ] Team members added as testers

**User Stories**: US4

---

## Phase 5: US5 - Auto Versioning (P3)

### Task 5.1: Add Build Number Auto-Increment [X]
**Priority**: P3 | **Estimate**: 5min | **Dependencies**: Task 3.1

Configure automatic build number based on GitHub run number.

**Implementation** (modify eas.json):
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "buildConfiguration": "Release",
        "autoIncrement": "buildNumber"
      }
    }
  }
}
```

**Alternative** (using env in workflow):
```yaml
env:
  APP_BUILD_NUMBER: ${{ github.run_number }}
```

**Files**:
- MODIFY: `mobile/eas.json`

**Acceptance**:
- [ ] Build numbers increment automatically
- [ ] No manual version bumping needed
- [ ] Builds have unique identifiers

**User Stories**: US5

---

### Task 5.2: Add Version Display in Workflow Logs [X]
**Priority**: P3 | **Estimate**: 2min | **Dependencies**: Task 5.1

Add step to display version info in workflow logs.

**Implementation** (add to ios-build.yml):
```yaml
      - name: Display Version Info
        working-directory: mobile
        run: |
          echo "Build Number: ${{ github.run_number }}"
          cat app.json | grep -E '"version"|"buildNumber"'
```

**Files**:
- MODIFY: `.github/workflows/ios-build.yml`

**Acceptance**:
- [ ] Version info displayed in build logs
- [ ] Useful for debugging and tracking

**User Stories**: US5

---

## Phase 6: Polish (Documentation and Verification)

### Task 6.1: Verify Complete Pipeline
**Priority**: P1 | **Estimate**: 30min | **Dependencies**: All previous tasks

End-to-end verification of the complete CI/CD pipeline.

**Steps**:
1. Commit all changes to feature branch
2. Create PR and merge to main
3. Monitor GitHub Actions execution
4. Verify build in EAS dashboard
5. Verify build in App Store Connect
6. Verify TestFlight notification received

**Acceptance**:
- [ ] Workflow executes without errors
- [ ] Build appears in EAS dashboard
- [ ] Build uploaded to App Store Connect
- [ ] TestFlight notification sent to testers

---

### Task 6.2: Update Requirements Checklist
**Priority**: P1 | **Estimate**: 5min | **Dependencies**: Task 6.1

Mark all requirements as verified in the checklist.

**Files**:
- MODIFY: `specs/003-ios-appstore-deploy/checklists/requirements.md`

**Acceptance**:
- [ ] All functional requirements verified
- [ ] Success criteria documented
- [ ] Edge cases tested where applicable

---

## Dependency Graph

```
Task 1.1 ──────────────────┐
                           ├──► Task 1.2 ──┐
Task 1.3 ──────────────────┘               │
                                           ├──► Task 2.2
Task 2.1 ◄─────────────────────────────────┘
    │
    ├──► Task 3.1 ──► Task 4.1 ──► Task 5.2
    │        │
    │        └──► Task 3.4
    │
    └──► Task 3.3 ──► Task 3.4
    │
    └──► Task 5.1

Task 3.2 (independent)

Task 4.2 (manual, after 4.1)

Task 6.1 (after all)
    │
    └──► Task 6.2
```

## Execution Order (Recommended)

**Manual Setup** (do first):
1. Task 1.1: Verify Apple Developer Account
2. Task 1.2: Create App Store Connect API Key
3. Task 1.3: Get Expo Access Token
4. Task 2.2: Configure GitHub Secrets

**Automated Implementation**:
5. Task 3.2: Create .github/workflows directory
6. Task 2.1: Create eas.json
7. Task 3.1: Create GitHub Actions workflow
8. Task 4.1: Add submit step
9. Task 5.1: Add auto-increment
10. Task 5.2: Add version display

**Manual Verification**:
11. Task 3.3: Configure EAS credentials
12. Task 3.4: Test local build
13. Task 4.2: Configure TestFlight
14. Task 6.1: Verify complete pipeline
15. Task 6.2: Update checklist
