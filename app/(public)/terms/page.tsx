import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />
      <AppHeader />
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="terms-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <header className="mb-12 border-b border-zinc-800 pb-8 text-center md:text-left">
            <h1
              id="terms-title"
              className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4"
            >
              Terms of <span className="text-blue-500">Service</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              [ EFFECTIVE DATE: JANUARY 11, 2026 ]
            </p>
          </header>
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Project Status</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400 font-mono text-xs">
                  The Pilot Handbook is a Guided Training Companion currently under active development. The following terms are provided for transparency and to establish the baseline for student and general aviation use.
                </p>
              </div>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">1. Acceptance of Terms</h2>
              <p>By accessing or using Pilot Handbook, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">2. Use of the Platform</h2>
              <p>You may use Pilot Handbook only for lawful purposes and in accordance with these terms. The platform is provided &quot;as is&quot; during the development phase and may be subject to change or downtime.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">3. User Accounts</h2>
              <p>If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">4. Intellectual Property</h2>
              <p>All content, trademarks, and intellectual property on Pilot Handbook remain the property of their respective owners. You may not copy, modify, or distribute any part of the platform without permission.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">5. Safety Disclaimer &amp; Liability</h2>
              <p>Pilot Handbook is provided for informational and decision-support purposes only. It is NOT a replacement for the Approved Flight Manual (AFM) or Pilot&apos;s Operating Handbook (POH). The Pilot in Command (PIC) retains final authority and responsibility for the safe operation of the aircraft. Always verify calculations manually against official data.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">6. Changes to Terms</h2>
              <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated effective date.</p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">7. Contact</h2>
              <p>For questions about these Terms of Service, please contact the project team. Official contact details will be provided upon public release.</p>
            </section>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}