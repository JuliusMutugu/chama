@echo off
echo Setting up Chama - Blockchain-Powered Savings System
echo ====================================================

echo Checking prerequisites...

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo SUCCESS: Python is installed
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo SUCCESS: Node.js is installed
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: NPM is not installed. Please install it first.
    pause
    exit /b 1
) else (
    echo SUCCESS: NPM is installed
)

echo.
echo Setting up Backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
echo SUCCESS: Backend setup complete

echo.
echo Setting up Blockchain...
cd ..\blockchain
npm install
echo SUCCESS: Blockchain setup complete

echo.
echo Setting up Frontend...
cd ..\frontend
npm install
echo SUCCESS: Frontend setup complete

echo.
echo Setup complete! Next steps:
echo.
echo 1. Start the backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python -m app.main
echo.
echo 2. Start the blockchain (new terminal):
echo    cd blockchain
echo    npm run node
echo.
echo 3. Deploy contracts (new terminal):
echo    cd blockchain
echo    npm run deploy:local
echo.
echo 4. Start the frontend (new terminal):
echo    cd frontend
echo    npm start
echo.
echo Visit http://localhost:3000 to see your app!
pause
