import React from "react";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Decorative Cockpit Glows - Persistent across dashboard sub-routes */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10 text-foreground">
        {children}
      </main>
        
      <AppFooter />
    </div>
  );
}
