"use client";

import { useAppStore } from "@/lib/store";
import { formatUSDCRaw } from "@/lib/utils";
import Link from "next/link";
import {
    Activity, Star, Wallet, ListTodo, ShieldCheck,
    UploadCloud, Edit3, CheckCircle, Clock, ChevronRight, Award, DollarSign, ArrowRight,
    Shield, UserCheck, Flame, Loader2
} from "lucide-react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import toast from "react-hot-toast";
import { isHex, pad, stringToHex } from "viem";

import { useState } from "react";

const tierClass: Record<number, string> = { 0: "tier-bronze", 1: "tier-silver", 2: "tier-gold", 3: "tier-platinum" };
const tierLabel: Record<number, string> = { 0: "Bronze", 1: "Silver", 2: "Gold", 3: "Platinum" };

const feedColor: Record<string, string> = {
    payment: "var(--accent-emerald)",
    annotation: "var(--accent-cyan)",
    reputation: "var(--accent-amber)",
    sbt: "var(--accent-purple)",
    batch: "var(--primary-fixed)",
    deposit: "var(--accent-emerald)",
    model: "var(--accent-cyan)",
};

export default function DoctorDashboard() {
    const { state, dispatch } = useAppStore();
    const { isConnected, address } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isMinting, setIsMinting] = useState(false);

    // In a real app, we would find the doctor by wallet. For demo, we use doc-1 (Ananya) 
    // unless the connected wallet matches one of the mock doctors.
    const doctor = state.doctors.find(d => d.wallet.toLowerCase() === address?.toLowerCase()) || state.doctors[0];

    const active = state.batches.filter(
        (b) => b.assignedDoctors.includes(doctor.id) && b.status !== "completed" && b.status !== "paid"
    );
    const openBatches = state.batches.filter((b) => b.status === "open" || (b.status === "in_progress" && !b.assignedDoctors.includes(doctor.id)));

    const handleMintSBT = async () => {
        setIsMinting(true);
        try {
            if (!isConnected) {
                toast.loading("DEMO MODE: Simulating SBT Minting…", { id: "sbtTx" });
                await new Promise(r => setTimeout(r, 2000));
                toast.dismiss("sbtTx");
            } else {
                toast.loading("Minting your Soulbound Identity on Polygon…", { id: "sbtTx" });
                await writeContractAsync({
                    ...CONTRACTS.DoctorSBT,
                    functionName: "mint",
                    args: [address!, doctor.specialty, doctor.tier],
                });
                toast.dismiss("sbtTx");
            }
            dispatch({ type: "APPROVE_DOCTOR", doctorId: doctor.id });
            toast.success("Identity Verified! SBT Minted Successfully.");
        } catch (e) {
            console.error(e);
            toast.error("Minting failed or was rejected.");
        } finally {
            setIsMinting(false);
        }
    };

    const statCards = [
        { label: "Total Earnings", value: `$${doctor.earnings.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, suffix: " USDC", icon: DollarSign, color: "var(--accent-emerald)" },
        { label: "Reputation Score", value: doctor.reputationScore.toLocaleString("en-US"), suffix: "", icon: Award, color: "var(--accent-cyan)" },
        { label: "Available Tasks", value: String(openBatches.length), suffix: " batches", icon: ListTodo, color: "var(--accent-cyan)" },
        { label: "Annotations Done", value: doctor.annotationCount.toLocaleString("en-US"), suffix: "", icon: Activity, color: "var(--accent-purple)" },
    ];

    return (
        <div style={{ background: "#000", minHeight: "100svh" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "6rem 1.5rem 2.5rem 1.5rem" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2.5rem", gap: "1rem" }}>
                    <div>
                        <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Doctor Portal</div>
                        <h1 className="headline-lg" style={{ marginBottom: "0.25rem" }}>
                            {doctor.name}
                        </h1>
                        <p className="body-md" style={{ color: "var(--primary-fixed)" }}>{doctor.specialty} Specialist</p>
                    </div>
                    <span className={`tier-badge ${tierClass[doctor.tier]}`}>{tierLabel[doctor.tier]}</span>
                </div>

                {/* Stat Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                    {statCards.map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                                    <Icon size={14} color={s.color} />
                                    <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>{s.label}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                                    <span className="display-md">{s.value}</span>
                                    {s.suffix && <span className="body-md" style={{ color: "var(--primary-fixed)" }}>{s.suffix}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Earnings breakdown */}
                <div className="card" style={{ padding: "1.5rem 2rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "3rem" }}>
                    <div>
                        <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Earnings Breakdown</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "1rem" }}>
                            <span className="display-md">{formatUSDCRaw(doctor.earnings)}</span>
                            <span className="label-md" style={{ color: "var(--primary-fixed)" }}>USDC</span>
                            <span style={{ color: "var(--primary-fixed)", fontSize: "1.25rem" }}>≈</span>
                            <span className="display-md" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                                {(doctor.earnings * 10).toLocaleString("en-US")}
                            </span>
                            <span className="label-md" style={{ color: "var(--accent-emerald)" }}>MAT</span>
                        </div>
                        <span className="label-sm" style={{ color: "var(--primary-fixed)", marginTop: "0.25rem", display: "block" }}>1 USDC = 10 MAT platform rate</span>
                    </div>
                    <DollarSign size={40} color="rgba(255,255,255,0.04)" style={{ marginLeft: "auto" }} />
                </div>

                {/* Two-column grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

                    {/* Active Batches */}
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            <ListTodo size={15} color="var(--accent-cyan)" />
                            <span className="title-md">Active Batches</span>
                        </div>
                        {active.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                                <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.75rem" }}>
                                    No active batches yet.
                                </p>
                                <Link href="/doctor/tasks" className="btn-secondary" style={{ textDecoration: "none" }}>Browse Available Tasks</Link>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {active.map((batch) => {
                                    const pct = Math.round((batch.annotatedImages / batch.totalImages) * 100);
                                    return (
                                        <Link key={batch.id} href={`/doctor/annotate/${batch.id}`} style={{ textDecoration: "none" }}>
                                            <div className="card" style={{ padding: "1rem 1.25rem" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="title-md" style={{ fontSize: "0.9rem", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {batch.title}
                                                        </div>
                                                        <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>
                                                            {batch.annotatedImages}/{batch.totalImages} images · {formatUSDCRaw(batch.rewardPerImage)}/img
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--accent-cyan)", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, marginLeft: "0.75rem" }}>
                                                        {pct}% <ArrowRight size={12} />
                                                    </div>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity — live from global feed */}
                    <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            <Activity size={15} color="var(--accent-purple)" />
                            <span className="title-md">Recent Activity</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                            {state.activityFeed.slice(0, 6).map((item, i) => (
                                <div key={i} className="card-recessed" style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: "50%", marginTop: 5, flexShrink: 0,
                                            background: feedColor[item.type] || "var(--primary-fixed)",
                                        }} />
                                        <div>
                                            <p className="body-md" style={{ color: "var(--on-surface-variant)", lineHeight: 1.4 }}>{item.message}</p>
                                            <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>{item.time}</span>
                                        </div>
                                    </div>
                                    {item.amount && (
                                        <span style={{ color: "var(--accent-emerald)", fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>{item.amount}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
