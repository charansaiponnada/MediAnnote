"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { polygonMumbai as mumbaiChain, hardhat } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
    getDefaultConfig({
        chains: [hardhat, mumbaiChain],
        transports: {
            [hardhat.id]: http("http://127.0.0.1:8545"),
            [mumbaiChain.id]: http("https://rpc-mumbai.maticvigil.com"),
        },
        walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "demo",
        appName: "MediAnnote",
        appDescription: "Web3 Medical Image Annotation Marketplace",
    })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider
                    theme="midnight"
                    options={{
                        initialChainId: 0,
                        showBalance: true,
                    }}
                    customTheme={{
                        "--ck-font-family": '"Inter", sans-serif',
                    }}
                >
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
