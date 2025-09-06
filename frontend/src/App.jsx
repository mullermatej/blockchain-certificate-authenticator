import { useState, useEffect } from 'react';
import './App.css';
import { getConfig } from '../config/client';

function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [verificationStatus, setVerificationStatus] = useState('Select a certificate file to get started');
	const [statusColor, setStatusColor] = useState('gray');
	const [isLoading, setIsLoading] = useState(false);
	const [currentHash, setCurrentHash] = useState(null);
	const [justCopied, setJustCopied] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);
	const [fileInfo, setFileInfo] = useState(null);
	const [recentFiles, setRecentFiles] = useState([]);
	const [showAllRecent, setShowAllRecent] = useState(false);
	const [copiedHashes, setCopiedHashes] = useState(new Set());
	const [registrationInfo, setRegistrationInfo] = useState(null);
	const [verificationData, setVerificationData] = useState(null);

	// Load recent files from localStorage on component mount
	useEffect(() => {
		const savedRecentFiles = localStorage.getItem('bca-recent-files');
		if (savedRecentFiles) {
			try {
				setRecentFiles(JSON.parse(savedRecentFiles));
			} catch (error) {
				console.error('Error loading recent files:', error);
				localStorage.removeItem('bca-recent-files');
			}
		}
	}, []);

	// Save recent files to localStorage whenever it changes
	useEffect(() => {
		if (recentFiles.length > 0) {
			localStorage.setItem('bca-recent-files', JSON.stringify(recentFiles));
		}
	}, [recentFiles]);

	// Add file to recent files list
	const addToRecentFiles = (file, hash, verificationResult) => {
		const fileEntry = {
			id: Date.now(), // Simple ID based on timestamp
			name: file.name,
			size: file.size,
			type: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
			hash: hash,
			result: verificationResult, // 'verified', 'not-found'
			timestamp: new Date().toISOString(),
			formattedDate: new Date().toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			}),
		};

		setRecentFiles((prev) => {
			// Remove any existing entry with the same name and hash to avoid duplicates
			const filtered = prev.filter((item) => !(item.name === file.name && item.hash === hash));
			// Add new entry at the beginning and limit to 10 recent files
			return [fileEntry, ...filtered].slice(0, 10);
		});
	};

	// Clear all recent files
	const clearRecentFiles = () => {
		setRecentFiles([]);
		localStorage.removeItem('bca-recent-files');
	};

	// Delete individual recent file
	const deleteRecentFile = (fileId) => {
		setRecentFiles((prev) => {
			const updated = prev.filter((file) => file.id !== fileId);
			if (updated.length === 0) {
				localStorage.removeItem('bca-recent-files');
			}
			return updated;
		});
	};

	// Extract file information
	const getFileInfo = (file) => {
		if (!file) return null;

		const sizeInBytes = file.size;
		const sizeInKB = (sizeInBytes / 1024).toFixed(1);
		const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

		// Format file size
		const formattedSize = sizeInBytes < 1024 * 1024 ? `${sizeInKB} KB` : `${sizeInMB} MB`;

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
					minute: '2-digit',
			  })
			: 'Unknown';

		return {
			name: file.name,
			size: formattedSize,
			sizeInBytes,
			type: fileExtension,
			mimeType,
			lastModified: formattedDate,
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

	// Copy hash from recent files with feedback
	const copyRecentHash = async (hash) => {
		try {
			await navigator.clipboard.writeText(hash);
			setCopiedHashes((prev) => new Set(prev).add(hash));
			// Reset after 2 seconds
			setTimeout(() => {
				setCopiedHashes((prev) => {
					const newSet = new Set(prev);
					newSet.delete(hash);
					return newSet;
				});
			}, 2000);
		} catch (err) {
			console.error('Failed to copy hash: ', err);
		}
	};

	// Export verification certificate as printable document
	const exportVerificationCertificate = () => {
		if (!verificationData) return;

		const printWindow = window.open('', '_blank');
		const currentDate = new Date().toLocaleDateString('hr-HR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'Europe/Zagreb',
		});
		const currentTime = new Date().toLocaleTimeString('hr-HR', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Europe/Zagreb',
		});

		const certificateHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification</title>
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 20px;
            background: white;
            font-size: 12px;
        }
        
        .certificate-container {
            border: 2px solid #37688a;
            padding: 25px;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #37688a;
            padding-bottom: 15px;
        }
        
        .header h1 {
            color: #37688a;
            font-size: 1.8rem;
            margin: 0 0 5px 0;
            font-weight: bold;
        }
        
        .header h2 {
            color: #666;
            font-size: 1rem;
            margin: 0;
            font-weight: normal;
        }
        
        .verification-badge {
            background: #d4edda;
            color: #155724;
            padding: 8px 15px;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            text-align: center;
            margin: 15px 0;
            border: 1px solid #c3e6cb;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 20px 0;
        }
        
        .detail-item {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        
        .detail-label {
            font-weight: bold;
            color: #37688a;
            font-size: 11px;
            margin-bottom: 3px;
        }
        
        .detail-value {
            color: #333;
            font-size: 11px;
            word-break: break-all;
        }
        
        .hash-section {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            margin: 15px 0;
            border-left: 3px solid #37688a;
        }
        
        .hash-title {
            font-weight: bold;
            color: #37688a;
            margin-bottom: 5px;
            font-size: 11px;
        }
        
        .hash-value {
            font-family: 'Courier New', monospace;
            font-size: 9px;
            word-break: break-all;
            color: #333;
            line-height: 1.3;
        }
        
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #37688a;
            font-size: 10px;
            color: #666;
        }
        
        .timestamp {
            font-style: italic;
            color: #888;
            margin-top: 8px;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .certificate-container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="header">
            <h1>Certificate Verification</h1>
            <h2>Blockchain Certificate Authenticator</h2>
        </div>
        
        <div class="verification-badge">
            ✓ Certificate Successfully Verified
        </div>
        
        <div class="details-grid">
            <div class="detail-item">
                <div class="detail-label">Certificate File:</div>
                <div class="detail-value">${verificationData.fileName}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">File Size:</div>
                <div class="detail-value">${verificationData.fileSize}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Verification Date:</div>
                <div class="detail-value">${currentDate} at ${currentTime}</div>
            </div>
            ${
				verificationData.registrationInfo
					? `
            <div class="detail-item">
                <div class="detail-label">Registration Date:</div>
                <div class="detail-value">${verificationData.registrationInfo.replace('Registered on ', '')}</div>
            </div>
            `
					: ''
			}
        </div>
        
        <div class="hash-section">
            <div class="hash-title">Certificate Hash (SHA-256):</div>
            <div class="hash-value">${verificationData.hash}</div>
        </div>
        
        <div class="footer">
            <p><strong>Blockchain Certificate Authenticator</strong></p>
            <p>This certificate has been verified on the Polygon blockchain network.</p>
            <p class="timestamp">Generated on ${currentDate} at ${currentTime} (Zagreb, Croatia)</p>
        </div>
    </div>
</body>
</html>
        `;

		printWindow.document.write(certificateHtml);
		printWindow.document.close();
		printWindow.focus();

		// Auto-trigger print dialog after a short delay
		setTimeout(() => {
			printWindow.print();
		}, 500);
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
		setRegistrationInfo(null); // Reset registration info when new file is selected
		setVerificationData(null); // Reset verification data when new file is selected
		setJustCopied(false); // Reset copy state
		setVerificationStatus(`File selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready to verify.`);
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

	const handleVerify = async () => {
		if (!selectedFile) {
			setVerificationStatus('Please select a certificate file first.');
			setStatusColor('red');
			return;
		}

		setVerificationStatus('Verifying...');
		setStatusColor('orange');
		setIsLoading(true);

		const formData = new FormData();
		formData.append('certificate', selectedFile);

		try {
			const cfg = getConfig();
			const endpoint = '/api/verify';
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

					// Add to recent files list
					const result = data.success ? 'verified' : 'not-found';
					addToRecentFiles(selectedFile, data.hash, result);
				}

				// Store registration info if available
				if (data.registrationInfo) {
					setRegistrationInfo(data.registrationInfo);
				} else {
					setRegistrationInfo(null);
				}

				// Store verification data for export functionality (only for successful verifications)
				if (data.success && data.hash) {
					setVerificationData({
						fileName: selectedFile.name,
						fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
						hash: data.hash,
						registrationInfo: data.registrationInfo,
						verificationDate: new Date().toISOString(),
					});
				} else {
					setVerificationData(null);
				}

				// Don't append hash to message - we'll display it separately
				setVerificationStatus(message);
				setStatusColor(data.success ? 'green' : 'red');
			} else {
				setVerificationStatus(data.message || 'An error occurred during verification.');
				setStatusColor('red');
			}
		} catch (error) {
			console.error('Verification error:', error);
			setVerificationStatus('Verification failed. Check the console for details.');
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
										Drag & Drop or Click to Upload Certificate to Verify
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
					{isLoading ? 'Processing...' : 'Verify Certificate'}
				</button>
				<div className="status-section">
					<h2>Verification Status</h2>
					<p
						className="status-text"
						style={{ color: statusColor }}
					>
						{verificationStatus}
					</p>
					{registrationInfo && <p className="registration-info">{registrationInfo}</p>}
					{currentHash && (
						<>
							<div className="main-hash-display">
								<code className="main-hash-code">{currentHash}</code>
							</div>
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
								<>
									<div className="copy-icon"></div>
									<span className="copy-button-text">Copy Hash</span>
								</>
							)}
						</button>
					)}
					{verificationData && (
						<button
							onClick={exportVerificationCertificate}
							className="export-certificate-button"
							type="button"
						>
							<div className="export-icon"></div>
							<span className="export-button-text">Export</span>
						</button>
					)}
				</div>

				{/* Recent Files Section */}
				{recentFiles.length > 0 && (
					<div className="recent-files-section">
						<div className="recent-files-header">
							<h3>Recent Verifications</h3>
							<button
								className="clear-recent-btn"
								onClick={clearRecentFiles}
								title="Clear all recent files"
							>
								Clear All
							</button>
						</div>
						<div className="recent-files-list">
							{(showAllRecent ? recentFiles : recentFiles.slice(0, 2)).map((file) => (
								<div
									key={file.id}
									className={`recent-file-item ${file.result}`}
								>
									<div className="file-item-header">
										<div className="file-info">
											<div className="file-name">{file.name}</div>
											<div className="file-details">
												<span className="file-type">{file.type}</span>
												<span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
												<span className="file-date">{file.formattedDate}</span>
											</div>
										</div>
										<button
											className="delete-file-btn"
											onClick={() => deleteRecentFile(file.id)}
											title="Delete this entry"
										>
											<div className="delete-icon"></div>
										</button>
									</div>
									<div className="file-status">
										<span className={`status-badge ${file.result}`}>
											{file.result === 'verified' && '✓ Verified'}
											{file.result === 'not-found' && '✗ Not Found'}
											{file.result === 'hashed' && '# Hashed'}
										</span>
									</div>
									<div className="file-hash">
										<code className="hash-code">{file.hash}</code>
										<button
											className="copy-hash-small"
											onClick={() => copyRecentHash(file.hash)}
											title="Copy hash"
											disabled={copiedHashes.has(file.hash)}
										>
											{copiedHashes.has(file.hash) ? (
												<span className="checkmark-small"></span>
											) : (
												<div className="copy-icon"></div>
											)}
										</button>
									</div>
								</div>
							))}
						</div>
						{recentFiles.length > 2 && (
							<div className="show-more-section">
								<button
									className="show-more-btn"
									onClick={() => setShowAllRecent(!showAllRecent)}
								>
									{showAllRecent ? 'Show Less' : `Show ${recentFiles.length - 2} More`}
								</button>
							</div>
						)}
					</div>
				)}
			</main>
			<footer>
				<p>&copy; 2025 Blockchain Certificate Authenticator</p>
			</footer>
		</div>
	);
}

export default App;
