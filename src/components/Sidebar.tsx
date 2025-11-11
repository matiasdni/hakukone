"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  Bot,
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  Palette,
  Settings,
} from "lucide-react";
import React, { memo } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  { href: "/jobs", label: "Job Tracker", icon: Briefcase },
  { href: "/templates", label: "Templates", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Memoized nav item component to prevent unnecessary re-renders
const NavItem = memo(function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all",
          isActive
            ? "bg-linear-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:from-violet-500/30 dark:to-purple-500/30 dark:text-violet-300"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            isActive
              ? "bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/25"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
});

export const Sidebar = memo(function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200/60 bg-linear-to-b from-slate-50 via-white to-slate-50/80 dark:border-white/10 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950">
      {/* Logo */}
      <div className="border-b border-slate-200/60 p-6 dark:border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-purple-500/25">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">
              Hakukone
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI-powered
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
          Menu
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
              />
            );
          })}
        </ul>
      </nav>

      {/* Pro upgrade card */}
      <div className="p-4">
        <div className="rounded-2xl bg-linear-to-br from-violet-100 to-purple-100 p-4 dark:from-violet-800/30 dark:to-purple-800/30">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">
            Upgrade to Pro
          </p>
          <p className="mt-1 text-xs text-violet-600/80 dark:text-violet-400/80">
            Get unlimited AI features
          </p>
          <button className="mt-3 w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-violet-700 shadow-sm transition-colors hover:bg-violet-50 dark:bg-white/20 dark:text-white dark:hover:bg-white/30">
            Learn More
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200/60 p-4 dark:border-white/10">
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          &copy; 2025 Hakukone
        </p>
      </div>
    </aside>
  );
});
