"use client";

import { motion } from "framer-motion";
import { X, Check } from "@phosphor-icons/react";

export function ComparisonSection() {
  return (
    <section className="py-20 md:py-28 bg-surface-50">
      <div className="site-container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
            Comparaison
          </p>
          <h2 className="heading-section">
            Pourquoi nous plut\u00f4t qu&apos;une agence classique ?
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="mt-12 overflow-hidden rounded-2xl border border-surface-200 bg-white"
        >
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="p-4 md:p-6 text-sm font-medium text-surface-500" />
                <th className="p-4 md:p-6 text-sm font-medium text-surface-500">Agence classique</th>
                <th className="p-4 md:p-6 text-sm font-medium text-accent-600 bg-accent-50/50">
                  L&apos;Agence en Ligne
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              <tr>
                <td className="p-4 md:p-6 text-sm text-surface-700 font-medium">Commission vente (bien \u00e0 300k\u00a0\u20ac)</td>
                <td className="p-4 md:p-6 text-sm text-surface-600">15\u00a0000 \u2013 21\u00a0000\u00a0\u20ac (5-7%)</td>
                <td className="p-4 md:p-6 text-sm font-medium text-accent-700 bg-accent-50/50">
                  4\u00a0000 \u2013 6\u00a0000\u00a0\u20ac forfait
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-sm text-surface-700 font-medium">Service acheteur</td>
                <td className="p-4 md:p-6 text-sm text-surface-600">
                  <span className="inline-flex items-center gap-1 text-red-500">
                    <X size={14} weight="bold" /> Aucun
                  </span>
                </td>
                <td className="p-4 md:p-6 text-sm bg-accent-50/50">
                  <span className="inline-flex items-center gap-1 text-accent-600 font-medium">
                    <Check size={14} weight="bold" /> 500\u00a0\u20ac + 10% \u00e9conomie
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-sm text-surface-700 font-medium">Repr\u00e9sente qui ?</td>
                <td className="p-4 md:p-6 text-sm text-surface-600">Le vendeur</td>
                <td className="p-4 md:p-6 text-sm font-medium text-accent-700 bg-accent-50/50">
                  Vous, l&apos;acheteur
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-sm text-surface-700 font-medium">N\u00e9gociation professionnelle</td>
                <td className="p-4 md:p-6 text-sm text-surface-600">
                  <span className="inline-flex items-center gap-1 text-red-500">
                    <X size={14} weight="bold" /> Non
                  </span>
                </td>
                <td className="p-4 md:p-6 text-sm bg-accent-50/50">
                  <span className="inline-flex items-center gap-1 text-accent-600 font-medium">
                    <Check size={14} weight="bold" /> Outil ping-pong d\u00e9di\u00e9
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-4 md:p-6 text-sm text-surface-700 font-medium">Int\u00e9r\u00eats align\u00e9s</td>
                <td className="p-4 md:p-6 text-sm text-surface-600">
                  <span className="inline-flex items-center gap-1 text-red-500">
                    <X size={14} weight="bold" /> Commission sur prix \u00e9lev\u00e9
                  </span>
                </td>
                <td className="p-4 md:p-6 text-sm bg-accent-50/50">
                  <span className="inline-flex items-center gap-1 text-accent-600 font-medium">
                    <Check size={14} weight="bold" /> On gagne si vous \u00e9conomisez
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
