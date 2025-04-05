# 🔐  Secure Data Handling with RSA Encryption and Digital Signatures

This project implements a secure system for handling sensitive messages using **RSA encryption** and **digital signatures**. It ensures that messages are:

- Kept private
- Cannot be modified without detection
- Verified as coming from a trusted source


🚀 How It Works

The system enables secure communication using asymmetric cryptography. Here’s how the flow works:

User Encryption (Frontend):

The user writes a secret message in the web interface.

The message is encrypted using the user’s RSA public key, making it readable only by the corresponding private key.

The encrypted message is Base64-encoded and sent to the backend.

Backend Signing & Storage:

The backend holds its own RSA key pair.

It signs the encrypted message using its private key to generate a digital signature.

This signature proves the message was processed by the legitimate backend.

The backend stores the encrypted message and its digital signature securely.

Response to Frontend:

The backend sends the digital signature and its public key back to the user.

This allows the user to verify the message’s integrity and authenticity.

Signature Verification & Decryption:

On the frontend, the user verifies the digital signature using the backend's public key.

If the verification passes, the user decrypts the message using their private key.

## 🎥 Video Demo

Watch a demo of the secure messaging workflow in action:  
[📽️ Click here to watch the video](https://drive.google.com/drive/folders/1Dn5laNc4_6VEFF1L1kXEOW2aqXsjhJ86?usp=sharing)

---

## 🛠️ Tech Stack

- **Frontend:** JavaScript, HTML, CSS
- **Backend:** Node.js (with Express)
- **Security:** RSA encryption, Digital signatures
---

## 📅 Getting Started

### Prerequisites
- Node.js and npm installed

### Installation

```bash
# Clone the repo
git clone https://github.com/kushagr1501/ins_project.git
cd ins_project

# Setup backend
cd backend
npm install

# Setup frontend
cd ../Client
npm install
```

### Running Locally

```bash
# Start backend server
cd backend
npm start

# In another terminal, start frontend
cd ../Client
npm start
```

Access the app at `http://localhost:3000` (or your configured port).

---


## 📾 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more info.

---

## 📧 Contact

Built with 💙 by [Kushagra](https://github.com/kushagr1501)  
For questions or suggestions, feel free to open an issue or contact me via GitHub.

