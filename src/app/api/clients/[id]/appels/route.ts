import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// GET /api/clients/[id]/appels - Liste des appels d'un client
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const appels = await prisma.appel.findMany({
      where: { clientId: params.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(appels);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/appels - Créer un appel
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { type, interlocuteur, telephone, duree, notes } = body;

    const appel = await prisma.appel.create({
      data: {
        clientId: params.id,
        type: type || "ENTRANT",
        interlocuteur: interlocuteur || null,
        telephone: telephone || null,
        duree: duree ? parseInt(duree) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(appel, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
