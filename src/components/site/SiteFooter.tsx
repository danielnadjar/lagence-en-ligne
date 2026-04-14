import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-200 bg-white">
      <div className="site-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-lg font-semibold tracking-tight text-surface-900">
              L&apos;Agence en Ligne
            </p>
            <p className="mt-2 text-sm text-surface-500 max-w-[30ch]">
              N\u00e9gociateur immobilier pour acheteurs. Toute la France.
            </p>
          </div>

          {/* Services */}
          <div>
            <p className="text-sm font-medium text-surface-900 mb-3">Services</p>
            <ul className="space-y-2">
              <li>
                <Link href="/negocier" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  N\u00e9gocier pour moi
                </Link>
              </li>
              <li>
                <Link href="/vendre" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  Vendre mon bien
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  Bar\u00e8me d&apos;honoraires
                </Link>
              </li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <p className="text-sm font-medium text-surface-900 mb-3">Ressources</p>
            <ul className="space-y-2">
              <li>
                <Link href="/qcm" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  QCM N\u00e9gociation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="text-sm text-surface-500 hover:text-surface-900 transition-colors">
                  \u00c0 propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Suivez-nous */}
          <div>
            <p className="text-sm font-medium text-surface-900 mb-3">Daniel NADJAR</p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.youtube.com/@danielnadjar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@danielnadjar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/danielnadjar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/danielnadjarimmo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-surface-500 hover:text-surface-900 transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-surface-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-400">
            &copy; {new Date().getFullYear()} L&apos;Agence en Ligne. Tous droits r\u00e9serv\u00e9s.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/mentions-legales" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">
              Mentions l\u00e9gales
            </Link>
            <Link href="/tarifs" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">
              Bar\u00e8me d&apos;honoraires
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
