"use client";

import { use, useState } from "react";
import { CheckCircle, ExternalLink, Download, BarChart3, Image as ImageIcon, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { formatUSDCRaw, truncateAddress } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { getImagesForBatchType } from "@/lib/medical-images";
import toast from "react-hot-toast";

const labelColors: Record<string, string> = {
    Pneumonia: "#ef4444", Nodule: "#f59e0b", Normal: "#22c55e",
    Effusion: "#3b82f6", Consolidation: "#8b5cf6", Cardiomegaly: "#ec4899",
    Atelectasis: "#06b6d4", Drusen: "#f59e0b", Fluid: "#3b82f6",
    "Geographic Atrophy": "#8b5cf6", "Benign Nevus": "#22c55e",
    Melanoma: "#ef4444", BCC: "#f59e0b", "Seborrheic Keratosis": "#06b6d4",
};

export default function DatasetDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { state } = useAppStore();
    const [galleryOpen, setGalleryOpen] = useState(false);

    const batch = state.batches.find((b) => b.id === id);
    if (!batch) return <div style={{ color: "var(--on-surface)", padding: "2rem", textAlign: "center" }}>Dataset not found.</div>;

    const progress = batch.totalImages > 0 ? (batch.annotatedImages / batch.totalImages) * 100 : 0;

    // Fallback images based on dataset type
    const images = getImagesForBatchType(batch.imageType);
    const imageCount = Math.min(batch.totalImages, 12);
    const batchAnnotations = state.annotations[batch.id] || [];

    return (
        <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

                <div style={{ marginBottom: "2.5rem" }}>
                    <Link href="/company/dashboard" className="label-sm" style={{ color: "var(--primary-fixed)", textDecoration: "none", marginBottom: "1rem", display: "inline-block" }}>
                        ← Back to Dashboard
                    </Link>
                    <h1 className="headline-lg">{batch.title}</h1>
                    <p className="body-md" style={{ color: "var(--on-surface-variant)", marginTop: "0.5rem", maxWidth: 600 }}>
                        {batch.description}
                    </p>
                </div>

                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>
                            {batch.annotatedImages} / {batch.totalImages} images annotated
                        </span>
                        <span className="label-sm" style={{ color: "var(--accent-emerald)" }}>{Math.round(progress)}%</span>
                    </div>
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    {[
                        { label: "Images", value: batch.totalImages.toString(), icon: ImageIcon },
                        { label: "IAA Score", value: batch.iaaScore > 0 ? batch.iaaScore.toString() : "—", icon: BarChart3 },
                        { label: "Budget", value: formatUSDCRaw(batch.totalBudget), icon: CheckCircle },
                        { label: "Deadline", value: new Date(batch.deadline).toLocaleDateString("en-US"), icon: Clock },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} style={{ background: "var(--surface-low)", borderRadius: "0.5rem", padding: "1.25rem", textAlign: "center" }}>
                                <Icon size={16} color="var(--primary-fixed)" style={{ margin: "0 auto 0.5rem" }} />
                                <div className="title-lg">{s.value}</div>
                                <div className="label-sm" style={{ color: "var(--primary-fixed)", marginTop: "0.25rem" }}>{s.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
                    <h3 className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "1rem" }}>Annotation Configuration</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                        {batch.labels.map((lbl) => (
                            <span key={lbl} style={{
                                background: "var(--surface-high)", color: labelColors[lbl] || "var(--primary-fixed)",
                                padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.02em"
                            }}>
                                {lbl}
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
                    <h3 className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "1rem" }}>On-Chain Info</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {batch.txHash && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>Escrow TX</span>
                                <a href={`https://mumbai.polygonscan.com/tx/${batch.txHash}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--accent-emerald)", textDecoration: "none", fontSize: "0.875rem", fontFamily: "monospace" }}>
                                    {batch.txHash.slice(0, 10)}...{batch.txHash.slice(-6)}
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>Batch ID</span>
                            <span style={{ fontSize: "0.875rem", fontFamily: "monospace", color: "var(--on-surface-variant)" }}>{batch.batchId.slice(0, 18)}...</span>
                        </div>
                    </div>
                </div>

                {/* Ground Truth Gallery Preview Feature */}
                {batchAnnotations.length > 0 && (
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }} onClick={() => setGalleryOpen(!galleryOpen)}>
                            <h3 className="label-md" style={{ color: "var(--primary-fixed)" }}>Review Annotations & Notes</h3>
                            <button className="btn-tertiary" style={{ padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                {galleryOpen ? <><ChevronUp size={14} /> Hide Gallery</> : <><ChevronDown size={14} /> View Gallery ({batchAnnotations.length})</>}
                            </button>
                        </div>

                        {galleryOpen && (
                            <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                {batchAnnotations.map((ann, idx) => {
                                    // Make sure index is within our mock images
                                    const imgSrc = images[ann.imageIndex % images.length];
                                    const cHex = labelColors[ann.label] || "#22c55e";
                                    return (
                                        <div key={ann.id || idx} style={{ background: "var(--surface-highest)", borderRadius: "0.5rem", overflow: "hidden" }}>
                                            <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: "#000" }}>
                                                {/* Render the background medical image */}
                                                <img src={imgSrc} alt={`img-${ann.imageIndex}`} style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.8 }} />

                                                {/* Overlay the bounding box! Note that Konva coords are absolute based on canvas, we'll scale it to %, rough approximation for demo */}
                                                {(ann.x !== undefined && ann.width !== undefined) && (
                                                    <div style={{
                                                        position: "absolute",
                                                        left: `${Math.max(0, (ann.x / 400) * 100)}%`,
                                                        top: `${Math.max(0, (ann.y / 400) * 100)}%`, // 400 was our fixed workspace canvas height
                                                        width: `${Math.min(100, (ann.width / 400) * 100)}%`,
                                                        height: `${Math.min(100, (ann.height / 400) * 100)}%`,
                                                        border: `2px solid ${cHex}`,
                                                        background: `${cHex}22`,
                                                        pointerEvents: "none"
                                                    }}>
                                                        <span style={{ position: "absolute", top: -20, left: -2, background: cHex, color: "#000", fontSize: "0.65rem", padding: "0.1rem 0.4rem", fontWeight: 700 }}>
                                                            {ann.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: "1rem" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                                    <span className="label-sm" style={{ color: "var(--on-surface)" }}>Image #{ann.imageIndex + 1}</span>
                                                    <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "1rem", background: "var(--surface-low)", color: "var(--primary-fixed)" }}>{ann.confidence} conf</span>
                                                </div>
                                                {ann.notes && (
                                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", background: "rgba(255,255,255,0.02)", padding: "0.6rem", borderRadius: "0.375rem" }}>
                                                        <FileText size={12} color="var(--primary-fixed)" style={{ flexShrink: 0, marginTop: 2 }} />
                                                        <p style={{ fontSize: "0.8rem", color: "var(--on-surface-variant)", lineHeight: 1.4, margin: 0 }}>
                                                            {ann.notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {progress === 100 && (
                    <button className="btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem", padding: "1rem" }} onClick={() => toast.success("Dataset Exported to COCO JSON format!")}>
                        <Download size={16} /> Download Annotated Dataset (JSON + Images)
                    </button>
                )}

                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                    <Link href={`/audit/${batch.id}`} style={{ fontSize: "0.875rem", color: "var(--primary-fixed)", textDecoration: "none" }}>
                        View Compliance Audit Report →
                    </Link>
                </div>

            </div>
        </div>
    );
}
