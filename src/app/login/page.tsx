"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { 
    Activity, 
    ArrowRight, 
    Stethoscope, 
    Building2, 
    ShieldCheck,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { state, dispatch } = useAppStore();
    const [selectedRole, setSelectedRole] = useState<"doctor" | "company" | "admin" | null>(null);

    useEffect(() => {
        if (isConnected && selectedRole) {
            dispatch({ type: "SET_ROLE", role: selectedRole });
            
            // Redirect based on role
            if (selectedRole === "doctor") {
                // Check if doctor exists in mock data
                const doctor = state.doctors.find(d => d.wallet.toLowerCase() === address?.toLowerCase());
                if (doctor) {
                    router.push("/doctor/dashboard");
                } else {
                    router.push("/register/doctor");
                }
            } else if (selectedRole === "company") {
                router.push("/company/dashboard");
            } else if (selectedRole === "admin") {
                router.push("/admin");
            }
        }
    }, [isConnected, selectedRole, address, dispatch, router, state.doctors]);

    const roles = [
        {
            id: "doctor",
            title: "I am a Doctor",
            description: "Annotate medical images and earn USDC based on expertise.",
            icon: Stethoscope,
            color: "emerald"
        },
        {
            id: "company",
            title: "I am a Company",
            description: "Request high-quality medical datasets for AI training.",
            icon: Building2,
            color: "cyan"
        },
        {
            id: "admin",
            title: "Administrator",
            description: "Verify medical credentials and manage platform health.",
            icon: ShieldCheck,
            color: "amber"
        }
    ] as const;

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
            <div className="w-full max-w-4xl">
                <div className="mb-12 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-xl shadow-emerald-500/20">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Trust Layer</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Select your portal to access the MediAnnote ecosystem.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        
                        return (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRole(role.id)}
                                className={`group relative flex flex-col items-start p-8 rounded-2xl border transition-all duration-300 text-left
                                    ${isSelected 
                                        ? `border-${role.color}-500/50 bg-${role.color}-500/5 ring-2 ring-${role.color}-500/20` 
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                            >
                                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300
                                    ${isSelected 
                                        ? `bg-${role.color}-500 text-white shadow-lg shadow-${role.color}-500/40` 
                                        : `bg-white/10 text-gray-400 group-hover:bg-white/20 group-hover:text-white`}`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {role.description}
                                </p>
                                
                                {isSelected && (
                                    <div className={`mt-6 flex items-center gap-2 text-sm font-semibold text-${role.color}-400 animate-in fade-in slide-in-from-bottom-2`}>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Role Selected
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-12 flex flex-col items-center justify-center">
                    <div className={`transition-all duration-500 transform ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="glass-card p-8 flex flex-col items-center gap-6 w-full max-w-md border-emerald-500/20">
                            <div className="text-center">
                                <h4 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h4>
                                <p className="text-xs text-gray-500">
                                    Your wallet is your identity. We use blockchain to verify {selectedRole === 'doctor' ? 'credentials' : 'access'}.
                                </p>
                            </div>
                            <ConnectKitButton />
                            
                            {selectedRole === 'doctor' && (
                                <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest">
                                    New here? You'll be asked to register after connecting.
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {!selectedRole && (
                        <div className="text-gray-600 text-sm italic animate-pulse">
                            Please select a role above to continue
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
