"use client";

import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane, LayoutDashboard, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function AppHeader() {
  const { user, isLoaded } = useUser();
  const publicRole = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : undefined;
  const isAdmin = publicRole === "ADMIN";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isMarketingPage = pathname === "/" || pathname?.startsWith("/privacy") || pathname?.startsWith("/terms") || pathname?.startsWith("/about") || pathname?.startsWith("/contact");

  const mainNavItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Flights", href: "/flights" },
    { label: "Aircraft", href: "/aircraft" },
    { label: "Tools", href: "/tools" },
  ];

  // Close menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 sticky top-0 z-50 backdrop-blur-3xl shadow-xl w-full">
      {/* Decorative top pulse line */}
      <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 relative">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 hover:opacity-80 transition-opacity shrink-0 group">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
            <Plane className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-black tracking-widest text-foreground uppercase hidden sm:block">
            Pilot Handbook
          </span>
          <span className="text-sm font-black tracking-widest text-foreground uppercase sm:hidden">
            PHB
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {!isLoaded ? (
            <div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse border border-zinc-700" />
          ) : (
            <>
              <SignedOut>
                <div className="flex items-center gap-2 sm:gap-4">
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 border border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center gap-2 sm:gap-4">
                  {!isAdminPage && (
                    <div className="hidden md:flex items-center gap-2">
                      {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={item.href} href={item.href} prefetch={false}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest h-9 px-4 transition-all duration-300",
                                isActive 
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                              )}
                            >
                              {item.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {isAdminPage && isAdmin && (
                    <Link href="/dashboard">
                      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <LayoutDashboard className="w-3.5 h-3.5 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  )}

                  {(isMarketingPage || isAdminPage) && !isAdminPage && (
                    <Link href="/dashboard">
                      <Button variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300">
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}

                  {/* Mobile Menu Toggle */}
                  <SignedIn>
                    {!isAdminPage && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                      >
                        {isMobileMenuOpen ? (
                          <X className="w-5 h-5" />
                        ) : (
                          <Menu className="w-5 h-5" />
                        )}
                      </Button>
                    )}
                  </SignedIn>

                  <div className="shrink-0 ml-2 relative">
                    {/* Ring glow for user button */}
                    <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] pointer-events-none" />
                    <UserButton afterSignOutUrl="/">
                      <UserButton.MenuItems>
                        <UserButton.Link label="Settings" labelIcon={<span>⚙️</span>} href="/settings" />
                        <UserButton.Action label="manageAccount" />
                        {isAdmin && (
                          <UserButton.Link label="Admin Panel" labelIcon={<span>👑</span>} href="/admin" />
                        )}
                      </UserButton.MenuItems>
                    </UserButton>
                  </div>
                </div>
              </SignedIn>
            </>
          )}
        </div>
      </div>
 
      {/* Mobile Navigation Menu */}
      <div 
        className={cn(
          "md:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-2xl border-b border-zinc-800 transition-all duration-300 ease-in-out overflow-hidden",
          isMobileMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} prefetch={false}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-[11px] font-bold uppercase tracking-[0.2em] h-12 px-4 transition-all duration-300",
                    isActive 
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plane className={cn("w-3.5 h-3.5 mr-3", isActive ? "text-blue-400" : "text-zinc-500")} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
        
        {/* Decorative bottom fade */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      </div>
    </nav>
  );
}
