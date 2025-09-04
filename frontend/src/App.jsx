import { useState } from 'react';
import './App.css';
import { getConfig } from '../config/client';

function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState('Select a certificate file to get started');
	const [statusColor, setStatusColor] = useState('gray');
	const [mode, setMode] = useState('verify'); // "verify" or "register"
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setVerificationStatus('File too large. Maximum size is 10MB.');
			setStatusColor('red');
			setSelectedFile(null);
			return;
		}

		setSelectedFile(file);
		setVerificationStatus(`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready to ${mode}.`);
		setStatusColor('blue');
	};

	const handleVerify = async () => {
		if (!selectedFile) {
			setVerificationStatus('Please select a certificate file first.');
			setStatusColor('red');
			return;
		}

		setVerificationStatus(mode === 'verify' ? 'Verifying...' : 'Registering...');
		setStatusColor('orange');

		const formData = new FormData();
		formData.append('certificate', selectedFile);
		if (mode === 'register') {
			formData.append('metadata', `Certificate registered via web app on ${new Date().toISOString()}`);
		}

		try {
			const cfg = getConfig();
			const endpoint = mode === 'verify' ? '/api/verify' : '/api/register';
			const response = await fetch(`${cfg.backendUrl}${endpoint}`, {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (response.ok) {
				let message = data.message;

				// Enhance registration response with clearer instructions
				if (mode === 'register' && data.success && data.hash) {
					message += `\n\n📋 Your Certificate Hash: ${data.hash}\n\n🦊 Next Steps:\n1. Go to PolygonScan contract page\n2. Use "Write Contract" → "registerCertificate"\n3. Enter your hash and confirm with MetaMask\n4. Then verify the same file to see it as valid!`;
				}

				// Show hash for transparency in verification too
				if (data.hash && mode === 'verify') {
					message += `\n\nCertificate Hash: ${data.hash}`;
				}

				setVerificationStatus(message);
				setStatusColor(data.success ? 'green' : mode === 'register' ? 'orange' : 'red');
			} else {
				setVerificationStatus(data.message || `An error occurred during ${mode}.`);
				setStatusColor('red');
			}
		} catch (error) {
			console.error(`${mode} error:`, error);
			setVerificationStatus(`${mode} failed. Check the console for details.`);
			setStatusColor('red');
		}
	};

	return (
		<div className="container">
			<header>
				<h1>Blockchain Certificate Authenticator</h1>
				<p>Upload a certificate to verify its authenticity on the blockchain.</p>
			</header>
			<main>
				<div className="mode-selector">
					<button
						className={`mode-button ${mode === 'verify' ? 'active' : ''}`}
						onClick={() => setMode('verify')}
					>
						Verify Certificate
					</button>
					<button
						className={`mode-button ${mode === 'register' ? 'active' : ''}`}
						onClick={() => setMode('register')}
					>
						Register Certificate
					</button>
				</div>

				<div className="upload-section">
					<label
						htmlFor="certificate-upload"
						className="upload-label"
					>
						{selectedFile
							? `Selected: ${selectedFile.name}`
							: `Click to Upload Certificate to ${mode === 'verify' ? 'Verify' : 'Register'}`}
					</label>
					<input
						id="certificate-upload"
						type="file"
						onChange={handleFileChange}
						accept=".pdf,.json,.pem,.txt"
					/>
				</div>
				<button
					onClick={handleVerify}
					className="verify-button"
					disabled={isLoading}
				>
					{isLoading ? '⏳ Processing...' : mode === 'verify' ? 'Verify Certificate' : 'Register Certificate'}
				</button>
				<div className="status-section">
					<h2>{mode === 'verify' ? 'Verification Status' : 'Registration Status'}</h2>
					<p
						className="status-text"
						style={{ color: statusColor }}
					>
						{verificationStatus}
					</p>
				</div>
			</main>
			<footer>
				<p>&copy; 2025 Certificate Authenticator Inc.</p>
			</footer>
		</div>
	);
}

export default App;
