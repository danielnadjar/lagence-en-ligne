import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// POST /api/clients/[id]/appel-rapide - Compteur rapide +1 appel
// Enregistre un appel entrant avec la date et heure exacte
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const appel = await prisma.appel.create({
      data: {
        clientId: params.id,
        type: "ENTRANT",
        notes: body.notes || "Appel comptabilisé (bouton rapide)",
        date: new Date(),
      },
    });

    // Retourner aussi le total d'appels
    const totalAppels = await prisma.appel.count({
      where: { clientId: params.id },
    });

    // Stats par jour (derniers 30 jours)
    const trentJoursAvant = new Date();
    trentJoursAvant.setDate(trentJoursAvant.getDate() - 30);

    const appelsRecents = await prisma.appel.findMany({
      where: {
        clientId: params.id,
        date: { gte: trentJoursAvant },
      },
      select: { date: true },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      ok: true,
      appel,
      totalAppels,
      appelsRecents: appelsRecents.map((a) => a.date),
    }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
