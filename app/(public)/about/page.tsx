"use client";
export const dynamic = "force-dynamic";
import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/common/AppHeader"), { ssr: false });
import AppFooter from "@/components/common/AppFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col relative overflow-hidden font-sans">
      <AppHeader />
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-3xl bg-zinc-900 border border-white/5 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="about-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <header className="mb-12 border-b border-white/5 pb-8 text-center md:text-left">
            <h1
              id="about-title"
              className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4 italic"
            >
              About <span className="text-blue-500">Pilot Handbook</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              [ REVISION: APRIL 19, 2026 ]
            </p>
          </header>
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3 leading-none pb-0.5">Our Mission</h2>
              <p>
                The Pilot Handbook is a guided flight training companion designed to help student pilots understand, calculate, and verify critical preflight decisions. We believe that technology should do more than just crunch numbers—it should help you understand *why* those numbers matter to your safety and performance.
              </p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Core Philosophy</h2>
              <ul className="list-none space-y-2 ml-1 text-zinc-400">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> **Clarity over Complexity**: Plain-language explanations of complex performance data.</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> **Habit Reinforcement**: Guided workflows that match professional industry standards.</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> **Student-First UX**: Designed for the cockpit environment on iPad and mobile.</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> **Mentorship through Data**: Turning calculations into learning moments.</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Project Status</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-400 font-mono text-xs">
                  The Pilot Handbook is currently undergoing active refinement to better serve the student pilot community. We are constantly adding new "Learning Modules" and guidance layers to ensure every preflight check is a step toward mastery.
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
