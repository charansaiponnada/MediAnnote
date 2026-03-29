"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { 
    User, 
    Briefcase, 
    FileUp, 
    CheckCircle, 
    ArrowRight, 
    ArrowLeft,
    Stethoscope,
    Star,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAppStore } from "@/lib/store";

const steps = ["Personal Info", "Experience", "Documents", "Verification"];

export default function DoctorRegistration() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { dispatch } = useAppStore();
    
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [specialty, setSpecialty] = useState("Radiology");
    const [experience, setExperience] = useState(5);
    const [selfRating, setSelfRating] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isConnected) {
        router.push("/login");
        return null;
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        toast.loading("Encrypting documents and submitting to on-chain registry...", { id: "reg" });
        
        // Simulate blockchain transaction
        await new Promise(r => setTimeout(r, 3000));
        
        // Calculate initial tier based on experience and rating
        let tier = 0; // Bronze
        if (experience >= 10 && selfRating === 5) tier = 4; // Elite
        else if (experience >= 8) tier = 3; // Platinum
        else if (experience >= 5) tier = 2; // Gold
        else if (experience >= 2) tier = 1; // Silver

        const newDoctor = {
            id: `doc-${Date.now()}`,
            name,
            wallet: address || "",
            specialty,
            tier,
            reputationScore: 50 + (selfRating * 5),
            annotationCount: 0,
            earnings: 0,
            avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            verified: false, // Wait for admin
            experienceYears: experience,
            selfRating
        };

        dispatch({ 
            type: "ADD_ACTIVITY", 
            item: { 
                type: "sbt", 
                message: `Registration submitted for ${name}. Pending verification.`,
                time: "Just now"
            } 
        });

        toast.success("Registration Successful! Redirecting to dashboard...", { id: "reg" });
        router.push("/doctor/dashboard");
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Expert Onboarding</h1>
                        <p className="text-gray-400 mt-1">Join the decentralized medical network.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="mb-12 flex items-center gap-4">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-1 items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all
                                ${i < step ? 'bg-emerald-500 border-emerald-500 text-white' : 
                                  i === step ? 'border-emerald-500 text-emerald-500 ring-4 ring-emerald-500/10' : 
                                  'border-white/10 text-gray-500'}`}>
                                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                            </div>
                            <span className={`hidden text-xs font-semibold sm:block ${i === step ? 'text-white' : 'text-gray-500'}`}>
                                {s}
                            </span>
                            {i < steps.length - 1 && <div className="h-px flex-1 bg-white/5" />}
                        </div>
                    ))}
                </div>

                <div className="glass-card p-8 min-h-[400px] flex flex-col">
                    {/* Step 0: Personal */}
                    {step === 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Personal Identity</h2>
                                <p className="text-sm text-gray-400">How should we address you on the platform?</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-400 uppercase tracking-wider">Full Legal Name (with Title)</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Dr. Sarah Jenkins"
                                        className="input-field py-3 px-4 text-base"
                                    />
                                </div>
                                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-3 text-sm text-emerald-400">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>Identity bound to your connected wallet address.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Experience */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Professional Background</h2>
                                <p className="text-sm text-gray-400">Your expertise determines your job opportunities.</p>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-gray-400 uppercase tracking-wider">Medical Specialty</label>
                                    <select 
                                        className="input-field"
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                    >
                                        <option>Radiology</option>
                                        <option>Pathology</option>
                                        <option>Dermatology</option>
                                        <option>Ophthalmology</option>
                                        <option>Cardiology</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Years of Experience</label>
                                        <span className="text-emerald-400 font-bold">{experience} Years</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="30"
                                        value={experience}
                                        onChange={(e) => setExperience(parseInt(e.target.value))}
                                        className="w-full accent-emerald-500"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Self-Rated Tech Proficiency</label>
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} size={14} className={i <= selfRating ? "fill-amber-400 text-amber-400" : "text-gray-600"} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {[1,2,3,4,5].map(i => (
                                            <button 
                                                key={i}
                                                onClick={() => setSelfRating(i)}
                                                className={`py-2 text-xs font-bold rounded-lg border transition-all
                                                    ${selfRating === i ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                            >
                                                {i}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Documents */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                                <FileUp className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Credential Verification</h2>
                                <p className="text-sm text-gray-400">Upload your license or certifications for zero-knowledge verification.</p>
                            </div>
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-emerald-500/50 transition-colors group cursor-pointer">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all">
                                    <Briefcase className="h-8 w-8" />
                                </div>
                                <p className="text-sm font-medium text-white mb-1">Drag & drop medical license</p>
                                <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 10MB)</p>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                <ShieldCheck className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                <p className="text-[10px] text-amber-500 leading-tight uppercase tracking-widest font-bold">
                                    Privacy Note: Documents are encrypted locally and hashed on IPFS. Admins only see verification status.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Finalizing */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-8">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-6">
                                <CheckCircle className="h-10 w-10 animate-bounce" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Ready to Join?</h2>
                                <p className="text-gray-400 mt-2">By clicking submit, you agree to the on-chain expert agreement and reputation system.</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-6 text-left space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Assigned Tier:</span>
                                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Calculating...</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Access Level:</span>
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Verified Expert</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Specialty:</span>
                                    <span className="text-xs font-bold text-white uppercase tracking-widest">{specialty}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-auto pt-8 flex justify-between gap-4">
                        {step > 0 && (
                            <button 
                                onClick={() => setStep(s => s - 1)}
                                className="btn-secondary flex-1 justify-center py-3"
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="h-4 w-4" /> Previous
                            </button>
                        )}
                        <button 
                            onClick={step === steps.length - 1 ? handleSubmit : () => setStep(s => s + 1)}
                            disabled={(step === 0 && !name) || isSubmitting}
                            className={`btn-primary ${step === 0 ? 'w-full' : 'flex-1'} justify-center py-3`}
                        >
                            {isSubmitting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                            ) : step === steps.length - 1 ? (
                                "Submit Application"
                            ) : (
                                <>Next <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
