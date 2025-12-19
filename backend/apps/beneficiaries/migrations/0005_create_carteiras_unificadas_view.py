# Generated migration to create unified cards view
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('beneficiaries', '0004_delete_digitalcard'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- ================================================================
            -- VIEW: v_app_carteiras_unificadas
            -- View unificada para carteirinhas dos beneficiários
            -- Adaptada do Oracle para PostgreSQL
            -- ================================================================

            CREATE OR REPLACE VIEW v_app_carteiras_unificadas AS
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
                -- Campos específicos da carteirinha principal
                c.name AS empresa,
                hp.id AS cd_plano,
                hp.name AS plano_nome,
                NULL AS plano_secundario,
                NULL AS plano_terciario,
                b.beneficiary_type AS tipo_contratacao,
                NULL AS data_validade,
                NULL AS cpt,
                NULL AS layout,
                CASE
                    WHEN b.beneficiary_type = 'DEPENDENT' AND b.titular_id IS NOT NULL
                    THEN (SELECT full_name FROM beneficiaries_beneficiary WHERE id = b.titular_id)
                    ELSE NULL
                END AS nome_titular,
                -- Campos específicos de rede (NULL para carteirinha principal)
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

            -- ================================================================
            -- COMENTÁRIO DA VIEW
            -- ================================================================
            COMMENT ON VIEW v_app_carteiras_unificadas IS
            'View unificada que consolida as carteirinhas dos beneficiários.
            Adaptada da view Oracle ESAU_V_APP_CARTEIRAS_UNIFICADAS para PostgreSQL.
            Campos mapeados do modelo Beneficiary do Django.';
            """,
            reverse_sql="DROP VIEW IF EXISTS v_app_carteiras_unificadas;"
        ),
    ]
