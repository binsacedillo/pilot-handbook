import * as React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline" | "ghost" | "secondary";
	size?: "default" | "sm" | "lg";
}

// Simple styled button; extend or replace with your design system as needed.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, type = "button", variant = "default", size = "default", ...props }, ref) => {
		const variantStyles = {
			default: "bg-black text-white hover:bg-black/90",
			outline: "border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100",
			ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
			secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300",
		};

		const sizeStyles = {
			default: "px-4 py-2 text-sm",
			sm: "px-3 py-1.5 text-xs",
			lg: "px-6 py-3 text-base",
		};

		return (
			<button
				ref={ref}
				type={type}
				className={twMerge(
					"inline-flex items-center justify-center rounded-md font-medium shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60",
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
