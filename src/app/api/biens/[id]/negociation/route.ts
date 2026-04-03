import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// POST /api/biens/[id]/negociation - Ajouter un mouvement de négociation
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
    const { camp, typeMove, montant, statut, commentaire, interne } = body;

    if (!camp || !typeMove) {
      return NextResponse.json(
        { error: "Camp et type de mouvement requis" },
        { status: 400 }
      );
    }

    // Calculer le prochain ordre
    const dernierMove = await prisma.negociationMove.findFirst({
      where: { bienId: params.id },
      orderBy: { ordre: "desc" },
    });

    const ordre = (dernierMove?.ordre || 0) + 1;

    const move = await prisma.negociationMove.create({
      data: {
        ordre,
        camp,
        typeMove,
        montant: montant ? parseFloat(montant) : null,
        statut: statut || null,
        commentaire: commentaire || null,
        interne: interne || false,
        bienId: params.id,
        auteurId: (session.user as any).id,
      },
    });

    // Mettre à jour le prix actuel du bien si c'est une offre avec montant
    if (montant && (typeMove === "OFFRE" || typeMove === "CONTRE_OFFRE")) {
      await prisma.bien.update({
        where: { id: params.id },
        data: { prixActuel: parseFloat(montant) },
      });
    }

    // Mettre à jour le statut du bien selon la logique ping-pong
    // L'acquéreur fait une offre/contre-offre → la balle passe au vendeur
    // Le vendeur fait une offre/contre-offre → la balle passe à l'acquéreur
    if (typeMove === "OFFRE" || typeMove === "CONTRE_OFFRE") {
      if (camp === "ACQUEREUR") {
        await prisma.bien.update({
          where: { id: params.id },
          data: { statut: "EN_ATTENTE_VENDEUR" },
        });
      } else if (camp === "VENDEUR") {
        await prisma.bien.update({
          where: { id: params.id },
          data: { statut: "EN_ATTENTE_ACQUEREUR" },
        });
      }
    }

    // Si c'est la première offre, passer le bien en NEGO_DEMARREE puis EN_ATTENTE_VENDEUR
    if (typeMove === "OFFRE" && ordre === 1) {
      await prisma.bien.update({
        where: { id: params.id },
        data: { statut: "EN_ATTENTE_VENDEUR" },
      });
    }

    return NextResponse.json(move, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/biens/[id]/negociation - Remettre à zéro toute la négociation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Supprimer tous les moves de ce bien
    await prisma.negociationMove.deleteMany({
      where: { bienId: params.id },
    });

    // Remettre le bien en statut initial
    await prisma.bien.update({
      where: { id: params.id },
      data: { prixActuel: null, statut: "NOUVEAU" },
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
