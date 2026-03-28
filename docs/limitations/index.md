# Limitations & Improvements

## Known Issues
-   **Local Mock Reliance:** The current consensus engine uses simulated IoU logic; in production, this would be a full GPU-backed compute service.
-   **Single-Network:** Currently only deployed on Polygon Amoy.
-   **Browser Memory:** Very large DICOM files (>200MB) can still cause browser performance lag if not correctly indexed in IDB.

## Potential Improvements
-   **Federated Learning:** Add support for training models directly on the platform without the raw data ever leaving the original hospital firewalls.
-   **Multi-Modal Support:** Expand from images to MRI/CT volumetric data and medical video (ultrasound).
-   **Med-LLM Integration:** Replace math-based clinical templates with a live, HIPAA-compliant Medical LLM (like Med-PaLM 2) for advanced clinical reasoning.
-   **ZK-Proofs:** Use Zero-Knowledge Proofs to prove that a doctor has the required credentials without revealing their real-world identity to the AI company.
