# MediAnnote — Web3 Medical Image Annotation Marketplace

> **"Turning Medical Expertise into Verified AI Gold — Transparently, Securely, and Fairly."**

A decentralized marketplace connecting verified medical experts with AI companies for high-quality, blockchain-verified medical image annotations.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- MetaMask browser extension (for wallet interactions)

### Setup

```bash
# Clone and install
cd MediAnnote
npm install --legacy-peer-deps

# Run development server
npm run dev

# Run Python ML Service (in a separate terminal)
cd ml-service
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

Create a `.env.local` file:

```env
# Supabase (optional for MVP — mock data is embedded)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# WalletConnect Project ID (optional — falls back to "demo")
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# For contract deployment (only needed if deploying to testnet)
DEPLOYER_PRIVATE_KEY=your_private_key
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
```

### Compile Smart Contracts

```bash
npx hardhat compile
```

### Deploy to Testnet (optional)

```bash
npx hardhat run scripts/deploy.ts --network mumbai
```

---

## 📋 Contract Addresses (Hardhat Local)

| Contract | Address |
|---|---|
| MockUSDC | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| AnnotationEscrow | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| DoctorSBT | `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` |

> Replace with actual testnet addresses after deployment in `contracts/deployments.json`

---

## 🎯 Demo Walkthrough Script (for Judges)

### Scene 1: Landing Page
1. Open the app → see the hero section, platform stats, and **live on-chain activity feed**
2. Note the role switcher in the navbar (Doctor / Company / Admin)

### Scene 2: Doctor Experience
1. Click **"Join as Doctor"** → Doctor Dashboard loads with:
   - Reputation Score: **94/100 (Platinum)**
   - Earnings: **$12,450 USDC ≈ 124,500 MAT**
   - Active batches with progress bars
   - Recent activity feed
2. Navigate to **Tasks** → See available annotation batches
3. Click **"Start Annotating"** on Chest X-Ray batch
4. **Annotation Workspace** opens:
   - Simulated chest X-ray with lung outlines
   - Select "Bounding Box" tool → draw a box around an area
   - **Label picker** appears → select "Pneumonia"
   - Set confidence → Add clinical notes
   - Click **"Submit & Next"** →
     - SHA-256 hash of annotation JSON is computed
     - Hash "committed on-chain" via toast notification
     - Automatically advances to next image
5. Visit **Profile** → See SBT metadata fetched from chain

### Scene 3: Company Experience
1. Switch to Company view → Dashboard shows:
   - 2 active jobs, 44% completion, $24,500 total spent
   - Each dataset with progress bars and Polygonscan links
2. Click **"DEMO: Release Payment"** →
   - 🎉 Confetti animation plays
   - Toast: "Payment released! Funds distributed to annotators on-chain"
3. Click **"+ New Dataset"** → 4-step upload wizard:
   - Upload images → Define labels → Set budget → **Fund Escrow**
   - Final step simulates MetaMask transaction with loading state

### Scene 4: AI & Audit
1. Switch to **Admin** → See doctor verification table.
2. Click **"Approve & Mint SBT"** for pending doctor → SBT minting simulation.
3. Select a dataset → Navigate to **Audit Report** showing:
   - **Blockchain AI Provenance Trail**: Multi-stage hashes (Draft → Caption → Submission) ensuring immutability.
   - **Consensus Reward Engine**: Calculate fair reward splits based on IoU overlap.
   - **Finalize Rewards**: Confirm splitting payments on-chain via `releasePaymentWithSplits`.
4. Return to **Company Dashboard** → View **Model Metrics** (Accuracy, F1, Confusion Matrix) and download PDF reports.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + TailwindCSS |
| Web3 | wagmi v2 + viem + ConnectKit |
| Smart Contracts | Solidity 0.8.28 (Hardhat + OpenZeppelin 5.6) |
| Image Annotation | Canvas API (bounding boxes + labels overlay) |
| Auth | Supabase (mock for MVP) |
| Theming | next-themes (dark mode) |
| Notifications | react-hot-toast + canvas-confetti |

---

## 📁 Project Structure

```
MediAnnote/
├── contracts/              # Solidity smart contracts
│   ├── AnnotationEscrow.sol
│   ├── DoctorSBT.sol
│   ├── MockUSDC.sol
│   ├── abis/               # Compiled ABIs
│   └── deployments.json    # Contract addresses
├── scripts/
│   └── deploy.ts           # Hardhat deployment script
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Auth page
│   │   ├── doctor/         # Doctor portal
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── annotate/[batchId]/
│   │   │   └── profile/
│   │   ├── company/        # Company portal
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   └── dataset/[id]/
│   │   ├── admin/          # Admin panel
│   │   ├── audit/[batchId]/ # Compliance report
│   │   └── demo/           # Mock data seeder
│   ├── components/         # Shared components
│   ├── lib/                # Utilities, contracts, mock data
│   └── providers/          # Web3, Theme providers
├── docs/
│   └── ARCHITECTURE.md
└── hardhat.config.ts
```

---

## 📄 License

MIT — Built for hackathon demonstration purposes.
