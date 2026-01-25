"use client";

import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";

interface DevBadgeProps {
  label?: string;
  className?: string;
}

/**
 * Small inline badge for marking specific features/pages as "Beta" or "In Development"
 * Use this for individual pages or features that need a warning
 */
export default function DevBadge({ 
  label = "Beta", 
  className = "" 
}: DevBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 ${className}`}
    >
      <AlertTriangle className="w-3 h-3" />
      {label}
    </span>
  );
}
