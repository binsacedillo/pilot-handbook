"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsTabs = [
  {
    label: "Preferences",
    href: "/settings",
  },
  {
    label: "Account",
    href: "/settings/account",
  },
  {
    label: "Profile",
    href: "/settings/profile",
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
      {settingsTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname === tab.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
