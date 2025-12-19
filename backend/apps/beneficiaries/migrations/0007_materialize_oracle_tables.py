# Migration to materialize Oracle foreign tables into native PostgreSQL tables
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('beneficiaries', '0006_update_carteiras_unificadas_view'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- ================================================================
            -- Materializar dados do Oracle em tabelas nativas PostgreSQL
            -- ================================================================

            -- Drop view que depende das tabelas
            DROP VIEW IF EXISTS v_app_carteiras_unificadas;
            DROP VIEW IF EXISTS public.v_app_carteiras_unificadas;
            DROP VIEW IF EXISTS app_schema.v_app_carteiras_unificadas;

            -- ================================================================
            -- 1. CARTEIRINHA - Criar tabela nativa no schema public
            -- ================================================================
            CREATE TABLE public.esau_v_app_carteirinha AS
            SELECT * FROM app_schema.esau_v_app_carteirinha;

            CREATE INDEX idx_carteirinha_cpf ON public.esau_v_app_carteirinha(nr_cpf);
            CREATE INDEX idx_carteirinha_matricula_soul ON public.esau_v_app_carteirinha(matricula_soul);
            CREATE INDEX idx_carteirinha_ativo ON public.esau_v_app_carteirinha(sn_ativo);

            -- Remover foreign table do app_schema
            DROP FOREIGN TABLE IF EXISTS app_schema.esau_v_app_carteirinha CASCADE;

            -- ================================================================
            -- 2. UNIMED - Criar tabela nativa no schema public
            -- ================================================================
            CREATE TABLE public.esau_v_app_unimed AS
            SELECT * FROM app_schema.esau_v_app_unimed;

            CREATE INDEX idx_unimed_cpf ON public.esau_v_app_unimed(cpf);
            CREATE INDEX idx_unimed_matricula_soul ON public.esau_v_app_unimed(matricula_soul);
            CREATE INDEX idx_unimed_ativo ON public.esau_v_app_unimed(sn_ativo);

            DROP FOREIGN TABLE IF EXISTS app_schema.esau_v_app_unimed CASCADE;

            -- ================================================================
            -- 3. RECIPROCIDADE - Criar tabela nativa no schema public
            -- ================================================================
            CREATE TABLE public.esau_v_app_reciprocidade AS
            SELECT * FROM app_schema.esau_v_app_reciprocidade;

            DROP FOREIGN TABLE IF EXISTS app_schema.esau_v_app_reciprocidade CASCADE;

            CREATE INDEX idx_reciprocidade_cpf ON public.esau_v_app_reciprocidade(nr_cpf);
            CREATE INDEX idx_reciprocidade_matricula_soul ON public.esau_v_app_reciprocidade(matricula_soul);
            CREATE INDEX idx_reciprocidade_ativo ON public.esau_v_app_reciprocidade(sn_ativo);

            -- ================================================================
            -- 4. Recriar VIEW unificada usando tabelas nativas (no schema public)
            -- ================================================================
            CREATE VIEW public.v_app_carteiras_unificadas AS

            -- CARTEIRINHA PRINCIPAL
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
                NULL::TEXT AS matricula_rede,
                NULL::TEXT AS prestador_rede,
                NULL::DATE AS data_adesao,
                NULL::TEXT AS abrangencia,
                NULL::TEXT AS acomodacao,
                NULL::TEXT AS rede_atendimento
            FROM public.esau_v_app_carteirinha
            WHERE sn_ativo = 'S'

            UNION ALL

            -- UNIMED
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
                matricula_unimed AS matricula_rede,
                'UNIMED' AS prestador_rede,
                vigencia AS data_adesao,
                abrangencia,
                acomodacao,
                rede_atendimento
            FROM public.esau_v_app_unimed
            WHERE sn_ativo = 'S'

            UNION ALL

            -- RECIPROCIDADE
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
                cd_matricula_reciprocidade AS matricula_rede,
                prestador_reciprocidade AS prestador_rede,
                dt_adesao AS data_adesao,
                NULL::TEXT AS abrangencia,
                NULL::TEXT AS acomodacao,
                NULL::TEXT AS rede_atendimento
            FROM public.esau_v_app_reciprocidade
            WHERE sn_ativo = 'S';

            COMMENT ON VIEW public.v_app_carteiras_unificadas IS
            'View unificada das carteirinhas. Dados materializados do Oracle para PostgreSQL nativo.';
            """,
            reverse_sql="""
            DROP VIEW IF EXISTS public.v_app_carteiras_unificadas;
            DROP TABLE IF EXISTS public.esau_v_app_carteirinha CASCADE;
            DROP TABLE IF EXISTS public.esau_v_app_unimed CASCADE;
            DROP TABLE IF EXISTS public.esau_v_app_reciprocidade CASCADE;
            """
        ),
    ]
