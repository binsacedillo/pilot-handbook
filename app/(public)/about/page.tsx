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
              [ REVISION: MAY 14, 2026 ]
            </p>
          </header>
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3 leading-none pb-0.5">Our Mission</h2>
              <p className="font-medium text-zinc-300 italic">
                Confidence is built through understanding.
              </p>
              <p className="mt-4">
                The Pilot Handbook is designed to be your digital co-pilot during flight training. We go beyond simple calculations by providing clear, assisted guidance that helps you understand the "why" behind every preflight decision. Our mission is to transform complex data into clear safety habits that stay with you long after you earn your wings.
              </p>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3 leading-none pb-0.5">Student-First Philosophy</h2>
              <ul className="list-none space-y-4 ml-1">
                {[
                  { title: "Safe Habits First", desc: "Workflows built to reinforce professional standard operating procedures (SOPs)." },
                  { title: "Assisted Guidance", desc: "Not just results, but plain-language explanations of what those results mean for your flight." },
                  { title: "Mastery through Data", desc: "Turning every calculation into a learning moment to build your aeronautical decision-making (ADM)." }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <span className="text-blue-500 font-black mt-0.5 group-hover:translate-x-1 transition-transform">&gt;</span>
                    <p className="text-zinc-400 font-bold uppercase tracking-tight">
                      <span className="text-zinc-200">{item.title}</span>: {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3 leading-none pb-0.5">Project Status [V1.4]</h2>
              <div className="bg-zinc-950/50 border border-blue-500/10 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <ShieldCheck className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-wider leading-relaxed relative z-10">
                  The Pilot Handbook is currently enhanced with our <span className="text-blue-400">Assisted Safety Engine</span>. This layer cross-checks your inputs against CAAP-standard compliance parameters to give you an extra level of confidence before you ever leave the ground.
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
