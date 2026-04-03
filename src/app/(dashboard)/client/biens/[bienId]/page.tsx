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

export default async function ClientBienDetail({
  params,
}: {
  params: { bienId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const bien = await prisma.bien.findUnique({
    where: { id: params.bienId },
    include: {
      client: true,
      negociations: {
        where: { interne: false },
        orderBy: { ordre: "asc" },
      },
      photos: true,
    },
  });

  if (!bien) {
    return <div className="text-red-400">Bien non trouvé</div>;
  }

  // Vérifier que ce bien appartient au client connecté
  if (bien.client.userId !== userId) {
    redirect("/client");
  }

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
    <div>
      <Link
        href="/client"
        className="text-sm text-dark-400 hover:text-primary-400 mb-4 inline-block"
      >
        ← Retour à mes biens
      </Link>

      {/* Info bien */}
      <div className="card mb-6">
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
            <h1 className="text-2xl font-bold text-white">
              {bien.ville || "Bien"}
              {bien.codePostal ? ` (${bien.codePostal})` : ""}
            </h1>
            {bien.surface && (
              <p className="text-dark-300">{bien.surface} m²</p>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-dark-800 rounded-lg">
            <p className="text-xs text-dark-400">Prix initial</p>
            <p className="text-xl font-bold text-white">
              {formatPrix(bien.prixAffiche)}
            </p>
          </div>
          <div className="text-center p-4 bg-dark-800 rounded-lg">
            <p className="text-xs text-dark-400">Dernier prix</p>
            <p className="text-xl font-bold text-yellow-400">
              {bien.prixActuel ? formatPrix(bien.prixActuel) : "-"}
            </p>
          </div>
          <div className="text-center p-4 bg-dark-800 rounded-lg">
            <p className="text-xs text-dark-400">Économie obtenue</p>
            <p className="text-xl font-bold text-green-400">
              {formatPrix(eco)}
            </p>
          </div>
        </div>
      </div>

      {/* Historique de négociation */}
      <h2 className="text-lg font-semibold mb-4">Suivi de la négociation</h2>

      <div className="space-y-3">
        {bien.negociations.map((m, i) => {
          const isAcquereur = m.camp === "ACQUEREUR";
          const prevMove = i > 0 ? bien.negociations[i - 1] : null;

          return (
            <div
              key={m.id}
              className={`rounded-lg p-4 ${
                isAcquereur ? "nego-acquereur" : "nego-vendeur"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`text-xs font-medium ${
                      isAcquereur ? "text-primary-400" : "text-orange-400"
                    }`}
                  >
                    {isAcquereur ? "Votre offre" : "Réponse vendeur"}
                  </span>
                  {m.montant && (
                    <p
                      className={`text-xl font-bold mt-1 ${
                        isAcquereur ? "text-primary-400" : "text-orange-400"
                      }`}
                    >
                      {formatPrix(m.montant)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {m.statut && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        m.statut === "ACCEPTE"
                          ? "bg-green-500/20 text-green-400"
                          : m.statut === "REFUS"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {m.statut === "ACCEPTE"
                        ? "Accepté"
                        : m.statut === "REFUS"
                        ? "Refusé"
                        : m.statut === "REFLECHIR"
                        ? "En réflexion"
                        : m.statut}
                    </span>
                  )}
                </div>
              </div>
              {m.commentaire && (
                <p className="text-sm text-dark-300 mt-2">{m.commentaire}</p>
              )}
            </div>
          );
        })}

        {bien.negociations.length === 0 && (
          <div className="card text-center py-8 text-dark-400">
            La négociation n&apos;a pas encore commencé
          </div>
        )}
      </div>

      {/* Commentaire final */}
      {bien.commentaireFinal && isTermine && (
        <div className="mt-6 card border-l-4 border-primary-500">
          <h3 className="font-semibold mb-2">Résumé du négociateur</h3>
          <p className="text-dark-300 whitespace-pre-wrap">
            {bien.commentaireFinal}
          </p>
        </div>
      )}

      {/* Photos */}
      {bien.photos.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Photos du bien</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bien.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-dark-800 rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={photo.url}
                  alt={photo.nom || "Photo du bien"}
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
