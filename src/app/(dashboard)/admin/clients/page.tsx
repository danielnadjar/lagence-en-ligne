"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SOURCE_LABELS, STATUT_CLIENT_LABELS, formatPrix } from "@/lib/types";

interface ClientRow {
  id: string;
  numero: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  source: string;
  statut: string;
  budgetMax: number | null;
  createdAt: string;
  biens: { id: string; statut: string; prixAffiche: number; ville: string | null }[];
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchClients = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/clients?${params}`);
    const data = await res.json();
    setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

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

      {/* Recherche */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, téléphone, numéro..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            Rechercher
          </button>
        </div>
      </form>

      {/* Liste */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-dark-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                N°
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Client
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Contact
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Budget max
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Source
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Biens
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Négociateur
              </th>
              <th className="px-4 py-3 text-xs font-medium text-dark-400 uppercase">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-dark-800/50 transition-colors cursor-pointer"
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
                  <Link href={`/admin/clients/${client.id}`}>
                    <p className="font-medium text-white hover:text-primary-400">
                      {client.prenom} {client.nom}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-dark-300">{client.email}</p>
                  <p className="text-xs text-dark-400">{client.telephone}</p>
                </td>
                <td className="px-4 py-3 text-sm">
                  {client.budgetMax ? formatPrix(client.budgetMax) : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-dark-400">
                    {SOURCE_LABELS[client.source as keyof typeof SOURCE_LABELS] ||
                      client.source}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{client.biens.length}</td>
                <td className="px-4 py-3">
                  {(client as any).negociateur ? (
                    <span className="text-xs text-indigo-400">
                      {(client as any).negociateur.prenom} {(client as any).negociateur.nom}
                    </span>
                  ) : (
                    <span className="text-xs text-dark-500 italic">Non assigné</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      client.statut === "NOUVEAU"
                        ? "badge-nouveau"
                        : client.statut === "EN_COURS"
                        ? "badge-en-cours"
                        : client.statut === "CLOS"
                        ? "badge-clos"
                        : "badge-clos"
                    }
                  >
                    {STATUT_CLIENT_LABELS[
                      client.statut as keyof typeof STATUT_CLIENT_LABELS
                    ] || client.statut}
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

function CreateClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    budgetMax: "",
    prixIdeal: "",
    source: "MANUEL",
    notes: "",
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
        body: JSON.stringify(form),
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
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Nom *
              </label>
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
            <label className="block text-sm text-dark-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Budget max
              </label>
              <input
                type="number"
                value={form.budgetMax}
                onChange={(e) =>
                  setForm({ ...form, budgetMax: e.target.value })
                }
                className="input-field"
                placeholder="300000"
              />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">
                Prix idéal
              </label>
              <input
                type="number"
                value={form.prixIdeal}
                onChange={(e) =>
                  setForm({ ...form, prixIdeal: e.target.value })
                }
                className="input-field"
                placeholder="250000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">Source</label>
            <select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="select-field"
            >
              <option value="MANUEL">Manuel</option>
              <option value="LOVABLE">Site web</option>
              <option value="QCM">QCM</option>
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
              {loading ? "Création..." : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
