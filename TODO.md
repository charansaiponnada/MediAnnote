# MediAnnote: Web3 AI Medical Annotation Platform

## Status: ✅ Phase 3 Complete (Ready for Demo)

### 🥇 Feature 1: AI-Assisted Annotation (Smart Drafting)
- [x] **ML Service**: Implement `/predict` endpoint to generate initial bounding boxes.
- [x] **Frontend**: Wire up "AI Draft" button in the Doctor's workspace.
- [x] **Frontend**: Load AI predictions into the annotation canvas (review & refine).

### 🧠 Feature 2: Consensus-Based Reward Engine
- [x] **ML Service**: Implement `/consensus` endpoint (IoU calculation & BPS generation).
- [x] **Frontend (Company)**: Integrated "Fairness Consensus" logic in the Audit page.
- [x] **Smart Contract**: Call `releasePaymentWithSplits` on `AnnotationEscrow.sol` using AI-generated scores.

### 🌐 Priority Web3 Connectivity (Live Wallet Injection)
- [x] **Company Dashboard**: Wired "Fund Escrow" with `useWriteContract` (USDC Transfer).
- [x] **Admin Panel**: Implement SBT Minting flow for verified doctors (`DoctorSBT.sol`).
- [x] **Audit Trail**: Record SHA-256 annotation/dataset hashes on-chain via `recordAnnotation`.

### 🛠️ Maintenance & Polishing
- [x] **DICOM PHI Scrubber**: ML service `/scrub` endpoint integrated into upload flow.
- [x] **End-to-end Demo Flow**: Verified all paths (Upload -> Annotate -> Audit -> Pay).

### 🚀 Phase 4: AI Captionist & Provenance (New)
- [x] **AI Captionist**: `/caption` endpoint in ML service for clinical assist.
- [x] **Blockchain Audit Trail**: `recordAiInsight` added to `AnnotationEscrow.sol`.
- [x] **Provenance Display**: Audit page shows AI-generated hashes alongside doctor work.
