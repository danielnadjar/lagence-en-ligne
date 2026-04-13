import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// GET /api/clients/[id]/historique-prix - Historique des prix
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const historique = await prisma.historiquePrix.findMany({
      where: { clientId: params.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(historique);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/historique-prix - Enregistrer une baisse de prix
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
    const { prix, commentaire } = body;

    if (!prix) {
      return NextResponse.json({ error: "Le prix est requis" }, { status: 400 });
    }

    // Récupérer le client pour avoir le prix actuel
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: { prixVente: true },
    });

    const entry = await prisma.historiquePrix.create({
      data: {
        clientId: params.id,
        prix: parseFloat(prix),
        prixPrecedent: client?.prixVente || null,
        commentaire: commentaire || null,
      },
    });

    // Mettre à jour le prix du client
    await prisma.client.update({
      where: { id: params.id },
      data: { prixVente: parseFloat(prix) },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
