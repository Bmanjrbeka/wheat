"use client";
import { TopBar } from "./TopBar";
import { useShell } from "./AppShell";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function Page({ title, subtitle, actions, children }: Props) {
  const { collapsed, setCollapsed } = useShell();
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title={title}
        subtitle={subtitle}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        actions={actions}
      />
      <main className="flex-1 p-5">
        {children}
      </main>
    </div>
  );
}
