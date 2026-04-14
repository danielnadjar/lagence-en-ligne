"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";

const NAV_LINKS = [
  { href: "/negocier", label: "N\u00e9gocier pour moi" },
  { href: "/vendre", label: "Vendre mon bien" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/a-propos", label: "\u00c0 propos" },
  { href: "/qcm", label: "QCM Gratuit" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/80 backdrop-blur-xl">
      <div className="site-container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-surface-900">
          L&apos;Agence en Ligne
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
            Connexion
          </Link>
          <Link href="/negocier" className="btn-accent text-sm !py-2 !px-4">
            Envoyer une annonce
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-surface-600"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-200 bg-white">
          <nav className="site-container py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base text-surface-600 hover:text-surface-900 py-2"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-surface-200 pt-3 mt-2 flex flex-col gap-2">
              <Link href="/login" className="text-base text-surface-500">
                Connexion
              </Link>
              <Link href="/negocier" className="btn-accent text-center text-sm">
                Envoyer une annonce
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
