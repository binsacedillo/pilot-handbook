import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />
      <AppHeader />
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="help-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <header className="mb-12 border-b border-zinc-800 pb-8 text-center md:text-left flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div>
              <h1
                id="help-title"
                className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4"
              >
                Help <span className="text-blue-500">Center</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                [ DIAGNOSTICS & ASSISTANCE ]
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
              <HelpCircle className="w-10 h-10" />
            </div>
          </header>
          
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Getting Started</h2>
              <p>
                Welcome to the Pilot Handbook Help Center. Here you will find answers to common questions and troubleshooting tips to assist in your digital logging operations.
              </p>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Frequently Asked Questions</h2>
              <div className="grid gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <span className="font-semibold text-white">How do I create an account?</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">Pending Launch</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <span className="font-semibold text-white">How do I log a flight?</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">Pending Launch</span>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <span className="font-semibold text-white">How do I reset my password?</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500 bg-zinc-900 px-3 py-1 rounded-md border border-zinc-800">Pending Launch</span>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Technical Support</h2>
              <p>
                If you require further assistance or system debugging, please route your requests to our support engineers at <span className="text-blue-500 font-mono font-bold tracking-tight">support@pilothandbook.com</span>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
