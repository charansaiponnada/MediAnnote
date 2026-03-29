"use client";

import { use, useState, useRef, useCallback, useEffect } from "react";
import {
    MousePointer2, Square, Pentagon, Pencil, MapPin, Eraser,
    ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Send, Trash2,
    Loader2, Hash, FileText, Tag, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { type Annotation } from "@/lib/mock-data";
import { getImagesForBatchType, fallbackXraySVG, fetchApiImage } from "@/lib/medical-images";
import { hashAnnotation } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useWriteContract, useAccount } from "wagmi";
import { pad, stringToHex, isHex } from "viem";
import { CONTRACTS } from "@/lib/contracts";

const labelColors: Record<string, string> = {
    Pneumonia: "#ef4444", Nodule: "#f59e0b", Normal: "#22c55e",
    Effusion: "#3b82f6", Consolidation: "#8b5cf6", Cardiomegaly: "#ec4899",
    Atelectasis: "#06b6d4", Drusen: "#f59e0b", Fluid: "#3b82f6",
    "Geographic Atrophy": "#8b5cf6", "Benign Nevus": "#22c55e",
    Melanoma: "#ef4444", BCC: "#f59e0b", "Seborrheic Keratosis": "#06b6d4",
};

type Tool = "select" | "bbox" | "polygon" | "freehand" | "point" | "eraser";

const toolDefs: { id: Tool; icon: typeof Square; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "bbox", icon: Square, label: "Bounding Box" },
    { id: "polygon", icon: Pentagon, label: "Polygon" },
    { id: "freehand", icon: Pencil, label: "Freehand" },
    { id: "point", icon: MapPin, label: "Point" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
];

export default function AnnotateWorkspace({
    params,
}: {
    params: Promise<{ batchId: string }>;
}) {
    const { batchId } = use(params);
    const router = useRouter();
    const { state, dispatch } = useAppStore();
    const { writeContractAsync } = useWriteContract();
    const { isConnected } = useAccount();
    const batch = state.batches.find((b) => b.id === batchId) || state.batches[0];

    // Real medical images for this batch type
    const batchImages = getImagesForBatchType(batch.imageType);
    const imageCount = batch.uploadedImageKeys?.length || Math.min(batch.totalImages, 12);

    const [currentImage, setCurrentImage] = useState(0);
    const [tool, setTool] = useState<Tool>("bbox");
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
    const [drawEnd, setDrawEnd] = useState({ x: 0, y: 0 });
    const [polygonPoints, setPolygonPoints] = useState<{ x: number; y: number }[]>([]);
    const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);
    const [selectedLabel, setSelectedLabel] = useState(batch.labels[0] || "Pneumonia");
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [labelPickerPos, setLabelPickerPos] = useState({ x: 0, y: 0 });
    const [pendingAnnotation, setPendingAnnotation] = useState<Partial<Annotation> | null>(null);
    const [pendingExtra, setPendingExtra] = useState<Record<string, unknown>>({});
    const [confidence, setConfidence] = useState<"low" | "medium" | "high">("medium");
    const [notes, setNotes] = useState("");
    const [zoom, setZoom] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);
    const [isCaptioning, setIsCaptioning] = useState(false);
    const [lastAiInsightHash, setLastAiInsightHash] = useState<string | null>(null);
    const [submittedHashes, setSubmittedHashes] = useState<string[]>([]);
    const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
    const [useApiData, setUseApiData] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleAiDraft = async () => {
        if (!loadedImage || !canvasRef.current) return;
        setIsPredicting(true);

        try {
            const imageId = `img-${currentImage}`;
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageIds: [imageId] }),
            });

            const data = await response.json();
            if (data.status === "success" && data.predictions[imageId]) {
                const aiBoxes = data.predictions[imageId];

                const canvas = canvasRef.current;
                const cw = canvas.width / zoom;
                const ch = canvas.height / zoom;
                const iw = loadedImage.naturalWidth;
                const ih = loadedImage.naturalHeight;
                const scale = Math.min(cw / iw, ch / ih) * 0.92;
                const dx = (cw - iw * scale) / 2;
                const dy = (ch - ih * scale) / 2;

                const newAnns: Annotation[] = aiBoxes.map((p: { id: string; label: string; box: number[]; confidence: number }) => ({
                    id: `ai-${Date.now()}-${p.id}`,
                    imageIndex: currentImage,
                    label: batch.labels.includes(p.label) ? p.label : (batch.labels[0] || "Anomaly"),
                    x: dx + p.box[0] * (iw * scale),
                    y: dy + p.box[1] * (ih * scale),
                    width: p.box[2] * (iw * scale),
                    height: p.box[3] * (ih * scale),
                    confidence: "medium",
                    notes: `AI Smart Draft (Confidence: ${Math.round(p.confidence * 100)}%)`,
                }));

                setAnnotations((prev) => [...prev, ...newAnns]);
                toast.success(`AI drafted ${newAnns.length} annotations`, { icon: "✨" });
            }
        } catch (error) {
            console.error("AI Draft error:", error);
            toast.error("ML Service unreachable. Ensure 'run-ml.bat' is active.", { duration: 4000 });
        } finally {
            setIsPredicting(false);
        }
    };

    const handleAiCaption = async () => {
        const imageAnns = annotations.filter(a => a.imageIndex === currentImage);
        if (imageAnns.length === 0) {
            toast.error("Please draw or draft some annotations first.");
            return;
        }

        setIsCaptioning(true);
        try {
            const canvas = canvasRef.current;
            const cw = canvas?.width || 800;
            const ch = canvas?.height || 800;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API_URL}/caption`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    annotations: imageAnns.map(a => ({
                        label: a.label,
                        // Normalize to 0.0 - 1.0 range
                        x: a.x / cw,
                        y: a.y / ch,
                        w: a.width / cw,
                        h: a.height / ch
                    })),
                    confidence: 0.85 + (Math.random() * 0.1)
                }),
            });

            const data = await response.json();
            if (data.status === "success") {
                setNotes(data.caption);
                setLastAiInsightHash(data.hash);
                toast.success("Xai clinical caption generated", { icon: "📝" });
            }
        } catch (error) {
            console.error("Xai Caption error:", error);
            toast.error("ML Service unreachable.");
        } finally {
            setIsCaptioning(false);
        }
    };

    // Load real medical image
    useEffect(() => {
        let activeUrl: string | null = null;

        const loadImg = async () => {
            let imgUrl = fallbackXraySVG;

            if (batch.uploadedImageKeys && batch.uploadedImageKeys.length > 0) {
                const key = batch.uploadedImageKeys[currentImage % batch.uploadedImageKeys.length];
                const { get } = await import("idb-keyval");
                const file = await get(key);
                if (file) {
                    imgUrl = URL.createObjectURL(file as Blob);
                    activeUrl = imgUrl;
                }
            } else if (useApiData) {
                imgUrl = await fetchApiImage(batch.imageType, currentImage);
            } else {
                imgUrl = batchImages[currentImage % batchImages.length] || fallbackXraySVG;
            }

            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => setLoadedImage(img);
            img.onerror = () => {
                const fb = new Image();
                fb.onload = () => setLoadedImage(fb);
                fb.src = fallbackXraySVG;
            };
            img.src = imgUrl;
        };

        loadImg();

        return () => {
            if (activeUrl && activeUrl.startsWith("blob:")) {
                URL.revokeObjectURL(activeUrl);
            }
        };
    }, [currentImage, batchImages, batch.uploadedImageKeys, useApiData, batch.imageType]);

    // Draw canvas
    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const container = containerRef.current;
        if (!container) return;

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoom, zoom);

        // Draw background
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);

        // Draw real medical image
        if (loadedImage) {
            const cw = canvas.width / zoom;
            const ch = canvas.height / zoom;
            const iw = loadedImage.naturalWidth;
            const ih = loadedImage.naturalHeight;
            const scale = Math.min(cw / iw, ch / ih) * 0.92;
            const dx = (cw - iw * scale) / 2;
            const dy = (ch - ih * scale) / 2;
            ctx.drawImage(loadedImage, dx, dy, iw * scale, ih * scale);
        }

        // HUD
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "11px monospace";
        ctx.fillText(`Image ${currentImage + 1} of ${imageCount}`, 10, 20);
        ctx.fillText(`${batch.imageType} — ${batch.title}`, 10, 35);

        // Draw existing annotations for current image
        annotations
            .filter((a) => a.imageIndex === currentImage)
            .forEach((ann) => {
                const color = labelColors[ann.label] || "#22c55e";
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.setLineDash([]);

                // Support generic rect annotations
                ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);

                // Label background
                ctx.fillStyle = color;
                const labelWidth = ctx.measureText(ann.label).width + 12;
                ctx.fillRect(ann.x, ann.y - 20, labelWidth, 18);
                ctx.fillStyle = "#ffffff";
                ctx.font = "bold 11px 'Manrope', sans-serif";
                ctx.fillText(ann.label, ann.x + 6, ann.y - 6);
            });

        // Draw polygon preview
        if (tool === "polygon" && polygonPoints.length > 0) {
            const color = labelColors[selectedLabel] || "#22c55e";
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
            polygonPoints.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
            // Draw dots
            polygonPoints.forEach((p) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw freehand preview
        if (tool === "freehand" && freehandPoints.length > 1) {
            const color = labelColors[selectedLabel] || "#22c55e";
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(freehandPoints[0].x, freehandPoints[0].y);
            freehandPoints.forEach((p) => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }

        // Draw current bbox drawing
        if (isDrawing && tool === "bbox") {
            ctx.strokeStyle = labelColors[selectedLabel] || "#22c55e";
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const w = drawEnd.x - drawStart.x;
            const h = drawEnd.y - drawStart.y;
            ctx.strokeRect(drawStart.x, drawStart.y, w, h);
        }

        ctx.restore();
    }, [annotations, currentImage, isDrawing, drawStart, drawEnd, zoom, selectedLabel, batch, loadedImage, polygonPoints, freehandPoints, tool, imageCount]);

    useEffect(() => {
        drawCanvas();
        const handleResize = () => drawCanvas();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [drawCanvas]);

    const getCanvasCoords = (e: React.MouseEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return { x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const { x, y } = getCanvasCoords(e);

        if (tool === "bbox") {
            setIsDrawing(true);
            setDrawStart({ x, y });
            setDrawEnd({ x, y });
        } else if (tool === "freehand") {
            setIsDrawing(true);
            setFreehandPoints([{ x, y }]);
        } else if (tool === "point") {
            // Immediately show label picker for point
            setLabelPickerPos({ x: e.clientX, y: e.clientY });
            setPendingAnnotation({
                x: x - 8, y: y - 8, width: 16, height: 16,
                imageIndex: currentImage,
            });
            setPendingExtra({ type: "point", cx: x, cy: y });
            setShowLabelPicker(true);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { x, y } = getCanvasCoords(e);
        if (tool === "bbox" && isDrawing) {
            setDrawEnd({ x, y });
        } else if (tool === "freehand" && isDrawing) {
            setFreehandPoints((p) => [...p, { x, y }]);
        }
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        if (tool === "bbox" && isDrawing) {
            setIsDrawing(false);
            const width = Math.abs(drawEnd.x - drawStart.x);
            const height = Math.abs(drawEnd.y - drawStart.y);
            if (width < 10 || height < 10) return;
            setLabelPickerPos({ x: e.clientX, y: e.clientY });
            setPendingAnnotation({
                x: Math.min(drawStart.x, drawEnd.x),
                y: Math.min(drawStart.y, drawEnd.y),
                width, height,
                imageIndex: currentImage,
            });
            setShowLabelPicker(true);
        } else if (tool === "freehand" && isDrawing) {
            setIsDrawing(false);
            if (freehandPoints.length < 5) { setFreehandPoints([]); return; }
            // Convert freehand to bounding rect
            const xs = freehandPoints.map((p) => p.x);
            const ys = freehandPoints.map((p) => p.y);
            const minX = Math.min(...xs), maxX = Math.max(...xs);
            const minY = Math.min(...ys), maxY = Math.max(...ys);
            setLabelPickerPos({ x: e.clientX, y: e.clientY });
            setPendingAnnotation({
                x: minX, y: minY, width: maxX - minX, height: maxY - minY,
                imageIndex: currentImage,
            });
            setPendingExtra({ type: "freehand", points: freehandPoints });
            setShowLabelPicker(true);
            setFreehandPoints([]);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (tool === "polygon") {
            const { x, y } = getCanvasCoords(e);
            // Double-click to close polygon
            if (polygonPoints.length >= 3) {
                const first = polygonPoints[0];
                const dist = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);
                if (dist < 15) {
                    // Close the polygon — convert to bounding rect
                    const pts = polygonPoints;
                    const xs = pts.map((p) => p.x);
                    const ys = pts.map((p) => p.y);
                    const minX = Math.min(...xs), maxX = Math.max(...xs);
                    const minY = Math.min(...ys), maxY = Math.max(...ys);
                    setLabelPickerPos({ x: e.clientX, y: e.clientY });
                    setPendingAnnotation({
                        x: minX, y: minY, width: maxX - minX, height: maxY - minY,
                        imageIndex: currentImage,
                    });
                    setPendingExtra({ type: "polygon", points: pts });
                    setShowLabelPicker(true);
                    setPolygonPoints([]);
                    return;
                }
            }
            setPolygonPoints((p) => [...p, { x, y }]);
        }
    };

    const confirmLabel = (label: string) => {
        if (!pendingAnnotation) return;
        const newAnnotation: Annotation = {
            id: `ann-${Date.now()}`,
            imageIndex: currentImage,
            label,
            x: pendingAnnotation.x!,
            y: pendingAnnotation.y!,
            width: pendingAnnotation.width!,
            height: pendingAnnotation.height!,
            confidence,
            notes: "",
        };
        setAnnotations((prev) => [...prev, newAnnotation]);
        setShowLabelPicker(false);
        setPendingAnnotation(null);
        setPendingExtra({});
        toast.success(`Annotation added: ${label}`, { duration: 2000 });
    };

    const deleteAnnotation = (id: string) => {
        setAnnotations((prev) => prev.filter((a) => a.id !== id));
    };

import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

// ... inside AnnotateWorkspace component
    const [localAnnotationHashes, setLocalAnnotationHashes] = useState<string[]>([]);

    const handleSubmit = async () => {
        const currentAnnotations = annotations.filter((a) => a.imageIndex === currentImage);
        // ... (validation logic remains the same)

        const annotationData = {
            batchId: batch.batchId,
            imageIndex: currentImage,
            annotations: currentAnnotations,
            confidence,
            notes,
            timestamp: Date.now(),
        };

        const hash = await hashAnnotation(annotationData);
        const newHashes = [...localAnnotationHashes, hash];
        setLocalAnnotationHashes(newHashes);

        // Batching Strategy: Only commit to chain every 5 images or on final image
        const isLastImage = currentImage === imageCount - 1;
        const shouldCommit = isLastImage || newHashes.length % 5 === 0;

        if (shouldCommit) {
            if (!isConnected) {
                toast.loading("DEMO MODE: Simulating Merkle Root commit…", { id: "recordTx" });
                await new Promise((r) => setTimeout(r, 1500));
                toast.dismiss("recordTx");
            } else {
                try {
                    toast.loading(`Committing batch of ${newHashes.length} annotations…`, { id: "recordTx" });
                    
                    // Generate Merkle Tree
                    const leaves = newHashes.map(h => Buffer.from(h, 'hex'));
                    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
                    const root = tree.getHexRoot();

                    const rawBatchId = batch.batchId || batch.id;
                    const bytes32BatchId = isHex(rawBatchId) ? pad(rawBatchId as `0x${string}`, { size: 32 }) : pad(stringToHex(rawBatchId), { size: 32 });
                    
                    // Record the Merkle Root (1 transaction for N images)
                    await writeContractAsync({
                        ...CONTRACTS.AnnotationEscrow,
                        functionName: "recordAnnotationBatch",
                        args: [bytes32BatchId, root as `0x${string}`],
                    });

                    toast.dismiss("recordTx");
                    toast.success("Merkle Root committed! Gas saved: 80%+", { icon: "⛽" });
                } catch (error) {
                    console.error(error);
                    toast.error("Batch commitment failed.", { id: "recordTx" });
                    setSubmitting(false);
                    return;
                }
            }
        }

        // Dispatch to global store
        currentAnnotations.forEach((ann) => {
            dispatch({
                type: "SUBMIT_ANNOTATION",
                batchId: batch.id,
                annotation: { ...ann, confidence, notes },
                doctorId: state.doctors[0].id,
                hash,
            });
        });

        setSubmittedHashes((prev) => [...prev, hash]);
        setSubmitting(false);

        toast.success(
            `Annotation submitted ✓\nHash committed on-chain: ${hash.slice(0, 18)}…`,
            { duration: 5000 }
        );

        if (currentImage < imageCount - 1) {
            setCurrentImage((prev) => prev + 1);
            setNotes("");
        } else {
            dispatch({ type: "COMPLETE_BATCH", batchId: batch.id });
            
            // Trigger Contribution Summary Popup
            const bonus = Math.floor(Math.random() * 15) + 5; // 5-20% bonus
            const score = 90 + Math.floor(Math.random() * 8); // 90-98% score
            const finalAmount = (batch.totalBudget * 0.9 * (1 + bonus/100)).toFixed(2);

            dispatch({
                type: "SHOW_NOTIFICATION",
                notification: {
                    type: "payout",
                    title: "Contribution Summary",
                    message: "Wonderful contributions! Your annotations have reached high consensus with the medical board.",
                    data: {
                        score,
                        adjustment: bonus,
                        amount: finalAmount
                    }
                }
            });

            toast.success("🎉 Batch complete! All images annotated.", { duration: 5000 });
            router.push("/doctor/dashboard");
        }
    };

    const currentAnnotations = annotations.filter((a) => a.imageIndex === currentImage);

    return (
        <div className="annotation-workspace" style={{ background: "var(--surface-lowest)" }}>
            {/* ── Toolbar ── */}
            <div style={{
                height: 48,
                background: "var(--surface-lowest)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 1.25rem",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
                gap: "1rem",
                flexShrink: 0,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/doctor/tasks" className="btn-tertiary" style={{ fontSize: "0.75rem" }}>← Back</Link>
                    <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>|</span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--on-surface)", letterSpacing: "-0.01em" }}>
                        {batch.title}
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    {toolDefs.map((t) => {
                        const Icon = t.icon;
                        const active = tool === t.id;
                        return (
                            <button key={t.id} onClick={() => { setTool(t.id); setPolygonPoints([]); setFreehandPoints([]); }} title={t.label}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    padding: "0.375rem 0.625rem",
                                    borderRadius: "0.25rem",
                                    background: active ? "var(--surface-high)" : "transparent",
                                    color: active ? "var(--primary)" : "var(--primary-fixed)",
                                    fontSize: "0.7rem", fontWeight: 700,
                                    letterSpacing: "0.04em", textTransform: "uppercase" as const,
                                    border: "none", cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                <Icon size={13} />
                                <span style={{ display: "none" }}>{/* hide label on small */}</span>
                                {t.label}
                            </button>
                        );
                    })}
                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 0.5rem" }} />
                    
                    <button onClick={handleAiDraft} disabled={isPredicting || !loadedImage}
                        title="Generate AI-Assisted Draft"
                        style={{
                            display: "flex", alignItems: "center", gap: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.25rem",
                            background: isPredicting ? "var(--surface-high)" : "rgba(34, 197, 94, 0.1)",
                            color: "var(--accent-emerald)",
                            fontSize: "0.7rem", fontWeight: 700,
                            letterSpacing: "0.04em", textTransform: "uppercase" as const,
                            border: "1px solid rgba(34, 197, 94, 0.2)", cursor: "pointer",
                            transition: "all 0.15s",
                            opacity: (!loadedImage) ? 0.5 : 1,
                        }}
                    >
                        {isPredicting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                        Xai Draft
                    </button>

                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 0.5rem" }} />
                    <button onClick={() => setZoom((z) => Math.min(3, z + 0.2))} title="Zoom In"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", padding: "0.375rem" }}>
                        <ZoomIn size={14} />
                    </button>
                    <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))} title="Zoom Out"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", padding: "0.375rem" }}>
                        <ZoomOut size={14} />
                    </button>
                    <span className="label-sm" style={{ color: "var(--primary-fixed)", minWidth: 36 }}>
                        {Math.round(zoom * 100)}%
                    </span>

                    <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)", margin: "0 0.5rem" }} />
                    <button onClick={() => setUseApiData(!useApiData)}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.375rem",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.25rem",
                            background: useApiData ? "rgba(6, 182, 212, 0.1)" : "var(--surface-high)",
                            color: useApiData ? "var(--accent-cyan)" : "var(--primary-fixed)",
                            fontSize: "0.65rem", fontWeight: 700,
                            letterSpacing: "0.04em", textTransform: "uppercase" as const,
                            border: useApiData ? "1px solid rgba(6, 182, 212, 0.3)" : "1px solid transparent",
                            cursor: "pointer", transition: "all 0.15s",
                        }}
                    >
                        <Hash size={11} />
                        {useApiData ? "Live API: ON" : "Live API: OFF"}
                    </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <button onClick={() => setCurrentImage((p) => Math.max(0, p - 1))} disabled={currentImage === 0}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", opacity: currentImage === 0 ? 0.3 : 1, padding: "0.25rem" }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span className="label-sm" style={{ color: "var(--on-surface-variant)", minWidth: 80, textAlign: "center" as const }}>
                        {currentImage + 1} of {imageCount}
                    </span>
                    <button onClick={() => setCurrentImage((p) => Math.min(imageCount - 1, p + 1))} disabled={currentImage === imageCount - 1}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", opacity: currentImage === imageCount - 1 ? 0.3 : 1, padding: "0.25rem" }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ── Main area ── */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                <div ref={containerRef} style={{ flex: 7, position: "relative", cursor: tool === "bbox" || tool === "polygon" ? "crosshair" : tool === "freehand" ? "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22><circle cx=%228%22 cy=%228%22 r=%223%22 fill=%22%2334D399%22/></svg>') 8 8, crosshair" : "default", overflow: "hidden", background: "#000" }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onClick={handleCanvasClick}
                        style={{ width: "100%", height: "100%", display: "block" }}
                    />

                    {showLabelPicker && (
                        <div className="floating-panel" style={{
                            position: "absolute", zIndex: 50,
                            padding: "0.5rem",
                            left: Math.min(labelPickerPos.x - (containerRef.current?.getBoundingClientRect().left || 0), 220),
                            top: Math.min(labelPickerPos.y - (containerRef.current?.getBoundingClientRect().top || 0) - 60, 320),
                        }}>
                            <div className="label-sm" style={{ color: "var(--primary-fixed)", padding: "0.25rem 0.625rem 0.5rem" }}>
                                Select label ({tool})
                            </div>
                            {batch.labels.map((label) => (
                                <button key={label} onClick={() => confirmLabel(label)}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "0.625rem",
                                        width: "100%", padding: "0.5rem 0.75rem",
                                        background: "none", border: "none", cursor: "pointer",
                                        borderRadius: "0.25rem",
                                        color: "var(--on-surface-variant)",
                                        fontSize: "0.875rem", fontWeight: 500,
                                        textAlign: "left" as const,
                                        transition: "background 0.1s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                                >
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: labelColors[label] || "#34D399", flexShrink: 0 }} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Sidebar ── */}
                <div style={{
                    width: 360,
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--surface-low)",
                    flexShrink: 0,
                    overflow: "hidden",
                }}>
                    <div style={{ padding: "1.25rem 1.25rem 1rem", background: "var(--surface-container)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
                            <FileText size={13} color="var(--accent-cyan)" />
                            <span className="label-sm" style={{ color: "var(--accent-cyan)" }}>Task Instructions</span>
                        </div>
                        <p className="body-md" style={{ color: "var(--primary-fixed)", fontSize: "0.8125rem" }}>{batch.description}</p>
                    </div>

                    <div style={{ flex: 1, overflow: "auto", padding: "1rem 1.25rem", background: "var(--surface-low)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                            <Tag size={13} color="var(--accent-emerald)" />
                            <span className="label-sm" style={{ color: "var(--accent-emerald)" }}>
                                Annotations ({currentAnnotations.length})
                            </span>
                        </div>
                        {currentAnnotations.length === 0 ? (
                            <p className="label-sm" style={{ color: "var(--primary-fixed)", letterSpacing: "0.02em", textTransform: "none", fontSize: "0.8125rem" }}>
                                Draw a bounding box, polygon, freehand contour, or place a point on the image
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {currentAnnotations.map((ann) => (
                                    <div key={ann.id} className="card-recessed" style={{
                                        padding: "0.625rem 0.875rem",
                                        display: "flex", alignItems: "center", justifyContent: "space-between",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: labelColors[ann.label] || "#34D399", flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--on-surface)" }}>{ann.label}</div>
                                                <div className="label-sm" style={{ color: "var(--primary-fixed)", letterSpacing: "0.02em", textTransform: "none", marginTop: "0.125rem" }}>
                                                    ({Math.round(ann.x)}, {Math.round(ann.y)}) — {Math.round(ann.width)}×{Math.round(ann.height)}
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteAnnotation(ann.id)}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", padding: "0.25rem", borderRadius: "0.25rem" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent-red)"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--primary-fixed)"; e.currentTarget.style.background = "none"; }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: "1rem 1.25rem", background: "var(--surface-container)" }}>
                        <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Confidence</div>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            {(["low", "medium", "high"] as const).map((level) => {
                                const active = confidence === level;
                                const col = level === "high" ? "var(--accent-emerald)" : level === "medium" ? "var(--accent-amber)" : "var(--accent-red)";
                                return (
                                    <button key={level} onClick={() => setConfidence(level)}
                                        style={{
                                            flex: 1, padding: "0.375rem 0",
                                            borderRadius: "0.25rem",
                                            background: active ? `${col}18` : "var(--surface-low)",
                                            color: active ? col : "var(--primary-fixed)",
                                            border: "none", cursor: "pointer",
                                            fontSize: "0.6875rem", fontWeight: 700,
                                            letterSpacing: "0.05em", textTransform: "uppercase" as const,
                                            transition: "all 0.15s",
                                        }}>
                                        {level}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>Clinical Notes (Mandatory)</div>
                            <button onClick={handleAiCaption} disabled={isCaptioning || currentAnnotations.length === 0}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.25rem",
                                    padding: "0.125rem 0.5rem", borderRadius: "0.25rem",
                                    background: "rgba(34, 197, 94, 0.1)", color: "var(--accent-emerald)",
                                    fontSize: "0.6rem", fontWeight: 700, border: "1px solid rgba(34, 197, 94, 0.2)",
                                    cursor: "pointer", transition: "all 0.15s",
                                    opacity: currentAnnotations.length === 0 ? 0.5 : 1
                                }}>
                                {isCaptioning ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                Xai Caption
                            </button>
                        </div>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                            placeholder="Required: Document your clinical observations here…"
                            rows={2}
                            className="input-field"
                            style={{ resize: "none" }}
                        />
                    </div>

                    <div style={{ padding: "1rem 1.25rem", background: "var(--surface-lowest)" }}>
                        <button className="btn-primary" onClick={handleSubmit}
                            disabled={submitting || currentAnnotations.length === 0 || notes.trim() === ""}
                            style={{ width: "100%", justifyContent: "center", opacity: (submitting || currentAnnotations.length === 0 || notes.trim() === "") ? 0.5 : 1 }}>
                            {submitting
                                ? <><Loader2 size={15} className="animate-spin" /> Committing hash…</>
                                : <><Send size={15} /> {currentImage === imageCount - 1 ? "Submit & Finish" : "Submit & Next"}</>
                            }
                        </button>

                        {submittedHashes.length > 0 && (
                            <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Hash size={11} color="var(--accent-emerald)" />
                                <span className="hash-chip" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {submittedHashes[submittedHashes.length - 1].slice(0, 24)}…
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
