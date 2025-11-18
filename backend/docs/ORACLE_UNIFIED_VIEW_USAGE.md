# View Unificada de Carteirinhas Oracle - Guia de Uso

## Visão Geral

A view `ESAU_V_APP_CARTEIRAS_UNIFICADAS` consolida as 3 tabelas de carteirinhas em uma única estrutura usando `UNION ALL`, facilitando consultas e reduzindo a complexidade de queries.

## Características

- **Tecnologia:** UNION ALL (não JOIN)
- **Total de registros:** ~36,814 (soma das 3 tabelas)
- **Filtro:** Apenas registros ativos (`SN_ATIVO = 'S'`)
- **Identificação:** Campo `TIPO_CARTEIRA` indica a origem de cada registro

## Estrutura de Dados

### Campos Comuns (todas as fontes)

| Campo | Tipo | Descrição | Origem |
|-------|------|-----------|--------|
| **TIPO_CARTEIRA** | VARCHAR | 'CARTEIRINHA', 'UNIMED' ou 'RECIPROCIDADE' | Calculado |
| **CONTRATO** | NUMBER(20) | ID do contrato | Todas |
| **MATRICULA_SOUL** | NUMBER(20) | ID único do beneficiário | Todas |
| **NR_CPF** | NUMBER(11) | CPF do beneficiário | Todas |
| **NOME_BENEFICIARIO** | VARCHAR(100) | Nome completo | Todas |
| **MATRICULA** | VARCHAR(20) | Matrícula Elosaúde | CARTEIRINHA, RECIPROCIDADE |
| **NR_CNS** | VARCHAR(100) | Cartão Nacional de Saúde | Todas |
| **NASCTO** | VARCHAR(10) | Data nascimento (DD/MM/YYYY) | Todas |
| **NM_SOCIAL** | VARCHAR(100) | Nome social | Todas |
| **SN_ATIVO** | VARCHAR(1) | Status ativo | Todas |
| **SEGMENTACAO** | VARCHAR(40) | Segmentação do plano | CARTEIRINHA, UNIMED |

### Campos Específicos - Carteirinha Principal

| Campo | Tipo | Descrição |
|-------|------|-----------|
| EMPRESA | VARCHAR(170) | Nome da empresa/empregador |
| CD_PLANO | NUMBER(20) | Código do plano |
| PLANO_NOME | VARCHAR(133) | Nome do plano primário |
| PLANO_SECUNDARIO | VARCHAR(115) | Plano secundário |
| PLANO_TERCIARIO | VARCHAR(111) | Plano terciário |
| TIPO_CONTRATACAO | VARCHAR(20) | Tipo de contratação |
| DATA_VALIDADE | VARCHAR(10) | Data de validade |
| CPT | VARCHAR(13) | Indicador CPT |
| LAYOUT | VARCHAR(13) | Tipo de layout |
| NOME_TITULAR | VARCHAR(100) | Nome do titular (se dependente) |

### Campos Específicos - Redes (Unimed/Reciprocidade)

| Campo | Tipo | Descrição | Origem |
|-------|------|-----------|--------|
| MATRICULA_REDE | VARCHAR(200) | Matrícula na rede externa | UNIMED, RECIPROCIDADE |
| PRESTADOR_REDE | VARCHAR(9) | Nome do prestador ('UNIMED', 'VIVEST', etc) | UNIMED, RECIPROCIDADE |
| DATA_ADESAO | VARCHAR(10) | Data de adesão à rede | UNIMED, RECIPROCIDADE |
| ABRANGENCIA | VARCHAR(8) | Abrangência da cobertura | UNIMED |
| ACOMODACAO | VARCHAR(10) | Tipo de acomodação | UNIMED |
| REDE_ATENDIMENTO | VARCHAR(11) | Rede de atendimento | UNIMED |

## Instalação

### 1. Criar a View no Oracle

```bash
# Conectar ao Oracle como usuário DBA ou com permissões de CREATE VIEW
sqlplus DBAPS/senha@192.168.40.29:1521/SIML

# Executar o script
@/path/to/oracle_unified_cards_view.sql
```

### 2. Verificar a Criação

```sql
-- Verificar se a view foi criada
SELECT COUNT(*) FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS;

-- Verificar distribuição por tipo
SELECT TIPO_CARTEIRA, COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY TIPO_CARTEIRA;
```

Resultado esperado:
```
TIPO_CARTEIRA     TOTAL
-----------------  ------
CARTEIRINHA        17,192
UNIMED             12,831
RECIPROCIDADE       6,791
-----------------  ------
TOTAL              36,814
```

## Exemplos de Uso SQL

### Buscar todas as carteirinhas de um beneficiário

```sql
-- Por CPF
SELECT
    TIPO_CARTEIRA,
    NOME_BENEFICIARIO,
    MATRICULA,
    MATRICULA_REDE,
    PLANO_NOME,
    PRESTADOR_REDE
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE NR_CPF = 347140904
ORDER BY TIPO_CARTEIRA;

-- Por MATRICULA_SOUL (mais eficiente)
SELECT *
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE MATRICULA_SOUL = 40650006
ORDER BY TIPO_CARTEIRA;
```

### Identificar beneficiários com múltiplas carteirinhas

```sql
SELECT
    MATRICULA_SOUL,
    NOME_BENEFICIARIO,
    NR_CPF,
    COUNT(*) AS TOTAL_CARTEIRINHAS,
    COUNT(DISTINCT TIPO_CARTEIRA) AS TIPOS_DIFERENTES,
    LISTAGG(TIPO_CARTEIRA, ', ') WITHIN GROUP (ORDER BY TIPO_CARTEIRA) AS TIPOS
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY MATRICULA_SOUL, NOME_BENEFICIARIO, NR_CPF
HAVING COUNT(*) > 1
ORDER BY TOTAL_CARTEIRINHAS DESC;
```

### Listar beneficiários com acesso à rede Unimed

```sql
SELECT
    NOME_BENEFICIARIO,
    MATRICULA_REDE AS MATRICULA_UNIMED,
    ABRANGENCIA,
    ACOMODACAO,
    REDE_ATENDIMENTO,
    DATA_VALIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE TIPO_CARTEIRA = 'UNIMED'
ORDER BY NOME_BENEFICIARIO;
```

### Verificar reciprocidades por prestador

```sql
SELECT
    PRESTADOR_REDE,
    COUNT(*) AS TOTAL_BENEFICIARIOS,
    MIN(DATA_ADESAO) AS PRIMEIRA_ADESAO,
    MAX(DATA_VALIDADE) AS ULTIMA_VALIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE TIPO_CARTEIRA = 'RECIPROCIDADE'
GROUP BY PRESTADOR_REDE
ORDER BY TOTAL_BENEFICIARIOS DESC;
```

## Integração com Django

### Modelo Django

Adicione ao arquivo `backend/apps/oracle_integration/models.py`:

```python
from django.db import models

class OracleCarteirasUnificadas(models.Model):
    """
    Modelo read-only para a view ESAU_V_APP_CARTEIRAS_UNIFICADAS
    Consolida CARTEIRINHA + UNIMED + RECIPROCIDADE usando UNION ALL
    """

    # Campos comuns
    tipo_carteira = models.CharField(max_length=20, db_column='TIPO_CARTEIRA')
    contrato = models.DecimalField(max_digits=20, decimal_places=0, db_column='CONTRATO')
    matricula_soul = models.DecimalField(max_digits=20, decimal_places=0, primary_key=True, db_column='MATRICULA_SOUL')
    nr_cpf = models.DecimalField(max_digits=11, decimal_places=0, null=True, db_column='NR_CPF')
    nome_beneficiario = models.CharField(max_length=100, null=True, db_column='NOME_BENEFICIARIO')
    matricula = models.CharField(max_length=20, null=True, db_column='MATRICULA')
    nr_cns = models.CharField(max_length=100, null=True, db_column='NR_CNS')
    nascto = models.CharField(max_length=10, null=True, db_column='NASCTO')
    nm_social = models.CharField(max_length=100, null=True, db_column='NM_SOCIAL')
    sn_ativo = models.CharField(max_length=1, db_column='SN_ATIVO')
    segmentacao = models.CharField(max_length=40, null=True, db_column='SEGMENTACAO')

    # Campos específicos - Carteirinha principal
    empresa = models.CharField(max_length=170, null=True, db_column='EMPRESA')
    cd_plano = models.DecimalField(max_digits=20, decimal_places=0, null=True, db_column='CD_PLANO')
    plano_nome = models.CharField(max_length=133, null=True, db_column='PLANO_NOME')
    plano_secundario = models.CharField(max_length=115, null=True, db_column='PLANO_SECUNDARIO')
    plano_terciario = models.CharField(max_length=111, null=True, db_column='PLANO_TERCIARIO')
    tipo_contratacao = models.CharField(max_length=20, null=True, db_column='TIPO_CONTRATACAO')
    data_validade = models.CharField(max_length=10, null=True, db_column='DATA_VALIDADE')
    cpt = models.CharField(max_length=13, null=True, db_column='CPT')
    layout = models.CharField(max_length=13, null=True, db_column='LAYOUT')
    nome_titular = models.CharField(max_length=100, null=True, db_column='NOME_TITULAR')

    # Campos específicos - Redes
    matricula_rede = models.CharField(max_length=200, null=True, db_column='MATRICULA_REDE')
    prestador_rede = models.CharField(max_length=9, null=True, db_column='PRESTADOR_REDE')
    data_adesao = models.CharField(max_length=10, null=True, db_column='DATA_ADESAO')
    abrangencia = models.CharField(max_length=8, null=True, db_column='ABRANGENCIA')
    acomodacao = models.CharField(max_length=10, null=True, db_column='ACOMODACAO')
    rede_atendimento = models.CharField(max_length=11, null=True, db_column='REDE_ATENDIMENTO')

    class Meta:
        managed = False
        db_table = '"DBAPS"."ESAU_V_APP_CARTEIRAS_UNIFICADAS"'
        app_label = 'oracle_integration'
        ordering = ['tipo_carteira', 'matricula_soul']

    def __str__(self):
        return f"{self.nome_beneficiario} - {self.tipo_carteira}"

    @property
    def is_carteirinha_principal(self):
        return self.tipo_carteira == 'CARTEIRINHA'

    @property
    def is_unimed(self):
        return self.tipo_carteira == 'UNIMED'

    @property
    def is_reciprocidade(self):
        return self.tipo_carteira == 'RECIPROCIDADE'

    @property
    def numero_carteirinha_display(self):
        """Retorna o número da carteirinha apropriado conforme o tipo"""
        if self.is_carteirinha_principal:
            return self.matricula
        else:
            return self.matricula_rede
```

### Serializer

Adicione ao arquivo `backend/apps/oracle_integration/serializers.py`:

```python
from rest_framework import serializers
from .models import OracleCarteirasUnificadas

class OracleCarteirasUnificadasSerializer(serializers.ModelSerializer):
    """Serializer para a view unificada de carteirinhas"""

    is_carteirinha_principal = serializers.BooleanField(read_only=True)
    is_unimed = serializers.BooleanField(read_only=True)
    is_reciprocidade = serializers.BooleanField(read_only=True)
    numero_carteirinha_display = serializers.CharField(read_only=True)

    class Meta:
        model = OracleCarteirasUnificadas
        fields = '__all__'
```

### ViewSet e Endpoint

Adicione ao arquivo `backend/apps/oracle_integration/views.py`:

```python
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import OracleCarteirasUnificadas
from .serializers import OracleCarteirasUnificadasSerializer

class OracleCarteirasUnificadasViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para acesso à view unificada de carteirinhas Oracle
    Endpoints:
    - GET /api/oracle/carteirinhas-unificadas/ - Lista todas
    - GET /api/oracle/carteirinhas-unificadas/?cpf=12345678901 - Filtrar por CPF
    - GET /api/oracle/carteirinhas-unificadas/?tipo_carteira=UNIMED - Filtrar por tipo
    - GET /api/oracle/carteirinhas-unificadas/minhas_carteirinhas/ - Carteirinhas do usuário logado
    """
    queryset = OracleCarteirasUnificadas.objects.using('oracle').all()
    serializer_class = OracleCarteirasUnificadasSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo_carteira', 'nr_cpf', 'matricula_soul', 'prestador_rede']
    search_fields = ['nome_beneficiario', 'nr_cns', 'matricula']
    ordering_fields = ['tipo_carteira', 'nome_beneficiario', 'data_validade']
    ordering = ['tipo_carteira']

    @action(detail=False, methods=['get'])
    def minhas_carteirinhas(self, request):
        """Retorna todas as carteirinhas do beneficiário logado"""
        try:
            beneficiary = request.user.beneficiary
            cpf_number = int(beneficiary.cpf.replace('.', '').replace('-', ''))

            carteirinhas = self.queryset.filter(nr_cpf=cpf_number)

            # Agrupar por tipo
            resultado = {
                'total': carteirinhas.count(),
                'carteirinha_principal': [],
                'unimed': [],
                'reciprocidade': [],
            }

            for carteirinha in carteirinhas:
                serialized = self.get_serializer(carteirinha).data

                if carteirinha.is_carteirinha_principal:
                    resultado['carteirinha_principal'].append(serialized)
                elif carteirinha.is_unimed:
                    resultado['unimed'].append(serialized)
                elif carteirinha.is_reciprocidade:
                    resultado['reciprocidade'].append(serialized)

            return Response(resultado)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=500
            )

    @action(detail=False, methods=['get'])
    def estatisticas(self, request):
        """Retorna estatísticas gerais das carteirinhas"""
        from django.db.models import Count

        stats = self.queryset.values('tipo_carteira').annotate(
            total=Count('matricula_soul')
        ).order_by('-total')

        return Response({
            'por_tipo': list(stats),
            'total_geral': sum(item['total'] for item in stats)
        })
```

### URLs

Adicione ao arquivo `backend/apps/oracle_integration/urls.py`:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OracleCarteirasUnificadasViewSet

router = DefaultRouter()
router.register(r'carteirinhas-unificadas', OracleCarteirasUnificadasViewSet, basename='carteirinhas-unificadas')

urlpatterns = [
    path('', include(router.urls)),
]
```

## Uso na API REST

### Buscar minhas carteirinhas (usuário logado)

```http
GET /api/oracle/carteirinhas-unificadas/minhas_carteirinhas/
Authorization: Bearer {token}
```

Resposta:
```json
{
  "total": 3,
  "carteirinha_principal": [
    {
      "tipo_carteira": "CARTEIRINHA",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula": "0100082",
      "plano_nome": "E 2020 - Apartamento Standard",
      "segmentacao": "AMB+HOSP C/OBST",
      ...
    }
  ],
  "unimed": [
    {
      "tipo_carteira": "UNIMED",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula_rede": "12345678901234",
      "prestador_rede": "UNIMED",
      "abrangencia": "NACIONAL",
      ...
    }
  ],
  "reciprocidade": [
    {
      "tipo_carteira": "RECIPROCIDADE",
      "nome_beneficiario": "JOÃO SILVA",
      "matricula_rede": "03783816840000",
      "prestador_rede": "VIVEST",
      ...
    }
  ]
}
```

### Filtrar por tipo

```http
GET /api/oracle/carteirinhas-unificadas/?tipo_carteira=UNIMED
```

### Buscar por CPF

```http
GET /api/oracle/carteirinhas-unificadas/?nr_cpf=12345678901
```

### Estatísticas

```http
GET /api/oracle/carteirinhas-unificadas/estatisticas/
```

## Vantagens da View Unificada

### ✅ Simplicidade
- **Uma única query** em vez de 3 queries separadas
- **Estrutura uniforme** para todos os tipos de carteirinha
- **Fácil manutenção** do código cliente

### ✅ Performance
- **Menos roundtrips** ao banco de dados
- **Oracle otimiza** o UNION ALL internamente
- **Índices aproveitados** em cada parte do UNION

### ✅ Escalabilidade
- **Fácil adicionar** novos tipos de carteirinha
- **Campos comuns padronizados**
- **Extensível** sem quebrar código existente

### ✅ Usabilidade
- **Campo TIPO_CARTEIRA** identifica a origem
- **NULL explícito** para campos não aplicáveis
- **Queries simples** no Django

## Comparação: UNION ALL vs JOIN

### Abordagem UNION ALL (implementada)
```sql
SELECT campos FROM CARTEIRINHA WHERE ativo = 'S'
UNION ALL
SELECT campos FROM UNIMED WHERE ativo = 'S'
UNION ALL
SELECT campos FROM RECIPROCIDADE WHERE ativo = 'S'
```

**Vantagens:**
- Retorna um registro por carteirinha
- Total de registros = soma das 3 tabelas (~36,814)
- Estrutura simples e linear
- Fácil identificar origem (TIPO_CARTEIRA)

### Abordagem JOIN (alternativa)
```sql
SELECT * FROM CARTEIRINHA c
LEFT JOIN UNIMED u ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
LEFT JOIN RECIPROCIDADE r ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
```

**Desvantagens:**
- Retorna apenas beneficiários com carteirinha principal
- Beneficiários com apenas Unimed ou Reciprocidade são perdidos
- Estrutura mais larga (muitas colunas)
- Mais complexo de interpretar

## Considerações de Performance

### Índices Recomendados

Para melhor performance, certifique-se de que existem índices em:

```sql
-- ESAU_V_APP_CARTEIRINHA
CREATE INDEX IDX_CARTEIRINHA_CPF ON DBAPS.ESAU_V_APP_CARTEIRINHA(NR_CPF, SN_ATIVO);
CREATE INDEX IDX_CARTEIRINHA_SOUL ON DBAPS.ESAU_V_APP_CARTEIRINHA(MATRICULA_SOUL, SN_ATIVO);

-- ESAU_V_APP_UNIMED
CREATE INDEX IDX_UNIMED_CPF ON DBAPS.ESAU_V_APP_UNIMED(CPF, sn_ativo);
CREATE INDEX IDX_UNIMED_SOUL ON DBAPS.ESAU_V_APP_UNIMED(MATRICULA_SOUL, sn_ativo);

-- ESAU_V_APP_RECIPROCIDADE
CREATE INDEX IDX_RECIPROCIDADE_CPF ON DBAPS.ESAU_V_APP_RECIPROCIDADE(NR_CPF, SN_ATIVO);
CREATE INDEX IDX_RECIPROCIDADE_SOUL ON DBAPS.ESAU_V_APP_RECIPROCIDADE(MATRICULA_SOUL, SN_ATIVO);
```

### Cache (Django)

```python
from django.core.cache import cache

def get_carteirinhas_beneficiario(cpf):
    cache_key = f'oracle_carteirinhas_{cpf}'
    carteirinhas = cache.get(cache_key)

    if not carteirinhas:
        carteirinhas = OracleCarteirasUnificadas.objects.using('oracle').filter(
            nr_cpf=cpf
        ).values()
        cache.set(cache_key, list(carteirinhas), 3600)  # 1 hora

    return carteirinhas
```

## Troubleshooting

### Erro: ORA-00942: table or view does not exist

**Solução:** Verificar se a view foi criada no schema correto (DBAPS)

```sql
SELECT * FROM ALL_VIEWS WHERE VIEW_NAME = 'ESAU_V_APP_CARTEIRAS_UNIFICADAS';
```

### Erro: Contagem não bate

**Solução:** Verificar filtro SN_ATIVO em cada tabela fonte

```sql
-- Verificar contagens individuais
SELECT 'CARTEIRINHA' AS FONTE, COUNT(*) FROM DBAPS.ESAU_V_APP_CARTEIRINHA WHERE SN_ATIVO = 'S'
UNION ALL
SELECT 'UNIMED', COUNT(*) FROM DBAPS.ESAU_V_APP_UNIMED WHERE sn_ativo = 'S'
UNION ALL
SELECT 'RECIPROCIDADE', COUNT(*) FROM DBAPS.ESAU_V_APP_RECIPROCIDADE WHERE SN_ATIVO = 'S';
```

### Performance lenta

**Solução:** Verificar plano de execução

```sql
EXPLAIN PLAN FOR
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE NR_CPF = 12345678901;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

## Próximos Passos

1. ✅ Criar a view no Oracle (oracle_unified_cards_view.sql)
2. [ ] Adicionar modelo Django (OracleCarteirasUnificadas)
3. [ ] Criar serializer e viewset
4. [ ] Configurar URLs da API
5. [ ] Adicionar testes unitários
6. [ ] Criar endpoint RTK Query no mobile
7. [ ] Atualizar tela de carteirinha no app mobile
8. [ ] Documentar API no Swagger/OpenAPI
9. [ ] Configurar cache
10. [ ] Monitorar performance

## Recursos Adicionais

- [Documentação Oracle UNION](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/The-UNION-ALL-INTERSECT-MINUS-Operators.html)
- [Django Multi-Database Support](https://docs.djangoproject.com/en/4.2/topics/db/multi-db/)
- [DRF ViewSets](https://www.django-rest-framework.org/api-guide/viewsets/)

---

**Criado em:** 2025-11-17
**Autor:** Elosaúde Platform Team
**Versão:** 1.0
