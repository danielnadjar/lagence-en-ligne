"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrix, STATUT_BIEN_LABELS } from "@/lib/types";

interface VendeurRow {
  id: string;
  nom: string | null;
  telephone: string | null;
  email: string | null;
  notes: string | null;
  contexte: string | null;
  createdAt: string;
  bien: {
    id: string;
    prixAffiche: number;
    prixActuel: number | null;
    ville: string | null;
    codePostal: string | null;
    statut: string;
    clientId: string;
    client: {
      id: string;
      prenom: string;
      nom: string;
    };
  };
}

export default function VendeursPage() {
  const [vendeurs, setVendeurs] = useState<VendeurRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchVendeurs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/vendeurs?${params.toString()}`);
    if (res.ok) {
      setVendeurs(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVendeurs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchVendeurs();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Vendeurs</h1>
        <span className="text-sm text-gray-500">{vendeurs.length} vendeur{vendeurs.length > 1 ? "s" : ""}</span>
      </div>

      {/* Barre de recherche */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Rechercher par nom, téléphone, email, ville, client..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
        >
          Rechercher
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); setTimeout(() => fetchVendeurs(), 0); }}
            className="text-gray-400 hover:text-white px-3 py-2.5 text-sm border border-gray-700 rounded-lg"
          >
            ✗
          </button>
        )}
      </form>

      {/* Tableau */}
      {loading ? (
        <p className="text-gray-500 text-sm">Chargement...</p>
      ) : vendeurs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            {search ? "Aucun vendeur trouvé pour cette recherche." : "Aucun vendeur enregistré."}
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Les vendeurs sont créés automatiquement quand vous ajoutez leurs infos sur la fiche d&apos;un bien.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Vendeur</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Bien</th>
                <th className="text-left px-4 py-3">Client (Acquéreur)</th>
                <th className="text-left px-4 py-3">Statut négo</th>
                <th className="text-right px-4 py-3">Prix affiché</th>
              </tr>
            </thead>
            <tbody>
              {vendeurs.map((v) => {
                const statutLabel = STATUT_BIEN_LABELS[v.bien?.statut as keyof typeof STATUT_BIEN_LABELS] || v.bien?.statut || "—";
                return (
                  <tr
                    key={v.id}
                    className="border-t border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${v.bien?.client?.id}/biens/${v.bien?.id}`}
                        className="text-white font-medium hover:text-indigo-400 transition"
                      >
                        {v.nom || <span className="text-gray-500 italic">Sans nom</span>}
                      </Link>
                      {v.contexte && (
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[200px]">{v.contexte}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {v.telephone && <p className="text-xs">{v.telephone}</p>}
                      {v.email && <p className="text-xs text-gray-500">{v.email}</p>}
                      {!v.telephone && !v.email && <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${v.bien?.client?.id}/biens/${v.bien?.id}`}
                        className="text-gray-300 hover:text-indigo-400 text-xs transition"
                      >
                        {v.bien?.ville || "Bien"} {v.bien?.codePostal || ""}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${v.bien?.client?.id}`}
                        className="text-gray-300 hover:text-indigo-400 text-xs transition"
                      >
                        {v.bien?.client?.prenom} {v.bien?.client?.nom}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                        {statutLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold text-xs">
                        {v.bien?.prixAffiche ? formatPrix(v.bien.prixAffiche) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
