# Getting Started

## Prerequisites
Before setting up MediAnnote, ensure you have the following installed:
-   **Node.js (v18+)** & npm
-   **Python (v3.10+)**
-   **Git**
-   **MetaMask Browser Extension** (for Web3 features)
-   **Hardhat** (for smart contract development)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/MediAnnote.git
cd MediAnnote
```

### 2. Frontend Setup (Next.js)
```bash
npm install
```

### 3. ML Service Setup (FastAPI)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Smart Contracts (Hardhat)
```bash
# From the root directory
npx hardhat compile
```

## Setup Instructions

### Start the Local Blockchain
```bash
npx hardhat node
```

### Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Run the Xai ML Service
```bash
cd ml-service
python main.py
```

### Launch the Frontend
```bash
# From the root directory
npm run dev
```

The application will be available at `http://localhost:3000`.
