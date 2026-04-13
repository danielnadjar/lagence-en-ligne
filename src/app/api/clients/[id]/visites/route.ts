import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// GET /api/clients/[id]/visites - Liste des visites d'un client
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const visites = await prisma.visite.findMany({
      where: { clientId: params.id },
      orderBy: { dateVisite: "desc" },
    });

    return NextResponse.json(visites);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/visites - Planifier une visite
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
    const {
      dateVisite,
      creneau,
      visiteurNom,
      visiteurPrenom,
      visiteurEmail,
      visiteurTelephone,
      financementOk,
      bienId,
    } = body;

    if (!dateVisite) {
      return NextResponse.json(
        { error: "La date de visite est requise" },
        { status: 400 }
      );
    }

    const visite = await prisma.visite.create({
      data: {
        clientId: params.id,
        dateVisite: new Date(dateVisite),
        creneau: creneau || null,
        statut: "PLANIFIEE",
        visiteurNom: visiteurNom || null,
        visiteurPrenom: visiteurPrenom || null,
        visiteurEmail: visiteurEmail || null,
        visiteurTelephone: visiteurTelephone || null,
        financementOk: financementOk !== null && financementOk !== undefined ? financementOk : null,
        bienId: bienId || null,
      },
    });

    return NextResponse.json(visite, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
