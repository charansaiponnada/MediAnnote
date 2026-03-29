"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import Hls from "hls.js";
import {
  ArrowRight,
  CaretDown,
  Sun,
  ShieldCheck,
  Coins,
  Brain,
  Lightning,
  HighlighterCircle,
  Scales,
  Quotes,
  BookOpen,
  PresentationChart
} from "@phosphor-icons/react";

const stats = [
  { value: "2,450+", label: "Verified Doctors" },
  { value: "184K+", label: "Annotations" },
  { value: "$890K+", label: "USDC Distributed" },
  { value: "0.89", label: "Avg. IAA Score" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Experts",
    desc: "Licensed professionals with blockchain-verified credentials via SBTs.",
    color: "var(--accent-emerald)"
  },
  {
    icon: Coins,
    title: "Proof of Quality",
    desc: "Instant USDC payments secured by smart contract escrows.",
    color: "var(--accent-amber)"
  },
  {
    icon: Brain,
    title: "AI Smart Draft",
    desc: "Xai-powered automation reducing annotation workload by 40%.",
    color: "var(--accent-cyan)"
  },
  {
    icon: Scales,
    title: "Consensus Engine",
    desc: "Dynamic reward splitting based on IoU overlap metrics.",
    color: "var(--accent-purple)"
  },
];

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Auto-play prevented:", e));
      });
    }
  }, []);

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden font-instrument-sans">
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-20">
        {/* Background Video Layer */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
            poster="https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?q=80&w=1080"
          />
          <div className="absolute inset-0 bg-blur-overlay" />
        </div>

        {/* Decorative Gradients */}
        <div className="gradient-top-left" />
        <div className="gradient-bottom-right" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-instrument-serif text-3xl sm:text-5xl lg:text-[48px] leading-[1.1]"
          >
            Medical validation at the speed of light
          </motion.h2>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-6xl sm:text-8xl lg:text-[136px] font-semibold leading-[0.9] tracking-tighter text-gradient"
          >
            Annotate Faster
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-[20px] leading-[1.65] max-w-xl mx-auto text-white"
          >
            Scale your medical AI datasets with verified expert annotations,
            automated smart drafting, and blockchain-verified proof of quality.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/doctor/dashboard" className="hero-pill no-underline">
              <span className="font-medium text-lg text-[#0a0400]">Join as Expert</span>
              <div className="arrow-circle">
                <ArrowRight size={20} color="white" weight="bold" />
              </div>
            </Link>

            <Link href="/company/dashboard" className="px-4 py-2 rounded-lg text-white/70 hover:text-white flex items-center gap-2 backdrop-blur-sm hover:bg-white/5 transition-all group no-underline">
              Upload Dataset
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────── */}
      <section className="bg-black/50 py-24 border-y border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl lg:text-5xl font-semibold mb-2 text-gradient">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <div className="text-[#3054ff] font-semibold uppercase tracking-widest text-sm mb-4">Precision Engineering</div>
            <h2 className="text-4xl sm:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              The trust machine for medical AI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all hover:bg-white/[0.05] group">
                <div className="p-3 rounded-xl bg-white/5 w-fit mb-6 text-white group-hover:scale-110 transition-transform">
                  <f.icon size={24} weight="duotone" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ACTIVITY FEED ─────────────────────────────── */}
      <section className="py-24 bg-black relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Live Network Activity</h2>
            </div>
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 py-1 rounded-full border border-white/5">
              Polygon Mainnet
            </div>
          </div>

          <div className="space-y-3">
            {[
              { text: "AI Smart Draft generated for Pathological Batch 04", time: "Just now", hash: "0xe7fc...12ef", color: "text-[#22D3EE]" },
              { text: "LungAI Diagnostics deposited $125.00 USDC", time: "2 min ago", hash: "0x8f4e...1f0e", color: "text-[#34D399]" },
              { text: "Quality Payment distributed: $81.00 via IoU-consensus", time: "15 min ago", hash: "0x1a2b...1a2b", color: "text-[#22D3EE]" },
              { text: "Annotation hash committed by Dr. Reddy (Radiology)", time: "22 min ago", hash: "0xab3c...9f2d", color: "text-[#FCD34D]" },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="font-mono text-[10px] text-white/20 group-hover:text-white/40 transition-colors">{ev.hash}</div>
                  <div className="text-sm text-white/70">{ev.text}</div>
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase">{ev.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="py-20 border-t border-white/5 bg-black">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-12 font-medium text-white/50">
            <Link href="/docs" className="hover:text-white transition-colors no-underline flex items-center gap-2">
              <BookOpen size={18} /> Documentation
            </Link>
            <a href="/pitch.html" target="_blank" className="hover:text-white transition-colors no-underline flex items-center gap-2">
              <PresentationChart size={18} /> Pitch Deck
            </a>
            <Link href="/company/dashboard" className="hover:text-white transition-colors no-underline flex items-center gap-2">
              <Lightning size={18} /> Get Started
            </Link>
          </div>
          <div className="text-white/20 text-sm tracking-wider uppercase font-semibold">
            MediAnnote © 2026 — Polygon Mainnet
          </div>
        </div>
      </footer>
    </div>
  );
}
