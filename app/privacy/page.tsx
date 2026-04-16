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
      <main className="flex-1 max-w-4xl mx-auto p-6 md:p-12 w-full relative z-10 my-10">
        <section
          className="rounded-2xl bg-zinc-950/40 backdrop-blur-3xl border border-zinc-800 shadow-2xl p-8 md:p-12 overflow-hidden relative"
          aria-labelledby="privacy-policy-title"
        >
          {/* decorative hud line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <header className="mb-12 border-b border-zinc-800 pb-8 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1
                id="privacy-policy-title"
                className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase mb-4"
              >
                Privacy <span className="text-blue-500">Policy</span>
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                [ LAST UPDATED: JANUARY 11, 2026 ]
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0 transition-transform hover:scale-105">
              <Image
                src="/NPC_Logo_1.png"
                alt="National Privacy Commission (NPC) Logo"
                width={120}
                height={36}
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
                priority
              />
            </div>
          </header>
          
          <div className="space-y-10 text-sm leading-relaxed text-zinc-300">
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Introduction</h2>
              <p>
                Pilot Handbook (“we”, “us”, “our”) is a Personal Information Controller (PIC) registered and compliant with the National Privacy Commission (NPC) of the Philippines. We are committed to protecting your privacy and ensuring the security of your personal data in accordance with Republic Act No. 10173 (Data Privacy Act of 2012) and global best practices, including the General Data Protection Regulation (GDPR).
              </p>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Data Collected</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl">
                  <h3 className="font-bold text-[11px] text-white uppercase tracking-widest mb-3">Personal & Pilot Data</h3>
                  <ul className="list-none space-y-2 text-zinc-400 text-xs">
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> Flight logs (dates, routes, durations)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> Aircraft details (make, model, registration)</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> Pilot license numbers and expiry dates</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> User profile information</li>
                  </ul>
                </div>
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-xl">
                  <h3 className="font-bold text-[11px] text-white uppercase tracking-widest mb-3">Technical Data</h3>
                  <ul className="list-none space-y-2 text-zinc-400 text-xs">
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> Authentication logs and metadata</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> Device and browser information</li>
                    <li className="flex items-start gap-2"><span className="text-blue-500 font-bold mt-0.5">&gt;</span> IP address and usage analytics</li>
                  </ul>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Purpose of Data Processing</h2>
              <ul className="list-none space-y-2 ml-1 text-zinc-400">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> To provide and improve the Pilot Handbook SaaS platform</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> To ensure secure authentication and account management</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> To maintain accurate pilot records and analytics</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> To comply with legal and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Rights of the Data Subject</h2>
              <div className="space-y-4 text-zinc-400">
                <div className="flex gap-3"><span className="font-mono text-blue-500">01</span><p><span className="text-zinc-200 font-bold">Right to be Informed:</span> You have the right to be notified before data is processed.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">02</span><p><span className="text-zinc-200 font-bold">Right to Access:</span> You have the right to obtain a copy of your data.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">03</span><p><span className="text-zinc-200 font-bold">Right to Object:</span> You may object to the processing of your personal data.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">04</span><p><span className="text-zinc-200 font-bold">Right to Erasure:</span> You may request the deletion of your personal data.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">05</span><p><span className="text-zinc-200 font-bold">Right to Damages:</span> You have the right to be indemnified for damages.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">06</span><p><span className="text-zinc-200 font-bold">Right to Data Portability:</span> You have the right to move your data.</p></div>
                <div className="flex gap-3"><span className="font-mono text-blue-500">07</span><p><span className="text-zinc-200 font-bold">Right to File a Complaint:</span> You may file a complaint with the NPC.</p></div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Third-Party Processors</h2>
              <ul className="list-none space-y-2 ml-1 text-zinc-400 mb-4">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <span className="text-zinc-200 font-bold">Vercel:</span> Hosting and deployment</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <span className="text-zinc-200 font-bold">Clerk:</span> Authentication and user management</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">&gt;</span> <span className="text-zinc-200 font-bold">Neon/Postgres:</span> Database and data storage</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-4 border-l-2 border-blue-500 pl-3">Contact: Data Protection Officer (DPO)</h2>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg my-4">
                <p className="font-bold text-white text-sm mb-1">Data Protection Officer (DPO)</p>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">To be announced upon public release</p>
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-8 border-t border-zinc-800/50 pt-8">
                By using Pilot Handbook, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}
