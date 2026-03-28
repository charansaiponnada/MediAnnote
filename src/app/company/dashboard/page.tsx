"use client";

import { useState, useEffect } from "react";
import { useAppStore, type MLModel } from "@/lib/store";
import { formatUSDCRaw } from "@/lib/utils";
import Link from "next/link";
import {
    ExternalLink, Brain, Loader2, CheckCircle, Zap,
    BarChart3, Cpu, Play, Settings,
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

        const modelId = `model-${Date.now()}`;
        const model: MLModel = {
            id: modelId,
            name: `${batch.title} — Classifier`,
            batchId,
            status: "queued",
            totalEpochs: 50,
            createdAt: new Date().toISOString(),
            architecture: "ResNet-50 (Transfer Learning)",
        };
        dispatch({ type: "START_TRAINING", model });

        // Simulate training progress
        await new Promise((r) => setTimeout(r, 1000));
        dispatch({ type: "UPDATE_MODEL", modelId, updates: { status: "training", epoch: 0 } });

        for (let epoch = 1; epoch <= 50; epoch++) {
            await new Promise((r) => setTimeout(r, 120));
            const acc = Math.min(0.98, 0.4 + (epoch / 50) * 0.55 + Math.random() * 0.03);
            dispatch({ type: "UPDATE_MODEL", modelId, updates: { epoch, accuracy: parseFloat(acc.toFixed(4)) } });
        }

        dispatch({ type: "UPDATE_MODEL", modelId, updates: { status: "completed" } });
        setTrainingBatch(null);
        toast.success(`Model training complete! Accuracy: ${(state.models.find(m => m.id === modelId)?.accuracy || 0.95 * 100).toFixed(1)}%`);
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
                                                <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} onClick={async () => {
                                                    toast.loading(`Deploying ${model.name}…`, { id: "deploy" });
                                                    await new Promise(r => setTimeout(r, 2000));
                                                    toast.success(`Endpoint Live: \napi.mediannote.io/v1/infer`, { id: "deploy" });
                                                }}>
                                                    <Zap size={14} /> Deploy API
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

            {/* Metrics Modal */}
            {metricsModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "var(--surface)", border: "1px solid var(--surface-high)", padding: "2rem", borderRadius: "1rem", width: "90%", maxWidth: 600 }}>
                        <h2 className="headline-md" style={{ marginBottom: "1rem" }}>{metricsModalOpen} - Evaluation Report</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{ background: "var(--surface-low)", padding: "1rem", borderRadius: "0.5rem" }}>
                                <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>F1-Score</div>
                                <div className="title-lg">0.942</div>
                            </div>
                            <div style={{ background: "var(--surface-low)", padding: "1rem", borderRadius: "0.5rem" }}>
                                <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>Precision / Recall</div>
                                <div className="title-lg">0.95 / 0.93</div>
                            </div>
                        </div>
                        <div style={{ background: "black", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem", fontFamily: "monospace", color: "var(--accent-emerald)", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                            {`Confusion Matrix
=================
     P   N
P  | 98  2 |
N  | 3   97|`}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <button className="btn-secondary" onClick={() => setMetricsModalOpen(null)}>Close Registry</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
