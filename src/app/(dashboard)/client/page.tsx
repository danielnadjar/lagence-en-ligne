import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatPrix,
  calculerEconomie,
  STATUT_BIEN_LABELS,
  TYPE_BIEN_LABELS,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  // Trouver le client lié à cet utilisateur
  const client = await prisma.client.findFirst({
    where: { userId },
    include: {
      biens: {
        include: {
          negociations: {
            where: { interne: false },
            orderBy: { ordre: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-bold mb-2">Bienvenue</h2>
        <p className="text-dark-400">
          Votre espace est en cours de configuration. Notre équipe vous contacte
          très prochainement.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Info client */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">
          Bonjour {client.prenom} {client.nom}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-dark-400">Votre numéro</p>
            <p className="font-mono text-primary-400">{client.numero}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Email</p>
            <p>{client.email}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Téléphone</p>
            <p>{client.telephone || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Biens en suivi</p>
            <p className="text-lg font-bold">{client.biens.length}</p>
          </div>
        </div>
      </div>

      {/* Liste des biens */}
      <h3 className="text-lg font-semibold mb-4">Mes biens en négociation</h3>

      <div className="space-y-4">
        {client.biens.map((bien) => {
          const eco = bien.prixActuel
            ? calculerEconomie(bien.prixAffiche, bien.prixActuel)
            : 0;
          const isTermine = [
            "ACCORD_TROUVE",
            "CLOTURE",
            "REFUS",
            "SANS_SUITE",
            "ABANDONNE",
          ].includes(bien.statut);

          return (
            <Link
              key={bien.id}
              href={`/client/biens/${bien.id}`}
              className="card block hover:border-primary-600 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                      {TYPE_BIEN_LABELS[
                        bien.typeBien as keyof typeof TYPE_BIEN_LABELS
                      ] || "Bien"}
                    </span>
                    <span
                      className={
                        isTermine
                          ? bien.statut === "ACCORD_TROUVE"
                            ? "badge-accord"
                            : "badge-refus"
                          : "badge-en-cours"
                      }
                    >
                      {STATUT_BIEN_LABELS[
                        bien.statut as keyof typeof STATUT_BIEN_LABELS
                      ] || bien.statut}
                    </span>
                  </div>
                  <p className="text-white font-medium">
                    {bien.ville || "Ville non définie"}
                    {bien.codePostal ? ` (${bien.codePostal})` : ""}
                    {bien.surface ? ` - ${bien.surface}m²` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-dark-400">Prix initial</p>
                  <p className="text-lg font-bold">{formatPrix(bien.prixAffiche)}</p>
                  {eco > 0 && (
                    <p className="text-green-400 text-sm font-medium">
                      Économie: {formatPrix(eco)}
                    </p>
                  )}
                </div>
              </div>

              {bien.negociations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-700">
                  <p className="text-xs text-dark-400">
                    {bien.negociations.length} mouvement(s) de négociation
                  </p>
                </div>
              )}
            </Link>
          );
        })}

        {client.biens.length === 0 && (
          <div className="card text-center py-8 text-dark-400">
            Aucun bien en cours de négociation
          </div>
        )}
      </div>
    </div>
  );
}
