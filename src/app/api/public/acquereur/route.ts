import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererNumeroClient } from "@/lib/numero";
import bcrypt from "bcryptjs";

// POST /api/public/acquereur - Formulaire public acquéreur (sans auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prenom,
      nom,
      email,
      telephone,
      budgetMax,
      prixIdeal,
      notes,
    } = body;

    if (!prenom || !nom || !email) {
      return NextResponse.json(
        { error: "Prénom, nom et email sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si le client existe déjà
    let client = await prisma.client.findUnique({ where: { email } });

    if (client) {
      return NextResponse.json(
        {
          ok: true,
          message: "Vous avez déjà un compte. Connectez-vous pour soumettre des annonces.",
          clientId: client.id,
          exists: true,
        },
        { status: 200 }
      );
    }

    // Nouveau client acquéreur
    const numero = await genererNumeroClient("ACQUEREUR");

    const tempPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-8),
      12
    );

    const user = await prisma.user.create({
      data: {
        email,
        password: tempPassword,
        prenom,
        nom,
        telephone: telephone || null,
        role: "CLIENT_ACQUEREUR",
      },
    });

    client = await prisma.client.create({
      data: {
        numero,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        typeClient: "ACQUEREUR",
        statut: "PROSPECT",
        source: "FORMULAIRE",
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        prixIdeal: prixIdeal ? parseFloat(prixIdeal) : null,
        notes: notes || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Votre compte a été créé. Nous vous contacterons rapidement.",
        clientId: client.id,
        numero: client.numero,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    console.error("Erreur formulaire acquéreur:", e);
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
