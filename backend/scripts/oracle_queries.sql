-- ============================================================================
-- ORACLE DATABASE - SQL QUERIES REFERENCE
-- Database: 192.168.40.29:1521/SIML
-- Schema: DBAPS
-- Date: 2025-11-12
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BASIC QUERIES - Get All Cards for a Beneficiary
-- ----------------------------------------------------------------------------

-- Get all cards by CPF
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE NR_CPF = 347140904
AND SN_ATIVO = 'S'
ORDER BY CD_PLANO;

-- Get all cards by MATRICULA_SOUL (recommended)
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE MATRICULA_SOUL = 40650006
ORDER BY CD_PLANO;

-- Get active Unimed cards by CPF
SELECT * FROM DBAPS.ESAU_V_APP_UNIMED
WHERE CPF = 347140904
AND sn_ativo = 'S';

-- Get active reciprocity cards by CPF
SELECT * FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE NR_CPF = 347140904
AND SN_ATIVO = 'S';

-- ----------------------------------------------------------------------------
-- 2. JOINED QUERIES - Complete Beneficiary Card Information
-- ----------------------------------------------------------------------------

-- Join all 3 views for a complete beneficiary profile
SELECT
    c.MATRICULA_SOUL,
    c.NR_CPF,
    c.NOME_DO_BENEFICIARIO,
    c.NASCTO,
    c.NR_CNS,
    c.MATRICULA AS MATRICULA_ELOSAUDE,
    c.PRIMARIO AS PLANO_PRIMARIO,
    c.SEGMENTACAO,
    c.EMPRESA,
    u.MATRICULA_UNIMED,
    u.PLANO AS UNIMED_PLANO,
    u.ABRANGENCIA,
    u.ACOMODACAO,
    u.Validade AS UNIMED_VALIDADE,
    r.CD_MATRICULA_RECIPROCIDADE,
    r.PRESTADOR_RECIPROCIDADE,
    r.PLANO_ELOSAUDE,
    r.DT_VALIDADE_CARTEIRA AS RECIPROCIDADE_VALIDADE,
    CASE
        WHEN u.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_UNIMED,
    CASE
        WHEN r.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_RECIPROCIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED u
    ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
    AND c.CONTRATO = u.CONTRATO
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE r
    ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
    AND c.CONTRATO = r.CONTRATO
WHERE c.SN_ATIVO = 'S'
AND c.NR_CPF = 347140904
ORDER BY c.CD_PLANO;

-- ----------------------------------------------------------------------------
-- 3. UNIFIED VIEW - Create View Combining All 3 Sources
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW DBAPS.ESAU_V_APP_UNIFIED AS
SELECT
    -- Carteirinha columns (V1)
    v1.CONTRATO,
    v1.MATRICULA_SOUL,
    v1.NR_CPF,
    v1.EMPRESA,
    v1.NOME_DO_BENEFICIARIO,
    v1.MATRICULA,
    v1.CD_PLANO,
    v1.PRIMARIO,
    v1.SECUNDARIO,
    v1.TERCIARIO,
    v1.SEGMENTACAO,
    v1.NR_CNS,
    v1.NASCTO,
    v1.CONTRATACAO,
    v1.VALIDADE AS V1_VALIDADE,
    v1.CPT,
    v1.LAYOUT,
    v1.NM_SOCIAL,
    v1.NOME_TITULAR,
    v1.SN_ATIVO AS CARTEIRINHA_ATIVO,
    -- Unimed columns (V2)
    v2.MATRICULA_UNIMED,
    v2.PLANO AS UNIMED_PLANO,
    v2.ABRANGENCIA,
    v2.ACOMODACAO,
    v2.Rede_Atendimento,
    v2.Validade AS UNIMED_VALIDADE,
    v2.Vigencia AS UNIMED_VIGENCIA,
    v2.sn_ativo AS UNIMED_ATIVO,
    -- Reciprocidade columns (V3)
    v3.CD_MATRICULA_RECIPROCIDADE,
    v3.PRESTADOR_RECIPROCIDADE,
    v3.PLANO_ELOSAUDE,
    v3.DT_ADESAO AS RECIPROCIDADE_ADESAO,
    v3.DT_VALIDADE_CARTEIRA AS RECIPROCIDADE_VALIDADE,
    v3.SN_ATIVO AS RECIPROCIDADE_ATIVO,
    -- Computed fields
    CASE
        WHEN v2.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_UNIMED,
    CASE
        WHEN v3.MATRICULA_SOUL IS NOT NULL THEN 'S'
        ELSE 'N'
    END AS TEM_RECIPROCIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRINHA v1
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED v2
    ON v1.MATRICULA_SOUL = v2.MATRICULA_SOUL
    AND v1.CONTRATO = v2.CONTRATO
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE v3
    ON v1.MATRICULA_SOUL = v3.MATRICULA_SOUL
    AND v1.CONTRATO = v3.CONTRATO
WHERE v1.SN_ATIVO = 'S';

-- Query the unified view
SELECT * FROM DBAPS.ESAU_V_APP_UNIFIED
WHERE NR_CPF = 347140904
ORDER BY MATRICULA_SOUL, CD_PLANO;

-- ----------------------------------------------------------------------------
-- 4. STATISTICS & ANALYSIS QUERIES
-- ----------------------------------------------------------------------------

-- Count total active beneficiaries
SELECT COUNT(DISTINCT MATRICULA_SOUL) AS TOTAL_BENEFICIARIOS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S';

-- Count cards by plan type
SELECT
    CD_PLANO,
    PRIMARIO AS PLANO_NOME,
    SEGMENTACAO,
    COUNT(*) AS TOTAL_CARTEIRAS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY CD_PLANO, PRIMARIO, SEGMENTACAO
ORDER BY TOTAL_CARTEIRAS DESC;

-- Count by company/employer
SELECT
    EMPRESA,
    COUNT(DISTINCT MATRICULA_SOUL) AS TOTAL_BENEFICIARIOS,
    COUNT(*) AS TOTAL_CARTEIRAS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY EMPRESA
ORDER BY TOTAL_BENEFICIARIOS DESC;

-- Count reciprocity by provider
SELECT
    PRESTADOR_RECIPROCIDADE,
    COUNT(DISTINCT MATRICULA_SOUL) AS TOTAL_BENEFICIARIOS
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE SN_ATIVO = 'S'
GROUP BY PRESTADOR_RECIPROCIDADE
ORDER BY TOTAL_BENEFICIARIOS DESC;

-- ----------------------------------------------------------------------------
-- 5. BENEFICIARIES WITH MULTIPLE PLANS
-- ----------------------------------------------------------------------------

-- Find beneficiaries with multiple plan types
SELECT
    NR_CPF,
    NOME_DO_BENEFICIARIO,
    COUNT(*) AS TOTAL_PLANOS,
    LISTAGG(PRIMARIO, ' | ') WITHIN GROUP (ORDER BY CD_PLANO) AS PLANOS_LISTA
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY NR_CPF, NOME_DO_BENEFICIARIO
HAVING COUNT(*) > 1
ORDER BY TOTAL_PLANOS DESC;

-- Beneficiaries with medical + dental plans
SELECT
    c1.NR_CPF,
    c1.NOME_DO_BENEFICIARIO,
    c1.PRIMARIO AS PLANO_MEDICO,
    c2.PRIMARIO AS PLANO_ODONTO
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c1
INNER JOIN DBAPS.ESAU_V_APP_CARTEIRINHA c2
    ON c1.MATRICULA_SOUL = c2.MATRICULA_SOUL
WHERE c1.SN_ATIVO = 'S'
AND c2.SN_ATIVO = 'S'
AND c1.SEGMENTACAO LIKE '%HOSP%'
AND c2.SEGMENTACAO = 'ODONT'
ORDER BY c1.NOME_DO_BENEFICIARIO;

-- ----------------------------------------------------------------------------
-- 6. DEPENDENT IDENTIFICATION
-- ----------------------------------------------------------------------------

-- Find all dependents (where NOME_TITULAR != NOME_DO_BENEFICIARIO)
SELECT
    NOME_TITULAR,
    NOME_DO_BENEFICIARIO,
    NR_CPF,
    NASCTO,
    MATRICULA,
    PRIMARIO
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND NOME_TITULAR IS NOT NULL
AND NOME_TITULAR != NOME_DO_BENEFICIARIO
ORDER BY NOME_TITULAR, NOME_DO_BENEFICIARIO;

-- Count dependents by titular
SELECT
    NOME_TITULAR,
    COUNT(*) AS TOTAL_DEPENDENTES
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND NOME_TITULAR IS NOT NULL
AND NOME_TITULAR != NOME_DO_BENEFICIARIO
GROUP BY NOME_TITULAR
HAVING COUNT(*) > 0
ORDER BY TOTAL_DEPENDENTES DESC;

-- ----------------------------------------------------------------------------
-- 7. VALIDITY & EXPIRATION QUERIES
-- ----------------------------------------------------------------------------

-- Reciprocity cards expiring soon (next 90 days)
SELECT
    NOME_BENEFICIARIO,
    NR_CPF,
    PRESTADOR_RECIPROCIDADE,
    CD_MATRICULA_RECIPROCIDADE,
    DT_VALIDADE_CARTEIRA,
    TRUNC(DT_VALIDADE_CARTEIRA - SYSDATE) AS DIAS_ATE_VENCIMENTO
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE SN_ATIVO = 'S'
AND DT_VALIDADE_CARTEIRA BETWEEN SYSDATE AND SYSDATE + 90
ORDER BY DT_VALIDADE_CARTEIRA;

-- Unimed cards by validity status
SELECT
    CASE
        WHEN Validade >= SYSDATE THEN 'VALIDA'
        WHEN Validade < SYSDATE THEN 'VENCIDA'
        ELSE 'SEM_VALIDADE'
    END AS STATUS_VALIDADE,
    COUNT(*) AS TOTAL_CARTEIRAS
FROM DBAPS.ESAU_V_APP_UNIMED
WHERE sn_ativo = 'S'
GROUP BY
    CASE
        WHEN Validade >= SYSDATE THEN 'VALIDA'
        WHEN Validade < SYSDATE THEN 'VENCIDA'
        ELSE 'SEM_VALIDADE'
    END;

-- ----------------------------------------------------------------------------
-- 8. DATA QUALITY CHECKS
-- ----------------------------------------------------------------------------

-- Find records with missing critical data
SELECT
    'Missing CPF' AS ISSUE,
    COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND NR_CPF IS NULL
UNION ALL
SELECT
    'Missing Birth Date' AS ISSUE,
    COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND NASCTO IS NULL
UNION ALL
SELECT
    'Missing CNS' AS ISSUE,
    COUNT(*) AS TOTAL
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND NR_CNS IS NULL;

-- Find duplicate MATRICULA_SOUL (should be unique per beneficiary)
SELECT
    MATRICULA_SOUL,
    COUNT(*) AS TOTAL_REGISTROS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY MATRICULA_SOUL
HAVING COUNT(*) > 1
ORDER BY TOTAL_REGISTROS DESC;

-- ----------------------------------------------------------------------------
-- 9. NETWORK COVERAGE QUERIES
-- ----------------------------------------------------------------------------

-- Beneficiaries with all 3 card types
SELECT
    c.MATRICULA_SOUL,
    c.NOME_DO_BENEFICIARIO,
    c.MATRICULA AS CARTEIRINHA_MATRICULA,
    u.MATRICULA_UNIMED,
    r.CD_MATRICULA_RECIPROCIDADE,
    r.PRESTADOR_RECIPROCIDADE
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
INNER JOIN DBAPS.ESAU_V_APP_UNIMED u
    ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
INNER JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE r
    ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
WHERE c.SN_ATIVO = 'S'
AND u.sn_ativo = 'S'
AND r.SN_ATIVO = 'S';

-- Count coverage combinations
SELECT
    CASE WHEN u.MATRICULA_SOUL IS NOT NULL THEN 'Sim' ELSE 'Não' END AS TEM_UNIMED,
    CASE WHEN r.MATRICULA_SOUL IS NOT NULL THEN 'Sim' ELSE 'Não' END AS TEM_RECIPROCIDADE,
    COUNT(DISTINCT c.MATRICULA_SOUL) AS TOTAL_BENEFICIARIOS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED u
    ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
    AND u.sn_ativo = 'S'
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE r
    ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
    AND r.SN_ATIVO = 'S'
WHERE c.SN_ATIVO = 'S'
GROUP BY
    CASE WHEN u.MATRICULA_SOUL IS NOT NULL THEN 'Sim' ELSE 'Não' END,
    CASE WHEN r.MATRICULA_SOUL IS NOT NULL THEN 'Sim' ELSE 'Não' END
ORDER BY TOTAL_BENEFICIARIOS DESC;

-- ----------------------------------------------------------------------------
-- 10. SYNCHRONIZATION SUPPORT QUERIES
-- ----------------------------------------------------------------------------

-- Get all active beneficiaries for initial sync
SELECT
    MATRICULA_SOUL,
    NR_CPF,
    NOME_DO_BENEFICIARIO,
    NASCTO,
    NR_CNS,
    NM_SOCIAL,
    EMPRESA,
    CONTRATO,
    MIN(CD_PLANO) AS PLANO_PRINCIPAL
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
GROUP BY
    MATRICULA_SOUL,
    NR_CPF,
    NOME_DO_BENEFICIARIO,
    NASCTO,
    NR_CNS,
    NM_SOCIAL,
    EMPRESA,
    CONTRATO
ORDER BY MATRICULA_SOUL;

-- Get changes since last sync (requires timestamp column - not available in current views)
-- This would require a modification to the views or querying base tables
-- Example if timestamp existed:
/*
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND LAST_UPDATE_DATE > TO_DATE('2025-11-11', 'YYYY-MM-DD')
ORDER BY LAST_UPDATE_DATE;
*/

-- ----------------------------------------------------------------------------
-- 11. TESTING & DEVELOPMENT QUERIES
-- ----------------------------------------------------------------------------

-- Get sample records for testing (limit 10)
SELECT * FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
AND ROWNUM <= 10
ORDER BY MATRICULA_SOUL;

-- Get diverse sample data (different companies, plans, types)
SELECT * FROM (
    SELECT
        c.*,
        ROW_NUMBER() OVER (PARTITION BY EMPRESA, CD_PLANO ORDER BY MATRICULA_SOUL) AS RN
    FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
    WHERE SN_ATIVO = 'S'
)
WHERE RN = 1
AND ROWNUM <= 20;

-- Test join performance
SELECT COUNT(*)
FROM DBAPS.ESAU_V_APP_CARTEIRINHA c
LEFT JOIN DBAPS.ESAU_V_APP_UNIMED u ON c.MATRICULA_SOUL = u.MATRICULA_SOUL
LEFT JOIN DBAPS.ESAU_V_APP_RECIPROCIDADE r ON c.MATRICULA_SOUL = r.MATRICULA_SOUL
WHERE c.SN_ATIVO = 'S';

-- ----------------------------------------------------------------------------
-- 12. METADATA QUERIES
-- ----------------------------------------------------------------------------

-- Get column information for CARTEIRINHA view
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    DATA_LENGTH,
    NULLABLE
FROM ALL_TAB_COLUMNS
WHERE OWNER = 'DBAPS'
AND TABLE_NAME = 'ESAU_V_APP_CARTEIRINHA'
ORDER BY COLUMN_ID;

-- Get row counts for all 3 views
SELECT 'CARTEIRINHA' AS VIEW_NAME, COUNT(*) AS TOTAL_ROWS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
UNION ALL
SELECT 'UNIMED' AS VIEW_NAME, COUNT(*) AS TOTAL_ROWS
FROM DBAPS.ESAU_V_APP_UNIMED
UNION ALL
SELECT 'RECIPROCIDADE' AS VIEW_NAME, COUNT(*) AS TOTAL_ROWS
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE;

-- Get active counts for all 3 views
SELECT 'CARTEIRINHA' AS VIEW_NAME, COUNT(*) AS ACTIVE_ROWS
FROM DBAPS.ESAU_V_APP_CARTEIRINHA
WHERE SN_ATIVO = 'S'
UNION ALL
SELECT 'UNIMED' AS VIEW_NAME, COUNT(*) AS ACTIVE_ROWS
FROM DBAPS.ESAU_V_APP_UNIMED
WHERE sn_ativo = 'S'
UNION ALL
SELECT 'RECIPROCIDADE' AS VIEW_NAME, COUNT(*) AS ACTIVE_ROWS
FROM DBAPS.ESAU_V_APP_RECIPROCIDADE
WHERE SN_ATIVO = 'S';

-- ============================================================================
-- END OF ORACLE QUERIES REFERENCE
-- ============================================================================
