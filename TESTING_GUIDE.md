# 🧪 Complete Testing Guide

## Testing the Full Application Stack

### Prerequisites

-   Backend running on `http://localhost:3001`
-   Frontend running on `http://localhost:5173`
-   Contract deployed at: `0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9`

## 🚀 Quick Start Testing

### 1. **Health Check**

```bash
curl http://localhost:3001/api/health
```

**Expected:** `{"status":"ok","chainId":80002,"rpcSet":true,"hasContractAddress":true}`

### 2. **Test Certificate Verification**

```bash
# Create a test file
echo "This is my test certificate content" > test-cert.txt

# Test verification (should return false for new certificate)
curl -X POST -F "certificate=@test-cert.txt" http://localhost:3001/api/verify
```

**Expected:** `{"success":false,"message":"Certificate is not valid or not found on the blockchain."}`

### 3. **Test Certificate Registration**

```bash
# Test registration endpoint
curl -X POST -F "certificate=@test-cert.txt" -F "metadata=Test certificate" http://localhost:3001/api/register
```

**Expected:** Hash generation and MetaMask instructions

## 🌐 Frontend Testing

### Manual Testing Steps:

1. **Open Application:** Navigate to `http://localhost:5173`
2. **Mode Switching:** Toggle between "Verify Certificate" and "Register Certificate"
3. **File Upload:**
    - Try uploading different file types (.pdf, .txt, .json)
    - Test file size validation (try >10MB file)
4. **Verification:** Upload a test file and click "Verify Certificate"
5. **Registration:** Upload a test file and click "Register Certificate"

### Expected Behaviors:

-   ✅ File size validation works
-   ✅ Mode switching updates UI text
-   ✅ Loading states show during processing
-   ✅ Hash values are displayed for transparency
-   ✅ Error messages are user-friendly

## 🔗 Blockchain Integration Testing

### Using PolygonScan:

1. Visit: https://amoy.polygonscan.com/address/0xF42657cBa768452f82BBa9ecE3B0E6E1c3b18de9
2. Check contract interactions
3. Verify that `verify()` calls are happening

### Using MetaMask (for actual registration):

1. Connect to Polygon Amoy Testnet
2. Have test MATIC tokens
3. Call `registerCertificate` function manually
4. Test verification of registered certificate

## 🐛 Common Issues & Solutions

### Backend Issues:

-   **Port 3001 in use:** `killall node` then restart
-   **Contract not connected:** Check `.env` file has correct `CONTRACT_ADDRESS`
-   **RPC errors:** Verify `RPC_URL` in `.env`

### Frontend Issues:

-   **CORS errors:** Ensure backend `CORS_ORIGIN` matches frontend URL
-   **Network errors:** Check backend is running on port 3001

### Contract Issues:

-   **Transaction fails:** Ensure contract is not paused
-   **Gas errors:** Check you have sufficient MATIC tokens

## 📊 Performance Testing

### File Size Limits:

-   ✅ Small files (< 1KB): Should process quickly
-   ✅ Medium files (1-100KB): Should process within 2-3 seconds
-   ✅ Large files (1-10MB): Should process within 5-10 seconds
-   ❌ Oversized files (>10MB): Should be rejected

### Network Resilience:

-   Test with slow network connections
-   Test with intermittent connectivity
-   Verify proper error handling

## 🎯 Success Criteria

Your application is working correctly if:

-   ✅ Health endpoint returns positive status
-   ✅ File uploads work for all supported formats
-   ✅ Hash generation is consistent for same files
-   ✅ Blockchain verification calls succeed
-   ✅ Registration provides clear next steps
-   ✅ Error handling is graceful and informative
-   ✅ UI is responsive and intuitive

## 🚨 Security Considerations

### What's Implemented:

-   ✅ File size validation
-   ✅ CORS configuration
-   ✅ Input sanitization
-   ✅ Hash-based verification (no file content stored)

### Production Considerations:

-   🔒 Add authentication for registration
-   🔒 Implement rate limiting
-   🔒 Add file type restrictions
-   🔒 Use HTTPS in production
-   🔒 Environment variable security

---

**Status:** ✅ All core functionality tested and working!
