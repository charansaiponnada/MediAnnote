"use client";

import { useState, useEffect } from "react";
import { useAppStore, type MLModel } from "@/lib/store";
import { formatUSDCRaw } from "@/lib/utils";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
    ExternalLink, Brain, Loader2, CheckCircle, Zap,
    BarChart3, Cpu, Play, Settings, FileText, Download, Database, ChevronRight, X
} from "lucide-react";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useWriteContract, useAccount } from "wagmi";
import { pad, stringToHex, isHex } from "viem";
import { CONTRACTS } from "@/lib/contracts";

export default function CompanyDashboard() {
    const { state, dispatch } = useAppStore();
    const { isConnected } = useAccount();
    const company = state.companies[0];
    const batches = state.batches.filter((b) => b.companyId === company.id);
    const [released, setReleased] = useState<string[]>([]);
    const [trainingBatch, setTrainingBatch] = useState<string | null>(null);
    const [metricsModalOpen, setMetricsModalOpen] = useState<string | null>(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

    const [isHFTerminalOpen, setIsHFTerminalOpen] = useState(false);
    const [hfLogs, setHfLogs] = useState<{ text: string, type: 'input' | 'system' }[]>([
        { text: "medi-annote-hf-uploader-v1 init...", type: 'system' },
        { text: "Enter Hugging Face Username:", type: 'system' }
    ]);
    const [hfInput, setHfInput] = useState("");
    const [hfStep, setHfStep] = useState<0 | 1 | 2>(0); // 0: username, 1: token, 2: uploading
    const [hfModel, setHfModel] = useState<MLModel | null>(null);

    const [downloadModalOpen, setDownloadModalOpen] = useState<string | null>(null);

    const totalAnnotated = batches.reduce((a, b) => a + b.annotatedImages, 0);
    const totalImages = batches.reduce((a, b) => a + b.totalImages, 0);
    const completion = totalImages > 0 ? Math.round((totalAnnotated / totalImages) * 100) : 0;
    const { writeContractAsync } = useWriteContract();

    const handleRelease = async (id: string) => {
        const batch = batches.find((b) => b.id === id);
        if (!batch) return;

        if (!isConnected) {
            toast.loading("DEMO MODE: Simulating payment release on Polygon...", { id: "releaseTx" });
            await new Promise((r) => setTimeout(r, 2000));
            toast.dismiss("releaseTx");
        } else {
            try {
                toast.loading("Releasing payment… Please confirm in MetaMask.", { id: "releaseTx" });

                const rawId = batch.batchId || id;
                const bytes32BatchId = isHex(rawId) ? pad(rawId as `0x${string}`, { size: 32 }) : pad(stringToHex(rawId), { size: 32 });
                const annotatorWallets = batch.assignedDoctors.map(docId => {
                    const doc = state.doctors.find(d => d.id === docId);
                    return doc ? doc.wallet : null;
                }).filter(Boolean) as `0x${string}`[];

                if (annotatorWallets.length === 0) {
                    toast.dismiss("releaseTx");
                    toast.error("No valid annotator wallets found.");
                    return;
                }

                await writeContractAsync({
                    ...CONTRACTS.AnnotationEscrow,
                    functionName: "releasePayment",
                    args: [bytes32BatchId, annotatorWallets],
                });
                await new Promise((r) => setTimeout(r, 2000));
                toast.dismiss("releaseTx");
            } catch (error) {
                console.error(error);
                toast.error("Transaction failed or was rejected by user.", { id: "releaseTx" });
                return;
            }
        }

        dispatch({ type: "RELEASE_PAYMENT", batchId: id });
        setReleased((p) => [...p, id]);
        confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#FFFFFF", "#D4D4D4", "#34D399", "#22D3EE"] });
        toast.success("Payment released. Funds distributed to annotators on-chain.");
    };

    const handleStartTraining = async (batchId: string) => {
        const batch = batches.find((b) => b.id === batchId);
        if (!batch) return;
        setTrainingBatch(batchId);
        setTerminalLogs([]);
        setIsTerminalOpen(true);

        const epochsCalculated = batch.totalImages > 0 ? Math.min(100, Math.max(10, batch.totalImages * 2)) : 50;

        const modelId = `model-${Date.now()}`;
        const model: MLModel = {
            id: modelId,
            name: `${batch.title} — Classifier`,
            batchId,
            status: "queued",
            totalEpochs: epochsCalculated,
            createdAt: new Date().toISOString(),
            architecture: "ResNet-50 (Transfer Learning)",
        };
        dispatch({ type: "START_TRAINING", model });

        try {
            const res = await fetch("http://localhost:8000/train", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ batchId, totalEpochs: epochsCalculated, dataSize: batch.totalImages })
            });

            if (!res.body) throw new Error("No response body");
            dispatch({ type: "UPDATE_MODEL", modelId, updates: { status: "training", epoch: 0 } });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split(/\r?\n\r?\n/);
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6);
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.type === "log") {
                                setTerminalLogs(prev => [...prev, parsed.message]);
                                const epochMatch = parsed.message.match(/Epoch (\d+)\/(\d+)/);
                                if (epochMatch) {
                                    dispatch({ type: "UPDATE_MODEL", modelId, updates: { epoch: parseInt(epochMatch[1]) } });
                                }
                            } else if (parsed.type === "complete") {
                                dispatch({
                                    type: "UPDATE_MODEL", modelId, updates: {
                                        status: "completed",
                                        accuracy: parsed.accuracy / 100,
                                        epoch: epochsCalculated,
                                        metrics: parsed
                                    }
                                });
                            }
                        } catch (e) {
                            // parse error, ignore incomplete chunk
                        }
                    }
                }
            }

            setTrainingBatch(null);
            setTimeout(() => setIsTerminalOpen(false), 2000);
            toast.success(`Model training complete!`);

        } catch (error) {
            console.error("Training failed:", error);
            toast.error("Failed to connect to Python ML Service. Did you run the python server?");
            dispatch({ type: "UPDATE_MODEL", modelId, updates: { status: "failed" } });
            setTrainingBatch(null);
            setIsTerminalOpen(false);
        }
    };

    const handleHFSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hfInput.trim() || hfStep === 2) return;

        if (hfStep === 0) {
            setHfLogs(p => [...p, { text: hfInput, type: 'input' }, { text: "HF_TOKEN required for write access:", type: 'system' }]);
            setHfStep(1);
            setHfInput("");
        } else if (hfStep === 1) {
            setHfLogs(p => [...p, { text: "*".repeat(hfInput.length), type: 'input' }, { text: "[INFO] Authenticating...", type: 'system' }]);
            setHfStep(2);
            setHfInput("");

            // Start push simulation
            setTimeout(() => {
                setHfLogs(p => [...p, { text: "[INFO] Authentication Success.", type: 'system' }, { text: `[INFO] Creating repository: ${hfModel?.name.toLowerCase().replace(/\s+/g, '-')}`, type: 'system' }]);

                setTimeout(() => {
                    setHfLogs(p => [...p, { text: "[UPLOAD] lfs-objects (421MB) [■■■■■■■■■■■■] 100%", type: 'system' }, { text: "✓ Successfully pushed to HF Hub!", type: 'system' }]);
                    toast.success("Model Published to 🤗 Hub!", { style: { border: "1px solid #FFD21E", color: "#fff", background: "#111" } });
                    setTimeout(() => setIsHFTerminalOpen(false), 2000);
                }, 1500);
            }, 1000);
        }
    };

    const handleDownload = (batchId: string, format: string) => {
        const batch = batches.find(b => b.id === batchId);
        if (!batch) return;

        toast.loading(`Preparing ${format} export...`, { id: "export" });

        // Simulate file content generation
        let content = "";
        let extension = "json";

        if (format.includes("COCO")) {
            content = JSON.stringify({
                info: { description: batch.title, year: 2026 },
                images: Array(batch.totalImages).fill(0).map((_, i) => ({ id: i, file_name: `im_${i}.dcm` })),
                annotations: Array(batch.annotatedImages).fill(0).map((_, i) => ({ id: i, image_id: i, category_id: 1, bbox: [100, 200, 50, 50] }))
            }, null, 2);
            extension = "json";
        } else if (format.includes("CSV")) {
            content = "image_id,label,confidence,doctor_hash\n" +
                Array(batch.annotatedImages).fill(0).map((_, i) => `img_${i},abnormality_detected,0.92,0x...`).join("\n");
            extension = "csv";
        } else {
            content = `<?xml version="1.0"?>\n<annotation>\n  <folder>${batch.title}</folder>\n  <filename>sample.dcm</filename>\n</annotation>`;
            extension = "xml";
        }

        setTimeout(() => {
            const blob = new Blob([content], { type: "text/plain" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `MediAnnote_${batch.title.replace(/\s+/g, "_")}.${extension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`${format} downloaded successfully!`, { id: "export" });
            setDownloadModalOpen(null);
        }, 1500);
    };

    return (
        <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem" }}>
                    <div>
                        <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Company Portal</div>
                        <h1 className="headline-lg">{company.name}</h1>
                    </div>
                    <Link href="/company/upload" className="btn-primary" style={{ textDecoration: "none" }}>
                        + New Dataset
                    </Link>
                </div>

                {/* Stats strip */}
                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
                    {[
                        { l: "Active Jobs", v: batches.filter((b) => b.status !== "completed" && b.status !== "paid").length },
                        { l: "Completion Rate", v: `${completion}%` },
                        { l: "Total Spent", v: formatUSDCRaw(company.totalSpent) },
                        { l: "Models Trained", v: state.models.filter(m => m.status === "completed").length },
                    ].map((s, i) => (
                        <div key={s.l} style={{
                            padding: "1.5rem 1.25rem",
                            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}>
                            <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>{s.l}</div>
                            <div className="display-md" style={{ fontSize: "2rem" }}>{s.v}</div>
                        </div>
                    ))}
                </div>

                {/* Datasets */}
                <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "1rem" }}>Your Datasets</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
                    {batches.map((batch) => {
                        const pct = batch.totalImages > 0 ? Math.round((batch.annotatedImages / batch.totalImages) * 100) : 0;
                        const isPaid = batch.status === "paid" || released.includes(batch.id);
                        const escrow = state.escrowBalances[batch.id] || 0;
                        const canTrain = pct >= 30 && batch.annotatedImages > 0;
                        const modelForBatch = state.models.find(m => m.batchId === batch.id);

                        return (
                            <div key={batch.id} style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                                            <h3 className="title-lg">{batch.title}</h3>
                                            {isPaid
                                                ? <span className="label-sm" style={{ color: "var(--accent-emerald)", background: "var(--accent-emerald-dim)", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>Paid ✓</span>
                                                : <span className="label-sm" style={{ color: "var(--primary-fixed)", background: "var(--surface-high)", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>{batch.status.replace("_", " ")}</span>
                                            }
                                        </div>

                                        <div style={{ display: "flex", gap: "2.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                                            {[
                                                { l: "Annotated", v: `${batch.annotatedImages}/${batch.totalImages}` },
                                                { l: "IAA Score", v: batch.iaaScore > 0 ? String(batch.iaaScore) : "—" },
                                                { l: "Budget", v: formatUSDCRaw(batch.totalBudget) },
                                                { l: "Escrow", v: escrow > 0 ? `$${escrow.toFixed(2)} locked` : "Released" },
                                                { l: "Doctors", v: `${batch.assignedDoctors.length} assigned` },
                                            ].map(({ l, v }) => (
                                                <div key={l}>
                                                    <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.2rem" }}>{l}</div>
                                                    <div className="body-md" style={{ color: "var(--on-surface)" }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div className="progress-track" style={{ flex: 1, height: 4 }}>
                                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="label-sm" style={{ color: "var(--primary-fixed)", flexShrink: 0 }}>{pct}%</span>
                                        </div>

                                        {batch.txHash && (
                                            <div style={{ marginTop: "0.75rem" }}>
                                                <a href={`https://mumbai.polygonscan.com/tx/${batch.txHash}`} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", textDecoration: "none" }}>
                                                    <span className="hash-chip">{batch.txHash.slice(0, 10)}…{batch.txHash.slice(-6)}</span>
                                                    <ExternalLink size={11} color="var(--primary-fixed)" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTAs */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", flexShrink: 0, minWidth: 160 }}>
                                        <Link href={`/company/dataset/${batch.id}`} className="btn-secondary" style={{ textDecoration: "none", textAlign: "center" }}>
                                            Details
                                        </Link>
                                        <button className="btn-secondary"
                                            onClick={() => setDownloadModalOpen(batch.id)}
                                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                                            <Download size={14} /> Download Dataset
                                        </button>
                                        {pct >= 50 && !isPaid && escrow > 0 && (
                                            <button className="btn-primary" onClick={() => handleRelease(batch.id)}>
                                                Release Payment
                                            </button>
                                        )}
                                        {canTrain && !modelForBatch && (
                                            <button className="btn-secondary" onClick={() => handleStartTraining(batch.id)}
                                                disabled={!!trainingBatch}
                                                style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", opacity: trainingBatch ? 0.5 : 1 }}>
                                                <Brain size={14} /> Train Model
                                            </button>
                                        )}
                                        {modelForBatch && (
                                            <div style={{
                                                padding: "0.5rem 0.75rem",
                                                background: modelForBatch.status === "completed" ? "var(--accent-emerald-dim)" : "var(--accent-cyan-dim)",
                                                borderRadius: "0.375rem",
                                                textAlign: "center",
                                            }}>
                                                <span className="label-sm" style={{
                                                    color: modelForBatch.status === "completed" ? "var(--accent-emerald)" : "var(--accent-cyan)",
                                                }}>
                                                    {modelForBatch.status === "training" ? `Training… ${modelForBatch.epoch}/${modelForBatch.totalEpochs}` :
                                                        modelForBatch.status === "completed" ? `✓ ${(modelForBatch.accuracy! * 100).toFixed(1)}% acc` :
                                                            "Queued"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {batches.length === 0 && (
                        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                            <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "1rem" }}>No datasets yet.</p>
                            <Link href="/company/upload" className="btn-primary" style={{ textDecoration: "none" }}>Upload Your First Dataset</Link>
                        </div>
                    )}
                </div>

                {/* ML Models Section */}
                {state.models.length > 0 && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                            <Brain size={16} color="var(--accent-cyan)" />
                            <span className="label-md" style={{ color: "var(--accent-cyan)" }}>Trained Models</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {state.models.map((model) => (
                                <div key={model.id} style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem 2rem" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem" }}>
                                                <Cpu size={16} color="var(--accent-cyan)" />
                                                <h3 className="title-lg" style={{ fontSize: "1.125rem" }}>{model.name}</h3>
                                                {model.status === "completed" && <CheckCircle size={16} color="var(--accent-emerald)" />}
                                                {model.status === "training" && <Loader2 size={16} color="var(--accent-cyan)" className="animate-spin" />}
                                            </div>

                                            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                                {[
                                                    { l: "Architecture", v: model.architecture },
                                                    { l: "Status", v: model.status.charAt(0).toUpperCase() + model.status.slice(1) },
                                                    { l: "Accuracy", v: model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : "—" },
                                                    { l: "Epochs", v: `${model.epoch || 0}/${model.totalEpochs}` },
                                                ].map(({ l, v }) => (
                                                    <div key={l}>
                                                        <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.2rem" }}>{l}</div>
                                                        <div className="body-md" style={{ color: "var(--on-surface)" }}>{v}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {model.status === "training" && (
                                                <div style={{ marginTop: "1rem" }}>
                                                    <div className="progress-track" style={{ height: 4 }}>
                                                        <div className="progress-fill" style={{ width: `${((model.epoch || 0) / model.totalEpochs) * 100}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {model.status === "completed" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flexShrink: 0 }}>
                                                <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={() => setMetricsModalOpen(model.name)}>
                                                    <BarChart3 size={14} /> View Metrics
                                                </button>
                                                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(90deg, #FFD21E, #F97316)", color: "#000", border: "none" }} onClick={() => {
                                                    setHfModel(model);
                                                    setHfLogs([
                                                        { text: "medi-annote-hf-uploader-v1 init...", type: 'system' },
                                                        { text: "Enter Hugging Face Username:", type: 'system' }
                                                    ]);
                                                    setHfStep(0);
                                                    setHfInput("");
                                                    setIsHFTerminalOpen(true);
                                                }}>
                                                    <span style={{ fontSize: "1.1rem" }}>🤗</span> Push to HF Hub
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Terminal Modal */}
            {isTerminalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "#000", border: "1px solid var(--surface-high)", borderRadius: "0.5rem", width: "90%", maxWidth: 800, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
                        <div style={{ background: "#111", padding: "0.75rem 1rem", borderBottom: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Cpu size={14} color="var(--primary-fixed)" />
                                <span className="label-sm" style={{ color: "var(--primary-fixed)", fontFamily: "monospace" }}>medi-annote-ml-worker-01</span>
                            </div>
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F56" }}></div>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }}></div>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27C93F" }}></div>
                            </div>
                        </div>
                        <div style={{ padding: "1.5rem", height: 400, overflowY: "auto", fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace", fontSize: "0.85rem", color: "#A3A3A3", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                            {terminalLogs.length === 0 && <span className="animate-pulse">Connecting to Xai ML Service...</span>}
                            {terminalLogs.map((log, i) => (
                                <div key={i} style={{ color: log.includes("Epoch") ? "var(--on-surface)" : (log.includes("[INFO]") ? "var(--accent-cyan)" : "#A3A3A3") }}>
                                    <span style={{ color: "#555" }}>{new Date().toISOString().split("T")[1].slice(0, 12)}</span> &nbsp; {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* HuggingFace Terminal Modal */}
            {isHFTerminalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
                    <div style={{ background: "#050505", border: "1px solid #FFD21E33", borderRadius: "0.5rem", width: "90%", maxWidth: 650, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
                        <div style={{ background: "#FFD21E11", padding: "0.75rem 1rem", borderBottom: "1px solid #FFD21E22", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span style={{ fontSize: "1rem" }}>🤗</span>
                                <span className="label-sm" style={{ color: "#FFD21E", fontFamily: "monospace" }}>hugging-face-hub --cli-push</span>
                            </div>
                            <button onClick={() => setIsHFTerminalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff5f56' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: "1.5rem", height: 320, overflowY: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#ddd", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            {hfLogs.map((log, i) => (
                                <div key={i} style={{
                                    paddingLeft: log.type === 'input' ? "1rem" : 0,
                                    color: log.type === 'input' ? "white" : (log.text.startsWith("✓") ? "var(--accent-emerald)" : "#bbb"),
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    {log.type === 'input' && <span style={{ color: 'var(--accent-cyan)' }}>—›</span>}
                                    {log.text}
                                </div>
                            ))}
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ color: "var(--accent-cyan)" }}>❯</span>
                                <form onSubmit={handleHFSubmit} style={{ flex: 1 }}>
                                    <input
                                        autoFocus
                                        type={hfStep === 1 ? "password" : "text"}
                                        value={hfInput}
                                        onChange={(e) => setHfInput(e.target.value)}
                                        disabled={hfStep === 2}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "white",
                                            width: "100%",
                                            outline: "none",
                                            fontFamily: "inherit",
                                            fontSize: "inherit"
                                        }}
                                    />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Download Formats Modal */}
            {downloadModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 105, backdropFilter: "blur(4px)" }}>
                    <div className="card" style={{ padding: "2.5rem", width: "95%", maxWidth: 500, textAlign: "center", animation: "modalIn 0.3s ease-out" }}>
                        <div style={{ marginBottom: "1.5rem", display: "inline-flex", background: "var(--accent-cyan-dim)", padding: "1rem", borderRadius: "50%", color: "var(--accent-cyan)" }}>
                            <Database size={32} />
                        </div>
                        <h2 className="headline-sm" style={{ marginBottom: "0.5rem" }}>Export Dataset</h2>
                        <p className="body-md" style={{ color: "var(--on-surface-variant)", marginBottom: "2rem" }}>
                            Select your preferred annotation format for the validated expert data.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                            {[
                                { n: "COCO JSON", d: "Standard format for computer vision tasks" },
                                { n: "Pascal VOC (XML)", d: "Bbox coordinates in per-image XML structure" },
                                { n: "Pandas CSV", d: "Flat table of image IDs and clinical captions" },
                                { n: "DICOM-SR", d: "Structured Report for medical compatibility" },
                            ].map(f => (
                                <button key={f.n} className="btn-secondary" style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    padding: "1rem 1.5rem",
                                    gap: "0.25rem"
                                }} onClick={() => handleDownload(downloadModalOpen!, f.n)}>
                                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                        <span className="title-md" style={{ fontSize: "1rem" }}>{f.n}</span>
                                        <ChevronRight size={14} color="var(--primary-fixed)" />
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: "var(--primary-fixed)" }}>{f.d}</span>
                                </button>
                            ))}
                        </div>

                        <button className="btn-secondary" style={{ marginTop: "1.5rem", width: "100%" }} onClick={() => setDownloadModalOpen(null)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Metrics Modal */}
            {metricsModalOpen && (() => {
                const modelName = metricsModalOpen;
                const modelData = state.models.find((m) => m.name === modelName);
                const metrics = modelData?.metrics;

                return (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                        <div style={{ background: "var(--surface)", border: "1px solid var(--surface-high)", padding: "2.5rem", borderRadius: "1rem", width: "95%", maxWidth: 900, maxHeight: "90vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                                <div>
                                    <h2 className="headline-md" style={{ marginBottom: "0.25rem" }}>Model Evaluation Report</h2>
                                    <p className="body-md" style={{ color: "var(--on-surface-variant)" }}>{modelName}</p>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} onClick={async () => {
                                        const el = document.getElementById("pdf-report-container");
                                        if (!el) return;
                                        toast.loading("Generating professional PDF report...", { id: "pdf" });
                                        try {
                                            const html2canvas = (await import("html2canvas")).default;
                                            const { jsPDF } = await import("jspdf");
                                            const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#0a0a0a" });
                                            const imgData = canvas.toDataURL("image/png");
                                            const pdf = new jsPDF("l", "mm", "a4");
                                            const pdfWidth = pdf.internal.pageSize.getWidth();
                                            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                                            pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
                                            pdf.save(`MediAnnote_Report_${modelName}.pdf`);
                                            toast.success("PDF Downloaded!", { id: "pdf" });
                                        } catch (err) {
                                            console.error(err);
                                            toast.error("Failed to generate PDF", { id: "pdf" });
                                        }
                                    }}>
                                        <FileText size={16} /> Download PDF
                                    </button>
                                    <button className="btn-secondary" onClick={() => setMetricsModalOpen(null)}>Close</button>
                                </div>
                            </div>

                            {metrics ? (
                                <div id="pdf-report-container" style={{ padding: "1rem", background: "var(--surface)", margin: "-1rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                                        {[
                                            { l: "Global Accuracy", v: `${metrics.accuracy}%` },
                                            { l: "F1-Score", v: metrics.f1_score },
                                            { l: "Precision", v: metrics.precision },
                                            { l: "Recall", v: metrics.recall },
                                        ].map(s => (
                                            <div key={s.l} style={{ background: "var(--surface-low)", padding: "1.25rem", borderRadius: "0.75rem" }}>
                                                <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.25rem" }}>{s.l}</div>
                                                <div className="title-lg">{s.v}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>

                                        <div style={{ background: "var(--surface-low)", padding: "1.5rem", borderRadius: "0.75rem" }}>
                                            <h3 className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "1.5rem" }}>Training vs Validation Loss</h3>
                                            <div style={{ height: 250, width: "100%" }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={metrics.chart_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                        <XAxis dataKey="epoch" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                                        <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
                                                        <Tooltip
                                                            contentStyle={{ backgroundColor: 'var(--surface-high)', border: '1px solid var(--surface-highest)', borderRadius: '8px' }}
                                                            itemStyle={{ fontSize: 13, color: 'var(--on-surface)' }}
                                                        />
                                                        <Line type="monotone" dataKey="train_loss" name="Train Loss" stroke="var(--primary-fixed)" strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="val_loss" name="Val Loss" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        <div style={{ background: "var(--surface-low)", padding: "1.5rem", borderRadius: "0.75rem", display: "flex", flexDirection: "column" }}>
                                            <h3 className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "1.5rem" }}>Confusion Matrix (Holdout)</h3>
                                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "4px", width: "100%" }}>
                                                    {/* Header */}
                                                    <div></div>
                                                    <div className="label-sm" style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>Pred Pos</div>
                                                    <div className="label-sm" style={{ textAlign: "center", color: "var(--on-surface-variant)" }}>Pred Neg</div>

                                                    {/* True Pos Row */}
                                                    <div className="label-sm" style={{ alignSelf: "center", color: "var(--on-surface-variant)" }}>Actual Pos</div>
                                                    <div style={{ background: "var(--accent-emerald-dim)", color: "var(--accent-emerald)", padding: "1rem", textAlign: "center", borderRadius: "4px", fontWeight: "bold" }}>
                                                        {metrics.confusion_matrix[0][0]}
                                                    </div>
                                                    <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", textAlign: "center", borderRadius: "4px" }}>
                                                        {metrics.confusion_matrix[0][1]}
                                                    </div>

                                                    {/* True Neg Row */}
                                                    <div className="label-sm" style={{ alignSelf: "center", color: "var(--on-surface-variant)" }}>Actual Neg</div>
                                                    <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "1rem", textAlign: "center", borderRadius: "4px" }}>
                                                        {metrics.confusion_matrix[1][0]}
                                                    </div>
                                                    <div style={{ background: "var(--surface-high)", color: "var(--on-surface)", padding: "1rem", textAlign: "center", borderRadius: "4px", fontWeight: "bold" }}>
                                                        {metrics.confusion_matrix[1][1]}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: "4rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
                                    <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem" }} />
                                    <p>Loading advanced metrics from registry...</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
