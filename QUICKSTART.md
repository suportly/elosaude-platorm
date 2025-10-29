# Elosaúde - Quick Start Guide

This guide will help you get the Elosaúde platform up and running in minutes.

## Prerequisites

Make sure you have installed:
- **Docker** and **Docker Compose** (for backend)
- **Node.js 18+** (for mobile app)
- **npm** or **yarn**

## 🚀 Quick Start (5 minutes)

### Step 1: Start the Backend

```bash
# From the project root
docker-compose up -d
```

This command will:
- Start PostgreSQL database
- Start Redis
- Start Django backend
- Run database migrations automatically
- Start Celery workers

**Wait about 30-60 seconds** for all services to initialize.

### Step 2: Verify Backend is Running

Open your browser and go to:
- **API Documentation**: http://localhost:8000/swagger/
- **Django Admin**: http://localhost:8000/admin/

You should see the Swagger documentation interface.

### Step 3: Start the Mobile App

```bash
# Open a new terminal
cd mobile

# Install dependencies (first time only)
npm install

# Start the Expo development server
npm start
```

### Step 4: Run the Mobile App

After `npm start`, you'll see a QR code. You have several options:

**Option A: Android Emulator**
- Press `a` in the terminal
- Requires Android Studio with an emulator set up

**Option B: iOS Simulator (macOS only)**
- Press `i` in the terminal
- Requires Xcode

**Option C: Physical Device**
- Install **Expo Go** app from App Store or Google Play
- Scan the QR code with your camera

## 🎯 Testing the Login

1. When the app opens, you'll see the login screen
2. Enter **any CPF** (e.g., `123.456.789-00`)
3. Enter **any password** (e.g., `test`)
4. Tap **"Entrar"**

The system will:
- Automatically create a user account
- Create a beneficiary profile
- Generate a digital health card
- Log you in with a JWT token

## 📱 Exploring the App

After logging in, you'll see:

### Home Screen
- 4 main module cards:
  - **Carteirinha Digital** (Digital Card)
  - **Rede Credenciada** (Provider Network)
  - **Guias e Autorizações** (Guides)
  - **Reembolso** (Reimbursement)
- Quick access links
- Plan information

### Bottom Navigation
- **Início** (Home)
- **Carteirinha** (Digital Card)
- **Rede** (Network)
- **Guias** (Guides)
- **Mais** (More)

## 🔧 API Testing with Postman

### Import the Collection

1. Open Postman
2. Click **Import**
3. Select the file: `Elosaude_API.postman_collection.json`
4. The collection is ready to use!

### Test the Login

1. Open **Authentication → Test Login**
2. Click **Send**
3. The access token will be automatically saved
4. Now you can test other endpoints!

### Example API Calls

**Test Login:**
```bash
curl -X POST http://localhost:8000/api/accounts/test-login/ \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "password": "anypassword"
  }'
```

**Get User Profile:**
```bash
curl -X GET http://localhost:8000/api/beneficiaries/beneficiaries/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🛠️ Common Issues & Solutions

### Backend Issues

**Issue: "Port 8000 already in use"**
```bash
# Stop the existing process
docker-compose down
# Start again
docker-compose up -d
```

**Issue: "Database connection error"**
```bash
# Restart all services
docker-compose restart
# Check logs
docker-compose logs backend
```

**Issue: "Migrations not applied"**
```bash
docker-compose exec backend python manage.py migrate
```

### Mobile App Issues

**Issue: "Unable to connect to API"**

For **Android Emulator**, the API URL should be `http://10.0.2.2:8000`
For **iOS Simulator**, use `http://localhost:8000`
For **Physical Device**, use your computer's IP address (e.g., `http://192.168.1.100:8000`)

Update the API URL in: `mobile/src/config/api.ts`

**Issue: "Module not found" errors**
```bash
cd mobile
rm -rf node_modules
npm install
```

**Issue: "Expo Go app crashes"**
```bash
# Clear the cache
expo start -c
```

## 📊 Viewing Data

### Django Admin Panel

1. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

2. Go to: http://localhost:8000/admin/

3. Log in with your credentials

4. You can now view and manage:
   - Beneficiaries
   - Digital Cards
   - Providers
   - Guides
   - Reimbursements
   - etc.

### Database Access

```bash
# Connect to PostgreSQL
docker-compose exec db psql -U postgres -d elosaude_db

# List tables
\dt

# View beneficiaries
SELECT * FROM beneficiaries_beneficiary;

# Exit
\q
```

## 🔄 Stopping and Restarting

### Stop Everything
```bash
# Stop backend services
docker-compose down

# Stop mobile app
# Press Ctrl+C in the terminal running npm start
```

### Restart
```bash
# Start backend
docker-compose up -d

# Start mobile (in mobile/ directory)
npm start
```

### Clean Restart (removes all data)
```bash
# Warning: This will delete all database data!
docker-compose down -v
docker-compose up -d
```

## 📝 Next Steps

Now that everything is running, you can:

1. **Explore the API** using Swagger: http://localhost:8000/swagger/
2. **Test endpoints** using the Postman collection
3. **Navigate the mobile app** and test different features
4. **Create test data** through the Django admin panel
5. **Check the logs** to understand how everything works:
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f celery
   ```

## 🎓 Development Workflow

### Making Changes to Backend

1. Edit files in `backend/` directory
2. Django auto-reloads when you save files
3. For model changes:
   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

### Making Changes to Mobile App

1. Edit files in `mobile/src/` directory
2. Save the file
3. The app will automatically reload in Expo Go

### Viewing Logs

```bash
# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f

# Specific service
docker-compose logs -f celery
```

## 🆘 Need Help?

- **API Documentation**: http://localhost:8000/swagger/
- **Check Logs**: `docker-compose logs -f`
- **Restart Services**: `docker-compose restart`
- **Clean Install**:
  ```bash
  docker-compose down -v
  docker-compose up -d
  cd mobile && rm -rf node_modules && npm install
  ```

## ✅ Success Checklist

- [ ] Docker services are running (`docker-compose ps`)
- [ ] Backend API is accessible (http://localhost:8000/swagger/)
- [ ] Mobile app is running in Expo
- [ ] Test login works
- [ ] Home screen displays correctly
- [ ] API calls work (test with Postman)

---

**Congratulations!** 🎉 You now have a fully functional health plan management system running locally!
