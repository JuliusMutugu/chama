# Chama - Cross-Platform Blockchain Savings System

A comprehensive decentralized platform for managing rotating savings and credit associations (chama) using smart contracts. Available as both web and mobile applications for seamless access across all devices.

## Platform Features

### Core Functionality
- **Smart Contract Automation**: Automatic fund collection and distribution
- **Transparent Operations**: All transactions recorded on blockchain
- **Cross-Platform Access**: Available on web browsers and mobile devices
- **Real-time Synchronization**: Seamless data sync across all platforms
- **Secure Payments**: Blockchain-based fund transfers with wallet integration

### User Experience
- **Responsive Web Interface**: Full-featured web application for desktop and tablet
- **Native Mobile Apps**: iOS and Android applications with native performance
- **Unified Account Management**: Single account works across all platforms
- **Push Notifications**: Real-time alerts for contributions, payouts, and group activities
- **Offline Capability**: View group information and history without internet connection

### Group Management
- **Multi-Platform Group Creation**: Create and manage groups from any device
- **Member Invitation System**: Invite members via email, SMS, or in-app sharing
- **Role-Based Permissions**: Admin, treasurer, secretary, and member roles
- **Fair Rotation System**: Automated, transparent fund distribution
- **Performance Tracking**: Member reliability scoring and analytics

## Technology Stack

### Frontend Applications
- **Web Application**: React.js with Web3.js integration
- **Mobile Applications**: React Native for iOS and Android
- **State Management**: Redux/Context API for consistent data flow
- **UI Components**: Native UI components with consistent design system
- **Wallet Integration**: MetaMask (web), WalletConnect (mobile)

### Backend Infrastructure
- **API Server**: FastAPI (Python) with async support
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT tokens with refresh mechanism
- **Real-time Updates**: WebSocket connections for live data
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Blockchain Integration
- **Smart Contracts**: Solidity contracts on Ethereum/Polygon networks
- **Development Framework**: Hardhat for contract development and testing
- **Web3 Libraries**: ethers.js for blockchain interactions
- **IPFS Integration**: Decentralized storage for group metadata
- **Gas Optimization**: Contract optimization for minimal transaction costs

## Application Architecture

```
chama/
├── backend/                    # FastAPI backend server
│   ├── app/
│   │   ├── api/               # REST API endpoints
│   │   ├── core/              # Core business logic
│   │   ├── models/            # Database models
│   │   ├── services/          # Business services
│   │   └── websockets/        # Real-time communication
│   ├── contracts/             # Smart contract ABIs
│   └── requirements.txt
│
├── frontend/                   # React web application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API and Web3 services
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── mobile/                     # React Native mobile app
│   ├── src/
│   │   ├── components/        # Mobile UI components
│   │   ├── screens/           # Mobile screens
│   │   ├── navigation/        # App navigation
│   │   ├── services/          # Mobile-specific services
│   │   └── utils/             # Mobile utilities
│   ├── android/               # Android-specific files
│   ├── ios/                   # iOS-specific files
│   └── package.json
│
├── blockchain/                 # Smart contracts and scripts
│   ├── contracts/             # Solidity smart contracts
│   ├── scripts/               # Deployment scripts
│   ├── test/                  # Contract tests
│   └── hardhat.config.js
│
├── shared/                     # Shared components and utilities
│   ├── types/                 # TypeScript type definitions
│   ├── constants/             # Shared constants
│   └── utils/                 # Cross-platform utilities
│
└── docs/                      # Documentation
    ├── api/                   # API documentation
    ├── mobile/                # Mobile app documentation
    └── deployment/            # Deployment guides
```

## Platform Setup

### Prerequisites
- **Node.js**: Version 16 or higher
- **Python**: Version 3.8 or higher
- **PostgreSQL**: Version 12 or higher
- **Git**: For version control
- **Mobile Development**: 
  - Xcode (for iOS development)
  - Android Studio (for Android development)
- **Blockchain Development**:
  - MetaMask browser extension
  - Test ETH for development

### Quick Start Guide

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Configure environment variables
python -m uvicorn app.main:app --reload
```

#### 2. Smart Contracts
```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network localhost
```

#### 3. Web Application
```bash
cd frontend
npm install
npm start
# Access at http://localhost:3000
```

#### 4. Mobile Application

**For iOS:**
```bash
cd mobile
npm install
cd ios && pod install && cd ..
npx react-native run-ios
```

**For Android:**
```bash
cd mobile
npm install
npx react-native run-android
```

### Platform Access
- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Mobile Apps**: Install via development builds or app stores
- **Admin Dashboard**: http://localhost:3000/admin

## Cross-Platform Features

### Synchronized User Experience
- **Unified Authentication**: Single sign-on across web and mobile
- **Real-time Data Sync**: Instant updates across all devices
- **Consistent UI/UX**: Familiar interface patterns on all platforms
- **Cross-platform Notifications**: Receive alerts on all logged-in devices

### Mobile-Specific Features
- **Biometric Authentication**: Fingerprint and Face ID login
- **Push Notifications**: Native mobile notifications for group activities
- **Camera Integration**: QR code scanning for wallet addresses
- **Contact Integration**: Invite contacts directly from phone
- **Offline Mode**: View group information without internet connection

### Web-Specific Features
- **Advanced Analytics**: Comprehensive dashboards and reporting
- **Bulk Operations**: Manage multiple groups and members efficiently
- **File Management**: Upload and manage group documents
- **Advanced Settings**: Detailed configuration options
- **Multi-tab Support**: Manage multiple groups simultaneously

## Deployment Options

### Web Application Deployment
- **Development**: Local development server
- **Staging**: Cloud hosting (Vercel, Netlify)
- **Production**: Enterprise cloud deployment (AWS, GCP, Azure)

### Mobile Application Distribution
- **Development**: Expo development builds
- **Testing**: TestFlight (iOS), Google Play Console (Android)
- **Production**: App Store and Google Play Store

### Backend Infrastructure
- **Local**: Docker containers for development
- **Cloud**: Scalable cloud deployment with load balancing
- **Database**: Managed database services (AWS RDS, Google Cloud SQL)

See individual README files in each directory for detailed platform-specific setup instructions.
