import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { genererNumeroClient } from "@/lib/numero";
import { isAdmin, canAccessCRM } from "@/lib/permissions";
import bcrypt from "bcryptjs";

// GET /api/clients - Liste des clients
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const statut = searchParams.get("statut") || "";
    const source = searchParams.get("source") || "";
    const nonAssigne = searchParams.get("nonAssigne"); // Pour la pioche QCM
    const negociateurId = searchParams.get("negociateurId");

    const where: any = {};

    // NEGOCIATEUR : ne voit que ses clients assignés
    if (userRole === "NEGOCIATEUR") {
      where.negociateurId = userId;
    }

    // Filtres admin
    if (negociateurId && isAdmin(userRole)) {
      where.negociateurId = negociateurId;
    }

    // Pioche : clients non assignés (pour QCM par exemple)
    if (nonAssigne === "true" && isAdmin(userRole)) {
      where.negociateurId = null;
    }

    if (search) {
      where.OR = [
        { prenom: { contains: search } },
        { nom: { contains: search } },
        { email: { contains: search } },
        { telephone: { contains: search } },
        { numero: { contains: search } },
      ];
    }
    if (statut) where.statut = statut;
    if (source) where.source = source;

    const clients = await prisma.client.findMany({
      where,
      include: {
        biens: {
          select: { id: true, statut: true, prixAffiche: true, ville: true },
        },
        negociateur: {
          select: { id: true, prenom: true, nom: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}

// POST /api/clients - Créer un client
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !canAccessCRM((session.user as any).role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    const body = await req.json();
    const { prenom, nom, email, telephone, budgetMax, prixIdeal, source, notes, negociateurId } = body;

    if (!prenom || !nom || !email) {
      return NextResponse.json(
        { error: "Prénom, nom et email requis" },
        { status: 400 }
      );
    }

    // Vérifier unicité email dans Client
    const existeClient = await prisma.client.findUnique({ where: { email } });
    if (existeClient) {
      return NextResponse.json(
        { error: "Un client avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const numero = await genererNumeroClient();

    // Vérifier si un User existe déjà avec cet email (ex: négociateur, admin)
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Créer un compte utilisateur automatiquement
      const tempPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        12
      );

      user = await prisma.user.create({
        data: {
          email,
          password: tempPassword,
          prenom,
          nom,
          telephone: telephone || null,
          role: "CLIENT",
        },
      });
    }

    // Déterminer le négociateur assigné
    let assignedNegociateurId = negociateurId || null;
    // Si c'est un négociateur qui crée le client (source EXTERIEUR), auto-assignation
    if (userRole === "NEGOCIATEUR") {
      assignedNegociateurId = userId;
    }

    const client = await prisma.client.create({
      data: {
        numero,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        prixIdeal: prixIdeal ? parseFloat(prixIdeal) : null,
        notes: notes || null,
        source: source || (userRole === "NEGOCIATEUR" ? "EXTERIEUR" : "CRM"),
        userId: user.id,
        negociateurId: assignedNegociateurId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
