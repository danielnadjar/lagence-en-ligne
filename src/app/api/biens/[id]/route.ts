import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// GET /api/biens/[id] - Détail d'un bien
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const bien = await prisma.bien.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      vendeur: true,
      photos: true,
      negociations: { orderBy: { ordre: "asc" } },
    },
  });

  if (!bien) {
    return NextResponse.json({ error: "Bien non trouvé" }, { status: 404 });
  }

  return NextResponse.json(bien);
}

// PATCH /api/biens/[id] - Modifier un bien
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessCRM((session.user as any).role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const data: any = {};

  const fields = [
    "lienAnnonce",
    "ville",
    "codePostal",
    "localisation",
    "typeBien",
    "statut",
    "commentaireFinal",
  ];
  fields.forEach((f) => {
    if (body[f] !== undefined) data[f] = body[f];
  });
  if (body.prixAffiche !== undefined)
    data.prixAffiche = parseFloat(body.prixAffiche);
  if (body.prixActuel !== undefined)
    data.prixActuel = parseFloat(body.prixActuel);
  if (body.surface !== undefined)
    data.surface = body.surface ? parseFloat(body.surface) : null;

  const bien = await prisma.bien.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(bien);
}

// DELETE /api/biens/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessCRM((session.user as any).role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.bien.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
