# Chama Setup and Development Guide

## Prerequisites

1. **Python 3.8+** - For the FastAPI backend
2. **Node.js 16+** - For the React frontend and Hardhat
3. **Git** - For version control

## Quick Start

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
 # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Setup environment
copy .env.example .env
# Edit .env with your configuration

# Run the backend
python -m app.main
```

Backend will be available at: http://localhost:8000

### 2. Setup Blockchain Environment

```bash
cd blockchain

# Install dependencies
npm install

# Compile contracts
npm run compile

# Start local blockchain (new terminal)
npm run node

# Deploy contracts (new terminal)
npm run deploy:local
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at: http://localhost:3000

## Development Workflow

### Backend Development

1. **API Documentation**: Visit http://localhost:8000/docs for interactive API docs
2. **Database**: The app uses SQLite by default for development
3. **Environment Variables**: Configure in `backend/.env`

### Smart Contract Development

1. **Local Development**: Use Hardhat's local node for testing
2. **Contract Deployment**: Deploy to local network first, then testnets
3. **Testing**: Write comprehensive tests for all contract functions

### Frontend Development

1. **State Management**: Uses React Context for auth and Web3
2. **Styling**: Tailwind CSS for consistent styling
3. **Wallet Integration**: MetaMask for blockchain interactions

## Production Deployment

### Backend (FastAPI)

- Use PostgreSQL for production database
- Set up proper environment variables
- Deploy to cloud platforms like Heroku, AWS, or Azure

### Smart Contracts

- Deploy to testnets (Sepolia, Mumbai) for testing
- Deploy to mainnet (Ethereum, Polygon) for production
- Verify contracts on block explorers

### Frontend (React)

- Build for production: `npm run build`
- Deploy to static hosting (Netlify, Vercel, etc.)
- Configure environment variables for production API

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Smart Contract Tests
```bash
cd blockchain
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost/chama
SECRET_KEY=your-secret-key
WEB3_PROVIDER_URL=http://localhost:8545
DEPLOYER_PRIVATE_KEY=your-private-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CHAIN_ID=1337
REACT_APP_NETWORK_NAME=localhost
```

## Troubleshooting

### Common Issues

1. **MetaMask Connection Issues**
   - Make sure you're connected to the correct network
   - Reset account in MetaMask if needed

2. **Backend Import Errors**
   - Ensure virtual environment is activated
   - Install all dependencies with `pip install -r requirements.txt`

3. **Smart Contract Deployment Fails**
   - Check if local blockchain node is running
   - Verify private key and gas settings

### Getting Help

- Check the API documentation at `/docs`
- Review contract events in blockchain explorer
- Use browser developer tools for frontend debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Considerations

- Never commit private keys or sensitive data
- Use environment variables for all secrets
- Test on testnets before mainnet deployment
- Audit smart contracts before production use
