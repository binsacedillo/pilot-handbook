import React from "react";
import { 
  LifeBuoy, 
  Mail, 
  MessageSquare, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-8 w-full relative z-10">
        <div className="space-y-12 py-10">
          {/* Header Section */}
          <div className="space-y-4 border-l-2 border-blue-500/20 pl-6">
            <div className="flex items-center gap-3 text-blue-500/60">
              <LifeBuoy className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operations Desk / Support</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              SUPPORT HUB<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Technical Assistance & Operational Guidance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Card */}
            <GlassCard bezel={true} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Direct Contact</h2>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <p className="text-[11px] font-bold text-zinc-400 uppercase leading-relaxed">
                  For critical technical issues or account inquiries, please reach out directly to our operations desk.
                </p>
                <a 
                  href="mailto:support@pilothandbook.app" 
                  className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-blue-500/40 transition-all group"
                >
                  <span className="text-xs font-black text-white">Email Operations</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-500 transition-colors" />
                </a>
              </GlassCardContent>
            </GlassCard>

            {/* Community/Feedback */}
            <GlassCard bezel={true} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Feedback Loop</h2>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <p className="text-[11px] font-bold text-zinc-400 uppercase leading-relaxed">
                  Help us improve the cockpit experience. Share your suggestions or report operational bugs.
                </p>
                <button className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-white/5 hover:border-emerald-500/40 transition-all group">
                  <span className="text-xs font-black text-white">Submit Report</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </button>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Quick FAQ Strip */}
          <div className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Frequently Asked Questions</h3>
            
            <div className="grid gap-6">
              {[
                { q: "Is my flight data secure?", a: "All telemetry and flight logs are encrypted at rest using industry-standard protocols." },
                { q: "Can I use the app offline?", a: "The core handbook and checklists are cached for offline access, but sync requires a connection." },
                { q: "How do I export my logs?", a: "Log export functionality is currently available in the Analytics module under 'Telemetry Data'." }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs font-black text-white uppercase italic">{item.q}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
