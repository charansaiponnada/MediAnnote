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
