from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
import random

app = FastAPI(title="MediAnnote ML Service")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/train")
async def train_model(request: Request):
    """
    Simulates a robust model training loop over epochs and streams the logs back via SSE.
    """
    data = await request.json()
    batch_id = data.get("batchId", "unknown")
    total_epochs = data.get("totalEpochs", 50)
    data_size = data.get("dataSize", 50)
    
    async def training_generator():
        yield {"data": json.dumps({"type": "log", "message": f"[INFO] Initializing training pipeline for Batch {batch_id} (Size: {data_size} images)..."})}
        await asyncio.sleep(1)
        yield {"data": json.dumps({"type": "log", "message": "[INFO] Loading image tensors into VRAM (CUDA:0)..."})}
        await asyncio.sleep(1.5)
        yield {"data": json.dumps({"type": "log", "message": "[INFO] Compiling ResNet-50 architecture with custom head..."})}
        await asyncio.sleep(1)

        base_loss = 2.4
        base_acc = 0.45

        chart_data = []

        for epoch in range(1, total_epochs + 1):
            # Simulate realistic mathematical curve
            jitter = random.uniform(-0.02, 0.02)
            current_loss = base_loss * (0.85 ** epoch) + jitter
            current_val_loss = (base_loss * 0.9) * (0.86 ** epoch) + random.uniform(-0.01, 0.03)
            
            # Accuracy goes up asymptotically to ~0.96
            current_acc = 0.96 - (0.5 * (0.84 ** epoch)) + jitter
            current_val_acc = 0.94 - (0.55 * (0.85 ** epoch)) + random.uniform(-0.02, 0.02)
            
            # Ensure boundaries
            current_loss = max(0.05, current_loss)
            current_val_loss = max(0.08, current_val_loss)
            current_acc = min(0.99, current_acc)
            current_val_acc = min(0.97, current_val_acc)

            chart_data.append({
                "epoch": epoch,
                "train_loss": round(current_loss, 4),
                "val_loss": round(current_val_loss, 4),
                "train_acc": round(current_acc, 4),
                "val_acc": round(current_val_acc, 4)
            })

            log_msg = f"Epoch {epoch:02d}/{total_epochs} - loss: {current_loss:.4f} - accuracy: {current_acc:.4f} - val_loss: {current_val_loss:.4f} - val_accuracy: {current_val_acc:.4f}"
            
            yield {"data": json.dumps({"type": "log", "message": log_msg})}
            
            # Fast training simulation (0.05s to 0.1s per epoch)
            await asyncio.sleep(random.uniform(0.05, 0.1))

        yield {"data": json.dumps({"type": "log", "message": "[INFO] Training completed. Running final evaluation on holdout set..."})}
        await asyncio.sleep(1.5)
        
        # Return final metrics
        final_metrics = {
            "type": "complete",
            "accuracy": round(chart_data[-1]["val_acc"] * 100, 2),
            "precision": round(random.uniform(92.0, 96.0), 2),
            "recall": round(random.uniform(89.0, 94.0), 2),
            "f1_score": round(random.uniform(90.0, 95.0), 2),
            "chart_data": chart_data,
            "confusion_matrix": [
                [random.randint(140, 160), random.randint(2, 10)],
                [random.randint(5, 15), random.randint(180, 210)]
            ]
        }
        
        yield {"data": json.dumps(final_metrics)}
        
    return EventSourceResponse(training_generator())

@app.post("/predict")
async def predict_annotations(request: Request):
    """
    AI-Assisted Annotation (Smart Drafting): 
    Generates initial bounding boxes for medical images.
    """
    data = await request.json()
    image_ids = data.get("imageIds", [])
    
    predictions = {}
    for img_id in image_ids:
        # Simulate AI detecting 1-3 anomalies per image
        num_boxes = random.randint(1, 3)
        boxes = []
        for _ in range(num_boxes):
            # Normalized coordinates [x, y, width, height]
            x = round(random.uniform(0.1, 0.6), 4)
            y = round(random.uniform(0.1, 0.6), 4)
            w = round(random.uniform(0.1, 0.3), 4)
            h = round(random.uniform(0.1, 0.3), 4)
            
            boxes.append({
                "id": f"ai-{random.randint(1000, 9999)}",
                "label": random.choice(["Anomaly", "Nodule", "Lesion", "Cyst"]),
                "box": [x, y, w, h],
                "confidence": round(random.uniform(0.75, 0.98), 2)
            })
        predictions[img_id] = boxes
        
    return {"status": "success", "predictions": predictions}

@app.post("/consensus")
async def calculate_consensus(request: Request):
    """
    Consensus-Based Reward Engine:
    Compares annotations from multiple doctors and calculates payout splits (BPS).
    """
    data = await request.json()
    # Expects { "annotations": { "doctor_addr": [annotations...], ... } }
    doctor_submissions = data.get("submissions", {})
    
    if not doctor_submissions:
        return {"error": "No submissions found"}
        
    doctors = list(doctor_submissions.keys())
    scores = {}
    
    # Simulation logic: 
    # Compare each doctor's boxes against a "consensus/ground truth" derived from all
    # In a real app, this would use IoU (Intersection over Union) math
    for doctor in doctors:
        # Base score between 70-100% based on agreement
        base_score = random.uniform(0.7, 1.0)
        # Penalize slightly if they submitted fewer annotations than others
        submission_length = len(doctor_submissions[doctor])
        scores[doctor] = base_score * (1.0 if submission_length > 0 else 0)

    # Normalize scores to Basis Points (BPS) totaling 10000 (100%)
    total_score = sum(scores.values())
    if total_score == 0:
        return {"error": "Total score is zero"}
        
    splits_bps = []
    for doctor in doctors:
        bps = int((scores[doctor] / total_score) * 10000)
        splits_bps.append({
            "address": doctor,
            "bps": bps,
            "score": round(scores[doctor] * 100, 2)
        })
        
    # Adjust last BPS to ensure exactly 10000 (handling rounding errors)
    current_total = sum(s["bps"] for s in splits_bps)
    if current_total != 10000 and splits_bps:
        splits_bps[-1]["bps"] += (10000 - current_total)

    return {
        "status": "success",
        "splits": splits_bps,
        "metrics": {
            "average_iou": round(random.uniform(0.82, 0.91), 3),
            "consensus_confidence": round(random.uniform(0.88, 0.95), 3)
        }
    }

@app.post("/scrub")
async def scrub_phi(request: Request):
    """
    DICOM PHI Scrubber:
    Simulates stripping Patient Health Information (PHI) from metadata/images.
    In a real app, this would use pydicom to remove tags like (0010, 0010) PatientName.
    """
    data = await request.json()
    filename = data.get("filename", "unknown.dcm")
    
    # Simulate processing time
    await asyncio.sleep(random.uniform(0.2, 0.5))
    
    return {
        "status": "success",
        "original_file": filename,
        "scrubbed_file": f"scrubbed_{filename}",
        "removed_tags": [
            "PatientName", "PatientID", "PatientBirthDate", 
            "InstitutionName", "ReferringPhysicianName"
        ],
        "message": "PHI successfully stripped. Image is now safe for decentralized distribution."
    }

@app.post("/caption")
async def generate_caption(request: Request):
    """
    AI Captionist Assist:
    Generates a textual description of detected anomalies to assist doctors.
    """
    data = await request.json()
    labels = data.get("labels", [])
    confidence = data.get("confidence", 0.85)
    
    if not labels:
        return {"caption": "AI Insight: No significant anomalies detected in this view."}
        
    primary_label = labels[0]
    quadrants = ["upper-left", "upper-right", "lower-left", "lower-right"]
    quadrant = random.choice(quadrants)
    
    caption = f"AI Insight: Possible {primary_label} detected with {int(confidence * 100)}% confidence in the {quadrant} quadrant. Recommend further clinical correlation."
    
    return {
        "status": "success",
        "caption": caption,
        "hash": f"0x{random.getrandbits(256):064x}" # Simulated SHA-256 hash
    }
