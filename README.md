# 🔐 Secure Data Handling with RSA Encryption and Digital Signatures

This project implements a secure system for handling sensitive messages using **RSA encryption** and **digital signatures**. It ensures that messages are:

- 🔒 Kept private,securely stored
- 🛡️ Cannot be modified without detection
- ✅ Verified as coming from a trusted source

---

## 🚀 Working

### 🔑 User Encryption (Frontend)
- The user writes a secret message in the web interface.
- It is encrypted using the **user’s RSA public key**, making it readable only by the corresponding private key.
- The encrypted message is Base64-encoded and sent to the backend.

### 🖋️ Backend Signing & Storage
- The backend maintains its own RSA key pair.
- It signs the encrypted message using its **private key**, generating a digital signature.
- This signature confirms the message was processed by the backend.
- The backend stores both the encrypted message and the digital signature securely.

### 📬 Response to Frontend
- The backend sends its **digital signature** and **public key** back to the user.
- The frontend can then verify that the message’s integrity and authenticity are intact.

### 🧾 Signature Verification & Decryption
- The frontend verifies the digital signature using the backend’s **public key**.
- If verified, the user decrypts the message using their **private RSA key**.



---



## 🎥 Video Demo

Watch a demo of the secure messaging workflow in action:  
[📽️ Click here to watch the video](https://drive.google.com/drive/folders/1Dn5laNc4_6VEFF1L1kXEOW2aqXsjhJ86?usp=sharing)

---

## 🛠️ Tech Stack

- **Frontend:** ReactJS
- **Backend:** Node.js (with Express)
- **Security:** RSA encryption, Digital signatures
- **Deployment:** Vercel

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

