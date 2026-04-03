import { prisma } from "@/lib/prisma";
import { formatPrix, calculerEconomie, calculerCommission } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const [totalClients, totalBiens, negoEnCours, accords] = await Promise.all([
      prisma.client.count(),
      prisma.bien.count(),
      prisma.bien.count({
        where: {
          statut: {
            in: [
              "NEGO_DEMARREE",
              "EN_COURS_NEGO",
              "EN_ATTENTE_VENDOUR",
              "EN_ATTENTE_ACQUEREUR",
            ],
          },
        },
      }),
      prisma.bien.count({ where: { statut: "ACCORD_TROUVE" } }),
    ]);

    // Calculer les commissions totales sur les accords
    const biensAccord = await prisma.bien.findMany({
      where: { statut: { in: ["ACCORD_TROUVE", "CLOTURE"] } },
      select: { prixAffiche: true, prixActuel: true },
    });

    let totalEconomies = 0;
    let totalCommissions = 0;
    biensAccord.forEach((b) => {
      if (b.prixActuel) {
        const eco = calculerEconomie(b.prixAffiche, b.prixActuel);
        totalEconomies += eco;
        totalCommissions += calculerCommission(eco);
      }
    });

    // Derniers clients
    const derniersClients = await prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        biens: { select: { id: true, statut: true } },
      },
    });

    // Biens en attente d'action
    const biensUrgents = await prisma.bien.findMany({
      where: {
        statut: {
          in: ["EN_ATTENTE_VENDEUR", "EN_ATTENTE_ACQUEREUR", "NOUVEAU"],
        },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { client: { select: { prenom: true, nom: true, numero: true } } },
    });

    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

        {/* KPI Cards */}
        <div class