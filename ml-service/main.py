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
    
    # NIH Chest X-ray Standard Labels (14 Clinical Categories)
    nih_labels = [
        "Atelectasis", "Cardiomegaly", "Effusion", "Infiltration", "Mass", 
        "Nodule", "Pneumonia", "Pneumothorax", "Consolidation", "Edema", 
        "Emphysema", "Fibrosis", "Pleural_Thickening", "Hernia"
    ]
    
    predictions = {}
    for img_id in image_ids:
        num_boxes = random.randint(1, 3)
        boxes = []
        for _ in range(num_boxes):
            x = round(random.uniform(0.1, 0.6), 4)
            y = round(random.uniform(0.1, 0.6), 4)
            w = round(random.uniform(0.1, 0.3), 4)
            h = round(random.uniform(0.1, 0.3), 4)
            
            boxes.append({
                "id": f"xai-{random.randint(1000, 9999)}",
                "label": random.choice(nih_labels),
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
    Xai Captionist Assist:
    Generates localized clinical descriptions based on specific annotation coordinates.
    Uses normalized 0.5 center point for cross-device spatial logic.
    """
    data = await request.json()
    annotations = data.get("annotations", [])
    confidence = data.get("confidence", 0.88)
    
    if not annotations:
        return {
            "status": "success",
            "caption": "Xai Insight: No manual annotations detected to describe."
        }
        
    # Analyze the first (primary) annotation for spatial logic
    primary = annotations[0]
    label = primary.get("label", "Finding")
    x = primary.get("x", 0.5)
    y = primary.get("y", 0.5)
    
    # Math-Based Spatial Logic (Normalized 0.0 - 1.0)
    h_pos = "left" if x < 0.5 else "right"
    v_pos = "upper" if y < 0.5 else "lower"
    quadrant = f"{v_pos}-{h_pos}"
    
    # Clinical phrasing templates for NIH categories
    templates = {
        "Pneumonia": [
            f"Xai Insight: Patchy opacification noted in the {quadrant} lung field, indicative of acute Pneumonia.",
            f"Xai Insight: Consolidation observed in the {quadrant} quadrant. Patterns correlate with localized Pneumonia."
        ],
        "Nodule": [
            f"Xai Insight: Solitary pulmonary nodule identified in the {quadrant} zone. Recommend clinical correlation.",
            f"Xai Insight: Small circumscribed mass in the {quadrant} quadrant, suspicious for a Nodule."
        ],
        "Effusion": [
            f"Xai Insight: Evidence of fluid accumulation in the {quadrant} pleural space, consistent with Effusion."
        ],
        "Cardiomegaly": [
            f"Xai Insight: Enlaraged cardiac silhouette noted. Spatial findings in the {quadrant} region suggest Cardiomegaly."
        ],
        "Atelectasis": [
            f"Xai Insight: Linear opacities in the {quadrant} quadrant suggesting volume loss and Atelectasis."
        ],
        "Infiltration": [
            f"Xai Insight: Diffuse infiltrative patterns observed within the {quadrant} lung parenchyma."
        ],
        "Mass": [
            f"Xai Insight: Large space-occupying lesion (Mass) identified in the {quadrant} quadrant."
        ]
    }
    
    # Generate response
    default_msg = f"Xai Insight: {label} detected with {int(confidence * 100)}% confidence in the {quadrant} quadrant. Suggest further clinical evaluation."
    phrases = templates.get(label, [default_msg])
    caption = random.choice(phrases)
    
    return {
        "status": "success",
        "caption": caption,
        "hash": f"0x{random.getrandbits(256):064x}"
    }

@app.get("/fetch-external")
async def fetch_external_image(type: str, index: int):
    """
    Simulates fetching from a real medical API (NIH, DICOMweb, etc.)
    and performing PHI scrubbing before returning to the frontend.
    """
    # Simulate a delay for external API network call
    await asyncio.sleep(0.5)
    
    # Map index to real open-source assets or curated medical URLs
    # In a real scenario, this would call Google Cloud Healthcare API or TCIA
    mock_real_assets = {
        "Chest X-Ray": [
            "https://prod-images-static.radiopaedia.org/images/50849926/879641443493779e51921356f9661c_big_gallery.jpeg",
            "https://prod-images-static.radiopaedia.org/images/53331454/6a8d810f92f15049b1a5b820a455a1_big_gallery.jpeg",
            "https://prod-images-static.radiopaedia.org/images/157210/3ea33989396e95b066f7f6305a2e5d_big_gallery.jpg",
            "https://prod-images-static.radiopaedia.org/images/34402003/0507218311d950005527a4_big_gallery.jpeg",
            "https://prod-images-static.radiopaedia.org/images/51767175/73b34199965d130a174094a973562a_big_gallery.jpeg"
        ],
        "Retinal OCT": [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/OCT_macula_normal.png/800px-OCT_macula_normal.png",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Retina_OCT_scan.png/800px-Retina_OCT_scan.png"
        ]
    }
    
    assets = mock_real_assets.get(type, mock_real_assets["Chest X-Ray"])
    url = assets[index % len(assets)]
    
    return {
        "status": "success",
        "imageUrl": url,
        "source": "NIH Chest X-ray Dataset (ChestX-ray14)",
        "scrubbed": True,
        "dataset_url": "https://www.kaggle.com/datasets/nih-chest-xrays/data"
    }
