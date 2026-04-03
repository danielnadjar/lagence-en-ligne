import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";

// GET /api/vendeurs - Lister tous les vendeurs avec recherche
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessCRM((session.user as any).role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const where: any = {};

  if (search) {
    where.OR = [
      { nom: { contains: search } },
      { telephone: { contains: search } },
      { email: { contains: search } },
      { notes: { contains: search } },
      { bien: { ville: { contains: search } } },
      { bien: { client: { nom: { contains: search } } } },
      { bien: { client: { prenom: { contains: search } } } },
    ];
  }

  const vendeurs = await prisma.vendeur.findMany({
    where,
    include: {
      bien: {
        include: {
          client: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vendeurs);
}
