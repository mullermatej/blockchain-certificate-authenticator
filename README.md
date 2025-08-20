# Blockchain Certificate Authenticator

A simple Web3 application for storing and verifying document hashes on the blockchain.

## Features

- Upload and register document hashes
- Verify the authenticity of a document by comparing its hash
- Basic interaction with a Solidity smart contract

## Tech Stack

- Solidity
- React.js
- Ethers.js
- Remix IDE (for smart contract deployment)
- MetaMask (for wallet interaction)
- Polygon Amoy Testnet

## Setup

1. Clone the repository:

   ```sh
   git clone <repo-url>
   cd blockchain-certificate-authenticator
   ```

2. Copy environment template:

   ```sh
   cp .env.example .env
   ```

   Fill in your own RPC URL, contract address, etc.
   Both backend and frontend now read from this single root .env.

3. Install dependencies:

   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. Run the backend:

   ```sh
   cd backend
   npm run dev
   ```

5. Run the frontend:

   ```sh
   cd frontend
   npm run dev
   ```

---

This project was developed as part of the **Blockchain Applications** course  
at the **Faculty of Informatics, University of Pula**.

**Mentor:** doc. dr. sc. Nikola Tanković
