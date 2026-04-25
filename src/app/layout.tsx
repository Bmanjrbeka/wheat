import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "WheatGuard — Disease Diagnostics",
  description: "AI-powered wheat disease detection for Ethiopian farmers and researchers.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, themeColor: "#2d6a10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning={true}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
