"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import KanbanBoard, { KanbanClient } from "@/components/admin/KanbanBoard";
import AssignModal from "@/components/admin/AssignModal";
import {
  PIPELINE_MANAGER,
  PIPELINE_VENDEUR,
  PIPELINE_ACQUEREUR,
  ClientStatut,
  TypeClient,
} from "@/lib/types";

type ViewMode = "kanban" | "liste";
type PipelineFilter = "ALL" | "VENDEUR" | "ACQUEREUR";

export default function PipelinePage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "NEGOCIATEUR";

  const [clients, setClients] = useState<KanbanClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>("ALL");

  // Modal d'affectation
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState<string | null>(null);
  const [assignClientName, setAssignClientName] = useState("");

  const isManager = userRole === "ADMIN" || userRole === "SOUS_ADMIN";

  // Charger les clients
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Erreur chargement clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Changer le statut via drag & drop
  const handleStatusChange = useCallback(
    async (clientId: string, newStatut: ClientStatut) => {
      setUpdating(true);
      // Mise à jour optimiste
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, statut: newStatut } : c))
      );

      try {
        const res = await fetch(`/api/clients/${clientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statut: newStatut }),
        });
        if (!res.ok) {
          // Rollback
          fetchClients();
          throw new Error("Erreur mise à jour");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating(false);
      }
    },
    [fetchClients]
  );

  // Ouvrir le modal d'affectation
  const handleOpenAssign = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setAssignClientId(clientId);
        setAssignClientName(`${client.prenom} ${client.nom}`);
        setAssignModalOpen(true);
      }
    },
    [clients]
  );

  // Affecter un client
  const handleAssign = useCallback(
    async (negociateurId: string) => {
      if (!assignClientId) return;
      setUpdating(true);
      try {
        const res = await fetch(`/api/clients/${assignClientId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            negociateurId,
            statut: "AFFECTE",
          }),
        });
        if (res.ok) {
          await fetchClients();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setUpdating(false);
      }
    },
    [assignClientId, fetchClients]
  );

  // Déterminer les colonnes selon le filtre
  const getColumns = (): ClientStatut[] => {
    if (pipelineFilter === "VENDEUR") return PIPELINE_VENDEUR;
    if (pipelineFilter === "ACQUEREUR") return PIPELINE_ACQUEREUR;
    return PIPELINE_MANAGER;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-dark-400">Chargement du pipeline...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-sm text-dark-400 mt-1">
            {isManager
              ? "Vue globale de tous les dossiers"
              : "Vos dossiers en cours"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtre pipeline */}
          <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5 border border-dark-700">
            {(["ALL", "ACQUEREUR", "VENDEUR"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPipelineFilter(filter)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  pipelineFilter === filter
                    ? "bg-primary-600 text-white"
                    : "text-dark-400 hover:text-white"
                }`}
              >
                {filter === "ALL"
                  ? "Tous"
                  : filter === "ACQUEREUR"
                  ? "Acquéreurs"
                  : "Vendeurs"}
              </button>
            ))}
          </div>

          {/* Vue kanban / liste */}
          <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5 border border-dark-700">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "kanban"
                  ? "bg-primary-600 text-white"
                  : "text-dark-400 hover:text-white"
              }`}
              title="Vue Kanban"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("liste")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "liste"
                  ? "bg-primary-600 text-white"
                  : "text-dark-400 hover:text-white"
              }`}
              title="Vue Liste"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Vue Kanban */}
      {viewMode === "kanban" ? (
        <KanbanBoard
          clients={clients}
          columns={getColumns()}
          onStatusChange={handleStatusChange}
          onAssign={isManager ? handleOpenAssign : undefined}
          showAssignment={isManager}
          isLoading={updating}
        />
      ) : (
        /* Vue Liste */
        <ListView
          clients={clients}
          onAssign={isManager ? handleOpenAssign : undefined}
          showAssignment={isManager}
          pipelineFilter={pipelineFilter}
        />
      )}

      {/* Modal d'affectation */}
      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
        clientName={assignClientName}
      />
    </div>
  );
}

// ============================================
// Vue Liste
// ============================================

function ListView({
  clients,
  onAssign,
  showAssignment,
  pipelineFilter,
}: {
  clients: KanbanClient[];
  onAssign?: (clientId: string) => void;
  showAssignment?: boolean;
  pipelineFilter: PipelineFilter;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = clients.filter((c) => {
    if (pipelineFilter !== "ALL" && c.typeClient !== pipelineFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.prenom.toLowerCase().includes(q) ||
        c.nom.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.numero.toLowerCase().includes(q) ||
        (c.telephone && c.telephone.includes(q)) ||
        (c.villeVente && c.villeVente.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || "";
    const bVal = (b as any)[sortField] || "";
    if (sortDir === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-dark-700">
        <table className="w-full text-sm">
          <thead className="bg-dark-800">
            <tr>
              {["numero", "Client", "Type", "Statut", "Contact", "Budget/Prix", "Négociateur", "Date"].map(
                (col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
              {showAssignment && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {sorted.map((client) => (
              <tr key={client.id} className="hover:bg-dark-800/50 transition-colors">
                <td className="px-4 py-3 text-dark-400 text-xs">{client.numero}</td>
                <td className="px-4 py-3">
                  <a
                    href={`/admin/clients/${client.id}`}
                    className="text-white hover:text-primary-400 font-medium transition-colors"
                  >
                    {client.prenom} {client.nom}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      client.typeClient === "VENDEUR"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {client.typeClient === "VENDEUR" ? "Vendeur" : "Acquéreur"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      STATUT_CLIENT_COLORS[client.statut as ClientStatut]
                    }/20 text-white`}
                  >
                    {STATUT_CLIENT_LABELS[client.statut as ClientStatut] || client.statut}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark-400 text-xs">
                  <div>{client.email}</div>
                  {client.telephone && <div>{client.telephone}</div>}
                </td>
                <td className="px-4 py-3 text-white text-xs">
                  {client.typeClient === "VENDEUR"
                    ? client.prixVente
                      ? formatPrixSimple(client.prixVente)
                      : "-"
                    : client.budgetMax
                    ? formatPrixSimple(client.budgetMax)
                    : "-"}
                </td>
                <td className="px-4 py-3 text-xs">
                  {client.negociateur ? (
                    <span className="text-primary-400">
                      {client.negociateur.prenom} {client.negociateur.nom}
                    </span>
                  ) : (
                    <span className="text-dark-600">Non assigné</span>
                  )}
                </td>
                <td className="px-4 py-3 text-dark-500 text-xs">
                  {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                </td>
                {showAssignment && (
                  <td className="px-4 py-3">
                    {!client.negociateur && onAssign && (
                      <button
                        onClick={() => onAssign(client.id)}
                        className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Affecter
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="text-center py-12 text-dark-500">Aucun client trouvé</div>
        )}
      </div>
    </div>
  );
}

function formatPrixSimple(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

// Import for labels
import { STATUT_CLIENT_LABELS, STATUT_CLIENT_COLORS } from "@/lib/types";
