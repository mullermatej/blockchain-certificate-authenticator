// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CertificateAuthenticator
 * @dev Smart contract for storing and verifying certificate hashes on the blockchain
 * @author Matej Muller - University of Pula, Faculty of Informatics
 */
contract CertificateAuthenticator {
    
    // Events for logging important contract activities
    event CertificateRegistered(bytes32 indexed certificateHash, address indexed registrar, uint256 timestamp);
    event CertificateVerified(bytes32 indexed certificateHash, address indexed verifier, bool isValid);
    
    // Struct to store certificate information
    struct Certificate {
        bytes32 hash;           // Hash of the certificate
        address registrar;      // Address that registered the certificate
        uint256 timestamp;      // When the certificate was registered
        bool exists;            // Flag to check if certificate exists
        string metadata;        // Optional metadata (e.g., certificate type, issuer info)
    }
    
    // Mapping from certificate hash to certificate data
    mapping(bytes32 => Certificate) private certificates;
    
    // Array to keep track of all registered certificate hashes
    bytes32[] private certificateHashes;
    
    // Mapping to track how many certificates each address has registered
    mapping(address => uint256) private registrarCounts;
    
    // Contract owner (for administrative functions)
    address public owner;
    
    // Modifier to restrict access to contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the contract deployer as the owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a new certificate hash on the blockchain
     * @param _certificateHash The hash of the certificate to register
     * @param _metadata Optional metadata about the certificate (keep under 1KB for gas efficiency)
     */
    function registerCertificate(bytes32 _certificateHash, string memory _metadata) 
        external 
        whenNotPaused 
    {
        require(_certificateHash != bytes32(0), "Certificate hash cannot be empty");
        require(!certificates[_certificateHash].exists, "Certificate already registered");
        require(bytes(_metadata).length <= 1024, "Metadata too large (max 1KB)");
        
        // Create and store the certificate
        certificates[_certificateHash] = Certificate({
            hash: _certificateHash,
            registrar: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            metadata: _metadata
        });
        
        // Add to the array of certificate hashes
        certificateHashes.push(_certificateHash);
        
        // Update registrar count
        registrarCounts[msg.sender]++;
        
        // Emit event
        emit CertificateRegistered(_certificateHash, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verify if a certificate hash exists on the blockchain
     * @param _certificateHash The hash of the certificate to verify
     * @return bool True if the certificate exists, false otherwise
     */
    function verify(bytes32 _certificateHash) external view returns (bool) {
        return certificates[_certificateHash].exists;
    }
    
    /**
     * @dev Get detailed information about a registered certificate
     * @param _certificateHash The hash of the certificate
     * @return registrar The address that registered the certificate
     * @return timestamp When the certificate was registered
     * @return metadata The metadata associated with the certificate
     * @return exists Whether the certificate exists
     */
    function getCertificateInfo(bytes32 _certificateHash) 
        external 
        view 
        returns (address registrar, uint256 timestamp, string memory metadata, bool exists) 
    {
        Certificate memory cert = certificates[_certificateHash];
        return (cert.registrar, cert.timestamp, cert.metadata, cert.exists);
    }
    
    /**
     * @dev Get the total number of registered certificates
     * @return uint256 The total count of certificates
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateHashes.length;
    }
    
    /**
     * @dev Get the number of certificates registered by a specific address
     * @param _registrar The address to check
     * @return uint256 The count of certificates registered by the address
     */
    function getRegistrarCount(address _registrar) external view returns (uint256) {
        return registrarCounts[_registrar];
    }
    
    /**
     * @dev Get a certificate hash by its index (for enumeration)
     * @param _index The index of the certificate
     * @return bytes32 The certificate hash at the given index
     */
    function getCertificateByIndex(uint256 _index) external view returns (bytes32) {
        require(_index < certificateHashes.length, "Index out of bounds");
        return certificateHashes[_index];
    }
    
    /**
     * @dev Emergency function to pause/unpause the contract (owner only)
     * Note: This is a basic implementation. For production, consider using OpenZeppelin's Pausable
     */
    bool public paused = false;
    
    function togglePause() external onlyOwner {
        paused = !paused;
        emit ContractPauseToggled(paused, msg.sender);
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    // Event for pause toggle
    event ContractPauseToggled(bool paused, address indexed by);
}
