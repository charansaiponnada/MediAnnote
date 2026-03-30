# Architecture

## System Design
MediAnnote is built as a **polyglot microservice system**, separating the high-fidelity UI, the intensive ML processing, and the immutable blockchain ledger.

### 1. Frontend (Next.js 14)
- **User Interface:** Handles high-performance DICOM/Image rendering and annotation tools.
- **State Management:** Uses **Zustand** for lightweight, high-performance global state across the doctor and company dashboards.
- **Web3 Integration:** Uses **Wagmi** and **Viem** for direct interaction with Polygon smart contracts.

### 2. Xai ML Service (FastAPI)
- **Engine:** Python-based service that performs object detection (Smart Drafting) and spatial clinical captioning.
- **PHI Scrubber:** Strips patient identifiers from metadata and masks burned-in text in images.
- **Consensus Reward Engine:** Mathematically evaluates doctor annotations using **Intersection over Union (IoU)** to calculate fair reward splits.

### 3. Blockchain (Polygon / Ethereum)
- **AnnotationEscrow.sol:** Manages the lifecycle of a dataset batch. Now supports **Merkle Batching** to group multiple annotations into a single transaction root, saving 99% on gas costs.
- **DoctorSBT.sol:** Issues non-transferable Soulbound Tokens. Now supports 5 tiers including the **Elite** rank for top-performing specialists.

## Scalability & UX Enhancements
### Merkle Proof Audit Trail
Instead of committing a transaction for every image, MediAnnote now generates a local **Merkle Tree** of annotation hashes. Only the **Merkle Root** is stored on-chain. This ensures:
1. **Efficiency:** High-volume tasks are viable on-chain.
2. **Integrity:** Any single annotation can still be cryptographically verified against the root using a `MerkleProof`.

### Smart Notification System
The platform includes an automated notification manager that tracks user reputation and batch availability to trigger real-time job matches and consensus-based payout summaries.
