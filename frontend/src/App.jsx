import { useState } from 'react';
import './App.css';
import { getConfig } from '../config/client';

function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState('Select a certificate file to get started');
	const [statusColor, setStatusColor] = useState('gray');
	const [mode, setMode] = useState('verify'); // "verify" or "register"
	const [isLoading, setIsLoading] = useState(false);
	const [currentHash, setCurrentHash] = useState(null);
	const [justCopied, setJustCopied] = useState(false);

	const copyHashToClipboard = async () => {
		if (currentHash && !justCopied) {
			try {
				await navigator.clipboard.writeText(currentHash);
				setJustCopied(true);
				// Reset after 2 seconds
				setTimeout(() => {
					setJustCopied(false);
				}, 2000);
			} catch (err) {
				console.error('Failed to copy hash: ', err);
			}
		}
	};

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
		setCurrentHash(null); // Reset hash when new file is selected
		setJustCopied(false); // Reset copy state
		setVerificationStatus(
			`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready to ${
				mode === 'verify' ? 'verify' : 'hash'
			}.`
		);
		setStatusColor('blue');
	};

	const handleModeChange = (newMode) => {
		setMode(newMode);
		setCurrentHash(null); // Reset hash when switching modes
		setJustCopied(false); // Reset copy state
		// Reset status message when switching modes
		if (selectedFile) {
			setVerificationStatus(
				`File selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB). Ready to ${
					newMode === 'verify' ? 'verify' : 'hash'
				}.`
			);
			setStatusColor('blue');
		} else {
			setVerificationStatus('Select a certificate file to get started');
			setStatusColor('gray');
		}
	};

	const handleVerify = async () => {
		if (!selectedFile) {
			setVerificationStatus('Please select a certificate file first.');
			setStatusColor('red');
			return;
		}

		setVerificationStatus(mode === 'verify' ? 'Verifying...' : 'Generating hash...');
		setStatusColor('orange');
		setIsLoading(true);

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

				// Store the hash for copy functionality
				if (data.hash) {
					setCurrentHash(data.hash);
				}

				// Don't append hash to message - we'll display it separately
				setVerificationStatus(message);
				setStatusColor(data.success ? 'green' : mode === 'register' ? 'orange' : 'red');
			} else {
				setVerificationStatus(
					data.message ||
						`An error occurred during ${mode === 'verify' ? 'verification' : 'hash generation'}.`
				);
				setStatusColor('red');
			}
		} catch (error) {
			console.error(`${mode} error:`, error);
			setVerificationStatus(
				`${mode === 'verify' ? 'Verification' : 'Hash generation'} failed. Check the console for details.`
			);
			setStatusColor('red');
		} finally {
			setIsLoading(false);
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
						onClick={() => handleModeChange('verify')}
					>
						Verify
					</button>
					<button
						className={`mode-button ${mode === 'register' ? 'active' : ''}`}
						onClick={() => handleModeChange('register')}
					>
						Hash File
					</button>
				</div>

				<div className="upload-section">
					<label
						htmlFor="certificate-upload"
						className="upload-label"
					>
						{selectedFile
							? `Selected: ${selectedFile.name}`
							: `Click to Upload Certificate to ${mode === 'verify' ? 'Verify' : 'Hash'}`}
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
					{isLoading ? '⏳ Processing...' : mode === 'verify' ? 'Verify Certificate' : 'Get Hash'}
				</button>
				<div className="status-section">
					<h2>{mode === 'verify' ? 'Verification Status' : 'File Hash'}</h2>
					<p
						className="status-text"
						style={{ color: statusColor }}
					>
						{verificationStatus}
					</p>
					{currentHash && (
						<>
							<div className="hash-text">
								{mode === 'verify' ? 'Certificate Hash:' : 'Your Certificate Hash:'}
							</div>
							<div className="hash-text">{currentHash}</div>
						</>
					)}
					{currentHash && (
						<button
							onClick={copyHashToClipboard}
							className="copy-hash-button"
							type="button"
							disabled={justCopied}
						>
							{justCopied ? (
								<span className="checkmark"></span>
							) : (
								<span className="copy-button-text">Copy Hash</span>
							)}
						</button>
					)}
				</div>
			</main>
			<footer>
				<p>&copy; 2025 Blockchain Certificate Authenticator</p>
			</footer>
		</div>
	);
}

export default App;
