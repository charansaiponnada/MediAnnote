"use client";

import { Shield, Brain, Zap, Globe, Lock, BookOpen, Layers, Terminal as TerminalIcon, Coins, Award } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "rgba(5,5,5,0.8)",
        backdropFilter: "blur(12px)",
        zIndex: 100
      }}>
        <Link href="/" style={{ textDecoration: "none", color: "white", fontWeight: 800, fontSize: "1.1rem" }}>
          MEDIANNOTE <span style={{ color: "var(--primary-fixed)", fontWeight: 400, fontSize: "0.8rem" }}>DOCS</span>
        </Link>
        <Link href="/doctor/dashboard" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.8rem", padding: "0.4rem 1rem" }}>
          Back to Platform
        </Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "240px 1fr", gap: "4rem" }}>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "7rem", height: "fit-content" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.75rem", textTransform: "uppercase" }}>Introduction</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a href="#overview" style={{ color: "var(--accent-cyan)", fontSize: "0.9rem", textDecoration: "none" }}>Platform Overview</a>
                <a href="#vision" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>Our Vision</a>
              </nav>
            </div>
            <div>
              <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.75rem", textTransform: "uppercase" }}>Core Architecture</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a href="#system" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>System Ecosystem</a>
                <a href="#ml" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>Xai ML micro-service</a>
                <a href="#blockchain" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>Solidity Contracts</a>
              </nav>
            </div>
            <div>
              <div className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "0.75rem", textTransform: "uppercase" }}>Features</div>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <a href="#consensus" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>Consensus Engine</a>
                <a href="#sbt" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>Soulbound Identity</a>
                <a href="#provenance" style={{ color: "var(--on-surface-variant)", fontSize: "0.9rem", textDecoration: "none" }}>On-chain Provenance</a>
              </nav>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main style={{ color: "var(--on-surface-variant)" }}>
          <section id="overview" style={{ marginBottom: "5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <BookOpen size={20} color="var(--accent-cyan)" />
              <h1 className="headline-md" style={{ margin: 0 }}>Platform Overview</h1>
            </div>
            <p className="body-lg" style={{ color: "var(--primary-fixed)", lineHeight: 1.6 }}>
              MediAnnote is a decentralized marketplace that bridges the gap between high-fidelity medical imaging
              and the next generation of AI diagnostics. We solve the "Trust Bottleneck" by ensuring every
              annotation is performed by a verified physician and secured on the Polygon blockchain.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
              <div className="box" style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem", color: "var(--accent-emerald)" }}><Globe size={18} /></div>
                <h3 className="title-md" style={{ marginBottom: "0.5rem" }}>Decentralized Escrow</h3>
                <p className="body-sm">Trustless fund distribution using smart contracts. No middlemen.</p>
              </div>
              <div className="box" style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem", color: "var(--accent-cyan)" }}><Zap size={18} /></div>
                <h3 className="title-md" style={{ marginBottom: "0.5rem" }}>AI-Assisted Efficiency</h3>
                <p className="body-sm">Xai-powered drafting tools that reduce doctor workload by 40%.</p>
              </div>
            </div>
          </section>

          <section id="system" style={{ marginBottom: "5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Layers size={20} color="var(--accent-cyan)" />
              <h2 className="headline-sm" style={{ margin: 0 }}>System Ecosystem</h2>
            </div>
            <p className="body-md" style={{ marginBottom: "2rem" }}>
              MediAnnote utilizes a heterogeneous polyglot architecture to handle medical data privacy and heavy AI compute.
            </p>
            {/* Simple SVG diagram */}
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0.75rem", padding: "2rem", border: "1px solid rgba(255,255,255,0.05)" }}>
              <svg viewBox="0 0 800 300" style={{ width: "100%", height: "auto" }}>
                <rect x="50" y="50" width="200" height="60" rx="8" fill="rgba(0, 229, 255, 0.1)" stroke="var(--accent-cyan)" />
                <text x="150" y="85" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">Doctor Portal (Next.js)</text>

                <path d="M250 80 L350 80" stroke="var(--primary-fixed)" strokeDasharray="4" />

                <rect x="350" y="50" width="200" height="180" rx="8" fill="rgba(0, 230, 118, 0.1)" stroke="var(--accent-emerald)" />
                <text x="450" y="85" fill="var(--accent-emerald)" fontSize="14" textAnchor="middle" fontWeight="bold">ML-Service (FastAPI)</text>
                <text x="450" y="120" fill="var(--primary-fixed)" fontSize="12" textAnchor="middle">Xai Smart Drafting</text>
                <text x="450" y="150" fill="var(--primary-fixed)" fontSize="12" textAnchor="middle">PHI Scrubbing</text>
                <text x="450" y="180" fill="var(--primary-fixed)" fontSize="12" textAnchor="middle">Consensus Logic</text>

                <path d="M550 80 L650 80" stroke="var(--primary-fixed)" strokeDasharray="4" />

                <rect x="650" y="50" width="100" height="200" rx="8" fill="rgba(163, 163, 163, 0.1)" stroke="var(--primary-fixed)" />
                <text x="700" y="85" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">Polygon</text>
                <text x="700" y="120" fill="var(--primary-fixed)" fontSize="11" textAnchor="middle">Escrow.sol</text>
                <text x="700" y="150" fill="var(--primary-fixed)" fontSize="11" textAnchor="middle">Identity.sol</text>
                <text x="700" y="180" fill="var(--primary-fixed)" fontSize="11" textAnchor="middle">USDC.sol</text>
              </svg>
            </div>
          </section>

          <section id="consensus" style={{ marginBottom: "5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Zap size={20} color="var(--accent-cyan)" />
              <h2 className="headline-sm" style={{ margin: 0 }}>Consensus Reward Engine</h2>
            </div>
            <p className="body-md">
              We don't rely on subjective approval. Payments are calculated using mathematical consensus:
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <div className="card-recessed" style={{ padding: "1.5rem" }}>
                <div className="title-md" style={{ color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>IoU (Intersection over Union)</div>
                <p className="body-sm">
                  Every annotation is compared against multiple experts. The overlap is computed to generate an agreement score.
                  A physician must exceed a 0.70 threshold to trigger reputation growth.
                </p>
                <div style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "0.5rem",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  color: "var(--accent-emerald)"
                }}>
                  Score = ( Area of Overlap ) / ( Area of Union )
                </div>
              </div>
            </div>
          </section>

          <section id="blockchain" style={{ marginBottom: "5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <Shield size={20} color="var(--accent-cyan)" />
              <h2 className="headline-sm" style={{ margin: 0 }}>Smart Contracts API</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="title-md" style={{ fontSize: "0.9rem" }}>AnnotationEscrow.sol</span>
                  <span className="hash-chip" style={{ fontSize: "0.7rem" }}>0xe7f1...0512</span>
                </div>
                <p className="body-sm">Handles multi-sig-like deposit and atomic distribution with dynamic BPS splits.</p>
              </div>
              <div className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span className="title-md" style={{ fontSize: "0.9rem" }}>DoctorSBT.sol</span>
                  <span className="hash-chip" style={{ fontSize: "0.7rem" }}>0x9fE4...fa6e</span>
                </div>
                <p className="body-sm">Non-transferable ERC-721 token representing verified specialty and performance reputation.</p>
              </div>
            </div>
          </section>

          <section id="provenance" style={{ paddingBottom: "5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <TerminalIcon size={20} color="var(--accent-cyan)" />
              <h2 className="headline-sm" style={{ margin: 0 }}>On-chain Provenance</h2>
            </div>
            <p className="body-md">
              To meet FDA 510(k) standards, every insight (manually or AI-generated) is hashed
              and committed to the Polygon chain *before* final export.
            </p>
            <div className="box" style={{ marginTop: "1.5rem", padding: "1.5rem", borderStyle: "dashed", borderColor: "var(--accent-cyan)" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ height: 40, width: 4, background: "var(--accent-cyan)", borderRadius: 2 }} />
                <div>
                  <div className="label-sm" style={{ color: "var(--accent-cyan)", textTransform: "uppercase" }}>Audit Snapshot</div>
                  <div style={{ marginTop: "0.25rem", color: "white", fontSize: "0.85rem", fontFamily: "monospace" }}>
                    SHA256: 8f4e24a...1f0e8f4e24a...
                  </div>
                  <div className="label-sm" style={{ marginTop: "0.25rem" }}>Timestamped via Polygon Block #481204</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "3rem 2rem", textAlign: "center" }}>
        <p className="label-sm" style={{ color: "var(--primary-fixed)" }}>
          MediAnnote Technical Documentation — Built for Hackathon Final Round 2026
        </p>
      </footer>
    </div>
  );
}
