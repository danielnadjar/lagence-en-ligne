import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "L'Agence en Ligne — Négociateur Immobilier",
    template: "%s | L'Agence en Ligne",
  },
  description:
    "Agence immobilière digitale spécialisée dans la négociation pour les acheteurs en France. Forfait 500\u00a0\u20ac + 10% des économies réalisées. Vente dès 4\u00a0000\u00a0\u20ac forfait. Fondée par Daniel NADJAR.",
  metadataBase: new URL("https://negociateur.lesite.online"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "L'Agence en Ligne",
    title: "L'Agence en Ligne — Négociateur Immobilier pour Acheteurs",
    description:
      "La seule agence immobilière qui négocie pour vous. 500\u00a0\u20ac + 10% des économies.",
  },
  twitter: {
    card: "summary_large_image",
    title: "L'Agence en Ligne — Négociateur Immobilier",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://negociateur.lesite.online",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "L'Agence en Ligne",
              url: "https://negociateur.lesite.online",
              description:
                "Agence immobilière digitale spécialisée dans la négociation pour les acheteurs en France",
              founder: {
                "@type": "Person",
                name: "Daniel NADJAR",
                sameAs: [
                  "https://www.youtube.com/@danielnadjar",
                  "https://www.tiktok.com/@danielnadjar",
                  "https://www.linkedin.com/in/danielnadjar/",
                  "https://www.instagram.com/danielnadjarimmo/",
                ],
              },
              areaServed: {
                "@type": "Country",
                name: "France",
              },
              priceRange: "Dès 500\u00a0\u20ac",
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
