"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  collapsed: boolean;
}

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1.5"/>
        <rect x="11" y="1" width="6" height="6" rx="1.5"/>
        <rect x="1" y="11" width="6" height="6" rx="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5"/>
      </svg>
    ),
  },
  {
    href: "/analysis",
    label: "Analysis",
    badge: "AI",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="5"/><line x1="12" y1="12" x2="17" y2="17"/>
        <line x1="8" y1="5" x2="8" y2="11"/><line x1="5" y1="8" x2="11" y2="8"/>
      </svg>
    ),
  },
  {
    href: "/premium",
    label: "Premium",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="9,1 11.5,6.5 17,7.3 13,11.2 14,17 9,14.2 4,17 5,11.2 1,7.3 6.5,6.5"/>
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="7"/><polyline points="9,5 9,9 12,11"/>
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reports",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 1H4a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V6l-5-5z"/>
        <polyline points="10,1 10,6 15,6"/><line x1="6" y1="10" x2="12" y2="10"/>
        <line x1="6" y1="13" x2="10" y2="13"/>
      </svg>
    ),
  },
];

export function Sidebar({ collapsed }: SidebarProps) {
  const path = usePathname();

  return (
    <aside
      id="sidebar"
      className={`fixed left-0 top-0 h-screen bg-white border-r z-50 flex flex-col overflow-hidden
                 ${collapsed ? "collapsed" : ""}`}
      style={{ borderColor: "var(--border)" }}
    >
      {/* Brand section */}
      <div className="flex items-center gap-3 px-4 py-4 border-b" style={{ borderColor: "var(--border)", minHeight: 52 }}>
        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
             style={{ background: "var(--green-mid)" }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5C7.5 1.5 3.5 5 3.5 9A4 4 0 0011.5 9c0-4-4-7.5-4-7.5z" fill="#EAF3DE"/>
            <line x1="7.5" y1="4" x2="7.5" y2="13" stroke="rgba(255,255,255,0.5)" strokeWidth=".9" strokeLinecap="round"/>
            <line x1="5.5" y1="7.5" x2="7.5" y2="9.5" stroke="rgba(255,255,255,0.5)" strokeWidth=".9" strokeLinecap="round"/>
            <line x1="9.5" y1="6.5" x2="7.5" y2="8.5" stroke="rgba(255,255,255,0.5)" strokeWidth=".9" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-semibold text-gray-900 whitespace-nowrap leading-tight">
            Wheat<span style={{ color: "var(--green-mid)" }}>Guard</span>
          </div>
          <div className="text-[10px] text-gray-400 whitespace-nowrap">Research Platform</div>
        </div>
      </div>

      {/* Nav section */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Navigation
        </div>
        {NAV.map(({ href, label, icon, badge }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`nav-item ${active ? "active" : ""}`}
              style={active ? {} : {}}>
              <span className="nav-icon" style={{ color: active ? "var(--green-deep)" : "#888" }}>
                {icon}
              </span>
              <span className="whitespace-nowrap overflow-hidden">{label}</span>
              {badge && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: "var(--green-light)", color: "var(--green-mid)" }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="px-3 pb-4 border-t pt-3" style={{ borderColor: "var(--border)" }}>
        <div className="px-3 py-2.5 rounded-xl text-xs font-medium flex items-start gap-2"
             style={{ background: "var(--green-light)",
                      color: "var(--green-deep)" }}>
          <span className="pulse-dot mt-0.5 flex-shrink-0"
                style={{ background: "var(--green-mid)" }}/>
          <div>
            <div className="font-semibold">API live</div>
            <div className="text-[10px] opacity-70 mt-0.5">
              HuggingFace Space
            </div>
          </div>
        </div>

        <div className="mt-3 px-2 text-[10px] text-gray-400 leading-relaxed">
          Agricultural Research<br/>
          Workflow: Analyze → Diagnose → Record
        </div>
      </div>
    </aside>
  );
}
