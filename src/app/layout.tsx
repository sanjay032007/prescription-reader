import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prescription Reader — Understand your prescription instantly",
  description:
    "Upload a photo of your doctor's prescription and get a plain-English breakdown of every medicine, dosage, and warning. AI-powered prescription analysis.",
  keywords: [
    "prescription reader",
    "medicine analysis",
    "AI prescription",
    "medical vision AI",
    "drug explanation",
  ],
  openGraph: {
    title: "Prescription Reader",
    description: "Understand your prescription instantly",
    siteName: "Prescription Reader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prescription Reader",
    description: "Understand your prescription instantly",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
