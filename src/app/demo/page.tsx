"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoRedirect() {
    const router = useRouter();

    useEffect(() => {
        // In a real app, this might show a calendar or contact form
        // For the hackathon demo, we redirect to the doctor dashboard to show the core app
        setTimeout(() => {
            router.push("/doctor/dashboard");
        }, 1500);
    }, [router]);

    return (
        <div className="bg-black min-h-screen flex items-center justify-center font-instrument-sans text-white">
            <div className="text-center">
                <Loader2 size={48} className="animate-spin text-[#3054ff] mx-auto mb-6" />
                <h1 className="text-3xl font-semibold mb-4 text-gradient">Preparing Your Demo Environment</h1>
                <p className="text-white/40 tracking-widest uppercase text-xs font-bold">Initializing Expert Terminal...</p>
            </div>
        </div>
    );
}
