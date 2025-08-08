# Manual Setup Guide for Chama

## Step-by-Step Manual Installation

### 1. Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

### 2. Blockchain Setup
```powershell
cd ..\blockchain
npm install
```

### 3. Frontend Setup
```powershell
cd ..\frontend
npm install
```

## Running the Application

### Terminal 1 - Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m app.main
```

### Terminal 2 - Blockchain Node
```powershell
cd blockchain
npm run node
```

### Terminal 3 - Deploy Contracts
```powershell
cd blockchain
npm run deploy:local
```

### Terminal 4 - Frontend
```powershell
cd frontend
npm start
```

## Troubleshooting

### PowerShell Execution Policy Issues
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Python Virtual Environment Issues
```powershell
# If activation fails, try:
venv\Scripts\activate.bat
```

### Node.js Issues
```powershell
# Clear npm cache if needed:
npm cache clean --force
```

## URLs After Setup
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
