import escrowAbi from "../../contracts/abis/AnnotationEscrow.json";
import doctorSbtAbi from "../../contracts/abis/DoctorSBT.json";
import mockUsdcAbi from "../../contracts/abis/MockUSDC.json";

export const CONTRACTS = {
    MockUSDC: {
        address: "0x89D6DEa5aAd02c842774C379cBE09e4B9471f4D1" as `0x${string}`,
        abi: mockUsdcAbi,
    },
    AnnotationEscrow: {
        address: "0xF21C9414B3b070D22F5D77f98A4D8041c28b58df" as `0x${string}`,
        abi: escrowAbi,
    },
    DoctorSBT: {
        address: "0xA6d15b0416EfaEBa76FBE00b0B4dfebBe6A45Fdf" as `0x${string}`,
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
