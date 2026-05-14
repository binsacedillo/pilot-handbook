import React from "react";
import { 
  ShieldCheck, 
  FileText, 
  Lock,
  Scale
} from "lucide-react";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] -z-10 pointer-events-none" />
      
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto p-4 sm:p-8 w-full relative z-10">
        <div className="space-y-12 py-10">
          {/* Header Section */}
          <div className="space-y-4 border-l-2 border-emerald-500/20 pl-6">
            <div className="flex items-center gap-3 text-emerald-500/60">
              <Scale className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Regulatory Compliance / Legal</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              COMPLIANCE<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Terms of Service • Privacy Policy • Operational Limits
            </p>
          </div>

          <div className="space-y-16">
            {/* Section: Terms of Service */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">1. Terms of Service</h2>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none text-[11px] font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">
                <p>
                  By accessing the Pilot Handbook platform, you acknowledge that this software is for 
                  <span className="text-emerald-500 font-black"> supplemental and educational use only</span>. 
                  It is not a replacement for certified aircraft documentation, flight manuals, or professional pilot judgment.
                </p>
                <p className="mt-4">
                  The Pilot in Command (PIC) remains solely responsible for the safe operation of the aircraft. 
                  Pilot Handbook and its developers assume no liability for operational errors, data inaccuracies, 
                  or flight incidents resulting from the use of this application.
                </p>
              </div>
            </section>

            {/* Section: Privacy Policy */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-blue-500" />
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white">2. Privacy & Telemetry</h2>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none text-[11px] font-bold text-zinc-400 uppercase leading-relaxed tracking-wider">
                <p>
                  We collect flight telemetry and operational data solely to provide analytics and compliance monitoring features. 
                  Your data is your property. We do not sell flight logs to third-party advertisers or insurance providers.
                </p>
                <p className="mt-4">
                  Sensitive account information is managed securely via our authentication partner (Clerk). 
                  Access to your flight logs is restricted to your authenticated account and any operators 
                  you explicitly authorize.
                </p>
              </div>
            </section>

            {/* Section: Data Protection */}
            <section className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Data Integrity Notice</h3>
               </div>
               <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed italic">
                 Calculations provided by the Pilot Handbook engine are derived from standard aviation formulas. 
                 Always cross-check results with your specific aircraft POH/AFM before flight.
               </p>
            </section>
          </div>
          
          <div className="pt-10 border-t border-zinc-900 text-center">
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">
              Last Updated: May 2026 • CAAP/FAA Supplemental Standard v1.4
            </p>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
