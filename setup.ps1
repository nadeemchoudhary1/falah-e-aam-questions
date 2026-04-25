# Quiz App - Setup Script for Windows (PowerShell)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quiz App Setup Script (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} 
catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setting up Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location backend

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Please update backend\.env with your email credentials" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✓ Backend setup complete" -ForegroundColor Green

# Frontend Setup
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setting up Frontend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Set-Location ..\frontend

if (!(Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    @"
REACT_APP_API_URL=http://localhost:5000/api
"@ | Out-File -Encoding UTF8 .env.local
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✓ Frontend setup complete" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Update backend\.env with email credentials"
Write-Host "   2. Open 2 terminal windows"
Write-Host "   3. Terminal 1: cd backend; npm run dev"
Write-Host "   4. Terminal 2: cd frontend; npm start"
Write-Host ""
Write-Host "🌐 Access at:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend:  http://localhost:5000"
Write-Host ""
Write-Host "🔐 Demo Login:" -ForegroundColor Cyan
Write-Host "   Email:    user1@test.com"
Write-Host "   Password: pass123"
Write-Host ""

Read-Host "Press Enter to exit"
