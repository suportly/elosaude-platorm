# Feature Specification: Admin Design System - Elo Saúde

**Feature Branch**: `007-admin-design-system`
**Created**: 2025-12-22
**Status**: Ready
**Input**: User description: "Redesign do admin panel com novo sistema de design Elo Saúde"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard Principal com Stats Cards (Priority: P1)

Como administrador, quero visualizar um dashboard com cards de estatísticas mostrando métricas chave (total de usuários, reembolsos pendentes, prestadores ativos, etc.) para ter uma visão geral rápida do sistema.

**Why this priority**: O dashboard é a primeira tela que o admin vê após login. Deve comunicar imediatamente o estado do sistema e permitir acesso rápido às funcionalidades principais.

**Independent Test**: Pode ser testado acessando /dashboard e verificando se os stats cards exibem dados corretos e respondem ao hover com micro-interações.

**Acceptance Scenarios**:

1. **Given** admin autenticado, **When** acessa o dashboard, **Then** vê 4 stats cards com métricas: Total Usuários, Reembolsos Pendentes, Prestadores Ativos, Faturamento Mensal
2. **Given** stats cards visíveis, **When** hover sobre um card, **Then** card exibe elevação sutil (shadow) e cursor pointer
3. **Given** dados carregando, **When** aguardando API, **Then** cards exibem skeleton loading animado

---

### User Story 2 - Sidebar Vertical Dark com Navegação (Priority: P1)

Como administrador, quero uma sidebar vertical escura à esquerda com navegação clara e collapsible para acessar todas as seções do admin de forma intuitiva.

**Why this priority**: A sidebar é o elemento de navegação principal e deve ser implementada junto com o dashboard para formar a estrutura base do design system.

**Independent Test**: Pode ser testado navegando entre seções da sidebar e verificando se a navegação funciona corretamente com indicadores visuais de página ativa.

**Acceptance Scenarios**:

1. **Given** admin autenticado, **When** visualiza sidebar, **Then** vê sidebar escura (#1E2530) com logo Elo Saúde no topo
2. **Given** sidebar visível, **When** clica em item de navegação, **Then** navega para a página correspondente com item destacado em teal (#1bb198)
3. **Given** sidebar expandida (240px), **When** clica no botão collapse, **Then** sidebar reduz para 72px mostrando apenas ícones
4. **Given** sidebar collapsed, **When** hover sobre item, **Then** tooltip exibe o nome da seção

---

### User Story 3 - Sistema de Cores e Tipografia Elo Saúde (Priority: P1)

Como desenvolvedor, quero um sistema de design tokens com a paleta Elo Saúde para garantir consistência visual em todo o admin.

**Why this priority**: Os tokens de design são a fundação do design system e devem ser definidos primeiro para que todos os componentes os utilizem.

**Independent Test**: Pode ser testado verificando se todas as cores e fontes estão definidas como CSS variables e aplicadas corretamente nos componentes.

**Acceptance Scenarios**:

1. **Given** design system implementado, **When** inspeciona CSS, **Then** encontra variáveis: --primary (#1bb198), --secondary (#1976D2), --sidebar-bg (#1E2530)
2. **Given** componentes renderizados, **When** verifica tipografia, **Then** usa Inter/Roboto como fonte principal com escala consistente
3. **Given** tema dark na sidebar, **When** verifica contraste, **Then** todos os textos passam WCAG AA (mínimo 4.5:1)

---

### User Story 4 - Header com Busca e Menu de Usuário (Priority: P2)

Como administrador, quero um header fixo no topo com campo de busca global e menu de usuário para acessar funcionalidades rápidas e gerenciar minha sessão.

**Why this priority**: O header complementa a sidebar e fornece funcionalidades de acesso rápido, mas pode ser implementado após a estrutura base.

**Independent Test**: Pode ser testado verificando se a busca filtra resultados e se o menu de usuário funciona corretamente.

**Acceptance Scenarios**:

1. **Given** admin na área logada, **When** visualiza header, **Then** vê campo de busca de usuários à esquerda, notificações ao centro, avatar/menu à direita
2. **Given** header visível, **When** digita na busca, **Then** debounce de 300ms e pesquisa usuários por nome/email
3. **Given** menu de usuário, **When** clica no avatar, **Then** dropdown exibe nome, email, link para perfil e botão logout

---

### User Story 5 - Listagens com Tabelas Responsivas (Priority: P2)

Como administrador, quero visualizar listagens (usuários, reembolsos, prestadores) em tabelas responsivas com paginação, filtros e ordenação.

**Why this priority**: As listagens são funcionalidades core do admin, mas podem reutilizar o design system já implementado.

**Independent Test**: Pode ser testado acessando /users, /reimbursements, /providers e verificando tabelas com todas as funcionalidades.

**Acceptance Scenarios**:

1. **Given** página de listagem, **When** carrega dados, **Then** exibe tabela com colunas ordenáveis (clique no header)
2. **Given** tabela com dados, **When** hover sobre linha, **Then** linha destaca com background sutil
3. **Given** tela < 768px, **When** visualiza tabela, **Then** tabela se adapta com scroll horizontal ou layout de cards
4. **Given** muitos registros, **When** navega, **Then** paginação funciona com indicador de página atual

---

### User Story 6 - Formulários e Modais Estilizados (Priority: P2)

Como administrador, quero formulários e modais com design consistente para criar/editar registros de forma intuitiva.

**Why this priority**: Formulários são essenciais para operações CRUD mas dependem do design system base estar pronto.

**Independent Test**: Pode ser testado abrindo modais de criação/edição e verificando validação e feedback visual.

**Acceptance Scenarios**:

1. **Given** formulário de criação, **When** campo tem erro, **Then** borda vermelha + mensagem de erro abaixo
2. **Given** campo de input, **When** focus, **Then** borda teal (#1bb198) + label animado para cima
3. **Given** modal aberto, **When** clica fora ou ESC, **Then** modal fecha com animação fade-out
4. **Given** formulário válido, **When** submete, **Then** botão mostra loading spinner e desabilita

---

### User Story 7 - Micro-interações e Feedback Visual (Priority: P3)

Como usuário, quero micro-interações sutis (hover, focus, transitions) para uma experiência mais polida e responsiva.

**Why this priority**: Micro-interações são melhorias de UX que podem ser adicionadas após as funcionalidades core.

**Independent Test**: Pode ser testado verificando transições CSS e feedback visual em interações.

**Acceptance Scenarios**:

1. **Given** botão primário, **When** hover, **Then** escurece 10% com transition 150ms ease
2. **Given** card de stats, **When** hover, **Then** scale(1.02) + shadow elevation com transition 200ms
3. **Given** navegação sidebar, **When** muda de página, **Then** fade transition no conteúdo principal
4. **Given** operação async, **When** carregando, **Then** skeleton loading com shimmer animation

---

### User Story 8 - Responsividade Mobile-First (Priority: P3)

Como administrador usando tablet/mobile, quero que o admin se adapte a diferentes tamanhos de tela mantendo usabilidade.

**Why this priority**: Responsividade é importante mas o admin é usado principalmente em desktop, então é prioridade secundária.

**Independent Test**: Pode ser testado redimensionando o browser e verificando breakpoints.

**Acceptance Scenarios**:

1. **Given** tela >= 1280px (desktop), **When** visualiza layout, **Then** sidebar expandida + conteúdo em grid
2. **Given** tela 768-1279px (tablet), **When** visualiza layout, **Then** sidebar collapsed por padrão + conteúdo adaptado
3. **Given** tela < 768px (mobile), **When** visualiza layout, **Then** sidebar como drawer + menu hamburger no header

---

### Edge Cases

- O que acontece quando a API demora mais de 5s para responder? (timeout + retry button)
- Como o sistema lida com perda de conexão? (mensagem offline + retry automático)
- O que acontece quando não há dados para exibir? (empty state ilustrado)
- Como lidar com textos muito longos em células da tabela? (truncate + tooltip)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE implementar paleta de cores Elo Saúde (Primary: #1bb198, Secondary: #1976D2, Sidebar: #1E2530)
- **FR-002**: Sistema DEVE exibir sidebar vertical escura com navegação collapsible (72px collapsed / 240px expanded)
- **FR-003**: Dashboard DEVE exibir stats cards com métricas principais do sistema
- **FR-004**: Sistema DEVE implementar header fixo com busca de usuários, notificações e menu de usuário
- **FR-005**: Tabelas DEVEM suportar ordenação, paginação e filtros
- **FR-006**: Formulários DEVEM exibir validação visual com feedback de erro/sucesso
- **FR-007**: Modais DEVEM fechar com clique fora, tecla ESC, ou botão close
- **FR-008**: Sistema DEVE implementar skeleton loading durante carregamento de dados
- **FR-009**: Sistema DEVE ser responsivo com breakpoints: mobile (<768px), tablet (768-1279px), desktop (>=1280px)
- **FR-010**: Transições e animações DEVEM usar timing consistente (150-300ms ease)

### Non-Functional Requirements

- **NFR-001**: Todas as cores de texto DEVEM passar WCAG AA (contraste mínimo 4.5:1)
- **NFR-002**: Animações DEVEM respeitar `prefers-reduced-motion` do usuário
- **NFR-003**: First Contentful Paint DEVE ser < 1.5s
- **NFR-004**: Layout Shift DEVE ser < 0.1 (CLS)

### Key Entities *(include if feature involves data)*

- **Design Tokens**: Variáveis CSS para cores, tipografia, espaçamento, sombras, border-radius
- **Componentes Base**: Button, Input, Select, Checkbox, Radio, Modal, Card, Table, Skeleton
- **Layout Components**: Sidebar, Header, Breadcrumb, PageContainer, Grid

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes utilizam design tokens (não valores hardcoded)
- **SC-002**: Todas as interações hover/focus/active têm feedback visual
- **SC-003**: Layout funciona corretamente em 3 breakpoints (mobile, tablet, desktop)
- **SC-004**: Lighthouse Accessibility score >= 90
- **SC-005**: Todas as cores passam teste de contraste WCAG AA
- **SC-006**: Tempo de transição de animações consistente em todo o app (150-300ms)

## Clarifications

### Session 2025-12-22

- Q: Qual é a cor primária da marca Elo Saúde? → A: #1bb198 (teal)
- Q: Qual deve ser a cor secundária do design system? → A: #1976D2 (azul)
- Q: O que a busca global deve pesquisar? → A: Apenas usuários

## Design System Tokens

### Color Palette

```css
/* Primary Colors - Elo Saúde Brand */
--color-primary: #1bb198;
--color-primary-light: #4ecdc4;
--color-primary-dark: #159383;

/* Secondary Colors */
--color-secondary: #1976D2;
--color-secondary-light: #42A5F5;
--color-secondary-dark: #1565C0;

/* Sidebar/Dark Theme */
--color-sidebar-bg: #1E2530;
--color-sidebar-hover: #2A3441;
--color-sidebar-active: #1bb198;
--color-sidebar-text: #B0BEC5;
--color-sidebar-text-active: #FFFFFF;

/* Neutral Colors */
--color-background: #F5F7FA;
--color-surface: #FFFFFF;
--color-border: #E0E0E0;
--color-text-primary: #212121;
--color-text-secondary: #757575;
--color-text-disabled: #BDBDBD;

/* Semantic Colors */
--color-success: #4CAF50;
--color-warning: #FF9800;
--color-error: #F44336;
--color-info: #2196F3;
```

### Typography Scale

```css
--font-family: 'Inter', 'Roboto', -apple-system, sans-serif;

--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px;
```

### Transitions

```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```
