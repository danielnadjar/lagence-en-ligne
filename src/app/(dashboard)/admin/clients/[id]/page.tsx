"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatPrix,
  calculerEconomie,
  calculerCommission,
  STATUT_BIEN_LABELS,
  TYPE_BIEN_LABELS,
  SOURCE_LABELS,
  STATUT_CLIENT_LABELS,
} from "@/lib/types";

interface ClientData {
  id: string;
  numero: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  budgetMax: number | null;
  prixIdeal: number | null;
  notes: string | null;
  source: string;
  statut: string;
  biens: BienData[];
}

interface BienData {
  id: string;
  lienAnnonce: string | null;
  prixAffiche: number;
  prixActuel: number | null;
  ville: string | null;
  codePostal: string | null;
  surface: number | null;
  typeBien: string | null;
  statut: string;
  commentaireFinal: string | null;
  vendeur: any;
  photos: any[];
  negociations: any[];
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddBien, setShowAddBien] = useState(false);
  const [negociateurs, setNegociateurs] = useState<any[]>([]);

  const fetchNegociateurs = async () => {
    const res = await fetch("/api/users?role=NEGOCIATEUR");
    if (res.ok) setNegociateurs(await res.json());
    // Aussi charger les sous-admins qui peuvent être assignés
    const res2 = await fetch("/api/users");
    if (res2.ok) {
      const all = await res2.json();
      setNegociateurs(all.filter((u: any) => u.role === "NEGOCIATEUR" || u.role === "SOUS_ADMIN"));
    }
  };

  const fetchClient = async () => {
    const res = await fetch(`/api/clients/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setClient(data);
      setEditForm({
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone || "",
        budgetMax: data.budgetMax || "",
        prixIdeal: data.prixIdeal || "",
        notes: data.notes || "",
        statut: data.statut,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClient();
    fetchNegociateurs();
  }, [params.id]);

  const saveClient = async () => {
    await fetch(`/api/clients/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setEditMode(false);
    fetchClient();
  };

  if (loading) {
    return <div className="text-dark-400">Chargement...</div>;
  }

  if (!client) {
    return <div className="text-red-400">Client non trouvé</div>;
  }

  // Calculs globaux
  let totalEco = 0;
  let totalComm = 0;
  client.biens.forEach((b) => {
    if (b.prixActuel) {
      const eco = calculerEconomie(b.prixAffiche, b.prixActuel);
      totalEco += eco;
      totalComm += calculerCommission(eco);
    }
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-4">
        <Link href="/admin/clients" className="hover:text-primary-400">
          Clients
        </Link>
        <span>/</span>
        <span className="text-white">
          {client.prenom} {client.nom}
        </span>
      </div>

      {/* Zone fixe acquéreur */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {client.prenom} {client.nom}
            </h1>
            <p className="text-dark-400 font-mono">{client.numero}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={
                client.statut === "NOUVEAU"
                  ? "badge-nouveau"
                  : client.statut === "EN_COURS"
                  ? "badge-en-cours"
                  : "badge-clos"
              }
            >
              {STATUT_CLIENT_LABELS[
                client.statut as keyof typeof STATUT_CLIENT_LABELS
              ] || client.statut}
            </span>
            <button
              onClick={() => setEditMode(!editMode)}
              className="btn-secondary text-sm"
            >
              {editMode ? "Annuler" : "Modifier"}
            </button>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">
                  Prénom
                </label>
                <input
                  value={editForm.prenom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, prenom: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Nom</label>
                <input
                  value={editForm.nom}
                  onChange={(e) =>
                    setEditForm({ ...editForm, nom: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">
                  Téléphone
                </label>
                <input
                  value={editForm.telephone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, telephone: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">
                  Statut
                </label>
                <select
                  value={editForm.statut}
                  onChange={(e) =>
                    setEditForm({ ...editForm, statut: e.target.value })
                  }
                  className="select-field"
                >
                  <option value="NOUVEAU">Nouveau</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="CLOS">Clôturé</option>
                  <option value="INACTIF">Inactif</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">
                  Budget max
                </label>
                <input
                  type="number"
                  value={editForm.budgetMax}
                  onChange={(e) =>
                    setEditForm({ ...editForm, budgetMax: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">
                  Prix idéal
                </label>
                <input
                  type="number"
                  value={editForm.prixIdeal}
                  onChange={(e) =>
                    setEditForm({ ...editForm, prixIdeal: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Notes</label>
              <textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                className="input-field"
                rows={2}
              />
            </div>
            <button onClick={saveClient} className="btn-primary">
              Sauvegarder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-dark-400">Email</p>
              <p className="text-sm text-white">{client.email}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Téléphone</p>
              <p className="text-sm text-white">
                {client.telephone || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Budget max</p>
              <p className="text-lg font-bold text-yellow-400">
                {client.budgetMax ? formatPrix(client.budgetMax) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Prix idéal</p>
              <p className="text-lg font-bold text-green-400">
                {client.prixIdeal ? formatPrix(client.prixIdeal) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Source</p>
              <p className="text-sm text-dark-300">
                {SOURCE_LABELS[client.source as keyof typeof SOURCE_LABELS] ||
                  client.source}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Biens en négociation</p>
              <p className="text-sm text-white">{client.biens.length}</p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Économies totales</p>
              <p className="text-lg font-bold text-green-400">
                {formatPrix(totalEco)}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Commission</p>
              <p className="text-lg font-bold text-primary-400">
                {formatPrix(totalComm)}
              </p>
            </div>
            <div>
              <p className="text-xs text-dark-400">Négociateur</p>
              <select
                className="mt-1 bg-transparent border border-dark-700 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary-500"
                value={(client as any).negociateurId || ""}
                onChange={async (e) => {
                  await fetch(`/api/clients/${params.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ negociateurId: e.target.value || null }),
                  });
                  fetchClient();
                }}
              >
                <option value="">Non assigné</option>
                {negociateurs.map((n: any) => (
                  <option key={n.id} value={n.id}>{n.prenom} {n.nom}</option>
                ))}
              </select>
            </div>
            {client.notes && (
              <div className="col-span-full">
                <p className="text-xs text-dark-400">Notes</p>
                <p className="text-sm text-dark-300">{client.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== MANDAT DE RECHERCHE ===== */}
      <MandatSection client={client} clientId={params.id as string} onUpdate={fetchClient} />

      {/* Liste des biens */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Biens ({client.biens.length})
        </h2>
        {(client as any).mandatSigne ? (
          <button
            onClick={() => setShowAddBien(true)}
            className="btn-primary text-sm"
          >
            + Ajouter un bien
          </button>
        ) : (
          <span className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            Mandat requis pour ajouter un bien
          </span>
        )}
      </div>

      <div className="space-y-4">
        {client.biens.map((bien) => {
          const eco = bien.prixActuel
            ? calculerEconomie(bien.prixAffiche, bien.prixActuel)
            : 0;
          const comm = calculerCommission(eco);
          const dernierMove =
            bien.negociations[bien.negociations.length - 1];

          return (
            <div
              key={bien.id}
              className="card block hover:border-primary-600 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/clients/${client.id}/biens/${bien.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                      {TYPE_BIEN_LABELS[
                        bien.typeBien as keyof typeof TYPE_BIEN_LABELS
                      ] || bien.typeBien || "Non défini"}
                    </span>
                    <span
                      className={
                        bien.statut.includes("ACCORD")
                          ? "badge-accord"
                          : bien.statut.includes("EN_")
                          ? "badge-en-cours"
                          : bien.statut === "NOUVEAU"
                          ? "badge-nouveau"
                          : "badge-clos"
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
                  {bien.lienAnnonce && (
                    <p className="text-xs text-primary-400 truncate max-w-md">
                      {bien.lienAnnonce}
                    </p>
                  )}
                </div>

                <div className="text-right space-y-1">
                  <p className="text-dark-400 text-xs">Prix affiché</p>
                  <p className="text-lg font-bold text-white">
                    {formatPrix(bien.prixAffiche)}
                  </p>
                  {bien.prixActuel && bien.prixActuel !== bien.prixAffiche && (
                    <>
                      <p className="text-dark-400 text-xs">Dernier prix</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {formatPrix(bien.prixActuel)}
                      </p>
                      {eco > 0 && (
                        <p className="text-green-400 text-sm">
                          -{formatPrix(eco)} (comm: {formatPrix(comm)})
                        </p>
                      )}
                    </>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Supprimer ce bien et sa négociation ?")) {
                        fetch(`/api/biens/${bien.id}`, { method: "DELETE" }).then(() => fetchClient());
                      }
                    }}
                    className="text-[10px] text-red-500/60 hover:text-red-400 mt-2 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              {dernierMove && (
                <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-2 text-sm text-dark-400">
                  <span
                    className={
                      dernierMove.camp === "ACQUEREUR"
                        ? "text-primary-400"
                        : "text-orange-400"
                    }
                  >
                    {dernierMove.camp === "ACQUEREUR"
                      ? "Acquéreur"
                      : "Vendeur"}
                  </span>
                  <span>-</span>
                  <span>
                    {dernierMove.montant
                      ? formatPrix(dernierMove.montant)
                      : dernierMove.typeMove}
                  </span>
                  {dernierMove.statut && (
                    <span
                      className={
                        dernierMove.statut === "ACCEPTE"
                          ? "text-green-400"
                          : dernierMove.statut === "REFUS"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      ({dernierMove.statut})
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {client.biens.length === 0 && (
          <div className="card text-center text-dark-400 py-8">
            Aucun bien ajouté pour ce client
          </div>
        )}
      </div>

      {/* Modal ajout bien */}
      {showAddBien && (
        <AddBienModal
          clientId={client.id}
          onClose={() => setShowAddBien(false)}
          onCreated={() => {
            setShowAddBien(false);
            fetchClient();
          }}
        />
      )}
    </div>
  );
}

function AddBienModal({
  clientId,
  onClose,
  onCreated,
}: {
  clientId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    lienAnnonce: "",
    prixAffiche: "",
    ville: "",
    codePostal: "",
    surface: "",
    typeBien: "APPARTEMENT",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch(`/api/clients/${clientId}/biens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter un bien</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">
              Lien de l&apos;annonce
            </label>
            <input
              type="url"
              value={form.lienAnnonce}
              onChange={(e) =>
                setForm({ ...form, lienAnnonce: e.target.value })
              }
              className="input-field"
              placeholder="https://www.leboncoin.fr/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Prix affiché *
              </label>
              <input
                type="number"
                value={form.prixAffiche}
                onChange={(e) =>
                  setForm({ ...form, prixAffiche: e.target.value })
                }
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Type de bien
              </label>
              <select
                value={form.typeBien}
                onChange={(e) =>
                  setForm({ ...form, typeBien: e.target.value })
                }
                className="select-field"
              >
                <option value="APPARTEMENT">Appartement</option>
                <option value="MAISON">Maison</option>
                <option value="IMMEUBLE">Immeuble</option>
                <option value="FONDS_COMMERCE">Fonds de commerce</option>
                <option value="LOCAL_COMMERCIAL">Local commercial</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Ville</label>
              <input
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Code postal
              </label>
              <input
                value={form.codePostal}
                onChange={(e) =>
                  setForm({ ...form, codePostal: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Surface m²
              </label>
              <input
                type="number"
                value={form.surface}
                onChange={(e) => setForm({ ...form, surface: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Ajout..." : "Ajouter le bien"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===== COMPOSANT MANDAT =====
function MandatSection({ client, clientId, onUpdate }: { client: any; clientId: string; onUpdate: () => void }) {
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setGenerating(true);
    const res = await fetch(`/api/clients/${clientId}/mandat`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setSignUrl(data.signUrl);
    }
    setGenerating(false);
  };

  const copyLink = () => {
    if (signUrl) {
      navigator.clipboard.writeText(signUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (client.mandatSigne) {
    const d = new Date(client.mandatDate);
    return (
      <div className="card mb-6 border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-400">Mandat signé</p>
              {client.mandatNumero && (
                <p className="text-xs text-dark-400 font-mono">{client.mandatNumero}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-xs text-dark-400">
              <p>Signé le <strong className="text-white">{d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong></p>
              <p>à <strong className="text-white">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong></p>
              {client.mandatIP && <p className="text-dark-500">IP: {client.mandatIP}</p>}
            </div>
            <a
              href={`/api/clients/${clientId}/mandat/pdf`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-6 border-yellow-500/30 bg-yellow-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-400">Mandat non signé</p>
            <p className="text-xs text-dark-400">Le client doit signer le mandat de recherche avant d&apos;ouvrir une négociation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {signUrl ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={signUrl}
                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-white w-64 truncate outline-none"
              />
              <button
                onClick={copyLink}
                className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
          ) : (
            <button
              onClick={generateLink}
              disabled={generating}
              className="text-xs bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition"
            >
              {generating ? "Génération..." : "Générer le lien de signature"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
