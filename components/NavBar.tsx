'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { AdminLink } from './admin/AdminLink';
import { Button } from '@/components/ui/button';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/flights', label: 'Logbook' },
  { href: '/aircraft', label: 'Aircraft' },
  { href: '/dashboard/analytics', label: 'Statistics' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'Settings' },
];

export default function NavBar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard support: close menu with Escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Hide NavBar on login/signup pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex w-full bg-white dark:bg-slate-950 border-b shadow-sm py-3 px-6 items-center justify-center" aria-label="Main navigation">
        <ul className="flex gap-6">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname.startsWith(href) ? 'page' : undefined}
                className={`text-base font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm px-1 ${pathname.startsWith(href) ? 'text-blue-700 dark:text-blue-400 underline' : 'text-gray-800 dark:text-gray-200'}`}
              >
                {label}
              </Link>
            </li>
          ))}
          {/* Admin Link - Only shows if user is admin */}
          <Suspense fallback={null}>
            <AdminLink />
          </Suspense>
        </ul>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden w-full bg-white dark:bg-slate-950 border-b shadow-sm" aria-label="Mobile navigation">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Menu</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="h-10 w-10 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="border-t bg-white dark:bg-slate-950 px-4 py-3">
            <ul className="flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={pathname.startsWith(href) ? 'page' : undefined}
                    className={`block py-2 px-3 rounded-md text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      pathname.startsWith(href)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {/* Admin Link - Only shows if user is admin */}
              <Suspense fallback={null}>
                <li onClick={() => setMobileMenuOpen(false)}>
                  <AdminLink />
                </li>
              </Suspense>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
