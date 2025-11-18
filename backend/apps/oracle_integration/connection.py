"""
Oracle Database Connection Manager
Direct connection to Oracle using oracledb instead of Django ORM
"""
import oracledb
from django.conf import settings


class OracleConnection:
    """Singleton Oracle connection manager"""

    _connection = None
    _pool = None

    @classmethod
    def get_connection(cls):
        """Get or create Oracle connection"""
        if cls._connection is None or not cls._connection.ping():
            cls._connection = cls._create_connection()
        return cls._connection

    @classmethod
    def _create_connection(cls):
        """Create new Oracle connection"""
        # Initialize thick mode
        try:
            oracledb.init_oracle_client(lib_dir='/opt/oracle/instantclient_21_7')
        except Exception:
            pass  # Already initialized

        # Get Oracle config from settings
        oracle_config = settings.DATABASES.get('oracle', {})

        dsn = oracledb.makedsn(
            oracle_config.get('HOST', '192.168.40.29'),
            oracle_config.get('PORT', '1521'),
            service_name=oracle_config.get('NAME', 'SIML')
        )

        connection = oracledb.connect(
            user=oracle_config.get('USER', 'estagiario'),
            password=oracle_config.get('PASSWORD', 'EIst4269uu'),
            dsn=dsn
        )

        return connection

    @classmethod
    def execute_query(cls, query, params=None):
        """Execute a SELECT query and return results"""
        conn = cls.get_connection()
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            # Get column names
            columns = [desc[0] for desc in cursor.description]

            # Fetch all rows
            rows = cursor.fetchall()

            # Convert to list of dicts
            results = []
            for row in rows:
                row_dict = {}
                for i, col_name in enumerate(columns):
                    value = row[i]
                    # Convert to JSON-serializable format
                    if value is not None:
                        if hasattr(value, 'isoformat'):  # datetime objects
                            value = value.isoformat()
                        elif isinstance(value, bytes):
                            value = value.decode('utf-8', errors='ignore')
                    row_dict[col_name] = value
                results.append(row_dict)

            return results
        finally:
            cursor.close()

    @classmethod
    def test_connection(cls):
        """Test Oracle connection"""
        try:
            conn = cls.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT 1 FROM DUAL")
            result = cursor.fetchone()
            cursor.close()
            return result is not None
        except Exception as e:
            raise Exception(f"Oracle connection test failed: {str(e)}")
