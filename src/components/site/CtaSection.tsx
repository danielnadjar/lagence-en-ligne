"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";

export function CtaSection() {
  return (
    <section className="py-20 md:py-28 bg-surface-950">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="max-w-2xl"
        >
          <h2 className="text-3xl md:text-5xl tracking-tighter leading-none font-semibold text-white">
            Vous pr\u00e9f\u00e9rez payer 500\u00a0\u20ac{" "}
            <span className="text-surface-500">
              ou surpayer votre bien de 20\u00a0000\u00a0\u20ac ?
            </span>
          </h2>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/negocier"
              className="bg-accent-500 hover:bg-accent-400 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              Envoyer mon annonce
              <ArrowRight size={18} weight="bold" />
            </Link>
            <Link
              href="/qcm"
              className="border border-surface-700 hover:border-surface-500 text-surface-300 hover:text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 inline-flex items-center justify-center"
            >
              Tester mes comp\u00e9tences (QCM gratuit)
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
