"use client";

import Link from "next/link";
import { ArrowRight, Shield, Coins, Brain, Zap } from "lucide-react";

const stats = [
  { value: "2,450+", label: "Verified Doctors" },
  { value: "184K+", label: "Annotations" },
  { value: "$890K+", label: "USDC Distributed" },
  { value: "0.89", label: "Avg. IAA Score" },
];

const features = [
  {
    icon: Shield,
    title: "Verified Experts Only",
    desc: "Every annotator is a licensed medical professional with blockchain-verified credentials via Soulbound Tokens.",
  },
  {
    icon: Coins,
    title: "Instant Crypto Payments",
    desc: "Smart contract escrow ensures fair, instant payment in USDC — no intermediaries, no delays.",
  },
  {
    icon: Brain,
    title: "On-Chain Audit Trail",
    desc: "Every annotation hash is committed to Polygon. Provably immutable data provenance for regulatory compliance.",
  },
  {
    icon: Zap,
    title: "Quality Consensus",
    desc: "Inter-annotator agreement scoring ensures gold-standard annotations through multi-expert consensus.",
  },
];

const feed = [
  { type: "deposit", text: "LungAI Diagnostics deposited $125.00 USDC for Chest X-Ray batch", time: "2 min ago", hash: "0x8f4e...1f0e" },
  { type: "release", text: "Payment released: $81.00 to 2 annotators for Skin Lesion batch", time: "15 min ago", hash: "0x1a2b...1a2b" },
  { type: "annotation", text: "Annotation hash committed by Dr. Reddy (Radiology)", time: "22 min ago", hash: "0xab3c...9f2d" },
  { type: "sbt", text: "SBT minted: Dr. Morrison verified as Pathology expert", time: "1 hr ago", hash: "0xef12...45cd" },
  { type: "deposit", text: "DermVision Labs deposited $160.00 USDC for Retinal OCT batch", time: "3 hrs ago", hash: "0x7890...abcd" },
];

const feedDotColor: Record<string, string> = {
  deposit: "var(--accent-emerald)",
  release: "var(--accent-cyan)",
  sbt: "var(--accent-purple)",
  annotation: "var(--accent-amber)",
};

export default function LandingPage() {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        background: "var(--surface)",
        padding: "7rem 1.5rem 5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle gradient bleed */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(ellipse 900px 500px at 50% -10%, rgba(52,211,153,0.06) 0%, transparent 70%), " +
            "radial-gradient(ellipse 600px 400px at 90% 60%, rgba(167,139,250,0.04) 0%, transparent 70%)",
        }} />

        <div style={{ maxWidth: 960, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* Pill badge */}
          <div className="animate-fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "var(--surface-high)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "9999px",
            padding: "0.375rem 1rem",
            marginBottom: "2.5rem",
          }}>
            <span className="status-pulse accent-green" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--accent-emerald)" }}>
              Web3-Powered Medical Annotation
            </span>
          </div>

          <h1 className="display-lg animate-fade-up delay-1" style={{ marginBottom: "1.5rem" }}>
            Turn Medical Expertise<br />into{" "}
            <span style={{
              background: "linear-gradient(135deg, #FFFFFF 0%, #C6C6C6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Verified AI Gold
            </span>
          </h1>

          <p className="body-lg animate-fade-up delay-2" style={{
            maxWidth: 560, margin: "0 auto 3rem",
            color: "var(--primary-fixed)",
          }}>
            The decentralized marketplace where verified physicians annotate medical
            images for AI training — with blockchain-guaranteed payments, reputation,
            and audit trails.
          </p>

          <div className="animate-fade-up delay-3" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/doctor/dashboard" className="btn-primary" style={{ textDecoration: "none" }}>
              Join as Doctor <ArrowRight size={15} />
            </Link>
            <Link href="/company/dashboard" className="btn-secondary" style={{ textDecoration: "none" }}>
              Upload Dataset as Company
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section style={{ background: "var(--surface-low)", padding: "3rem 1.5rem" }}>
        <div style={{
          maxWidth: 960, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0",
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center", padding: "1.5rem 1rem",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div className="display-md" style={{ marginBottom: "0.25rem" }}>{s.value}</div>
              <div className="label-sm" style={{ color: "var(--primary-fixed)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────── */}
      <section style={{ background: "var(--surface)", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: "3.5rem" }}>
            <div className="label-md" style={{ color: "var(--accent-emerald)", marginBottom: "0.75rem" }}>Why MediAnnote</div>
            <h2 className="headline-md">Built for the unique needs<br />of medical AI</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card" style={{ padding: "2rem" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "0.375rem",
                    background: "var(--surface-high)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1.25rem",
                    color: "var(--on-surface)",
                  }}>
                    <Icon size={17} />
                  </div>
                  <div className="title-md" style={{ marginBottom: "0.625rem" }}>{f.title}</div>
                  <p className="body-md" style={{ color: "var(--primary-fixed)" }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIVE CHAIN FEED ─────────────────────────────── */}
      <section style={{ background: "var(--surface-low)", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
            <div>
              <div className="label-md" style={{ color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>Polygon Network</div>
              <h2 className="headline-md">Live On-Chain Activity</h2>
            </div>
            <span className="status-pulse accent-cyan" style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Syncing
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {feed.map((ev, i) => (
              <div key={i} className="card-recessed" style={{
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                    background: feedDotColor[ev.type] || "var(--primary-fixed)",
                  }} />
                  <span className="body-md" style={{ color: "var(--on-surface-variant)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ev.text}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <span className="hash-chip">{ev.hash}</span>
                  <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>{ev.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{
        background: "var(--surface)",
        padding: "2rem 1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        textAlign: "center",
      }}>
        <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>
          MediAnnote © 2026 — Polygon Mumbai Testnet
        </span>
      </footer>
    </div>
  );
}
