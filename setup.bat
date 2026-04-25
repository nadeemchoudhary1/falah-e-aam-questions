@echo off
REM Quiz App - Setup Script for Windows

echo.
echo ========================================
echo   Quiz App Setup Script (Windows)
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 16+
    exit /b 1
)

echo ✓ Node.js version:
node --version

echo ✓ npm version:
npm --version

REM Backend Setup
echo.
echo ========================================
echo   Setting up Backend...
echo ========================================

cd backend

if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please update backend\.env with your email credentials
    echo.
)

echo Installing dependencies...
call npm install

echo ✓ Backend setup complete

REM Frontend Setup
echo.
echo ========================================
echo   Setting up Frontend...
echo ========================================

cd ..\frontend

if not exist ".env.local" (
    echo Creating .env.local file...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
    ) > .env.local
)

echo Installing dependencies...
call npm install

echo ✓ Frontend setup complete

REM Summary
echo.
echo ========================================
echo   ✅ Setup Complete!
echo ========================================
echo.
echo 📝 Next Steps:
echo    1. Update backend\.env with email credentials
echo    2. Open 2 terminal windows
echo    3. Terminal 1: cd backend ^&^& npm run dev
echo    4. Terminal 2: cd frontend ^&^& npm start
echo.
echo 🌐 Access at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo 🔐 Demo Login:
echo    Email:    user1@test.com
echo    Password: pass123
echo.
pause
