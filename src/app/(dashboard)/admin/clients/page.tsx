"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SOURCE_LABELS,
  STATUT_CLIENT_LABELS,
  STATUT_CLIENT_COLORS,
  TYPE_CLIENT_LABELS,
  TYPE_BIEN_LABELS,
  formatPrix,
  ClientStatut,
} from "@/lib/types";

interface ClientRow {
  id: string;
  numero: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  source: string;
  typeClient: string;
  statut: string;
  budgetMax: number | null;
  prixVente: number | null;
  villeVente: string | null;
  createdAt: string;
  biens: { id: string; statut: string; prixAffiche: number; ville: string | null }[];
  negociateur: { id: string; prenom: string; nom: string } | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterType) params.set("typeClient", filterType);
    if (filterStatut) params.set("statut", filterStatut);
    const res = await fetch(`/api/clients?${params}`);
    const data = await res.json();
    setClients(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [filterType, filterStatut]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          + Nouveau client
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, tel, ville..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            Rechercher
          </button>
        </form>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="select-field w-auto"
        >
          <option value="">Tous les types</option>
          <option value="ACQUEREUR">Acquéreurs</option>
          <option value="VENDEUR">Vendeurs</option>
        </select>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="select-field w-auto"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUT_CLIENT_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Liste */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">N°</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Type</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Client</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Contact</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Budget/Prix</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Source</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Négociateur</th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-dark-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="text-primary-400 font-mono text-sm hover:underline"
                  >
                    {client.numero}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      client.typeClient === "VENDEUR"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {TYPE_CLIENT_LABELS[client.typeClient as keyof typeof TYPE_CLIENT_LABELS] || client.typeClient || "Acquéreur"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${client.id}`}>
                    <p className="font-medium text-white hover:text-primary-400">
                      {client.prenom} {client.nom}
                    </p>
                    {client.villeVente && (
                      <p className="text-xs text-dark-500">{client.villeVente}</p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-dark-300">{client.email}</p>
                  <p className="text-xs text-dark-400">{client.telephone}</p>
                </td>
                <td className="px-4 py-3 text-sm">
                  {client.typeClient === "VENDEUR"
                    ? client.prixVente
                      ? formatPrix(client.prixVente)
                      : "-"
                    : client.budgetMax
                    ? formatPrix(client.budgetMax)
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-dark-400">
                    {SOURCE_LABELS[client.source as keyof typeof SOURCE_LABELS] || client.source}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {client.negociateur ? (
                    <span className="text-xs text-indigo-400">
                      {client.negociateur.prenom} {client.negociateur.nom}
                    </span>
                  ) : (
                    <span className="text-xs text-dark-500 italic">Non assigné</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      STATUT_CLIENT_COLORS[client.statut as ClientStatut]
                        ? `${STATUT_CLIENT_COLORS[client.statut as ClientStatut]}/20 text-white`
                        : "bg-dark-700 text-dark-400"
                    }`}
                  >
                    {STATUT_CLIENT_LABELS[client.statut as ClientStatut] || client.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-8 text-center text-dark-400">Chargement...</div>
        )}
        {!loading && clients.length === 0 && (
          <div className="p-8 text-center text-dark-400">
            Aucun client trouvé
          </div>
        )}
      </div>

      {/* Modal création */}
      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            fetchClients();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// Modal de création - supporte Acquéreur ET Vendeur
// ============================================

function CreateClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [typeClient, setTypeClient] = useState<"ACQUEREUR" | "VENDEUR">("ACQUEREUR");
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    budgetMax: "",
    prixIdeal: "",
    source: "MANUEL",
    notes: "",
    // Champs vendeur
    prixVente: "",
    adresseBien: "",
    villeVente: "",
    surfaceBien: "",
    typeBienVente: "",
    descriptionBien: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, typeClient }),
      });

      if (!res.ok) {
        let msg = "Erreur lors de la création";
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        setError(msg);
        return;
      }

      onCreated();
    } catch (err: any) {
      console.error("Erreur création client:", err);
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nouveau client</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Sélection du type */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setTypeClient("ACQUEREUR")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
              typeClient === "ACQUEREUR"
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-dark-700 text-dark-400 hover:border-dark-600"
            }`}
          >
            <div className="text-lg mb-1">🏠</div>
            Acquéreur
          </button>
          <button
            type="button"
            onClick={() => setTypeClient("VENDEUR")}
            className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
              typeClient === "VENDEUR"
                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                : "border-dark-700 text-dark-400 hover:border-dark-600"
            }`}
          >
            <div className="text-lg mb-1">🔑</div>
            Vendeur
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coordonnées (commun) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Prénom *</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Nom *</label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">Téléphone</label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Champs Acquéreur */}
          {typeClient === "ACQUEREUR" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1">Budget max</label>
                <input
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                  className="input-field"
                  placeholder="300000"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1">Prix idéal</label>
                <input
                  type="number"
                  value={form.prixIdeal}
                  onChange={(e) => setForm({ ...form, prixIdeal: e.target.value })}
                  className="input-field"
                  placeholder="250000"
                />
              </div>
            </div>
          )}

          {/* Champs Vendeur */}
          {typeClient === "VENDEUR" && (
            <>
              <div className="border-t border-dark-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-dark-300 mb-3">Informations du bien</h3>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Type de bien</label>
                <select
                  value={form.typeBienVente}
                  onChange={(e) => setForm({ ...form, typeBienVente: e.target.value })}
                  className="select-field"
                >
                  <option value="">Sélectionner...</option>
                  {Object.entries(TYPE_BIEN_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Prix de vente</label>
                  <input
                    type="number"
                    value={form.prixVente}
                    onChange={(e) => setForm({ ...form, prixVente: e.target.value })}
                    className="input-field"
                    placeholder="350000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Surface (m²)</label>
                  <input
                    type="number"
                    value={form.surfaceBien}
                    onChange={(e) => setForm({ ...form, surfaceBien: e.target.value })}
                    className="input-field"
                    placeholder="85"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Ville</label>
                <input
                  type="text"
                  value={form.villeVente}
                  onChange={(e) => setForm({ ...form, villeVente: e.target.value })}
                  className="input-field"
                  placeholder="Paris"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Adresse du bien</label>
                <input
                  type="text"
                  value={form.adresseBien}
                  onChange={(e) => setForm({ ...form, adresseBien: e.target.value })}
                  className="input-field"
                  placeholder="12 rue de la Paix"
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Description</label>
                <textarea
                  value={form.descriptionBien}
                  onChange={(e) => setForm({ ...form, descriptionBien: e.target.value })}
                  className="input-field"
                  rows={2}
                  placeholder="Appartement lumineux, 3 pièces..."
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-dark-300 mb-1">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="select-field"
            >
              <option value="MANUEL">Manuel</option>
              <option value="FORMULAIRE">Formulaire site</option>
              <option value="CHATBOT">Chatbot</option>
              <option value="LOVABLE">Site web</option>
              <option value="QCM">QCM</option>
              <option value="EXTERIEUR">Extérieur</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Création..." : `Créer le ${typeClient === "VENDEUR" ? "vendeur" : "client"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
