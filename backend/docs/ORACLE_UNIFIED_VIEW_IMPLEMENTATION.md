# Implementação da View Unificada de Carteirinhas Oracle

## Resumo da Implementação

Foi criada uma **view unificada** no Oracle usando `UNION ALL` que consolida as 3 tabelas de carteirinhas em uma única estrutura, facilitando consultas e simplificando a integração.

### O que foi criado

1. **View Oracle:** `ESAU_V_APP_CARTEIRAS_UNIFICADAS`
2. **Modelo Django:** `OracleCarteirasUnificadas`
3. **Serializer DRF:** `OracleCarteirasUnificadasSerializer`
4. **ViewSet DRF:** `OracleCarteirasUnificadasViewSet`
5. **Endpoints REST:** `/api/oracle/carteirinhas-unificadas/`

---

## Arquivos Criados/Modificados

### Novos Arquivos

1. **`backend/docs/oracle_unified_cards_view.sql`**
   - Script SQL para criar a view no Oracle
   - Usa UNION ALL para unificar as 3 tabelas
   - Inclui exemplos de queries

2. **`backend/docs/ORACLE_UNIFIED_VIEW_USAGE.md`**
   - Guia completo de uso da view unificada
   - Exemplos SQL e Django
   - Documentação da API REST

3. **`backend/docs/ORACLE_UNIFIED_VIEW_IMPLEMENTATION.md`** (este arquivo)
   - Instruções de instalação e implementação

### Arquivos Modificados

1. **`backend/apps/oracle_integration/models.py`**
   - Adicionado: `OracleCarteirasUnificadas` model

2. **`backend/apps/oracle_integration/serializers.py`**
   - Adicionado: `OracleCarteirasUnificadasSerializer`

3. **`backend/apps/oracle_integration/views.py`**
   - Adicionado: `OracleCarteirasUnificadasViewSet`

4. **`backend/apps/oracle_integration/urls.py`**
   - Registrado: router para `carteirinhas-unificadas`

---

## Passo a Passo de Instalação

### 1. Criar a View no Oracle

Primeiro, você precisa executar o script SQL no banco Oracle para criar a view.

#### Opção A: Usando SQL*Plus

```bash
# Conectar ao Oracle
sqlplus DBAPS/sua_senha@192.168.40.29:1521/SIML

# Executar o script
SQL> @/home/alairjt/workspace/elosaude-platform/backend/docs/oracle_unified_cards_view.sql

# Verificar se foi criada
SQL> SELECT COUNT(*) FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS;
```

#### Opção B: Usando SQL Developer

1. Abra o SQL Developer
2. Conecte ao banco: `DBAPS@192.168.40.29:1521/SIML`
3. Abra o arquivo `oracle_unified_cards_view.sql`
4. Execute o script (F5)

#### Opção C: Usando Python (através da integração existente)

```python
# Criar script backend/scripts/create_oracle_unified_view.py
import oracledb
import os

def create_unified_view():
    # Ler o SQL do arquivo
    sql_file = 'backend/docs/oracle_unified_cards_view.sql'
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # Conectar ao Oracle
    connection = oracledb.connect(
        user='DBAPS',
        password='sua_senha',
        dsn='192.168.40.29:1521/SIML'
    )

    cursor = connection.cursor()

    # Executar o SQL
    try:
        cursor.execute(sql_content)
        print("✅ View ESAU_V_APP_CARTEIRAS_UNIFICADAS criada com sucesso!")

        # Verificar contagem
        cursor.execute("SELECT COUNT(*) FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS")
        count = cursor.fetchone()[0]
        print(f"📊 Total de registros: {count}")

    except Exception as e:
        print(f"❌ Erro ao criar view: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    create_unified_view()
```

Execute:
```bash
cd /home/alairjt/workspace/elosaude-platform
python backend/scripts/create_oracle_unified_view.py
```

### 2. Verificar a View no Oracle

```sql
-- Contar registros por tipo
SELECT TIPO_CARTEIRA, COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY TIPO_CARTEIRA;

-- Resultado esperado:
-- TIPO_CARTEIRA     TOTAL
-- CARTEIRINHA       17,192
-- UNIMED            12,831
-- RECIPROCIDADE      6,791
```

### 3. Testar o Modelo Django

```bash
cd /home/alairjt/workspace/elosaude-platform/backend

# Abrir shell Django
python manage.py shell
```

```python
from apps.oracle_integration.models import OracleCarteirasUnificadas

# Contar registros
total = OracleCarteirasUnificadas.objects.using('oracle').count()
print(f"Total de carteirinhas: {total}")

# Contar por tipo
from django.db.models import Count
stats = OracleCarteirasUnificadas.objects.using('oracle').values('tipo_carteira').annotate(
    total=Count('matricula_soul')
)
for stat in stats:
    print(f"{stat['tipo_carteira']}: {stat['total']}")

# Buscar carteirinhas de um CPF específico
cpf = 12345678901  # Substituir por um CPF real
carteirinhas = OracleCarteirasUnificadas.objects.using('oracle').filter(nr_cpf=cpf)
for c in carteirinhas:
    print(f"{c.tipo_carteira} - {c.nome_beneficiario} - {c.numero_carteirinha_display}")
```

### 4. Verificar Endpoints da API

Primeiro, certifique-se de que o app está incluído nas URLs principais:

```python
# backend/elosaude_backend/urls.py
urlpatterns = [
    # ...
    path('api/oracle/', include('apps.oracle_integration.urls')),
    # ...
]
```

Depois, inicie o servidor:

```bash
cd /home/alairjt/workspace/elosaude-platform/backend
python manage.py runserver
```

---

## Endpoints Disponíveis

### 1. Listar todas as carteirinhas

```http
GET /api/oracle/carteirinhas-unificadas/
```

**Parâmetros de query:**
- `tipo_carteira`: Filtrar por tipo (CARTEIRINHA, UNIMED, RECIPROCIDADE)
- `nr_cpf`: Filtrar por CPF
- `prestador_rede`: Filtrar por prestador (UNIMED, VIVEST, etc)
- `search`: Buscar por nome, CNS, matrícula
- `ordering`: Ordenar resultados

**Exemplo:**
```bash
curl http://localhost:8000/api/oracle/carteirinhas-unificadas/?tipo_carteira=UNIMED
```

### 2. Minhas carteirinhas (usuário autenticado)

```http
GET /api/oracle/carteirinhas-unificadas/minhas_carteirinhas/
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "total": 3,
  "tem_unimed": true,
  "tem_reciprocidade": true,
  "carteirinha_principal": [
    {
      "tipo_carteira": "CARTEIRINHA",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula": "0100082",
      "plano_nome": "E 2020 - Apartamento Standard",
      "segmentacao": "AMB+HOSP C/OBST",
      "cpf_formatado": "123.456.789-01",
      "is_carteirinha_principal": true,
      "numero_carteirinha_display": "0100082"
    }
  ],
  "unimed": [
    {
      "tipo_carteira": "UNIMED",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula_rede": "12345678901234",
      "prestador_rede": "UNIMED",
      "abrangencia": "NACIONAL",
      "acomodacao": "ENFERMARIA",
      "is_unimed": true
    }
  ],
  "reciprocidade": [
    {
      "tipo_carteira": "RECIPROCIDADE",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula_rede": "03783816840000",
      "prestador_rede": "VIVEST",
      "plano_nome": "PLANO TBL",
      "is_reciprocidade": true
    }
  ]
}
```

### 3. Estatísticas

```http
GET /api/oracle/carteirinhas-unificadas/estatisticas/
```

**Resposta:**
```json
{
  "total_geral": 36814,
  "por_tipo": [
    {"tipo_carteira": "CARTEIRINHA", "total": 17192},
    {"tipo_carteira": "UNIMED", "total": 12831},
    {"tipo_carteira": "RECIPROCIDADE", "total": 6791}
  ],
  "por_prestador": [
    {"prestador_rede": "UNIMED", "total": 12831},
    {"prestador_rede": "VIVEST", "total": 6791}
  ]
}
```

### 4. Buscar por beneficiário específico

```http
GET /api/oracle/carteirinhas-unificadas/por_beneficiario/?cpf=12345678901
GET /api/oracle/carteirinhas-unificadas/por_beneficiario/?matricula_soul=40650006
```

---

## Integração com Mobile App

### RTK Query Endpoint

Adicione ao arquivo `mobile/src/store/services/api.ts`:

```typescript
// Tipos
interface CarteirinhaUnificada {
  tipo_carteira: 'CARTEIRINHA' | 'UNIMED' | 'RECIPROCIDADE';
  nome_beneficiario: string;
  matricula?: string;
  matricula_rede?: string;
  plano_nome?: string;
  segmentacao?: string;
  prestador_rede?: string;
  abrangencia?: string;
  acomodacao?: string;
  cpf_formatado?: string;
  is_carteirinha_principal: boolean;
  is_unimed: boolean;
  is_reciprocidade: boolean;
  numero_carteirinha_display: string;
  // ... outros campos
}

interface MinhasCarteirinhasResponse {
  total: number;
  tem_unimed: boolean;
  tem_reciprocidade: boolean;
  carteirinha_principal: CarteirinhaUnificada[];
  unimed: CarteirinhaUnificada[];
  reciprocidade: CarteirinhaUnificada[];
}

// Adicionar ao API slice
export const api = createApi({
  // ... configuração existente
  endpoints: (builder) => ({
    // ... endpoints existentes

    getMinhasCarteirinhas: builder.query<MinhasCarteirinhasResponse, void>({
      query: () => '/oracle/carteirinhas-unificadas/minhas_carteirinhas/',
    }),

    getCarteirinhasUnificadas: builder.query<CarteirinhaUnificada[], {
      tipo_carteira?: string;
      cpf?: string;
    }>({
      query: (params) => ({
        url: '/oracle/carteirinhas-unificadas/',
        params,
      }),
    }),
  }),
});

export const {
  useGetMinhasCarteirinhasQuery,
  useGetCarteirinhasUnificadasQuery,
} = api;
```

### Uso no Componente React Native

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useGetMinhasCarteirinhasQuery } from '../../store/services/api';

const DigitalCardScreen = () => {
  const { data, isLoading, error } = useGetMinhasCarteirinhasQuery();

  if (isLoading) return <Text>Carregando...</Text>;
  if (error) return <Text>Erro ao carregar carteirinhas</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Minhas Carteirinhas ({data?.total || 0})</Text>

      {/* Carteirinha Principal */}
      {data?.carteirinha_principal.map((carteirinha, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.cardTitle}>Carteirinha Elosaúde</Text>
          <Text>{carteirinha.nome_beneficiario}</Text>
          <Text>Matrícula: {carteirinha.numero_carteirinha_display}</Text>
          <Text>Plano: {carteirinha.plano_nome}</Text>
          <Text>Segmentação: {carteirinha.segmentacao}</Text>
        </View>
      ))}

      {/* Carteirinha Unimed */}
      {data?.tem_unimed && (
        <>
          <Text style={styles.subtitle}>Rede Unimed</Text>
          {data.unimed.map((carteirinha, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>Unimed</Text>
              <Text>{carteirinha.nome_beneficiario}</Text>
              <Text>Matrícula: {carteirinha.numero_carteirinha_display}</Text>
              <Text>Abrangência: {carteirinha.abrangencia}</Text>
              <Text>Acomodação: {carteirinha.acomodacao}</Text>
            </View>
          ))}
        </>
      )}

      {/* Reciprocidade */}
      {data?.tem_reciprocidade && (
        <>
          <Text style={styles.subtitle}>Reciprocidade</Text>
          {data.reciprocidade.map((carteirinha, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{carteirinha.prestador_rede}</Text>
              <Text>{carteirinha.nome_beneficiario}</Text>
              <Text>Matrícula: {carteirinha.numero_carteirinha_display}</Text>
              <Text>Plano: {carteirinha.plano_nome}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default DigitalCardScreen;
```

---

## Vantagens da Implementação

### ✅ Simplicidade
- Uma única query retorna todos os tipos de carteirinha
- Código mais limpo e fácil de manter
- Menos endpoints para gerenciar

### ✅ Performance
- Reduz número de queries ao banco
- Oracle otimiza o UNION ALL internamente
- Cache mais eficiente (um endpoint em vez de três)

### ✅ Flexibilidade
- Fácil adicionar novos tipos de carteirinha no futuro
- Campos comuns padronizados
- Filtros unificados

### ✅ Experiência do Desenvolvedor
- API intuitiva e consistente
- Tipagem clara (TypeScript)
- Menos código boilerplate

---

## Queries SQL Úteis

### Buscar todas as carteirinhas de um beneficiário

```sql
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE NR_CPF = 12345678901
ORDER BY TIPO_CARTEIRA;
```

### Beneficiários com múltiplos tipos de carteirinha

```sql
SELECT
    MATRICULA_SOUL,
    NOME_BENEFICIARIO,
    COUNT(DISTINCT TIPO_CARTEIRA) AS TIPOS_DIFERENTES,
    LISTAGG(TIPO_CARTEIRA, ', ') WITHIN GROUP (ORDER BY TIPO_CARTEIRA) AS TIPOS
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY MATRICULA_SOUL, NOME_BENEFICIARIO
HAVING COUNT(DISTINCT TIPO_CARTEIRA) > 1;
```

### Carteirinhas por prestador

```sql
SELECT
    PRESTADOR_REDE,
    COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE PRESTADOR_REDE IS NOT NULL
GROUP BY PRESTADOR_REDE
ORDER BY TOTAL DESC;
```

---

## Próximos Passos

### Backend
- [ ] Adicionar testes unitários para o modelo e serializer
- [ ] Adicionar testes de integração para os endpoints
- [ ] Implementar cache Redis para queries frequentes
- [ ] Adicionar paginação para listagens grandes
- [ ] Documentar API com OpenAPI/Swagger

### Mobile
- [ ] Criar componentes de carteirinha para cada tipo
- [ ] Implementar carousel de carteirinhas
- [ ] Adicionar geração de QR Code por carteirinha
- [ ] Implementar download/compartilhamento de carteirinha
- [ ] Adicionar modo offline com cache local

### DevOps
- [ ] Configurar monitoramento de queries Oracle
- [ ] Adicionar alertas para falhas de conexão
- [ ] Otimizar índices no Oracle se necessário
- [ ] Implementar health check da view

---

## Troubleshooting

### View não encontrada

**Erro:** `ORA-00942: table or view does not exist`

**Solução:**
1. Verificar se a view foi criada: `SELECT * FROM ALL_VIEWS WHERE VIEW_NAME = 'ESAU_V_APP_CARTEIRAS_UNIFICADAS';`
2. Verificar permissões do usuário DBAPS
3. Executar novamente o script de criação

### Contagem não bate

**Problema:** Total de registros diferente do esperado

**Solução:**
```sql
-- Verificar contagens individuais
SELECT 'CARTEIRINHA' AS FONTE, COUNT(*) FROM DBAPS.ESAU_V_APP_CARTEIRINHA WHERE SN_ATIVO = 'S'
UNION ALL
SELECT 'UNIMED', COUNT(*) FROM DBAPS.ESAU_V_APP_UNIMED WHERE sn_ativo = 'S'
UNION ALL
SELECT 'RECIPROCIDADE', COUNT(*) FROM DBAPS.ESAU_V_APP_RECIPROCIDADE WHERE SN_ATIVO = 'S';
```

### Django não conecta ao Oracle

**Erro:** `cx_Oracle.DatabaseError: DPI-1047: Cannot locate a 64-bit Oracle Client library`

**Solução:**
1. Instalar Oracle Instant Client
2. Configurar `LD_LIBRARY_PATH` ou `DYLD_LIBRARY_PATH`
3. Verificar configuração em `settings.py`

---

## Referências

- [Análise Oracle Database](ORACLE_DATABASE_ANALYSIS.md)
- [Guia de Uso da View Unificada](ORACLE_UNIFIED_VIEW_USAGE.md)
- [Script SQL da View](oracle_unified_cards_view.sql)

---

**Criado em:** 2025-11-17
**Autor:** Elosaúde Platform Team
**Status:** ✅ Implementação Completa
