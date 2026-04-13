import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  bezel?: boolean;
}

/**
 * GlassCard - A specialized component for the "Glass Cockpit" aesthetic.
 * Features deep zinc backgrounds, subtle inset shadows for bezel effects,
 * and high-contrast borders.
 */
export function GlassCard({ children, className, bezel = true, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300 backdrop-blur-xl",
        "bg-(--glass-bg) border border-(--glass-border) text-foreground shadow-(--glass-bezel)",
        className
      )}
      {...props}
    >
      {/* Subtle top highlights for glass effect */}
      <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-white/[0.03] to-transparent dark:from-white/[0.05]" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

export function GlassCardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-b border-(--glass-border)", className)}>
      {children}
    </div>
  );
}

export function GlassCardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}
