import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign In - Wheat-Guard",
  description: "Sign in to Wheat-Guard to access your wheat disease research dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 antialiased">
      {children}
    </div>
  );
}
