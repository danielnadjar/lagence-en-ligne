import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// GET /api/users - Lister les utilisateurs (filtrable par rôle)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { prenom: { contains: search } },
        { nom: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
        _count: { select: { clientsAssignes: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// POST /api/users - Créer un utilisateur/négociateur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, prenom, nom, telephone, role } = body;

    if (!email || !password || !prenom || !nom) {
      return NextResponse.json(
        { error: "Email, mot de passe, prénom et nom sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que l'email n'existe pas déjà
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        prenom,
        nom,
        telephone: telephone || null,
        role: role || "NEGOCIATEUR",
      },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        telephone: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
