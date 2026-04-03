import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";
import { genererMandatPdf } from "@/lib/pdf-generator";
import { MANDAT_TEMPLATE_DEFAULT, remplirMandat } from "@/lib/mandat-template";

// GET /api/clients/[id]/mandat/pdf - Télécharger le PDF du mandat signé
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !canAccessCRM(session.user as any)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
  });

  if (!client) {
    return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  }

  if (!client.mandatSigne || !client.mandatDate) {
    return NextResponse.json({ error: "Le mandat n'est pas encore signé" }, { status: 400 });
  }

  // Charger le template (personnalisé ou par défaut)
  const parametres = await prisma.parametres.findUnique({
    where: { id: "default" },
  });
  const template = parametres?.mandatTexte || MANDAT_TEMPLATE_DEFAULT;

  const signDate = new Date(client.mandatDate);
  const dateStr = signDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const heureStr = signDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const telStr = client.telephone ? `, joignable au ${client.telephone}` : "";

  const mandatTexte = remplirMandat(template, {
    MANDAT_NUMERO: client.mandatNumero || "N/A",
    CLIENT_PRENOM: client.prenom,
    CLIENT_NOM: client.nom,
    CLIENT_EMAIL: client.email,
    CLIENT_TELEPHONE: telStr,
    DATE_SIGNATURE: dateStr,
  });

  const pdfBuffer = genererMandatPdf({
    mandatTexte,
    mandatNumero: client.mandatNumero || "N/A",
    clientNom: client.nom,
    clientPrenom: client.prenom,
    clientEmail: client.email,
    dateSignature: dateStr,
    heureSignature: heureStr,
    ip: client.mandatIP || "N/A",
    userAgent: client.mandatUserAgent || "N/A",
    signatureBase64: client.mandatSignature || undefined,
  });

  const filename = `mandat-${client.mandatNumero || client.id}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
