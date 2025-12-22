# Quickstart: Admin Design System - Elo Saúde

**Feature**: 007-admin-design-system
**Date**: 2025-12-22

## Prerequisites

```bash
# Ensure you're on the feature branch
git checkout 007-admin-design-system

# Install dependencies (if needed)
cd admin && npm install
```

## Running the Admin

```bash
# From repo root
npm run dev:admin

# Or directly
cd admin && npm run dev
```

Access: http://localhost:3000

Login: alairjt@gmail.com / qwer=123

## Test Scenarios

### US1: Dashboard Stats Cards

1. Login como admin
2. Acessar /dashboard
3. Verificar:
   - [ ] 4 cards de stats visíveis (Usuários, Reembolsos, Prestadores, Faturamento)
   - [ ] Cards exibem valores numéricos
   - [ ] Hover em card: scale(1.02) + shadow
   - [ ] Skeleton loading ao recarregar página

### US2: Sidebar Dark Collapsible

1. Após login, verificar sidebar:
   - [ ] Background #1E2530 (dark)
   - [ ] Logo Elo Saúde no topo
   - [ ] Items de navegação com ícones
   - [ ] Item ativo destacado em teal (#1bb198)
2. Clicar no botão collapse:
   - [ ] Sidebar reduz de 240px para 72px
   - [ ] Labels desaparecem, apenas ícones
   - [ ] Transição suave (200ms)
3. Hover em item collapsed:
   - [ ] Tooltip exibe nome da seção

### US3: Design Tokens

1. Inspecionar CSS (DevTools):
   - [ ] `--color-primary: #1bb198`
   - [ ] `--color-secondary: #1976D2`
   - [ ] `--color-sidebar-bg: #1E2530`
2. Verificar fonte:
   - [ ] Inter como fonte principal

### US4: Header Search

1. No header, campo de busca:
   - [ ] Placeholder "Buscar usuários..."
   - [ ] Digitar texto: debounce 300ms
   - [ ] Resultados filtram por nome/email
2. Menu de usuário (avatar):
   - [ ] Click exibe dropdown
   - [ ] Nome e email visíveis
   - [ ] Botão "Sair" funciona

### US5: Data Tables

1. Acessar /users:
   - [ ] Tabela com colunas: Nome, Email, Role, Ações
   - [ ] Click no header ordena (asc/desc)
   - [ ] Hover na linha destaca background
   - [ ] Paginação funciona
2. Redimensionar para mobile (<768px):
   - [ ] Tabela com scroll horizontal ou cards

### US6: Forms & Modals

1. Em qualquer página com formulário:
   - [ ] Campo com erro: borda vermelha + mensagem
   - [ ] Campo em focus: borda teal
2. Abrir modal:
   - [ ] Click fora fecha
   - [ ] ESC fecha
   - [ ] Animação fade in/out

### US7: Micro-interactions

1. Botões:
   - [ ] Hover escurece 10%
   - [ ] Transition 150ms
2. Loading states:
   - [ ] Skeleton com shimmer animation

### US8: Responsividade

1. Desktop (>=1280px):
   - [ ] Sidebar expandida
2. Tablet (768-1279px):
   - [ ] Sidebar collapsed por padrão
3. Mobile (<768px):
   - [ ] Sidebar como drawer
   - [ ] Menu hamburger no header

## Accessibility Checks

```bash
# Run Lighthouse in Chrome DevTools
# Target: Accessibility score >= 90

# Manual checks:
# - Tab navigation works
# - Focus indicators visible
# - Color contrast passes WCAG AA
```

## Visual Regression (Manual)

Compare antes/depois:
1. Screenshot da sidebar atual
2. Implementar mudanças
3. Comparar visualmente

## Performance Checks

```bash
# Chrome DevTools > Lighthouse
# Target metrics:
# - FCP < 1.5s
# - CLS < 0.1
```
