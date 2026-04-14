"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="site-container py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-200 bg-accent-50 mb-6">
              <ShieldCheck size={16} weight="fill" className="text-accent-600" />
              <span className="text-xs font-medium text-accent-700">
                On n\u00e9gocie \u00e0 votre place
              </span>
            </div>

            <h1 className="heading-display text-surface-950">
              La seule agence qui vous fait
              <span className="text-accent-600"> gagner de l&apos;argent</span>
            </h1>

            <p className="mt-6 body-text text-lg">
              N&apos;achetez jamais un bien immobilier sans votre n\u00e9gociateur professionnel.
              Appartement, maison, immeuble, fonds de commerce \u2014 partout en France.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/negocier" className="btn-accent inline-flex items-center justify-center gap-2">
                Envoyer une annonce
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link href="/tarifs" className="btn-outline inline-flex items-center justify-center">
                Voir les tarifs
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 text-sm text-surface-500">
              <span>500\u00a0\u20ac forfait</span>
              <span className="w-px h-4 bg-surface-300" />
              <span>+ 10% des \u00e9conomies</span>
              <span className="w-px h-4 bg-surface-300" />
              <span>Toute la France</span>
            </div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.15 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-surface-100 to-surface-200 border border-surface-200 flex items-center justify-center overflow-hidden">
              {/* Placeholder: sera remplac\u00e9 par une vraie image ou animation */}
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent-100 mb-4">
                  <ShieldCheck size={40} weight="fill" className="text-accent-600" />
                </div>
                <p className="text-2xl font-semibold text-surface-900 tracking-tight">
                  200\u00a0000\u00a0\u20ac
                </p>
                <p className="text-sm text-surface-500 mt-1">Prix affich\u00e9</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <ArrowRight size={16} className="text-accent-600" />
                  <p className="text-2xl font-semibold text-accent-600 tracking-tight">
                    180\u00a0000\u00a0\u20ac
                  </p>
                </div>
                <p className="text-sm text-surface-500 mt-1">Apr\u00e8s n\u00e9gociation</p>
                <div className="mt-4 py-2 px-4 rounded-xl bg-accent-50 border border-accent-200 inline-block">
                  <p className="text-sm font-medium text-accent-700">
                    \u00c9conomie : 20\u00a0000\u00a0\u20ac
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
