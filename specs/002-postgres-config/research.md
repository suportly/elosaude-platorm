# Research: PostgreSQL Database Configuration

**Feature**: 002-postgres-config
**Date**: 2025-12-15

## Summary

This research documents the findings for configuring the Elosaúde backend to connect to a new PostgreSQL database server.

## Current Configuration Analysis

### Existing Setup

The Django backend already has proper database configuration infrastructure in place:

| Aspect | Implementation |
|--------|---------------|
| Config Library | `python-decouple` |
| Settings File | `backend/elosaude_backend/settings.py` |
| Environment File | `backend/.env` |
| Example File | `backend/.env.example` |
| Database Engine | `django.db.backends.postgresql` |

### Environment Variables Used

```python
DB_NAME    # Database name
DB_USER    # Database username
DB_PASSWORD # Database password
DB_HOST    # Database host/IP
DB_PORT    # Database port (default: 5432)
```

## Research Findings

### Decision: Use Existing Environment Variable Pattern

**Rationale**: The Django settings already use `python-decouple` to load database configuration from environment variables. This pattern:
- Keeps sensitive credentials out of code
- Follows 12-factor app principles
- Is already tested and working
- Complies with Constitution IV (Security by Design)

**Alternatives Considered**:
1. **Django database routers**: Overkill for single database, adds complexity
2. **Separate settings files**: Not needed, env vars provide flexibility
3. **Docker secrets**: Not applicable for current deployment model

### Decision: Update .env File Only

**Rationale**: No code changes are required because:
- Settings.py already supports all required env vars
- The new database uses standard PostgreSQL (same engine)
- No schema changes or migrations needed (existing DB)

**Alternatives Considered**:
1. **Add database health check endpoint**: Could be added as enhancement but not required for FR-004 (startup validation)
2. **Add connection pooling via PgBouncer**: Could be added later, Django's default pooling sufficient for current scale

### Connection Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Host | 192.168.40.25 | Internal network IP |
| Port | 5432 | Standard PostgreSQL port |
| Database | elosaude_app | Production database |
| Username | junior_app | Service account |
| Password | (env var) | Loaded from .env |

### Security Considerations

Per Constitution IV (Security by Design):
- Password stored in `.env` file (not committed to git)
- `.env` is in `.gitignore`
- Connection uses standard PostgreSQL auth
- Recommendation: Consider SSL connections for production

### Network Considerations

- Host 192.168.40.25 is an internal network address
- Application must have network access to this host
- Firewall rules may need configuration (out of scope)
- Consider adding connection timeout in settings

## Verification Checklist

After applying configuration:

1. [ ] Django can connect to database on startup
2. [ ] `python manage.py check` passes
3. [ ] `python manage.py migrate --check` shows no pending migrations
4. [ ] API endpoints return data from new database
5. [ ] Credentials not visible in logs

## References

- Django Database Settings: https://docs.djangoproject.com/en/4.2/ref/settings/#databases
- python-decouple: https://github.com/HBNetwork/python-decouple
- PostgreSQL Connection: https://www.postgresql.org/docs/current/libpq-connect.html
