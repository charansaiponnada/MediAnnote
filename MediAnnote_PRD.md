# MediAnnote — Product Requirements Document (PRD)

> **"Turning Medical Expertise into Verified AI Gold — Transparently, Securely, and Fairly."**

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Personas](#2-user-personas)
3. [Core Features](#3-core-features)
4. [Web3 / Blockchain Integration](#4-web3--blockchain-integration)
5. [Technical Architecture](#5-technical-architecture)
6. [User Flows](#6-user-flows)
7. [Monetization Model](#7-monetization-model)
8. [Trust, Safety & Compliance](#8-trust-safety--compliance)
9. [MVP Scope (Hackathon Version)](#9-mvp-scope-hackathon-version)
10. [Future Roadmap](#10-future-roadmap)
11. [Competitive Advantage](#11-competitive-advantage)

---

## 1. Product Overview

### 1.1 Vision

MediAnnote is a **decentralized, Web3-powered medical image annotation marketplace** that connects verified domain-expert physicians with AI/ML companies that need high-quality, trustworthy labeled medical datasets. By using blockchain for payments, reputation tracking, and audit trails, MediAnnote ensures that every annotation is provably authenticated, fairly compensated, and privacy-compliant.

### 1.2 Problem Statement

High-quality medical AI requires expert-annotated training data. Today, this process is broken:

| Pain Point | Impact |
|---|---|
| AI companies struggle to find verified, domain-expert annotators | Low-quality or incorrectly labeled data, leading to unsafe AI models |
| Doctors are excluded from the AI value chain | Experts who generate the most value receive no economic benefit |
| Centralized platforms create single points of failure and data breaches | HIPAA violations, patient privacy risks, legal liability |
| No transparent quality validation | Companies have no reliable way to audit annotation accuracy |
| Payments are slow, cross-border, and opaque | Doctors in emerging markets are excluded from global demand |

### 1.3 Target Users

- **Medical Annotators** — Radiologists, pathologists, dermatologists, ophthalmologists, and other licensed specialists
- **AI/ML Companies & Research Institutions** — Healthcare AI startups, pharma R&D divisions, academic labs, hospital systems building diagnostic tools
- **Platform Administrators** — Internal team managing compliance, doctor verification, and dispute resolution

---

## 2. User Personas

### 2.1 Dr. Ananya Reddy — The Specialist Annotator

- **Role:** Senior Radiologist, 12 years of experience
- **Location:** Hyderabad, India
- **Tech Comfort:** Moderate (uses PACS systems, basic web apps)
- **Goals:**
  - Earn supplemental income using her expertise outside hospital hours
  - Contribute to meaningful AI research in radiology
  - Maintain professional credibility and privacy
- **Frustrations:**
  - Existing platforms pay poorly or require non-medical annotation work
  - No way to prove her work quality or build a verifiable reputation
  - Concerned about where patient images go and whether they are de-identified
- **Key Needs:** Simple annotation UI, verified payment in INR or stablecoins, transparent reputation score, anonymized patient data guarantee

---

### 2.2 Sarah Chen — The AI Product Manager

- **Role:** Product Lead at a Series B medical AI startup
- **Location:** San Francisco, USA
- **Tech Comfort:** High
- **Goals:**
  - Source a dataset of 10,000 annotated chest X-rays for pneumonia detection within 8 weeks
  - Ensure annotations meet IRB/FDA pre-submission standards
  - Control costs while maintaining gold-standard quality
- **Frustrations:**
  - Current vendors (Scale AI, Appen) use non-specialist crowd workers for medical tasks
  - No immutable audit trail for regulatory submissions
  - Hard to prove inter-annotator agreement to regulators
- **Key Needs:** Verified specialist annotators, consensus-based quality scores, downloadable audit logs for compliance, flexible dataset licensing

---

### 2.3 Marcus — The Platform Admin

- **Role:** Operations & Compliance Manager at MediAnnote
- **Goals:**
  - Ensure all annotators are credentialed and license-verified
  - Monitor for fraudulent annotations or gaming of the reward system
  - Enforce data anonymization before image upload
  - Resolve disputes between companies and annotators
- **Key Needs:** Admin dashboard, doctor verification pipeline, anomaly detection alerts, dispute resolution tools

---

## 3. Core Features

### 3.1 Annotation Interface

#### 3.1.1 Image Viewer & Annotation Tools

- **DICOM-compatible viewer** supporting X-rays, MRIs, CT scans, pathology slides (H&E staining), and dermoscopy images
- Annotation tools include:
  - Bounding boxes
  - Polygon / freehand segmentation
  - Landmark placement (keypoints)
  - Pixel-level brush (for pathology)
  - Classification labels with structured taxonomy
  - Text commentary / clinical notes field
- Zoom, pan, windowing (brightness/contrast), multi-slice navigation for 3D volumes
- Keyboard shortcut support for professional-speed workflows
- **Session autosave** every 30 seconds to prevent work loss

#### 3.1.2 Task Assignment Engine

- Doctors receive tasks matched to their specialty (e.g., a radiologist sees only imaging tasks, a dermatologist sees only skin lesion tasks)
- Task difficulty rating system (Tier 1 / 2 / 3) affects payout
- Batch assignment: doctors can pick up a batch of 10–50 images at once
- Time-locked tasks: once accepted, a doctor has a set window (e.g., 48 hours) to complete or the task auto-releases

---

### 3.2 Payment System

#### 3.2.1 Dual-Rail Payment (Web2 + Web3)

| Mode | Method | Currency | Settlement Time |
|---|---|---|---|
| Web2 | Bank transfer / PayPal | USD / INR / EUR | 5–7 business days |
| Web2 | UPI (India) | INR | Same day |
| Web3 | Ethereum / Polygon smart contract | USDC / USDT stablecoin | Instant (on finality) |
| Web3 | Native MAT Token (platform utility token) | MAT | Instant |

- Annotators choose their preferred payout method in account settings
- Minimum payout threshold: $10 equivalent
- Escrow model: AI company deposits funds into a smart contract escrow when uploading a batch; funds release automatically upon quality validation of annotations

#### 3.2.2 Pricing Model for Annotators

- **Base payout per image:** Determined by image type and complexity (e.g., $0.50 for simple classification, $5.00 for detailed 3D segmentation)
- **Quality bonus:** Additional 10–25% bonus for annotations scoring above 90% inter-annotator agreement
- **Streak rewards:** Consistent high-quality annotators earn multiplier bonuses after 30/60/90-day streaks

---

### 3.3 Reputation & Quality Scoring System

#### 3.3.1 Inter-Annotator Agreement (IAA)

- Each image is annotated by **minimum 3 independent doctors** (consensus model)
- IAA calculated using:
  - **Cohen's Kappa** for classification tasks
  - **Dice Similarity Coefficient (DSC)** for segmentation tasks
  - **Intersection over Union (IoU)** for bounding boxes
- Gold standard validation: ~5% of tasks are secretly "honeypot" tasks with known gold-standard annotations from a senior panel; used to calibrate doctor scores without their knowledge

#### 3.3.2 Reputation Score (0–100)

- Composite score derived from:
  - IAA score across last 500 annotations (40% weight)
  - Honeypot task accuracy (30% weight)
  - Completion rate / reliability (15% weight)
  - Peer review score — other specialists can rate annotation quality (15% weight)
- Score stored immutably on-chain as a **Soulbound Token (SBT)** — non-transferable, doctor-specific
- Score is public and verifiable by AI companies when selecting annotators

#### 3.3.3 Tier System

| Tier | Score Range | Perks |
|---|---|---|
| Bronze | 0–59 | Access to Tier 1 tasks only |
| Silver | 60–79 | Tier 1 + 2 tasks, 10% bonus multiplier |
| Gold | 80–89 | All tasks, 20% bonus, early access to premium batches |
| Platinum | 90–100 | All tasks, 25% bonus, invited to expert review panel |

---

### 3.4 Dataset Management

#### 3.4.1 For AI Companies (Dataset Buyers)

- Upload raw DICOM or JPEG/PNG images via secure drag-and-drop portal
- Define annotation schema: label taxonomy, instructions, example annotations, acceptance criteria
- Set annotator requirements: minimum tier, specialty, minimum years of experience
- Real-time dashboard: annotation progress, quality metrics, estimated completion date
- Download completed datasets in standard formats: COCO JSON, Pascal VOC XML, CSV label files, NIfTI (for 3D volumes)
- Smart contract-based licensing: dataset usage rights defined on-chain (single-use, multi-use, perpetual, geographic restriction)

#### 3.4.2 For Annotators (Doctors)

- Task queue sorted by specialty, difficulty, and reward
- Annotation history with earnings breakdown
- Performance analytics: personal IAA trends, accuracy by image type, earnings over time
- Portfolio page (public) showing anonymized metrics for employer trust

---

### 3.5 Security & Compliance

#### 3.5.1 Data De-identification

- All images processed through an automated **PHI (Protected Health Information) scrubber** on upload:
  - DICOM header stripping (patient name, DOB, hospital ID, accession number, etc.)
  - Burned-in text detection using OCR + inpainting to remove patient labels visible in image pixel data
  - Face detection and removal for images where patient anatomy may reveal identity (e.g., facial MRIs)
- De-identification log stored in an append-only audit trail

#### 3.5.2 Access Controls

- Role-based access control (RBAC): Annotators cannot see other annotations until batch closes; companies cannot identify which doctor annotated which image
- Zero-knowledge proof (ZKP) for doctor credential verification: prove you are a licensed cardiologist without revealing your name, license number, or hospital affiliation to the public
- Images stored encrypted at rest (AES-256); annotators access via time-limited signed URLs (expire after 2 hours)

---

## 4. Web3 / Blockchain Integration

### 4.1 Why Blockchain?

Traditional centralized platforms create fundamental trust problems in medical annotation:

- Companies cannot verify that payment was fair or that funds were not withheld arbitrarily
- Doctors cannot prove their annotation history or reputation across platforms
- Regulators have no immutable audit trail for AI training data provenance
- Cross-border payments are slow and expensive

Blockchain solves these problems by being a **neutral, trustless, programmable ledger** — no single party controls it, every transaction is auditable, and rules execute automatically via code.

---

### 4.2 Smart Contracts

#### 4.2.1 Escrow Contract (`AnnotationEscrow.sol`)

```
Flow:
[AI Company] → deposits USDC into escrow smart contract
      ↓
[Contract] holds funds until batch quality threshold is met
      ↓
[Quality Oracle] submits IAA score on-chain
      ↓
[Contract] auto-releases funds to annotator wallet addresses
      ↓
[Platform fee] (10%) auto-deducted and sent to treasury wallet
```

- If quality threshold not met: company can trigger partial refund or request re-annotation
- Dispute window: 72 hours after delivery before funds auto-release
- All state transitions emitted as on-chain events for auditability

#### 4.2.2 Reputation Contract (`DoctorReputation.sol`)

- Issues **Soulbound Tokens (SBTs)** to verified doctors on credential approval
- SBT metadata includes: specialty, years of experience range, tier level, annotation count, current reputation score
- Score updated by a trusted oracle after each batch settlement
- Non-transferable: prevents reputation gaming or selling of accounts

#### 4.2.3 Dataset License Contract (`DatasetLicense.sol`)

- AI company defines license terms on-chain at dataset creation
- Encoded terms: usage type (research/commercial), geographic scope, model type restrictions, expiry date
- License NFT minted to the company's wallet upon dataset delivery
- Provides legally auditable proof of data acquisition and terms

#### 4.2.4 Governance Contract (`MediAnnoteDAO.sol`) *(Future)*

- MAT token holders vote on platform parameter changes (fee rates, tier thresholds, new specialties)
- Proposals require minimum quorum of 4% of circulating supply
- Emergency multisig (5-of-9 council) for critical security patches

---

### 4.3 MAT Token (MediAnnote Token)

| Property | Detail |
|---|---|
| Token Standard | ERC-20 (Polygon PoS for low fees) |
| Total Supply | 100,000,000 MAT |
| Utility | Platform fee discounts, governance voting, staking for premium task access |
| Earning | Annotators earn MAT bonuses for high-quality work, streaks, and referrals |
| Spending | Companies pay in MAT for discounted platform fees (vs. paying full rate in USDC) |

**Token Allocation:**

```
Community & Annotator Rewards   35%  ██████████████
Team & Advisors (4yr vesting)   20%  ████████
Ecosystem & Partnerships        15%  ██████
Treasury & Operations           15%  ██████
Investors (2yr vesting)         10%  ████
Liquidity Pool                   5%  ██
```

---

### 4.4 Data Integrity & Audit Trails

- **Annotation hash commitment:** When a doctor submits an annotation, a SHA-256 hash of the annotation JSON is stored on-chain. This makes it provably immutable — the annotation cannot be altered retroactively without detection.
- **Dataset provenance record:** On-chain record stores: image batch hash, de-identification timestamp, annotator addresses (pseudonymous), IAA scores, final delivery timestamp, license contract address
- **Regulatory export:** Companies can generate a compliance report (PDF) that includes on-chain TX hashes, timestamps, and annotator credential attestations — suitable for FDA 510(k) or CE Mark submissions

---

## 5. Technical Architecture

### 5.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│   │  Doctor Web  │   │  Company Web │   │    Admin Dashboard   │   │
│   │  App (React) │   │  App (React) │   │      (React)         │   │
│   └──────┬───────┘   └──────┬───────┘   └──────────┬───────────┘   │
└──────────┼─────────────────┼──────────────────────┼────────────────┘
           │  REST / GraphQL + WebSocket              │
┌──────────▼─────────────────▼──────────────────────▼────────────────┐
│                       API GATEWAY (Node.js / FastAPI)                │
│              Auth Middleware  │  Rate Limiting  │  RBAC              │
└────────────────────────────────┬───────────────────────────────────┘
                                 │
         ┌───────────────────────┼──────────────────────────┐
         │                       │                          │
┌────────▼──────┐    ┌──────────▼───────┐    ┌────────────▼─────────┐
│   Annotation  │    │  User & Identity  │    │   Payment &          │
│   Service     │    │  Service          │    │   Escrow Service     │
│  (Python)     │    │  (Node.js)        │    │   (Node.js)          │
└────────┬──────┘    └──────────┬───────┘    └────────────┬─────────┘
         │                      │                          │
┌────────▼──────────────────────▼──────────────────────────▼─────────┐
│                       DATA LAYER                                     │
│   PostgreSQL (relational)  │  Redis (cache/sessions)                │
│   MongoDB (annotation JSON) │  Elasticsearch (search/analytics)     │
└──────────────────────────────────────────────────────────────────────┘
         │                      │                          │
┌────────▼──────┐    ┌──────────▼───────┐    ┌────────────▼─────────┐
│  AWS S3       │    │   IPFS / Filecoin │    │  Polygon Blockchain  │
│  (encrypted   │    │   (annotation     │    │  (smart contracts,   │
│  DICOM store) │    │   metadata CIDs)  │    │  SBTs, escrow)       │
└───────────────┘    └──────────────────┘    └──────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────────┐
│                      ML PIPELINE LAYER                              │
│   ┌─────────────────┐   ┌───────────────────┐                     │
│   │  PHI Scrubber   │   │ Quality/IAA Engine │                     │
│   │  (DICOM De-ID)  │   │ (Python/Celery)    │                     │
│   └─────────────────┘   └───────────────────┘                     │
│   ┌─────────────────────────────────────────┐                     │
│   │  AI-Assisted Pre-Annotation Service      │                     │
│   │  (nnU-Net / MedSAM / Foundational Model) │  [Future Feature]  │
│   └─────────────────────────────────────────┘                     │
└───────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Frontend

| Component | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| State Management | Zustand |
| UI Library | Shadcn/UI + TailwindCSS |
| Medical Image Viewer | Cornerstone.js (DICOM rendering) |
| Web3 Wallet | wagmi + ConnectKit (MetaMask, WalletConnect) |
| Annotations | Konva.js (canvas-based annotation overlays) |

---

### 5.3 Backend

| Service | Technology | Responsibility |
|---|---|---|
| API Gateway | Node.js + Express | Auth, routing, rate limiting |
| Annotation Service | Python + FastAPI | Task logic, IAA computation |
| Identity Service | Node.js | OAuth2, JWT, doctor credential verification |
| Payment Service | Node.js + ethers.js | Smart contract interaction, payout scheduling |
| Async Workers | Celery + Redis | IAA calculation, PHI scrubbing, hash commitment |
| Notifications | Firebase / WebSocket | Real-time task updates, payment alerts |

---

### 5.4 ML Pipeline Integration

- **Annotation Export Pipeline:** Batch export annotations to COCO/VOC/CSV formats on completion
- **PHI Scrubber:** Python service using `pydicom` for header stripping + PaddleOCR for burned-in text removal
- **IAA Engine:** Computes Cohen's Kappa / Dice / IoU scores asynchronously after each annotator submits; triggers smart contract oracle call when all 3+ annotators have submitted
- **AI Pre-Annotation (Future):** Foundation model (e.g., MedSAM) generates a draft annotation that doctors can review and correct, reducing annotation time by ~40%

---

### 5.5 Blockchain Layer

| Component | Technology | Network |
|---|---|---|
| Smart Contracts | Solidity 0.8.x | Polygon PoS (low gas fees) |
| Contract Development | Hardhat + OpenZeppelin | — |
| Oracles | Chainlink (for quality score submission) | Polygon |
| Frontend Web3 | wagmi v2 + viem | — |
| Token Standard | ERC-20 (MAT), ERC-5114 (SBT) | Polygon |

---

### 5.6 Storage Architecture

```
Image Storage Strategy:
┌─────────────────────────────────────────────────────┐
│            ORIGINAL DICOM (Pre-De-ID)                │
│   AWS S3 (Private Bucket, zero public access)        │
│   Encrypted AES-256, deleted after de-identification │
└─────────────────────────────────────────────────────┘
          ↓ After PHI scrubbing
┌─────────────────────────────────────────────────────┐
│          CLEAN IMAGE (De-Identified DICOM)           │
│   AWS S3 (Private Bucket)                           │
│   Accessed via time-limited pre-signed URLs          │
│   (2-hour expiry per annotator session)              │
└─────────────────────────────────────────────────────┘
          ↓ After annotation completion
┌─────────────────────────────────────────────────────┐
│       ANNOTATION METADATA (JSON)                     │
│   IPFS / Filecoin                                    │
│   CID (content hash) stored on-chain                 │
│   Ensures annotation data is tamper-proof            │
└─────────────────────────────────────────────────────┘
```

- Original PHI-containing images are stored **only as long as needed** for de-identification processing (< 1 hour), then deleted
- Annotated images and labels are delivered to companies via a secure, authenticated download portal
- Raw data is never stored on a public blockchain — only hashes and metadata

---

## 6. User Flows

### 6.1 Doctor Annotator: End-to-End Journey

```
1. REGISTRATION & VERIFICATION
   └── Doctor visits MediAnnote.io → clicks "Join as Annotator"
   └── Fills profile: specialty, years of experience, institution
   └── Uploads credentials: medical license, board certification
   └── Admin + automated verification (license database API check)
       → Approval: SBT minted to doctor's wallet, account activated
       → Rejection: Email with reason and resubmission option

2. WALLET SETUP
   └── Prompted to connect Web3 wallet (MetaMask / WalletConnect)
       OR select Web2 payout (bank details, UPI)
   └── Web3 wallet linked to SBT for on-chain identity

3. TASK DISCOVERY
   └── Dashboard shows available task batches filtered by specialty
   └── Doctor sees: image type, batch size, reward per image, deadline
   └── Clicks "Accept Batch" → funds locked in escrow confirmed

4. ANNOTATION WORK
   └── Opens annotation workspace (Cornerstone.js viewer)
   └── Loads image with annotation instructions panel on right
   └── Uses annotation tools to label (bounding box, segmentation, etc.)
   └── Adds clinical notes if required
   └── Clicks "Submit Annotation" for each image
   └── SHA-256 hash of annotation JSON committed on-chain automatically

5. QUALITY EVALUATION (background, doctor not involved)
   └── After all 3+ annotators submit → IAA score computed
   └── Honeypot check (if applicable) → score updated
   └── Score committed to DoctorReputation contract

6. PAYMENT
   └── Quality threshold met → escrow smart contract releases funds
   └── Annotator receives USDC / MAT to wallet
       OR bank transfer initiated (Web2 rail)
   └── Push notification: "You earned $47.50 for Batch #1034"
   └── Earnings dashboard updated in real time

7. REPUTATION UPDATE
   └── SBT metadata updated with new annotation count and score
   └── Tier upgrade notification if threshold crossed
```

---

### 6.2 AI Company: End-to-End Journey

```
1. REGISTRATION
   └── Company signs up → company profile: name, use case, regulatory context
   └── KYC/KYB verification (business entity verification)
   └── Account approved

2. DATASET UPLOAD
   └── Company clicks "New Dataset Request"
   └── Uploads images (DICOM / PNG / JPEG) via secure portal
   └── Platform runs PHI scrubber automatically
   └── Company reviews de-identification sample and approves

3. JOB CONFIGURATION
   └── Defines annotation schema: label taxonomy, instructions, examples
   └── Sets annotator requirements: specialty, minimum tier, count per image
   └── Sets budget: platform calculates total cost estimate
   └── Chooses license type: research / commercial / perpetual

4. PAYMENT & ESCROW
   └── Company deposits USDC (or pays via credit card → auto-converted to USDC)
   └── Funds locked in AnnotationEscrow.sol smart contract
   └── Transaction hash emailed as receipt

5. MONITORING
   └── Real-time dashboard: X/Y images annotated, average IAA, ETA
   └── Alerts if annotation quality falls below threshold

6. DELIVERY & LICENSE
   └── All annotations complete → IAA report generated
   └── DatasetLicense NFT minted to company wallet
   └── Annotated dataset download link generated (72-hour expiry)
   └── Full audit trail PDF (on-chain TX hashes, timestamps, annotator tiers)
   └── Escrow releases payments to annotators automatically

7. DISPUTE (if quality concern)
   └── Company flags dispute within 72-hour window
   └── Admin reviews annotation sample
   └── Decision: partial refund, re-annotation, or payment upheld
   └── Outcome recorded on-chain
```

---

## 7. Monetization Model

### 7.1 Platform Fee

- **10% commission** on every annotation job, deducted automatically by smart contract from escrow
- Fee split: 7% to platform treasury, 3% to MAT staking rewards pool

### 7.2 Subscription Tiers for AI Companies

| Plan | Monthly Fee | Features |
|---|---|---|
| Starter | Free | Up to 500 images/month, standard SLA, CSV export |
| Professional | $299/month | Up to 10,000 images/month, priority queue, COCO/VOC export, audit report |
| Enterprise | Custom | Unlimited volume, dedicated annotator pool, SLA guarantees, API access, custom license terms |

### 7.3 MAT Token Economy

- Companies pay platform fees in MAT at a **20% discount** vs. USDC (incentivizes token adoption)
- Annotators can stake MAT tokens to unlock premium task queues with higher-paying jobs
- MAT earns yield when staked in the liquidity pool (APY funded by platform fee flow)
- Secondary market liquidity via DEX (Uniswap on Polygon)

### 7.4 Data Marketplace (Future Revenue)

- Companies can optionally list completed, anonymized datasets on a secondary marketplace
- MediAnnote takes 5% on secondary dataset sales
- Annotators who contributed receive a 2% royalty share from secondary sales (enforced by smart contract)

---

## 8. Trust, Safety & Compliance

### 8.1 Data Anonymization

- **DICOM de-identification standard:** Follows DICOM PS3.15 Annex E (attribute confidentiality profiles)
- **Burned-in PHI removal:** OCR-based detection + diffusion inpainting removes any patient text visible in image pixels
- **Audit log:** Every de-identification step logged with timestamp and operator ID
- **Data Minimization Principle:** Only de-identified images ever leave the upload pipeline; raw data deleted within 1 hour of processing

### 8.2 Regulatory Compliance Framework

| Regulation | How MediAnnote Addresses It |
|---|---|
| HIPAA (USA) | Business Associate Agreements (BAA) with all AI company clients; PHI scrubbing pipeline; access logs; breach notification plan |
| GDPR (EU) | Data processing agreements; right to erasure for doctor profiles; data residency options (EU-region S3 buckets) |
| IT Act / DPDPA (India) | Local data storage option for Indian clients; consent management |
| FDA 21 CFR Part 11 | Electronic record integrity via on-chain hash commitments; audit trail export |

### 8.3 Doctor Verification

- **Step 1 — Document Upload:** Medical license, board certification, government ID
- **Step 2 — Automated Check:** License number cross-referenced against national databases (NMC India, AMA USA, GMC UK) via API integration
- **Step 3 — Manual Review:** Admin spot-checks for jurisdictions without API access
- **Step 4 — SBT Issuance:** Verified doctor receives non-transferable Soulbound Token encoding their verified specialty
- **Annual Re-verification:** License expiry tracked; doctors notified 30 days before to re-verify

### 8.4 Anti-Fraud Controls

- **Honeypot tasks:** 5% of tasks are gold-standard images; performance tracked silently to detect low-effort annotators
- **Behavioral analytics:** Unusually fast completion times, click-pattern anomalies flagged for review
- **Sybil resistance:** SBTs are non-transferable; one wallet per verified doctor
- **Collusion detection:** Statistical analysis of annotation similarity across purportedly independent annotators

### 8.5 Access Control Architecture

```
Access Level Hierarchy:
└── Super Admin (Anthropic/Platform Team)
    ├── Can access all data, override disputes, manage compliance
└── Company Admin
    ├── Can view their own dataset progress and annotations
    ├── Cannot see individual annotator identities
└── Doctor Annotator
    ├── Can only see images assigned to them
    ├── Cannot see other annotators' work until batch closes
    ├── Cannot download raw images (access via signed URL only)
└── Public / Guest
    ├── Can view doctor reputation scores (anonymized)
    ├── Can view platform statistics
```

---

## 9. MVP Scope (Hackathon Version)

### 9.1 What to Build in 24–48 Hours

**Priority 1 — Must Have (Core Demo Loop)**

- [ ] Doctor registration form with specialty selection and mock credential upload
- [ ] Simple annotation workspace: load a sample X-ray, draw bounding box, submit label
- [ ] Task queue UI: list of available annotation tasks with reward amounts
- [ ] Mock payment flow: on annotation submit, trigger a Polygon smart contract transaction that pays USDC (testnet) to doctor's wallet
- [ ] Basic doctor dashboard: tasks completed, earnings balance

**Priority 2 — Should Have (Differentiators)**

- [ ] Soulbound Token (SBT) minting on mock credential approval (Polygon Mumbai testnet)
- [ ] Reputation score display (mock data) on doctor profile
- [ ] Company upload portal: upload image, define labels, set budget
- [ ] Escrow smart contract: company deposits funds, doctor completes task, funds auto-release

**Priority 3 — Nice to Have (If Time Permits)**

- [ ] IAA computation for 2-annotator consensus on one image
- [ ] DICOM header stripping demo using pydicom
- [ ] Annotation hash commitment to Polygon (testnet)

---

### 9.2 What to Exclude from MVP

- MAT token launch and tokenomics (describe in pitch, show in whitepaper)
- Full HIPAA-compliant PHI scrubbing pipeline (describe architecture, mock demo)
- Production doctor license verification API integrations
- AI pre-annotation assistance
- DAO governance
- Production-grade security audit of smart contracts

---

### 9.3 Demo Script for Judges

1. Open platform as **a radiologist** → see available X-ray annotation tasks → accept a batch
2. Open annotation workspace → draw bounding box around a lung nodule → submit
3. Show **MetaMask** receiving USDC on Polygon testnet instantly after submission
4. Show **SBT** on OpenSea testnet representing the doctor's verified identity + reputation score
5. Switch view to **AI company** → show dataset progress dashboard → show escrow transaction on Polygonscan
6. Show **on-chain annotation hash** proving data provenance and immutability

---

## 10. Future Roadmap

### Phase 1 — Launch (Months 1–6)

- Production deployment with real doctor onboarding (starting with radiology in India and USA)
- Integration with NMC India and AMA license verification APIs
- HIPAA BAA program for US company clients
- MAT token generation event (private sale)

### Phase 2 — Scale (Months 7–12)

- AI-assisted pre-annotation using MedSAM / nnU-Net (reduces doctor effort by 40%)
- Mobile-friendly annotation app for tablet use (common in clinical settings)
- Expanded specialties: ophthalmology (fundus), cardiology (echo), neuropathology
- API for programmatic job submission by enterprise clients
- Secondary dataset marketplace launch

### Phase 3 — Ecosystem (Year 2)

- **MediAnnoteDAO launch:** MAT token governance for platform parameters
- **Annotator royalties:** Smart contract enforced 2% royalty on secondary dataset sales
- **Cross-chain expansion:** Support for Ethereum mainnet, Solana, Base
- **Federated learning integration:** Annotated data used in privacy-preserving FL without ever leaving hospital networks
- **Regulatory AI certification pathway:** Partner with notified bodies to use MediAnnote audit trails in FDA/CE submissions

### Phase 4 — Expansion (Year 3+)

- **Beyond healthcare:** Legal document annotation, scientific paper labeling, financial document analysis — same trust model applied to adjacent expert annotation markets
- **AI model marketplace:** Companies share trained models back to the community; doctors who contributed data earn model royalties
- **Insurance & liability layer:** Annotation quality insurance products for AI companies going to regulatory submission

---

## 11. Competitive Advantage

### 11.1 Why This Idea Can Win a Hackathon

| Dimension | Strength |
|---|---|
| **Problem-Solution Fit** | Addresses a real, painful, and expensive problem in the healthcare AI industry |
| **Web3 Necessity** | Blockchain isn't a gimmick here — it solves real trust, payment, and provenance problems that centralized systems cannot |
| **Technical Depth** | Combines smart contracts, SBTs, IPFS, DICOM processing, and IAA algorithms — shows engineering range |
| **Social Impact** | Democratizes access to AI value chain for doctors globally, especially in emerging markets |
| **Business Viability** | Clear monetization model with real TAM ($XX billion medical AI training data market) |
| **Demo-ability** | MetaMask payment on testnet is visually compelling and judges can see it work live |

---

### 11.2 Differentiation vs. Existing Platforms

| Platform | What They Do | MediAnnote Advantage |
|---|---|---|
| **Scale AI** | General annotation with crowd workers | MediAnnote uses **verified domain experts** (licensed doctors); medical-specific tooling |
| **Appen** | Crowd-based annotation, including some medical | MediAnnote has **on-chain reputation SBTs** and smart contract-enforced payments |
| **MD.ai** | Medical annotation platform | MD.ai is **centralized** with no blockchain layer; MediAnnote adds trustless payment, immutable audit trails |
| **Nuvolo / Labelbox** | Enterprise annotation tools | No Web3; no doctor-specific credentialing; no automatic escrow payments |
| **Hivemind** | Decentralized annotation (general) | Not medical-specific; no HIPAA compliance path; no domain-expert verification |

### 11.3 Defensible Moats

1. **Network effect:** As more doctors build on-chain reputation on MediAnnote, they have no incentive to leave — their SBT reputation doesn't transfer to other platforms
2. **Regulatory compliance infrastructure:** HIPAA-compliant pipeline is expensive and slow to build; first-mover advantage for regulated AI companies
3. **Data provenance:** On-chain audit trails become a competitive requirement as FDA increases scrutiny on AI training data — MediAnnote is the only platform offering this natively
4. **Expert annotator lock-in:** Doctors who earn MAT tokens and build reputation have strong platform loyalty; building a competing pool of verified doctors takes years

---

## Appendix A: Smart Contract Interface Sketches

### AnnotationEscrow.sol (Simplified)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AnnotationEscrow {
    struct Batch {
        address company;
        uint256 totalFunds;
        uint256 fundPerImage;
        bool released;
        uint256 qualityScore;
        address[] annotators;
    }

    mapping(bytes32 => Batch) public batches;
    uint256 public platformFeeBps = 1000; // 10%

    event FundsDeposited(bytes32 batchId, address company, uint256 amount);
    event FundsReleased(bytes32 batchId, uint256 qualityScore);
    event DisputeRaised(bytes32 batchId, address company);

    function deposit(bytes32 batchId, address[] calldata annotators)
        external payable { ... }

    function releaseOnQuality(bytes32 batchId, uint256 iaaScore)
        external onlyOracle { ... }

    function raiseDispute(bytes32 batchId)
        external onlyCompany(batchId) withinDisputeWindow(batchId) { ... }
}
```

### DoctorReputation.sol (SBT Sketch)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DoctorReputation is ERC721 {
    struct DoctorProfile {
        string specialty;
        uint8 tier;           // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum
        uint256 reputationScore;
        uint256 annotationCount;
        bool verified;
    }

    mapping(uint256 => DoctorProfile) public profiles;

    // Soulbound: override transfers to revert
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal override {
        require(from == address(0), "SBT: non-transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function mint(address doctor, string calldata specialty)
        external onlyAdmin returns (uint256 tokenId) { ... }

    function updateScore(uint256 tokenId, uint256 newScore)
        external onlyOracle { ... }
}
```

---

## Appendix B: Key Metrics to Track (Post-Launch)

| Metric | Target (Month 6) |
|---|---|
| Verified doctors onboarded | 500+ |
| Images annotated | 50,000+ |
| AI companies as clients | 15+ |
| Average annotation quality (IAA) | >0.80 Cohen's Kappa |
| Doctor retention rate (30-day) | >70% |
| Average payout per doctor per month | $200–$500 |
| Smart contract escrow TVL | $100K+ |

---

*Document Version: 1.0*
*Created for Hackathon Submission — Web3/Blockchain Track*
*Product: MediAnnote | Team: [Your Team Name]*
*Date: March 2026*
