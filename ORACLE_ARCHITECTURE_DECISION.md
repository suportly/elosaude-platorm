# Decisão de Arquitetura: PostgreSQL + Oracle (Híbrido)

**Data:** 2025-11-13
**Status:** Implementado ✅

---

## Resumo Executivo

Após tentativa de migrar completamente para Oracle, descobrimos que o servidor Oracle é versão **11.2.0.4.0 (Oracle 11g)**, que **não é compatível com Django** (requer Oracle 19+).

**Decisão Final:** Manter arquitetura híbrida
- **PostgreSQL:** Banco de dados principal para Django (autenticação, sessões, dados de aplicação)
- **Oracle:** Acesso read-only via conexão direta para dados de carteirinhas (views DBAPS)

---

## Contexto da Solicitação

O usuário solicitou: _"remover base de dados postres e concentrar tudo na base oracle"_

**Tentativas realizadas:**
1. ✅ Verificação de permissões do usuário Oracle (ESTAGIARIO)
2. ✅ Configuração do Oracle como banco 'default' no Django
3. ❌ Execução de migrations Django no Oracle

---

## Problema Identificado

### Erro ao tentar migrations:

```
django.db.utils.NotSupportedError: Oracle 19 or later is required (found 11.2.0.4.0).
```

### Detalhes Técnicos:

| Item | Valor |
|------|-------|
| **Versão do Oracle** | 11.2.0.4.0 (Oracle 11g Release 2) |
| **Versão mínima Django** | Oracle 19+ |
| **Django instalado** | 4.2+ |
| **Compatibilidade** | ❌ Incompatível |

---

## Análise de Opções

### Opção 1: Atualizar Oracle 11g → Oracle 19+ ❌
**Prós:**
- Permitiria usar Django ORM completo
- Banco único simplificaria arquitetura

**Contras:**
- Requer intervenção do DBA
- Processo complexo e demorado
- Servidor Oracle gerenciado por outra equipe (DBAPS)
- Risco de quebrar sistemas legados que dependem do Oracle 11g

**Decisão:** Não viável

---

### Opção 2: Usar Django com Oracle 11g (forçar compatibilidade) ❌
**Prós:**
- Manteria banco único

**Contras:**
- Django removeu suporte oficial para Oracle < 19
- Código deprecated `cx_Oracle` seria necessário
- Bugs e problemas de compatibilidade esperados
- Sem suporte da comunidade

**Decisão:** Não recomendado

---

### Opção 3: Arquitetura Híbrida PostgreSQL + Oracle ✅ (IMPLEMENTADO)
**Prós:**
- ✅ Funciona com Oracle 11g legacy
- ✅ PostgreSQL moderno para dados de aplicação
- ✅ Acesso direto Oracle via `oracledb` (biblioteca oficial)
- ✅ Separação clara de responsabilidades
- ✅ Read-only no Oracle (mais seguro)
- ✅ Já implementado e testado

**Contras:**
- Duas bases de dados para gerenciar
- Queries Oracle via conexão direta (não Django ORM)

**Decisão:** ✅ **Implementado e funcionando**

---

## Arquitetura Implementada

### Diagrama de Conexões

```
┌─────────────────────────────────────────────────────┐
│                  Django Application                  │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│   PostgreSQL        │       │   Oracle 11g        │
│   (localhost:5432)  │       │   (192.168.40.29)   │
├─────────────────────┤       ├─────────────────────┤
│ Django ORM          │       │ Direct Connection   │
│ ✓ auth_user         │       │ (oracledb library)  │
│ ✓ django_session    │       │                     │
│ ✓ beneficiaries     │       │ ✓ READ-ONLY         │
│ ✓ providers         │       │ Views DBAPS:        │
│ ✓ guides            │       │ - CARTEIRINHA       │
│ ✓ reimbursements    │       │ - UNIMED            │
│ ✓ financial         │       │ - RECIPROCIDADE     │
│ ✓ notifications     │       │                     │
└─────────────────────┘       └─────────────────────┘
```

### Configuração `settings.py`

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='elosaude_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    },
}

# NOTE: Oracle 11g (11.2.0.4.0) is not supported by Django (requires Oracle 19+)
# Oracle integration uses direct connection via oracledb library
# See: apps.oracle_integration.connection.OracleConnection
```

---

## Implementação Oracle Read-Only

### Classe de Conexão Direta

**Arquivo:** `backend/apps/oracle_integration/connection.py`

```python
class OracleConnection:
    """Singleton Oracle connection manager"""

    @classmethod
    def execute_query(cls, query, params=None):
        """Execute a SELECT query and return results"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        cursor.execute(query, params or {})
        # Convert Oracle types to JSON-serializable
        ...
```

### API Endpoints

**Arquivo:** `backend/apps/oracle_integration/views.py`

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/oracle-cards/my_oracle_cards/` | GET | Retorna todas as carteirinhas do usuário logado |
| `/api/oracle-cards/test_connection/` | GET | Testa conexão Oracle e retorna contagem de registros |

### Exemplo de Query com Filtro CPF

```python
carteirinha_query = """
    SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
    WHERE NR_CPF = :cpf AND SN_ATIVO = 'S'
    ORDER BY CD_PLANO
"""
carteirinha = OracleConnection.execute_query(carteirinha_query, {'cpf': cpf_number})
```

---

## Testes Realizados

### 1. Teste de Permissões Oracle ✅

```bash
~/.pyenv/versions/elosaude-platforma-3.11.11/bin/python backend/scripts/check_oracle_permissions.py
```

**Resultado:**
```
✓ Current User: ESTAGIARIO
✓ System Privileges: CREATE SESSION, CREATE VIEW, EXECUTE ANY PROCEDURE, UNLIMITED TABLESPACE
✓ Roles: CONNECT, RESOURCE
✓ CREATE TABLE permission: YES
✓ Test table created and dropped successfully
```

### 2. Teste de Conexão Direta Oracle ✅

```bash
python backend/scripts/test_oracle_direct.py
```

**Resultado:**
```
✓ Connection successful!
✓ CARTEIRINHA: 17,192 active records
✓ UNIMED: 12,831 total records
✓ RECIPROCIDADE: 6,791 active records
```

### 3. Teste Django com PostgreSQL ✅

```bash
python manage.py check
```

**Resultado:**
```
System check identified no issues (0 silenced).
```

---

## Problemas Conhecidos e Soluções

### Problema 1: Case Sensitivity em ESAU_V_APP_UNIMED
**Erro:** `ORA-00904: "SN_ATIVO": identificador inválido`

**Causa:** Coluna `sn_ativo` (minúscula) vs `SN_ATIVO` (maiúscula)

**Solução:** Query sem filtro de status, filtrar em Python
```python
unimed_raw = OracleConnection.execute_query(unimed_query, {'cpf': cpf_number})
unimed = [card for card in unimed_raw
          if card.get('sn_ativo') == 'S' or card.get('SN_ATIVO') == 'S']
```

### Problema 2: PL/SQL Function em ESAU_V_APP_UNIMED
**Erro:** `ORA-06503: PL/SQL: Função retornada sem valor`

**Causa:** View contém função PL/SQL que requer filtro CPF

**Solução:** Sempre usar filtro `WHERE CPF = :cpf` em queries do UNIMED

---

## Vantagens da Arquitetura Híbrida

### Segurança ✅
- Oracle read-only reduz risco de alterações acidentais
- Dados sensíveis do DBAPS protegidos
- PostgreSQL isolado para dados de aplicação

### Performance ✅
- PostgreSQL otimizado para operações CRUD
- Oracle usado apenas para leitura de carteirinhas
- Sem overhead de tradução ORM para queries Oracle

### Manutenibilidade ✅
- Separação clara de responsabilidades
- Código Oracle isolado em `apps.oracle_integration`
- Fácil adicionar caching Redis no futuro

### Escalabilidade ✅
- PostgreSQL pode ser migrado para RDS/Cloud facilmente
- Oracle permanece on-premises (legado)
- Conexão direta permite connection pooling

---

## Próximos Passos

### Backend ✅ COMPLETO
- [x] Integração Oracle funcionando
- [x] API endpoints criados
- [x] Testes passando
- [x] Documentação completa

### Mobile 🔄 PENDENTE
- [ ] Adicionar TypeScript types para Oracle cards
- [ ] Criar RTK Query endpoint em `api.ts`
- [ ] Atualizar `DigitalCardScreen` para exibir múltiplas carteirinhas
- [ ] Criar componente `OracleDigitalCard`

### Otimizações Futuras
- [ ] Implementar cache Redis (1 hora) para queries Oracle
- [ ] Connection pooling para Oracle
- [ ] Monitoramento de performance
- [ ] Logs de queries Oracle

---

## Referências

### Documentação
- [Django Database Support](https://docs.djangoproject.com/en/stable/ref/databases/)
- [Oracle Database Compatibility Matrix](https://docs.djangoproject.com/en/stable/ref/databases/#oracle-notes)
- [python-oracledb Documentation](https://python-oracledb.readthedocs.io/)

### Arquivos do Projeto
- `backend/apps/oracle_integration/connection.py` - Conexão direta Oracle
- `backend/apps/oracle_integration/views.py` - API endpoints
- `backend/elosaude_backend/settings.py` - Configuração de bancos
- `ORACLE_IMPLEMENTATION_COMPLETE.md` - Documentação completa da implementação
- `backend/docs/ORACLE_DATABASE_ANALYSIS.md` - Análise detalhada do schema Oracle

---

## Conclusão

Apesar da solicitação inicial para _"remover PostgreSQL e concentrar tudo no Oracle"_, a **limitação técnica do Oracle 11g** (incompatível com Django 4.2+) torna essa abordagem **inviável**.

A **arquitetura híbrida implementada** é a solução mais robusta:
- ✅ Funciona com Oracle 11g legacy
- ✅ Mantém Django moderno com PostgreSQL
- ✅ Acesso eficiente aos dados Oracle via conexão direta
- ✅ Já testado e funcionando

**Status Final:** ✅ Implementação completa e operacional

---

**Última atualização:** 2025-11-13
**Versão Django:** 4.2+
**Versão Oracle:** 11.2.0.4.0
**Versão PostgreSQL:** 15+
