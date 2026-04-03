import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Créer le compte admin par défaut
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lagenceenligne.fr" },
    update: {},
    create: {
      email: "admin@lagenceenligne.fr",
      password: hashedPassword,
      prenom: "Daniel",
      nom: "Admin",
      telephone: "",
      role: "ADMIN",
    },
  });

  console.log("Admin créé:", admin.email);

  // Créer un client de test
  const clientPassword = await bcrypt.hash("client123", 12);

  const clientUser = await prisma.user.upsert({
    where: { email: "jean.dupont@test.fr" },
    update: {},
    create: {
      email: "jean.dupont@test.fr",
      password: clientPassword,
      prenom: "Jean",
      nom: "Dupont",
      role: "CLIENT",
    },
  });

  const client = await prisma.client.upsert({
    where: { email: "jean.dupont@test.fr" },
    update: {},
    create: {
      numero: "ACQ-00001",
      prenom: "Jean",
      nom: "Dupont",
      email: "jean.dupont@test.fr",
      telephone: "06 12 34 56 78",
      budgetMax: 300000,
      prixIdeal: 250000,
      source: "QCM",
      statut: "EN_COURS",
      userId: clientUser.id,
    },
  });

  console.log("Client de test créé:", client.numero);

  // Créer un bien de test
  const bien = await prisma.bien.create({
    data: {
      lienAnnonce: "https://www.leboncoin.fr/ventes_immobilieres/exemple",
      prixAffiche: 280000,
      ville: "Lyon",
      codePostal: "69003",
      surface: 65,
      typeBien: "APPARTEMENT",
      statut: "EN_COURS_NEGO",
      clientId: client.id,
    },
  });

  // Créer un vendeur de test
  await prisma.vendeur.create({
    data: {
      nom: "Martin",
      telephone: "06 98 76 54 32",
      notes: "Propriétaire motivé, divorce en cours. Pressé de vendre.",
      bienId: bien.id,
    },
  });

  // Créer quelques mouvements de négociation (ping-pong)
  await prisma.negociationMove.createMany({
    data: [
      {
        ordre: 1,
        camp: "ACQUEREUR",
        typeMove: "OFFRE",
        montant: 240000,
        commentaire: "Première offre - bien surévalué par rapport au marché",
        bienId: bien.id,
      },
      {
        ordre: 2,
        camp: "VENDEUR",
        typeMove: "CONTRE_OFFRE",
        montant: 270000,
        statut: "REFUS",
        commentaire: "Refuse notre offre, descend à 270k",
        bienId: bien.id,
      },
      {
        ordre: 3,
        camp: "ACQUEREUR",
        typeMove: "CONTRE_OFFRE",
        montant: 255000,
        commentaire: "Travaux à prévoir - on monte à 255k",
        bienId: bien.id,
      },
    ],
  });

  console.log("Données de test créées avec succès");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
