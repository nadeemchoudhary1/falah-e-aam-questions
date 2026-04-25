#!/usr/bin/env bash

# Quiz App - Setup Script for macOS/Linux

set -e

echo "🚀 Quiz App Setup Script"
echo "========================"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✓ npm version: $(npm --version)"

# Backend Setup
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your email credentials"
fi

echo "Installing dependencies..."
npm install

echo "✓ Backend setup complete"

# Frontend Setup
echo ""
echo "📱 Setting up Frontend..."
cd ../frontend

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
fi

echo "Installing dependencies..."
npm install

echo "✓ Frontend setup complete"

# Summary
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Update backend/.env with email credentials"
echo "2. Terminal 1: cd backend && npm run dev"
echo "3. Terminal 2: cd frontend && npm start"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "🔐 Demo Login:"
echo "   Email:    user1@test.com"
echo "   Password: pass123"
