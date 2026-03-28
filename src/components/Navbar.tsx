"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import {
    Activity, LayoutDashboard, ListTodo, User,
    Upload, Shield, Menu, X, Book,
} from "lucide-react";
import { useState } from "react";

const doctorLinks = [
    { href: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/tasks", label: "Tasks", icon: ListTodo },
    { href: "/doctor/profile", label: "Profile", icon: User },
];
const companyLinks = [
    { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/company/upload", label: "Upload Dataset", icon: Upload },
];

export function Navbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    if (pathname.includes("/annotate/")) return null;

    const isDoctor = pathname.startsWith("/doctor");
    const isCompany = pathname.startsWith("/company");
    const isAdmin = pathname.startsWith("/admin");
    const links = isDoctor ? doctorLinks : isCompany ? companyLinks : [];

    return (
        <nav className="nav-root" style={{ height: 56 }}>
            <div style={{
                maxWidth: 1280,
                margin: "0 auto",
                padding: "0 1.5rem",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "2rem",
            }}>
                {/* Logo */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
                    <div style={{
                        width: 32, height: 32,
                        background: "linear-gradient(135deg, #FFFFFF 0%, #D4D4D4 100%)",
                        borderRadius: "0.375rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Activity size={17} color="#1A1C1C" strokeWidth={2.5} />
                    </div>
                    <span style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 800,
                        fontSize: "0.9375rem",
                        color: "var(--primary)",
                        letterSpacing: "-0.01em",
                    }}>
                        MediAnnote
                    </span>
                </Link>

                <Link href="/docs" className="nav-link" style={{ textDecoration: "none", marginLeft: "-1rem" }}>
                    <Book size={14} />
                    Docs
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flex: 1 }}>
                    {links.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`nav-link${pathname === href ? " active" : ""}`}
                            style={{ textDecoration: "none" }}
                        >
                            <Icon size={14} />
                            {label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link href="/admin" className="nav-link active" style={{ textDecoration: "none" }}>
                            <Shield size={14} />
                            Admin
                        </Link>
                    )}
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {/* Role switcher */}
                    {pathname !== "/" && !pathname.startsWith("/login") && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            background: "var(--surface-lowest)",
                            borderRadius: "0.375rem",
                            padding: "0.25rem",
                            gap: "0.125rem",
                        }}>
                            {[
                                { label: "Doctor", href: "/doctor/dashboard", active: isDoctor },
                                { label: "Company", href: "/company/dashboard", active: isCompany },
                                { label: "Admin", href: "/admin", active: isAdmin },
                            ].map(({ label, href, active }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    style={{
                                        textDecoration: "none",
                                        padding: "0.25rem 0.625rem",
                                        borderRadius: "0.25rem",
                                        fontSize: "0.6875rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        color: active ? "var(--primary)" : "var(--primary-fixed)",
                                        background: active ? "rgba(255,255,255,0.08)" : "transparent",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}

                    {(isDoctor || isCompany || isAdmin) && (
                        <ConnectKitButton />
                    )}
                </div>
            </div>
        </nav>
    );
}
