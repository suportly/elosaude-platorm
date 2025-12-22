# Requirements Checklist: Admin Design System - Elo Saúde

**Feature**: 007-admin-design-system
**Created**: 2025-12-22

## Specification Quality

- [x] User stories are prioritized (P1, P2, P3)
- [x] Each user story has acceptance scenarios in Given/When/Then format
- [x] Each user story has independent test criteria
- [x] Edge cases are documented
- [x] Functional requirements are numbered (FR-XXX)
- [x] Non-functional requirements are included (NFR-XXX)
- [x] Success criteria are measurable (SC-XXX)
- [x] Key entities are defined

## Functional Requirements Checklist

### Design System Foundation (P1)

- [ ] **FR-001**: Paleta de cores Elo Saúde implementada
  - [ ] Primary: #1976D2 (azul)
  - [ ] Secondary: #4CAF50 (verde)
  - [ ] Sidebar: #1E2530 (dark)
  - [ ] Cores semânticas (success, warning, error, info)
  - [ ] Variáveis CSS definidas em globals.css

- [ ] **FR-002**: Sidebar vertical dark com navegação collapsible
  - [ ] Background #1E2530
  - [ ] Logo Elo Saúde no topo
  - [ ] Navegação com ícones e labels
  - [ ] Estado expandido (240px) e collapsed (72px)
  - [ ] Toggle button para collapse/expand
  - [ ] Item ativo destacado em azul
  - [ ] Tooltips quando collapsed

- [ ] **FR-003**: Dashboard com stats cards
  - [ ] 4 cards principais: Usuários, Reembolsos Pendentes, Prestadores, Faturamento
  - [ ] Ícones representativos em cada card
  - [ ] Valores numéricos destacados
  - [ ] Micro-interação no hover (scale + shadow)
  - [ ] Skeleton loading durante carregamento

### Interface Components (P2)

- [ ] **FR-004**: Header fixo
  - [ ] Campo de busca global à esquerda
  - [ ] Ícone de notificações ao centro
  - [ ] Avatar e dropdown de usuário à direita
  - [ ] Debounce de 300ms na busca
  - [ ] Dropdown com: nome, email, perfil, logout

- [ ] **FR-005**: Tabelas responsivas
  - [ ] Headers clicáveis para ordenação
  - [ ] Indicador de ordenação (asc/desc)
  - [ ] Hover highlight nas linhas
  - [ ] Paginação com indicador de página atual
  - [ ] Adaptação mobile (scroll ou cards)

- [ ] **FR-006**: Formulários com validação visual
  - [ ] Borda vermelha + mensagem em campos inválidos
  - [ ] Borda azul no focus
  - [ ] Label flutuante/animada
  - [ ] Estados: default, focus, error, disabled

- [ ] **FR-007**: Modais
  - [ ] Overlay escuro com fade
  - [ ] Fechar com click fora
  - [ ] Fechar com tecla ESC
  - [ ] Botão X no canto
  - [ ] Animação de entrada/saída

### UX Enhancements (P3)

- [ ] **FR-008**: Skeleton loading
  - [ ] Shimmer animation
  - [ ] Skeletons para: cards, tabelas, forms
  - [ ] Substituição suave quando dados carregam

- [ ] **FR-009**: Responsividade
  - [ ] Breakpoint mobile: < 768px
  - [ ] Breakpoint tablet: 768-1279px
  - [ ] Breakpoint desktop: >= 1280px
  - [ ] Sidebar drawer em mobile
  - [ ] Menu hamburger em mobile

- [ ] **FR-010**: Transições consistentes
  - [ ] Fast: 150ms ease (hover states)
  - [ ] Normal: 200ms ease (UI changes)
  - [ ] Slow: 300ms ease (modals, overlays)

## Non-Functional Requirements Checklist

- [ ] **NFR-001**: Contraste WCAG AA
  - [ ] Textos sobre fundo claro >= 4.5:1
  - [ ] Textos sobre sidebar dark >= 4.5:1
  - [ ] Testar com ferramenta de contraste

- [ ] **NFR-002**: Acessibilidade de animações
  - [ ] Respeitar prefers-reduced-motion
  - [ ] Alternativas estáticas quando necessário

- [ ] **NFR-003**: Performance FCP
  - [ ] First Contentful Paint < 1.5s
  - [ ] Medir com Lighthouse

- [ ] **NFR-004**: Layout Shift
  - [ ] Cumulative Layout Shift < 0.1
  - [ ] Reservar espaço para conteúdo dinâmico

## Success Criteria Validation

- [ ] **SC-001**: 100% dos componentes usam design tokens
- [ ] **SC-002**: Todas as interações têm feedback visual
- [ ] **SC-003**: Layout funciona nos 3 breakpoints
- [ ] **SC-004**: Lighthouse Accessibility >= 90
- [ ] **SC-005**: Todas as cores passam teste de contraste
- [ ] **SC-006**: Transições consistentes (150-300ms)

## Implementation Order

1. **Phase 1 - Design Tokens** (P1)
   - Definir CSS variables em globals.css
   - Configurar Tailwind com custom colors
   - Importar fonte Inter

2. **Phase 2 - Layout Base** (P1)
   - Refatorar Sidebar com novo design
   - Implementar collapse/expand
   - Atualizar navegação

3. **Phase 3 - Dashboard** (P1)
   - Criar StatsCard component
   - Implementar dashboard layout
   - Adicionar skeleton loading

4. **Phase 4 - Components** (P2)
   - Header com busca e user menu
   - Tabelas responsivas
   - Formulários e modais

5. **Phase 5 - Polish** (P3)
   - Micro-interações
   - Responsividade completa
   - Testes de acessibilidade
