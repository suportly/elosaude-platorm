# Feature Specification: Template Carteirinha Digital Vivest

**Feature Branch**: `009-vivest-card-template`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "Criar novo layout de carteirinha digital Vivest com frente e verso, exibida quando prestador_reciprocidade = 'VIVEST' e plano_elosaude pertence aos planos Executive ou Saude Mais"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizacao da Carteirinha Vivest (Frente) (Priority: P1)

Como beneficiario de plano EloSaude com reciprocidade Vivest, quero visualizar minha carteirinha digital com o layout oficial da Vivest (lado da frente), para apresentar em atendimentos na rede credenciada Vivest.

**Why this priority**: Esta e a funcionalidade core - sem ela, o beneficiario nao pode utilizar a carteirinha digital em atendimentos na rede Vivest. O lado frontal contem as informacoes mais consultadas durante atendimentos.

**Independent Test**: Navegar ate a tela de carteirinha com um beneficiario que tenha `prestador_reciprocidade = 'VIVEST'` e `plano_elosaude` em um dos planos elegiveis, e verificar se o cartao Vivest (frente) e exibido com o design especificado.

**Acceptance Scenarios**:

1. **Given** um beneficiario com plano ELOSAUDE EXECUTIVE - DIRETORES e reciprocidade Vivest, **When** acessa a tela de carteirinha digital, **Then** visualiza o cartao com fundo azul marinho (#003366), bordas arredondadas e elementos decorativos
2. **Given** um beneficiario elegivel Vivest, **When** visualiza a frente da carteirinha, **Then** ve o logo Vivest no cabecalho a esquerda e o box de plano a direita
3. **Given** um beneficiario elegivel Vivest, **When** visualiza o corpo da carteirinha, **Then** ve sua matricula de reciprocidade, nome, data de nascimento, vigencia, registro do plano, acomodacao, abrangencia, contratante e segmentacao

---

### User Story 2 - Visualizacao da Carteirinha Vivest (Verso) (Priority: P1)

Como beneficiario com carteirinha Vivest, quero visualizar o verso da minha carteirinha digital contendo informacoes de carencias, ANS e contatos, para ter acesso completo as informacoes do plano.

**Why this priority**: O verso contem informacoes regulatorias (ANS, CNS) e de contato que sao frequentemente solicitadas em atendimentos.

**Independent Test**: Apos visualizar a frente do cartao, acionar o botao ou gesto de "virar cartao" e verificar se o verso exibe as informacoes de carencias, ANS e contatos conforme especificado.

**Acceptance Scenarios**:

1. **Given** um beneficiario visualizando a frente da carteirinha Vivest, **When** aciona o controle de virar cartao, **Then** ve o verso com o titulo "Carencias" e tag ANS
2. **Given** um beneficiario visualizando o verso, **When** observa a secao de rodape, **Then** ve informacoes da operadora contratada (ANS 417297), CNS e grid de contatos (telefones, sites)
3. **Given** um beneficiario visualizando o verso, **When** deseja voltar a frente, **Then** pode acionar novamente o controle para retornar a visualizacao frontal

---

### User Story 3 - Renderizacao Condicional para Planos Elegiveis (Priority: P1)

Como sistema, devo renderizar o template Vivest apenas para beneficiarios que atendam aos criterios de elegibilidade (prestador reciprocidade = VIVEST e plano em lista especifica).

**Why this priority**: A logica de renderizacao condicional e fundamental para garantir que apenas beneficiarios elegiveis vejam o template Vivest.

**Independent Test**: Testar a renderizacao com diferentes combinacoes de prestador_reciprocidade e plano_elosaude para verificar se o template correto e exibido.

**Acceptance Scenarios**:

1. **Given** um beneficiario com `prestador_reciprocidade = 'VIVEST'` e `plano_elosaude = 'SAUDE MAIS'`, **When** acessa a carteirinha, **Then** ve o template Vivest
2. **Given** um beneficiario com `prestador_reciprocidade = 'VIVEST'` e `plano_elosaude = 'OUTRO PLANO'`, **When** acessa a carteirinha, **Then** ve o template generico de reciprocidade
3. **Given** um beneficiario com `prestador_reciprocidade = 'OUTRO'` e qualquer plano, **When** acessa a carteirinha, **Then** NAO ve o template Vivest

---

### User Story 4 - Interacao de Flip Card (Priority: P2)

Como beneficiario, quero uma experiencia intuitiva para alternar entre frente e verso da carteirinha, seja por botao ou gesto.

**Why this priority**: A usabilidade da interacao de flip impacta diretamente a experiencia do usuario, mas a funcionalidade basica de exibicao tem prioridade maior.

**Independent Test**: Testar diferentes metodos de interacao (botao, tap no cartao) para verificar se a transicao entre frente e verso funciona suavemente.

**Acceptance Scenarios**:

1. **Given** a carteirinha Vivest exibindo a frente, **When** usuario toca no botao "Ver Verso", **Then** cartao gira com animacao 3D revelando o verso
2. **Given** a carteirinha exibindo o verso, **When** usuario toca no botao "Ver Frente", **Then** cartao gira de volta revelando a frente
3. **Given** qualquer estado do cartao, **When** usuario realiza a interacao de flip, **Then** a transicao completa em menos de 400ms

---

### Edge Cases

- O que acontece quando campos de dados estao vazios? O sistema exibe um traco (-) ou oculta o campo
- Como o sistema trata nomes muito longos? Trunca com reticencias mantendo legibilidade
- O que acontece em telas muito pequenas (<4")? O cartao mantem proporcao e permite scroll se necessario
- Como o sistema se comporta se os elementos decorativos (linhas curvas) nao renderizarem? O cartao mantem funcionalidade com fundo solido
- O que acontece durante a animacao de flip se o usuario tocar novamente? A animacao completa antes de aceitar nova interacao

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE renderizar o template Vivest quando `prestador_reciprocidade = 'VIVEST'` E `plano_elosaude` for um dos: 'ELOSAUDE EXECUTIVE - DIRETORES', 'ELOSAUDE EXECUTIVE - GERENTES', 'ELOSAUDE EXECUTIVE - DIRETORES - DIAMANTE', 'ELOSAUDE EXECUTIVE - GERENTES - DIAMANTE', 'ELOSAUDE EXECUTIVE - DIRETORES - PAMPA', 'ELOSAUDE EXECUTIVE - GERENTES - PAMPA', 'SAUDE MAIS', 'SAUDE MAIS II'
- **FR-002**: Sistema DEVE exibir a carteirinha com fundo azul marinho (#003366 ou #002A5C) e bordas arredondadas (12-16px)
- **FR-003**: Sistema DEVE exibir elementos decorativos (linhas curvas brancas e vermelhas) nos cantos superior e inferior direito
- **FR-004**: Sistema DEVE usar tipografia sans-serif (Roboto/Arial) com texto branco (#FFFFFF)
- **FR-005**: Sistema DEVE exibir o logo Vivest (aneis entrelaçados + texto) no cabecalho a esquerda
- **FR-006**: Sistema DEVE exibir box estilizado com nome do plano a direita do cabecalho
- **FR-007**: Sistema DEVE exibir no corpo da frente: matricula reciprocidade, nome do beneficiario (destaque), data de nascimento, inicio de vigencia, registro do plano, acomodacao, abrangencia, contratante, segmentacao e cobertura parcial
- **FR-008**: Sistema DEVE apresentar valores em destaque (fonte maior/bold) com labels abaixo em fonte menor
- **FR-009**: Sistema DEVE organizar informacoes do corpo em grid de 2-3 colunas responsivo
- **FR-010**: Sistema DEVE exibir no verso: titulo "Carencias", texto de carencias, tag ANS do plano, bloco ANS operadora, CNS e grid de contatos
- **FR-011**: Sistema DEVE implementar mecanismo de flip entre frente e verso (botao ou gesto)
- **FR-012**: Sistema DEVE aplicar animacao 3D CSS Transform na transicao de flip
- **FR-013**: Sistema DEVE manter proporcao visual de cartao de credito (aproximadamente 1.586:1)
- **FR-014**: Sistema DEVE ser responsivo, permitindo quebra de linha harmoniosa em textos longos

### Key Entities

- **Beneficiario**: Pessoa titular ou dependente do plano. Atributos: nome, matricula reciprocidade, data de nascimento, CNS
- **Plano Reciprocidade**: Dados do plano de reciprocidade Vivest. Atributos: nome do plano, acomodacao, abrangencia, segmentacao, cobertura parcial, registro do plano, inicio de vigencia
- **Operadora**: Informacoes regulatorias. Atributos: numero ANS plano (31547-8), numero ANS operadora (417297), contatos (telefones, sites)
- **Contratante**: Empresa contratante do plano. Atributos: nome/razao social

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Carteirinha Vivest e renderizada corretamente em 100% dos casos quando os criterios de elegibilidade sao atendidos
- **SC-002**: Usuario consegue identificar todas as informacoes principais (nome, matricula, plano) em menos de 5 segundos
- **SC-003**: Transicao de flip entre frente e verso completa em menos de 400 milissegundos
- **SC-004**: Layout mantem proporcao de cartao (1.586:1) em dispositivos de 4.7" a 6.7"
- **SC-005**: Cores e tipografia correspondem 100% ao design visual Vivest especificado
- **SC-006**: Carteirinha e aceita visualmente para identificacao em atendimentos na rede Vivest
- **SC-007**: 95% dos usuarios conseguem alternar entre frente e verso na primeira tentativa

## Assumptions

- Logo Vivest sera fornecido como asset SVG ou PNG de alta resolucao
- Elementos decorativos (linhas curvas) serao implementados via SVG inline ou gradientes CSS
- Os dados do beneficiario ja estao disponiveis no contexto do componente existente via `extractCardInfo`
- O campo `prestador_reciprocidade` e `plano_elosaude` estao presentes e normalizados nos dados de reciprocidade
- Valores de ANS e contatos Vivest sao estaticos: ANS Plano 31547-8, ANS Operadora 417297, site vivest.com.br
- A fonte Sans-Serif do sistema (Roboto no Android, SF Pro no iOS) sera utilizada

## Out of Scope

- QR Code ou codigo de barras na carteirinha Vivest
- Funcionalidade de impressao ou exportacao PDF
- Modo offline para dados da carteirinha
- Outras operadoras alem de Vivest neste template
- Animacoes complexas alem do flip basico
- Suporte a gestos de swipe (apenas tap/botao para flip)
