# Xai: Explainable & Auditable AI Features in MediAnnote

MediAnnote integrates **Xai**, a suite of specialized AI models designed to assist medical experts while maintaining absolute transparency and blockchain-backed auditability.

## 1. Xai Smart Drafting (Assisted)
- **What it is:** A computer vision model (simulated MedSAM/ResNet-50) that pre-identifies potential anomalies in medical images.
- **How it works:** When a doctor clicks **"Xai Draft"**, the ML service processes the image and returns normalized coordinates for bounding boxes.
- **Explainability:** Each draft includes a confidence score (e.g., 85%).
- **Assisted Workflow:** Doctors do not start with a blank canvas; they review, adjust, or delete Xai's suggestions, significantly reducing manual effort.

## 2. Xai Clinical Captionist (Explainable)
- **What it is:** A natural language generation model that transforms visual annotations into clinical text.
- **How it works:** Once a doctor has drawn shapes, **"Xai Caption"** analyzes the labels and positions to suggest a medical note (e.g., *"Possible Nodule detected in upper-left quadrant"*).
- **Explainability:** It provides a direct link between the visual data (annotations) and the textual conclusion (notes).

## 3. Xai Consensus Reward Engine (Auditable)
- **What it is:** A fairness algorithm that calculates reward splits based on the quality of work.
- **How it works:** It uses **Intersection over Union (IoU)** to compare multiple doctors' work on the same image.
- **Auditability:** The engine produces a "Consensus Confidence" score. If a doctor's work aligns with the group consensus, they receive a higher share of the USDC escrow.
- **Fairness:** This prevents "lazy" annotations and rewards high-precision expertise.

## 4. Xai PHI Scrubber (Compliant)
- **What it is:** A security layer that ensures data privacy before images reach the decentralized network.
- **How it works:** It strips DICOM metadata tags and uses OCR to mask "burned-in" patient names or hospital IDs in the pixel data.
- **Auditability:** Every scrubbing action is logged, ensuring HIPAA-style compliance for the data requestor.

## 5. Blockchain Provenance (The "AI Audit Trail")
To ensure that Xai's influence on medical decisions is transparent, MediAnnote uses a **Double-Hash Provenance** system:
1.  **AI Hash:** The raw suggestion from Xai (before any doctor edits) is hashed and recorded on the Polygon blockchain via `recordAiInsight`.
2.  **Doctor Hash:** The final, human-verified work is hashed and recorded via `recordAnnotation`.
3.  **Auditing:** During a compliance audit, companies can compare these two hashes to see exactly how much the doctor relied on or modified the AI's suggestions.

---
*Xai ensures that medical expertise is assisted by AI, but always verified by humans and audited by blockchain.*
