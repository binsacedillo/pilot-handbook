"use client";
export const dynamic = "force-dynamic";
import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/common/AppHeader"), { ssr: false });
import AppFooter from "@/components/common/AppFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />
      <AppHeader />
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="about-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <header className="mb-12 border-b border-zinc-800 pb-8 text-center md:text-left">
            <h1
              id="about-title"
              className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4"
            >
              System <span className="text-blue-500">About</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              [ LAST CALIBRATION: JANUARY 11, 2026 ]
            </p>
          </header>
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Mission Directive</h2>
              <p>
                Pilot Handbook is your trusted digital companion for flight logging, analytics, and pilot record management. Our mission is to empower pilots with modern, secure, and easy-to-use tools.
              </p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Core Operating Values</h2>
              <ul className="list-none space-y-2 ml-1 text-zinc-400">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> Privacy and data protection by design</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> Reliability and accuracy in record keeping</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> Modern, user-friendly experience</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> Continuous improvement and transparency</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Status</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400 font-mono text-xs">
                  This project is currently under development. Features and content may change as we work toward a public release. For more information, contact our team or explore the rest of the site.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
