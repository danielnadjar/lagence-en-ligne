"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MagnifyingGlass, Handshake, FileText } from "@phosphor-icons/react";

export function SolutionSection() {
  return (
    <section className="py-20 md:py-28 bg-surface-50">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Left — Visual card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="relative"
          >
            <div className="rounded-3xl bg-white border border-surface-200 p-8 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="space-y-6">
                {[
                  { icon: MagnifyingGlass, label: "Analyse du march\u00e9", status: "Termin\u00e9e" },
                  { icon: Handshake, label: "N\u00e9gociation en cours", status: "Offre \u00e0 185\u00a0000\u00a0\u20ac" },
                  { icon: FileText, label: "Dossier juridique", status: "En attente" },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        i === 1
                          ? "bg-accent-100 border border-accent-200"
                          : i === 0
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-surface-100 border border-surface-200"
                      }`}
                    >
                      <step.icon
                        size={20}
                        weight="duotone"
                        className={
                          i === 1 ? "text-accent-600" : i === 0 ? "text-emerald-600" : "text-surface-400"
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-900">{step.label}</p>
                      <p className="text-xs text-surface-500">{step.status}</p>
                    </div>
                    {i === 0 && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Fait
                      </span>
                    )}
                    {i === 1 && (
                      <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                        En cours
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
          >
            <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
              La solution
            </p>
            <h2 className="heading-section">
              Prenez un n\u00e9gociateur avec vous
            </h2>
            <p className="mt-4 body-text">
              Nous appelons, analysons, d\u00e9tectons les failles, n\u00e9gocions et s\u00e9curisons votre
              achat. Tout \u00e0 votre place.
            </p>
            <p className="mt-4 body-text">
              Votre dossier est pris en charge par notre cellule de n\u00e9gociation. Une \u00e9quipe
              d\u00e9di\u00e9e analyse chaque d\u00e9tail pour vous obtenir le meilleur prix possible.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-accent-700 font-medium">
              <ShieldCheck size={18} weight="fill" />
              Vous ne payez que si vous achetez
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
