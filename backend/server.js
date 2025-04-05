const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config()
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define database schema
const DataSchema = new mongoose.Schema({
  encryptedData: String,
  signature: String,
  timestamp: { type: Date, default: Date.now },
  iv: String,  // Store IV for each record
  // Store raw encrypted data to avoid double encryption issues
  rawEncryptedData: String
});

const DataModel = mongoose.model('SecureData', DataSchema);

// Generate backend RSA keypair
const backendKeyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

// AES encryption for database storage
const AES_SECRET = crypto.randomBytes(32);

function aesEncrypt(text) {
  // Generate a new IV for each encryption operation
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // Return both the encrypted data and the IV
  return {
    encrypted,
    iv: iv.toString('base64')
  };
}

function aesDecrypt(encrypted, ivBase64) {
  try {
    // Convert IV from base64 back to buffer
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-cbc', AES_SECRET, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    // Return the original encrypted data if decryption fails
    return "[Decryption failed - encrypted data preserved]";
  }
}

// Debug endpoint
app.get('/', (req, res) => {
  res.send('Secure server is running');
});

// Submission API
app.post('/api/submit', async (req, res) => {
  try {
    const { encryptedData, frontendPublicKey } = req.body;

    if (!encryptedData || !frontendPublicKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Received Encrypted Data:', encryptedData.substring(0, 50) + '...');
    console.log('Frontend Public Key Length:', frontendPublicKey.length);

    // Sign the encrypted data
    const sign = crypto.createSign('SHA256');
    sign.update(encryptedData);
    sign.end();
    const signature = sign.sign(backendKeyPair.privateKey, 'base64');

    // Store encrypted data in DB - store the original encrypted data too
    const { encrypted, iv } = aesEncrypt(encryptedData);
    await DataModel.create({ 
      encryptedData: encrypted, 
      signature,
      iv,
      rawEncryptedData: encryptedData // Store original encrypted data
    });

    res.json({
      success: true,
      message: 'Data received and stored securely',
      timestamp: new Date().toISOString(),
      storedSignature: signature
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Verification API
app.get('/api/verify', async (req, res) => {
  try {
    const records = await DataModel.find();

    if (records.length === 0) {
      return res.json({ message: "No stored data found." });
    }

    const decryptedRecords = records.map(record => {
      try {
        // Use the rawEncryptedData if available (for newer records)
        // or try to decrypt the AES encrypted data (for older records)
        const originalData = record.rawEncryptedData || 
                             aesDecrypt(record.encryptedData, record.iv || '');
        
        return {
          originalData,
          signature: record.signature,
          timestamp: record.timestamp
        };
      } catch (error) {
        console.error('Record decryption error:', error);
        // Return a placeholder if decryption fails
        return {
          originalData: '[Decryption failed]',
          signature: record.signature,
          timestamp: record.timestamp
        };
      }
    });

    res.json({ storedRecords: decryptedRecords });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed', message: err.message });
  }
});

// Signature verification API
app.post('/api/verify-signature', (req, res) => {
  try {
    const { originalData, signature } = req.body;

    if (!originalData || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify signature using backend public key
    const verify = crypto.createVerify('SHA256');
    verify.update(originalData);
    const isVerified = verify.verify(backendKeyPair.publicKey, signature, 'base64');

    res.json({
      verified: isVerified,
      message: isVerified ? 'Signature verification successful' : 'Signature verification failed'
    });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Verification failed', message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;