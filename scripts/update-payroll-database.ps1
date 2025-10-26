# PowerShell script to update payroll database schema
# This script will add all missing fields to the payroll table

Write-Host "🚀 Starting payroll database update..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Please create one with your Supabase credentials." -ForegroundColor Red
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" -ForegroundColor Yellow
    Write-Host "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📝 Available options:" -ForegroundColor Cyan
Write-Host "1. Check current schema only" -ForegroundColor White
Write-Host "2. Update schema with SQL script" -ForegroundColor White
Write-Host "3. Run full update (check + update + verify)" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🔍 Checking current schema..." -ForegroundColor Blue
        node scripts/check-payroll-schema.js
    }
    "2" {
        Write-Host "📝 Updating schema..." -ForegroundColor Blue
        node scripts/update-payroll-database.js
    }
    "3" {
        Write-Host "🚀 Running full update..." -ForegroundColor Blue
        node scripts/update-payroll-database.js
    }
    "4" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Script completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your development server (npm run dev)" -ForegroundColor White
Write-Host "2. Test the payroll form" -ForegroundColor White
Write-Host "3. Verify all fields are working correctly" -ForegroundColor White
