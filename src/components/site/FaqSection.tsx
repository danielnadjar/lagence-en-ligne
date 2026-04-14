"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";

const FAQS = [
  {
    question: "Que se passe-t-il si la n\u00e9gociation \u00e9choue ?",
    answer:
      "Vous ne payez que le forfait de 500\u00a0\u20ac. Les 10% ne s\u2019appliquent que sur les \u00e9conomies r\u00e9alis\u00e9es. Si nous ne n\u00e9gocions rien, vous ne payez rien de plus. Notre int\u00e9r\u00eat est totalement align\u00e9 avec le v\u00f4tre : on gagne uniquement si on vous fait \u00e9conomiser de l\u2019argent.",
  },
  {
    question: "Est-ce l\u00e9gal d\u2019utiliser un n\u00e9gociateur externe ?",
    answer:
      "Oui, c\u2019est parfaitement l\u00e9gal. Nous sommes une agence immobili\u00e8re avec carte professionnelle. Nous intervenons avec un mandat de recherche sign\u00e9 par l\u2019acheteur. Tout est encadr\u00e9 par la loi Hoguet et le d\u00e9cret du 20 juillet 1972 r\u00e9glementant la profession.",
  },
  {
    question: "Pourquoi ne pas acheter seul ?",
    answer:
      "Un acheteur seul fait face \u00e0 des professionnels entra\u00een\u00e9s : agents immobiliers, vendeurs exp\u00e9riment\u00e9s. Sans analyse de march\u00e9 ni strat\u00e9gie de n\u00e9gociation, il surpaie presque toujours. Notre expertise vous fait \u00e9conomiser bien plus que nos honoraires. Le QCM gratuit sur notre site le d\u00e9montre.",
  },
  {
    question: "Quand dois-je payer ?",
    answer:
      "Le forfait de 500\u00a0\u20ac et les 10% d\u2019\u00e9conomies sont payables uniquement \u00e0 l\u2019achat effectif du bien. Pas d\u2019achat, pas de frais. L\u2019analyse initiale de votre annonce est gratuite et sans engagement.",
  },
  {
    question: "Vous intervenez sur quels types de biens ?",
    answer:
      "Nous n\u00e9gocions tous types de biens immobiliers : appartements, maisons, immeubles, fonds de commerce et locaux commerciaux. Notre service couvre l\u2019ensemble du territoire fran\u00e7ais.",
  },
  {
    question: "Comment se passe la vente de mon bien ?",
    answer:
      "Vous d\u00e9posez votre bien via notre formulaire ou nous le cr\u00e9ons pour vous. Nous publions les annonces, organisons les visites (deux cr\u00e9neaux par semaine), et g\u00e9rons les offres. Vous suivez tout depuis votre espace personnel. Forfait fixe d\u00e8s 4\u00a0000\u00a0\u20ac au lieu de 5 \u00e0 7% en agence classique.",
  },
];

function FaqItem({ faq, index }: { faq: (typeof FAQS)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-surface-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-medium text-surface-900 pr-4 group-hover:text-accent-700 transition-colors">
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="shrink-0 text-surface-400"
        >
          <CaretDown size={18} weight="bold" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-surface-600 leading-relaxed max-w-[65ch]">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="site-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
              FAQ
            </p>
            <h2 className="heading-section">Questions fr\u00e9quentes</h2>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-surface-50 px-6 md:px-8">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Schema FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
    </section>
  );
}
