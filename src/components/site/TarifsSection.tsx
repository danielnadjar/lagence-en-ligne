"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "@phosphor-icons/react";

export function TarifsSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="site-container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
            Tarifs
          </p>
          <h2 className="heading-section">Vous ne payez que si vous achetez</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Acquéreur — large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="md:col-span-3 rounded-2xl border-2 border-accent-200 bg-accent-50/30 p-8 md:p-10"
          >
            <p className="text-sm font-medium text-accent-600 uppercase tracking-wide">
              Service acqu\u00e9reur
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tighter text-surface-950">500\u00a0\u20ac</span>
              <span className="text-surface-500">forfait unique</span>
            </div>
            <p className="mt-2 text-lg font-medium text-accent-700">
              + 10% des \u00e9conomies r\u00e9alis\u00e9es
            </p>
            <p className="mt-1 text-sm text-surface-500">
              Payable uniquement \u00e0 l&apos;achat effectif du bien
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Analyse compl\u00e8te du bien",
                "Strat\u00e9gie de n\u00e9gociation personnalis\u00e9e",
                "N\u00e9gociation professionnelle",
                "S\u00e9curisation juridique",
                "Accompagnement notaire",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-surface-700">
                  <ShieldCheck size={18} weight="fill" className="text-accent-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/negocier"
              className="mt-8 btn-accent inline-flex items-center gap-2"
            >
              Envoyer mon annonce
              <ArrowRight size={18} weight="bold" />
            </Link>
          </motion.div>

          {/* Vendeur — compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
            className="md:col-span-2 rounded-2xl border border-surface-200 bg-white p-8 md:p-10"
          >
            <p className="text-sm font-medium text-surface-500 uppercase tracking-wide">
              Service vendeur
            </p>
            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tighter text-surface-950">
                D\u00e8s 4\u00a0000\u00a0\u20ac
              </p>
              <p className="text-surface-500 text-sm mt-1">forfait fixe</p>
            </div>

            <div className="mt-6 space-y-3 text-sm text-surface-600">
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span>Appartement &lt; 400k</span>
                <span className="font-medium text-surface-900">4\u00a0000\u00a0\u20ac</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span>Maison &lt; 400k</span>
                <span className="font-medium text-surface-900">6\u00a0000\u00a0\u20ac</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span>Fonds de commerce</span>
                <span className="font-medium text-surface-900">10%</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Immeubles</span>
                <span className="font-medium text-surface-900">5%</span>
              </div>
            </div>

            <Link
              href="/vendre"
              className="mt-8 btn-outline inline-flex items-center gap-2 w-full justify-center"
            >
              Vendre mon bien
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
