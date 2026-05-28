import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "DeleGate.AI | %s",
    default: "DeleGate.AI | Chief of staff for onchain money",
  },
  description:
    "Bounded, revocable, multimodal. DeleGate.AI pays your subscriptions over x402, refuses anomalies in real time, and settles onchain via 1Shot — all on Base mainnet.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Fontshare — Panchang (display) */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=panchang@300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Google — Inter (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
