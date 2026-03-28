"use client";

import { useAccount } from "wagmi";
import {
    Award,
    Shield,
    Activity,
    Star,
    Hash,
    ExternalLink,
} from "lucide-react";
import { mockDoctors } from "@/lib/mock-data";
import { tierNames, tierColors, truncateAddress } from "@/lib/utils";

export default function DoctorProfile() {
    const { address } = useAccount();
    const doctor = mockDoctors[0];

    const sbtMetadata = {
        name: `MediAnnote Doctor #1`,
        specialty: doctor.specialty,
        tier: tierNames[doctor.tier],
        reputationScore: doctor.reputationScore,
        annotationCount: doctor.annotationCount,
        wallet: address || doctor.wallet,
    };

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <h1 className="mb-8 text-2xl font-bold text-white">Doctor Profile</h1>

            {/* SBT Card */}
            <div className="glass-card mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-6">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                        <Shield className="h-4 w-4" />
                        Soulbound Token (Non-Transferable)
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xl font-bold text-white">
                            {doctor.avatar}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
                            <p className="text-sm text-gray-400">
                                {sbtMetadata.specialty} Specialist
                            </p>
                            <code className="mt-1 text-xs text-gray-600">
                                {truncateAddress(sbtMetadata.wallet)}
                            </code>
                        </div>
                        <div className="ml-auto">
                            <div
                                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${tierColors[sbtMetadata.tier]
                                    }`}
                            >
                                <Award className="h-4 w-4" />
                                {sbtMetadata.tier}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* On-chain metadata */}
            <div className="glass-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Hash className="h-5 w-5 text-cyan-400" />
                    On-Chain Metadata
                </h3>
                <div className="space-y-3">
                    {[
                        { label: "Token ID", value: "#1" },
                        { label: "Specialty", value: sbtMetadata.specialty },
                        { label: "Tier", value: sbtMetadata.tier },
                        {
                            label: "Reputation Score",
                            value: `${sbtMetadata.reputationScore}/100`,
                        },
                        {
                            label: "Annotations",
                            value: sbtMetadata.annotationCount.toLocaleString("en-US"),
                        },
                        {
                            label: "Wallet",
                            value: truncateAddress(sbtMetadata.wallet),
                        },
                        {
                            label: "Contract",
                            value: "DoctorSBT.sol (Polygon Mumbai)",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                            <span className="text-sm text-gray-400">{item.label}</span>
                            <span className="font-mono text-sm text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reputation History */}
            <div className="mt-6 glass-card p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Reputation Progress
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Score: {sbtMetadata.reputationScore}/100</span>
                    <span>
                        {sbtMetadata.reputationScore >= 90
                            ? "Platinum ✦"
                            : `${90 - sbtMetadata.reputationScore} pts to Platinum`}
                    </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-emerald-500"
                        style={{ width: `${sbtMetadata.reputationScore}%` }}
                    />
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-600">
                    <span>Bronze (0)</span>
                    <span>Silver (60)</span>
                    <span>Gold (80)</span>
                    <span>Platinum (90)</span>
                </div>

                <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-center text-sm text-gray-500">
                    De-identification: ✓ Complete — All personal data is anonymized on-chain
                </div>
            </div>
        </div>
    );
}
