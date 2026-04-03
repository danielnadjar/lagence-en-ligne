import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCRM } from "@/lib/permissions";
import crypto from "crypto";

// POST /api/clients/[id]/mandat - Générer un token de signature pour le client
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessCRM((session.user as any).role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) {
    return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
  }

  if (client.mandatSigne) {
    return NextResponse.json({ error: "Le mandat est déjà signé" }, { status: 400 });
  }

  // Générer un token unique
  const token = crypto.randomBytes(32).toString("hex");

  await prisma.client.update({
    where: { id: params.id },
    data: { mandatToken: token },
  });

  const baseUrl = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const signUrl = `${protocol}://${baseUrl}/mandat/${token}`;

  return NextResponse.json({ token, signUrl });
}
