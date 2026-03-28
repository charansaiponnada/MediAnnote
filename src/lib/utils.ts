import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatUSDC(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(amount / 1e6);
}

export function formatUSDCRaw(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(amount);
}

export async function hashAnnotation(data: object): Promise<string> {
    const json = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(json);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const tierNames = ["Bronze", "Silver", "Gold", "Platinum"] as const;

export const tierColors: Record<string, string> = {
    Bronze: "text-amber-700 bg-amber-100 border-amber-300",
    Silver: "text-slate-600 bg-slate-100 border-slate-300",
    Gold: "text-yellow-600 bg-yellow-100 border-yellow-400",
    Platinum: "text-purple-600 bg-purple-100 border-purple-400",
};

export const specialties = [
    "Radiology",
    "Pathology",
    "Dermatology",
    "Ophthalmology",
    "Cardiology",
    "Neurology",
    "Oncology",
] as const;
