"use client";

import { motion } from "motion/react";
import {
    BookOpen,
    Lightning,
    Crown,
    ArrowRight,
    CaretRight,
    CircleDashed,
    HardDrive,
    FilePdf,
    PresentationChart,
    Code
} from "@phosphor-icons/react";
import Link from "next/link";

const resources = [
    {
        category: "Whitepaper",
        title: "Proof of Quality: Consensus in Medical AI",
        desc: "A technical deep-dive into on-chain Inter-Annotator Agreement (IAA) and Intersection-over-Union (IoU) metrics.",
        icon: FilePdf,
        link: "/docs",
        color: "text-[#3054ff]"
    },
    {
        category: "API Reference",
        title: "Smart Contract SDK v2.0",
        desc: "Build on top of the MediAnnote escrow protocol. Fully programmatic batch creation and payment release.",
        icon: Code,
        link: "/docs",
        color: "text-[#22D3EE]"
    },
    {
        category: "Case Study",
        title: "Scaling Chest X-Ray AI (NIH)",
        desc: "How a large-scale diagnostic model reached 92% validation accuracy using MediAnnote's verified experts.",
        icon: PresentationChart,
        link: "/stories",
        color: "text-[#34D399]"
    },
    {
        category: "Developer Guide",
        title: "Xai Smart Drafting Integration",
        desc: "A hands-on guide for developers to integrate automated bounding box suggestions into their workflows.",
        icon: BookOpen,
        link: "/docs",
        color: "text-[#A78BFA]"
    }
];

export default function ResourcesPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 font-instrument-sans">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20"
                >
                    <div className="text-[#3054ff] font-bold uppercase tracking-widest text-sm mb-4">Resources Library</div>
                    <h1 className="text-5xl sm:text-7xl font-semibold mb-6">Build the future<br />of medical AI.</h1>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {resources.map((r, i) => (
                        <motion.div
                            key={r.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-10 rounded-[32px] bg-white/[0.03] border border-white/10 group flex flex-col h-full hover:border-white/20 transition-all cursor-pointer overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <r.icon size={120} weight="duotone" />
                            </div>

                            <div className={`p-4 rounded-2xl w-fit mb-8 bg-white/5 ${r.color} group-hover:bg-[#3054ff] group-hover:text-white transition-all`}>
                                <r.icon size={28} weight="duotone" />
                            </div>

                            <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${r.color}`}>{r.category}</div>
                            <h2 className="text-3xl font-semibold mb-4 pr-12 leading-tight tracking-tight">{r.title}</h2>
                            <p className="text-white/40 mb-10 leading-relaxed text-sm">
                                {r.desc}
                            </p>

                            <Link
                                href={r.link}
                                className="mt-auto flex items-center gap-3 font-semibold text-white/70 hover:text-white transition-colors group no-underline"
                            >
                                Learn More
                                <ArrowRight size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 p-16 rounded-[48px] bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-white/10 flex flex-col md:flex-row items-center gap-16 text-center md:text-left">
                    <div className="md:w-2/3">
                        <h2 className="text-4xl font-semibold mb-4 leading-tight">Need custom technical integration?</h2>
                        <p className="text-lg text-white/50 leading-relaxed">
                            Our core engineers are available to help you set up private enclaves, custom consensus logic, and on-premise deployments.
                        </p>
                    </div>
                    <div className="md:w-1/3">
                        <Link
                            href="/demo"
                            className="bg-white text-black px-10 py-5 rounded-full font-bold text-lg hover:bg-white/90 transition-all no-underline block"
                        >
                            Join as Expert
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
