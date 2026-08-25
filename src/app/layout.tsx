import type { Metadata } from "next";
import { Inter, Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrescriptCheck — Pharmaceutical Grade Prescription Verification",
  description:
    "Protect your health with our AI-powered prescription reader. We use clinical-grade imaging to verify identity, dosage, and safety protocols in seconds.",
  keywords: [
    "prescription reader",
    "medicine analysis",
    "AI prescription",
    "medical vision AI",
    "drug explanation",
    "prescriptcheck",
  ],
  openGraph: {
    title: "PrescriptCheck — Medication Safety, Verified Instantly",
    description: "AI-powered clinical prescription reader & verification system.",
    siteName: "PrescriptCheck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrescriptCheck",
    description: "Medication safety, verified instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSerif.variable} ${jakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-[#faf9fa] text-[#1b1c1d]">
        {children}
      </body>
    </html>
  );
}
