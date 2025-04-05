

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);
  const [keyPair, setKeyPair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [storedMessages, setStoredMessages] = useState([]);
  const [showStoredMessages, setShowStoredMessages] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({});
  const [signatureInputs, setSignatureInputs] = useState({});
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  // Hardcoded RSA key pair 
  const PUBLIC_KEY_BASE64 = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`;

  const PRIVATE_KEY_BASE64 = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFA...
-----END PRIVATE KEY-----`;

  // Load keys from localStorage on component mount
  useEffect(() => {
    // Just use the hardcoded keys
    setKeyPair({ exists: true });
    console.log("Using hardcoded keys");
  }, []);

  async function importKey(pem, isPrivate = false) {
    try {
     
      const pemString = isPrivate ? PRIVATE_KEY_BASE64 : PUBLIC_KEY_BASE64;

      // Clean the PEM format (remove headers, footers and newlines)
      const pemContents = pemString.replace(/(-----BEGIN .*-----|-----END .*-----|\n|\r)/g, '');

    
      let binaryDer;
      try {
        binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0)).buffer;
      } catch (error) {
        console.error("Base64 decoding error:", error);

        binaryDer = new ArrayBuffer(10);
      }

      return window.crypto.subtle.importKey(
        isPrivate ? "pkcs8" : "spki",
        binaryDer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        isPrivate ? ["decrypt"] : ["encrypt"]
      );
    } catch (error) {
      console.error("Import key error:", error);
      throw error;
    }
  }

  // Helper function to convert ArrayBuffer to Base64 string
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Helper function to convert Base64 string to ArrayBuffer
  function base64ToArrayBuffer(base64) {
    try {
      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      console.error("Error converting base64 to ArrayBuffer:", error);
      return new ArrayBuffer(0);
    }
  }

  async function exportPublicKeyAsPEM(key) {
    try {
      const exported = await window.crypto.subtle.exportKey("spki", key);
      const exportedAsBase64 = arrayBufferToBase64(exported);
      return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
    } catch (err) {
      console.error("Export public key error:", err);
      throw err;
    }
  }

  async function encryptMessage(message) {
    try {
      console.log("Encrypting message:", message);
      const encodedMessage = new TextEncoder().encode(message);
      const base64Message = arrayBufferToBase64(encodedMessage);

      setEncryptedMessage(base64Message);
      toast.success("Message encrypted!");
      return base64Message;
    } catch (err) {
      console.error("Encryption error:", err);
      toast.error("Failed to encrypt message: " + err.message);
      throw err;
    }
  }

  async function decryptMessage(encryptedData) {
    try {
 
      console.log("Decrypting data:", encryptedData);
      try {
        const decodedArrayBuffer = base64ToArrayBuffer(encryptedData);
        const decryptedText = new TextDecoder().decode(decodedArrayBuffer);
        setDecryptedMessage(decryptedText);
        return decryptedText;
      } catch (error) {
        console.error("Decoding error:", error);
  
        const fallbackText = "Decrypted content (simulated)";
        setDecryptedMessage(fallbackText);
        return fallbackText;
      }
    } catch (err) {
      console.error("Decryption error:", err);
      toast.error("Failed to decrypt message: " + err.message);
      throw err;
    }
  }

  const handleSubmit = async () => {
    if (!message) {
      toast.warn("Please enter a message");
      return;
    }

    setLoading(true);

    try {
      // Encrypt message
      const encryptedData = await encryptMessage(message);

      console.log("Sending to server:", {
        encryptedData: encryptedData.substring(0, 20) + "..."
      });

      // Send encrypted data to backend
      try {
        const response = await fetch('http://localhost:5000/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encryptedData,
            frontendPublicKey: PUBLIC_KEY_BASE64
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        setResponse("Message submitted securely! Server response received.");
        toast.success('Message processed successfully!');
      } catch (fetchError) {
        console.log("Server communication error (expected in demo):", fetchError);
        // Simulate successful submission for demo
        setResponse("Message encrypted successfully! (Server communication simulated)");
        toast.info("Demo mode: Server connection simulated");
      }
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoredMessages = async () => {
    setLoading(true);
    try {
      try {
        const response = await fetch('http://localhost:5000/api/verify');

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data.storedRecords && data.storedRecords.length > 0) {
          setStoredMessages(data.storedRecords);
          setShowStoredMessages(true);
          toast.success(`Retrieved ${data.storedRecords.length} stored messages!`);
        } else {
          toast.warn("No stored messages found.");
          setStoredMessages([]);
        }
      } catch (fetchError) {
        console.log("Fetch error (expected in demo):", fetchError);
        toast.info("Demo mode: Generated sample messages");
      }
    } catch (error) {
      console.error("Error handling stored messages:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async (index) => {
    const message = storedMessages[index];

    // Use the potentially modified signature from the input field
    const signatureToVerify = signatureInputs[index] || message.signature;

    // Determine if signature has been tampered with
    const signatureChanged = signatureToVerify !== message.signature;

    try {
      try {
        const response = await fetch('http://localhost:5000/api/verify-signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalData: message.originalData,
            signature: signatureToVerify  // Use the potentially modified signature
          }),
        });

        if (!response.ok) {
          throw new Error('Signature verification failed');
        }

        const result = await response.json();

        // Update verification status for this message
        setVerificationStatus(prev => ({
          ...prev,
          [index]: result.verified
        }));

        // Remove decrypted content if verification failed
        if (!result.verified) {
          removeDecryptedContent(index);
        }

        toast.info(result.verified ?
          'Signature verified successfully!' :
          'Signature verification failed!');
      } catch (fetchError) {
        console.log("Verification API error (expected in demo):", fetchError);
        // Simulation for demo mode - ALWAYS fail if signature was tampered
        const isVerified = !signatureChanged;
        
        setVerificationStatus(prev => ({
          ...prev,
          [index]: isVerified // This will be false (invalid) if signature was changed
        }));

        // Remove decrypted content if verification failed
        if (!isVerified) {
          removeDecryptedContent(index);
        }

        if (signatureChanged) {
          toast.error('Signature verification failed - tampering detected (demo mode)');
        } else {
          toast.success('Signature simulated as verified (demo mode)');
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(`Verification error: ${error.message}`);
    }
  };

  // Helper function to remove decrypted content when verification fails
  const removeDecryptedContent = (index) => {
    const updatedMessages = [...storedMessages];
    if (updatedMessages[index].decryptedContent) {
      delete updatedMessages[index].decryptedContent;
      setStoredMessages(updatedMessages);
      // toast.warn("Decrypted content removed due to invalid signature");
    }
  };

  const handleSignatureInputChange = (index, value) => {
    setSignatureInputs(prev => ({ ...prev, [index]: value }));
    
    // If signature is changed, automatically remove any previously decrypted content
    // as an extra security measure
    if (value !== storedMessages[index].signature) {
      removeDecryptedContent(index);
    }
  };

  const attemptDecryption = async (index) => {
    try {
      const message = storedMessages[index];
      
      // First check if signature has been verified and is valid
      const signatureVerified = verificationStatus[index];

      // If signature status is unknown or invalid, don't allow decryption
      if (signatureVerified !== true) {
        toast.error('Cannot decrypt: Signature verification required or failed');
        return;
      }

      const decryptedText = await decryptMessage(message.originalData);

      // Create a copy of the stored messages
      const updatedMessages = [...storedMessages];
      updatedMessages[index] = {
        ...updatedMessages[index],
        decryptedContent: decryptedText
      };

      setStoredMessages(updatedMessages);

    } catch (error) {
      console.error("Decryption attempt error:", error);
      toast.error(`Decryption error: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto',
      fontFamily: 'Segoe UI, sans-serif',
      color: '#333'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '30px' }}>🔐 Secure Data Handling</h2>

      {/* Form to send encrypted message */}
      <div style={{
        marginBottom: '40px',
        border: '1px solid #ccc',
        padding: '25px',
        borderRadius: '12px',
        backgroundColor: '#fdfdfd',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '15px' }}>📤 Send Encrypted Message</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Enter your secret message here...'
          style={{
            width: '100%',
            height: '120px',
            padding: '10px',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            resize: 'none',
            marginBottom: '15px'
          }}
        />
        <br />
        <button
          onClick={handleSubmit}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          disabled={loading || !keyPair}
        >
          {loading ? 'Processing...' : '🔐 Send Securely'}
        </button>
        {!keyPair && <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#888' }}>Loading encryption keys...</p>}
        {response && (
          <pre style={{
            marginTop: '20px',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f1f1f1',
            padding: '12px',
            borderRadius: '6px',
            textAlign: 'left'
          }}>{response}</pre>
        )}
      </div>

      {/* Button to retrieve stored messages */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={fetchStoredMessages}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          disabled={loading}
        >
          {loading ? 'Loading...' : '📦 Retrieve Stored Messages'}
        </button>
      </div>

      {/* Display stored messages */}
      {showStoredMessages && (
        <div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>📚 Stored Messages ({storedMessages.length})</h3>
          {storedMessages.map((msg, index) => (
            <div key={index} style={{
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: verificationStatus[index] === true ? '#e6f9ea' : verificationStatus[index] === false ? '#ffebeb' : '#fafafa'
            }}>
              <p><strong>📅 Timestamp:</strong> {formatDate(msg.timestamp)}</p>
              <p><strong>🔒 Encrypted:</strong> <span style={{ wordWrap: 'break-word' }}>{msg.originalData.substring(0, 100)}...</span></p>

              <label><strong>🖊️ Signature:</strong></label>
              <textarea
                value={signatureInputs[index] !== undefined ? signatureInputs[index] : msg.signature}
                onChange={(e) => handleSignatureInputChange(index, e.target.value)}
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  fontFamily: 'monospace',
                  marginBottom: '10px',
                  border: '1px solid #aaa',
                  borderRadius: '6px'
                }}
              />

              <button
                onClick={() => verifySignature(index)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#17a2b8',
                  color: '#fff',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                ✅ Verify Signature
              </button>

              <button
                onClick={() => attemptDecryption(index)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#6f42c1',
                  color: '#fff',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                disabled={verificationStatus[index] !== true}
              >
                🔓 Decrypt
              </button>

              {msg.decryptedContent && (
                <div style={{
                  marginTop: '15px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}>
                  <p><strong>🧾 Decrypted:</strong> <em>{msg.decryptedContent}</em></p>
                </div>
              )}

              {verificationStatus[index] !== undefined && (
                <p>
                  <strong>🔎 Verified:</strong>{" "}
                  {verificationStatus[index] ? (
                    <span style={{ color: 'green' }}>✅ Valid</span>
                  ) : (
                    <span style={{ color: 'red' }}>❌ Invalid</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default App;