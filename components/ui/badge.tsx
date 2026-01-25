import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    secondary: "bg-zinc-400 text-white",
  };
  return (
    <span
      className={twMerge(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
