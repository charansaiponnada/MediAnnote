import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/providers/Web3Provider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { AppStoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "MediAnnote — Web3 Medical Annotation Marketplace",
  description:
    "A decentralized marketplace connecting verified medical experts with AI companies for blockchain-verified medical image annotations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: "#000", color: "white" }}>
        <ThemeProvider>
          <Web3Provider>
            <AppStoreProvider>
              <Navbar />
              <main style={{ minHeight: "100svh" }}>{children}</main>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#1F1F1F",
                    color: "#E5E5E5",
                    border: "1px solid rgba(71,71,71,0.2)",
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    borderRadius: "0.375rem",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  },
                  success: { iconTheme: { primary: "#34D399", secondary: "#1F1F1F" } },
                  error: { iconTheme: { primary: "#F87171", secondary: "#1F1F1F" } },
                }}
              />
            </AppStoreProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
