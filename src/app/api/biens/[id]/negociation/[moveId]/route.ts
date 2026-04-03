import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// PATCH /api/biens/[id]/negociation/[moveId] - Modifier un mouvement de négociation
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; moveId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: bienId, moveId } = params;

    // Vérifier que le move existe et appartient au bon bien
    const existingMove = await prisma.negociationMove.findFirst({
      where: { id: moveId, bienId },
    });

    if (!existingMove) {
      return NextResponse.json(
        { error: "Mouvement de négociation introuvable" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { commentaire, statut, montant } = body;

    // Construire les données à mettre à jour
    const updateData: Record<string, any> = {};

    if (commentaire !== undefined) {
      updateData.commentaire = commentaire;
    }

    if (statut !== undefined) {
      updateData.statut = statut;
    }

    if (montant !== undefined) {
      updateData.montant = typeof montant === "string" ? parseFloat(montant) : montant;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    // Mettre à jour le move
    const updatedMove = await prisma.negociationMove.update({
      where: { id: moveId },
      data: updateData,
    });

    // Si le statut passe à ACCEPTE, mettre à jour le bien
    if (statut === "ACCEPTE") {
      // Récupérer le montant de l'offre acceptée pour le prix final
      const prixFinal = updatedMove.montant;
      await prisma.bien.update({
        where: { id: bienId },
        data: {
          statut: "ACCORD_TROUVE",
          ...(prixFinal ? { prixActuel: prixFinal } : {}),
        },
      });
    }

    // Si le statut passe à REFUS, mettre à jour le statut du bien selon le camp
    if (statut === "REFUS") {
      if (existingMove.camp === "ACQUEREUR") {
        // L'acquéreur a fait une offre qui est refusée → en attente acquéreur (il doit refaire une offre)
        await prisma.bien.update({
          where: { id: bienId },
          data: { statut: "EN_ATTENTE_ACQUEREUR" },
        });
      } else {
        // Le vendeur a fait une offre qui est refusée → en attente vendeur
        await prisma.bien.update({
          where: { id: bienId },
          data: { statut: "EN_ATTENTE_VENDEUR" },
        });
      }
    }

    // Si le montant a été modifié (correction), mettre à jour le prix actuel du bien
    if (montant !== undefined && (existingMove.typeMove === "OFFRE" || existingMove.typeMove === "CONTRE_OFFRE")) {
      const parsedMontant = typeof montant === "string" ? parseFloat(montant) : montant;
      // Vérifier si c'est le dernier move avec montant (le prix actuel)
      const dernierMoveAvecMontant = await prisma.negociationMove.findFirst({
        where: { bienId, montant: { not: null } },
        orderBy: { ordre: "desc" },
      });
      if (dernierMoveAvecMontant && dernierMoveAvecMontant.id === moveId) {
        await prisma.bien.update({
          where: { id: bienId },
          data: { prixActuel: parsedMontant },
        });
      }
    }

    return NextResponse.json(updatedMove);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
