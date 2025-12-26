import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

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

  // Hide NavBar on login/signup pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return null;
  "use client";
  }

  return (
    <nav className="w-full bg-white border-b shadow-sm py-3 px-6 flex items-center justify-center">
      <ul className="flex gap-6">
        {navLinks.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`text-lg font-medium hover:text-blue-600 transition-colors ${pathname.startsWith(href) ? 'text-blue-700 underline' : 'text-gray-800'}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
