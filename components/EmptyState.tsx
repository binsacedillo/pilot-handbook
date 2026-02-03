import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon && <div className="mb-4 text-4xl">{icon}</div>}
      <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
      {description && (
        <p className="text-base text-muted-foreground mb-8 text-center max-w-md">
          {description}
        </p>
      )}
      {action && action.href && (
        <Button size="lg" className="text-lg px-8 py-4" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
      {action && !action.href && (
        <Button size="lg" className="text-lg px-8 py-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
