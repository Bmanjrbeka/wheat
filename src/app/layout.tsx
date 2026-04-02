import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wheat Disease Detector",
  description:
    "AI-powered wheat disease detection for Ethiopian farmers. " +
    "Upload a leaf photo and get an instant diagnosis.",
  keywords: ["wheat", "disease", "detection", "Ethiopia", "farming", "AI"],
};

export const viewport: Viewport = {
  // Critical for field use on mobile
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-950">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
