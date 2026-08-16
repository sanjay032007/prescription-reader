import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
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
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
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
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
