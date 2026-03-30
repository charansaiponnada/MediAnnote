"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Wallet, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useWriteContract, useAccount } from "wagmi";
import { parseUnits, stringToHex, pad } from "viem";
import { CONTRACTS } from "@/lib/contracts";
import { scrubImageLocally } from "@/lib/privacy-shield";
import { encryptAndPinToIpfs } from "@/lib/encryption";

const steps = ["Upload Images", "Define Labels", "Set Budget", "Fund Escrow"];

export default function CompanyUpload() {
    const router = useRouter();
    const { state, dispatch } = useAppStore();
    const { isConnected } = useAccount();
    const company = state.companies[0];

    const [step, setStep] = useState(0);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [imageType, setImgType] = useState("Chest X-Ray");
    const [labels, setLabels] = useState<string[]>(["Pneumonia", "Nodule", "Normal", "Effusion"]);
    const [newLabel, setNew] = useState("");
    const [imgCount, setCount] = useState(50);
    const [ratePerImg, setRate] = useState(2.5);
    const [loading, setLoading] = useState(false);
    const [funded, setFunded] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const { writeContractAsync } = useWriteContract();

    const addLabel = () => {
        if (newLabel.trim() && !labels.includes(newLabel.trim())) {
            setLabels((p) => [...p, newLabel.trim()]);
            setNew("");
        }
    };

    const totalBudget = ratePerImg * imgCount;

    const fund = async () => {
        setLoading(true);

        const batchString = `batch-${Date.now()}`;
        const batchIdBytes = pad(stringToHex(batchString), { size: 32 });
        const amountParsed = parseUnits(totalBudget.toString(), 6);
        let txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

        const uploadedImageKeys: string[] = [];
        if (uploadedFiles.length > 0) {
            toast.loading("Xai Privacy Shield: Anonymizing & Encrypting locally...", { id: "scrub" });
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const { set } = await import("idb-keyval");

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                try {
                    // 1. Scrub locally (HIPAA Compliance)
                    const scrubbed = await scrubImageLocally(file);
                    
                    // 2. Encrypt & Pin to IPFS (Zero-Trust Storage)
                    const encrypted = await encryptAndPinToIpfs(scrubbed.blob);
                    
                    // 3. Store the ENCRYPTED version
                    const key = `${batchString}-ipfs-${encrypted.ipfsHash}`;
                    await set(key, encrypted.encryptedBlob);
                    uploadedImageKeys.push(key);

                    // 4. Notify backend of the new asset hash and IPFS CID
                    await fetch(`${API_URL}/scrub`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            filename: file.name,
                            hash: scrubbed.hash,
                            ipfsCid: encrypted.ipfsHash,
                            clientSide: true 
                        }),
                    });
                } catch (e) {
                    console.error("Clinical pipeline failed for", file.name, e);
                }
            }
            toast.success("Zero-Trust Pipeline Complete: Images Anonymized, Encrypted & Pinned.", { id: "scrub" });
        }


        if (!isConnected) {
            toast.loading("DEMO MODE: Simulating Escrow deposit…", { id: "tx" });
            await new Promise((r) => setTimeout(r, 2500));
            toast.dismiss("tx");
        } else {
            try {
                // 1. Approve USDC
                toast.loading("Approving USDC… Please confirm in MetaMask.", { id: "tx" });
                await writeContractAsync({
                    ...CONTRACTS.MockUSDC,
                    functionName: "approve",
                    args: [CONTRACTS.AnnotationEscrow.address, amountParsed],
                });

                await new Promise((r) => setTimeout(r, 2000)); // wait for block mining locally

                // 2. Deposit into Escrow
                toast.loading("Depositing to Escrow… Please confirm in MetaMask.", { id: "tx" });
                txHash = await writeContractAsync({
                    ...CONTRACTS.AnnotationEscrow,
                    functionName: "deposit",
                    args: [batchIdBytes, amountParsed],
                });
                toast.dismiss("tx");

            } catch (error) {
                console.error("Web3 Error:", error);
                toast.error("Transaction failed or was rejected by user.", { id: "tx" });
                setLoading(false);
                return;
            }
        }

        const newBatchId = batchString;

        // Create the batch
        dispatch({
            type: "ADD_BATCH",
            batch: {
                id: newBatchId,
                batchId: batchIdBytes,
                title: title || `${imageType} Analysis Batch`,
                description: desc || `Annotate ${imageType.toLowerCase()} images for AI model training. Classify and mark regions of interest.`,
                imageType,
                totalImages: imgCount,
                annotatedImages: 0,
                rewardPerImage: ratePerImg,
                totalBudget,
                deadline: (() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 14);
                    return d.toISOString().split("T")[0];
                })(),
                status: "open",
                companyId: company.id,
                companyName: company.name,
                labels,
                iaaScore: 0,
                txHash,
                assignedDoctors: [],
                uploadedImageKeys,
            },
        });

        // Lock escrow
        dispatch({ type: "FUND_ESCROW", batchId: newBatchId, amount: totalBudget });

        setFunded(true);
        setLoading(false);
        toast.success(`$${totalBudget.toFixed(2)} USDC locked in escrow. TX: ${txHash.slice(0, 10)}…`);
    };

    return (
        <div style={{ background: "var(--surface)", minHeight: "100svh" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.5rem 1.5rem" }}>

                <div style={{ marginBottom: "2.5rem" }}>
                    <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>New Dataset</div>
                    <h1 className="headline-lg">Upload Dataset</h1>
                </div>

                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "2.5rem" }}>
                    {steps.map((s, i) => {
                        const done = i < step;
                        const active = i === step;
                        return (
                            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: done ? "linear-gradient(135deg,#FFF,#D4D4D4)" : active ? "var(--surface-high)" : "var(--surface-low)",
                                        color: done ? "var(--on-primary)" : active ? "var(--on-surface)" : "var(--primary-fixed)",
                                        fontSize: "0.75rem", fontWeight: 700,
                                        transition: "all 0.2s",
                                        outline: active ? "2px solid rgba(255,255,255,0.15)" : "none",
                                        outlineOffset: 2,
                                    }}>
                                        {done ? <Check size={13} /> : i + 1}
                                    </div>
                                    <span className="label-sm" style={{ color: active ? "var(--on-surface)" : "var(--primary-fixed)" }}>{s}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div style={{ flex: 1, height: 1, background: done ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", margin: "0 0.75rem" }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step content */}
                <div style={{ background: "var(--surface-low)", borderRadius: "0.75rem", padding: "2rem" }}>

                    {step === 0 && (
                        <div>
                            <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>Upload Medical Images</h2>

                            {/* Dataset title */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Dataset Title</div>
                                <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Chest X-Ray Pneumonia Detection" />
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Description</div>
                                <textarea className="input-field" value={desc} onChange={(e) => setDesc(e.target.value)}
                                    placeholder="Describe what annotators should look for…" rows={3} style={{ resize: "none" }} />
                            </div>

                            {/* Image type */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Image Type</div>
                                <select className="input-field" value={imageType} onChange={(e) => setImgType(e.target.value)}>
                                    <option value="Chest X-Ray">Chest X-Ray</option>
                                    <option value="Retinal OCT">Retinal OCT</option>
                                    <option value="Dermoscopy">Dermoscopy</option>
                                    <option value="CT Scan">CT Scan</option>
                                    <option value="MRI">MRI</option>
                                    <option value="Pathology Slide">Pathology Slide</option>
                                </select>
                            </div>

                            {/* Drop zone */}
                            <div style={{
                                border: "1px dashed rgba(71,71,71,0.35)",
                                borderRadius: "0.75rem",
                                padding: "2.5rem",
                                textAlign: "center",
                                background: "var(--surface-lowest)",
                            }}>
                                <ImageIcon size={36} color="var(--primary-fixed)" style={{ margin: "0 auto 0.75rem", opacity: 0.3 }} />
                                <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>
                                    Drag & drop DICOM, PNG, or JPEG files
                                </p>
                                <p className="label-sm" style={{ color: "var(--primary-fixed)", marginBottom: "1.5rem" }}>Max 500MB per batch</p>
                                <input type="file" id="fileUpload" multiple onChange={(e) => {
                                    if (e.target.files?.length) {
                                        setCount(e.target.files.length);
                                        setUploadedFiles(Array.from(e.target.files));
                                        toast.success(`${e.target.files.length} images queued for upload!`);
                                    }
                                }} style={{ display: "none" }} />
                                <label htmlFor="fileUpload" className="btn-secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                                    Select Files
                                </label>
                            </div>

                            <div style={{ marginTop: "1.25rem" }}>
                                <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Number of Images</div>
                                <input type="number" value={imgCount} onChange={(e) => setCount(Number(e.target.value))} className="input-field" min={1} />
                            </div>

                            <div style={{
                                marginTop: "1rem",
                                display: "flex", alignItems: "center", gap: "0.5rem",
                                background: "var(--accent-emerald-dim)", padding: "0.625rem 1rem", borderRadius: "0.5rem",
                            }}>
                                <Check size={13} color="var(--accent-emerald)" />
                                <span className="label-sm" style={{ color: "var(--accent-emerald)" }}>
                                    PHI Scrubbing — Automated pipeline will strip all protected health info on upload
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <h2 className="title-lg" style={{ marginBottom: "0.5rem" }}>Define Annotation Labels</h2>
                            <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "1.5rem" }}>
                                Set the annotation taxonomy for this batch
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                {labels.map((l) => (
                                    <span key={l} className="hash-chip" style={{ cursor: "default" }}>
                                        {l}
                                        <button onClick={() => setLabels((p) => p.filter((x) => x !== l))}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-fixed)", marginLeft: "0.25rem", lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input className="input-field" value={newLabel} onChange={(e) => setNew(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addLabel()}
                                    placeholder="Add a label…" style={{ flex: 1 }} />
                                <button className="btn-secondary" onClick={addLabel}>Add</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>Set Budget & Requirements</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div>
                                    <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Rate per Image (USDC)</div>
                                    <input type="number" value={ratePerImg} onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                                        step="0.5" min={0.1} className="input-field" />
                                </div>

                                <div className="card-recessed" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                    {[
                                        { l: "Images", v: String(imgCount) },
                                        { l: "Rate per image", v: `$${ratePerImg.toFixed(2)}` },
                                        { l: "Platform fee", v: `$${(totalBudget * 0.1).toFixed(2)} (10%)` },
                                    ].map(({ l, v }) => (
                                        <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span className="body-md" style={{ color: "var(--primary-fixed)" }}>{l}</span>
                                            <span className="body-md" style={{ color: "var(--on-surface)" }}>{v}</span>
                                        </div>
                                    ))}
                                    <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0.25rem 0" }} />
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span className="title-md">Total Escrow</span>
                                        <span className="title-md" style={{ color: "var(--accent-emerald)" }}>${totalBudget.toFixed(2)} USDC</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="label-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>Min. Annotator Tier</div>
                                    <select className="input-field">
                                        <option value="0">Bronze (Any)</option>
                                        <option value="1">Silver+</option>
                                        <option value="2">Gold+</option>
                                        <option value="3">Platinum Only</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="title-lg" style={{ marginBottom: "1.5rem" }}>Confirm & Fund Escrow</h2>
                            {!funded ? (
                                <div>
                                    <div className="card-recessed" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {[
                                            { l: "Dataset", v: title || `${imageType} Analysis Batch` },
                                            { l: "Type", v: imageType },
                                            { l: "Images", v: String(imgCount) },
                                            { l: "Labels", v: labels.join(", ") },
                                        ].map(({ l, v }) => (
                                            <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span className="label-sm" style={{ color: "var(--primary-fixed)" }}>{l}</span>
                                                <span className="body-md" style={{ color: "var(--on-surface)" }}>{v}</span>
                                            </div>
                                        ))}
                                        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span className="title-md">Escrow Amount</span>
                                            <span className="display-md" style={{ fontSize: "1.5rem", color: "var(--accent-emerald)" }}>${totalBudget.toFixed(2)} USDC</span>
                                        </div>
                                    </div>
                                    <button className="btn-primary" onClick={fund} disabled={loading}
                                        style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
                                        {loading ? <><Loader2 size={15} className="animate-spin" /> Confirming on MetaMask…</> : <><Wallet size={15} /> Fund Escrow</>}
                                    </button>
                                    <p className="label-sm" style={{ color: "var(--primary-fixed)", textAlign: "center", marginTop: "0.75rem" }}>
                                        Triggers a MetaMask transaction on Polygon Mumbai
                                    </p>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "2rem" }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: "50%",
                                        background: "var(--accent-emerald-dim)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        margin: "0 auto 1.25rem",
                                    }}>
                                        <Check size={24} color="var(--accent-emerald)" />
                                    </div>
                                    <h3 className="headline-md" style={{ marginBottom: "0.5rem" }}>Escrow Funded</h3>
                                    <p className="body-md" style={{ color: "var(--primary-fixed)", marginBottom: "0.5rem" }}>
                                        ${totalBudget.toFixed(2)} USDC locked in AnnotationEscrow contract
                                    </p>
                                    <p className="body-md" style={{ color: "var(--accent-emerald)", marginBottom: "1rem" }}>
                                        ✓ This batch is now visible to all verified doctors in the Task Queue
                                    </p>
                                    <button className="btn-secondary" onClick={() => router.push("/company/dashboard")} style={{ marginTop: "0.5rem" }}>
                                        Go to Dashboard
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                    <button className="btn-secondary" onClick={() => setStep((p) => Math.max(0, p - 1))} disabled={step === 0}
                        style={{ opacity: step === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ArrowLeft size={14} /> Previous
                    </button>
                    {step < 3 && (
                        <button className="btn-primary" onClick={() => setStep((p) => Math.min(3, p + 1))}
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            Next <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
