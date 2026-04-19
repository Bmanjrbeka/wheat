import type { Metadata, Viewport } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wheat-Guard - Research & Diagnostic Tool",
  description:
    "Professional wheat disease research and diagnostic tool for agricultural research. " +
    "Analyze, understand, and record wheat disease patterns with AI-powered insights.",
  keywords: ["wheat", "disease", "research", "diagnostic", "agriculture", "AI", "wheat-guard"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4CAF50",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body 
        className="min-h-screen bg-background-50 antialiased"
        suppressHydrationWarning={true}
      >
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
