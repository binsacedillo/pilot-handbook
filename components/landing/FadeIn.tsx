"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
    children: React.ReactNode;
    delay?: number; // Delay in ms
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeIn({
    children,
    delay = 0,
    className,
    direction = "up",
}: FadeInProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Only animate once
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    const getTransformClass = () => {
        switch (direction) {
            case "up": return "translate-y-8";
            case "down": return "-translate-y-8";
            case "left": return "translate-x-8";
            case "right": return "-translate-x-8";
            default: return "";
        }
    };

    return (
        <div
            ref={ref}
            className={cn(
                "transition-all duration-700 ease-out will-change-[transform,opacity]",
                isVisible ? "opacity-100 transform-none" : `opacity-0 ${getTransformClass()}`,
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
