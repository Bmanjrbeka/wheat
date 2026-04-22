import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign Up - Wheat-Guard",
  description: "Create your Wheat-Guard account to start your wheat disease research journey.",
};

export default function SignupLayout({
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
