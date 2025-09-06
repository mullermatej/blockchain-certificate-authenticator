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
	const [isDragOver, setIsDragOver] = useState(false);
	const [fileInfo, setFileInfo] = useState(null);

	// Extract file information
	const getFileInfo = (file) => {
		if (!file) return null;

		const sizeInBytes = file.size;
		const sizeInKB = (sizeInBytes / 1024).toFixed(1);
		const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
		
		// Format file size
		const formattedSize = sizeInBytes < 1024 * 1024 
			? `${sizeInKB} KB` 
			: `${sizeInMB} MB`;

		// Get file type/extension
		const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'Unknown';
		
		// Get MIME type
		const mimeType = file.type || 'Unknown';
		
		// Get last modified date (creation date isn't available in browsers for security reasons)
		const lastModified = file.lastModified ? new Date(file.lastModified) : null;
		const formattedDate = lastModified 
			? lastModified.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
			: 'Unknown';

		return {
			name: file.name,
			size: formattedSize,
			sizeInBytes,
			type: fileExtension,
			mimeType,
			lastModified: formattedDate
		};
	};

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

	// Common file processing function
	const processFile = (file) => {
		if (!file) return;

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			setVerificationStatus('File too large. Maximum size is 10MB.');
			setStatusColor('red');
			setSelectedFile(null);
			setFileInfo(null);
			return;
		}

		setSelectedFile(file);
		setFileInfo(getFileInfo(file)); // Set file info
		setCurrentHash(null); // Reset hash when new file is selected
		setJustCopied(false); // Reset copy state
		setVerificationStatus(
			`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready to ${
				mode === 'verify' ? 'verify' : 'hash'
			}.`
		);
		setStatusColor('blue');
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		processFile(file);
	};

	// Drag and drop handlers
	const handleDragOver = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(true);
	};

	const handleDragLeave = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);
	};

	const handleDrop = (event) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragOver(false);

		const files = event.dataTransfer.files;
		if (files.length > 1) {
			setVerificationStatus('Please drop only one file at a time.');
			setStatusColor('red');
			return;
		}

		if (files.length === 1) {
			processFile(files[0]);
		}
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
			setFileInfo(null); // Clear file info when no file is selected
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
					<div
						className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
					>
						<label
							htmlFor="certificate-upload"
							className="upload-label"
						>
							{isDragOver ? (
								<>
									<span className="drag-text">Drop your file here</span>
								</>
							) : selectedFile ? (
								<>
									<span className="file-name">Selected: {selectedFile.name}</span>
								</>
							) : (
								<>
									<span className="upload-text">
										Drag & Drop or Click to Upload Certificate to{' '}
										{mode === 'verify' ? 'Verify' : 'Hash'}
									</span>
									<span className="file-types">Supported: PDF, JSON, PEM, TXT</span>
								</>
							)}
						</label>
						<input
							id="certificate-upload"
							type="file"
							onChange={handleFileChange}
							accept=".pdf,.json,.pem,.txt"
						/>
					</div>
				</div>

				{/* File Info Panel */}
				{fileInfo && (
					<div className="file-info-panel">
						<h3>File Information</h3>
						<div className="file-info-grid">
							<div className="info-item">
								<span className="info-label">Name:</span>
								<span className="info-value">{fileInfo.name}</span>
							</div>
							<div className="info-item">
								<span className="info-label">Size:</span>
								<span className="info-value">{fileInfo.size}</span>
							</div>
							<div className="info-item">
								<span className="info-label">Type:</span>
								<span className="info-value">{fileInfo.type}</span>
							</div>
							<div className="info-item">
								<span className="info-label">Modified:</span>
								<span className="info-value">{fileInfo.lastModified}</span>
							</div>
							<div className="info-item">
								<span className="info-label">MIME Type:</span>
								<span className="info-value">{fileInfo.mimeType || 'Unknown'}</span>
							</div>
						</div>
					</div>
				)}

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
