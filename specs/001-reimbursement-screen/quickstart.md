# Quickstart: Tela de Reembolso

**Feature**: 001-reimbursement-screen
**Date**: 2025-12-15

## Prerequisites

- Docker e Docker Compose instalados
- Node.js 18+ instalado
- Expo CLI instalado (`npm install -g expo-cli`)
- Emulador Android/iOS ou dispositivo físico com Expo Go

## Setup do Ambiente

### 1. Backend

```bash
# Na raiz do projeto
cd elosaude-platform

# Iniciar serviços com Docker
docker-compose up -d

# Verificar se está rodando
curl http://localhost:8000/api/reimbursements/requests/
```

O backend estará disponível em:
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- Swagger: http://localhost:8000/swagger/

### 2. Mobile

```bash
# Entrar no diretório mobile
cd mobile

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

Pressione `a` para Android ou `i` para iOS.

## Fluxo de Teste

### 1. Login de Teste

Use qualquer CPF e senha para autenticar:
```
CPF: 123.456.789-00
Senha: qualquer
```

O sistema cria automaticamente um beneficiário de teste.

### 2. Acessar Reembolsos

1. No menu principal, toque em "Reembolso" ou acesse via drawer
2. Visualize o resumo com totais e contadores
3. Use os filtros de status para navegar

### 3. Criar Nova Solicitação

1. Toque no FAB "Nova Solicitação"
2. Preencha:
   - Tipo de Despesa: Consulta
   - Data do Serviço: Selecione uma data passada
   - Nome do Prestador: "Clínica Teste"
   - CNPJ/CPF: "12345678901"
   - Valor: R$ 150,00
   - Dados Bancários: Preencha todos os campos
3. Anexe pelo menos 1 documento (foto ou PDF)
4. Toque em "Enviar Solicitação"

### 4. Visualizar Detalhes

1. Na lista, toque em "Detalhes" em qualquer card
2. Verifique todas as informações exibidas
3. Para reembolsos pagos, teste o download do comprovante

### 5. Enviar Documentos Adicionais (A IMPLEMENTAR)

1. Na lista, encontre um reembolso "Em Análise"
2. Toque em "Enviar docs"
3. Selecione documentos adicionais
4. Confirme o envio

## Endpoints de Teste

### Listar Meus Reembolsos
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/reimbursements/requests/my_reimbursements/
```

### Obter Resumo
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/reimbursements/requests/summary/
```

### Criar Reembolso
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiary": 1,
    "expense_type": "CONSULTATION",
    "service_date": "2025-12-01",
    "provider_name": "Clinica Teste",
    "provider_cnpj_cpf": "12345678901",
    "requested_amount": "150.00",
    "bank_details": {
      "bank_name": "Banco Teste",
      "agency": "1234",
      "account": "56789-0",
      "account_type": "CORRENTE"
    }
  }' \
  http://localhost:8000/api/reimbursements/requests/
```

### Adicionar Documentos (NOVO)
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"documents": [1, 2]}' \
  http://localhost:8000/api/reimbursements/requests/1/add-documents/
```

## Dados de Teste

### Criar Reembolso de Teste via Admin

1. Acesse http://localhost:8000/admin/
2. Login: admin / admin (ou crie superuser)
3. Navegue para "Reimbursement requests"
4. Adicione um novo reembolso
5. Marque como "PAID" para testar download de comprovante

### Popular Dados via Management Command

```bash
docker-compose exec backend python manage.py populate_reimbursements
```

## Troubleshooting

### Erro de autenticação
```bash
# Obter novo token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"cpf": "12345678900", "password": "test"}'
```

### Upload falha no mobile
- Verifique conexão com backend
- Confirme que arquivo é PDF, JPG ou PNG
- Tamanho máximo: 10MB

### Lista não carrega
```bash
# Verificar se backend está respondendo
curl http://localhost:8000/api/health/
```

## Arquivos Relevantes

### Backend
- `backend/apps/reimbursements/models.py` - Modelos
- `backend/apps/reimbursements/views.py` - ViewSets
- `backend/apps/reimbursements/serializers.py` - Serializers

### Mobile
- `mobile/src/screens/Reimbursement/` - Telas
- `mobile/src/store/services/api.ts` - RTK Query endpoints
- `mobile/src/components/DocumentUploader.tsx` - Upload component
- `mobile/src/utils/fileUploader.ts` - Upload utilities

## Checklist de Validação

- [ ] Backend inicia sem erros
- [ ] Mobile conecta ao backend
- [ ] Login funciona com qualquer credencial
- [ ] Lista de reembolsos carrega
- [ ] Resumo mostra totais corretos
- [ ] Filtros funcionam
- [ ] Criar nova solicitação funciona
- [ ] Upload de documentos funciona
- [ ] Detalhes do reembolso carregam
- [ ] Download de comprovante funciona (para status PAID)
- [ ] Enviar documentos adicionais funciona (PENDENTE)
