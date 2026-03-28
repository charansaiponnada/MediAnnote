# Developer Guide

## Coding Standards
- **TypeScript:** Strict typing is mandatory. Avoid `any` types.
- **Components:** Functional components with React Hooks. Use TailwindCSS for all styling.
- **Smart Contracts:** Solidity 0.8.24+. Use OpenZeppelin libraries for standard implementations (ERC20, ERC721, Ownable).
- **Python:** PEP 8 standards. Use type hinting for FastAPI endpoints.

## Best Practices
1. **Local State vs. Global Store:** Use local `useState` for UI-specific toggles. Use **Zustand** for cross-route data like batch progress and user profiles.
2. **Web3 Security:** Never store private keys in the frontend. Always use `useAccount` and `useWriteContract` from Wagmi.
3. **Large Image Handling:** Use `idb-keyval` to store large medical blobs in the browser's IndexedDB instead of the Redux/Zustand store to prevent memory crashes.

## Contribution Guide
1. Create a feature branch: `git checkout -b feat/my-new-feature`.
2. Commit your changes with clear messages.
3. Run `npm run lint` and ensure all tests pass.
4. Open a Pull Request for review.
