const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ethers } = require('ethers');
const { getConfig } = require('./config/server');

// Load environment variables
require('dotenv').config({ path: '../.env' });

const app = express();
const cfg = getConfig();
const port = cfg.port;

// Middleware
app.use(cors({ origin: cfg.corsOrigin }));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- Blockchain Configuration ---
const CONTRACT_ADDRESS = cfg.contractAddress || '0x...'; // Use address from config
const CONTRACT_ABI = [
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: '_certificateHash',
				type: 'bytes32',
			},
		],
		name: 'verify',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: '_certificateHash',
				type: 'bytes32',
			},
			{
				internalType: 'string',
				name: '_metadata',
				type: 'string',
			},
		],
		name: 'registerCertificate',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: '_certificateHash',
				type: 'bytes32',
			},
		],
		name: 'getCertificateInfo',
		outputs: [
			{
				internalType: 'address',
				name: 'registrar',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'timestamp',
				type: 'uint256',
			},
			{
				internalType: 'string',
				name: 'metadata',
				type: 'string',
			},
			{
				internalType: 'bool',
				name: 'exists',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'bytes32',
				name: 'certificateHash',
				type: 'bytes32',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'registrar',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'metadata',
				type: 'string',
			},
		],
		name: 'CertificateRegistered',
		type: 'event',
	},
];

// Connect to Polygon Amoy Testnet
const PROVIDER_URL = cfg.rpcUrl;
const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
let contract;
let contractWithSigner; // For transactions

if (!cfg.contractAddress || cfg.contractAddress === '0x...') {
	console.warn('[config] CONTRACT_ADDRESS missing — backend will accept it later.');
}

try {
	if (CONTRACT_ADDRESS !== '0x...') {
		contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

		// Set up contract with signer if private key is available
		if (cfg.serverPrivateKey) {
			const wallet = new ethers.Wallet(cfg.serverPrivateKey, provider);
			contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
			console.log('Connected to smart contract with server wallet for automatic registration.');
		} else {
			console.log('Connected to smart contract (read-only). Add SERVER_PRIVATE_KEY for automatic registration.');
		}
	} else {
		console.warn('Smart contract address is not set. Verification will be simulated.');
	}
} catch (error) {
	console.error('Failed to connect to smart contract:', error.message);
	contract = null;
	contractWithSigner = null;
}

// --- API Endpoints ---

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.status(200).json({
		status: 'ok',
		chainId: cfg.chainId,
		rpcSet: Boolean(cfg.rpcUrl),
		hasContractAddress: Boolean(cfg.contractAddress),
		canAutoRegister: Boolean(contractWithSigner),
		env: cfg.nodeEnv,
		message: 'Backend is running',
	});
});

// Certificate registration endpoint
app.post('/api/register', upload.single('certificate'), async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ success: false, message: 'No certificate file uploaded.' });
	}

	try {
		// 1. Create a hash of the certificate file
		const fileBuffer = req.file.buffer;
		const certificateHash = ethers.keccak256(fileBuffer);
		const metadata = req.body.metadata || `Certificate uploaded on ${new Date().toISOString()}`;

		console.log(`Registering certificate. Hash: ${certificateHash}`);

		// 2. Check if the contract is configured
		if (!contract) {
			return res.status(500).json({
				success: false,
				message: 'Smart contract not configured. Cannot register certificate.',
			});
		}

		// 3. Check if certificate already exists
		const exists = await contract.verify(certificateHash);
		if (exists) {
			return res.json({
				success: false,
				message: 'Certificate is already registered on the blockchain.',
				hash: certificateHash,
			});
		}

		// 4. Try automatic registration if server wallet is configured
		if (contractWithSigner) {
			try {
				console.log('Attempting automatic registration on blockchain...');
				const tx = await contractWithSigner.registerCertificate(certificateHash, metadata);
				console.log('Transaction submitted:', tx.hash);

				// Wait for transaction confirmation
				const receipt = await tx.wait();
				console.log('Transaction confirmed in block:', receipt.blockNumber);

				return res.json({
					success: true,
					message: 'Certificate successfully registered on the blockchain!',
					hash: certificateHash,
					transactionHash: tx.hash,
					blockNumber: receipt.blockNumber,
					metadata: metadata,
				});
			} catch (registrationError) {
				console.error('Automatic registration failed:', registrationError.message);

				// Check if it's already registered
				if (registrationError.message.includes('already registered')) {
					return res.json({
						success: false,
						message: 'Certificate is already registered on the blockchain.',
						hash: certificateHash,
					});
				}

				// Fall back to manual instructions if automatic registration fails
				console.log('Falling back to manual registration instructions...');
			}
		}

		// 5. Fallback: Provide manual MetaMask instructions
		res.json({
			success: true,
			message: contractWithSigner
				? 'Automatic registration failed. Use MetaMask to register it manually on the blockchain.'
				: 'Certificate hash generated successfully. Use MetaMask to register it on the blockchain.',
			hash: certificateHash,
			contractAddress: CONTRACT_ADDRESS,
			metadata: metadata,
			instructions: {
				step1: 'Open MetaMask and connect to Polygon Amoy Testnet',
				step2: 'Call registerCertificate function with hash and metadata',
				step3: 'Confirm transaction in MetaMask',
			},
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({
			success: false,
			message: 'An error occurred during registration.',
			error: error.message,
		});
	}
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
		// TEMP: Force simulation for testing frontend UI
		const FORCE_SIMULATION = false; // Set to true to test frontend with mock data

		if (!contract || FORCE_SIMULATION) {
			console.warn(
				FORCE_SIMULATION
					? 'Using simulation mode for testing'
					: 'Simulating verification because contract is not configured.'
			);
			await new Promise((resolve) => setTimeout(resolve, 1500));
			const simulatedResult = Math.random() > 0.5;

			// Add mock transaction details for testing the frontend
			let mockTxDetails = null;
			if (simulatedResult) {
				mockTxDetails = {
					txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
					blockNumber: 12345678,
					timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
					registeredBy: '0xabcdef1234567890abcdef1234567890abcdef12',
					gasUsed: '21000',
					confirmations: 1234,
					explorerUrl:
						'https://amoy.polygonscan.com/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
					blockHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
				};
			}

			return res.json({
				success: simulatedResult,
				message: simulatedResult ? 'Certificate is valid (Simulated)' : 'Certificate is invalid (Simulated)',
				hash: certificateHash,
				txDetails: mockTxDetails,
			});
		}

		// 3. Call the smart contract's verification function
		console.log('Querying smart contract...');
		const isValid = await contract.verify(certificateHash);
		console.log(`Contract returned: ${isValid}`);

		if (isValid) {
			// Try to get registration date for enhanced message
			let registrationDate = null;
			try {
				const certInfo = await contract.getCertificateInfo(certificateHash);
				if (certInfo.exists) {
					registrationDate = new Date(Number(certInfo.timestamp) * 1000);
				}
			} catch (error) {
				console.log('Could not fetch registration date:', error.message);
			}

			// Create enhanced message with registration date if available
			let message = 'Certificate has been successfully verified on the blockchain.';
			let registrationInfo = null;

			if (registrationDate) {
				const formattedDate = registrationDate.toLocaleDateString('hr-HR', {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					timeZone: 'Europe/Zagreb',
				});
				registrationInfo = `Registered on ${formattedDate}`;
			}

			res.json({
				success: true,
				message: message,
				registrationInfo: registrationInfo,
				hash: certificateHash,
			});
		} else {
			res.json({
				success: false,
				message: 'Certificate is not valid or not found on the blockchain.',
				hash: certificateHash,
			});
		}
	} catch (error) {
		console.error('Verification error:', error);
		res.status(500).json({
			success: false,
			message: 'An error occurred during verification.',
			error: error.message,
		});
	}
});

// Start the server
app.listen(port, () => {
	console.log(`[server] listening on :${port} (env ${cfg.nodeEnv}, chain ${cfg.chainId})`);
});
