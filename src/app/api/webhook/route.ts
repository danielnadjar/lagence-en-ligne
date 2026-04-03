import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererNumeroClient } from "@/lib/numero";
import bcrypt from "bcryptjs";

// POST /api/webhook - Recevoir des leads de Lovable, QCM ou Make
// Ce endpoint est accessible sans auth (webhook)
// Protégé par un token simple dans le header
export async function POST(req: NextRequest) {
  // Vérification basique par token (à configurer)
  const token = req.headers.get("x-webhook-token");
  const expectedToken = process.env.WEBHOOK_SECRET || "webhook-secret-change-me";

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const body = await req.json();
  const {
    email,
    prenom,
    nom,
    telephone,
    lienAnnonce,
    message,
    source,
    budgetMax,
    prixIdeal,
  } = body;

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  // Vérifier si le client existe déjà
  let client = await prisma.client.findUnique({ where: { email } });

  if (!client) {
    const numero = await genererNumeroClient();

    // Créer un compte utilisateur
    const tempPassword = await bcrypt.hash(
      Math.random().toString(36).slice(-8),
      12
    );

    const user = await prisma.user.create({
      data: {
        email,
        password: tempPassword,
        prenom: prenom || "Prospect",
        nom: nom || "",
        telephone: telephone || null,
        role: "CLIENT",
      },
    });

    client = await prisma.client.create({
      data: {
        numero,
        prenom: prenom || "Prospect",
        nom: nom || "",
        email,
        telephone: telephone || null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        prixIdeal: prixIdeal ? parseFloat(prixIdeal) : null,
        notes: message || null,
        source: source || "LOVABLE",
        userId: user.id,
      },
    });
  }

  // Si un lien d'annonce est fourni, créer un bien automatiquement
  if (lienAnnonce) {
    await prisma.bien.create({
      data: {
        lienAnnonce,
        prixAffiche: 0, // À remplir manuellement ou via IA
        statut: "NOUVEAU",
        sourceData: "webhook",
        clientId: client.id,
      },
    });
  }

  return NextResponse.json(
    {
      ok: true,
      clientId: client.id,
      numero: client.numero,
      message: "Lead reçu et traité",
    },
    { status: 201 }
  );
}
