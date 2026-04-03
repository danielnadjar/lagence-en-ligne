import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessCRM } from "@/lib/permissions";

// POST /api/scrape-annonce - Scraper les infos d'une annonce immobilière
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    // Tenter de fetch la page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Impossible de charger l'annonce" },
        { status: 422 }
      );
    }

    const html = await response.text();
    const result: {
      prix?: number;
      ville?: string;
      codePostal?: string;
      surface?: number;
      typeBien?: string;
    } = {};

    // ===== Extraction du prix =====
    // Patterns communs pour le prix dans les annonces
    const prixPatterns = [
      /(\d[\d\s.,]*)\s*€/,
      /"price"[:\s]*["\s]*(\d[\d\s.,]*)/i,
      /prix[^0-9]*(\d[\d\s.,]+)/i,
      /price_value[^0-9]*(\d[\d\s.,]+)/i,
    ];
    for (const pattern of prixPatterns) {
      const match = html.match(pattern);
      if (match) {
        const cleaned = match[1].replace(/[\s.]/g, "").replace(",", ".");
        const prix = parseFloat(cleaned);
        if (prix > 1000 && prix < 100000000) {
          result.prix = prix;
          break;
        }
      }
    }

    // ===== Extraction de la ville et code postal =====
    const cpVillePatterns = [
      /(\d{5})\s+([A-ZÀ-Ü][a-zà-ü\-\s]+)/,
      /(?:ville|city|location)[^A-Za-z]*([A-ZÀ-Ü][a-zà-ü\-\s]+)/i,
      /"postalCode"[:\s]*"(\d{5})"/i,
      /"addressLocality"[:\s]*"([^"]+)"/i,
    ];
    for (const pattern of cpVillePatterns) {
      const match = html.match(pattern);
      if (match) {
        if (/^\d{5}$/.test(match[1])) {
          result.codePostal = match[1];
          if (match[2]) result.ville = match[2].trim();
        } else {
          result.ville = match[1].trim();
        }
        break;
      }
    }

    // ===== Extraction de la surface =====
    const surfacePatterns = [
      /(\d+[\d.,]*)\s*m²/i,
      /surface[^0-9]*(\d+[\d.,]*)/i,
      /"floorSize"[^0-9]*(\d+[\d.,]*)/i,
    ];
    for (const pattern of surfacePatterns) {
      const match = html.match(pattern);
      if (match) {
        const surface = parseFloat(match[1].replace(",", "."));
        if (surface > 5 && surface < 10000) {
          result.surface = surface;
          break;
        }
      }
    }

    // ===== Extraction du type de bien =====
    const typeMapping: Record<string, string> = {
      appartement: "APPARTEMENT",
      maison: "MAISON",
      immeuble: "IMMEUBLE",
      "fonds de commerce": "FONDS_COMMERCE",
      "local commercial": "LOCAL_COMMERCIAL",
      studio: "APPARTEMENT",
      duplex: "APPARTEMENT",
      loft: "APPARTEMENT",
      villa: "MAISON",
      pavillon: "MAISON",
    };
    const htmlLower = html.toLowerCase();
    for (const [keyword, type] of Object.entries(typeMapping)) {
      if (htmlLower.includes(keyword)) {
        result.typeBien = type;
        break;
      }
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    return NextResponse.json(
      {
        error: "Erreur lors du scraping",
        details: e instanceof Error ? e.message : "unknown",
      },
      { status: 500 }
    );
  }
}
