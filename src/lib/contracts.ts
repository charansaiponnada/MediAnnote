import deployments from "../../contracts/deployments.json";
import escrowAbi from "../../contracts/abis/AnnotationEscrow.json";
import doctorSbtAbi from "../../contracts/abis/DoctorSBT.json";
import mockUsdcAbi from "../../contracts/abis/MockUSDC.json";

export const CONTRACTS = {
    MockUSDC: {
        address: deployments.contracts.MockUSDC.address as `0x${string}`,
        abi: mockUsdcAbi,
    },
    AnnotationEscrow: {
        address: deployments.contracts.AnnotationEscrow.address as `0x${string}`,
        abi: escrowAbi,
    },
    DoctorSBT: {
        address: deployments.contracts.DoctorSBT.address as `0x${string}`,
        abi: doctorSbtAbi,
    },
} as const;

// Polygon Mumbai (legacy) chain config
export const polygonMumbai = {
    id: 80001,
    name: "Polygon Mumbai",
    nativeCurrency: {
        decimals: 18,
        name: "MATIC",
        symbol: "MATIC",
    },
    rpcUrls: {
        default: { http: ["https://rpc-mumbai.maticvigil.com"] },
    },
    blockExplorers: {
        default: {
            name: "PolygonScan",
            url: "https://mumbai.polygonscan.com",
        },
    },
    testnet: true,
} as const;

// Polygon Amoy testnet (replacement for Mumbai)
export const polygonAmoy = {
    id: 80002,
    name: "Polygon Amoy",
    nativeCurrency: {
        decimals: 18,
        name: "POL",
        symbol: "POL",
    },
    rpcUrls: {
        default: { http: ["https://rpc-amoy.polygon.technology/"] },
    },
    blockExplorers: {
        default: {
            name: "PolygonScan",
            url: "https://amoy.polygonscan.com",
        },
    },
    testnet: true,
} as const;
