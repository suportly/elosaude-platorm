# Research: iOS App Store Build & Deploy via GitHub Actions

**Feature**: 003-ios-appstore-deploy
**Date**: 2025-12-16

## Summary

This research documents findings for implementing automated iOS builds and App Store deployment using GitHub Actions with an Expo/React Native project.

## Current Project Analysis

### Existing Configuration

| Aspect | Value |
|--------|-------|
| Framework | Expo (React Native) |
| App Name | Elosaúde |
| Bundle ID | com.elosaude.app |
| Current Version | 1.0.0 |
| EAS Config | Not present (needs creation) |
| GitHub Workflows | None exist |

### Key Files

- `mobile/app.json` - Expo configuration
- `mobile/eas.json` - Needs creation (EAS Build config)
- `.github/workflows/ios-build.yml` - Needs creation

## Research Findings

### Decision: Use EAS Build (Expo Application Services)

**Rationale**: EAS Build is the official Expo solution for building iOS apps. It handles:
- iOS signing and provisioning automatically
- Cloud-based builds (no need for local macOS)
- Integration with App Store Connect
- Works seamlessly with Expo projects

**Alternatives Considered**:
1. **Fastlane + Self-hosted runners**: More control but requires macOS runners ($$$) and complex setup
2. **Bare React Native + Xcode Cloud**: Requires ejecting from Expo, losing managed workflow benefits
3. **Manual builds**: Not scalable, defeats the purpose of CI/CD

### Decision: Use EAS Submit for App Store Upload

**Rationale**: EAS Submit integrates directly with EAS Build and handles:
- Automatic upload to App Store Connect
- TestFlight distribution
- App Store Connect API authentication

**Alternatives Considered**:
1. **Fastlane deliver**: Requires separate configuration and macOS
2. **Manual upload via Transporter**: Not automated
3. **xcrun altool**: Deprecated in favor of notarytool

### Decision: GitHub Actions with EAS CLI

**Rationale**: GitHub Actions is the repository's native CI/CD solution:
- No additional service to configure
- Secrets management built-in
- Triggers on push/PR events
- Free for public repos, generous limits for private

**Alternatives Considered**:
1. **CircleCI**: Requires separate account and configuration
2. **Bitrise**: Specialized for mobile but adds another service
3. **EAS Triggers**: Limited compared to GitHub Actions flexibility

### Apple Developer Requirements

| Requirement | Purpose | How to Obtain |
|-------------|---------|---------------|
| Apple Developer Account | Required for distribution | User already has |
| App ID | Identifies app uniquely | Register in Apple Developer Portal |
| Distribution Certificate | Signs app for App Store | Generate in Apple Developer Portal |
| Provisioning Profile | Links cert + app ID + devices | Generate in Apple Developer Portal |
| App Store Connect API Key | Automated authentication | Create in App Store Connect → Users and Access |

### GitHub Secrets Required

| Secret Name | Description | Source |
|-------------|-------------|--------|
| `EXPO_TOKEN` | EAS authentication | expo.dev account settings |
| `APPLE_ID` | Apple Developer email | Apple Developer account |
| `ASC_KEY_ID` | App Store Connect API Key ID | App Store Connect |
| `ASC_ISSUER_ID` | App Store Connect Issuer ID | App Store Connect |
| `ASC_API_KEY` | App Store Connect API Key (base64) | App Store Connect |

### Build Version Strategy

**Decision**: Use `APP_BUILD_NUMBER` based on Git commit count or workflow run number

**Rationale**:
- Automatically increments
- No manual intervention needed
- Unique per build
- Easy to trace back to commits

**Implementation**:
```bash
# In GitHub Actions
APP_BUILD_NUMBER=${{ github.run_number }}
```

### Workflow Triggers

| Trigger | Action | Purpose |
|---------|--------|---------|
| Push to `main` | Full build + TestFlight | Production deployments |
| Push to `develop` | Build only (no submit) | Validate builds |
| Manual dispatch | Configurable | On-demand releases |

## Security Considerations

Per Constitution IV (Security by Design):
- All credentials stored as GitHub Secrets (encrypted)
- No credentials in code or logs
- API keys rotated annually
- Minimal permission scope for API keys

## References

- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- App Store Connect API: https://developer.apple.com/documentation/appstoreconnectapi
- GitHub Actions: https://docs.github.com/en/actions
