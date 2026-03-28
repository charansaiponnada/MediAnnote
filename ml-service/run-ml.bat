@echo off
cd /d "%~dp0"
echo ==========================================
echo MediAnnote ML Microservice (FastAPI + SSE)
echo ==========================================

echo [1/2] Installing dependencies...
pip install -r requirements.txt

echo [2/2] Starting server on http://localhost:8000
uvicorn main:app --reload --port 8000
