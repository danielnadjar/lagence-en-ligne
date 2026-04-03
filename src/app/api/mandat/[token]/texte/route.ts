import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MANDAT_TEMPLATE_DEFAULT, remplirMandat, genererNumeroMandat } from "@/lib/mandat-template";

// GET /api/mandat/[token]/texte - Retourner le texte du mandat rempli
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const client = await prisma.client.findUnique({
    where: { mandatToken: params.token },
  });

  if (!client) {
    return NextResponse.json({ error: "Lien invalide" }, { status: 404 });
  }

  // Générer un numéro de mandat si pas encore fait
  let mandatNumero = client.mandatNumero;
  if (!mandatNumero) {
    mandatNumero = genererNumeroMandat();
    await prisma.client.update({
      where: { id: client.id },
      data: { mandatNumero },
    });
  }

  // Charger le template personnalisé s'il existe
  const settings = await prisma.parametres.findUnique({
    where: { id: "default" },
  });
  const template = settings?.mandatTexte || MANDAT_TEMPLATE_DEFAULT;

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const telStr = client.telephone ? `, joignable au ${client.telephone}` : "";

  const texte = remplirMandat(template, {
    MANDAT_NUMERO: mandatNumero,
    CLIENT_PRENOM: client.prenom,
    CLIENT_NOM: client.nom,
    CLIENT_EMAIL: client.email,
    CLIENT_TELEPHONE: telStr,
    DATE_SIGNATURE: dateStr,
  });

  return NextResponse.json({ texte, mandatNumero });
}
