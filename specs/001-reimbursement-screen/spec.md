# Feature Specification: Tela de Reembolso

**Feature Branch**: `001-reimbursement-screen`
**Created**: 2025-12-15
**Status**: Draft
**Input**: User description: "implementar tela de reembolso"

## Context

O módulo de reembolso permite que beneficiários do plano de saúde solicitem reembolso de despesas médicas realizadas fora da rede credenciada. A funcionalidade inclui criação de solicitações, acompanhamento de status, visualização de detalhes e download de comprovantes.

**Estado Atual**: As telas base já existem no aplicativo, mas há funcionalidades incompletas e melhorias necessárias identificadas durante a análise.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solicitar Novo Reembolso (Priority: P1)

Como beneficiário, quero criar uma nova solicitação de reembolso anexando documentos comprobatórios para receber o valor de despesas médicas realizadas fora da rede credenciada.

**Why this priority**: Esta é a funcionalidade core do módulo - sem ela, o beneficiário não consegue usar o recurso de reembolso.

**Independent Test**: Pode ser testado completamente acessando "Nova Solicitação", preenchendo o formulário e enviando. Entrega valor imediato ao permitir solicitações de reembolso.

**Acceptance Scenarios**:

1. **Given** beneficiário autenticado na tela de reembolsos, **When** toca no botão "Nova Solicitação", **Then** é exibido formulário com campos para tipo de despesa, data do serviço, prestador, valor e dados bancários

2. **Given** formulário de reembolso aberto, **When** preenche todos os campos obrigatórios e anexa pelo menos 1 documento, **Then** botão "Enviar" fica habilitado

3. **Given** formulário completo e válido, **When** toca em "Enviar Solicitação", **Then** sistema mostra progresso de upload, envia a solicitação e exibe mensagem de sucesso com número do protocolo

4. **Given** formulário com campos inválidos, **When** tenta enviar, **Then** sistema exibe mensagens de erro específicas para cada campo inválido

5. **Given** beneficiário enviando solicitação, **When** upload de documentos falha, **Then** sistema exibe mensagem de erro clara e permite tentar novamente

---

### User Story 2 - Visualizar Lista de Reembolsos (Priority: P1)

Como beneficiário, quero ver a lista de todas as minhas solicitações de reembolso com seus status para acompanhar o andamento.

**Why this priority**: Funcionalidade essencial para o beneficiário acompanhar suas solicitações existentes.

**Independent Test**: Pode ser testado acessando a tela de Reembolsos e verificando a lista com resumo e filtros.

**Acceptance Scenarios**:

1. **Given** beneficiário autenticado, **When** acessa a tela de Reembolsos, **Then** vê resumo com total solicitado, total pago e contadores por status

2. **Given** beneficiário com reembolsos cadastrados, **When** visualiza a lista, **Then** cada card exibe protocolo, tipo de despesa, prestador, valor solicitado e status com cor indicativa

3. **Given** lista de reembolsos carregada, **When** seleciona um filtro de status (Todos, Em Análise, Aprovados, Negados, Pagos), **Then** lista é filtrada para mostrar apenas itens com o status selecionado

4. **Given** lista de reembolsos visível, **When** puxa a tela para baixo (pull-to-refresh), **Then** sistema atualiza a lista e o resumo com dados mais recentes

5. **Given** beneficiário sem reembolsos cadastrados, **When** acessa a tela, **Then** exibe mensagem amigável indicando que não há solicitações

---

### User Story 3 - Visualizar Detalhes do Reembolso (Priority: P2)

Como beneficiário, quero ver todos os detalhes de uma solicitação específica para entender o status e valores.

**Why this priority**: Importante para transparência, mas depende da lista (US2) para navegação.

**Independent Test**: Pode ser testado tocando em "Detalhes" em qualquer card da lista.

**Acceptance Scenarios**:

1. **Given** card de reembolso na lista, **When** toca em "Detalhes", **Then** abre tela com todas as informações: protocolo, status, valores, informações do serviço e beneficiário

2. **Given** reembolso com status "Em Análise", **When** visualiza detalhes, **Then** exibe mensagem informativa sobre prazo médio de análise (5 dias úteis)

3. **Given** reembolso aprovado ou pago, **When** visualiza detalhes, **Then** exibe valor aprovado/pago e botão para baixar comprovante

4. **Given** reembolso negado, **When** visualiza detalhes, **Then** exibe mensagem sobre negativa e botão para contatar atendimento

---

### User Story 4 - Baixar Comprovante de Reembolso (Priority: P2)

Como beneficiário, quero baixar o comprovante de reembolsos aprovados/pagos para fins de registro pessoal ou declaração de imposto de renda.

**Why this priority**: Funcionalidade de valor agregado após aprovação do reembolso.

**Independent Test**: Pode ser testado acessando detalhes de um reembolso aprovado/pago e tocando em "Baixar Comprovante".

**Acceptance Scenarios**:

1. **Given** tela de detalhes de reembolso aprovado/pago, **When** toca em "Baixar Comprovante", **Then** sistema baixa arquivo e abre opções de compartilhamento do dispositivo

2. **Given** download em progresso, **When** aguarda conclusão, **Then** sistema mostra indicador de progresso durante o download

3. **Given** falha no download, **When** ocorre erro de rede, **Then** sistema exibe mensagem de erro e permite tentar novamente

---

### User Story 5 - Enviar Documentos Adicionais (Priority: P3)

Como beneficiário com reembolso em análise, quero enviar documentos adicionais caso a operadora solicite para completar minha solicitação.

**Why this priority**: Funcionalidade importante mas menos frequente - apenas quando solicitado pela operadora.

**Independent Test**: Pode ser testado acessando um reembolso "Em Análise" e usando a opção de enviar documentos.

**Acceptance Scenarios**:

1. **Given** reembolso com status "Em Análise" na lista, **When** toca em "Enviar docs", **Then** abre modal/tela para selecionar e enviar documentos adicionais

2. **Given** modal de upload aberto, **When** seleciona documentos e confirma envio, **Then** sistema faz upload e confirma recebimento

3. **Given** reembolso em outro status (aprovado, negado, pago), **When** visualiza na lista, **Then** opção de enviar documentos não está disponível

---

### Edge Cases

- **Conexão perdida durante upload**: Sistema DEVE salvar progresso localmente e permitir retomar quando conexão for restaurada, ou exibir erro claro com opção de tentar novamente
- **Documento muito grande**: Sistema DEVE validar tamanho antes do upload (máximo 10MB por arquivo) e informar limite ao usuário
- **Formato de arquivo inválido**: Sistema DEVE aceitar apenas PDF, JPG, PNG e informar formatos aceitos
- **Sessão expirada durante preenchimento**: Sistema DEVE manter dados do formulário e solicitar re-autenticação, restaurando dados após login
- **Valor zerado ou negativo**: Sistema DEVE validar que valor solicitado é positivo e maior que zero
- **Data futura para serviço**: Sistema DEVE impedir seleção de data futura para data do serviço
- **CNPJ/CPF inválido**: Sistema DEVE validar formato do CNPJ/CPF do prestador

## Requirements *(mandatory)*

### Functional Requirements

**Criação de Solicitação:**
- **FR-001**: Sistema DEVE permitir criar solicitação de reembolso com: tipo de despesa, data do serviço, nome do prestador, CNPJ/CPF do prestador, valor solicitado e dados bancários
- **FR-002**: Sistema DEVE exigir anexo de pelo menos 1 documento comprobatório (nota fiscal, receita ou recibo)
- **FR-003**: Sistema DEVE permitir anexar até 5 documentos por solicitação
- **FR-004**: Sistema DEVE validar todos os campos obrigatórios antes de permitir envio
- **FR-005**: Sistema DEVE gerar número de protocolo único para cada solicitação
- **FR-006**: Sistema DEVE exibir progresso durante upload de documentos

**Listagem e Filtros:**
- **FR-007**: Sistema DEVE exibir resumo com total solicitado, total pago e contadores por status
- **FR-008**: Sistema DEVE listar reembolsos ordenados por data de solicitação (mais recentes primeiro)
- **FR-009**: Sistema DEVE permitir filtrar por status: Todos, Em Análise, Aprovados, Negados, Pagos
- **FR-010**: Sistema DEVE exibir para cada item: protocolo, tipo, prestador, valor e status com indicador visual de cor

**Visualização de Detalhes:**
- **FR-011**: Sistema DEVE exibir todos os dados da solicitação na tela de detalhes
- **FR-012**: Sistema DEVE exibir mensagens contextuais baseadas no status (prazo de análise, aprovação, negativa)
- **FR-013**: Sistema DEVE permitir download de comprovante para reembolsos aprovados/pagos

**Documentos Adicionais:**
- **FR-014**: Sistema DEVE permitir envio de documentos adicionais para solicitações em análise
- **FR-015**: Sistema DEVE desabilitar envio de documentos para solicitações com status final (aprovado, negado, pago, cancelado)

**Validações:**
- **FR-016**: Sistema DEVE validar formato de CNPJ (14 dígitos) ou CPF (11 dígitos) do prestador
- **FR-017**: Sistema DEVE impedir data de serviço futura
- **FR-018**: Sistema DEVE validar valor solicitado como número positivo maior que zero
- **FR-019**: Sistema DEVE aceitar apenas arquivos PDF, JPG, PNG com tamanho máximo de 10MB cada

### Key Entities

- **Solicitação de Reembolso**: Representa uma solicitação do beneficiário contendo tipo de despesa (consulta, exame, medicamento, etc.), data do serviço, dados do prestador (nome, CNPJ/CPF), valor solicitado, valor aprovado, dados bancários para depósito, status (em análise, aprovado, parcialmente aprovado, negado, pago, cancelado), datas de solicitação/análise/pagamento

- **Documento de Reembolso**: Arquivo anexado à solicitação contendo tipo (nota fiscal, receita, relatório, recibo, outro), arquivo digital, data de upload

- **Beneficiário**: Pessoa vinculada ao plano que solicita o reembolso (titular ou dependente)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Beneficiários conseguem completar uma solicitação de reembolso em menos de 5 minutos
- **SC-002**: 95% das solicitações são enviadas com sucesso na primeira tentativa (sem erros de validação após submissão)
- **SC-003**: Tempo de carregamento da lista de reembolsos inferior a 3 segundos em conexão 3G
- **SC-004**: 100% dos reembolsos aprovados/pagos permitem download de comprovante funcional
- **SC-005**: Taxa de abandono do formulário de nova solicitação inferior a 20%
- **SC-006**: 90% dos beneficiários conseguem localizar um reembolso específico usando os filtros em menos de 30 segundos

## Assumptions

- Beneficiário já está autenticado no aplicativo com sessão válida
- Backend já possui endpoints funcionais para todas as operações de reembolso
- Dados bancários do beneficiário podem ser diferentes dos cadastrados no perfil (depósito em conta de terceiro permitido)
- Operadora analisa reembolsos em até 5 dias úteis (informação exibida ao usuário)
- Tipos de despesa aceitos: Consulta, Exame, Medicamento, Internação, Cirurgia, Terapia, Outro

## Out of Scope

- Integração com sistemas bancários para validação de conta
- Notificações push sobre mudanças de status (será feature separada)
- Edição de solicitação após envio
- Cancelamento de solicitação pelo usuário
- Histórico de alterações/timeline detalhada do reembolso
