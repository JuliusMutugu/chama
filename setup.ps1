# Chama Setup Script for PowerShell
# Run this with: .\setup.ps1

Write-Host "Setting up Chama - Blockchain-Powered Savings System" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        Write-Host "SUCCESS: $command is installed" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "ERROR: $command is not installed. Please install it first." -ForegroundColor Red
        return $false
    }
}

Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$pythonInstalled = Test-Command "python"
$nodeInstalled = Test-Command "node"
$npmInstalled = Test-Command "npm"

if (-not ($pythonInstalled -and $nodeInstalled -and $npmInstalled)) {
    Write-Host "`nERROR: Missing prerequisites. Please install the required tools." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Setup Backend
Write-Host "`nSetting up Backend..." -ForegroundColor Yellow
Set-Location "backend"

# Create virtual environment
python -m venv venv

# Activate virtual environment and install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"
pip install -r requirements.txt

# Copy environment file
if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env"
    Write-Host "SUCCESS: Environment file created" -ForegroundColor Green
}

Write-Host "SUCCESS: Backend setup complete" -ForegroundColor Green

# Setup Blockchain
Write-Host "`nSetting up Blockchain..." -ForegroundColor Yellow
Set-Location "..\blockchain"
npm install
Write-Host "SUCCESS: Blockchain setup complete" -ForegroundColor Green

# Setup Frontend
Write-Host "`nSetting up Frontend..." -ForegroundColor Yellow
Set-Location "..\frontend"
npm install
Write-Host "SUCCESS: Frontend setup complete" -ForegroundColor Green

# Return to root directory
Set-Location ".."

Write-Host "`nSetup complete! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Start the backend:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "   python -m app.main" -ForegroundColor White
Write-Host ""
Write-Host "2. Start the blockchain (new terminal):" -ForegroundColor Cyan
Write-Host "   cd blockchain" -ForegroundColor White
Write-Host "   npm run node" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy contracts (new terminal):" -ForegroundColor Cyan
Write-Host "   cd blockchain" -ForegroundColor White
Write-Host "   npm run deploy:local" -ForegroundColor White
Write-Host ""
Write-Host "4. Start the frontend (new terminal):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Visit http://localhost:3000 to see your app!" -ForegroundColor Yellow

Read-Host "`nPress Enter to continue"
