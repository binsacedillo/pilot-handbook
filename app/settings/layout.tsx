import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* HUD Background Element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0 animate-hud-scanline bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-entry">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
              <Settings2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase">
                Configuration
              </h1>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
                System Parameters & Account Preferences
              </p>
            </div>
          </div>
          
          <Button asChild variant="outline" size="sm" className="w-fit gap-2 border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300 backdrop-blur-sm group">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Return to Flight Deck
            </Link>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-2 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors duration-500" />
               <SettingsNav />
            </div>
            
            <div className="px-4 py-3 rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5">
              <p className="text-[10px] text-muted-foreground uppercase font-mono leading-tight">
                System Status: <span className="text-emerald-500 animate-pulse">Operational</span><br />
                Config Mode: <span className="text-primary">Master</span>
              </p>
            </div>
          </aside>
          
          <main className="animate-entry [animation-delay:150ms]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
