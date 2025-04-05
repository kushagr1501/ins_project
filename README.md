# 🔐  Secure Data Handling with RSA Encryption and Digital Signatures

This project implements a secure system for handling sensitive messages using **RSA encryption** and **digital signatures**. It ensures that messages are:

- Kept private
- Cannot be modified without detection
- Verified as coming from a trusted source

## 🎥 Video Demo

Watch a demo of the secure messaging workflow in action:  
[📽️ Click here to watch the video](https://drive.google.com/drive/folders/1Dn5laNc4_6VEFF1L1kXEOW2aqXsjhJ86?usp=sharing)


## 📌 Abstract

The system works by allowing users to encrypt their message using their **RSA public key** on the frontend, ensuring only they can decrypt it using their **private key**. Once the message is encrypted, it is:

1. Sent to the backend
2. Digitally signed using the backend’s **private RSA key**
3. Stored securely along with the digital signature

The backend then sends the **signature** and its **public key** back to the user. The user can then:

- Verify the message came from the correct backend (via signature)
- Decrypt the message (using their private key)

This mechanism ensures confidentiality, authenticity, and integrity of messages — all without relying on hashing.

## ⚙️ Methodology

### 1. 🧑‍💻 User Input & Encryption (Frontend)
- The user types a secret message.
- It is encrypted using the **user’s RSA public key**.
- The message is Base64-encoded for safe transmission.
- It is then sent to the backend.

### 2. 🖥️ Backend Signing & Storage
- The backend has its own **RSA key pair**.
- It signs the encrypted message using its **private key**.
- This proves the backend processed the message.
- The backend stores:
  - The encrypted message
  - The digital signature
  - Optionally: extra encryption (e.g., AES) for storage security

### 3. 🔄 Signature & Public Key Returned
- The backend responds with:
  - The **digital signature**
  - Its **RSA public key**
- This allows the frontend to:
  - Verify the backend’s identity
  - Detect any tampering

### 4. 🔓 Signature Verification & Decryption (Frontend)
- The user verifies the signature using the **backend’s public key**.
- If verified, the user **decrypts the message** using their **private key**.
- This confirms message authenticity and integrity.

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

