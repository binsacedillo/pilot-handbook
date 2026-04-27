"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReleaseAdvisoryProps {
  /** Only show in production environment */
  productionOnly?: boolean;
  /** Custom message to display */
  message?: string;
}

/**
 * ReleaseAdvisory component that follows ISO UI/UX standards for system state communication.
 * Communicates a technical release advisory with a professional, high-fidelity aesthetic.
 */
export default function ReleaseAdvisory({
  productionOnly = false,
  message = "Evaluation Release: Use with caution for PH flight operations. Integrated with the new CAAP Compliance Engine and Advanced Fleet Management."
}: ReleaseAdvisoryProps) {
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

    // Check if user has dismissed the advisory in this session
    const isDismissed = sessionStorage.getItem("release-advisory-dismissed");
    if (!isDismissed) {
      // Use requestAnimationFrame to avoid synchronous setState
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [productionOnly]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("release-advisory-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="bg-zinc-950/95 backdrop-blur-md border-b border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.1)] relative z-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 whitespace-nowrap bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                v1.0 Technical Advisory
              </p>
              <p className="text-xs font-medium text-zinc-300 tracking-tight leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm" 
            onClick={handleDismiss}
            className="shrink-0 h-8 w-8 p-0 hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 transition-colors"
            aria-label="Dismiss advisory"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
