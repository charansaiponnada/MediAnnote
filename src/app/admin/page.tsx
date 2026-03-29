"use client";

import { useAppStore } from "@/lib/store";
import { truncateAddress } from "@/lib/utils";
import { Shield, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useWriteContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";

const tierLabel: Record<number, string> = { 0: "Bronze", 1: "Silver", 2: "Gold", 3: "Platinum", 4: "Elite" };
const tierClass: Record<number, string> = { 0: "tier-bronze", 1: "tier-silver", 2: "tier-gold", 3: "tier-platinum", 4: "tier-elite" };

export default function AdminPage() {
    const { state, dispatch } = useAppStore();
    const [minting, setMinting] = useState<string | null>(null);
    const { writeContractAsync } = useWriteContract();
    const { isConnected } = useAccount();

    const handleApprove = async (id: string) => {
        const doctor = state.doctors.find((d) => d.id === id);
        if (!doctor) return;

        setMinting(id);

        if (!isConnected) {
            toast.loading(`DEMO MODE: Simulating SBT Minting for ${doctor.name}…`, { id: "mintTx" });
            await new Promise((r) => setTimeout(r, 2000));
            toast.dismiss("mintTx");
        } else {
            try {
                toast.loading(`Minting SBT for ${doctor.name}… Confirm in MetaMask.`, { id: "mintTx" });
                await writeContractAsync({
                    ...CONTRACTS.DoctorSBT,
                    functionName: "mint",
                    args: [doctor.wallet as `0x${string}`, doctor.specialty, doctor.tier],
                });
                await new Promise((r) => setTimeout(r, 2000));
                toast.dismiss("mintTx");
            } catch (error) {
                console.error(error);
                toast.error("Transaction failed or was rejected by user.", { id: "mintTx" });
                setMinting(null);
                return;
            }
        }

        dispatch({ type: "APPROVE_DOCTOR", doctorId: id });
        setMinting(null);
        toast.success("SBT Minted — Doctor verified on Polygon.");
    };

    return (
        <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
                <div style={{ marginBottom: "2.5rem" }}>
                    <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Shield size={12} /> Admin Panel
                    </div>
                    <h1 className="headline-lg">Protocol Governor (Admin Roles)</h1>
                    <p className="body-md" style={{ color: "var(--primary-fixed)", marginTop: "0.375rem", maxWidth: 700 }}>
                        Manage platform access by verifying professional credentials. Approving an applicant triggers an immutable <strong>Soulbound Token (SBT)</strong> mint transaction on the Polygon network, permanently verifying their identity to dataset requestors.
                    </p>
                </div>

                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", overflow: "hidden" }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto",
                        padding: "0.875rem 1.5rem",
                        background: "var(--surface-lowest)",
                    }}>
                        {["Doctor", "Specialty", "Wallet", "Status", "Action"].map((h) => (
                            <span key={h} className="label-sm" style={{ color: "var(--primary-fixed)" }}>{h}</span>
                        ))}
                    </div>

                    {state.doctors.map((doctor, i) => (
                        <div key={doctor.id} style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto",
                            alignItems: "center",
                            padding: "1.125rem 1.5rem",
                            gap: "1rem",
                            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                            borderTop: "1px solid rgba(255,255,255,0.04)",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: "50%",
                                    background: "var(--surface-high)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.9rem",
                                }}>
                                    {doctor.avatar}
                                </div>
                                <div>
                                    <div className="body-md" style={{ color: "var(--on-surface)", fontWeight: 600 }}>{doctor.name}</div>
                                    <span className={`tier-badge ${tierClass[doctor.tier]}`} style={{ fontSize: "0.6rem", padding: "0.1rem 0.5rem", marginTop: "0.125rem", display: "inline-flex" }}>
                                        {tierLabel[doctor.tier]}
                                    </span>
                                </div>
                            </div>
                            <span className="body-md" style={{ color: "var(--on-surface-variant)" }}>{doctor.specialty}</span>
                            <span className="hash-chip">{truncateAddress(doctor.wallet)}</span>
                            <div>
                                {doctor.verified
                                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 600 }}><Check size={13} /> Verified</span>
                                    : <span className="status-pulse" style={{ fontSize: "0.8rem", color: "var(--accent-amber)", fontWeight: 600 }}>Pending</span>
                                }
                            </div>
                            <div>
                                {doctor.verified
                                    ? <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>SBT Minted</span>
                                    : (
                                        <button className="btn-secondary" onClick={() => handleApprove(doctor.id)} disabled={minting === doctor.id}
                                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: minting === doctor.id ? 0.7 : 1, padding: "0.4rem 1rem" }}>
                                            {minting === doctor.id
                                                ? <><Loader2 size={13} className="animate-spin" /> Minting…</>
                                                : <><Shield size={13} /> Approve & Mint</>}
                                        </button>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
