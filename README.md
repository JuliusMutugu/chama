# 🚀 Enhanced Chama - Blockchain-Powered Rotating Savings System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Contracts-blue.svg)](https://openzeppelin.com/contracts/)

A comprehensive decentralized platform for managing **rotating savings and credit associations (Chama)** using smart contracts. This system provides automated fund collection, transparent operations, role-based access control, and secure blockchain-based transactions.

## 🌟 Key Features

### 🔐 **Role-Based Access Control**
- **Group Admin**: Full group management, member addition/removal, emergency functions
- **Treasurer**: Cycle management, contribution tracking, payout processing
- **Secretary**: Record keeping, member communication, meeting management
- **Member**: Contribution participation, group activities access

### 💰 **Smart Financial Management**
- **Automated Cycles**: Programmatic rotation system for fair fund distribution
- **Late Fee System**: Configurable penalties for missed payments
- **Performance Tracking**: Member reliability scoring (0-100%)
- **Platform Fees**: Configurable fee structure for platform sustainability
- **Emergency Functions**: Pause/unpause and emergency withdrawal capabilities

### 🏭 **Factory Pattern Architecture**
- **Multi-Group Support**: Create and manage multiple Chama groups
- **Creator Approval System**: Moderated group creation process
- **Centralized Management**: Platform-wide statistics and configuration

### 🛡️ **Enterprise-Grade Security**
- **OpenZeppelin Integration**: Battle-tested security patterns
- **Reentrancy Protection**: Protection against malicious attacks
- **Access Control**: Granular permission system
- **Emergency Controls**: Pause functionality for critical situations

## 📁 Project Structure

```
chama/
├── 📂 backend/                     # FastAPI Backend Server
│   ├── app/
│   │   ├── 📄 main.py             # FastAPI application entry point
│   │   ├── 📄 models.py           # Database models (SQLAlchemy)
│   │   ├── 📄 database.py         # Database configuration
│   │   ├── 📄 auth.py             # Authentication & authorization
│   │   └── api/
│   │       ├── 📄 users.py        # User management endpoints
│   │       ├── 📄 groups.py       # Group management endpoints
│   │       └── 📄 analytics.py    # Analytics & reporting endpoints
│   ├── 📄 requirements.txt        # Python dependencies
│   └── 📄 README.md              # Backend documentation
│
├── 📂 frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── 📂 components/         # Reusable UI components
│   │   │   ├── 📄 Dashboard.js    # Main dashboard component
│   │   │   ├── 📄 GroupManager.js # Group management interface
│   │   │   ├── 📄 MemberProfile.js# Member profile management
│   │   │   └── 📄 Analytics.js    # Analytics dashboard
│   │   ├── 📂 contexts/           # React context providers
│   │   │   ├── 📄 AuthContext.js  # Authentication context
│   │   │   └── 📄 Web3Context.js  # Web3 connection context
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   │   ├── 📄 useAuth.js      # Authentication hook
│   │   │   └── 📄 useContract.js  # Smart contract interaction hook
│   │   ├── 📂 services/           # API and blockchain services
│   │   │   ├── 📄 api.js          # Backend API client
│   │   │   └── 📄 web3.js         # Web3 service layer
│   │   └── 📂 utils/              # Utility functions
│   ├── 📄 package.json            # Frontend dependencies
│   └── 📄 README.md              # Frontend documentation
│
├── 📂 blockchain/                  # Smart Contracts & Scripts
│   ├── 📂 contracts/              # Solidity smart contracts
│   │   ├── 📄 EnhancedChamaGroup.sol    # Main group contract (502 lines)
│   │   └── 📄 ChamaGroupFactory.sol     # Factory contract (319 lines)
│   ├── 📂 test/                   # Comprehensive test suite
│   │   └── 📄 EnhancedChama.test.js     # 29 passing tests
│   ├── 📂 scripts/                # Deployment & interaction scripts
│   │   ├── 📄 deploy.js           # Smart contract deployment
│   │   └── 📄 interact.js         # Contract interaction examples
│   ├── 📄 hardhat.config.js       # Hardhat configuration
│   ├── 📄 package.json            # Blockchain dependencies
│   └── 📄 README.md              # Blockchain documentation
│
├── 📂 docs/                       # Documentation
│   ├── 📄 API.md                 # API documentation
│   ├── 📄 DEPLOYMENT.md          # Deployment guide
│   └── 📄 ARCHITECTURE.md        # System architecture
│
└── 📄 README.md                  # This file - Project overview
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16+ recommended)
- **Python** (v3.8+ recommended)
- **PostgreSQL** (v12+ recommended)
- **MetaMask** or compatible Web3 wallet
- **Git** for version control

### 1. 📥 Clone Repository

```bash
git clone https://github.com/JuliusMutugu/chama.git
cd chama
```

### 2. 🔧 Setup Blockchain Environment

```bash
cd blockchain
npm install

# Compile smart contracts
npx hardhat compile

# Run comprehensive test suite (29 tests)
npx hardhat test

# Deploy to local network
npx hardhat run scripts/deploy.js

# Test contract interactions
npx hardhat run scripts/interact.js
```

### 3. 🔧 Setup Backend

```bash
cd ../backend
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database
python -m app.database

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 4. 🔧 Setup Frontend

```bash
cd ../frontend
npm install

# Configure Web3 settings
cp src/config/config.example.js src/config/config.js
# Edit config.js with contract addresses

# Start React development server
npm start
```

### 5. 🌐 Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 Smart Contract Features

### 🏗️ **EnhancedChamaGroup.sol**

**Core Functionality:**
- ✅ Role-based access control (Admin, Treasurer, Secretary, Member)
- ✅ Automated cycle management with fair rotation
- ✅ Contribution tracking with late fee calculation
- ✅ Performance scoring system (0-10000 basis points)
- ✅ Emergency pause/unpause functionality
- ✅ Secure payout processing with platform fees

**Key Methods:**
```solidity
// Member Management
function addMember(address _member, string memory _name, bool _kycVerified)
function removeMember(address _member)
function assignRole(address _member, bytes32 _role)

// Cycle Management  
function startNewCycle()
function makeContribution() payable
function processPayout(uint256 _cycleNumber)

// Information Retrieval
function getMemberInfo(address _member) returns (Member memory)
function getCycleInfo(uint256 _cycleNumber) 
function getGroupStats()

// Emergency Functions
function emergencyWithdraw()
function pause() / unpause()
```

### 🏭 **ChamaGroupFactory.sol**

**Factory Features:**
- ✅ Multi-group creation and management
- ✅ Creator approval system for moderated platforms
- ✅ Platform configuration management
- ✅ Cross-group statistics and analytics
- ✅ Centralized fee collection

## 🧪 Test Coverage

**Comprehensive Test Suite: 29 Passing Tests**

```bash
✅ Factory Contract (4 tests)
  ✅ Should deploy with correct platform configuration
  ✅ Should create groups with correct parameters  
  ✅ Should require creation fee
  ✅ Should track user groups

✅ Group Contract (15 tests)
  ✅ Should initialize with correct configuration
  ✅ Should add members correctly
  ✅ Should assign roles correctly
  ✅ Should start cycles
  ✅ Should handle contributions
  ✅ Should complete cycles when all members contribute
  ✅ Should process payouts correctly
  ✅ Should calculate late fees
  ✅ Should track group statistics
  ✅ Should prevent non-members from contributing
  ✅ Should prevent double contributions in same cycle
  ✅ Should handle member removal
  ✅ Should only allow admin to manage members
  ✅ Should only allow treasurer or admin to start cycles
  ✅ Should update performance scores correctly

✅ Access Control (3 tests)
  ✅ Should grant correct roles on deployment
  ✅ Should allow role assignment by admin
  ✅ Should prevent non-admin from assigning roles

✅ Emergency Functions (2 tests)
  ✅ Should allow admin to pause contract
  ✅ Should allow admin to unpause contract
  ✅ Should allow emergency withdrawal by admin

✅ Edge Cases (5 tests)
  ✅ Should handle empty contribution gracefully
  ✅ Should handle excessive contribution amounts
  ✅ Should prevent starting new cycle before current completes
  ✅ Should handle group with insufficient members
```

## 🔧 Configuration

### Smart Contract Configuration

```javascript
// Platform Configuration
const platformConfig = {
    groupCreationFee: ethers.utils.parseEther("0.01"), // 0.01 ETH
    minGroupSize: 3,                                   // Minimum members
    maxGroupSize: 50,                                  // Maximum members  
    platformFeePercentage: 500,                       // 5% platform fee
    platformTreasury: "0x...",                        // Treasury address
    requiresApproval: false                           // Moderated creation
};

// Group Configuration
const groupConfig = {
    name: "My Chama Group",
    description: "Monthly savings group",
    contributionAmount: ethers.utils.parseEther("0.1"), // 0.1 ETH per cycle
    contributionFrequency: 30 * 24 * 60 * 60,          // 30 days
    maxMembers: 10,
    lateFeePercentage: 1000,                            // 10% late fee
    gracePeriod: 7 * 24 * 60 * 60,                     // 7 days grace
    platformFeePercentage: 500,                        // 5% platform fee
    isActive: true,
    requiresKYC: false
};
```

### Backend Configuration

```python
# Environment Variables (.env)
DATABASE_URL=postgresql://user:password@localhost/chama_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BLOCKCHAIN_RPC_URL=http://localhost:8545
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...
```

### Frontend Configuration

```javascript
// src/config/config.js
export const config = {
  API_BASE_URL: 'http://localhost:8000',
  BLOCKCHAIN_NETWORK: {
    chainId: '0x539', // 1337 for localhost
    chainName: 'Localhost 8545',
    rpcUrls: ['http://localhost:8545'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  CONTRACTS: {
    FACTORY_ADDRESS: '0x...',
    FACTORY_ABI: [...],
  }
};
```

## 🚀 Deployment Guide

### Local Development

1. **Start Hardhat Network**:
```bash
cd blockchain
npx hardhat node
```

2. **Deploy Contracts**:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start Backend**:
```bash
cd backend
uvicorn app.main:app --reload
```

4. **Start Frontend**:
```bash
cd frontend
npm start
```

### Testnet Deployment

1. **Configure Network** (hardhat.config.js):
```javascript
networks: {
  sepolia: {
    url: `https://sepolia.infura.io/v3/${INFURA_KEY}`,
    accounts: [PRIVATE_KEY]
  }
}
```

2. **Deploy to Testnet**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

3. **Verify Contracts**:
```bash
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

### Production Deployment

1. **Security Audit**: Recommend professional audit before mainnet
2. **Gas Optimization**: Review and optimize gas usage
3. **Monitoring**: Set up contract monitoring and alerts
4. **Backup**: Secure backup of deployment keys and configurations

## 📖 API Documentation

### Authentication Endpoints

```http
POST /auth/register      # User registration
POST /auth/login         # User login  
POST /auth/refresh       # Token refresh
GET  /auth/me           # Current user info
```

### Group Management Endpoints

```http
GET    /groups                    # List all groups
POST   /groups                    # Create new group
GET    /groups/{group_id}         # Get group details
PUT    /groups/{group_id}         # Update group
DELETE /groups/{group_id}         # Delete group

POST   /groups/{group_id}/members # Add member
DELETE /groups/{group_id}/members/{member_id} # Remove member
```

### Analytics Endpoints

```http
GET /analytics/dashboard          # Dashboard analytics
GET /analytics/groups/{group_id}  # Group-specific analytics
GET /analytics/members/{member_id} # Member performance analytics
```

## 🔒 Security Features

### Smart Contract Security

- **OpenZeppelin Contracts**: Using battle-tested security patterns
- **ReentrancyGuard**: Protection against reentrancy attacks
- **AccessControl**: Role-based permission system
- **Pausable**: Emergency stop functionality
- **SafeMath**: Overflow protection (Solidity 0.8.19+)

### Backend Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **SQL Injection Protection**: Parameterized queries with SQLAlchemy
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: API endpoint protection

### Frontend Security

- **Web3 Integration**: Secure wallet connection
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: React's built-in XSS protection
- **Secure Storage**: Proper handling of sensitive data

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **JavaScript**: Use ESLint and Prettier configurations
- **Python**: Follow PEP 8 style guidelines
- **Testing**: Maintain test coverage above 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenZeppelin** for security contract libraries
- **Hardhat** for development framework
- **FastAPI** for modern Python web framework
- **React** for frontend framework
- **Ethereum** community for blockchain technology

## 📞 Support & Contact

- **Documentation**: [Wiki](https://github.com/JuliusMutugu/chama/wiki)
- **Issues**: [GitHub Issues](https://github.com/JuliusMutugu/chama/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JuliusMutugu/chama/discussions)
- **Email**: support@chamaproject.com

---

## 🎯 Roadmap

### Phase 1: Core Implementation ✅
- [x] Smart contract development
- [x] Role-based access control
- [x] Basic frontend interface
- [x] API backend
- [x] Comprehensive testing

### Phase 2: Enhanced Features 🚧
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-token support
- [ ] Integration with DeFi protocols
- [ ] Governance token implementation

### Phase 3: Ecosystem Growth 📅
- [ ] Cross-chain compatibility
- [ ] Institutional features
- [ ] Advanced reporting tools
- [ ] Third-party integrations
- [ ] Mainnet deployment

---

**Built with ❤️ by the Chama Development Team**

⭐ **Star this repository if you find it useful!**
