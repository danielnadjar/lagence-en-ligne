import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// POST /api/biens/[id]/vendeur - Créer ou mettre à jour le vendeur
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
    const { nom, telephone, email, notes, contexte } = body;

    // Vérifier si un vendeur existe déjà
    const existant = await prisma.vendeur.findUnique({
      where: { bienId: params.id },
    });

    if (existant) {
      const vendeur = await prisma.vendeur.update({
        where: { bienId: params.id },
        data: {
          nom: nom !== undefined ? nom : existant.nom,
          telephone: telephone !== undefined ? telephone : existant.telephone,
          email: email !== undefined ? email : existant.email,
          notes: notes !== undefined ? notes : existant.notes,
          contexte: contexte !== undefined ? contexte : existant.contexte,
        },
      });
      return NextResponse.json(vendeur);
    }

    const vendeur = await prisma.vendeur.create({
      data: {
        nom: nom || null,
        telephone: telephone || null,
        email: email || null,
        notes: notes || null,
        contexte: contexte || null,
        bienId: params.id,
      },
    });

    return NextResponse.json(vendeur, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}