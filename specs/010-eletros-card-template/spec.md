# Feature Specification: Template Carteirinha Digital Eletros-Saude

**Feature Branch**: `010-eletros-card-template`
**Created**: 2025-12-30
**Status**: Draft
**Input**: Criar novo layout de carteirinha digital Eletros-Saude com frente e verso, replicando o design visual oficial da operadora.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizacao da Carteirinha Eletros-Saude (Frente) (Priority: P1)

Como beneficiario de plano de saude com reciprocidade Eletros-Saude, quero visualizar o lado frontal da minha carteirinha digital com todas as informacoes de identificacao e plano, para poder apresentar em atendimentos medicos.

**Why this priority**: Esta e a funcionalidade principal - sem a frente do cartao, o beneficiario nao consegue se identificar em estabelecimentos de saude.

**Independent Test**: Navegar ate a tela de carteirinha digital com um beneficiario elegivel Eletros-Saude e verificar exibicao do card frontal com header curvo azul, logo, tag ANS, dados de identificacao e grid de informacoes.

**Acceptance Scenarios**:

1. **Given** um beneficiario com plano de reciprocidade Eletros-Saude, **When** acessa a tela de carteirinha digital, **Then** visualiza o card frontal com header curvo azul (gradiente azul medio para azul claro).
2. **Given** a carteirinha Eletros-Saude esta sendo exibida, **When** o usuario visualiza o header, **Then** ve o logo "Eletros-Saude" em branco a esquerda e a tag "ANS - No 42.207-0" em caixa preta com borda branca a direita.
3. **Given** a carteirinha Eletros-Saude esta sendo exibida, **When** o usuario visualiza o corpo branco, **Then** ve campos de matricula e nome em destaque, grid 3 colunas (Nascimento, Validade, Plano), e texto legal no rodape.

---

### User Story 2 - Visualizacao da Carteirinha Eletros-Saude (Verso) (Priority: P1)

Como beneficiario de plano de saude com reciprocidade Eletros-Saude, quero visualizar o verso da minha carteirinha digital com informacoes detalhadas do plano e contatos, para consultar coberturas e canais de atendimento.

**Why this priority**: O verso contem informacoes essenciais sobre cobertura e contatos de emergencia, necessarias para atendimentos completos.

**Independent Test**: Virar a carteirinha Eletros-Saude e verificar exibicao do verso com logo colorido, linha divisoria verde, lista de dados do plano e bloco de contatos.

**Acceptance Scenarios**:

1. **Given** a carteirinha Eletros-Saude esta visivel, **When** o usuario vira para o verso, **Then** visualiza header branco com logo colorido (icone verde/azul, texto cinza/verde) e tag ANS.
2. **Given** o verso da carteirinha esta visivel, **When** o usuario visualiza o conteudo, **Then** ve lista de dados tecnicos (Segmentacao, Acomodacao, Abrangencia, Tipo Contratacao, UTI Movel, CPT).
3. **Given** o verso da carteirinha esta visivel, **When** o usuario visualiza o rodape, **Then** ve bloco de contatos (Eletros-Saude, Plantao Emergencial, Disque ANS) e nota de intransferibilidade.

---

### User Story 3 - Renderizacao Condicional para Planos Elegiveis (Priority: P1)

Como sistema, devo renderizar o template Eletros-Saude apenas quando o cartao de reciprocidade for da operadora Eletros-Saude, para garantir a identidade visual correta.

**Why this priority**: A renderizacao condicional garante que o template correto seja exibido para cada operadora, evitando confusao e garantindo conformidade visual.

**Independent Test**: Testar com diferentes combinacoes de prestador/plano e verificar que apenas cartoes elegiveis Eletros-Saude exibem o template especifico.

**Acceptance Scenarios**:

1. **Given** um cartao de reciprocidade com PRESTADOR_RECIPROCIDADE='ELETROS', **When** a tela de carteirinha e renderizada, **Then** o template Eletros-Saude e exibido.
2. **Given** um cartao de reciprocidade com outro prestador (nao Eletros), **When** a tela de carteirinha e renderizada, **Then** o template generico ou o template apropriado e exibido.

---

### User Story 4 - Interacao de Flip Card (Priority: P2)

Como beneficiario, quero alternar entre frente e verso da carteirinha com uma animacao 3D fluida, para ter uma experiencia interativa e profissional.

**Why this priority**: O flip card e um enhancement de UX que melhora a experiencia, mas nao impede o uso basico da carteirinha.

**Independent Test**: Tocar no botao de flip e verificar animacao suave de rotacao 3D entre frente e verso.

**Acceptance Scenarios**:

1. **Given** a carteirinha Eletros-Saude esta visivel (frente), **When** o usuario toca no botao de flip, **Then** a carteirinha gira 180 graus com animacao 3D suave revelando o verso.
2. **Given** a animacao de flip esta em execucao, **When** o usuario tenta interagir novamente, **Then** a interacao e bloqueada ate a animacao completar.

---

### Edge Cases

- O que acontece quando campos de dados estao vazios ou nulos? Exibir "-" como fallback.
- Como o sistema lida com nomes de beneficiarios muito longos? Truncar com reticencias.
- O que acontece em telas muito pequenas? Responsividade com text wrapping.
- Como garantir legibilidade do texto sobre o header curvo? Contraste adequado branco sobre azul.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE renderizar o template Eletros-Saude quando PRESTADOR_RECIPROCIDADE='ELETROS'
- **FR-002**: Sistema DEVE exibir header curvo azul (gradiente ou solido) ocupando aproximadamente 35% da altura do card frontal
- **FR-003**: Sistema DEVE exibir logo "Eletros-Saude" em branco a esquerda do header frontal
- **FR-004**: Sistema DEVE exibir tag ANS "ANS - No 42.207-0" em caixa preta com borda branca no canto superior direito
- **FR-005**: Sistema DEVE exibir campos de identificacao: matricula (destacado), nome (bold uppercase)
- **FR-006**: Sistema DEVE exibir grid 3 colunas: Nascimento (com destaque vermelho), Validade, Plano
- **FR-007**: Sistema DEVE exibir texto legal em italico no rodape frontal
- **FR-008**: Sistema DEVE exibir logo colorido Eletros-Saude no header do verso (icone verde/azul, texto cinza/verde)
- **FR-009**: Sistema DEVE exibir linha divisoria verde separando header e corpo no verso
- **FR-010**: Sistema DEVE exibir lista de dados tecnicos no verso: Segmentacao, Acomodacao, Abrangencia, Tipo Contratacao
- **FR-011**: Sistema DEVE exibir campos UTI Movel e CPT em linha unica
- **FR-012**: Sistema DEVE exibir bloco de contatos: Eletros-Saude, Plantao Emergencial, Disque ANS
- **FR-013**: Sistema DEVE exibir nota de intransferibilidade no verso
- **FR-014**: Sistema DEVE implementar animacao de flip 3D para alternar frente/verso
- **FR-015**: Sistema DEVE usar formato padrao de cartao de credito com bordas arredondadas (aproximadamente 12px)
- **FR-016**: Sistema DEVE usar tipografia sans-serif (familia do sistema)

### Key Entities

- **EletrosCardData**: Representa os dados formatados para exibicao no template, incluindo campos de identificacao (matricula, nome), datas (nascimento, validade), informacoes do plano (segmentacao, acomodacao, abrangencia) e contatos.
- **EletrosContactInfo**: Contem informacoes de contato da operadora: telefones de atendimento, plantao emergencial, e canais ANS.
- **EletrosStaticInfo**: Constantes visuais como numero ANS, cores do tema, textos padrao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Beneficiarios elegiveis Eletros-Saude visualizam a carteirinha digital em menos de 2 segundos apos navegacao
- **SC-002**: 100% dos campos obrigatorios da carteirinha sao preenchidos corretamente com dados do beneficiario
- **SC-003**: Animacao de flip completa em menos de 500ms sem perda de frames visivel
- **SC-004**: Layout mantem legibilidade em dispositivos com largura minima de 320px
- **SC-005**: Todas as informacoes de contato e ANS sao exibidas de forma legivel e acessivel
- **SC-006**: Template renderiza corretamente apenas para beneficiarios com reciprocidade Eletros-Saude

## Design Visual Reference

### Paleta de Cores

- **Header Azul (Frente)**: Gradiente ou solido azul medio (#2E7D87 ou similar)
- **Corpo Branco**: #FFFFFF
- **Texto Header**: #FFFFFF (branco sobre azul)
- **Texto Corpo**: #333333 (preto/cinza escuro sobre branco)
- **Destaque Vermelho**: #E53935 ou similar (para campos destacados como nascimento)
- **Tag ANS**: Fundo preto (#000000) com borda branca
- **Logo Colorido (Verso)**: Icone verde/azul, texto cinza/verde
- **Linha Divisoria**: Verde (#4CAF50 ou similar)

### Estrutura Visual - Frente

```
+-------------------------------------+
| [Logo Branco]        [ANS Tag Preta]|  <- Header Curvo Azul (~35%)
|              .-----------------.    |
| -------------'                      |  <- Curva suave
+-----------+-----------+-------------+
| Identificacao do usuario            |
| +----------------------------------+|
| | Matricula Reciprocidade         ||  <- Box destacado
| +----------------------------------+|
| +----------------------------------+|
| | Nome Completo                    ||
| +----------------------------------+|
|                                     |
| Nascimento   Validade    Plano      |
| [DD/MM/AAA]  [DD/MM/AA]  RECIPR...  |
|                                     |
| Apresentacao obrigatoria...         |  <- Texto legal italico
+-------------------------------------+
```

### Estrutura Visual - Verso

```
+-------------------------------------+
| [Logo Colorido]      [ANS Tag Preta]|  <- Header Branco
+=====================================+  <- Linha verde
| Segmentacao Assistencial do Plano:  |
| AMBULATORIAL MAIS HOSPITALAR...     |
|                                     |
| Padrao de Acomodacao: APARTAMENTO.. |
| Area de Abrangencia: ESTADUAL       |
| Tipo de Contratacao: OUTROS         |
|                                     |
| Vida UTI Movel: N    CPT: NAO HA    |
|                                     |
| Eletros-Saude: (21) 3900-3132       |
| Plantao: (21) 99681-8015            |  <- Contatos
| Disque ANS: 0800 7019656            |
|                                     |
| Este cartao e pessoal e             |
| intransferivel...          [Nota]   |
+-------------------------------------+
```

## Assumptions

- O efeito de curva no header frontal sera implementado usando SVG Path ou clip-path
- O logo Eletros-Saude sera criado como componente SVG (versao branca e colorida)
- Os dados do beneficiario ja estao disponiveis via API existente (OracleReciprocidade)
- O padrao de arquitetura segue o mesmo utilizado em templates existentes (Unimed, Vivest)
- Tipografia usa a familia de fontes padrao do sistema (sans-serif)
- O identificador da operadora no campo PRESTADOR_RECIPROCIDADE e 'ELETROS'
