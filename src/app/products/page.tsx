"use client";

import { motion } from "motion/react";
import {
    Cpu,
    ShieldCheck,
    Database,
    ChartLine,
    ArrowsLeftRight,
    MagicWand,
    CheckCircle
} from "@phosphor-icons/react";

const products = [
    {
        title: "Annotator Workspace",
        subtitle: "The Clinical Standard",
        desc: "A distraction-free, high-performance web canvas for medical imaging. Supports DICOM, NIfTI, and high-res pathology slides with native browser rendering.",
        icon: MagicWand,
        features: ["Smart Drafting (Xai Assisted)", "Multi-layer Segmentation", "Real-time Collaboration"]
    },
    {
        title: "Proof-of-Expertise (SBT)",
        subtitle: "On-Chain Identity",
        desc: "Soulbound Tokens verifying physician credentials and specialization. Ensures only verified experts can touch sensitive medical datasets.",
        icon: ShieldCheck,
        features: ["Auto-verification via NPI/GMC", "Non-transferable Reputation", "Governance Rights"]
    },
    {
        title: "Consensus Reward Engine",
        subtitle: "Fair Value Distribution",
        desc: "Algorithmic splitting of annotation bounties based on Inter-Annotator Agreement (IAA) and Intersection-over-Union (IoU) metrics.",
        icon: ArrowsLeftRight,
        features: ["Smart Contract Escrow", "Automated Payouts (USDC)", "Dynamic Split Ratios"]
    },
    {
        title: "MediNode Analytics",
        subtitle: "MLOps for datasets",
        desc: "Advanced metrics dashboard for AI companies. Track annotation velocity, agreement quality, and dataset training-readiness score.",
        icon: ChartLine,
        features: ["Bias Detection", "Model Drift Analysis", "Export in COCO/CSV/XML"]
    }
];

export default function ProductsPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 font-instrument-sans">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20"
                >
                    <div className="text-[#3054ff] font-bold uppercase tracking-widest text-sm mb-4">Product Suite</div>
                    <h1 className="text-5xl sm:text-7xl font-semibold mb-6">Designed for the clinical gold standard.</h1>
                    <p className="text-xl text-white/50 max-w-2xl">
                        A decentralized infrastructure designed to convert physician expertise into production-ready AI data.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {products.map((p, i) => (
                        <motion.div
                            key={p.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col h-full hover:border-[#3054ff]/50 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 text-[#3054ff] group-hover:bg-[#3054ff] group-hover:text-white transition-all">
                                <p.icon size={28} weight="duotone" />
                            </div>
                            <div className="mb-2 text-xs font-bold text-[#3054ff] uppercase tracking-widest">{p.subtitle}</div>
                            <h2 className="text-3xl font-semibold mb-4">{p.title}</h2>
                            <p className="text-white/50 mb-8 leading-relaxed">
                                {p.desc}
                            </p>

                            <div className="mt-auto space-y-3">
                                {p.features.map(f => (
                                    <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                                        <CheckCircle size={16} color="#3054ff" weight="fill" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
