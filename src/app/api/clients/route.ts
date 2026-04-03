import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRolePermission } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }


    const clients = await prisma.client.findMany({
      where: { actif: true },
      include: {
        user: true,
        bien: true,
      },
    });

    return NextResponse.json(clients);
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { nom, prenom, email, telephone } = await req.json();

    const client = await prisma.client.create({
      data: {
        nom,
        prenom,
        email,
        telephone,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
