# 🔐 Blockchain Certificate Authenticator

A complete Web3 application for storing and verifying document hashes on the Polygon blockchain.

## ✨ Features

-   📁 **Certificate Upload & Verification** - Upload any document and verify its authenticity
-   🔗 **Blockchain Integration** - Secure verification using Polygon Amoy testnet
-   🎯 **Dual Mode Operation** - Both verify existing certificates and register new ones
-   🛡️ **Security Features** - File size validation, hash-based verification
-   🎨 **Modern UI** - Clean, responsive interface with real-time feedback
-   ⚡ **Fast Performance** - Optimized for quick verification and registration

## 🏗️ Tech Stack

-   **Frontend:** React.js + Vite
-   **Backend:** Node.js + Express.js
-   **Blockchain:** Solidity smart contract on Polygon Amoy
-   **Web3:** Ethers.js for blockchain interaction
-   **Deployment:** Ready for Vercel/Netlify (frontend) + Railway/Heroku (backend)

## 🚀 Quick Start

1. **Clone the repository:**

    ```bash
    git clone <repo-url>
    cd blockchain-certificate-authenticator
    ```

2. **Environment Setup:**

    ```bash
    cp .env.example .env
    # Edit .env with your configuration
    ```

3. **Install dependencies:**

    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```

4. **Start the application:**

    ```bash
    # Terminal 1: Backend
    cd backend && npm start

    # Terminal 2: Frontend
    cd frontend && npm run dev
    ```

5. **Open your browser:** Navigate to `http://localhost:5173`

## 📋 Configuration

### Environment Variables (.env):

```env
# Blockchain Configuration
CHAIN_ID=80002
RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_ADDRESS=0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Frontend Configuration
VITE_CHAIN_ID=80002
VITE_RPC_URL=https://rpc-amoy.polygon.technology
VITE_CONTRACT_ADDRESS=0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9
VITE_BACKEND_URL=http://localhost:3001
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

Quick test:

```bash
# Test backend health
curl http://localhost:3001/api/health

# Test certificate verification
echo "test content" > test.txt
curl -X POST -F "certificate=@test.txt" http://localhost:3001/api/verify
```

## 🚀 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production deployment instructions.

## 📁 Project Structure

```
├── README.md                   # This file
├── .env                       # Environment configuration
├── TESTING_GUIDE.md           # Testing instructions
├── DEPLOYMENT_GUIDE.md        # Production deployment guide
├── backend/                   # Node.js backend
│   ├── server.js             # Main server file
│   ├── config/server.js      # Configuration management
│   └── package.json          # Backend dependencies
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── App.css           # Application styles
│   │   └── config/client.js  # Frontend configuration
│   └── package.json          # Frontend dependencies
└── contracts/                 # Smart contracts
    ├── CertificateAuthenticator.sol    # Main contract
    ├── CertificateAuthenticator.abi.json  # Contract ABI
    └── DEPLOYMENT.md          # Contract deployment guide
```

## 🔑 Key Features Implemented

### ✅ **Complete Application Stack**

-   Full-stack React + Node.js application
-   Smart contract deployed and integrated
-   Real blockchain verification working

### ✅ **User Experience**

-   Intuitive file upload interface
-   Real-time status updates with loading states
-   Dual mode: Verify existing or register new certificates
-   File validation and error handling

### ✅ **Blockchain Integration**

-   Connected to live Polygon Amoy testnet
-   Contract address: `0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9`
-   Hash-based certificate verification
-   Registration workflow with MetaMask integration

### ✅ **Security & Validation**

-   File size limits (10MB max)
-   Input sanitization
-   CORS configuration
-   Error handling and user feedback

### ✅ **Production Ready**

-   Environment configuration system
-   Health check endpoints
-   Comprehensive documentation
-   Deployment guides for multiple platforms

## 🎓 Academic Context

This project was developed as part of the **Blockchain Applications** course at the **Faculty of Informatics, University of Pula**.

**Student:** Matej Muller  
**Mentor:** doc. dr. sc. Nikola Tanković  
**Academic Year:** 2024/2025

## 📊 Project Status: **100% Complete** ✅

### ✅ **Completed Components:**

-   [x] Smart contract development and deployment
-   [x] Backend API with blockchain integration
-   [x] Frontend application with dual-mode functionality
-   [x] Full-stack integration and testing
-   [x] Error handling and user experience
-   [x] Documentation and deployment guides
-   [x] Security considerations and validation

### 🎯 **Ready for:**

-   ✅ Academic submission and grading
-   ✅ Production deployment
-   ✅ Further development and features
-   ✅ Portfolio demonstration

## 🔮 Future Enhancements

-   🔐 MetaMask wallet integration for direct registration
-   👥 Multi-user authentication system
-   📊 Analytics dashboard for certificate statistics
-   🔔 Email notifications for certificate events
-   🌐 Multi-language support
-   📱 Mobile application
-   🏢 Institutional admin panel

---

**🎉 Project Status: Complete and Ready for Submission! 🎉**
