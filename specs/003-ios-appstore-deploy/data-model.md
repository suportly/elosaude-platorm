# Data Model: iOS App Store Build & Deploy

**Feature**: 003-ios-appstore-deploy
**Date**: 2025-12-16

## Overview

This feature involves CI/CD configuration rather than database entities. The "data model" represents configuration files and secrets that must be managed.

## Configuration Entities

### 1. EAS Build Configuration (`eas.json`)

Defines build profiles for different environments.

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
        "appleId": "[APPLE_ID]",
        "ascAppId": "[APP_STORE_CONNECT_APP_ID]"
      }
    }
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| cli.version | string | Minimum EAS CLI version |
| build.[profile] | object | Build configuration for profile |
| distribution | enum | "internal", "store", "simulator" |
| buildConfiguration | string | Xcode build config (Release/Debug) |
| submit.[profile].ios | object | App Store submission config |

### 2. GitHub Workflow Configuration

```yaml
# .github/workflows/ios-build.yml structure
name: iOS Build & Deploy
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      profile:
        type: choice
        options: [production, preview]

env:
  EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Build and submit steps
```

| Component | Purpose |
|-----------|---------|
| `on.push` | Trigger on branch push |
| `on.workflow_dispatch` | Manual trigger with inputs |
| `env.EXPO_TOKEN` | EAS authentication |
| `jobs.build` | Build job definition |

### 3. GitHub Secrets Entity (Conceptual)

Secrets stored in GitHub repository settings:

| Secret | Required | Description |
|--------|----------|-------------|
| `EXPO_TOKEN` | Yes | Token from expo.dev for EAS CLI |
| `APPLE_ID` | Yes | Apple Developer account email |
| `ASC_KEY_ID` | Yes | App Store Connect API Key ID |
| `ASC_ISSUER_ID` | Yes | App Store Connect Team Issuer ID |
| `ASC_API_KEY` | Yes | API Key content (base64 encoded) |

### 4. App Store Connect API Key Entity

Created in App Store Connect for automated access:

| Field | Description |
|-------|-------------|
| Key ID | Unique identifier for the key |
| Issuer ID | Team/Organization identifier |
| Key File | .p8 file containing private key |
| Permissions | Should include "App Manager" role |

## State Transitions

### Build States

```
┌─────────────┐
│   Queued    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Building   │──────────┐
└──────┬──────┘          │
       │                 ▼
       ▼          ┌─────────────┐
┌─────────────┐   │   Failed    │
│  Signing    │   └─────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Completed  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Submitting  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  TestFlight │
└─────────────┘
```

### Workflow Run States

| State | Description |
|-------|-------------|
| `queued` | Waiting for runner |
| `in_progress` | Executing steps |
| `completed` | All steps finished |
| `failure` | One or more steps failed |
| `cancelled` | Manually cancelled |

## Validation Rules

### EAS Configuration

- `cli.version` must be semver compatible string
- `distribution` must be valid enum value
- Apple credentials must be present for `store` distribution
- `ascAppId` must match registered app in App Store Connect

### Secrets

- `EXPO_TOKEN` must be valid (verified on EAS login)
- `ASC_API_KEY` must be base64 encoded .p8 content
- All secrets must be non-empty
- API Key must have sufficient permissions

## Relationships

```
GitHub Repository
    │
    ├── .github/workflows/ios-build.yml (references secrets)
    │
    └── mobile/
        ├── app.json (app metadata)
        └── eas.json (build profiles)

GitHub Secrets
    │
    └── EXPO_TOKEN ──────► expo.dev Account
    └── ASC_* secrets ───► App Store Connect API

App Store Connect
    │
    ├── API Key ◄──────── GitHub Secrets
    ├── App Record ◄───── eas.json (ascAppId)
    └── TestFlight ◄───── EAS Submit
```
