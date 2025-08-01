const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ethers } = require('ethers');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- Blockchain Configuration ---
// Replace with actual contract address and ABI
const CONTRACT_ADDRESS = '0x...'; // TODO: Replace with contract address
const CONTRACT_ABI = [
    // TODO: Replace with contract's ABI
    // Example: "function verify(bytes32 certificateHash) public view returns (bool)"
];

// Connect to the blockchain (using a public provider for now)
// For production, use a more reliable provider like Infura or Alchemy
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // TODO: Replace with provider URL
let contract;

try {
    if (CONTRACT_ADDRESS !== '0x...') {
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        console.log('Connected to smart contract.');
    } else {
        console.warn('Smart contract address is not set. Verification will be simulated.');
    }
} catch (error) {
    console.error('Failed to connect to smart contract:', error.message);
    contract = null;
}


// --- API Endpoints ---

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Verification endpoint
app.post('/api/verify', upload.single('certificate'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No certificate file uploaded.' });
    }

    try {
        // 1. Create a hash of the certificate file
        const fileBuffer = req.file.buffer;
        const certificateHash = ethers.keccak256(fileBuffer);
        console.log(`Received file. Hash: ${certificateHash}`);

        // 2. Check if the contract is configured
        if (!contract) {
            console.warn('Simulating verification because contract is not configured.');
            // Simulate a delay and random result
            await new Promise(resolve => setTimeout(resolve, 1500));
            const simulatedResult = Math.random() > 0.5;
            return res.json({
                success: simulatedResult,
                message: simulatedResult ? 'Certificate is valid (Simulated)' : 'Certificate is invalid (Simulated)',
                hash: certificateHash
            });
        }

        // 3. Call the smart contract's verification function
        console.log('Querying smart contract...');
        const isValid = await contract.verify(certificateHash);
        console.log(`Contract returned: ${isValid}`);

        if (isValid) {
            res.json({ success: true, message: 'Certificate has been successfully verified on the blockchain.', hash: certificateHash });
        } else {
            res.json({ success: false, message: 'Certificate is not valid or not found on the blockchain.', hash: certificateHash });
        }

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ success: false, message: 'An error occurred during verification.', error: error.message });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
