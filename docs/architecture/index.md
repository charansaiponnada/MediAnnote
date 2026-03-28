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
- **AnnotationEscrow.sol:** Manages the lifecycle of a dataset batch (deposit, hash commitment, release).
- **DoctorSBT.sol:** Issues non-transferable **Soulbound Tokens** representing a doctor’s verified credentials and lifelong accuracy reputation.
- **MockUSDC.sol:** A stablecoin simulation for trustless, global payments.

## Data Flow
1. **Data Requisition:** Company uploads images (locally or via NIH API).
2. **Scrubbing:** Xai PHI Scrubber anonymizes data before the doctor sees it.
3. **Drafting:** Xai Smart Draft pre-annotates findings for the doctor.
4. **Human Verification:** Doctor refines Xai's work and adds Clinical Notes.
5. **Commitment:** Doctor commits the **SHA-256 hash** of their work to the blockchain.
6. **Settlement:** Once multiple doctors finish, the Consensus Engine calculates payouts based on agreement, and the Escrow contract releases USDC.
