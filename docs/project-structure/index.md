# Project Structure

## Folder Breakdown

### `/src`
The core Next.js application.
- `/app`: Next.js App Router (pages for Admin, Doctor, Company).
- `/components`: Shared UI components (Navbar, Tables, Toolbars).
- `/lib`: Helper functions for contracts, image utilities, and global state (Zustand).
- `/providers`: Context providers for Web3 and Theme support.

### `/contracts`
Solidity source code for the platform's core logic.
- `AnnotationEscrow.sol`: Payout and provenance logic.
- `DoctorSBT.sol`: Professional reputation and verification tokens.
- `/abis`: JSON definitions for frontend contract communication.

### `/ml-service`
Python-based intelligence engine.
- `main.py`: FastAPI server handling Xai features and consensus.
- `requirements.txt`: Python dependencies.

### `/public`
Static assets and images.
- `/medical`: Local medical images (X-rays) for the demo.

### `/docs`
Project documentation site.
- Architectural diagrams, API specs, and feature guides.
