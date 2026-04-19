"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background-50">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
