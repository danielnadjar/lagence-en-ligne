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
              "EN_ATTENTE_VENDEUR",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <p className="text-dark-400 text-sm">Clients</p>
            <p className="text-3xl font-bold text-white mt-1">{totalClients}</p>
          </div>
          <div className="card">
            <p className="text-dark-400 text-sm">Négociations en cours</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {negoEnCours}
            </p>
          </div>
          <div className="card">
            <p className="text-dark-400 text-sm">Accords trouvés</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{accords}</p>
          </div>
          <div className="card">
            <p className="text-dark-400 text-sm">Commissions totales</p>
            <p className="text-3xl font-bold text-primary-400 mt-1">
              {formatPrix(totalCommissions)}
            </p>
            <p className="text-xs text-dark-400 mt-1">
              Économies: {formatPrix(totalEconomies)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Derniers clients */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Derniers clients</h2>
              <Link href="/admin/clients" className="text-primary-400 text-sm hover:underline">
                Voir tout
              </Link>
            </div>
            <div className="space-y-3">
              {derniersClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/admin/clients/${client.id}`}
                  className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">
                      {client.prenom} {client.nom}
                    </p>
                    <p className="text-xs text-dark-400">{client.numero}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-nouveau">
                      {client.biens.length} bien(s)
                    </span>
                  </div>
                </Link>
              ))}
              {derniersClients.length === 0 && (
                <p className="text-dark-400 text-sm">Aucun client pour le moment</p>
              )}
            </div>
          </div>

          {/* Biens en attente */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Actions requises</h2>
            <div className="space-y-3">
              {biensUrgents.map((bien) => (
                <Link
                  key={bien.id}
                  href={`/admin/clients/${bien.clientId}/biens/${bien.id}`}
                  className="flex items-center justify-between p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">
                      {bien.client.prenom} {bien.client.nom}
                    </p>
                    <p className="text-xs text-dark-400">
                      {bien.ville || "Ville non définie"} -{" "}
                      {formatPrix(bien.prixAffiche)}
                    </p>
                  </div>
                  <span
                    className={
                      bien.statut === "EN_ATTENTE_VENDEUR"
                        ? "badge-en-cours"
                        : bien.statut === "EN_ATTENTE_ACQUEREUR"
                        ? "badge-nouveau"
                        : "badge-nouveau"
                    }
                  >
                    {bien.statut === "EN_ATTENTE_VENDEUR"
                      ? "Att. vendeur"
                      : bien.statut === "EN_ATTENTE_ACQUEREUR"
                      ? "Att. acquéreur"
                      : "Nouveau"}
                  </span>
                </Link>
              ))}
              {biensUrgents.length === 0 && (
                <p className="text-dark-400 text-sm">Aucune action en attente</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement du tableau de bord:", error);
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
        <div className="card bg-red-50 border border-red-200">
          <p className="text-red-600">
            Erreur lors du chargement du tableau de bord. Veuillez réessayer.
          </p>
        </div>
      </div>
    );
  }
}
