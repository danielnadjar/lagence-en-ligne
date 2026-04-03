import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererNumeroMandat } from "@/lib/mandat-template";

// GET /api/mandat/[token] - Récupérer les infos du client pour afficher le mandat
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const client = await prisma.client.findUnique({
    where: { mandatToken: params.token },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      mandatSigne: true,
      mandatDate: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  return NextResponse.json(client);
}

// POST /api/mandat/[token] - Sauvegarder la signature
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const client = await prisma.client.findUnique({
    where: { mandatToken: params.token },
  });

  if (!client) {
    return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 404 });
  }

  if (client.mandatSigne) {
    return NextResponse.json({ error: "Le mandat est déjà signé" }, { status: 400 });
  }

  const body = await req.json();
  const { signature } = body;

  if (!signature) {
    return NextResponse.json({ error: "Signature requise" }, { status: 400 });
  }

  const now = new Date();

  // Capturer IP et User-Agent pour traçabilité
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "inconnue";
  const userAgent = req.headers.get("user-agent") || "inconnu";

  // S'assurer qu'il y a un numéro de mandat
  let mandatNumero = client.mandatNumero;
  if (!mandatNumero) {
    mandatNumero = genererNumeroMandat();
  }

  // Sauvegarder tout : signature, date/heure, IP, navigateur, numéro
  await prisma.client.update({
    where: { mandatToken: params.token },
    data: {
      mandatSigne: true,
      mandatDate: now,
      mandatSignature: signature,
      mandatIP: ip,
      mandatUserAgent: userAgent,
      mandatNumero,
    },
  });

  return NextResponse.json({
    ok: true,
    mandatDate: now.toISOString(),
    mandatNumero,
    message: "Mandat signé avec succès",
  });
}
