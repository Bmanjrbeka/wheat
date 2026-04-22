"use client";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  title: string;
  subtitle?: string;
  collapsed: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, collapsed, onToggle, actions }: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <header
      className="sticky top-0 z-30 bg-white flex items-center justify-between px-5 border-b"
      style={{ height: 52, borderColor: "var(--border)", boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}
    >
      {/* Left: toggle + title */}
      <div className="flex items-center gap-3">
        {/* Hamburger / X toggle */}
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{ color: "#666" }}
          aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        >
          {collapsed ? (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="2" y1="4" x2="15" y2="4"/>
              <line x1="2" y1="8.5" x2="15" y2="8.5"/>
              <line x1="2" y1="13" x2="15" y2="13"/>
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="3" y1="3" x2="14" y2="14"/>
              <line x1="14" y1="3" x2="3" y2="14"/>
            </svg>
          )}
        </button>

        {/* WheatGuard branding when sidebar is collapsed */}
        {collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
                 style={{ background: "var(--green-mid)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1C6 1 2.5 4 2.5 7.5A3.5 3.5 0 009.5 7.5C9.5 4 6 1 6 1z" fill="#EAF3DE"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Wheat<span style={{ color: "var(--green-mid)" }}>Guard</span>
            </span>
          </div>
        )}

        {/* Page title */}
        <div className={collapsed ? "ml-1 border-l pl-3" : ""} style={{ borderColor: "var(--border)" }}>
          <h1 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-gray-400 leading-tight">{subtitle}</p>}
        </div>
      </div>

      {/* Right: actions + profile */}
      <div className="flex items-center gap-2">
        {actions}

        {/* User */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: "var(--border)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: "var(--green-light)", color: "var(--green-deep)" }}>
              {(user.user_metadata?.full_name ?? user.email ?? "U")[0].toUpperCase()}
            </div>
            <button onClick={signOut}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors hidden sm:block">
              Sign out
            </button>
          </div>
        ) : (
          <a href="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{ color: "var(--green-mid)", background: "var(--green-light)" }}>
            Sign in
          </a>
        )}
      </div>
    </header>
  );
}
