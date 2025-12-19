# Quickstart: PostgreSQL Database Configuration

**Feature**: 002-postgres-config
**Time Estimate**: ~5 minutes

## Prerequisites

- Access to the backend server/development environment
- Network connectivity to 192.168.40.25:5432
- Backend virtual environment activated

## Step 1: Update Environment File

Edit `backend/.env` and update the database configuration:

```bash
# Database - Updated configuration
DB_NAME=elosaude_app
DB_HOST=192.168.40.25
DB_PORT=5432
DB_USER=junior_app
DB_PASSWORD=junior_app_2025..
```

## Step 2: Verify Connection

Test the database connection:

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # or your venv path

# Check Django configuration
python manage.py check

# Test database connection
python manage.py dbshell
# In psql prompt, run: SELECT 1; then \q to exit
```

## Step 3: Verify Migrations

Ensure the database schema is in sync:

```bash
# Check for pending migrations
python manage.py migrate --check

# If there are pending migrations, apply them:
python manage.py migrate
```

## Step 4: Test Application

Start the development server and verify:

```bash
python manage.py runserver 0.0.0.0:8003

# In another terminal, test an API endpoint:
curl http://localhost:8003/api/health/
```

## Verification Checklist

- [ ] `python manage.py check` passes without errors
- [ ] `python manage.py dbshell` connects successfully
- [ ] `python manage.py migrate --check` shows no pending migrations
- [ ] API endpoints return expected data
- [ ] No password visible in server logs

## Rollback

If issues occur, revert to previous database configuration:

```bash
# In backend/.env
DB_NAME=elosaude_db
DB_HOST=localhost
DB_USER=n8n
DB_PASSWORD=xjoA531Gs24zKUwXRMdc
```

## Troubleshooting

### Connection Refused

```bash
# Check network connectivity
ping 192.168.40.25
telnet 192.168.40.25 5432
```

### Authentication Failed

- Verify username/password are correct
- Check PostgreSQL `pg_hba.conf` allows connections from your IP
- Ensure user has access to `elosaude_app` database

### SSL Required

If the server requires SSL, add to `.env`:

```bash
# Add SSL mode if required
DB_OPTIONS={"sslmode": "require"}
```

And update `settings.py` DATABASES config to include OPTIONS.
