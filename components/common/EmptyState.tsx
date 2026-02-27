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
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="mb-6 text-6xl animate-bounce-subtle">
          {icon}
        </div>
      )}
      <h3 className="text-3xl font-bold mb-3 text-foreground animate-entry opacity-0" style={{ animationFillMode: 'forwards' }}>
        {title}
      </h3>
      {description && (
        <p
          className="text-lg text-muted-foreground mb-10 max-w-md animate-entry opacity-0"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          {description}
        </p>
      )}
      {action && action.href && (
        <Button size="lg" className="text-lg px-10 py-6 h-auto hover-lift rounded-full" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
      {action && !action.href && (
        <Button size="lg" className="text-lg px-10 py-6 h-auto hover-lift rounded-full" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
