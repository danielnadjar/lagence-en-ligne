"use client";

import { motion } from "framer-motion";
import { YoutubeLogo, TiktokLogo, LinkedinLogo, InstagramLogo } from "@phosphor-icons/react";

const SOCIALS = [
  { icon: YoutubeLogo, href: "https://www.youtube.com/@danielnadjar", label: "YouTube" },
  { icon: TiktokLogo, href: "https://www.tiktok.com/@danielnadjar", label: "TikTok" },
  { icon: LinkedinLogo, href: "https://www.linkedin.com/in/danielnadjar/", label: "LinkedIn" },
  { icon: InstagramLogo, href: "https://www.instagram.com/danielnadjarimmo/", label: "Instagram" },
];

export function FounderSection() {
  return (
    <section className="py-20 md:py-28 bg-surface-50">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          {/* Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="md:col-span-2"
          >
            <div className="aspect-[3/4] rounded-3xl bg-gradient-to-b from-surface-200 to-surface-300 border border-surface-200 flex items-end justify-center overflow-hidden">
              {/* Placeholder: remplacer par la vraie photo de Daniel */}
              <div className="p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-surface-400/50 mx-auto mb-3" />
                <p className="text-sm text-surface-500">Photo Daniel NADJAR</p>
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
            className="md:col-span-3"
          >
            <p className="text-sm font-medium text-accent-600 tracking-wide uppercase mb-3">
              Fondateur
            </p>
            <h2 className="heading-section">Daniel NADJAR</h2>
            <p className="mt-4 body-text">
              20 ans d&apos;exp\u00e9rience en immobilier. Cr\u00e9ateur de contenu sur YouTube,
              TikTok, LinkedIn et Instagram. Formateur, coach et n\u00e9gociateur professionnel.
            </p>
            <p className="mt-3 body-text">
              Avec 126&nbsp;000 abonn\u00e9s qui lui font confiance, Daniel a cr\u00e9\u00e9
              L&apos;Agence en Ligne pour offrir aux acheteurs ce qui n&apos;existait pas :
              un n\u00e9gociateur qui d\u00e9fend leurs int\u00e9r\u00eats.
            </p>

            {/* Stats */}
            <div className="mt-8 flex items-center gap-8">
              <div>
                <p className="text-3xl font-semibold tracking-tighter text-surface-950">126k</p>
                <p className="text-sm text-surface-500">abonn\u00e9s</p>
              </div>
              <div className="w-px h-10 bg-surface-200" />
              <div>
                <p className="text-3xl font-semibold tracking-tighter text-surface-950">20+</p>
                <p className="text-sm text-surface-500">ans d&apos;exp\u00e9rience</p>
              </div>
              <div className="w-px h-10 bg-surface-200" />
              <div>
                <p className="text-3xl font-semibold tracking-tighter text-surface-950">France</p>
                <p className="text-sm text-surface-500">enti\u00e8re</p>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-8 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl border border-surface-200 bg-white flex items-center justify-center text-surface-500 hover:text-accent-600 hover:border-accent-200 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} weight="fill" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
