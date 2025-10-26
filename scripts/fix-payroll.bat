@echo off
echo 🚀 Starting payroll schema fix...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create one with your Supabase credentials.
    echo Required variables:
    echo   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    echo   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    pause
    exit /b 1
)

echo ✅ Environment check passed
echo.

REM Run the fix script
node scripts/run-payroll-fix.js

if %errorlevel% neq 0 (
    echo.
    echo ❌ Script failed. Please check the error above.
    pause
    exit /b 1
)

echo.
echo 🎉 Payroll schema fix completed!
echo.
echo 📋 Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Test the payroll form
echo 3. Verify all fields are working correctly
echo.
pause
