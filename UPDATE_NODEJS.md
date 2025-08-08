# Node.js Update Commands

## Option 1: Using Winget (Windows Package Manager) - RECOMMENDED

```powershell
# Check if winget is available
winget --version

# Install latest Node.js LTS
winget install OpenJS.NodeJS.LTS

# Or install latest version
winget install OpenJS.NodeJS
```

## Option 2: Using Chocolatey (if installed)

```powershell
# Check if chocolatey is installed
choco --version

# Install/update Node.js
choco install nodejs

# Or upgrade if already installed
choco upgrade nodejs
```

## Option 3: Using Scoop (if installed)

```powershell
# Check if scoop is installed
scoop --version

# Install Node.js
scoop install nodejs
```

## Option 4: Using Node Version Manager (nvm-windows)

```powershell
# First install nvm-windows from: https://github.com/coreybutler/nvm-windows
# Then:
nvm install lts
nvm use lts
```

## Option 5: Manual Download (Fallback)

If none of the above work:
1. Go to https://nodejs.org/
2. Download "LTS" version (currently 20.x)
3. Run the installer
4. Restart terminal

## Check Your Current Package Managers

Run these to see what's available on your system:

```powershell
# Check what package managers you have
winget --version
choco --version
scoop --version
```

## After Installation

Verify the update worked:
```powershell
node --version  # Should show v20.x.x or v18.x.x
npm --version   # Should show 9.x.x or 10.x.x
```

## Quick One-Liner (Try This First)

```powershell
winget install OpenJS.NodeJS.LTS
```
