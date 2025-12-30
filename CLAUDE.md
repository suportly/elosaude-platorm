# elosaude-platform Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-15

## Active Technologies
- Python 3.11 (Backend) + Django 4.2+, python-decouple, psycopg2-binary (002-postgres-config)
- PostgreSQL 14+ at 192.168.40.25 (002-postgres-config)
- TypeScript 5+ (Mobile), YAML (GitHub Actions) + Expo SDK, EAS CLI, GitHub Actions (003-ios-appstore-deploy)
- N/A (CI/CD configuration only) (003-ios-appstore-deploy)
- TypeScript 5+ (Mobile) + React Native + Expo 0.73+, React Native Paper 5+, React Navigation 6+ (004-ui-modernization)
- N/A (UI-only changes) (004-ui-modernization)
- TypeScript 5+, Python 3.11 (backend existente) + Next.js 14+, React 18+, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod (006-web-admin)
- PostgreSQL 14+ (backend existente via Django ORM) (006-web-admin)
- TypeScript 5+ + Next.js 14, Tailwind CSS 3.4, lucide-react, @tanstack/react-query (007-admin-design-system)
- N/A (frontend-only, APIs existentes) (007-admin-design-system)
- TypeScript 5+ + React Native, Expo 0.73+, React Native Paper 5+ (008-unimed-card-template)
- N/A (dados via API existente) (008-unimed-card-template)
- TypeScript 5+ + React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip) (009-vivest-card-template)
- N/A (dados vindos da API existente via OracleReciprocidade) (009-vivest-card-template)
- TypeScript 5+ + React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip), react-native-svg (para header curvo e logo) (010-eletros-card-template)

- TypeScript 5+ (Mobile), Python 3.11 (Backend) (001-reimbursement-screen)

## Project Structure

```text
src/
tests/
```

## Commands

cd src [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] pytest [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] ruff check .

## Code Style

TypeScript 5+ (Mobile), Python 3.11 (Backend): Follow standard conventions

## Recent Changes
- 010-eletros-card-template: Added TypeScript 5+ + React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip), react-native-svg (para header curvo e logo)
- 009-vivest-card-template: Added TypeScript 5+ + React Native + Expo 0.73+, React Native Paper 5+, react-native-reanimated 3.x (para animacao flip)
- 008-unimed-card-template: Added TypeScript 5+ + React Native, Expo 0.73+, React Native Paper 5+


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
