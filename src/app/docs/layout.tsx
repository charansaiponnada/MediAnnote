import React from "react";
import Link from "next/link";
import { 
  Book, 
  Settings, 
  Layers, 
  FolderTree, 
  Zap, 
  Code, 
  Play, 
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from "lucide-react";

const sidebarItems = [
  { href: "/docs/introduction", label: "Introduction", icon: Book },
  { href: "/docs/getting-started", label: "Getting Started", icon: Play },
  { href: "/docs/architecture", label: "Architecture", icon: Layers },
  { href: "/docs/project-structure", label: "Project Structure", icon: FolderTree },
  { href: "/docs/features", label: "Features", icon: Zap },
  { href: "/docs/api", label: "API Reference", icon: Code },
  { href: "/docs/usage", label: "Usage Guide", icon: Settings },
  { href: "/docs/case-studies", label: "Case Studies", icon: TrendingUp },
  { href: "/docs/developer-guide", label: "Developer Guide", icon: Code },
  { href: "/docs/limitations", label: "Limitations", icon: AlertTriangle },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--surface-lowest)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[var(--surface-low)] overflow-y-auto hidden md:block">
        <nav className="p-4 space-y-1">
          <div className="label-sm text-[var(--primary-fixed)] mb-4 px-2">Documentation</div>
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all hover:bg-white/5 text-[var(--on-surface-variant)] hover:text-white group"
            >
              <item.icon size={16} className="text-[var(--primary-fixed)] group-hover:text-[var(--accent-cyan)] transition-colors" />
              {item.label}
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
