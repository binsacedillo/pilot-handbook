import AppHeader from "@/components/AppHeaderClient";
import AppFooter from "@/components/common/AppFooter";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 blur-[150px] -z-10 pointer-events-none" />
      <AppHeader />
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="contact-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <header className="mb-12 border-b border-zinc-800 pb-8 text-center md:text-left">
            <h1
              id="contact-title"
              className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4"
            >
              System <span className="text-blue-500">Contact</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              [ SECURE COMMUNICATIONS CHANNEL ]
            </p>
          </header>
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Get in Touch</h2>
              <p>
                Have questions, feedback, or need support? Reach out to the Pilot Handbook team using the secure contact details below.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl items-center sm:items-start">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Primary Comm</h3>
                  <p className="text-lg font-mono text-white">support@pilothandbook.com</p>
                  <p className="text-xs text-rose-500 mt-2 font-mono uppercase tracking-widest">For urgent matters, prepend [URGENT] to subject line</p>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Contact Form</h2>
              <div className="bg-zinc-900/20 border border-zinc-800 border-dashed p-8 rounded-xl text-center">
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                  [ DIRECT FORM SUBMISSION SYSTEM OFFLINE PENDING LAUNCH ]
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
