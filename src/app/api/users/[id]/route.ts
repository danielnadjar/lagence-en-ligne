import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// PATCH /api/users/[id] - Modifier un utilisateur
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const data: any = {};

    if (body.prenom !== undefined) data.prenom = body.prenom;
    if (body.nom !== undefined) data.nom = body.nom;
    if (body.email !== undefined) data.email = body.email;
    if (body.telephone !== undefined) data.telephone = body.telephone || null;
    if (body.role !== undefined) data.role = body.role;
    if (body.actif !== undefined) data.actif = body.actif;
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 12);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        telephone: true,
        role: true,
        actif: true,
      },
    });

    return NextResponse.json(user);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Ne pas pouvoir se supprimer soi-même
    if (params.id === (session.user as any).id) {
      return NextResponse.json(
        { error: "Impossible de supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Désassigner les clients avant de supprimer
    await prisma.client.updateMany({
      where: { negociateurId: params.id },
      data: { negociateurId: null },
    });

    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
