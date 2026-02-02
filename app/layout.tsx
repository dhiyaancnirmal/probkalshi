import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "probkalshi.com — Live Kalshi Odds on Your Stream",
  description:
    "Free OBS overlay for Kalshi prediction markets. Paste a URL, get a live ticker for your stream. Real-time odds, animated prices, transparent background.",
  keywords: [
    "Kalshi",
    "prediction markets",
    "OBS overlay",
    "livestream",
    "ticker",
    "odds",
    "streaming",
  ],
  authors: [{ name: "probkalshi.com" }],
  openGraph: {
    title: "probkalshi.com — Live Kalshi Odds on Your Stream",
    description:
      "Free OBS overlay for Kalshi prediction markets. Paste a URL, get a live ticker.",
    url: "https://probkalshi.com",
    siteName: "probkalshi.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "probkalshi.com — Live Kalshi Odds on Your Stream",
    description:
      "Free OBS overlay for Kalshi prediction markets. Paste a URL, get a live ticker.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} antialiased bg-gray-950 text-white font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
