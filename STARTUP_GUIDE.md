# Complete Startup Guide for Chama Application

## Required Services (4 Terminals)

To run the complete Chama application, you need to start 4 different services in separate terminals:

### Terminal 1: Backend API
```powershell
cd c:\Users\Julimore\Documents\chama\backend
.\venv\Scripts\Activate.ps1
python -m app.main
```
**Expected Output:** Server running on http://localhost:8000

### Terminal 2: Blockchain Node
```powershell
cd c:\Users\Julimore\Documents\chama\blockchain
npm install  # if not done yet
npm run node
```
**Expected Output:** Local blockchain running on http://localhost:8545

### Terminal 3: Smart Contract Deployment
```powershell
cd c:\Users\Julimore\Documents\chama\blockchain
npm run deploy:local
```
**Expected Output:** Contract deployed with address

### Terminal 4: Frontend Application
```powershell
cd c:\Users\Julimore\Documents\chama\frontend
npm install  # currently running
npm start
```
**Expected Output:** React app running on http://localhost:3000

## Startup Order

1. **Start Backend first** - Other services depend on it
2. **Start Blockchain Node** - Required for smart contracts
3. **Deploy Contracts** - Only after blockchain is running
4. **Start Frontend** - Last, connects to all other services

## Access URLs

- **Main Application:** http://localhost:3000
- **API Documentation:** http://localhost:8000/docs
- **Backend Health Check:** http://localhost:8000/health

## Troubleshooting

### PowerShell Execution Policy
If you get script execution errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Python Virtual Environment
If backend fails to start:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Node.js Dependencies
If frontend or blockchain fails:
```powershell
npm cache clean --force
npm install
```

### Port Conflicts
If ports are in use, check what's running:
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :8545
```

## Development Workflow

1. **Backend Changes:** Server auto-restarts with code changes
2. **Frontend Changes:** Browser auto-refreshes with hot reload
3. **Smart Contract Changes:** Requires recompilation and redeployment
4. **Database Changes:** May require migration or reset

## Next Steps After Startup

1. **Create Account:** Register at http://localhost:3000/register
2. **Connect Wallet:** Use MetaMask to connect to local blockchain
3. **Create Group:** Start a new savings group
4. **Test Functionality:** Make contributions and test payouts
