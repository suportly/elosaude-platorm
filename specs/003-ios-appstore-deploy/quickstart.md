# Quickstart: iOS App Store Build & Deploy

**Feature**: 003-ios-appstore-deploy

## Prerequisites

Before starting, ensure you have:

- [ ] Apple Developer Program membership active
- [ ] Access to App Store Connect (admin role)
- [ ] GitHub repository admin access
- [ ] Expo account at expo.dev

## Step 1: Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **Users and Access** → **Keys**
3. Click **+** to create a new key
4. Name: `GitHub Actions CI/CD`
5. Access: **App Manager** role
6. Download the `.p8` file (only available once!)
7. Note the **Key ID** and **Issuer ID**

## Step 2: Get Expo Token

1. Go to [expo.dev](https://expo.dev/)
2. Sign in to your account
3. Navigate to **Access Tokens**
4. Create new token named `GitHub Actions`
5. Copy the token value

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `EXPO_TOKEN` | Token from Step 2 |
| `APPLE_ID` | Your Apple Developer email |
| `ASC_KEY_ID` | Key ID from Step 1 |
| `ASC_ISSUER_ID` | Issuer ID from Step 1 |
| `ASC_API_KEY` | Base64 encoded .p8 file content* |

*To encode the .p8 file:
```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n'
```

## Step 4: Register App in App Store Connect

If not already done:

1. Go to App Store Connect → **My Apps**
2. Click **+** → **New App**
3. Platform: iOS
4. Name: Elosaúde
5. Bundle ID: `com.elosaude.app`
6. SKU: `elosaude-ios`
7. Note the **Apple ID** (numeric) of the created app

## Step 5: Create EAS Configuration

Create `mobile/eas.json`:

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
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "YOUR_APPLE_ID_EMAIL",
        "ascAppId": "APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

Replace:
- `YOUR_APPLE_ID_EMAIL` with your Apple Developer email
- `APP_STORE_CONNECT_APP_ID` with the numeric Apple ID from Step 4

## Step 6: Create GitHub Workflow

Create `.github/workflows/ios-build.yml`:

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

      - name: Submit to App Store
        if: github.ref == 'refs/heads/main'
        working-directory: mobile
        run: |
          eas submit --platform ios --profile production --non-interactive
```

## Step 7: Test the Pipeline

1. Commit and push changes to `main`:
   ```bash
   git add .
   git commit -m "feat: Add iOS CI/CD pipeline"
   git push origin main
   ```

2. Go to **Actions** tab in GitHub
3. Watch the workflow execute
4. Check App Store Connect for new build

## Verification Checklist

After first successful run:

- [ ] Workflow completed without errors
- [ ] Build appears in EAS dashboard (expo.dev)
- [ ] Build appears in App Store Connect
- [ ] Build is available in TestFlight
- [ ] Internal testers received notification

## Troubleshooting

### "Authentication failed"
- Verify `EXPO_TOKEN` is correct
- Check API key has sufficient permissions

### "No matching provisioning profile"
- Run `eas credentials` locally to set up certificates
- Or enable auto-managed credentials in eas.json

### "Invalid bundle identifier"
- Ensure `app.json` bundle ID matches App Store Connect
- Bundle ID: `com.elosaude.app`

### Build timeout
- Check EAS build queue status
- Increase timeout in workflow if needed

## Manual Trigger

To trigger a build manually:

1. Go to **Actions** → **iOS Build & Deploy**
2. Click **Run workflow**
3. Select branch and profile
4. Click **Run workflow**
