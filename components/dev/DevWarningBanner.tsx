"use client";

import { useState, useEffect, useRef } from "react";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevWarningBannerProps {
  /** Only show in production environment */
  productionOnly?: boolean;
  /** Custom message to display */
  message?: string;
}

export default function DevWarningBanner({
  productionOnly = false,
  message = "Version 1.0 Technical Release. Featuring the new FAA Compliance Engine and Advanced Fleet Management System."
}: DevWarningBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Only check once
    if (hasChecked.current) return;
    hasChecked.current = true;

    // If productionOnly is true, only show in production
    const isProduction = process.env.NODE_ENV === "production";
    if (productionOnly && !isProduction) {
      return;
    }

    // Check if user has dismissed the banner in this session
    const isDismissed = sessionStorage.getItem("dev-warning-dismissed");
    if (!isDismissed) {
      // Use requestAnimationFrame to avoid synchronous setState
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [productionOnly]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("dev-warning-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-zinc-950/90 backdrop-blur-md border-b border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.1)] relative z-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 whitespace-nowrap">
                Technical Release
              </p>
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-tight">
                {message}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="shrink-0 h-8 w-8 p-0 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-colors"
            aria-label="Dismiss warning"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
