# Feature Specification: Template Carteirinha Digital Fachesf

**Feature Branch**: `011-fachesf-card-template`
**Created**: 2025-12-30
**Status**: Draft
**Input**: User description: "Criar template de carteirinha digital Fachesf com design limpo, fundo branco, acentos em verde esmeralda, badge ESPECIAL, hierarquia de texto invertida, grid de informacoes e rodape com contatos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visualizar Carteirinha Fachesf (Priority: P1)

Como beneficiario do plano Fachesf, quero visualizar minha carteirinha digital no aplicativo com o design oficial da Fachesf Saude, para poder apresenta-la em consultas e procedimentos medicos.

**Why this priority**: Esta e a funcionalidade principal da feature - sem ela, o beneficiario nao consegue usar a carteirinha digital.

**Independent Test**: Pode ser testado criando um beneficiario com plano Fachesf e verificando se a carteirinha e renderizada com o layout correto.

**Acceptance Scenarios**:

1. **Given** um beneficiario com plano "Fachesf" logado no app, **When** acessar a tela de carteirinha digital, **Then** deve visualizar a carteirinha com o template Fachesf (fundo branco, badge verde, hierarquia invertida).
2. **Given** a carteirinha Fachesf sendo exibida, **When** visualizar os dados, **Then** deve ver: nome do beneficiario, matricula, validade, CNS, acomodacao e cobertura.
3. **Given** a carteirinha Fachesf sendo exibida, **When** visualizar o badge, **Then** deve ver "ESPECIAL" no canto superior direito com fundo verde.

---

### User Story 2 - Exibir Informacoes de Contato (Priority: P2)

Como beneficiario, quero ver os telefones de contato da Fachesf na carteirinha, para poder entrar em contato quando necessario.

**Why this priority**: Informacoes de contato sao importantes mas nao bloqueiam o uso principal da carteirinha.

**Independent Test**: Verificar se a secao de contatos e exibida corretamente no rodape da carteirinha.

**Acceptance Scenarios**:

1. **Given** a carteirinha Fachesf sendo exibida, **When** visualizar o rodape, **Then** deve ver o titulo "Telefones para Contato" com numeros para CREDENCIADO e BENEFICIARIO.
2. **Given** a carteirinha Fachesf sendo exibida, **When** visualizar o rodape, **Then** deve ver o logo da Fachesf Saude posicionado a direita.

---

### User Story 3 - Exibir Registro ANS (Priority: P3)

Como beneficiario, quero ver o numero de registro ANS da operadora, para ter a informacao regulatoria disponivel.

**Why this priority**: E uma informacao obrigatoria mas raramente consultada pelo usuario.

**Independent Test**: Verificar se o numero ANS aparece na lateral direita do cartao em texto vertical.

**Acceptance Scenarios**:

1. **Given** a carteirinha Fachesf sendo exibida, **When** visualizar a lateral direita, **Then** deve ver "ANS 31723-3" em texto vertical.

---

### Edge Cases

- O que acontece quando o nome do beneficiario e muito longo? Deve truncar com "..." mantendo a legibilidade.
- O que acontece quando algum campo de dados esta vazio? Deve exibir "-" como placeholder.
- Como a carteirinha se comporta em diferentes tamanhos de tela? Deve manter proporcoes usando design responsivo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE renderizar o template Fachesf quando o plano do beneficiario for igual a "Fachesf" (case-insensitive).
- **FR-002**: Sistema DEVE exibir fundo branco (#FFFFFF) como cor principal do cartao.
- **FR-003**: Sistema DEVE exibir badge "ESPECIAL" com fundo verde (#2BB673) no canto superior direito, com borda inferior esquerda arredondada.
- **FR-004**: Sistema DEVE utilizar hierarquia invertida de texto: valor (maior, escuro) acima do label (menor, cinza, caixa alta).
- **FR-005**: Sistema DEVE exibir nome do beneficiario no canto superior esquerdo com label "BENEFICIARIO" abaixo.
- **FR-006**: Sistema DEVE exibir grid de informacoes com: Matricula/CODIGO, Validade/VALIDADE, CNS/CNS na primeira linha.
- **FR-007**: Sistema DEVE exibir grid de informacoes com: Acomodacao/ACOMODACAO, Cobertura/COBERTURA na segunda linha.
- **FR-008**: Sistema DEVE exibir linha divisoria cinza (#E0E0E0) entre o corpo e o rodape.
- **FR-009**: Sistema DEVE exibir texto legal: "Esta carteira so e valida mediante apresentacao de documento de identificacao do portador."
- **FR-010**: Sistema DEVE exibir secao de contatos no rodape com titulo "Telefones para Contato".
- **FR-011**: Sistema DEVE exibir numeros de telefone para CREDENCIADO e BENEFICIARIO no rodape.
- **FR-012**: Sistema DEVE exibir logo da Fachesf Saude no rodape a direita.
- **FR-013**: Sistema DEVE exibir "ANS 31723-3" em texto vertical na lateral direita extrema.
- **FR-014**: Sistema DEVE usar tipografia sans-serif para todos os textos.
- **FR-015**: Sistema DEVE manter proporcao de cartao de credito padrao (aproximadamente 85.6mm x 53.98mm ratio).

### Key Entities

- **Beneficiario**: Representa o usuario do plano - nome completo, matricula, data de nascimento, CNS.
- **Plano**: Informacoes do plano de saude - nome (Fachesf), tipo de cobertura, tipo de acomodacao, validade.
- **Operadora**: Informacoes da operadora - nome (Fachesf Saude), registro ANS (31723-3), telefones de contato, logo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Beneficiarios com plano Fachesf visualizam carteirinha com design correto em 100% dos casos.
- **SC-002**: Todos os campos obrigatorios (nome, matricula, validade, CNS, acomodacao, cobertura) sao exibidos corretamente.
- **SC-003**: Layout mantem consistencia visual em diferentes tamanhos de tela (smartphones de 4.7" a 6.7").
- **SC-004**: Informacoes de contato e registro ANS sao visiveis e legiveis na carteirinha.
- **SC-005**: Carteirinha carrega e renderiza em menos de 2 segundos apos abrir a tela.

## Assumptions

- O logo da Fachesf Saude sera fornecido como arquivo de imagem (PNG ou SVG).
- Os telefones de contato para CREDENCIADO e BENEFICIARIO serao obtidos da API ou configurados como constantes estaticas.
- O campo "tipo de plano" para exibir no badge (ex: "ESPECIAL") vira dos dados do beneficiario na API.
- A tipografia sans-serif do sistema (Arial, Helvetica, ou fonte do app) sera utilizada.

## Out of Scope

- Funcionalidade de flip (virar carteirinha frente/verso) - nao especificado para este template.
- QR Code ou codigo de barras - nao mencionado nas especificacoes.
- Compartilhamento ou download da carteirinha como imagem.
