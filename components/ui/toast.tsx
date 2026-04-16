"use client";
import * as React from "react";
import { Button } from "./button";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  action?: ToastAction;
  duration?: number;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info", options?: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, action: options?.action };
    setToasts((prev) => [...prev, newToast]);
    const duration = options?.duration ?? 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
      <div 
        className="fixed z-[100] bottom-6 right-6 flex flex-col gap-3 max-w-md w-full pointer-events-none"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          const Icon = isSuccess ? CheckCircle : isError ? AlertTriangle : Info;
          const statusText = isSuccess ? "SYSTEM UPDATE" : isError ? "SYSTEM ERROR" : "SYSTEM MESSAGE";
          
          return (
            <div
              key={toast.id}
              role="status"
              aria-live={isError ? "assertive" : "polite"}
              className={cn(
                "pointer-events-auto flex gap-4 items-start p-4 rounded-xl shadow-2xl transition-all backdrop-blur-xl border bg-zinc-950/80 animate-in slide-in-from-bottom-4 fade-in duration-300",
                isSuccess && "border-emerald-500/20 shadow-emerald-500/10",
                isError && "border-rose-500/20 shadow-rose-500/10",
                toast.type === "info" && "border-blue-500/20 shadow-blue-500/10"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                isSuccess && "bg-emerald-500/10 text-emerald-500",
                isError && "bg-rose-500/10 text-rose-500",
                toast.type === "info" && "bg-blue-500/10 text-blue-500"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {statusText}
                </p>
                <p className="text-sm font-medium text-zinc-200">
                  {toast.message}
                </p>
                
                {toast.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className={cn(
                      "mt-3 h-8 text-xs font-bold uppercase tracking-wider backdrop-blur-md border-(--glass-border)",
                      isSuccess && "text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30 font-semibold",
                      isError && "text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30",
                      toast.type === "info" && "text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30"
                    )}
                    aria-label={`${toast.action.label} for ${toast.message}`}
                  >
                    {toast.action.label}
                  </Button>
                )}
              </div>
              
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 p-1 rounded-md hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
