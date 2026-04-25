"use client";
import { useState, createContext, useContext } from "react";
import { Sidebar } from "./Sidebar";

interface ShellCtx { collapsed: boolean; setCollapsed: (v: boolean) => void; }
export const AppShellContext = createContext<ShellCtx>({ collapsed: false, setCollapsed: () => {} });
export const useShell = () => useContext(AppShellContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} />
      <div
        id="main-content"
        className={collapsed ? "expanded" : ""}
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Inject toggle state into children via context alternative — pass as prop via cloneElement */}
        {/* Pages use the AppShellContext instead */}
        <AppShellContext.Provider value={{ collapsed, setCollapsed }}>
          {children}
        </AppShellContext.Provider>
      </div>
    </>
  );
}
