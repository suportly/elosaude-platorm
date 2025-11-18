"""
Database router for Oracle integration
Directs Oracle models to the Oracle database
"""


class OracleRouter:
    """
    A router to control all database operations on models in the
    oracle_integration application.
    """
    oracle_app_labels = {'oracle_integration'}

    def db_for_read(self, model, **hints):
        """
        Attempts to read oracle_integration models go to oracle database.
        """
        if model._meta.app_label in self.oracle_app_labels:
            return 'oracle'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write oracle_integration models go to oracle database.
        Note: Our models are read-only, but this ensures consistency.
        """
        if model._meta.app_label in self.oracle_app_labels:
            return 'oracle'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if both models are in the oracle_integration app.
        """
        oracle_1 = obj1._meta.app_label in self.oracle_app_labels
        oracle_2 = obj2._meta.app_label in self.oracle_app_labels

        if oracle_1 or oracle_2:
            return oracle_1 == oracle_2
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the oracle_integration app only appears in the 'oracle'
        database and never migrates to 'default'.
        """
        if app_label in self.oracle_app_labels:
            return db == 'oracle'
        return None
