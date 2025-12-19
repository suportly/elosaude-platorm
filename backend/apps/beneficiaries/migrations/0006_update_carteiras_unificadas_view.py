# Generated migration to update unified cards view with real tables
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('beneficiaries', '0005_create_carteiras_unificadas_view'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- ================================================================
            -- VIEW: v_app_carteiras_unificadas
            -- View unificada usando UNION ALL para consolidar as 3 tabelas
            -- de carteirinhas em uma única estrutura
            -- ================================================================
            -- Atualizada para usar as tabelas reais migradas do Oracle
            -- ================================================================

            DROP VIEW IF EXISTS v_app_carteiras_unificadas;

            CREATE VIEW v_app_carteiras_unificadas AS

            -- ================================================================
            -- PARTE 1: CARTEIRINHA PRINCIPAL (esau_v_app_carteirinha)
            -- ================================================================
            SELECT
                'CARTEIRINHA' AS tipo_carteira,
                contrato,
                matricula_soul,
                nr_cpf,
                nome_do_beneficiario AS nome_beneficiario,
                matricula,
                nr_cns,
                nascto,
                nm_social,
                sn_ativo,
                segmentacao,
                -- Campos específicos da carteirinha principal
                empresa,
                cd_plano,
                primario AS plano_nome,
                secundario AS plano_secundario,
                terciario AS plano_terciario,
                contratacao AS tipo_contratacao,
                validade AS data_validade,
                cpt,
                layout,
                nome_titular,
                -- Campos específicos de rede (NULL para esta)
                NULL::TEXT AS matricula_rede,
                NULL::TEXT AS prestador_rede,
                NULL::DATE AS data_adesao,
                NULL::TEXT AS abrangencia,
                NULL::TEXT AS acomodacao,
                NULL::TEXT AS rede_atendimento
            FROM esau_v_app_carteirinha
            WHERE sn_ativo = 'S'

            UNION ALL

            -- ================================================================
            -- PARTE 2: REDE UNIMED (esau_v_app_unimed)
            -- ================================================================
            SELECT
                'UNIMED' AS tipo_carteira,
                contrato,
                matricula_soul,
                cpf AS nr_cpf,
                nome_do_beneficiario AS nome_beneficiario,
                NULL::VARCHAR AS matricula,
                nr_cns,
                nascto,
                nm_social,
                sn_ativo,
                segmentacao,
                -- Campos específicos da Unimed
                NULL::VARCHAR AS empresa,
                plano_benef AS cd_plano,
                plano AS plano_nome,
                NULL::VARCHAR AS plano_secundario,
                NULL::VARCHAR AS plano_terciario,
                contratante AS tipo_contratacao,
                TO_CHAR(validade, 'DD/MM/YYYY') AS data_validade,
                NULL::VARCHAR AS cpt,
                NULL::VARCHAR AS layout,
                nome_titular,
                -- Campos específicos da Unimed
                matricula_unimed AS matricula_rede,
                'UNIMED' AS prestador_rede,
                vigencia AS data_adesao,
                abrangencia,
                acomodacao,
                rede_atendimento
            FROM esau_v_app_unimed
            WHERE sn_ativo = 'S'

            UNION ALL

            -- ================================================================
            -- PARTE 3: RECIPROCIDADE (esau_v_app_reciprocidade)
            -- ================================================================
            SELECT
                'RECIPROCIDADE' AS tipo_carteira,
                contrato,
                matricula_soul,
                nr_cpf,
                nome_beneficiario,
                matricula,
                nr_cns,
                nascto,
                nm_social,
                sn_ativo,
                NULL::VARCHAR AS segmentacao,
                -- Campos específicos da reciprocidade
                NULL::VARCHAR AS empresa,
                NULL::NUMERIC AS cd_plano,
                plano_elosaude AS plano_nome,
                NULL::VARCHAR AS plano_secundario,
                NULL::VARCHAR AS plano_terciario,
                NULL::VARCHAR AS tipo_contratacao,
                TO_CHAR(dt_validade_carteira, 'DD/MM/YYYY') AS data_validade,
                NULL::VARCHAR AS cpt,
                NULL::VARCHAR AS layout,
                NULL::VARCHAR AS nome_titular,
                -- Campos específicos da reciprocidade
                cd_matricula_reciprocidade AS matricula_rede,
                prestador_reciprocidade AS prestador_rede,
                dt_adesao AS data_adesao,
                NULL::TEXT AS abrangencia,
                NULL::TEXT AS acomodacao,
                NULL::TEXT AS rede_atendimento
            FROM esau_v_app_reciprocidade
            WHERE sn_ativo = 'S';

            -- ================================================================
            -- COMENTÁRIO DA VIEW
            -- ================================================================
            COMMENT ON VIEW v_app_carteiras_unificadas IS
            'View unificada que consolida as 3 tabelas de carteirinhas (CARTEIRINHA, UNIMED, RECIPROCIDADE) usando UNION ALL.
            Migrada do Oracle DBAPS.ESAU_V_APP_CARTEIRAS_UNIFICADAS para PostgreSQL.';
            """,
            reverse_sql="""
            DROP VIEW IF EXISTS v_app_carteiras_unificadas;

            CREATE VIEW v_app_carteiras_unificadas AS
            SELECT
                'CARTEIRINHA' AS tipo_carteira,
                c.id AS contrato,
                b.id AS matricula_soul,
                b.cpf AS nr_cpf,
                b.full_name AS nome_beneficiario,
                b.registration_number AS matricula,
                NULL AS nr_cns,
                b.birth_date AS nascto,
                NULL AS nm_social,
                CASE WHEN b.status = 'ACTIVE' THEN 'S' ELSE 'N' END AS sn_ativo,
                hp.plan_type AS segmentacao,
                c.name AS empresa,
                hp.id AS cd_plano,
                hp.name AS plano_nome,
                NULL AS plano_secundario,
                NULL AS plano_terciario,
                b.beneficiary_type AS tipo_contratacao,
                NULL AS data_validade,
                NULL AS cpt,
                NULL AS layout,
                NULL AS nome_titular,
                NULL AS matricula_rede,
                NULL AS prestador_rede,
                b.enrollment_date AS data_adesao,
                NULL AS abrangencia,
                NULL AS acomodacao,
                NULL AS rede_atendimento
            FROM beneficiaries_beneficiary b
            INNER JOIN beneficiaries_company c ON b.company_id = c.id
            INNER JOIN beneficiaries_healthplan hp ON b.health_plan_id = hp.id
            WHERE b.status = 'ACTIVE';
            """
        ),
    ]
