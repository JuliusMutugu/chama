# Node.js Update and Setup Fix Guide

## Issue: Multiple Problems Detected

1. **Node.js Version 10** - Too old, needs updating
2. **Rust Compilation Error** - Missing Rust toolchain for Python packages
3. **Installation Failures** - Dependencies not installing properly

## Solutions

### Step 1: Update Node.js (Critical)

**Option A: Download from Official Site**
1. Go to https://nodejs.org/
2. Download the LTS version (currently Node.js 20.x)
3. Run the installer
4. Restart your terminal/VS Code

**Option B: Using Chocolatey (if installed)**
```powershell
choco install nodejs
```

**Option C: Using Winget**
```powershell
winget install OpenJS.NodeJS
```

### Step 2: Fix Python/Rust Compilation Issues

**Option A: Use Pre-compiled Packages**
```powershell
cd backend
.\venv\Scripts\activate
pip install --upgrade pip
pip install --only-binary=all -r requirements.txt
```

**Option B: Install Visual Studio Build Tools**
1. Download "Build Tools for Visual Studio 2022"
2. Install with C++ build tools
3. Restart terminal and try again

**Option C: Use Alternative Requirements**
Create a new `requirements-simple.txt`:

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pydantic==2.5.0
python-multipart==0.0.6
web3==6.12.0
python-dotenv==1.0.0
httpx==0.25.2
pytest==7.4.3
pytest-asyncio==0.21.1
```

### Step 3: Restart Setup Process

After updating Node.js:
```powershell
# Check versions
node --version  # Should be 18+ or 20+
npm --version   # Should be 9+ or 10+
python --version

# Clean restart
cd c:\Users\Julimore\Documents\chama
.\setup.ps1
```

## Quick Fix Commands

```powershell
# Stop current processes
# Update Node.js first (download from nodejs.org)

# Then restart setup:
cd c:\Users\Julimore\Documents\chama

# Backend with simpler requirements
cd backend
.\venv\Scripts\activate
pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv web3

# Frontend (after Node.js update)
cd ..\frontend
npm install

# Blockchain
cd ..\blockchain
npm install
```

## Priority Actions

1. **FIRST**: Update Node.js to version 18+ or 20+
2. **SECOND**: Try the simplified Python package installation
3. **THIRD**: Restart the setup process

The Node.js update is critical - version 10 is from 2018 and incompatible with modern packages.
