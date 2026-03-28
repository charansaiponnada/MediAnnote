"use client";

import { use } from "react";
import {
    Shield,
    Hash,
    Clock,
    Users,
    BarChart3,
    ExternalLink,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { mockBatches, mockDoctors } from "@/lib/mock-data";
import { truncateAddress, formatUSDCRaw } from "@/lib/utils";

export default function AuditPage({
    params,
}: {
    params: Promise<{ batchId: string }>;
}) {
    const { batchId } = use(params);
    const batch = mockBatches.find((b) => b.id === batchId) || mockBatches[0];
    const doctors = mockDoctors.filter((d) =>
        batch.assignedDoctors.includes(d.id)
    );

    const mockAnnotationHashes = [
        { hash: "0xa3f8b2c1d4e5f6789012345678abcdef01234567890abcdef0123456789abcdef", timestamp: "2026-03-27 14:23:01", annotator: doctors[0]?.wallet || "0x71C7...976F" },
        { hash: "0xb4c9d3e2f5a6b7890123456789bcdef012345678901bcdef1234567890bcdef01", timestamp: "2026-03-27 15:07:22", annotator: doctors[0]?.wallet || "0x71C7...976F" },
        { hash: "0xc5dae4f3a6b7c8901234567890cdef0123456789012cdef2345678901cdef0123", timestamp: "2026-03-27 16:45:10", annotator: doctors[1]?.wallet || "0x2B5A...6cF" },
        { hash: "0xd6ebf5a4b7c8d9012345678901def01234567890123def3456789012def012345", timestamp: "2026-03-27 17:12:34", annotator: doctors[1]?.wallet || "0x2B5A...6cF" },
        { hash: "0xe7fc06b5c8d9e0123456789012ef0123456789012340ef456789012ef0123456", timestamp: "2026-03-28 09:30:00", annotator: doctors[0]?.wallet || "0x71C7...976F" },
    ];

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <div className="mb-8 flex items-center gap-3">
                <Shield className="h-6 w-6 text-cyan-400" />
                <div>
                    <h1 className="text-2xl font-bold text-white">Compliance Audit Report</h1>
                    <p className="text-sm text-gray-400">{batch.title}</p>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                    { label: "Annotators", value: doctors.length.toString(), icon: Users },
                    { label: "IAA Score", value: batch.iaaScore.toString(), icon: BarChart3 },
                    { label: "Annotations", value: mockAnnotationHashes.length.toString(), icon: Hash },
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
                                <span className="text-sm text-gray-300">{doc.specialty}</span>
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
                    On-Chain Annotation Hashes
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
                                    {item.hash.slice(0, 18)}...{item.hash.slice(-6)}
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
                <h3 className="mb-3 text-sm font-medium text-gray-400">Escrow Transaction</h3>
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
