# 🛡️ SecureForge AI

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Powered%20by-Groq%20AI-F55036)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)

**"Design Less. Secure More. Deploy Faster."**

SecureForge AI is an advanced, AI-driven Secure Architecture Synthesizer. It transforms natural language requirements or UML descriptions into completely secure, production-ready backend microservices, database schemas, security middleware, threat models, and cloud deployment scripts in seconds.

## ✨ Core Features
- **AI Architecture Generation:** Generates Node.js/Express controllers, routes, and services from simple text prompts.
- **Automated Security Auditing:** Instantly scans generated code for vulnerabilities (OWASP Top 10) and assigns a security grade.
- **STRIDE Threat Modeling:** Automatically builds a comprehensive STRIDE threat model with mitigation strategies.
- **Mini-IDE Explorer:** View and interact with generated code in a sleek, VS Code-style file tree.
- **One-Click Cloud Deploy:** Generates Infrastructure-as-Code (`render.yaml`, `Dockerfile`) and simulates deployment to the edge.
- **Dynamic Theming:** Premium cyberpunk, matrix, and synthwave UI aesthetics.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A [Groq API Key](https://console.groq.com/) for the AI generation.

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/YourUsername/secureforge-ai.git
cd secureforge-ai
```

### 3. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
cp .env.example .env
```
Open the `.env` file and add your Groq API key:
```env
GROQ_API_KEY="your-groq-api-key-here"
```
Start the backend server:
```bash
npm run dev
```

### 4. Setup the Frontend
Open a *second* terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The platform will now be running locally at `http://localhost:5174/`.

---

## 🛠️ Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Syntax Highlighter
- **Backend:** Node.js, Express, TypeScript, Groq SDK (Llama 3.3 70B & 8B)
- **Architecture Export:** JSZip, File-Saver

---
*Designed & Built for the future of secure software architecture.*
