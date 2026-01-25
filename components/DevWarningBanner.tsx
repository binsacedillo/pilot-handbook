"use client";

import { useState, useEffect, useRef } from "react";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import X from "lucide-react/dist/esm/icons/x";
import { Button } from "@/components/ui/button";

interface DevWarningBannerProps {
  /** Only show in production environment */
  productionOnly?: boolean;
  /** Custom message to display */
  message?: string;
}

export default function DevWarningBanner({ 
  productionOnly = false,
  message = "This site is currently in beta. Some features may be incomplete or subject to change."
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
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Under Development
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {message}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="shrink-0 h-8 w-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            aria-label="Dismiss warning"
          >
            <X className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
          </Button>
        </div>
      </div>
    </div>
  );
}
