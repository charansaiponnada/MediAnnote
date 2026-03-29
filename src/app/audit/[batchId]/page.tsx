"use client";

import { use, useState } from "react";
import {
    Shield,
    Hash,
    Clock,
    Users,
    BarChart3,
    ExternalLink,
    CheckCircle,
    BrainCircuit,
    Coins,
    Loader2,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { truncateAddress, formatUSDCRaw } from "@/lib/utils";
import toast from "react-hot-toast";
import { useWriteContract, useAccount } from "wagmi";
import { CONTRACTS } from "@/lib/contracts";
import { pad, stringToHex, isHex } from "viem";

export default function AuditPage({
    params,
}: {
    params: Promise<{ batchId: string }>;
}) {
    const { batchId } = use(params);
    const { state, dispatch } = useAppStore();
    const { writeContractAsync } = useWriteContract();
    const { isConnected } = useAccount();

    const batch = state.batches.find((b) => b.id === batchId) || state.batches[0];
    const doctors = state.doctors.filter((d) =>
        batch.assignedDoctors.includes(d.id)
    );

    const [isCalculating, setIsCalculating] = useState(false);
    const [isReleasing, setIsReleasing] = useState(false);
    const [consensusResult, setConsensusResult] = useState<{
        splits: { address: string; bps: number; score: number }[];
        metrics: { average_iou: number; consensus_confidence: number };
    } | null>(null);

    const handleRunConsensus = async () => {
        setIsCalculating(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const batchAnnotations = state.annotations[batch.id] || [];

            // Group annotations by doctor wallet for the ML service
            const submissions: Record<string, typeof batchAnnotations> = {};
            doctors.forEach(doc => {
                submissions[doc.wallet] = batchAnnotations.filter(a => a.doctorId === doc.id);
            });

            const response = await fetch(`${API_URL}/consensus`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submissions }),
            });

            const data = await response.json();
            if (data.status === "success") {
                setConsensusResult(data);
                toast.success("Consensus calculated successfully!");
            } else {
                toast.error(data.error || "Failed to calculate consensus");
            }
        } catch (error) {
            console.error("Consensus error:", error);
            toast.error("ML Service unreachable. Check your Python backend.");
        } finally {
            setIsCalculating(false);
        }
    };
    const handleReleasePayment = async () => {
        if (!consensusResult) return;
        setIsReleasing(true);

        try {
            const annotators = consensusResult.splits.map(s => s.address as `0x${string}`);
            const splits = consensusResult.splits.map(s => BigInt(s.bps));

            if (!isConnected) {
                toast.loading("DEMO MODE: Simulating Escrow Release Transaction…", { id: "releaseTx" });
                await new Promise(r => setTimeout(r, 2000));
                toast.dismiss("releaseTx");
            } else {
                toast.loading("Releasing funds from Escrow… Confirm in MetaMask.", { id: "releaseTx" });
                const rawBatchId = batch.batchId || batch.id;
                const bytes32BatchId = isHex(rawBatchId) ? pad(rawBatchId as `0x${string}`, { size: 32 }) : pad(stringToHex(rawBatchId), { size: 32 });

                await writeContractAsync({
                    ...CONTRACTS.AnnotationEscrow,
                    functionName: "releasePaymentWithSplits",
                    args: [bytes32BatchId, annotators, splits],
                });
                toast.dismiss("releaseTx");
            }

            dispatch({ type: "RELEASE_PAYMENT", batchId: batch.id });
            toast.success("Payment distributed to all doctors based on consensus scores!");
        } catch (error) {
            console.error("Release error:", error);
            toast.error("Transaction failed or was rejected.");
        } finally {
            setIsReleasing(false);
        }
    };

    const mockAnnotationHashes = [
        { hash: "0xa3f8b2c1d4e5f6789012345678abcdef01234567890abcdef0123456789abcdef", timestamp: "2026-03-27 14:23:01", annotator: doctors[0]?.wallet || "0x71C7...976F" },
        { hash: "0xb4c9d3e2f5a6b7890123456789bcdef012345678901bcdef1234567890bcdef01", timestamp: "2026-03-27 15:07:22", annotator: doctors[0]?.wallet || "0x71C7...976F" },
        { hash: "0xc5dae4f3a6b7c8901234567890cdef0123456789012cdef2345678901cdef0123", timestamp: "2026-03-27 16:45:10", annotator: doctors[1]?.wallet || "0x2B5A...6cF" },
    ];

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-cyan-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Compliance Audit Report</h1>
                        <p className="text-sm text-gray-400">{batch.title}</p>
                    </div>
                </div>
                <Link href="/company/dashboard" className="btn-tertiary text-xs">← Back to Dashboard</Link>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Annotators", value: doctors.length.toString(), icon: Users },
                    { label: "IAA Score", value: consensusResult ? (consensusResult.metrics.average_iou * 100).toFixed(1) : batch.iaaScore.toFixed(1), icon: BarChart3 },
                    { label: "Annotations", value: (state.annotations[batch.id]?.length || 0 + mockAnnotationHashes.length).toString(), icon: Hash },
                    { label: "Budget", value: formatUSDCRaw(batch.totalBudget), icon: CheckCircle },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="glass-card p-4 text-center">
                            <Icon className="mx-auto mb-1 h-4 w-4 text-gray-500" />
                            <div className="text-lg font-bold text-white">{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Consensus Reward Engine Section */}
            <div className="glass-card mb-6 overflow-hidden border-cyan-500/20 bg-cyan-500/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-5 w-5 text-cyan-400" />
                        <h3 className="font-semibold text-white">Consensus Reward Engine</h3>
                    </div>
                    {batch.status === "completed" && !consensusResult && (
                        <button
                            className="btn-primary py-1.5 px-4 text-xs"
                            onClick={handleRunConsensus}
                            disabled={isCalculating}
                        >
                            {isCalculating ? <Loader2 className="h-3 w-3 animate-spin" /> : <BarChart3 className="h-3 w-3" />}
                            Run Fairness Consensus
                        </button>
                    )}
                </div>

                {!consensusResult ? (
                    <p className="text-sm text-gray-400">
                        Consensus has not been calculated yet. Run the engine to determine fair reward splits based on IoU overlap and annotation quality.
                    </p>
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-white/5 p-3">
                                <div className="text-xs text-gray-500">Avg. Intersection over Union (IoU)</div>
                                <div className="text-lg font-bold text-cyan-400">{(consensusResult.metrics.average_iou * 100).toFixed(1)}%</div>
                            </div>
                            <div className="rounded-lg bg-white/5 p-3">
                                <div className="text-xs text-gray-500">Consensus Confidence</div>
                                <div className="text-lg font-bold text-emerald-400">{(consensusResult.metrics.consensus_confidence * 100).toFixed(1)}%</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated Reward Splits</div>
                            {consensusResult.splits.map((split) => (
                                <div key={split.address} className="flex items-center justify-between rounded-lg bg-black/20 p-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-mono text-gray-300">{truncateAddress(split.address)}</span>
                                        <span className="text-[10px] text-gray-500">Quality Score: {split.score}%</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{(split.bps / 100).toFixed(2)}%</div>
                                        <div className="text-[10px] text-emerald-500">+ ${((batch.totalBudget * 0.9 * split.bps) / 10000).toFixed(2)} USDC</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {batch.status !== "paid" ? (
                            <button
                                className="btn-primary w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-500"
                                onClick={handleReleasePayment}
                                disabled={isReleasing}
                            >
                                {isReleasing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                                Finalize & Release Rewards from Escrow
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-400">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-bold uppercase">Payment Released Successfully</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* AI-Assisted Insight Hashes */}
            <div className="glass-card mb-6 border-emerald-500/20 bg-emerald-500/5 p-6">
                <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-sm font-medium text-emerald-400">
                        Blockchain AI Provenance Trail
                    </h3>
                </div>
                <div className="space-y-2">
                    {[
                        { hash: "0xe7fc06b5c8d9e0123456789012ef0123456789012340ef456789012ef0123456", timestamp: "2026-03-27 14:22:50", label: "AI Smart Draft" },
                        { hash: "0xf8fd17c6d9e0f1234567890123f01234567890123451f056789012f01234567", timestamp: "2026-03-27 15:05:10", label: "AI Clinical Caption" },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-emerald-500/10 bg-black/20 p-3"
                        >
                            <div className="flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-emerald-800" />
                                <code className="font-mono text-xs text-emerald-600">
                                    {item.hash.slice(0, 24)}...
                                </code>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-emerald-700">
                                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px]">
                                    {item.label}
                                </span>
                                <span>{item.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    <p className="mt-2 text-[10px] text-emerald-900 italic">
                        * These hashes represent the AI's raw suggestions committed to the blockchain before doctor refinement, ensuring data provenance.
                    </p>
                </div>
            </div>

            {/* Annotator Wallets */}
            <div className="glass-card mb-6 p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-400">Annotator Wallet Addresses</h3>
                <div className="space-y-2">
                    {doctors.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-400">
                                    {doc.avatar}
                                </div>
                                <span className="text-sm text-gray-300">{doc.name} — {doc.specialty}</span>
                            </div>
                            <code className="font-mono text-xs text-gray-500">
                                {truncateAddress(doc.wallet)}
                            </code>
                        </div>
                    ))}
                </div>
            </div>

            {/* Annotation Hashes */}
            <div className="glass-card mb-6 p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-400">
                    On-Chain Annotation Audit Trail
                </h3>
                <div className="space-y-2">
                    {mockAnnotationHashes.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                            <div className="flex items-center gap-2">
                                <Hash className="h-3.5 w-3.5 text-gray-600" />
                                <code className="font-mono text-xs text-gray-400">
                                    {item.hash.slice(0, 24)}...
                                </code>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>{truncateAddress(item.annotator)}</span>
                                <span>{item.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Escrow TX */}
            <div className="glass-card p-6">
                <h3 className="mb-3 text-sm font-medium text-gray-400">Initial Deposit Escrow Transaction</h3>
                {batch.txHash && (
                    <a
                        href={`https://mumbai.polygonscan.com/tx/${batch.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {batch.txHash.slice(0, 20)}...{batch.txHash.slice(-8)}
                    </a>
                )}
            </div>
        </div>
    );
}
