# Blockchain Certificate Authenticator

-   Web3 application for storing and verifying document hashes on the Polygon blockchain.
-   Video presentation: https://youtu.be/tgsgd4QxOp8
-   Project documentation: https://docs.google.com/document/d/1RKqeTLpRUuLRHw3jy8MCAKZKo1M_aLmB/edit?usp=sharing&ouid=113109044781873073635&rtpof=true&sd=true

## Features

-   **Certificate Upload & Verification** - Upload any document and verify its authenticity
-   **Blockchain Integration** - Secure verification using Polygon Amoy testnet
-   **Security Features** - File size validation, hash-based verification

## Tech Stack

-   **Frontend:** React.js + Vite
-   **Backend:** Node.js + Express.js
-   **Blockchain:** Solidity smart contract on Polygon Amoy
-   **Web3:** Ethers.js for blockchain interaction

## Project Structure

```
├── README.md
├── .env
├── TESTING_GUIDE.md
├── DEPLOYMENT_GUIDE.md
├── backend/
│   ├── server.js
│   ├── config/server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── config/client.js
│   └── package.json
└── contracts/
    ├── CertificateAuthenticator.sol
    ├── CertificateAuthenticator.abi.json
    └── DEPLOYMENT.md
```

## Key Features

### Application Stack

-   Full-stack React + Node.js application
-   Smart contract deployed and integrated
-   Real blockchain verification

### Blockchain Integration

-   Polygon Amoy testnet connection
-   Contract address: `0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9`
-   Hash-based certificate verification
-   MetaMask integration

## Academic Context

Project developed for the **Blockchain Applications** course at the **Faculty of Informatics, University of Pula**.

**Student:** Matej Muller  
**Mentor:** doc. dr. sc. Nikola Tanković  
**Academic Year:** 2024/2025
