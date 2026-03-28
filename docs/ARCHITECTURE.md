# MediAnnote — System Architecture

> Reference: [MediAnnote PRD](../MediAnnote_PRD.md)

---

## Overview

MediAnnote is a Web3-powered medical image annotation marketplace with three user roles: **Doctors** (annotators), **AI Companies** (dataset buyers), and **Admins** (platform operators).

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Next.js 14)                 │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Doctor  │  │ Company  │  │  Admin   │           │
│  │ Portal  │  │ Portal   │  │ Panel    │           │
│  └────┬────┘  └────┬─────┘  └────┬─────┘           │
│       │             │             │                  │
│  ┌────▼─────────────▼─────────────▼──────┐          │
│  │           wagmi + viem                 │          │
│  │        (Web3 Interaction)              │          │
│  └────────────────┬───────────────────────┘          │
└───────────────────┼──────────────────────────────────┘
                    │
    ┌───────────────▼───────────────────┐
    │       Polygon Mumbai Testnet       │
    │  ┌──────────────────────────────┐ │
    │  │    AnnotationEscrow.sol      │ │
    │  │  • deposit(batchId, ...)     │ │
    │  │  • releasePayment(batchId)   │ │
    │  │  • recordAnnotation(hash)    │ │
    │  └──────────────────────────────┘ │
    │  ┌──────────────────────────────┐ │
    │  │       DoctorSBT.sol          │ │
    │  │  • mint(doctor, specialty)   │ │
    │  │  • updateReputation(...)     │ │
    │  │  • tokenURI (on-chain JSON)  │ │
    │  └──────────────────────────────┘ │
    │  ┌──────────────────────────────┐ │
    │  │       MockUSDC.sol           │ │
    │  │  • ERC-20 (6 decimals)       │ │
    │  │  • Open mint for testing     │ │
    │  └──────────────────────────────┘ │
    └───────────────────────────────────┘
```

---

## Smart Contracts

### AnnotationEscrow.sol
- **Purpose:** Hold USDC in escrow for annotation batches
- **Key functions:**
  - `deposit()` — Company locks funds for a batch
  - `releasePayment()` — Owner releases funds to annotators (90%) + treasury (10%)
  - `recordAnnotation()` — Doctors commit SHA-256 hashes of annotation JSON on-chain
- **Events:** `FundsDeposited`, `FundsReleased`, `AnnotationRecorded`

### DoctorSBT.sol (Soulbound Token)
- **Purpose:** Non-transferable identity + reputation token for verified doctors
- **Key design:** `_update()` override blocks all transfers except minting
- **On-chain metadata:** `tokenURI()` returns base64-encoded JSON with specialty, tier, reputation, annotation count
- **Auto-tier:** Score updates automatically adjust tier (Bronze/Silver/Gold/Platinum)

### MockUSDC.sol
- **Purpose:** ERC-20 token mimicking USDC for testnet demos
- **6 decimal places** to match real USDC

---

## Data Flow

### Annotation Submission Flow
```
Doctor draws bounding box → Label selected
     ↓
Annotation JSON serialized: { batchId, imageIndex, annotations, confidence, notes }
     ↓
SHA-256 hash computed via SubtleCrypto
     ↓
recordAnnotation(batchId, hash) called on AnnotationEscrow
     ↓
AnnotationRecorded event emitted with hash + timestamp
     ↓
Toast notification: "Hash committed on-chain: 0x..."
```

### Payment Flow
```
Company creates batch → deposits USDC via deposit()
     ↓
Funds locked in escrow contract
     ↓
Doctors annotate images → hashes committed on-chain
     ↓
Company reviews quality → triggers releasePayment()
     ↓
Contract auto-splits: 90% to annotators, 10% to treasury
     ↓
FundsReleased event emitted
```

---

## MVP Simplifications

| Feature | Production | MVP |
|---|---|---|
| Image viewer | Cornerstone.js (DICOM) | Canvas API (simulated X-ray) |
| PHI scrubbing | Automated pipeline | UI mock ("✓ Complete") |
| IAA computation | Cohen's Kappa / Dice / IoU | Hardcoded score (0.87) |
| Doctor verification | License database APIs | Admin approval button |
| MAT token | ERC-20 deployment | Referenced in UI, not deployed |
| Database | Supabase Postgres | In-memory mock data |
| Wallet TX | Real on-chain calls | Simulated with timeouts |

---

## Key Design Decisions

1. **Canvas API over Cornerstone.js** — For the hackathon, we render a simulated chest X-ray directly on HTML Canvas to avoid DICOM parsing complexity while still demonstrating the annotation workflow.

2. **Mock data embedded in code** — Instead of a Supabase backend, we use `src/lib/mock-data.ts` with realistic doctor names, specialties, and dollar amounts to create an impressive demo without infrastructure dependencies.

3. **Role switcher in navbar** — Judges can switch between Doctor/Company/Admin views instantly without logging out, making the demo flow seamless.

4. **SHA-256 via SubtleCrypto** — Browser-native hashing ensures the annotation integrity flow is real code, not simulated.

5. **Soulbound Token with on-chain metadata** — `tokenURI()` returns fully on-chain JSON (no IPFS needed), making the SBT self-contained and queryable.
