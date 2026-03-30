"use client";

import { useAppStore } from "@/lib/store";
import { 
    ShieldAlert, 
    Gavel, 
    ChevronRight, 
    Scale, 
    CheckCircle2, 
    XCircle,
    AlertTriangle,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

export default function MedicalCourt() {
    const { state } = useAppStore();
    const doctor = state.doctors[0]; // Assuming current user is Dr. James
    const isElite = doctor.tier >= 4;

    // Simulate some disputed batches
    const disputedBatches = [
        {
            id: "disp-101",
            title: "Chest X-Ray Pneumonia (Batch #44)",
            company: "LungAI",
            status: "contested",
            reason: "Low Consensus (62%)",
            reward: 500,
            deadline: "24h left",
            difficulty: "High"
        },
        {
            id: "disp-102",
            title: "Dermoscopy Lesions (Batch #12)",
            company: "SkinScan",
            status: "pending_review",
            reason: "Outlier detection failure",
            reward: 250,
            deadline: "3 days left",
            difficulty: "Medium"
        }
    ];

    const [resolved, setResolved] = useState<string[]>([]);

    const handleResolve = (id: string, decision: 'uphold' | 'overturn') => {
        toast.success(`On-chain verdict submitted: ${decision.toUpperCase()}`, {
            icon: decision === 'uphold' ? "⚖️" : "🔄"
        });
        setResolved(prev => [...prev, id]);
    };

    if (!isElite) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <ShieldAlert size={64} className="mx-auto text-amber-500 mb-6 opacity-20" />
                    <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
                    <p className="text-gray-400 leading-relaxed mb-8">
                        The **Medical Court** is only accessible to **Elite-Tier** specialists. 
                        Continue providing high-consensus annotations to level up your Soulbound reputation.
                    </p>
                    <Link href="/doctor/dashboard" className="btn-primary inline-flex">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="mb-12 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 text-[var(--accent-purple)] mb-2">
                        <Gavel size={20} />
                        <span className="text-xs font-bold uppercase tracking-widest">Protocol Governance</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Medical Court</h1>
                    <p className="text-gray-400 mt-2">Elite-tier specialists acting as decentralized jurors for quality disputes.</p>
                </div>
                <div className="hidden lg:block bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Scale size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] text-gray-500 uppercase font-bold">Voting Power</div>
                            <div className="text-lg font-bold text-white">Elite (1.5x Weight)</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {disputedBatches.map((batch) => {
                    const isResolved = resolved.includes(batch.id);
                    
                    return (
                        <div key={batch.id} className={`glass-card p-8 border-white/5 transition-all
                            ${isResolved ? 'opacity-50 grayscale' : 'hover:border-[var(--accent-purple)]/30'}`}>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                            ${batch.status === 'contested' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {batch.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-gray-600 text-xs">•</span>
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12} /> {batch.deadline}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{batch.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
                                        Dispute Reason: <span className="text-white font-medium italic">"{batch.reason}"</span>
                                    </p>
                                    
                                    <div className="flex gap-6">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Resolution Reward</div>
                                            <div className="text-sm font-bold text-emerald-400">${batch.reward} USDC</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Complexity</div>
                                            <div className="text-sm font-bold text-cyan-400">{batch.difficulty}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isResolved ? (
                                        <div className="flex items-center gap-2 text-emerald-400 font-bold px-6 py-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
                                            <CheckCircle2 size={18} />
                                            Verdict Logged
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => handleResolve(batch.id, 'overturn')}
                                                className="flex-1 lg:flex-none flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-bold transition-all"
                                            >
                                                <XCircle size={18} /> Overturn Consensus
                                            </button>
                                            <button 
                                                onClick={() => handleResolve(batch.id, 'uphold')}
                                                className="flex-1 lg:flex-none flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-bold transition-all"
                                            >
                                                <CheckCircle2 size={18} /> Uphold Consensus
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                <AlertTriangle className="text-amber-500 mt-1 flex-shrink-0" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Judicial Responsibility</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Verdicts in the Medical Court are recorded on the Polygon mainnet. Consistent alignment with other Elite jurors increases your **Governance Score**. Divergent or malicious voting results in **SBT Reputation Slashing**.
                    </p>
                </div>
            </div>
        </div>
    );
}
