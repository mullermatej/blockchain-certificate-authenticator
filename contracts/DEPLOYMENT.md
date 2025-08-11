# Smart Contract Deployment Guide

This guide will help you deploy the CertificateAuthenticator smart contract to the Polygon Amoy Testnet.

## Prerequisites

1. **MetaMask Wallet** with Polygon Amoy Testnet configured
2. **Test MATIC tokens** for Amoy (Polygon testnet) from the faucet
3. **Remix IDE** or **Hardhat** for deployment

## Option 1: Deploy using Remix IDE (Recommended for beginners)

### Step 1: Set up Remix

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file: `CertificateAuthenticator.sol`
3. Copy the contract code from `contracts/CertificateAuthenticator.sol`

### Step 2: Compile the Contract

1. Go to the "Solidity Compiler" tab
2. Select compiler version `0.8.19` or higher
3. Click "Compile CertificateAuthenticator.sol"

### Step 3: Configure Polygon Amoy Testnet in MetaMask

Add Polygon Amoy Testnet with these details:

- Network Name: Polygon Amoy
- RPC URL: <https://rpc-amoy.polygon.technology>
- Chain ID: 80002
- Currency Symbol: MATIC
- Block Explorer: <https://amoy.polygonscan.com/>

Note: Polygon Mumbai has been deprecated. Use Amoy instead.

### Step 4: Get Test MATIC (Amoy)

1. Visit the Polygon faucet: <https://faucet.polygon.technology/>
2. Enter your wallet address
3. Select the Amoy network (if asked) and request test MATIC tokens

### Step 5: Deploy the Contract

1. Go to "Deploy & Run Transactions" tab in Remix
2. Select "Injected Provider - MetaMask" as environment
3. Ensure you're connected to Polygon Amoy Testnet
4. Select `CertificateAuthenticator` contract
5. Click "Deploy"
6. Confirm transaction in MetaMask
7. **COPY THE CONTRACT ADDRESS** - you'll need this for the backend!

## After Deployment

1. **Copy the contract address** from the deployment output
2. **Copy the ABI** (available in Remix under the contract compilation artifacts)
3. **Update your backend configuration** in `backend/server.js`:
   - Replace `CONTRACT_ADDRESS` with your deployed contract address
   - Replace `CONTRACT_ABI` with the contract ABI
   - Update the provider URL to an Amoy RPC (public or your Infura/Alchemy project)

## Contract Functions

Your deployed contract will have these main functions:

- `registerCertificate(bytes32 hash, string metadata)` - Register a new certificate
- `verify(bytes32 hash)` - Check if a certificate exists
- `getCertificateInfo(bytes32 hash)` - Get detailed certificate information
- `getTotalCertificates()` - Get count of all certificates

## Verification on PolygonScan

After deployment, you can verify your contract on Amoy PolygonScan:

1. Go to <https://amoy.polygonscan.com>
2. Search for your contract address
3. Go to "Contract" tab → "Verify and Publish"
4. Upload your source code for public verification
