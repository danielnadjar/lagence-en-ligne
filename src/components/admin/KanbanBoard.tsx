"use client";

import { useState, useCallback } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { clsx } from "clsx";
import {
  ClientStatut,
  STATUT_CLIENT_LABELS,
  STATUT_CLIENT_COLORS,
  TYPE_CLIENT_LABELS,
  TypeClient,
  formatPrix,
} from "@/lib/types";
import Link from "next/link";

// ============================================
// Types
// ============================================

export interface KanbanClient {
  id: string;
  numero: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  typeClient: TypeClient;
  statut: ClientStatut;
  source: string;
  budgetMax?: number | null;
  prixVente?: number | null;
  villeVente?: string | null;
  createdAt: string;
  negociateur?: {
    id: string;
    prenom: string;
    nom: string;
  } | null;
  _count?: {
    biens: number;
  };
}

interface KanbanBoardProps {
  clients: KanbanClient[];
  columns: ClientStatut[];
  onStatusChange: (clientId: string, newStatut: ClientStatut) => Promise<void>;
  onAssign?: (clientId: string) => void;
  showAssignment?: boolean;
  isLoading?: boolean;
}

// ============================================
// Kanban Card
// ============================================

function KanbanCard({
  client,
  index,
  onAssign,
  showAssignment,
}: {
  client: KanbanClient;
  index: number;
  onAssign?: (clientId: string) => void;
  showAssignment?: boolean;
}) {
  const isVendeur = client.typeClient === "VENDEUR";

  return (
    <Draggable draggableId={client.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={clsx(
            "bg-dark-800 rounded-lg p-3 mb-2 border border-dark-700 cursor-grab",
            "hover:border-primary-500/50 transition-all",
            snapshot.isDragging && "shadow-lg shadow-primary-500/20 border-primary-500 rotate-1"
          )}
        >
          {/* Header: badge type + numéro */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={clsx(
                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                isVendeur
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-blue-500/20 text-blue-400"
              )}
            >
              {TYPE_CLIENT_LABELS[client.typeClient]}
            </span>
            <span className="text-[10px] text-dark-500">{client.numero}</span>
          </div>

          {/* Nom */}
          <Link
            href={`/admin/clients/${client.id}`}
            className="text-sm font-semibold text-white hover:text-primary-400 transition-colors block mb-1"
          >
            {client.prenom} {client.nom}
          </Link>

          {/* Contact */}
          <div className="text-xs text-dark-400 space-y-0.5 mb-2">
            {client.telephone && <div>{client.telephone}</div>}
            <div className="truncate">{client.email}</div>
          </div>

          {/* Budget/Prix */}
          {(client.budgetMax || client.prixVente) && (
            <div className="text-xs mb-2">
              <span className="text-dark-500">
                {isVendeur ? "Prix : " : "Budget : "}
              </span>
              <span className="text-white font-medium">
                {formatPrix(isVendeur ? client.prixVente! : client.budgetMax!)}
              </span>
            </div>
          )}

          {/* Ville */}
          {client.villeVente && (
            <div className="text-xs text-dark-400 mb-2">
              📍 {client.villeVente}
            </div>
          )}

          {/* Négociateur assigné */}
          {client.negociateur && (
            <div className="text-xs bg-dark-700/50 rounded px-2 py-1 mb-2">
              <span className="text-dark-500">Assigné à : </span>
              <span className="text-primary-400">
                {client.negociateur.prenom} {client.negociateur.nom}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark-700">
            <span className="text-[10px] text-dark-500">
              {new Date(client.createdAt).toLocaleDateString("fr-FR")}
            </span>
            <div className="flex gap-1">
              {showAssignment && !client.negociateur && onAssign && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(client.id);
                  }}
                  className="text-[10px] bg-primary-600 hover:bg-primary-700 text-white px-2 py-0.5 rounded transition-colors"
                >
                  Affecter
                </button>
              )}
              <Link
                href={`/admin/clients/${client.id}`}
                className="text-[10px] text-dark-400 hover:text-white transition-colors"
              >
                Voir →
              </Link>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ============================================
// Kanban Column
// ============================================

function KanbanColumn({
  statut,
  clients,
  onAssign,
  showAssignment,
}: {
  statut: ClientStatut;
  clients: KanbanClient[];
  onAssign?: (clientId: string) => void;
  showAssignment?: boolean;
}) {
  const colorClass = STATUT_CLIENT_COLORS[statut];

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={clsx("w-3 h-3 rounded-full", colorClass)} />
        <h3 className="text-sm font-semibold text-white">
          {STATUT_CLIENT_LABELS[statut]}
        </h3>
        <span className="text-xs text-dark-500 bg-dark-800 px-1.5 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={statut}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              "min-h-[200px] max-h-[calc(100vh-260px)] overflow-y-auto p-2 rounded-lg transition-colors",
              snapshot.isDraggingOver
                ? "bg-primary-500/10 border-2 border-dashed border-primary-500/30"
                : "bg-dark-900/50 border-2 border-transparent"
            )}
          >
            {clients.map((client, index) => (
              <KanbanCard
                key={client.id}
                client={client}
                index={index}
                onAssign={onAssign}
                showAssignment={showAssignment}
              />
            ))}
            {provided.placeholder}
            {clients.length === 0 && (
              <div className="text-center py-8 text-dark-600 text-xs">
                Aucun dossier
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ============================================
// Kanban Board Principal
// ============================================

export default function KanbanBoard({
  clients,
  columns,
  onStatusChange,
  onAssign,
  showAssignment = false,
  isLoading = false,
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | TypeClient>("ALL");

  // Filtrer les clients
  const filteredClients = clients.filter((c) => {
    if (filterType !== "ALL" && c.typeClient !== filterType) return false;
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

  // Grouper par statut
  const clientsByStatut = columns.reduce((acc, statut) => {
    acc[statut] = filteredClients.filter((c) => c.statut === statut);
    return acc;
  }, {} as Record<ClientStatut, KanbanClient[]>);

  // Handle drag & drop
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { destination, draggableId } = result;
      if (!destination) return;

      const newStatut = destination.droppableId as ClientStatut;
      const client = clients.find((c) => c.id === draggableId);
      if (!client || client.statut === newStatut) return;

      try {
        await onStatusChange(draggableId, newStatut);
      } catch (err) {
        console.error("Erreur changement statut:", err);
      }
    },
    [clients, onStatusChange]
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Filter type */}
        <div className="flex gap-1 bg-dark-800 rounded-lg p-0.5">
          {(["ALL", "ACQUEREUR", "VENDEUR"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filterType === type
                  ? "bg-primary-600 text-white"
                  : "text-dark-400 hover:text-white"
              )}
            >
              {type === "ALL" ? "Tous" : TYPE_CLIENT_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-xs text-dark-500">
          {filteredClients.length} dossier{filteredClients.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="flex items-center gap-2 mb-4 text-sm text-primary-400">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Mise à jour...
        </div>
      )}

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((statut) => (
            <KanbanColumn
              key={statut}
              statut={statut}
              clients={clientsByStatut[statut] || []}
              onAssign={onAssign}
              showAssignment={showAssignment}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
