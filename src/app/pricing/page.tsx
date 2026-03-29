"use client";

import { motion } from "motion/react";
import {
    CheckCircle,
    Lightning,
    Crown,
    ArrowRight,
    CaretRight,
    CircleDashed,
    HardDrive
} from "@phosphor-icons/react";
import Link from "next/link";

const plans = [
    {
        name: "Community",
        price: "0",
        desc: "For small-scale medical researchers and open-source datasets.",
        features: ["Dataset upload (up to 1GB)", "Community pool verification", "Standard consensus", "COCO export"],
        icon: HardDrive,
        button: "Get Started Free",
        highlight: false
    },
    {
        name: "Pro",
        price: "99",
        desc: "For commercial AI companies needing high-velocity data labeling.",
        features: [
            "Dataset upload (up to 50GB)",
            "Priority Expert Matching",
            "Advanced smart drafting (Xai)",
            "Full technical report export",
            "Dedicated support channel"
        ],
        icon: Lightning,
        button: "Start Pro Trial",
        highlight: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For global diagnostic centers and institutional pharmaceutical R&D.",
        features: [
            "Infinite dataset storage",
            "On-Premise data enclave integration",
            "White-labeled dashboard",
            "Custom consensus algorithms",
            "Full compliance audit trail"
        ],
        icon: Crown,
        button: "Contact Sales",
        highlight: false
    }
];

export default function PricingPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 font-instrument-sans">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center"
                >
                    <div className="text-[#3054ff] font-bold uppercase tracking-widest text-sm mb-4">Pricing Plans</div>
                    <h1 className="text-5xl sm:text-7xl font-semibold mb-6">Invest in validated data.</h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((p, i) => (
                        <motion.div
                            key={p.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-10 rounded-[32px] flex flex-col h-full border ${p.highlight ? "border-[#3054ff] bg-[#3054ff]/5 shadow-[0_32px_128px_rgba(48,84,255,0.15)] scale-[1.05]" : "border-white/10 bg-white/[0.03]"
                                }`}
                        >
                            <div className={`p-4 rounded-2xl w-fit mb-8 ${p.highlight ? "bg-[#3054ff] text-white" : "bg-white/5 text-[#3054ff]"}`}>
                                <p.icon size={24} weight="duotone" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-1">{p.name}</h2>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-bold">{p.price === "Custom" ? "" : "$"}</span>
                                <span className="text-5xl font-bold">{p.price}</span>
                                <span className="text-white/40 text-sm font-medium">{p.price === "Custom" ? "" : "/mo"}</span>
                            </div>
                            <p className="text-white/50 text-sm mb-8 leading-relaxed">
                                {p.desc}
                            </p>

                            <div className="space-y-4 mb-10">
                                {p.features.map(f => (
                                    <div key={f} className="flex items-center gap-3 text-sm text-white/70">
                                        <CheckCircle size={18} className={p.highlight ? "text-[#3054ff]" : "text-white/20"} weight="fill" />
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/doctor/dashboard"
                                className={`mt-auto w-full py-4 rounded-full font-semibold flex items-center justify-center gap-2 group transition-all no-underline ${p.highlight ? "bg-[#3054ff] text-white hover:bg-[#2040e0]" : "bg-white text-black hover:bg-white/90"
                                    }`}
                            >
                                {p.button}
                                <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-12">Trusted by global medical institutions</p>
                    <div className="flex flex-wrap justify-center gap-16 opacity-20 filter grayscale">
                        {/* Mock Logos */}
                        <div className="text-2xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-white" /> NIH</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-white" /> MAYO</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-white" /> STANFORD</div>
                        <div className="text-2xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-white" /> WHO</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
