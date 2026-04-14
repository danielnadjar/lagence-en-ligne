"use client";

import { motion } from "framer-motion";
import {
  PaperPlaneTilt,
  MagnifyingGlass,
  Phone,
  Handshake,
  ShieldCheck,
  Key,
} from "@phosphor-icons/react";

const STEPS = [
  {
    num: "01",
    icon: PaperPlaneTilt,
    title: "Envoyez une annonce",
    description: "Partagez le lien de l\u2019annonce qui vous int\u00e9resse",
  },
  {
    num: "02",
    icon: MagnifyingGlass,
    title: "Nous analysons",
    description: "\u00c9tude du march\u00e9, du bien et du vendeur",
  },
  {
    num: "03",
    icon: Phone,
    title: "Nous appelons",
    description: "Prise de contact avec le vendeur ou l\u2019agent",
  },
  {
    num: "04",
    icon: Handshake,
    title: "Nous n\u00e9gocions",
    description: "Strat\u00e9gie de n\u00e9gociation personnalis\u00e9e",
  },
  {
    num: "05",
    icon: ShieldCheck,
    title: "Nous s\u00e9curisons",
    description: "V\u00e9rification juridique et administrative",
  },
  {
    num: "06",
    icon: Key,
    title: "Vous achetez au bon prix",
    description: "Signature en toute s\u00e9r\u00e9nit\u00e9",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function ProcessSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="site-container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
            Le processus
          </p>
          <h2 className="heading-section">Comment \u00e7a marche</h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={item}
              className="relative rounded-2xl border border-surface-200 bg-surface-50 p-6 hover:border-accent-200 hover:bg-accent-50/30 transition-colors group"
            >
              <span className="text-xs font-mono font-medium text-surface-400 group-hover:text-accent-500 transition-colors">
                {step.num}
              </span>
              <div className="mt-3 w-10 h-10 rounded-xl bg-white border border-surface-200 flex items-center justify-center group-hover:border-accent-200 transition-colors">
                <step.icon size={20} weight="duotone" className="text-surface-600 group-hover:text-accent-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-surface-900 tracking-tight">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-surface-500">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
