# Features

## 1. Xai (Explainable & Assisted AI)
MediAnnote’s standout feature is its integrated assistant:
- **Xai Smart Draft:** AI pre-detects anomalies (e.g., Pneumonia, Nodules) in 14 NIH categories, so doctors only need to refine work instead of starting from scratch.
- **Xai Captionist:** Generates clinical notes by analyzing the spatial coordinates and labels of human annotations.

## 2. Blockchain Audit Trail
To ensure clinical integrity, we maintain a dual-hash provenance trail:
- **AI Hash:** The raw suggestion from Xai is hashed and recorded on-chain.
- **Doctor Hash:** The final, verified work is hashed and recorded on-chain.
Auditors can compare these to see exactly how much a doctor relied on AI suggestions.

## 3. Consensus Reward Engine
Fairness is built into the payout mechanism:
- Uses **Intersection over Union (IoU)** logic.
- Doctors who align with the group consensus receive higher reputation scores and larger payout shares.
- Payouts are handled automatically by the smart contract upon calculation.

## 4. Live NIH Data Integration
The platform can dynamically pull real medical cases from the **NIH ChestX-ray14 dataset** via the Xai Proxy, providing a high-fidelity "live" experience.

## 5. DICOM PHI Scrubber
Ensures HIPAA compliance by automatically stripping patient-identifying tags from images before they enter the decentralized annotation pool.
