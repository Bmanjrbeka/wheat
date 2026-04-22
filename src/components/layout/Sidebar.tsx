"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Microscope, 
  History, 
  FileText, 
  Menu, 
  X,
  Sparkles,
  LogIn
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    label: "Analysis",
    href: "/analysis",
    icon: <Microscope className="w-5 h-5" />
  },
  {
    label: "Premium",
    href: "/premium",
    icon: <Sparkles className="w-5 h-5" />
  },
  {
    label: "History",
    href: "/history",
    icon: <History className="w-5 h-5" />
  },
  {
    label: "Reports",
    href: "/reports",
    icon: <FileText className="w-5 h-5" />
  }
];

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-screen ${isCollapsed ? 'w-0' : 'w-64'} bg-white border-r-2 border-gray-300
        will-change-transform ${isCollapsed ? 'translateX(-100%)' : 'translateX(0%)'}
        transition-transform duration-500 ease-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="py-5 px-6 border-b-2 border-gray-300 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              </div>
              <h1 className="text-xl font-bold text-gray-900">Wheat-Guard</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 transition-all duration-500 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive(item.href)
                        ? 'bg-primary-100 text-primary-800 border-l-4 border-primary-600 shadow-sm transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:translate-x-1'
                      }
                      ${isCollapsed ? 'opacity-0 pointer-events-none scale-95 translate-x-2' : 'opacity-100 scale-100 translate-x-0 animate-slide-in'}
                    `}
                  >
                    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'scale-95' : 'scale-100'}`}>
                      {item.icon}
                      <span className={`font-medium select-none transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>{item.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-gray-300">
            <div className="text-xs text-gray-500 text-center">
              Agricultural Research Workflow
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
