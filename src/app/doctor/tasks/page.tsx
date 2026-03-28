"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatUSDCRaw } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function DoctorTasks() {
    const { state, dispatch } = useAppStore();
    const doctor = state.doctors[0]; // current doctor

    const handleAccept = (batchId: string) => {
        dispatch({ type: "ACCEPT_BATCH", batchId, doctorId: doctor.id });
        toast.success("Batch accepted! Escrow verified on-chain ✓");
    };

    return (
        <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

                <div style={{ marginBottom: "2.5rem" }}>
                    <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Task Queue</div>
                    <h1 className="headline-lg">Available Batches</h1>
                    <p className="body-md" style={{ color: "var(--primary-fixed)", marginTop: "0.5rem" }}>
                        {state.batches.length} total batches · Matched to your specialty and reputation tier
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {state.batches.map((batch) => {
                        const isAccepted = batch.assignedDoctors.includes(doctor.id);
                        const isCompleted = batch.status === "completed" || batch.status === "paid";
                        const pct = batch.totalImages > 0 ? Math.round((batch.annotatedImages / batch.totalImages) * 100) : 0;

                        return (
                            <div key={batch.id} style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "2rem" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: "2rem", marginBottom: "1.5rem" }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.625rem", flexWrap: "wrap" }}>
                                            <h2 className="title-lg">{batch.title}</h2>
                                            {isCompleted && (
                                                <span className="label-sm" style={{ color: "var(--accent-emerald)", background: "var(--accent-emerald-dim)", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
                                                    {batch.status === "paid" ? "Paid" : "Completed"}
                                                </span>
                                            )}
                                            {isAccepted && !isCompleted && (
                                                <span className="label-sm" style={{ color: "var(--accent-cyan)", background: "var(--accent-cyan-dim)", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
                                                    Accepted
                                                </span>
                                            )}
                                            {!isAccepted && !isCompleted && (
                                                <span className="label-sm" style={{ color: "var(--accent-amber)", background: "rgba(252,211,77,0.1)", padding: "0.2rem 0.625rem", borderRadius: "9999px" }}>
                                                    Open
                                                </span>
                                            )}
                                        </div>

                                        <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "1.25rem", maxWidth: 560 }}>{batch.description}</p>

                                        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                                            {[
                                                { l: "Type", v: batch.imageType },
                                                { l: "Images", v: String(batch.totalImages) },
                                                { l: "Rate", v: `${formatUSDCRaw(batch.rewardPerImage)} / image` },
                                                { l: "Deadline", v: batch.deadline },
                                                { l: "Client", v: batch.companyName },
                                            ].map(({ l, v }) => (
                                                <div key={l}>
                                                    <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.25rem" }}>{l}</div>
                                                    <div className="body-md" style={{ color: "var(--on-surface)" }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                                            {batch.labels.map((label) => (
                                                <span key={label} className="hash-chip">{label}</span>
                                            ))}
                                        </div>

                                        {isAccepted && batch.txHash && (
                                            <div style={{
                                                marginTop: "1rem",
                                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                                background: "var(--accent-emerald-dim)",
                                                padding: "0.375rem 0.875rem", borderRadius: "9999px",
                                            }}>
                                                <Check size={12} color="var(--accent-emerald)" />
                                                <span className="label-sm" style={{ color: "var(--accent-emerald)" }}>
                                                    Escrow Verified · {batch.txHash.slice(0, 10)}…{batch.txHash.slice(-6)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.875rem", flexShrink: 0 }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div className="display-md" style={{ fontSize: "1.75rem" }}>{formatUSDCRaw(batch.totalBudget)}</div>
                                            <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>
                                                Total Budget {state.escrowBalances[batch.id] ? `· $${state.escrowBalances[batch.id].toFixed(2)} locked` : ""}
                                            </div>
                                        </div>

                                        {isAccepted && !isCompleted ? (
                                            <Link href={`/doctor/annotate/${batch.id}`} className="btn-primary" style={{ textDecoration: "none" }}>
                                                Annotate <ArrowRight size={14} />
                                            </Link>
                                        ) : isCompleted ? (
                                            <span className="btn-secondary" style={{ opacity: 0.5, cursor: "default" }}>{batch.status === "paid" ? "Paid ✓" : "Done"}</span>
                                        ) : (
                                            <button className="btn-secondary" onClick={() => handleAccept(batch.id)}>
                                                Accept Batch
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div className="progress-track" style={{ flex: 1 }}>
                                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="label-sm" style={{ color: "var(--primary-fixed)", flexShrink: 0 }}>
                                        {batch.annotatedImages} / {batch.totalImages}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
