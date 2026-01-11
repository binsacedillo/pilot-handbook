import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
	size?: "default" | "sm" | "lg";
	asChild?: boolean;
}

// Simple styled button; extend or replace with your design system as needed.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, type = "button", variant = "default", size = "default", asChild = false, ...props },
		ref
	) => {
		const Component = asChild ? Slot : "button";

		const variantStyles = {
			default:
				"bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
			outline:
				"border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800",
			ghost:
				"bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
			secondary:
				"bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
			destructive:
				"bg-destructive text-destructive-foreground hover:bg-destructive/90",
		};

		const sizeStyles = {
			default: "px-4 py-2 text-sm",
			sm: "px-3 py-1.5 text-xs",
			lg: "px-6 py-3 text-base",
		};

		return (
			<Component
				ref={ref}
				{...(asChild ? {} : { type })}
				className={twMerge(
					"inline-flex items-center justify-center rounded-md font-medium shadow-sm transition cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-slate-100 disabled:cursor-not-allowed disabled:opacity-60",
					variantStyles[variant],
					sizeStyles[size],
					className
				)}
				{...props}
			/>
		);
	}
);

Button.displayName = "Button";
