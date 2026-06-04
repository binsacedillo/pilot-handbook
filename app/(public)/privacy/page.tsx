import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />
      <AppHeader />
      <main className="flex-1 max-w-3xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-10 overflow-hidden relative"
          aria-labelledby="privacy-policy-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <header className="mb-10 border-b border-zinc-800 pb-6 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1
                id="privacy-policy-title"
                className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase mb-2"
              >
                Privacy <span className="text-blue-500">Policy</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                [ REVISION: MAY 31, 2026 ]
              </p>
            </div>
            
            <div className="bg-white p-2 rounded-lg shadow-[0_0_10px_rgba(255,255,255,0.05)] shrink-0 transition-transform hover:scale-105">
              <Image
                src="/NPC_Logo_1.png"
                alt="National Privacy Commission (NPC) Logo"
                width={100}
                height={30}
                className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
            </div>
          </header>
          
          <div className="space-y-8 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3 border-l-2 border-blue-500 pl-3">Compliance Statement</h2>
              <p>
                Pilot Handbook is fully compliant with the National Privacy Commission (NPC) of the Philippines and Republic Act No. 10173 (Data Privacy Act of 2012). We are committed to keeping your pilot logbooks and flight profile records private and secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3 border-l-2 border-blue-500 pl-3">Data Collection & Use</h2>
              <p className="mb-4">We collect only what is necessary to run your pilot cockpit features:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
                  <h3 className="font-bold text-[10px] text-white uppercase tracking-widest mb-2">Flight Logs & Profile</h3>
                  <p className="text-xs text-zinc-400">
                    Flight times, routes, aircraft types, licensing limits, and instructor sign-offs to compile analytics and safety checks.
                  </p>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
                  <h3 className="font-bold text-[10px] text-white uppercase tracking-widest mb-2">Security Logging</h3>
                  <p className="text-xs text-zinc-400">
                    IP address and authentication history, used strictly for audit logging to protect your data from unauthorized access.
                  </p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3 border-l-2 border-blue-500 pl-3">Security & Partners</h2>
              <p className="mb-3">
                Your data is isolated at the database level and never shared with advertisers. We rely on top-tier security partners:
              </p>
              <ul className="list-none space-y-1 ml-1 text-xs text-zinc-400">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <strong className="text-zinc-200">Clerk</strong> — Secured user login & identity</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <strong className="text-zinc-200">Neon (Postgres)</strong> — Row-isolated data storage</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <strong className="text-zinc-200">Vercel</strong> — Global deployment pipeline hosting</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-3 border-l-2 border-blue-500 pl-3">Your Rights</h2>
              <p className="mb-2">
                Under the Data Privacy Act of 2012, you have full authority over your data:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-zinc-400">
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>01. Access</strong> / Request a copy</div>
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>02. Correct</strong> / Edit mismatch entries</div>
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>03. Erase</strong> / Complete deletion</div>
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>04. Object</strong> / Disagree with processing</div>
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>05. Portability</strong> / Move data elsewhere</div>
                <div className="bg-zinc-900/20 p-3 rounded border border-zinc-900/50"><strong>06. Complain</strong> / File NPC concerns</div>
              </div>
            </section>
            
            <section className="pt-6 border-t border-zinc-800/50">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                If you have questions, please open a ticket on our <a href="/support" className="text-blue-400 underline hover:text-blue-300">Support Page</a> or reach us directly at <a href="mailto:support@pilothandbook.app" className="text-blue-400 underline hover:text-blue-300">support@pilothandbook.app</a>.
              </p>
            </section>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
