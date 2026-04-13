import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererNumeroClient } from "@/lib/numero";
import bcrypt from "bcryptjs";

// POST /api/webhook - Recevoir des leads de Lovable, QCM, Make ou Chatbot
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
    // Champs chatbot
    ville,
    typeBien,
    conversationResume,
    // Type de client
    typeClient,
  } = body;

  if (!email) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  // Construire les notes à partir du message et/ou du résumé de conversation
  const notesParts = [];
  if (conversationResume) notesParts.push(`[Chatbot] ${conversationResume}`);
  if (ville) notesParts.push(`Ville recherchée : ${ville}`);
  if (typeBien) notesParts.push(`Type de bien : ${typeBien}`);
  if (message) notesParts.push(message);
  const notesFinales = notesParts.length > 0 ? notesParts.join("\n") : null;

  // Vérifier si le client existe déjà
  let client = await prisma.client.findUnique({ where: { email } });
  let isNew = false;

  if (!client) {
    isNew = true;
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

    const clientType = typeClient || "ACQUEREUR";
    client = await prisma.client.create({
      data: {
        numero,
        prenom: prenom || "Prospect",
        nom: nom || "",
        email,
        telephone: telephone || null,
        budgetMax: budgetMax ? parseFloat(budgetMax) : null,
        prixIdeal: prixIdeal ? parseFloat(prixIdeal) : null,
        notes: notesFinales,
        source: source || "LOVABLE",
        typeClient: clientType,
        statut: "PROSPECT",
        userId: user.id,
      },
    });
  } else {
    // Client existant : enrichir les notes si nouvelles infos du chatbot
    if (notesFinales) {
      const existingNotes = client.notes || "";
      await prisma.client.update({
        where: { id: client.id },
        data: {
          notes: existingNotes
            ? `${existingNotes}\n---\n${notesFinales}`
            : notesFinales,
          // Mettre à jour budget/ville si pas encore renseigné
          ...(budgetMax && !client.budgetMax
            ? { budgetMax: parseFloat(budgetMax) }
            : {}),
        },
      });
    }
  }

  // Si un lien d'annonce est fourni, créer un bien automatiquement
  if (lienAnnonce) {
    await prisma.bien.create({
      data: {
        lienAnnonce,
        prixAffiche: 0, // À remplir manuellement ou via IA
        statut: "NOUVEAU",
        sourceData: "webhook",
        ville: ville || null,
        typeBien: typeBien || null,
        clientId: client.id,
      },
    });
  }

  return NextResponse.json(
    {
      ok: true,
      clientId: client.id,
      numero: client.numero,
      isNew,
      message: isNew ? "Nouveau lead créé" : "Lead existant enrichi",
    },
    { status: 201 }
  );
}
