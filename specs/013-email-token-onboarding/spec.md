# Feature Specification: Envio de Token por Email e Onboarding Pós-Login

**Feature Branch**: `013-email-token-onboarding`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "No envio de token no primeiro cadastro utilizar smtp.gmail.com com conta naoresponda@elosaude.com.br. Criar template de email com logo da Elosaude. Utilizar variáveis ambiente. Garantir processo funcionando. Após primeiro login mostrar onboarding para atualização de dados."

## Resumo

Implementar sistema de envio de token de verificação por email durante o primeiro cadastro de beneficiários, utilizando SMTP do Gmail. O email deve seguir identidade visual da Elosaude. Após o primeiro login bem-sucedido, exibir tela de onboarding solicitando que o usuário atualize seus dados cadastrais (já existentes na base).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recebimento de Token por Email (Priority: P1)

O beneficiário realiza seu primeiro cadastro no aplicativo e recebe um email com token de verificação. O email possui visual profissional com logo da Elosaude e instruções claras para uso do token. O beneficiário utiliza o token para validar sua conta e concluir o cadastro.

**Why this priority**: O envio de token por email é essencial para validação de identidade e segurança do cadastro. Sem este fluxo, usuários não conseguem completar o registro.

**Independent Test**: Pode ser testado realizando um novo cadastro e verificando se o email é recebido com o token correto e visual adequado.

**Acceptance Scenarios**:

1. **Given** beneficiário na tela de cadastro, **When** informa CPF válido e email, **Then** sistema envia email com token de 6 dígitos para o endereço informado
2. **Given** email enviado com token, **When** beneficiário abre o email, **Then** visualiza template profissional com logo Elosaude, saudação personalizada e token destacado
3. **Given** beneficiário recebeu token por email, **When** insere token na tela de verificação, **Then** sistema valida e permite prosseguir com cadastro
4. **Given** token enviado há mais de 10 minutos, **When** beneficiário tenta usar, **Then** sistema informa expiração e oferece opção de reenvio

---

### User Story 2 - Onboarding de Atualização de Dados (Priority: P2)

Após realizar o primeiro login com sucesso, o beneficiário visualiza uma tela de onboarding informando que seus dados básicos já existem na base (vindos do cadastro da empresa/operadora) e solicitando que atualize informações adicionais como telefone, email alternativo e foto de perfil. Esta tela aparece apenas uma única vez.

**Why this priority**: A atualização de dados garante informações de contato atualizadas e melhora a experiência do usuário ao personalizar seu perfil. Funcionalidade complementar ao cadastro.

**Independent Test**: Pode ser testado fazendo login com um usuário que nunca acessou o app antes e verificando se a tela de onboarding aparece apenas na primeira vez.

**Acceptance Scenarios**:

1. **Given** beneficiário faz login pela primeira vez, **When** autenticação é bem-sucedida, **Then** sistema exibe tela de onboarding de atualização de dados
2. **Given** beneficiário na tela de onboarding, **When** visualiza a tela, **Then** vê seus dados básicos já preenchidos (nome, CPF, data nascimento) como somente leitura e campos editáveis para telefone e email
3. **Given** beneficiário na tela de onboarding, **When** atualiza dados e confirma, **Then** sistema salva alterações e navega para tela principal
4. **Given** beneficiário na tela de onboarding, **When** escolhe "Pular" ou "Fazer depois", **Then** sistema marca como visualizado e navega para tela principal
5. **Given** beneficiário já completou ou pulou onboarding, **When** faz login novamente, **Then** sistema navega diretamente para tela principal sem mostrar onboarding

---

### User Story 3 - Reenvio de Token (Priority: P3)

O beneficiário que não recebeu ou perdeu o email com token pode solicitar reenvio. O sistema controla a frequência de reenvios para evitar abuso.

**Why this priority**: Funcionalidade de suporte para casos onde o email não chegou ou foi excluído acidentalmente.

**Independent Test**: Pode ser testado solicitando reenvio de token e verificando se novo email é recebido.

**Acceptance Scenarios**:

1. **Given** beneficiário na tela de verificação de token, **When** clica em "Reenviar código", **Then** sistema envia novo token e exibe mensagem de confirmação
2. **Given** beneficiário solicitou reenvio há menos de 60 segundos, **When** tenta reenviar novamente, **Then** sistema exibe contador de espera antes de permitir novo envio
3. **Given** beneficiário atingiu limite de 5 reenvios, **When** tenta reenviar, **Then** sistema informa que deve aguardar 30 minutos para novas tentativas

---

### Edge Cases

- O que acontece se o email do beneficiário for inválido ou inexistente? Sistema deve informar erro de envio e sugerir verificar o endereço.
- O que acontece se o servidor SMTP estiver indisponível? Sistema deve registrar erro, informar usuário sobre problema temporário e sugerir tentar novamente em alguns minutos.
- O que acontece se o beneficiário informar token incorreto? Sistema permite até 5 tentativas antes de bloquear por 15 minutos.
- O que acontece se o usuário fechar o app durante o onboarding? Na próxima abertura, o onboarding deve aparecer novamente até ser completado ou explicitamente pulado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE enviar email com token de verificação de 6 dígitos numéricos ao beneficiário durante primeiro cadastro
- **FR-002**: Sistema DEVE utilizar SMTP do Gmail (smtp.gmail.com:587) com credenciais configuradas via variáveis de ambiente
- **FR-003**: Sistema DEVE utilizar template de email HTML com logo da Elosaude, cores da marca e layout responsivo
- **FR-004**: Token DEVE ter validade de 10 minutos após geração
- **FR-005**: Sistema DEVE permitir reenvio de token com intervalo mínimo de 60 segundos entre envios
- **FR-006**: Sistema DEVE limitar reenvios a 5 tentativas por hora
- **FR-007**: Sistema DEVE exibir tela de onboarding após primeiro login bem-sucedido, apenas uma vez por usuário
- **FR-008**: Tela de onboarding DEVE exibir dados existentes (nome, CPF, nascimento) como somente leitura e permitir edição de telefone e email
- **FR-009**: Sistema DEVE marcar usuário como "onboarding_completed" após visualização da tela (mesmo se pulado)
- **FR-010**: Sistema DEVE armazenar credenciais SMTP exclusivamente em variáveis de ambiente (EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
- **FR-011**: Sistema DEVE registrar logs de envio de email (sucesso/falha) para auditoria
- **FR-012**: Template de email DEVE incluir: logo Elosaude, saudação com nome do beneficiário, token em destaque, instruções de uso e aviso de expiração

### Key Entities

- **VerificationToken**: Token de 6 dígitos associado ao beneficiário, com data de criação, data de expiração e status (pendente/usado/expirado)
- **UserOnboardingStatus**: Flag indicando se usuário completou/pulou onboarding, com data da ação
- **EmailLog**: Registro de emails enviados com destinatário, tipo (token/notificação), status de envio e timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% dos emails de token são entregues com sucesso na caixa de entrada (não spam) em até 30 segundos
- **SC-002**: 90% dos beneficiários conseguem completar verificação de token na primeira tentativa
- **SC-003**: 80% dos beneficiários completam onboarding (não pulam) na primeira interação
- **SC-004**: Tempo médio para completar fluxo de cadastro (incluindo verificação de email) é inferior a 3 minutos
- **SC-005**: Taxa de reenvio de token é inferior a 15% (indicando boa entregabilidade)
- **SC-006**: Zero exposição de credenciais SMTP em código-fonte ou logs

## Assumptions

- Beneficiários já existem na base de dados com informações básicas (nome, CPF, data nascimento) vindas do cadastro da empresa/operadora
- O cadastro inicial já existe e apenas precisa ser modificado para incluir envio de email
- Gmail permite envio de emails via SMTP com app passwords
- Beneficiários têm acesso ao email informado durante cadastro
- O app mobile já possui tela de verificação de token que será adaptada

## Out of Scope

- Envio de SMS como alternativa ao email
- Verificação de email por link (apenas token numérico)
- Configuração de múltiplos provedores SMTP
- Templates de email customizáveis pelo administrador
- Notificações push sobre token enviado
