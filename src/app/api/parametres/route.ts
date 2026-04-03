import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import { MANDAT_TEMPLATE_DEFAULT } from "@/lib/mandat-template";

// GET /api/parametres - Récupérer les paramètres
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user as any)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  let params = await prisma.parametres.findUnique({
    where: { id: "default" },
  });

  // Si aucun paramètre n'existe, retourner le template par défaut
  if (!params) {
    return NextResponse.json({
      mandatTexte: MANDAT_TEMPLATE_DEFAULT,
    });
  }

  return NextResponse.json({
    mandatTexte: params.mandatTexte || MANDAT_TEMPLATE_DEFAULT,
  });
}

// PUT /api/parametres - Mettre à jour les paramètres
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin(session.user as any)) {
    return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
  }

  const body = await req.json();
  const { mandatTexte } = body;

  if (typeof mandatTexte !== "string") {
    return NextResponse.json({ error: "Texte du mandat requis" }, { status: 400 });
  }

  const params = await prisma.parametres.upsert({
    where: { id: "default" },
    update: { mandatTexte },
    create: { id: "default", mandatTexte },
  });

  return NextResponse.json({ ok: true, mandatTexte: params.mandatTexte });
}
