"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const { isConnected } = useAccount();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="glass-card p-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="mt-1 text-sm text-gray-400">
                            Sign in to MediAnnote
                        </p>
                    </div>

                    {/* Email form */}
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="doctor@hospital.com"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-400">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        <Link
                            href="/doctor/dashboard"
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                            Sign In
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-xs text-gray-500">or connect wallet</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    {/* Wallet connect */}
                    <div className="flex justify-center">
                        <ConnectKitButton />
                    </div>

                    {isConnected && (
                        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-sm text-emerald-400">
                            ✓ Wallet connected! You can now access the platform.
                        </div>
                    )}

                    {/* Links */}
                    <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
                        <Link href="/doctor/dashboard" className="hover:text-emerald-400">
                            Doctor Portal →
                        </Link>
                        <Link href="/company/dashboard" className="hover:text-cyan-400">
                            Company Portal →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
