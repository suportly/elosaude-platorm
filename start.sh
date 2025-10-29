#!/bin/bash

# Elosaúde Platform - Quick Start Script
echo "🏥 Elosaúde Platform - Starting..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Start backend services
echo "🚀 Starting backend services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ Backend services started successfully"
else
    echo "❌ Failed to start backend services"
    exit 1
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Elosaúde Platform is ready!"
echo ""
echo "📱 Next steps:"
echo ""
echo "1. Backend API: http://localhost:8000/swagger/"
echo "2. Django Admin: http://localhost:8000/admin/"
echo ""
echo "3. Start mobile app:"
echo "   cd mobile"
echo "   npm install  (first time only)"
echo "   npm start"
echo ""
echo "4. Test login with ANY credentials:"
echo "   CPF: 123.456.789-00"
echo "   Password: test"
echo ""
echo "📖 For more information, see QUICKSTART.md"
echo ""
echo "🛑 To stop: docker-compose down"
echo ""
