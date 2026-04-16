"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Shield, Palette, LayoutGrid } from "lucide-react";

const settingsTabs = [
  {
    label: "App Preferences",
    href: "/settings",
    icon: Palette,
  },
  {
    label: "User Profile",
    href: "/settings/profile",
    icon: User,
  },
  {
    label: "Account Security",
    href: "/settings/account",
    icon: Shield,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 p-1">
      {settingsTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative group overflow-hidden",
              isActive
                ? "bg-primary/15 text-primary shadow-[inset_0_0_12px_rgba(var(--primary),0.1)]"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
              isActive ? "text-primary animate-hud-blink" : "text-muted-foreground/70"
            )} />
            <span className={cn(
              "relative z-10",
              isActive && "font-bold tracking-tight"
            )}>
              {tab.label}
            </span>
            
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            )}
            
            {/* Hover reflection effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
          </Link>
        );
      })}
    </nav>
  );
}
