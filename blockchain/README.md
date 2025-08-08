# 🔗 Blockchain Components - Enhanced Chama Smart Contracts

This directory contains the smart contract implementation for the Enhanced Chama rotating savings system.

## 📋 Overview

The blockchain component consists of two main smart contracts:
- **EnhancedChamaGroup.sol**: Core group management contract (502 lines)
- **ChamaGroupFactory.sol**: Factory pattern for creating multiple groups (319 lines)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChamaGroupFactory                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Group 1       │  │   Group 2       │  │   Group N       │ │
│  │ (EnhancedChama) │  │ (EnhancedChama) │  │ (EnhancedChama) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
blockchain/
├── 📂 contracts/              # Smart contract source code
│   ├── 📄 EnhancedChamaGroup.sol    # Main group contract
│   └── 📄 ChamaGroupFactory.sol     # Factory contract
├── 📂 test/                   # Test suite
│   └── 📄 EnhancedChama.test.js     # 29 comprehensive tests
├── 📂 scripts/                # Deployment and interaction scripts
│   ├── 📄 deploy.js           # Contract deployment script
│   └── 📄 interact.js         # Contract interaction examples
├── 📄 hardhat.config.js       # Hardhat configuration
├── 📄 package.json            # Dependencies
└── 📄 README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- Hardhat development environment
- MetaMask or compatible Web3 wallet

### Installation

```bash
cd blockchain
npm install
```

### Compilation

```bash
npx hardhat compile
```

### Testing

```bash
# Run all tests
npx hardhat test

# Run with verbose output
npx hardhat test --verbose

# Run specific test file
npx hardhat test test/EnhancedChama.test.js
```

### Deployment

```bash
# Deploy to local network
npx hardhat run scripts/deploy.js

# Deploy to testnet (e.g., Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

### Interaction

```bash
# Run interaction examples
npx hardhat run scripts/interact.js
```

## 📄 Smart Contracts

### 🏢 EnhancedChamaGroup.sol

**Purpose**: Core contract for managing individual Chama groups with role-based access control.

**Key Features**:
- Role-based access control (Admin, Treasurer, Secretary, Member)
- Automated cycle management with fair rotation
- Contribution tracking with late fee calculations
- Performance scoring system (0-10000 basis points)
- Emergency functions (pause/unpause, emergency withdrawal)
- Secure payout processing with platform fees

**Roles & Permissions**:

| Role | Permissions |
|------|-------------|
| **Group Admin** | Add/remove members, assign roles, emergency functions, group configuration |
| **Treasurer** | Start cycles, process payouts, financial management |
| **Secretary** | Record keeping, member communication (future enhancement) |
| **Member** | Make contributions, participate in group activities |

**Core Functions**:

```solidity
// Member Management
function addMember(address _member, string memory _name, bool _kycVerified)
function removeMember(address _member)
function assignRole(address _member, bytes32 _role)

// Cycle Management
function startNewCycle()
function makeContribution() payable
function processPayout(uint256 _cycleNumber)

// View Functions
function getMemberInfo(address _member) returns (Member memory)
function getCycleInfo(uint256 _cycleNumber)
function getGroupStats()

// Emergency Functions
function emergencyWithdraw()
function pause() / unpause()
```

**Events**:

```solidity
event GroupCreated(string name, address creator, uint256 timestamp)
event MemberAdded(address member, string name, uint256 rotationOrder)
event ContributionMade(address contributor, uint256 amount, uint256 cycle, uint256 timestamp)
event CycleCompleted(uint256 cycle, address recipient, uint256 amount, uint256 timestamp)
event PayoutMade(uint256 cycle, address recipient, uint256 amount, uint256 timestamp)
```

### 🏭 ChamaGroupFactory.sol

**Purpose**: Factory contract for creating and managing multiple Chama groups.

**Key Features**:
- Multi-group creation and management
- Creator approval system for moderated platforms
- Platform configuration management
- Cross-group statistics and analytics
- Centralized fee collection

**Core Functions**:

```solidity
// Group Management
function createGroup(GroupConfig memory _groupConfig, string memory _name, string memory _description) payable
function getGroupsByCreator(address _creator) returns (uint256[] memory)
function getTotalGroups() returns (uint256)

// Platform Management
function approveCreator(address _creator)
function updatePlatformConfig(PlatformConfig memory _newConfig)
```

## 🧪 Test Coverage

**29 Passing Tests** covering comprehensive functionality:

### Factory Contract Tests (4 tests)
```javascript
✅ Should deploy with correct platform configuration
✅ Should create groups with correct parameters
✅ Should require creation fee
✅ Should track user groups
```

### Group Contract Tests (15 tests)
```javascript
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
```

### Access Control Tests (3 tests)
```javascript
✅ Should grant correct roles on deployment
✅ Should allow role assignment by admin
✅ Should prevent non-admin from assigning roles
```

### Emergency Function Tests (2 tests)
```javascript
✅ Should allow admin to pause contract
✅ Should allow admin to unpause contract
✅ Should allow emergency withdrawal by admin
```

### Edge Case Tests (5 tests)
```javascript
✅ Should handle empty contribution gracefully
✅ Should handle excessive contribution amounts
✅ Should prevent starting new cycle before current completes
✅ Should handle group with insufficient members
```

## ⚙️ Configuration

### Platform Configuration

```javascript
const platformConfig = {
    groupCreationFee: ethers.utils.parseEther("0.01"), // Fee to create group
    minGroupSize: 3,                                   // Minimum members required
    maxGroupSize: 50,                                  // Maximum members allowed
    platformFeePercentage: 500,                       // 5% platform fee (basis points)
    platformTreasury: "0x...",                        // Platform treasury address
    requiresApproval: false                           // Whether group creation requires approval
};
```

### Group Configuration

```javascript
const groupConfig = {
    name: "My Savings Group",
    description: "Monthly savings for emergency fund",
    contributionAmount: ethers.utils.parseEther("0.1"), // Amount per contribution
    contributionFrequency: 30 * 24 * 60 * 60,          // Frequency in seconds (30 days)
    maxMembers: 10,                                     // Maximum group members
    lateFeePercentage: 1000,                           // 10% late fee (basis points)
    gracePeriod: 7 * 24 * 60 * 60,                     // Grace period in seconds (7 days)
    platformFeePercentage: 500,                        // Platform fee (inherited from platform)
    isActive: true,                                     // Whether group is active
    requiresKYC: false                                 // Whether KYC is required
};
```

## 🔒 Security Features

### OpenZeppelin Integration
- **AccessControl**: Role-based permission system
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency stop functionality
- **SafeMath**: Overflow protection (built into Solidity 0.8.19+)

### Custom Security Measures
- **Multi-role access control**: Granular permissions
- **Emergency functions**: Admin can pause and withdraw in emergencies
- **Input validation**: Comprehensive parameter validation
- **State validation**: Cycle and member state checks

### Best Practices
- **Checks-Effects-Interactions pattern**: Proper function ordering
- **Gas optimization**: Efficient storage and computation
- **Event emission**: Comprehensive event logging
- **Error handling**: Descriptive error messages

## 📊 Gas Usage Analysis

| Function | Estimated Gas |
|----------|---------------|
| `createGroup()` | ~2,500,000 |
| `addMember()` | ~150,000 |
| `makeContribution()` | ~120,000 |
| `startNewCycle()` | ~100,000 |
| `processPayout()` | ~80,000 |

*Note: Gas costs may vary based on network conditions and contract state*

## 🚀 Deployment Networks

### Supported Networks

| Network | Chain ID | RPC URL | Status |
|---------|----------|---------|--------|
| Localhost | 1337 | http://localhost:8545 | ✅ Supported |
| Sepolia Testnet | 11155111 | https://sepolia.infura.io/v3/... | ✅ Supported |
| Mumbai Testnet | 80001 | https://polygon-mumbai.infura.io/v3/... | 🚧 Coming Soon |
| Ethereum Mainnet | 1 | https://mainnet.infura.io/v3/... | 📅 Planned |
| Polygon Mainnet | 137 | https://polygon-mainnet.infura.io/v3/... | 📅 Planned |

### Deployment Checklist

Before deploying to production:

- [ ] Complete security audit
- [ ] Gas optimization review
- [ ] Comprehensive testing on testnet
- [ ] Documentation review
- [ ] Emergency response plan
- [ ] Monitoring setup
- [ ] Backup and recovery plan

## 🛠️ Development Scripts

### Available Scripts

```bash
# Compilation
npm run compile          # Compile contracts
npm run clean           # Clean artifacts

# Testing
npm run test            # Run all tests
npm run test:verbose    # Run tests with verbose output
npm run coverage        # Generate test coverage report

# Deployment
npm run deploy:local    # Deploy to local network
npm run deploy:testnet  # Deploy to testnet
npm run verify         # Verify contracts on Etherscan

# Interaction
npm run interact        # Run interaction examples
npm run demo           # Run full demo scenario
```

### Custom Hardhat Tasks

```bash
# Custom tasks defined in hardhat.config.js
npx hardhat accounts           # Show available accounts
npx hardhat balance --account 0x...  # Check account balance
npx hardhat deploy-factory     # Deploy only factory contract
npx hardhat create-group       # Create a test group
```

## 🔧 Troubleshooting

### Common Issues

1. **Compilation Errors**
   ```bash
   # Clear cache and artifacts
   npx hardhat clean
   npm run compile
   ```

2. **Test Failures**
   ```bash
   # Run tests individually to isolate issues
   npx hardhat test --grep "specific test name"
   ```

3. **Deployment Issues**
   ```bash
   # Check network configuration
   npx hardhat run scripts/deploy.js --network localhost
   ```

4. **Gas Estimation Errors**
   ```bash
   # Increase gas limit in hardhat.config.js
   gas: 6000000,
   gasPrice: 20000000000
   ```

### Debug Mode

Enable debug mode for detailed transaction logs:

```bash
# Set debug environment variable
DEBUG=* npx hardhat test

# Or use Hardhat's console.log in contracts
import "hardhat/console.sol";
console.log("Debug message:", value);
```

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Development Guide](https://ethereum.org/en/developers/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write comprehensive tests
4. Follow Solidity style guide
5. Submit a pull request

### Code Standards

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use NatSpec comments for all public functions
- Maintain test coverage above 95%
- Document all new features

---

**Built with ❤️ using Hardhat, OpenZeppelin, and Solidity**
