import Link from "next/link";

export default function AuthFooter() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-zinc-900 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-zinc-500">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
            &copy; {new Date().getFullYear()} Pilot Handbook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
