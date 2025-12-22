# Feature Specification: Painel Administrativo Web

**Feature Branch**: `006-web-admin`
**Created**: 2025-12-21
**Status**: Draft
**Input**: User description: "criar projeto web com next de admin, para usuarios admin.. com dashboards, cruds, telas de gerenciamento"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticacao e Acesso Seguro (Priority: P1)

O administrador acessa o painel administrativo atraves de um login seguro. Apos autenticacao, ele visualiza o dashboard principal com informacoes relevantes para sua funcao.

**Why this priority**: Sem autenticacao, nenhuma outra funcionalidade pode ser acessada. E o ponto de entrada obrigatorio para todas as operacoes administrativas.

**Independent Test**: Pode ser testado criando credenciais de admin e verificando que o acesso ao dashboard e concedido apenas apos login valido.

**Acceptance Scenarios**:

1. **Given** um usuario admin com credenciais validas, **When** ele insere email e senha corretos, **Then** ele e redirecionado para o dashboard principal
2. **Given** um usuario sem permissao de admin, **When** ele tenta acessar o painel, **Then** ele recebe mensagem de acesso negado
3. **Given** um admin autenticado inativo por 30 minutos, **When** ele tenta realizar uma acao, **Then** ele e redirecionado para o login

---

### User Story 2 - Dashboard Principal com Metricas (Priority: P1)

O administrador visualiza um dashboard com metricas chave do sistema, incluindo totais de usuarios, reembolsos pendentes, e atividades recentes.

**Why this priority**: O dashboard fornece visao geral essencial para tomada de decisoes. E a primeira tela que o admin ve apos login.

**Independent Test**: Pode ser testado verificando que os cards de metricas exibem dados consistentes com o banco de dados.

**Acceptance Scenarios**:

1. **Given** um admin autenticado, **When** ele acessa o dashboard, **Then** ele ve cards com metricas atualizadas (usuarios ativos, reembolsos pendentes, receita do mes)
2. **Given** um admin no dashboard, **When** novos dados sao registrados no sistema, **Then** as metricas atualizam ao recarregar a pagina
3. **Given** um admin visualizando metricas, **When** ele clica em um card, **Then** ele e levado a tela de detalhes correspondente

---

### User Story 3 - Gerenciamento de Usuarios (Priority: P2)

O administrador gerencia usuarios do sistema, podendo visualizar lista, criar novos usuarios, editar informacoes e desativar contas.

**Why this priority**: Gerenciamento de usuarios e fundamental para manter o sistema organizado, mas depende do acesso autenticado (P1).

**Independent Test**: Pode ser testado criando, editando e desativando um usuario atraves da interface.

**Acceptance Scenarios**:

1. **Given** um admin na tela de usuarios, **When** ele clica em "Novo Usuario", **Then** ele ve um formulario para cadastro
2. **Given** um admin com formulario preenchido, **When** ele submete dados validos, **Then** o usuario e criado e aparece na lista
3. **Given** um admin visualizando um usuario, **When** ele clica em "Editar", **Then** ele pode modificar os dados do usuario
4. **Given** um admin visualizando um usuario, **When** ele clica em "Desativar", **Then** o usuario e marcado como inativo (soft delete)

---

### User Story 4 - Gerenciamento de Prestadores de Servico (Priority: P2)

O administrador gerencia prestadores de servico de saude cadastrados na plataforma, podendo aprovar novos cadastros, editar informacoes e gerenciar status.

**Why this priority**: Prestadores sao entidade central do negocio e seu gerenciamento e essencial para operacao.

**Independent Test**: Pode ser testado aprovando um prestador pendente e verificando que ele aparece como ativo.

**Acceptance Scenarios**:

1. **Given** um admin na tela de prestadores, **When** existem prestadores aguardando aprovacao, **Then** ele ve badge com contagem de pendentes
2. **Given** um admin visualizando prestador pendente, **When** ele clica em "Aprovar", **Then** o prestador muda para status ativo
3. **Given** um admin editando prestador, **When** ele altera especialidades ou dados de contato, **Then** as alteracoes sao salvas

---

### User Story 5 - Gerenciamento de Reembolsos (Priority: P2)

O administrador visualiza e gerencia solicitacoes de reembolso, podendo aprovar, rejeitar e acompanhar o historico.

**Why this priority**: Reembolsos sao fluxo financeiro importante e requerem gestao administrativa.

**Independent Test**: Pode ser testado aprovando um reembolso e verificando que o status atualiza corretamente.

**Acceptance Scenarios**:

1. **Given** um admin na tela de reembolsos, **When** existem reembolsos pendentes, **Then** ele ve lista ordenada por data de solicitacao
2. **Given** um admin visualizando reembolso, **When** ele clica em "Aprovar" com justificativa, **Then** o reembolso muda para status aprovado
3. **Given** um admin visualizando reembolso, **When** ele clica em "Rejeitar" com motivo, **Then** o reembolso muda para status rejeitado e usuario e notificado

---

### User Story 6 - Relatorios e Exportacao de Dados (Priority: P3)

O administrador gera relatorios personalizados e exporta dados para analise externa.

**Why this priority**: Relatorios sao importantes para analise, mas nao sao bloqueadores para operacao diaria.

**Independent Test**: Pode ser testado gerando um relatorio de usuarios e verificando que o arquivo exportado contem os dados corretos.

**Acceptance Scenarios**:

1. **Given** um admin na tela de relatorios, **When** ele seleciona tipo de relatorio e periodo, **Then** ele ve preview dos dados
2. **Given** um admin com relatorio gerado, **When** ele clica em "Exportar CSV", **Then** um arquivo CSV e baixado com os dados
3. **Given** um admin com relatorio gerado, **When** ele clica em "Exportar PDF", **Then** um arquivo PDF formatado e baixado

---

### User Story 7 - Configuracoes do Sistema (Priority: P3)

O administrador acessa tela de configuracoes para ajustar parametros gerais do sistema.

**Why this priority**: Configuracoes sao usadas ocasionalmente e nao sao essenciais para operacao diaria.

**Independent Test**: Pode ser testado alterando uma configuracao e verificando que o comportamento do sistema muda conforme esperado.

**Acceptance Scenarios**:

1. **Given** um admin na tela de configuracoes, **When** ele visualiza as opcoes, **Then** ele ve configuracoes agrupadas por categoria
2. **Given** um admin alterando configuracao, **When** ele salva, **Then** a configuracao e aplicada e log de auditoria e criado

---

### Edge Cases

- O que acontece quando um admin tenta editar um usuario que foi excluido por outro admin simultaneamente?
  - Sistema exibe mensagem de conflito e atualiza a lista
- Como o sistema lida com tentativas de login com credenciais incorretas repetidas?
  - Apos 5 tentativas falhas, a conta e bloqueada por 15 minutos
- O que acontece se a exportacao de relatorio for muito grande?
  - Sistema processa em background e envia link por email quando pronto
- Como o sistema lida com perda de conexao durante uma operacao de salvamento?
  - Formulario mantem dados localmente e exibe opcao de reenviar

## Requirements *(mandatory)*

### Functional Requirements

**Autenticacao e Autorizacao**
- **FR-001**: Sistema DEVE permitir login de administradores via email e senha
- **FR-002**: Sistema DEVE encerrar sessao automaticamente apos 30 minutos de inatividade
- **FR-003**: Sistema DEVE bloquear conta apos 5 tentativas de login invalidas por 15 minutos
- **FR-004**: Sistema DEVE registrar log de todas as acoes administrativas com timestamp e usuario

**Dashboard**
- **FR-005**: Sistema DEVE exibir metricas atualizadas no dashboard principal
- **FR-006**: Sistema DEVE permitir filtragem de metricas por periodo (hoje, semana, mes, ano)
- **FR-007**: Sistema DEVE exibir lista de atividades recentes no dashboard

**Gestao de Usuarios**
- **FR-008**: Sistema DEVE permitir listagem de usuarios com busca e filtros
- **FR-009**: Sistema DEVE permitir criacao de novos usuarios com validacao de dados obrigatorios
- **FR-010**: Sistema DEVE permitir edicao de dados de usuarios existentes
- **FR-011**: Sistema DEVE permitir desativacao de usuarios (soft delete)
- **FR-012**: Sistema DEVE suportar paginacao na listagem de usuarios

**Gestao de Prestadores**
- **FR-013**: Sistema DEVE permitir listagem de prestadores com busca por nome e especialidade
- **FR-014**: Sistema DEVE permitir aprovacao e rejeicao de prestadores pendentes
- **FR-015**: Sistema DEVE permitir edicao de informacoes de prestadores
- **FR-016**: Sistema DEVE notificar prestador quando status mudar

**Gestao de Reembolsos**
- **FR-017**: Sistema DEVE exibir lista de reembolsos com status (pendente, aprovado, rejeitado, pago)
- **FR-018**: Sistema DEVE permitir aprovacao de reembolso com campo para justificativa
- **FR-019**: Sistema DEVE permitir rejeicao de reembolso com campo obrigatorio para motivo
- **FR-020**: Sistema DEVE exibir historico completo de cada reembolso

**Relatorios**
- **FR-021**: Sistema DEVE permitir geracao de relatorios por tipo de entidade (usuarios, prestadores, reembolsos)
- **FR-022**: Sistema DEVE permitir exportacao de dados em formato CSV
- **FR-023**: Sistema DEVE permitir exportacao de dados em formato PDF

**Configuracoes**
- **FR-024**: Sistema DEVE permitir visualizacao de configuracoes do sistema agrupadas por categoria
- **FR-025**: Sistema DEVE registrar historico de alteracoes de configuracoes

### Key Entities

- **Usuario Admin**: Administrador do sistema com permissao de acesso ao painel. Atributos: nome, email, senha (hash), status (ativo/inativo), ultimo acesso, permissoes
- **Usuario**: Usuarios finais da plataforma gerenciados pelos admins. Atributos: nome, email, telefone, CPF, status, data cadastro
- **Prestador**: Profissionais ou clinicas de saude. Atributos: nome, CNPJ/CPF, especialidades, endereco, status (pendente/ativo/inativo), documentos
- **Reembolso**: Solicitacoes de reembolso de usuarios. Atributos: usuario solicitante, valor, comprovantes, status, data solicitacao, admin responsavel, justificativa
- **Configuracao**: Parametros do sistema. Atributos: chave, valor, categoria, ultima alteracao, admin alterador
- **Log de Auditoria**: Registro de acoes administrativas. Atributos: admin, acao, entidade afetada, data/hora, detalhes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administradores conseguem realizar login em menos de 10 segundos
- **SC-002**: Dashboard carrega completamente em menos de 3 segundos
- **SC-003**: Operacoes de CRUD (criar, editar, listar) respondem em menos de 2 segundos
- **SC-004**: 95% das operacoes administrativas sao concluidas com sucesso na primeira tentativa
- **SC-005**: Administradores conseguem encontrar qualquer registro em menos de 30 segundos usando busca
- **SC-006**: Sistema suporta ate 50 administradores simultaneos sem degradacao de performance
- **SC-007**: Exportacao de relatorios com ate 10.000 registros completa em menos de 30 segundos
- **SC-008**: 100% das acoes administrativas sao registradas em log de auditoria
- **SC-009**: Tempo medio para aprovar/rejeitar um reembolso reduz em 50% comparado ao processo atual
- **SC-010**: Taxa de erros de usuario na interface administrativa e inferior a 5%

## Assumptions

- Usuarios admin ja existem no sistema backend e podem ser autenticados via API existente
- O sistema mobile existente (React Native/Expo) continuara operando independentemente do painel admin
- O backend Django existente fornecera as APIs necessarias para o painel administrativo
- Os dados de usuarios, prestadores e reembolsos ja existem no banco PostgreSQL
- Navegadores suportados: Chrome, Firefox, Safari, Edge (ultimas 2 versoes)
- Acesso ao painel sera restrito a rede interna ou VPN (nao sera acessivel publicamente)
- Internacionalizacao nao e necessaria - interface sera em portugues brasileiro
- Tema claro sera o padrao, modo escuro e opcional para versao futura
