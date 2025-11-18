-- ================================================================
-- ESAU_V_APP_CARTEIRAS_UNIFICADAS
-- View unificada usando UNION ALL para consolidar as 3 tabelas
-- de carteirinhas em uma única estrutura
-- ================================================================
-- Criado em: 2025-11-17
-- Database: Oracle 192.168.40.29:1521/SIML
-- Schema: DBAPS
-- ================================================================

CREATE OR REPLACE VIEW DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS AS

-- ================================================================
-- PARTE 1: CARTEIRINHA PRINCIPAL (ESAU_V_APP_CARTEIRINHA)
-- Total de registros: ~17,192
-- ================================================================
SELECT
    'CARTEIRINHA' AS TIPO_CARTEIRA,
    CONTRATO,
    MATRICULA_SOUL,
    NR_CPF,
    NOME_DO_BENEFICIARIO AS NOME_BENEFICIARIO,
    MATRICULA,
    NR_CNS,
    NASCTO,
    NM_SOCIAL,
    SN_ATIVO,
    SEGMENTACAO,
    -- Campos específicos da carteirinha principal
    EMPRESA,
    CD_PLANO,
    PRIMARIO AS PLANO_NOME,
    SECUNDARIO AS PLANO_SECUNDARIO,
    TERCIARIO AS PLANO_TERCIARIO,
    CONTRATACAO AS TIPO_CONTRATACAO,
    VALIDADE AS DATA_VALIDADE,
    CPT,
    LAYOUT,
    NOME_TITULAR,
    -- Campos específicos de outras tabelas (NULL para esta)
    NULL AS MATRICULA_REDE,
    NULL AS PRESTADOR_REDE,
    NULL AS DATA_ADESAO,
    NULL AS ABRANGENCIA,
    NULL AS ACOMODACAO,
    NULL AS REDE_ATENDIMENTO
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'

UNION ALL

-- ================================================================
-- PARTE 2: REDE UNIMED (ESAU_V_APP_UNIMED)
-- Total de registros: ~12,831
-- ================================================================
SELECT
    'UNIMED' AS TIPO_CARTEIRA,
    CONTRATO,
    MATRICULA_SOUL,
    CPF AS NR_CPF,
    NOME_DO_BENEFICIARIO AS NOME_BENEFICIARIO,
    NULL AS MATRICULA,
    NR_CNS,
    nascto AS NASCTO,
    nm_social AS NM_SOCIAL,
    sn_ativo AS SN_ATIVO,
    SEGMENTACAO,
    -- Campos específicos da Unimed
    NULL AS EMPRESA,
    PLANO_BENEF AS CD_PLANO,
    PLANO AS PLANO_NOME,
    NULL AS PLANO_SECUNDARIO,
    NULL AS PLANO_TERCIARIO,
    contratante AS TIPO_CONTRATACAO,
    TO_CHAR(Validade, 'DD/MM/YYYY') AS DATA_VALIDADE,
    NULL AS CPT,
    NULL AS LAYOUT,
    nome_titular AS NOME_TITULAR,
    -- Campos específicos da Unimed
    MATRICULA_UNIMED AS MATRICULA_REDE,
    'UNIMED' AS PRESTADOR_REDE,
    TO_CHAR(Vigencia, 'DD/MM/YYYY') AS DATA_ADESAO,
    ABRANGENCIA,
    ACOMODACAO,
    Rede_Atendimento AS REDE_ATENDIMENTO
FROM DBAPS.ESAU_V_APP_UNIMED
WHERE sn_ativo = 'S'

UNION ALL

-- ================================================================
-- PARTE 3: RECIPROCIDADE (ESAU_V_APP_RECIPROCIDADE)
-- Total de registros: ~6,791
-- ================================================================
SELECT
    'RECIPROCIDADE' AS TIPO_CARTEIRA,
    CONTRATO,
    MATRICULA_SOUL,
    NR_CPF,
    NOME_BENEFICIARIO,
    MATRICULA,
    NR_CNS,
    NASCTO,
    NM_SOCIAL,
    SN_ATIVO,
    NULL AS SEGMENTACAO,
    -- Campos específicos da reciprocidade
    NULL AS EMPRESA,
    NULL AS CD_PLANO,
    PLANO_ELOSAUDE AS PLANO_NOME,
    NULL AS PLANO_SECUNDARIO,
    NULL AS PLANO_TERCIARIO,
    NULL AS TIPO_CONTRATACAO,
    TO_CHAR(DT_VALIDADE_CARTEIRA, 'DD/MM/YYYY') AS DATA_VALIDADE,
    NULL AS CPT,
    NULL AS LAYOUT,
    NULL AS NOME_TITULAR,
    -- Campos específicos da reciprocidade
    CD_MATRICULA_RECIPROCIDADE AS MATRICULA_REDE,
    PRESTADOR_RECIPROCIDADE AS PRESTADOR_REDE,
    TO_CHAR(DT_ADESAO, 'DD/MM/YYYY') AS DATA_ADESAO,
    NULL AS ABRANGENCIA,
    NULL AS ACOMODACAO,
    NULL AS REDE_ATENDIMENTO
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE SN_ATIVO = 'S';

-- ================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ================================================================
COMMENT ON TABLE DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS IS
'View unificada que consolida as 3 tabelas de carteirinhas (CARTEIRINHA, UNIMED, RECIPROCIDADE) usando UNION ALL.
Total estimado: ~36,814 registros (17,192 + 12,831 + 6,791)';

-- ================================================================
-- ESTRUTURA DE CAMPOS
-- ================================================================
/*
CAMPOS COMUNS (presentes em todas as 3 tabelas originais):
- TIPO_CARTEIRA: Identificador do tipo (CARTEIRINHA, UNIMED, RECIPROCIDADE)
- CONTRATO: ID do contrato
- MATRICULA_SOUL: ID único do beneficiário no sistema Soul
- NR_CPF: CPF do beneficiário
- NOME_BENEFICIARIO: Nome completo
- MATRICULA: Número de matrícula
- NR_CNS: Número do Cartão Nacional de Saúde
- NASCTO: Data de nascimento (formato DD/MM/YYYY)
- NM_SOCIAL: Nome social
- SN_ATIVO: Status ativo (S/N)
- SEGMENTACAO: Segmentação do plano

CAMPOS ESPECÍFICOS DE CARTEIRINHA PRINCIPAL:
- EMPRESA: Nome da empresa/empregador
- CD_PLANO: Código do plano
- PLANO_NOME: Nome do plano primário
- PLANO_SECUNDARIO: Plano secundário (se houver)
- PLANO_TERCIARIO: Plano terciário (se houver)
- TIPO_CONTRATACAO: Tipo de contratação
- DATA_VALIDADE: Data de validade
- CPT: Indicador CPT
- LAYOUT: Tipo de layout da carteira
- NOME_TITULAR: Nome do titular (se for dependente)

CAMPOS ESPECÍFICOS DE REDE (UNIMED/RECIPROCIDADE):
- MATRICULA_REDE: Matrícula na rede (Unimed ou Reciprocidade)
- PRESTADOR_REDE: Nome do prestador da rede
- DATA_ADESAO: Data de adesão à rede
- ABRANGENCIA: Abrangência da cobertura (apenas Unimed)
- ACOMODACAO: Tipo de acomodação (apenas Unimed)
- REDE_ATENDIMENTO: Rede de atendimento (apenas Unimed)

OBSERVAÇÕES:
1. Campos não aplicáveis em cada seção são preenchidos com NULL
2. Datas do tipo DATE são convertidas para VARCHAR usando TO_CHAR
3. Apenas registros ativos (SN_ATIVO = 'S') são incluídos
4. TIPO_CARTEIRA identifica a origem de cada registro
5. MATRICULA_SOUL é a chave de join recomendada para relacionar com outras tabelas
*/

-- ================================================================
-- EXEMPLOS DE QUERIES
-- ================================================================

-- Exemplo 1: Buscar todas as carteirinhas de um beneficiário por CPF
/*
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE NR_CPF = 347140904
ORDER BY TIPO_CARTEIRA, MATRICULA_SOUL;
*/

-- Exemplo 2: Buscar todas as carteirinhas de um beneficiário por MATRICULA_SOUL
/*
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE MATRICULA_SOUL = 40650006
ORDER BY TIPO_CARTEIRA;
*/

-- Exemplo 3: Contar carteirinhas por tipo
/*
SELECT
    TIPO_CARTEIRA,
    COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY TIPO_CARTEIRA
ORDER BY TOTAL DESC;
*/

-- Exemplo 4: Beneficiários com múltiplos tipos de carteirinha
/*
SELECT
    MATRICULA_SOUL,
    NOME_BENEFICIARIO,
    NR_CPF,
    COUNT(DISTINCT TIPO_CARTEIRA) AS TOTAL_TIPOS,
    LISTAGG(TIPO_CARTEIRA, ', ') WITHIN GROUP (ORDER BY TIPO_CARTEIRA) AS TIPOS
FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
GROUP BY MATRICULA_SOUL, NOME_BENEFICIARIO, NR_CPF
HAVING COUNT(DISTINCT TIPO_CARTEIRA) > 1
ORDER BY TOTAL_TIPOS DESC;
*/

-- Exemplo 5: Buscar por prestador de reciprocidade
/*
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS
WHERE TIPO_CARTEIRA = 'RECIPROCIDADE'
AND PRESTADOR_REDE = 'VIVEST'
ORDER BY NOME_BENEFICIARIO;
*/
