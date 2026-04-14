import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const clientPassword = await bcrypt.hash("client123", 12);

  // ─── Admin ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@lagenceenligne.fr" },
    update: {},
    create: {
      email: "admin@lagenceenligne.fr",
      password: hashedPassword,
      prenom: "Daniel",
      nom: "Nadjar",
      telephone: "06 00 00 00 01",
      role: "ADMIN",
    },
  });
  console.log("Admin cree:", admin.email);

  // ─── Negociateur de test ─────────────────────────────────
  const nego = await prisma.user.upsert({
    where: { email: "sophie.laurent@lagenceenligne.fr" },
    update: {},
    create: {
      email: "sophie.laurent@lagenceenligne.fr",
      password: hashedPassword,
      prenom: "Sophie",
      nom: "Laurent",
      telephone: "06 11 22 33 44",
      role: "NEGOCIATEUR",
    },
  });
  console.log("Negociateur cree:", nego.email);

  // ═══════════════════════════════════════════════════════════
  //  3 CLIENTS ACQUEREURS
  // ═══════════════════════════════════════════════════════════

  // --- Acquereur 1 : Romain Bellanger (en negociation active) ---
  const userAcq1 = await prisma.user.upsert({
    where: { email: "romain.bellanger@gmail.com" },
    update: {},
    create: {
      email: "romain.bellanger@gmail.com",
      password: clientPassword,
      prenom: "Romain",
      nom: "Bellanger",
      telephone: "06 47 83 21 09",
      role: "CLIENT_ACQUEREUR",
    },
  });

  const acq1 = await prisma.client.upsert({
    where: { email: "romain.bellanger@gmail.com" },
    update: {},
    create: {
      numero: "ACQ-00001",
      prenom: "Romain",
      nom: "Bellanger",
      email: "romain.bellanger@gmail.com",
      telephone: "06 47 83 21 09",
      typeClient: "ACQUEREUR",
      budgetMax: 320000,
      prixIdeal: 275000,
      source: "QCM",
      statut: "NEGOCIATION",
      userId: userAcq1.id,
      negociateurId: nego.id,
    },
  });

  // Bien + vendeur + ping-pong pour Romain
  const bien1 = await prisma.bien.create({
    data: {
      lienAnnonce: "https://www.leboncoin.fr/ventes_immobilieres/2345678901",
      prixAffiche: 298000,
      ville: "Lyon 3e",
      codePostal: "69003",
      surface: 72,
      typeBien: "APPARTEMENT",
      statut: "EN_COURS_NEGO",
      clientId: acq1.id,
    },
  });

  await prisma.vendeur.create({
    data: {
      nom: "Duhamel",
      telephone: "06 91 34 57 82",
      notes: "Couple divorcant, vente judiciaire ordonnee. Delai 3 mois.",
      bienId: bien1.id,
    },
  });

  await prisma.negociationMove.createMany({
    data: [
      {
        ordre: 1,
        camp: "ACQUEREUR",
        typeMove: "OFFRE",
        montant: 250000,
        commentaire: "Premiere offre — DPE F, travaux isolation 18k estimes",
        bienId: bien1.id,
      },
      {
        ordre: 2,
        camp: "VENDEUR",
        typeMove: "CONTRE_OFFRE",
        montant: 288000,
        statut: "REFUS",
        commentaire: "Refuse, descend de 10k seulement",
        bienId: bien1.id,
      },
      {
        ordre: 3,
        camp: "ACQUEREUR",
        typeMove: "CONTRE_OFFRE",
        montant: 265000,
        commentaire: "On monte a 265k, comparables du quartier a 3 600/m2",
        bienId: bien1.id,
      },
      {
        ordre: 4,
        camp: "VENDEUR",
        typeMove: "CONTRE_OFFRE",
        montant: 278000,
        statut: "REFLECHIR",
        commentaire: "Hesite, demande un delai de reflexion",
        bienId: bien1.id,
      },
    ],
  });

  console.log("Acquereur 1 cree:", acq1.numero, "- Romain Bellanger");

  // --- Acquereur 2 : Amira Khelifi (analyse en cours) ---
  const userAcq2 = await prisma.user.upsert({
    where: { email: "amira.khelifi@outlook.fr" },
    update: {},
    create: {
      email: "amira.khelifi@outlook.fr",
      password: clientPassword,
      prenom: "Amira",
      nom: "Khelifi",
      telephone: "07 62 15 43 78",
      role: "CLIENT_ACQUEREUR",
    },
  });

  const acq2 = await prisma.client.upsert({
    where: { email: "amira.khelifi@outlook.fr" },
    update: {},
    create: {
      numero: "ACQ-00002",
      prenom: "Amira",
      nom: "Khelifi",
      email: "amira.khelifi@outlook.fr",
      telephone: "07 62 15 43 78",
      typeClient: "ACQUEREUR",
      budgetMax: 450000,
      prixIdeal: 380000,
      source: "SITE",
      statut: "ANALYSE",
      userId: userAcq2.id,
      negociateurId: nego.id,
    },
  });

  await prisma.bien.create({
    data: {
      lienAnnonce: "https://www.seloger.com/annonces/achat/maison/nantes-44/178234521.htm",
      prixAffiche: 425000,
      ville: "Nantes",
      codePostal: "44000",
      surface: 110,
      typeBien: "MAISON",
      statut: "NOUVEAU",
      clientId: acq2.id,
    },
  });

  console.log("Acquereur 2 cree:", acq2.numero, "- Amira Khelifi");

  // --- Acquereur 3 : Vincent Moreau (prospect, pas encore assigne) ---
  const userAcq3 = await prisma.user.upsert({
    where: { email: "v.moreau92@free.fr" },
    update: {},
    create: {
      email: "v.moreau92@free.fr",
      password: clientPassword,
      prenom: "Vincent",
      nom: "Moreau",
      telephone: "06 33 78 91 24",
      role: "CLIENT_ACQUEREUR",
    },
  });

  const acq3 = await prisma.client.upsert({
    where: { email: "v.moreau92@free.fr" },
    update: {},
    create: {
      numero: "ACQ-00003",
      prenom: "Vincent",
      nom: "Moreau",
      email: "v.moreau92@free.fr",
      telephone: "06 33 78 91 24",
      typeClient: "ACQUEREUR",
      budgetMax: 220000,
      prixIdeal: 190000,
      source: "QCM",
      statut: "PROSPECT",
      notes: "Primo-accedant, PTZ eligible, cherche T3 en banlieue parisienne",
      userId: userAcq3.id,
    },
  });

  console.log("Acquereur 3 cree:", acq3.numero, "- Vincent Moreau");

  // ═══════════════════════════════════════════════════════════
  //  3 CLIENTS VENDEURS
  // ═══════════════════════════════════════════════════════════

  // --- Vendeur 1 : Helene Garnier (commercialisation active) ---
  const userVend1 = await prisma.user.upsert({
    where: { email: "helene.garnier@orange.fr" },
    update: {},
    create: {
      email: "helene.garnier@orange.fr",
      password: clientPassword,
      prenom: "Helene",
      nom: "Garnier",
      telephone: "06 82 41 67 53",
      role: "CLIENT_VENDEUR",
    },
  });

  const vend1 = await prisma.client.upsert({
    where: { email: "helene.garnier@orange.fr" },
    update: {},
    create: {
      numero: "VEN-00001",
      prenom: "Helene",
      nom: "Garnier",
      email: "helene.garnier@orange.fr",
      telephone: "06 82 41 67 53",
      typeClient: "VENDEUR",
      prixVente: 385000,
      villeVente: "Bordeaux",
      adresseBien: "12 rue Sainte-Catherine",
      surfaceBien: 95,
      typeBienVente: "APPARTEMENT",
      descriptionBien: "T4 dernier etage, terrasse 18m2, parking sous-sol. Ravalement fait en 2024.",
      source: "FORMULAIRE",
      statut: "COMMERCIALISATION",
      userId: userVend1.id,
      negociateurId: nego.id,
    },
  });

  console.log("Vendeur 1 cree:", vend1.numero, "- Helene Garnier");

  // --- Vendeur 2 : Marc-Antoine Riviere (visites en cours) ---
  const userVend2 = await prisma.user.upsert({
    where: { email: "ma.riviere@gmail.com" },
    update: {},
    create: {
      email: "ma.riviere@gmail.com",
      password: clientPassword,
      prenom: "Marc-Antoine",
      nom: "Riviere",
      telephone: "07 14 89 36 72",
      role: "CLIENT_VENDEUR",
    },
  });

  const vend2 = await prisma.client.upsert({
    where: { email: "ma.riviere@gmail.com" },
    update: {},
    create: {
      numero: "VEN-00002",
      prenom: "Marc-Antoine",
      nom: "Riviere",
      email: "ma.riviere@gmail.com",
      telephone: "07 14 89 36 72",
      typeClient: "VENDEUR",
      prixVente: 189000,
      villeVente: "Toulouse",
      adresseBien: "8 allee des Demoiselles",
      surfaceBien: 48,
      typeBienVente: "APPARTEMENT",
      descriptionBien: "T2 lumineux, balcon, proche metro. Ideal investissement locatif.",
      source: "SITE",
      statut: "VISITES_EN_COURS",
      userId: userVend2.id,
      negociateurId: nego.id,
    },
  });

  // Creer une visite planifiee pour ce vendeur
  await prisma.visite.create({
    data: {
      dateVisite: new Date("2026-04-18T14:30:00"),
      statut: "PLANIFIEE",
      compteRendu: "Visite avec couple interesse, budget 200k max",
      clientId: vend2.id,
    },
  });

  console.log("Vendeur 2 cree:", vend2.numero, "- Marc-Antoine Riviere");

  // --- Vendeur 3 : Nadia Bensalah (prospect, pas encore assigne) ---
  const userVend3 = await prisma.user.upsert({
    where: { email: "nadia.bensalah@laposte.net" },
    update: {},
    create: {
      email: "nadia.bensalah@laposte.net",
      password: clientPassword,
      prenom: "Nadia",
      nom: "Bensalah",
      telephone: "06 59 27 84 16",
      role: "CLIENT_VENDEUR",
    },
  });

  const vend3 = await prisma.client.upsert({
    where: { email: "nadia.bensalah@laposte.net" },
    update: {},
    create: {
      numero: "VEN-00003",
      prenom: "Nadia",
      nom: "Bensalah",
      email: "nadia.bensalah@laposte.net",
      telephone: "06 59 27 84 16",
      typeClient: "VENDEUR",
      prixVente: 670000,
      villeVente: "Nice",
      adresseBien: "34 boulevard Victor Hugo",
      surfaceBien: 135,
      typeBienVente: "MAISON",
      descriptionBien: "Villa 5 pieces, jardin 200m2, vue mer partielle. Succession, 3 heritiers.",
      source: "FORMULAIRE",
      statut: "PROSPECT",
      notes: "Succession complexe, notaire deja mandate. Delai de vente souhaite: 6 mois.",
      userId: userVend3.id,
    },
  });

  console.log("Vendeur 3 cree:", vend3.numero, "- Nadia Bensalah");

  console.log("\n--- Seed termine ---");
  console.log("8 users crees (1 admin, 1 negociateur, 3 acquereurs, 3 vendeurs)");
  console.log("Mot de passe admin: admin123");
  console.log("Mot de passe clients: client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
