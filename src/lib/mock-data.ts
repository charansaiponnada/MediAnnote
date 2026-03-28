// Mock data for the MediAnnote hackathon demo

export interface Doctor {
    id: string;
    name: string;
    wallet: string;
    specialty: string;
    tier: number;
    reputationScore: number;
    annotationCount: number;
    earnings: number;
    avatar: string;
    verified: boolean;
}

export interface Company {
    id: string;
    name: string;
    wallet: string;
    industry: string;
    totalSpent: number;
}

export interface AnnotationBatch {
    id: string;
    batchId: string; // bytes32 on-chain
    title: string;
    description: string;
    imageType: string;
    totalImages: number;
    annotatedImages: number;
    rewardPerImage: number;
    totalBudget: number;
    deadline: string;
    status: "open" | "in_progress" | "completed" | "paid";
    companyId: string;
    companyName: string;
    labels: string[];
    iaaScore: number;
    txHash?: string;
    assignedDoctors: string[];
    uploadedImageKeys?: string[];
}

export interface Annotation {
    id: string;
    imageIndex: number;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: "low" | "medium" | "high";
    notes?: string;
    doctorId?: string;
}

export const mockDoctors: Doctor[] = [
    {
        id: "doc-1",
        name: "Dr. Ananya Reddy",
        wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        specialty: "Radiology",
        tier: 3,
        reputationScore: 94,
        annotationCount: 1247,
        earnings: 12450.0,
        avatar: "AR",
        verified: true,
    },
    {
        id: "doc-2",
        name: "Dr. James Morrison",
        wallet: "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF",
        specialty: "Pathology",
        tier: 2,
        reputationScore: 82,
        annotationCount: 834,
        earnings: 8920.0,
        avatar: "JM",
        verified: true,
    },
    {
        id: "doc-3",
        name: "Dr. Priya Sharma",
        wallet: "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69",
        specialty: "Dermatology",
        tier: 2,
        reputationScore: 85,
        annotationCount: 612,
        earnings: 6340.0,
        avatar: "PS",
        verified: true,
    },
    {
        id: "doc-4",
        name: "Dr. Michael Chen",
        wallet: "0x1efF47bc3a10a45D4B230B5d10E37751FE6AA718",
        specialty: "Ophthalmology",
        tier: 1,
        reputationScore: 71,
        annotationCount: 345,
        earnings: 3200.0,
        avatar: "MC",
        verified: true,
    },
    {
        id: "doc-5",
        name: "Dr. Fatima Al-Hassan",
        wallet: "0x63FaC9201494f0bd17B9892B9fae4d52fe3BD377",
        specialty: "Cardiology",
        tier: 1,
        reputationScore: 67,
        annotationCount: 198,
        earnings: 1890.0,
        avatar: "FA",
        verified: false,
    },
];

export const mockCompanies: Company[] = [
    {
        id: "comp-1",
        name: "LungAI Diagnostics",
        wallet: "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        industry: "Medical AI",
        totalSpent: 24500.0,
    },
    {
        id: "comp-2",
        name: "DermVision Labs",
        wallet: "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        industry: "Dermatology AI",
        totalSpent: 18200.0,
    },
];

export const mockBatches: AnnotationBatch[] = [
    {
        id: "batch-1",
        batchId: "0x" + "a1b2c3d4".repeat(8),
        title: "Chest X-Ray Pneumonia Detection",
        description:
            "Annotate lung regions in chest X-rays for pneumonia detection model training. Mark areas of consolidation, ground-glass opacity, and pleural effusion.",
        imageType: "Chest X-Ray",
        totalImages: 50,
        annotatedImages: 32,
        rewardPerImage: 2.5,
        totalBudget: 125.0,
        deadline: "2026-04-15",
        status: "in_progress",
        companyId: "comp-1",
        companyName: "LungAI Diagnostics",
        labels: ["Pneumonia", "Nodule", "Normal", "Effusion", "Consolidation"],
        iaaScore: 0.87,
        txHash: "0x8f4e5d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
        assignedDoctors: ["doc-1", "doc-2"],
    },
    {
        id: "batch-2",
        batchId: "0x" + "e5f6g7h8".repeat(8),
        title: "Skin Lesion Classification",
        description:
            "Classify skin lesions in dermoscopy images. Label as benign nevus, melanoma, basal cell carcinoma, or seborrheic keratosis.",
        imageType: "Dermoscopy",
        totalImages: 30,
        annotatedImages: 30,
        rewardPerImage: 3.0,
        totalBudget: 90.0,
        deadline: "2026-04-10",
        status: "completed",
        companyId: "comp-2",
        companyName: "DermVision Labs",
        labels: ["Benign Nevus", "Melanoma", "BCC", "Seborrheic Keratosis"],
        iaaScore: 0.91,
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
        assignedDoctors: ["doc-3"],
    },
    {
        id: "batch-3",
        batchId: "0x" + "i9j0k1l2".repeat(8),
        title: "Retinal OCT Scan Analysis",
        description:
            "Annotate retinal layers and pathologies in OCT scans. Identify drusen, fluid pockets, and geographic atrophy regions.",
        imageType: "Retinal OCT",
        totalImages: 40,
        annotatedImages: 8,
        rewardPerImage: 4.0,
        totalBudget: 160.0,
        deadline: "2026-04-20",
        status: "open",
        companyId: "comp-1",
        companyName: "LungAI Diagnostics",
        labels: ["Drusen", "Fluid", "Geographic Atrophy", "Normal"],
        iaaScore: 0.0,
        assignedDoctors: [],
    },
];

export const sampleAnnotationLabels = [
    "Pneumonia",
    "Nodule",
    "Normal",
    "Effusion",
    "Consolidation",
    "Cardiomegaly",
    "Atelectasis",
];

export const mockActivityFeed = [
    {
        type: "annotation",
        message: "Completed annotation for Chest X-Ray batch",
        time: "2 hours ago",
        amount: "+$2.50",
    },
    {
        type: "payment",
        message: "Payment received for Skin Lesion batch",
        time: "1 day ago",
        amount: "+$90.00",
    },
    {
        type: "reputation",
        message: "Reputation score updated: 94 → 95",
        time: "2 days ago",
    },
    {
        type: "batch",
        message: "New batch available: Retinal OCT Analysis",
        time: "3 days ago",
    },
    {
        type: "sbt",
        message: "SBT Tier upgraded: Gold → Platinum",
        time: "1 week ago",
    },
];
