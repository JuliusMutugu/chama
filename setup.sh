#!/bin/bash

echo "🚀 Setting up Chama - Blockchain-Powered Savings System"
echo "=================================================="

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "Checking prerequisites..."
check_command python
check_command node
check_command npm

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
cp .env.example .env
echo "✅ Backend setup complete"

# Setup Blockchain
echo ""
echo "⛓️ Setting up Blockchain..."
cd ../blockchain
npm install
echo "✅ Blockchain setup complete"

# Setup Frontend
echo ""
echo "🌐 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend setup complete"

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   venv/Scripts/activate (Windows) or source venv/bin/activate (Mac/Linux)"
echo "   python -m app.main"
echo ""
echo "2. Start the blockchain (new terminal):"
echo "   cd blockchain"
echo "   npm run node"
echo ""
echo "3. Deploy contracts (new terminal):"
echo "   cd blockchain"
echo "   npm run deploy:local"
echo ""
echo "4. Start the frontend (new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "Visit http://localhost:3000 to see your app!"
