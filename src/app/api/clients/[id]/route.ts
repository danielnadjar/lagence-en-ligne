import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, canAccessCRM, isClientRole } from "@/lib/permissions";

// GET /api/clients/[id] - Fiche client complète
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        biens: {
          include: {
            vendeur: true,
            photos: true,
            negociations: {
              orderBy: { ordre: "asc" },
              where: isClientRole(role) ? { interne: false } : {},
            },
          },
          orderBy: { createdAt: "desc" },
        },
        user: { select: { id: true, email: true } },
        negociateur: { select: { id: true, prenom: true, nom: true } },
        appels: { orderBy: { date: "desc" } },
        visites: { orderBy: { dateVisite: "desc" } },
        historiquePrix: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    // Un client ne peut voir que sa propre fiche
    if (isClientRole(role) && client.userId !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Un négociateur ne peut voir que ses clients assignés
    if (role === "NEGOCIATEUR" && client.negociateurId !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Masquer les infos sensibles vendeur pour le client
    if (isClientRole(role)) {
      client.biens = client.biens.map((bien: any) => ({
        ...bien,
        vendeur: bien.vendeur
          ? {
              ...bien.vendeur,
              notes: null,
              contexte: null,
              telephone: null,
              email: null,
            }
          : null,
      }));
    }

    return NextResponse.json(client);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Modifier un client
export async function PATCH(
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
      prenom,
      nom,
      telephone,
      budgetMax,
      prixIdeal,
      notes,
      statut,
    } = body;

    const data: any = {};
    if (prenom !== undefined) data.prenom = prenom;
    if (nom !== undefined) data.nom = nom;
    if (telephone !== undefined) data.telephone = telephone;
    if (budgetMax !== undefined) data.budgetMax = budgetMax ? parseFloat(budgetMax) : null;
    if (prixIdeal !== undefined) data.prixIdeal = prixIdeal ? parseFloat(prixIdeal) : null;
    if (notes !== undefined) data.notes = notes;
    if (statut !== undefined) data.statut = statut;
    if (body.negociateurId !== undefined) data.negociateurId = body.negociateurId || null;
    if (body.source !== undefined) data.source = body.source;
    if (body.typeClient !== undefined) data.typeClient = body.typeClient;
    if (body.prixVente !== undefined) data.prixVente = body.prixVente ? parseFloat(body.prixVente) : null;
    if (body.adresseBien !== undefined) data.adresseBien = body.adresseBien;
    if (body.villeVente !== undefined) data.villeVente = body.villeVente;
    if (body.surfaceBien !== undefined) data.surfaceBien = body.surfaceBien ? parseFloat(body.surfaceBien) : null;
    if (body.typeBienVente !== undefined) data.typeBienVente = body.typeBienVente;
    if (body.descriptionBien !== undefined) data.descriptionBien = body.descriptionBien;
    if (body.financementOk !== undefined) data.financementOk = body.financementOk;

    const client = await prisma.client.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(client);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Admin requis" }, { status: 401 });
    }

    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}