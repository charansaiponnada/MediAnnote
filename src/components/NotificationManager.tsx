"use client";

import { useAppStore } from "@/lib/store";
import { 
    Bell, 
    X, 
    Coins, 
    Zap, 
    Star, 
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function NotificationManager() {
    const { state, dispatch } = useAppStore();
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (state.activeNotification) {
            setShow(true);
            if (state.activeNotification.type === 'payout') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#06b6d4', '#ffffff']
                });
            }
        } else {
            setShow(false);
        }
    }, [state.activeNotification]);

    if (!state.activeNotification) return null;

    const n = state.activeNotification;

    return (
        <div className={`fixed bottom-8 right-8 z-[100] w-[400px] transition-all duration-500 transform 
            ${show ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
            
            <div className="glass-card overflow-hidden border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                {/* Header */}
                <div className={`p-4 flex items-center justify-between border-b border-white/10
                    ${n.type === 'job' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}>
                    <div className="flex items-center gap-2">
                        {n.type === 'job' ? (
                            <Zap size={18} className="text-cyan-400" />
                        ) : (
                            <Coins size={18} className="text-emerald-400" />
                        )}
                        <span className="text-sm font-bold text-white tracking-wide uppercase">
                            {n.title}
                        </span>
                    </div>
                    <button 
                        onClick={() => dispatch({ type: "HIDE_NOTIFICATION" })}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">
                        {n.message}
                    </p>

                    {n.type === 'payout' && n.data && (
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Consensus</div>
                                    <div className="text-lg font-bold text-emerald-400">{n.data.score}%</div>
                                </div>
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Adjustment</div>
                                    <div className="text-lg font-bold text-cyan-400">+{n.data.adjustment}%</div>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                <span className="text-xs font-medium text-emerald-400">Final Contribution Payout</span>
                                <span className="text-lg font-bold text-white">${n.data.amount} USDC</span>
                            </div>
                        </div>
                    )}

                    {n.type === 'job' && (
                        <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="h-10 w-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium">Estimated Reward</div>
                                <div className="text-sm font-bold text-white">$125.00 - $150.00 USDC</div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => dispatch({ type: "HIDE_NOTIFICATION" })}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg
                            ${n.type === 'job' 
                                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20' 
                                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'}`}
                    >
                        {n.type === 'job' ? 'View Task details' : 'Claim Rewards'}
                    </button>
                </div>

                {/* Footer Footer */}
                <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-gray-600" />
                    <span className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">
                        Verified by On-Chain Reputation Protocol
                    </span>
                </div>
            </div>
        </div>
    );
}
