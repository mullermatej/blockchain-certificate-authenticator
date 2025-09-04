# 🔧 Manual Registration Guide

Since automatic registration requires a server private key (which should be kept secure), here's how to manually register your certificate on the blockchain:

## 🦊 Option 1: Using MetaMask (Recommended)

### Prerequisites:

-   MetaMask installed and configured for Polygon Amoy
-   Some test MATIC tokens in your wallet
-   Your certificate hash from the registration response

### Steps:

1. **Get your certificate hash** from the registration response (e.g., `0x17f58a68c6e7203e9efc1ad243d1dd2dd6e868713f4ef8502a1747d7ece7c5e4`)

2. **Open PolygonScan** and go to your contract:

    - Visit: https://amoy.polygonscan.com/address/0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9
    - Click "Contract" tab → "Write Contract"

3. **Connect MetaMask** by clicking "Connect to Web3"

4. **Call registerCertificate function**:

    - Find function `7. registerCertificate`
    - Enter your `_certificateHash` (the hash from step 1)
    - Enter `_metadata` (e.g., "My certificate registered manually")
    - Click "Write" and confirm in MetaMask

5. **Wait for confirmation** - you'll get a transaction hash

6. **Test verification** - now when you verify the same file, it should show as valid!

## 🔧 Option 2: For Automatic Registration (Advanced)

If you want automatic registration (like a production app), you need to:

1. **Create a dedicated wallet** for the server (don't use your personal wallet!)

2. **Get test MATIC** for that wallet from the faucet

3. **Add the private key** to your `.env` file:

    ```env
    SERVER_PRIVATE_KEY=your_wallet_private_key_here
    ```

    ⚠️ **WARNING**: Never commit private keys to git!

4. **Restart the backend** - it will now automatically register certificates

## ✅ Testing Your Registration

After manual registration:

1. **Upload the same file** you registered
2. **Switch to "Verify Certificate" mode**
3. **Click "Verify Certificate"**
4. **You should see**: "Certificate has been successfully verified on the blockchain."

## 🐛 Troubleshooting

-   **"Certificate already registered"**: The certificate was already registered before
-   **Transaction fails**: Make sure you have enough MATIC tokens
-   **Hash mismatch**: The exact same file must be used for both registration and verification
-   **Network issues**: Ensure you're on Polygon Amoy testnet

---

**The key insight**: Your app is working correctly! The backend generates the hash perfectly, but registration requires either a MetaMask transaction or a server wallet with private keys.
