"use client";

import { motion } from "motion/react";
import {
    Users,
    Quotes,
    Buildings,
    ArrowRight,
    Star
} from "@phosphor-icons/react";
import Image from "next/image";

const stories = [
    {
        company: "LungAI Diagnostics",
        role: "Early Adopter",
        quote: "MediAnnote reduced our data verification time by 40% while doubling annotation confidence levels with verified expert consensus.",
        stats: { timeReduction: "40%", confidence: "2x" },
        industry: "Radiology AI",
        author: "Dr. Sarah Chen, Chief of ML"
    },
    {
        company: "RetinaSense",
        role: "Data Partner",
        quote: "The Proof-of-Expertise SBTs solved our biggest bottleneck: trust in our dataset labels. We now have a cryptographically verifiable expert audit trail.",
        stats: { trust: "100%", efficiency: "1.5x" },
        industry: "Ophthalmology",
        author: "Mark Evans, CEO"
    },
    {
        company: "Pathology Pro",
        role: "Beta User",
        quote: "Decentralized annotation allowed us to reach specialized dermatopathologists worldwide that were previously inaccessible via standard gig-platforms.",
        stats: { reach: "Global", specialists: "50+" },
        industry: "Dermatopathology",
        author: "Lena Weber, Head of Operations"
    }
];

export default function StoriesPage() {
    return (
        <div className="bg-black min-h-screen text-white pt-32 pb-20 font-instrument-sans">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-20 text-center"
                >
                    <div className="text-[#3054ff] font-bold uppercase tracking-widest text-sm mb-4">Customer Stories</div>
                    <h1 className="text-5xl sm:text-7xl font-semibold mb-6">Built by experts,<br />loved by engineers.</h1>
                </motion.div>

                <div className="grid grid-cols-1 gap-12">
                    {stories.map((s, i) => (
                        <motion.div
                            key={s.company}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-3xl p-12 flex flex-col md:flex-row gap-16 group hover:border-white/20 transition-all"
                        >
                            <div className="md:w-1/3 flex flex-col justify-center">
                                <div className="p-4 bg-white/5 w-fit rounded-2xl mb-8 group-hover:scale-110 transition-transform">
                                    <Buildings size={32} weight="duotone" className="text-[#3054ff]" />
                                </div>
                                <h2 className="text-4xl font-semibold mb-2">{s.company}</h2>
                                <p className="text-[#3054ff] font-bold uppercase tracking-widest text-sm mb-6">{s.industry}</p>
                                <div className="flex gap-8 group-hover:translate-y-[-4px] transition-transform">
                                    {Object.entries(s.stats).map(([k, v]) => (
                                        <div key={k}>
                                            <div className="text-2xl font-bold">{v}</div>
                                            <div className="text-[10px] uppercase text-white/30 tracking-widest">{k}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:w-2/3 flex flex-col justify-center relative">
                                <div className="absolute top-0 left-0 translate-x-[-20px] translate-y-[-20px] opacity-10">
                                    <Quotes size={80} weight="fill" />
                                </div>
                                <p className="text-2xl font-medium leading-relaxed mb-8 italic text-white/80">
                                    "{s.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3054ff] to-indigo-900 border border-white/20" />
                                    <div>
                                        <div className="text-sm font-semibold">{s.author}</div>
                                        <div className="text-xs text-white/40">{s.role} at {s.company}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
