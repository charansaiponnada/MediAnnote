"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import {
    Activity, LayoutDashboard, ListTodo, User,
    Upload, Shield, Menu, X, Book,
} from "lucide-react";
import {
    Sun,
    CaretDown,
    Lightning,
    BookOpen,
    PresentationChart,
    Users,
    HouseLine
} from "@phosphor-icons/react";
import { useState } from "react";

const doctorLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/tasks", label: "Tasks", icon: ListTodo },
    { href: "/doctor/disputes", label: "Medical Court", icon: Shield },
    { href: "/doctor/profile", label: "Profile", icon: User },
];
const companyLinks = [
    { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/company/upload", label: "Upload Dataset", icon: Upload },
];

export function Navbar() {
    const pathname = usePathname();
    const isLanding = pathname === "/";
    const [open, setOpen] = useState(false);

    if (pathname.includes("/annotate/")) return null;

    const isDoctor = pathname.startsWith("/doctor");
    const isCompany = pathname.startsWith("/company");
    const isAdmin = pathname.startsWith("/admin");
    const links = isDoctor ? doctorLinks : isCompany ? companyLinks : [];

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isLanding ? "bg-transparent h-20" : "bg-[#0b0b0b]/80 backdrop-blur-xl h-16 border-b border-white/5"
                }`}
        >
            <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
                {/* Left Section: Logo */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group transition-all text-white no-underline">
                        <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                            <Sun size={20} weight="bold" color="white" />
                        </div>
                        <span className="font-instrument-sans font-bold text-xl tracking-tight">
                            MediAnnote
                        </span>
                    </Link>

                    {/* Center Section (Landing Page specific) */}
                    {isLanding && (
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="/products" className="font-instrument-sans text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1 no-underline">
                                Products <CaretDown size={14} />
                            </Link>
                            <Link href="/stories" className="font-instrument-sans text-sm font-medium text-white/80 hover:text-white transition-colors no-underline">
                                Customer Stories
                            </Link>
                            <Link href="/docs" className="font-instrument-sans text-sm font-medium text-white/80 hover:text-white transition-colors no-underline">
                                Resources
                            </Link>
                            <Link href="/pricing" className="font-instrument-sans text-sm font-medium text-white/80 hover:text-white transition-colors no-underline">
                                Pricing
                            </Link>
                        </div>
                    )}

                    {/* Dashboard Links */}
                    {!isLanding && (
                        <div className="hidden md:flex items-center gap-1">
                            {links.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all no-underline ${pathname === href ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                                        }`}
                                >
                                    <Icon size={14} />
                                    {label}
                                </Link>
                            ))}
                            {isAdmin && (
                                <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 bg-white/10 text-white no-underline">
                                    <Shield size={14} /> Admin
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    {isLanding ? (
                        <>
                            <Link href="/demo" className="hidden sm:block font-instrument-sans text-sm font-medium text-white/80 hover:text-white transition-colors no-underline">
                                Book A Demo
                            </Link>
                            <Link href="/doctor/dashboard" className="bg-white text-black text-sm px-5 py-2.5 rounded-full font-semibold hover:bg-white/90 transition-all no-underline">
                                Get Started
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/50 hover:text-white no-underline">
                                <HouseLine size={20} />
                            </Link>
                            <div className="flex items-center bg-white/[0.03] rounded-full p-1 border border-white/5 backdrop-blur-md">
                                {[
                                    { label: "Doctor", href: "/doctor/dashboard", active: isDoctor },
                                    { label: "Company", href: "/company/dashboard", active: isCompany },
                                    { label: "Admin", href: "/admin", active: isAdmin },
                                ].map(({ label, href, active }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.1em] uppercase transition-all no-underline ${active ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "text-white/20 hover:text-white/40"
                                            }`}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </div>
                            <ConnectKitButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
