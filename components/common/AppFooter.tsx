import Link from "next/link";
import { Plane } from "lucide-react";

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-xl relative z-10 w-full">
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Plane className="w-5 h-5" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-foreground">Pilot Handbook</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link href="/about" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
              About
            </Link>
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
              Contact
            </Link>
            <Link href="/help" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-blue-400 transition-colors">
              Help Center
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            © {currentYear} SYSTEM INIT
          </div>
        </div>
      </div>
    </footer>
  );
}
