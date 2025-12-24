# Feature Specification: Template Carteirinha Digital Unimed

**Feature Branch**: `008-unimed-card-template`
**Created**: 2025-12-23
**Status**: Draft
**Input**: User description: "Alterar o template da carteirinha quando a origem for Unimed, replicando exatamente o design visual da carteira Unimed Santa Catarina"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualização da Carteirinha Unimed (Priority: P1)

Como beneficiário de plano Unimed, quero visualizar minha carteirinha digital com o layout visual oficial da Unimed Santa Catarina, para que eu possa apresentá-la em atendimentos médicos com a mesma credibilidade do cartão físico.

**Why this priority**: Esta é a funcionalidade principal - sem ela, o beneficiário não consegue utilizar a carteirinha digital em atendimentos. É o core value da feature.

**Independent Test**: Pode ser testado navegando até a tela de carteirinha com um beneficiário cujo plano seja "Unimed" e verificando se o layout corresponde ao design especificado.

**Acceptance Scenarios**:

1. **Given** um beneficiário com plano Unimed, **When** acessa a tela de carteirinha digital, **Then** visualiza o cartão com as três seções distintas: cabeçalho verde (#00995D), corpo verde lima (#C4D668) e rodapé verde petróleo (#0B504B)
2. **Given** um beneficiário com plano Unimed, **When** visualiza a carteirinha, **Then** todos os dados pessoais (número da carteirinha, nome, acomodação, validade, plano, rede, abrangência, atendimento) são exibidos corretamente
3. **Given** um beneficiário com plano diferente de Unimed, **When** acessa a tela de carteirinha digital, **Then** visualiza o template padrão (não Unimed)

---

### User Story 2 - Exibição de Informações do Cabeçalho (Priority: P1)

Como beneficiário Unimed, quero ver o logo da Unimed Santa Catarina e o logo "somos coop" no cabeçalho, junto com o tipo de contratação, para identificar facilmente a operadora e legitimidade do cartão.

**Why this priority**: O cabeçalho é a primeira seção visual e contém elementos de identificação da operadora essenciais para validação em atendimentos.

**Independent Test**: Verificar se o cabeçalho exibe corretamente os logos e o texto "COLETIVO EMPRESARIAL" em fundo verde Unimed.

**Acceptance Scenarios**:

1. **Given** um beneficiário Unimed, **When** visualiza o cabeçalho da carteirinha, **Then** vê o logo "Unimed Santa Catarina" à esquerda em cor branca
2. **Given** um beneficiário Unimed, **When** visualiza o cabeçalho da carteirinha, **Then** vê o logo "somos coop" à direita em cor branca
3. **Given** um beneficiário Unimed, **When** visualiza o cabeçalho da carteirinha, **Then** vê o texto "COLETIVO EMPRESARIAL" em caixa alta, fonte bold, cor branca, alinhado à esquerda

---

### User Story 3 - Exibição de Dados do Corpo Principal (Priority: P1)

Como beneficiário Unimed, quero ver meus dados principais organizados em um grid de fácil leitura, incluindo número da carteirinha, nome, acomodação, validade, plano, rede de atendimento e abrangência.

**Why this priority**: O corpo principal contém as informações mais consultadas durante atendimentos médicos.

**Independent Test**: Verificar se todos os campos de dados são exibidos no grid de 2 colunas com labels e valores corretos.

**Acceptance Scenarios**:

1. **Given** um beneficiário Unimed, **When** visualiza o corpo da carteirinha, **Then** vê o número da carteirinha em fonte grande e espaçada (formato: 0 025 076959600000 8)
2. **Given** um beneficiário Unimed, **When** visualiza o corpo da carteirinha, **Then** vê seu nome em caixa alta com label "Nome do Beneficiário" abaixo
3. **Given** um beneficiário Unimed, **When** visualiza o grid de informações, **Then** vê os pares Acomodação/Validade, Plano/Rede de Atendimento, Abrangência/Atend. organizados em 2 colunas
4. **Given** um beneficiário Unimed, **When** visualiza o rodapé do corpo, **Then** vê o texto de segmentação assistencial (ex: "AMBULATORIAL + HOSPITALAR COM OBSTETRÍCIA")

---

### User Story 4 - Exibição de Dados do Rodapé (Priority: P2)

Como beneficiário Unimed, quero ver informações complementares como datas de nascimento e vigência, cobertura parcial temporária, via e contratante no rodapé.

**Why this priority**: São informações complementares importantes para validação completa, mas menos consultadas que os dados do corpo principal.

**Independent Test**: Verificar se o rodapé exibe corretamente todos os campos em grid de 2 colunas sobre fundo verde petróleo.

**Acceptance Scenarios**:

1. **Given** um beneficiário Unimed, **When** visualiza o rodapé da carteirinha, **Then** vê os campos Nascimento/Vigência e Cob. Parcial Temp./Via em grid de 2 colunas
2. **Given** um beneficiário Unimed, **When** visualiza o rodapé da carteirinha, **Then** vê o nome da contratante (empresa)
3. **Given** um beneficiário Unimed, **When** visualiza a barra inferior do rodapé, **Then** vê informações da ANS e site em fonte pequena

---

### Edge Cases

- O que acontece quando um campo de dados está vazio ou nulo? O sistema exibe um traço (-) ou texto "Não informado"
- Como o sistema se comporta quando a imagem do logo não carrega? Exibe um texto fallback "Unimed" / "somos coop"
- O que acontece em dispositivos com telas muito pequenas? O cartão mantém proporção e permite scroll horizontal se necessário
- Como o sistema trata nomes muito longos de beneficiários? Trunca com reticências mantendo a legibilidade

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE renderizar o template Unimed quando a propriedade/variável `plano` for igual a "Unimed"
- **FR-002**: Sistema DEVE exibir o cabeçalho com cor de fundo #00995D (verde Unimed)
- **FR-003**: Sistema DEVE exibir o logo "Unimed Santa Catarina" à esquerda e logo "somos coop" à direita no cabeçalho, ambos em cor branca
- **FR-004**: Sistema DEVE exibir o texto "COLETIVO EMPRESARIAL" em caixa alta, fonte bold, cor branca no cabeçalho
- **FR-005**: Sistema DEVE exibir o corpo principal com cor de fundo #C4D668 (verde lima)
- **FR-006**: Sistema DEVE exibir o número da carteirinha em fonte destacada e espaçada
- **FR-007**: Sistema DEVE exibir o nome do beneficiário em caixa alta com label identificador abaixo
- **FR-008**: Sistema DEVE organizar as informações (Acomodação, Validade, Plano, Rede, Abrangência, Atend.) em grid de 2 colunas
- **FR-009**: Sistema DEVE exibir a segmentação assistencial do plano no rodapé do corpo
- **FR-010**: Sistema DEVE exibir o rodapé com cor de fundo #0B504B (verde petróleo)
- **FR-011**: Sistema DEVE organizar as informações do rodapé (Nascimento, Vigência, Cob. Parcial Temp., Via) em grid de 2 colunas com texto branco
- **FR-012**: Sistema DEVE exibir o nome da contratante no rodapé
- **FR-013**: Sistema DEVE exibir informações da ANS e site na barra inferior em fonte pequena (~10px)
- **FR-014**: Sistema DEVE aplicar border-radius apenas nas extremidades do cartão (topo-esquerdo/direito no header, baixo-esquerdo/direito no footer)
- **FR-015**: Sistema DEVE manter a proporção visual de um cartão de crédito/identidade
- **FR-016**: Sistema DEVE ser responsivo, adaptando-se a diferentes tamanhos de tela

### Key Entities

- **Beneficiário**: Pessoa titular ou dependente do plano de saúde. Atributos: número da carteirinha, nome, data de nascimento, tipo de acomodação, tipo de plano
- **Plano**: Informações do plano contratado. Atributos: tipo (Unimed, outros), validade, rede de atendimento, abrangência, segmentação assistencial, código de atendimento
- **Contratante**: Empresa ou pessoa física contratante do plano. Atributos: nome/razão social
- **Cobertura**: Detalhes de cobertura do plano. Atributos: vigência, cobertura parcial temporária, via

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Carteirinha Unimed é renderizada corretamente em 100% dos casos quando plano = "Unimed"
- **SC-002**: Usuário consegue identificar todos os campos obrigatórios (número, nome, validade) em menos de 5 segundos
- **SC-003**: Layout mantém proporção de cartão de crédito (85.6mm x 53.98mm ou proporção 1.586:1) em todos os dispositivos
- **SC-004**: Todas as três seções (header, corpo, footer) são visíveis sem necessidade de scroll vertical em dispositivos com tela de 4.7" ou maior
- **SC-005**: Cores e tipografia correspondem 100% às especificações do design Unimed Santa Catarina
- **SC-006**: Carteirinha é aceita visualmente para identificação em 100% dos atendimentos médicos

## Assumptions

- O logo "Unimed Santa Catarina" e logo "somos coop" serão fornecidos como assets SVG ou PNG de alta resolução
- A fonte utilizada será Sans-Serif do sistema (Roboto no Android, SF Pro no iOS) ou fonte web equivalente
- Os dados do beneficiário já estão disponíveis no contexto do componente existente
- O valor da propriedade `plano` é uma string simples comparável com "Unimed" (case-sensitive ou normalizado)
- O site e registro ANS a serem exibidos são: "www.unimedsc.com.br" e número de registro ANS padrão da Unimed SC

## Out of Scope

- Carteirinhas de outras operadoras além de Unimed
- QR Code ou código de barras na carteirinha
- Funcionalidade de impressão ou exportação PDF
- Versão frente/verso do cartão (apenas uma face)
- Animações ou transições visuais
- Modo offline para dados da carteirinha
