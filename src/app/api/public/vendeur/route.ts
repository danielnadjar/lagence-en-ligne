import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genererNumeroClient } from "@/lib/numero";
import bcrypt from "bcryptjs";

// POST /api/public/vendeur - Formulaire public vendeur (sans auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prenom,
      nom,
      email,
      telephone,
      prixVente,
      villeVente,
      adresseBien,
      surfaceBien,
      typeBienVente,
      descriptionBien,
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
      // Enrichir les données si client existant
      const updates: any = {};
      if (prixVente && !client.prixVente) updates.prixVente = parseFloat(prixVente);
      if (villeVente && !client.villeVente) updates.villeVente = villeVente;
      if (adresseBien && !client.adresseBien) updates.adresseBien = adresseBien;
      if (surfaceBien && !client.surfaceBien) updates.surfaceBien = parseFloat(surfaceBien);
      if (typeBienVente && !client.typeBienVente) updates.typeBienVente = typeBienVente;
      if (descriptionBien) {
        updates.notes = client.notes
          ? `${client.notes}\n---\n[Formulaire Vendeur] ${descriptionBien}`
          : `[Formulaire Vendeur] ${descriptionBien}`;
      }

      if (Object.keys(updates).length > 0) {
        client = await prisma.client.update({
          where: { id: client.id },
          data: updates,
        });
      }

      return NextResponse.json(
        { ok: true, message: "Informations mises à jour", clientId: client.id },
        { status: 200 }
      );
    }

    // Nouveau client vendeur
    const numero = await genererNumeroClient("VENDEUR");

    // Créer un compte utilisateur
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
        role: "CLIENT_VENDEUR",
      },
    });

    client = await prisma.client.create({
      data: {
        numero,
        prenom,
        nom,
        email,
        telephone: telephone || null,
        typeClient: "VENDEUR",
        statut: "PROSPECT",
        source: "FORMULAIRE",
        prixVente: prixVente ? parseFloat(prixVente) : null,
        villeVente: villeVente || null,
        adresseBien: adresseBien || null,
        surfaceBien: surfaceBien ? parseFloat(surfaceBien) : null,
        typeBienVente: typeBienVente || null,
        descriptionBien: descriptionBien || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Votre demande a bien été enregistrée. Nous vous contacterons rapidement.",
        clientId: client.id,
        numero: client.numero,
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    console.error("Erreur formulaire vendeur:", e);
    return NextResponse.json(
      { error: "Erreur serveur", details: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
