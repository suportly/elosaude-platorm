# Feature Specification: Guia Médico por Tipo de Cartão

**Feature Branch**: `012-guia-medico-links`
**Created**: 2026-01-05
**Status**: Draft
**Input**: User description: "O GUIA MEDICO DEVE APARECER POR TIPO DE CARTAO E PARA CADA UM TEM UM LINK ESPECIFICO. DEVE APARECER APENAS PARA OS TIPOS DE CARTOES QUE O USUARIO POSSUI."

## Resumo

Exibir links de acesso ao Guia Médico/Rede Credenciada de acordo com os tipos de cartões que o usuário possui. Cada operadora/plano possui seu próprio portal de busca de credenciados, e o usuário deve ter acesso rápido e intuitivo apenas aos guias relevantes para seus planos ativos.

### Links por Operadora

| Operadora | URL do Guia Médico |
|-----------|-------------------|
| Fachesf | https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/ |
| Vivest | https://medhub.facilinformatica.com.br/provider-search |
| Unimed | https://www.unimed.coop.br/site/web/guest/guia-medico#/ |
| Elosaude | https://webprod.elosaude.com.br/#/guia-medico |
| Eletrossaude | https://eletrossaude.com.br/rede-credenciada/ |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acesso ao Guia Médico do Plano Único (Priority: P1)

O usuário que possui apenas um tipo de cartão acessa o Guia Médico de forma direta. Ao navegar para a seção de Guia Médico, o sistema exibe o link correspondente ao seu plano de forma destacada, permitindo acesso imediato ao portal de busca de credenciados.

**Why this priority**: Este é o caso mais comum - usuários com um único plano precisam de acesso rápido e sem fricção ao guia médico do seu convênio.

**Independent Test**: Pode ser testado com um usuário que possui apenas um tipo de cartão (ex: apenas Fachesf) e verificando se o link correto é exibido e abre o portal adequado.

**Acceptance Scenarios**:

1. **Given** usuário logado com cartão Fachesf, **When** acessa a seção Guia Médico, **Then** visualiza card/botão "Fachesf" que ao clicar abre o portal https://s008.fachesf.com.br/ConsultaCredenciadosRedeAtendimento/
2. **Given** usuário logado com cartão Vivest, **When** acessa a seção Guia Médico, **Then** visualiza card/botão "Vivest" que ao clicar abre o portal https://medhub.facilinformatica.com.br/provider-search
3. **Given** usuário logado sem nenhum cartão ativo, **When** acessa a seção Guia Médico, **Then** visualiza mensagem informativa "Você não possui cartões ativos para acessar guias médicos"

---

### User Story 2 - Acesso ao Guia Médico com Múltiplos Planos (Priority: P2)

O usuário que possui múltiplos tipos de cartões visualiza uma lista organizada de todos os guias médicos disponíveis. A interface apresenta cada plano de forma clara, permitindo que o usuário escolha qual guia deseja consultar.

**Why this priority**: Usuários com múltiplos planos (ex: reciprocidade entre operadoras) precisam identificar facilmente qual guia acessar para cada necessidade.

**Independent Test**: Pode ser testado com um usuário que possui 2 ou mais tipos de cartões e verificando se todos os links relevantes são exibidos corretamente.

**Acceptance Scenarios**:

1. **Given** usuário logado com cartões Fachesf e Vivest, **When** acessa a seção Guia Médico, **Then** visualiza lista com dois cards/botões, um para cada plano
2. **Given** usuário com 3 planos diferentes, **When** acessa a seção Guia Médico, **Then** visualiza os 3 planos organizados em lista ou grid responsivo
3. **Given** usuário com múltiplos planos, **When** clica em um dos cards, **Then** o link externo abre em nova aba/janela do navegador

---

### User Story 3 - Integração na Tela de Carteirinha Digital (Priority: P3)

O usuário visualizando sua carteirinha digital tem acesso rápido ao guia médico correspondente àquela carteirinha específica. Um botão ou link contextual permite acessar o guia diretamente da tela do cartão.

**Why this priority**: Proporciona acesso contextual - quando o usuário está visualizando um cartão específico, faz sentido ter acesso direto ao guia daquela operadora.

**Independent Test**: Pode ser testado acessando a tela de carteirinha digital e verificando se o botão de guia médico aparece e direciona para o link correto da operadora do cartão exibido.

**Acceptance Scenarios**:

1. **Given** usuário visualizando carteirinha Fachesf, **When** clica no botão "Guia Médico", **Then** abre o portal Fachesf em nova aba
2. **Given** usuário no carrossel de carteirinhas com cartão Eletrossaude visível, **When** clica no botão "Rede Credenciada", **Then** abre o portal Eletrossaude

---

### Edge Cases

- O que acontece se o link externo do guia médico estiver fora do ar? Sistema deve abrir o link normalmente; a indisponibilidade do portal externo não é responsabilidade do app.
- O que acontece se um novo tipo de cartão for adicionado sem link configurado? Sistema deve ocultar a opção de guia médico para esse tipo até que seja configurado.
- Como lidar com usuário que perde elegibilidade de um plano? O guia médico só aparece para cartões ativos/válidos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE exibir links de guia médico apenas para os tipos de cartões que o usuário possui ativamente
- **FR-002**: Sistema DEVE abrir links de guia médico em nova aba/janela do navegador (para web) ou no navegador padrão do dispositivo (para mobile)
- **FR-003**: Sistema DEVE identificar o tipo de cartão do usuário baseado nos dados de elegibilidade/reciprocidade já existentes
- **FR-004**: Sistema DEVE manter mapeamento configurável entre tipo de cartão e URL do guia médico
- **FR-005**: Sistema DEVE exibir nome/logo da operadora junto ao link para fácil identificação visual
- **FR-006**: Sistema DEVE apresentar mensagem apropriada quando usuário não possui cartões ativos
- **FR-007**: Sistema DEVE permitir acesso ao guia médico via aba "Rede" (NetworkScreen) e via tela de carteirinha digital
- **FR-008**: Sistema DEVE substituir a tela NetworkScreen existente, removendo a busca interna de prestadores e exibindo apenas links externos dos portais de Guia Médico

### Key Entities

- **CardType**: Representa o tipo/operadora do cartão (Fachesf, Vivest, Unimed, Elosaude, Eletrossaude)
- **MedicalGuideLink**: Associação entre CardType e URL do portal de guia médico
- **UserCards**: Cartões ativos do usuário, derivados dos dados de elegibilidade existentes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário consegue acessar o guia médico do seu plano em no máximo 2 toques/cliques a partir da tela inicial
- **SC-002**: 100% dos tipos de cartões suportados (Fachesf, Vivest, Unimed, Elosaude, Eletrossaude) têm links funcionais configurados
- **SC-003**: Usuários com múltiplos planos conseguem identificar e acessar o guia correto em menos de 5 segundos
- **SC-004**: Taxa de erro de navegação (clicar no guia errado) menor que 5%
- **SC-005**: Links de guia médico aparecem apenas para cartões válidos/ativos do usuário

## Assumptions

- Os dados de elegibilidade/reciprocidade do usuário já estão disponíveis no sistema e permitem identificar quais tipos de cartões o usuário possui
- Os URLs dos portais de guia médico são estáveis e não mudam frequentemente
- O app tem permissão para abrir links externos no navegador do dispositivo
- A identificação do tipo de cartão pode ser feita através do campo existente (ex: código da operadora no Oracle Reciprocidade)

## Out of Scope

- Integração direta com os portais de guia médico (apenas links externos)
- Cache ou preview dos dados dos portais externos
- Notificações sobre atualizações nos guias médicos

## Clarifications

### Session 2026-01-05

- Q: Como integrar com a tela NetworkScreen existente que faz busca interna de prestadores? → A: Substituir NetworkScreen - remover busca interna, exibir apenas links externos dos portais de Guia Médico por operadora
