import { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('Awaiting verification');
  const [statusColor, setStatusColor] = useState('gray');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setVerificationStatus('File selected. Ready to verify.');
    setStatusColor('orange');
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setVerificationStatus('Please select a certificate file first.');
      setStatusColor('red');
      return;
    }

    setVerificationStatus('Verifying...');
    setStatusColor('orange');

    const formData = new FormData();
    formData.append('certificate', selectedFile);

    try {
      const response = await fetch('http://localhost:3001/api/verify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus(data.message);
        setStatusColor(data.valid ? 'green' : 'red');
      } else {
        setVerificationStatus(data.message || 'An error occurred during verification.');
        setStatusColor('red');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('Verification failed. Check the console for details.');
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
        <div className="upload-section">
          <label htmlFor="certificate-upload" className="upload-label">
            {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to Upload Certificate'}
          </label>
          <input
            id="certificate-upload"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.json,.pem" 
          />
        </div>
        <button onClick={handleVerify} className="verify-button">
          Verify Certificate
        </button>
        <div className="status-section">
          <h2>Verification Status</h2>
          <p className="status-text" style={{ color: statusColor }}>
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

