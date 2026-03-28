# API Reference

## Xai ML Service

### `POST /predict`
Generates initial AI bounding boxes for medical images.
- **Request:** `{ "imageIds": ["img-1", "img-2"] }`
- **Response:** `{ "status": "success", "predictions": { "img-1": [{ "id": "xai-123", "label": "Nodule", "box": [0.1, 0.2, 0.1, 0.1], "confidence": 0.92 }] } }`

### `POST /caption`
Generates localized clinical descriptions based on specific annotation coordinates.
- **Request:** `{ "annotations": [{ "label": "Pneumonia", "x": 0.2, "y": 0.1, "w": 0.05, "h": 0.05 }], "confidence": 0.88 }`
- **Response:** `{ "status": "success", "caption": "Xai Insight: Evidence of consolidation observed in the upper-left quadrant...", "hash": "0x..." }`

### `POST /consensus`
Calculates payout splits based on doctor agreement.
- **Request:** `{ "submissions": { "0xDocAddress": [{ annotations... }] } }`
- **Response:** `{ "status": "success", "splits": [{ "address": "0x...", "bps": 5000, "score": 92.5 }] }`

### `GET /fetch-external`
Proxies and scrubs medical images from external NIH/Radiopaedia mirrors.
- **Query Params:** `type` (e.g., Chest X-Ray), `index`
- **Response:** `{ "status": "success", "imageUrl": "https://...", "source": "NIH Chest X-ray Dataset" }`
