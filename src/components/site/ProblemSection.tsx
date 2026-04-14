"use client";

import { motion } from "framer-motion";
import { Warning, UserCircleMinus, ChartLineDown } from "@phosphor-icons/react";

const PROBLEMS = [
  {
    icon: ChartLineDown,
    title: "Vous avez peur de payer trop cher",
    description:
      "Sans analyse du march\u00e9, vous n\u2019avez aucune id\u00e9e du vrai prix d\u2019achat id\u00e9al. Les vendeurs et agents le savent.",
  },
  {
    icon: UserCircleMinus,
    title: "Vous \u00eates seul face au vendeur",
    description:
      "Le vendeur a un agent immobilier. Vous, vous n\u2019avez personne pour n\u00e9gocier l\u2019agence et leur commission.",
  },
  {
    icon: Warning,
    title: "Vous ne savez pas n\u00e9gocier",
    description:
      "N\u00e9gocier un bien immobilier demande de l\u2019expertise, de la strat\u00e9gie et des ann\u00e9es d\u2019exp\u00e9rience. Un acheteur seul surpaie presque toujours.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="site-container">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-red-500 tracking-wide uppercase mb-3">
            Le probl\u00e8me
          </p>
          <h2 className="heading-section">
            Acheter seul, c&apos;est risqu\u00e9
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {PROBLEMS.map((problem) => (
            <motion.div key={problem.title} variants={item} className="group">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                <problem.icon size={24} weight="duotone" className="text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900 tracking-tight">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm text-surface-500 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
