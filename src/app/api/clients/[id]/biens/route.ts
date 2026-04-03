import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// POST /api/clients/[id]/biens - Ajouter un bien à un client
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
      lienAnnonce,
      prixAffiche,
      ville,
      codePostal,
      localisation,
      surface,
      typeBien,
    } = body;

    if (!prixAffiche) {
      return NextResponse.json(
        { error: "Le prix affiché est requis" },
        { status: 400 }
      );
    }

    const bien = await prisma.bien.create({
      data: {
        lienAnnonce: lienAnnonce || null,
        prixAffiche: parseFloat(prixAffiche),
        ville: ville || null,
        codePostal: codePostal || null,
        localisation: localisation || null,
        surface: surface ? parseFloat(surface) : null,
        typeBien: typeBien || null,
        clientId: params.id,
      },
    });

    // Le prix affiché est stocké dans bien.prixAffiche
    // La négociation commence quand l'acquéreur fait sa première offre via le ping-pong

    return NextResponse.json(bien, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}