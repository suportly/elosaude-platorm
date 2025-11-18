from django.apps import AppConfig
import oracledb


class OracleIntegrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.oracle_integration'
    verbose_name = 'Oracle Integration'

    def ready(self):
        """Initialize Oracle thick mode when app is ready"""
        try:
            # Initialize thick mode with Oracle Instant Client
            oracle_client_path = '/opt/oracle/instantclient_21_7'
            oracledb.init_oracle_client(lib_dir=oracle_client_path)
            print(f"✓ Oracle thick mode initialized: {oracle_client_path}")
        except Exception as e:
            # Already initialized or not needed
            if 'already been initialized' not in str(e):
                print(f"ℹ Oracle thick mode: {e}")
