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
  STATUT_CLIENT_COLORS,
  TYPE_CLIENT_LABELS,
  ClientStatut,
} from "@/lib/types";
import VendeurStats from "@/components/admin/VendeurStats";

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
  typeClient: string;
  // Champs vendeur
  prixVente: number | null;
  adresseBien: string | null;
  villeVente: string | null;
  surfaceBien: number | null;
  typeBienVente: string | null;
  descriptionBien: string | null;
  financementOk: boolean | null;
  // Relations
  negociateurId: string | null;
  negociateur: { id: string; prenom: string; nom: string } | null;
  mandatSigne: boolean;
  mandatNumero: string | null;
  mandatDate: string | null;
  mandatIP: string | null;
  biens: BienData[];
  appels: AppelData[];
  visites: VisiteData[];
  historiquePrix: { id: string; prix: number; prixPrecedent: number | null; commentaire: string | null; createdAt: string }[];
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

interface AppelData {
  id: string;
  date: string;
  duree: number | null;
  type: string;
  notes: string | null;
  interlocuteur: string | null;
  telephone: string | null;
}

interface VisiteData {
  id: string;
  dateVisite: string;
  creneau: string | null;
  statut: string;
  compteRendu: string | null;
  avisAcquereur: string | null;
  montantOffre: number | null;
  visiteurNom: string | null;
  visiteurPrenom: string | null;
  visiteurEmail: string | null;
  visiteurTelephone: string | null;
  financementOk: boolean | null;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showAddBien, setShowAddBien] = useState(false);
  const [showAddAppel, setShowAddAppel] = useState(false);
  const [showAddVisite, setShowAddVisite] = useState(false);
  const [negociateurs, setNegociateurs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"biens" | "appels" | "visites">("biens");

  const fetchNegociateurs = async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      const all = await res.json();
      setNegociateurs(all.filter((u: any) => u.role === "NEGOCIATEUR" || u.role === "SOUS_ADMIN" || u.role === "ADMIN"));
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
        typeClient: data.typeClient || "ACQUEREUR",
        prixVente: data.prixVente || "",
        adresseBien: data.adresseBien || "",
        villeVente: data.villeVente || "",
        surfaceBien: data.surfaceBien || "",
        typeBienVente: data.typeBienVente || "",
        descriptionBien: data.descriptionBien || "",
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

  if (loading) return <div className="text-dark-400">Chargement...</div>;
  if (!client) return <div className="text-red-400">Client non trouvé</div>;

  const isVendeur = client.typeClient === "VENDEUR";

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
        <Link href="/admin/pipeline" className="hover:text-primary-400">Pipeline</Link>
        <span>/</span>
        <Link href="/admin/clients" className="hover:text-primary-400">Clients</Link>
        <span>/</span>
        <span className="text-white">{client.prenom} {client.nom}</span>
      </div>

      {/* En-tête client */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">
                  {client.prenom} {client.nom}
                </h1>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  isVendeur ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"
                }`}>
                  {TYPE_CLIENT_LABELS[client.typeClient as keyof typeof TYPE_CLIENT_LABELS] || "Acquéreur"}
                </span>
              </div>
              <p className="text-dark-400 font-mono text-sm">{client.numero}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              STATUT_CLIENT_COLORS[client.statut as ClientStatut] || "bg-dark-700"
            }/20 text-white`}>
              {STATUT_CLIENT_LABELS[client.statut as ClientStatut] || client.statut}
            </span>
            <button onClick={() => setEditMode(!editMode)} className="btn-secondary text-sm">
              {editMode ? "Annuler" : "Modifier"}
            </button>
          </div>
        </div>

        {editMode ? (
          <EditForm editForm={editForm} setEditForm={setEditForm} isVendeur={isVendeur} onSave={saveClient} />
        ) : (
          <ClientInfo client={client} isVendeur={isVendeur} totalEco={totalEco} totalComm={totalComm}
            negociateurs={negociateurs} clientId={params.id as string} onUpdate={fetchClient} />
        )}
      </div>

      {/* Stats vendeur (compteur appels, prix, graphes) */}
      {isVendeur && (
        <VendeurStats
          clientId={params.id as string}
          appels={client.appels || []}
          historiquePrix={client.historiquePrix || []}
          prixVente={client.prixVente}
          onUpdate={fetchClient}
        />
      )}

      {/* Mandat (acquéreur uniquement) */}
      {!isVendeur && (
        <MandatSection client={client} clientId={params.id as string} onUpdate={fetchClient} />
      )}

      {/* Onglets : Biens / Appels / Visites */}
      <div className="flex gap-1 mb-4 bg-dark-800 rounded-lg p-0.5 w-fit">
        {(["biens", "appels", "visites"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-primary-600 text-white" : "text-dark-400 hover:text-white"
            }`}
          >
            {tab === "biens" ? `Biens (${client.biens.length})` :
             tab === "appels" ? `Appels (${client.appels?.length || 0})` :
             `Visites (${client.visites?.length || 0})`}
          </button>
        ))}
      </div>

      {/* Contenu onglet */}
      {activeTab === "biens" && (
        <BiensTab client={client} router={router} isVendeur={isVendeur}
          showAddBien={showAddBien} setShowAddBien={setShowAddBien} fetchClient={fetchClient} />
      )}

      {activeTab === "appels" && (
        <AppelsTab appels={client.appels || []} clientId={client.id}
          showAdd={showAddAppel} setShowAdd={setShowAddAppel} onUpdate={fetchClient} />
      )}

      {activeTab === "visites" && (
        <VisitesTab visites={client.visites || []} clientId={client.id}
          showAdd={showAddVisite} setShowAdd={setShowAddVisite} onUpdate={fetchClient} />
      )}
    </div>
  );
}

// ============================================
// Formulaire édition
// ============================================
function EditForm({ editForm, setEditForm, isVendeur, onSave }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-dark-400 mb-1">Prénom</label>
          <input value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Nom</label>
          <input value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Téléphone</label>
          <input value={editForm.telephone} onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })} className="input-field" />
        </div>
        <div>
          <label className="block text-xs text-dark-400 mb-1">Statut</label>
          <select value={editForm.statut} onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })} className="select-field">
            {Object.entries(STATUT_CLIENT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isVendeur ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Prix de vente</label>
              <input type="number" value={editForm.prixVente} onChange={(e) => setEditForm({ ...editForm, prixVente: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Surface (m²)</label>
              <input type="number" value={editForm.surfaceBien} onChange={(e) => setEditForm({ ...editForm, surfaceBien: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Ville</label>
              <input value={editForm.villeVente} onChange={(e) => setEditForm({ ...editForm, villeVente: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Adresse</label>
              <input value={editForm.adresseBien} onChange={(e) => setEditForm({ ...editForm, adresseBien: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Type de bien</label>
            <select value={editForm.typeBienVente} onChange={(e) => setEditForm({ ...editForm, typeBienVente: e.target.value })} className="select-field">
              <option value="">Non défini</option>
              {Object.entries(TYPE_BIEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Description</label>
            <textarea value={editForm.descriptionBien} onChange={(e) => setEditForm({ ...editForm, descriptionBien: e.target.value })} className="input-field" rows={2} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-dark-400 mb-1">Budget max</label>
            <input type="number" value={editForm.budgetMax} onChange={(e) => setEditForm({ ...editForm, budgetMax: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Prix idéal</label>
            <input type="number" value={editForm.prixIdeal} onChange={(e) => setEditForm({ ...editForm, prixIdeal: e.target.value })} className="input-field" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs text-dark-400 mb-1">Notes</label>
        <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="input-field" rows={2} />
      </div>

      <button onClick={onSave} className="btn-primary">Sauvegarder</button>
    </div>
  );
}

// ============================================
// Infos client (lecture)
// ============================================
function ClientInfo({ client, isVendeur, totalEco, totalComm, negociateurs, clientId, onUpdate }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div>
        <p className="text-xs text-dark-400">Email</p>
        <p className="text-sm text-white">{client.email}</p>
      </div>
      <div>
        <p className="text-xs text-dark-400">Téléphone</p>
        <p className="text-sm text-white">{client.telephone || "-"}</p>
      </div>

      {isVendeur ? (
        <>
          <div>
            <p className="text-xs text-dark-400">Prix de vente</p>
            <p className="text-lg font-bold text-orange-400">{client.prixVente ? formatPrix(client.prixVente) : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Type de bien</p>
            <p className="text-sm text-white">{TYPE_BIEN_LABELS[client.typeBienVente as keyof typeof TYPE_BIEN_LABELS] || client.typeBienVente || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Ville</p>
            <p className="text-sm text-white">{client.villeVente || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Surface</p>
            <p className="text-sm text-white">{client.surfaceBien ? `${client.surfaceBien} m²` : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Adresse</p>
            <p className="text-sm text-white">{client.adresseBien || "-"}</p>
          </div>
        </>
      ) : (
        <>
          <div>
            <p className="text-xs text-dark-400">Budget max</p>
            <p className="text-lg font-bold text-yellow-400">{client.budgetMax ? formatPrix(client.budgetMax) : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Prix idéal</p>
            <p className="text-lg font-bold text-green-400">{client.prixIdeal ? formatPrix(client.prixIdeal) : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Économies totales</p>
            <p className="text-lg font-bold text-green-400">{formatPrix(totalEco)}</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Commission</p>
            <p className="text-lg font-bold text-primary-400">{formatPrix(totalComm)}</p>
          </div>
        </>
      )}

      <div>
        <p className="text-xs text-dark-400">Source</p>
        <p className="text-sm text-dark-300">{SOURCE_LABELS[client.source as keyof typeof SOURCE_LABELS] || client.source}</p>
      </div>
      <div>
        <p className="text-xs text-dark-400">Négociateur</p>
        <select
          className="mt-1 bg-transparent border border-dark-700 rounded px-2 py-1 text-sm text-white outline-none focus:border-primary-500"
          value={client.negociateurId || ""}
          onChange={async (e) => {
            await fetch(`/api/clients/${clientId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ negociateurId: e.target.value || null }),
            });
            onUpdate();
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
          <p className="text-sm text-dark-300 whitespace-pre-line">{client.notes}</p>
        </div>
      )}

      {isVendeur && client.descriptionBien && (
        <div className="col-span-full">
          <p className="text-xs text-dark-400">Description du bien</p>
          <p className="text-sm text-dark-300 whitespace-pre-line">{client.descriptionBien}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// Onglet Biens
// ============================================
function BiensTab({ client, router, isVendeur, showAddBien, setShowAddBien, fetchClient }: any) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Biens ({client.biens.length})</h2>
        {(!isVendeur && client.mandatSigne) || isVendeur ? (
          <button onClick={() => setShowAddBien(true)} className="btn-primary text-sm">+ Ajouter un bien</button>
        ) : !isVendeur ? (
          <span className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            Mandat requis pour ajouter un bien
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        {client.biens.map((bien: BienData) => {
          const eco = bien.prixActuel ? calculerEconomie(bien.prixAffiche, bien.prixActuel) : 0;
          const comm = calculerCommission(eco);
          const dernierMove = bien.negociations[bien.negociations.length - 1];

          return (
            <div key={bien.id} className="card block hover:border-primary-600 transition-colors cursor-pointer"
              onClick={() => router.push(`/admin/clients/${client.id}/biens/${bien.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs bg-dark-700 px-2 py-1 rounded">
                      {TYPE_BIEN_LABELS[bien.typeBien as keyof typeof TYPE_BIEN_LABELS] || bien.typeBien || "Non défini"}
                    </span>
                    <span className={bien.statut.includes("ACCORD") ? "badge-accord" : bien.statut.includes("EN_") ? "badge-en-cours" : bien.statut === "NOUVEAU" ? "badge-nouveau" : "badge-clos"}>
                      {STATUT_BIEN_LABELS[bien.statut as keyof typeof STATUT_BIEN_LABELS] || bien.statut}
                    </span>
                  </div>
                  <p className="text-white font-medium">
                    {bien.ville || "Ville non définie"}{bien.codePostal ? ` (${bien.codePostal})` : ""}{bien.surface ? ` - ${bien.surface}m²` : ""}
                  </p>
                  {bien.lienAnnonce && <p className="text-xs text-primary-400 truncate max-w-md">{bien.lienAnnonce}</p>}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-dark-400 text-xs">Prix affiché</p>
                  <p className="text-lg font-bold text-white">{formatPrix(bien.prixAffiche)}</p>
                  {bien.prixActuel && bien.prixActuel !== bien.prixAffiche && (
                    <>
                      <p className="text-dark-400 text-xs">Dernier prix</p>
                      <p className="text-lg font-bold text-yellow-400">{formatPrix(bien.prixActuel)}</p>
                      {eco > 0 && <p className="text-green-400 text-sm">-{formatPrix(eco)} (comm: {formatPrix(comm)})</p>}
                    </>
                  )}
                </div>
              </div>
              {dernierMove && (
                <div className="mt-3 pt-3 border-t border-dark-700 flex items-center gap-2 text-sm text-dark-400">
                  <span className={dernierMove.camp === "ACQUEREUR" ? "text-primary-400" : "text-orange-400"}>
                    {dernierMove.camp === "ACQUEREUR" ? "Acquéreur" : "Vendeur"}
                  </span>
                  <span>-</span>
                  <span>{dernierMove.montant ? formatPrix(dernierMove.montant) : dernierMove.typeMove}</span>
                  {dernierMove.statut && (
                    <span className={dernierMove.statut === "ACCEPTE" ? "text-green-400" : dernierMove.statut === "REFUS" ? "text-red-400" : "text-yellow-400"}>
                      ({dernierMove.statut})
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {client.biens.length === 0 && <div className="card text-center text-dark-400 py-8">Aucun bien ajouté</div>}
      </div>

      {showAddBien && (
        <AddBienModal clientId={client.id} onClose={() => setShowAddBien(false)} onCreated={() => { setShowAddBien(false); fetchClient(); }} />
      )}
    </>
  );
}

// ============================================
// Onglet Appels
// ============================================
function AppelsTab({ appels, clientId, showAdd, setShowAdd, onUpdate }: {
  appels: AppelData[]; clientId: string; showAdd: boolean; setShowAdd: (v: boolean) => void; onUpdate: () => void;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appels ({appels.length})</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">+ Nouvel appel</button>
      </div>

      <div className="space-y-2">
        {appels.map((appel) => (
          <div key={appel.id} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              appel.type === "ENTRANT" ? "bg-green-500/20" : "bg-blue-500/20"
            }`}>
              <span className="text-lg">{appel.type === "ENTRANT" ? "📞" : "📱"}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${appel.type === "ENTRANT" ? "text-green-400" : "text-blue-400"}`}>
                  {appel.type === "ENTRANT" ? "Entrant" : "Sortant"}
                </span>
                {appel.interlocuteur && <span className="text-sm text-white">{appel.interlocuteur}</span>}
                {appel.duree && <span className="text-xs text-dark-500">{appel.duree} min</span>}
              </div>
              {appel.notes && <p className="text-xs text-dark-400 mt-1">{appel.notes}</p>}
            </div>
            <div className="text-right text-xs text-dark-500">
              {new Date(appel.date).toLocaleDateString("fr-FR")}
              <br />
              {new Date(appel.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
        {appels.length === 0 && <div className="card text-center text-dark-400 py-8">Aucun appel enregistré</div>}
      </div>

      {showAdd && (
        <AddAppelModal clientId={clientId} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); onUpdate(); }} />
      )}
    </>
  );
}

// ============================================
// Onglet Visites
// ============================================
function VisitesTab({ visites, clientId, showAdd, setShowAdd, onUpdate }: {
  visites: VisiteData[]; clientId: string; showAdd: boolean; setShowAdd: (v: boolean) => void; onUpdate: () => void;
}) {
  const STATUT_VISITE_COLORS: Record<string, string> = {
    PLANIFIEE: "text-yellow-400",
    REALISEE: "text-green-400",
    ANNULEE: "text-red-400",
    REPORT: "text-orange-400",
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Visites ({visites.length})</h2>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">+ Planifier une visite</button>
      </div>

      <div className="space-y-2">
        {visites.map((visite) => (
          <div key={visite.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${STATUT_VISITE_COLORS[visite.statut] || "text-dark-400"}`}>
                    {visite.statut}
                  </span>
                  <span className="text-sm text-white">
                    {new Date(visite.dateVisite).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    {" à "}
                    {new Date(visite.dateVisite).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {visite.creneau && <span className="text-xs text-dark-500 bg-dark-700 px-2 py-0.5 rounded">{visite.creneau}</span>}
                </div>
                {visite.visiteurNom && (
                  <div className="text-sm text-dark-300">
                    Visiteur : <span className="text-white">{visite.visiteurPrenom} {visite.visiteurNom}</span>
                    {visite.visiteurTelephone && <span className="text-dark-500 ml-2">{visite.visiteurTelephone}</span>}
                    {visite.financementOk !== null && (
                      <span className={`ml-2 text-xs ${visite.financementOk ? "text-green-400" : "text-red-400"}`}>
                        {visite.financementOk ? "Financement OK" : "Financement ?"}
                      </span>
                    )}
                  </div>
                )}
                {visite.compteRendu && <p className="text-xs text-dark-400 mt-1">{visite.compteRendu}</p>}
              </div>
              <div className="text-right">
                {visite.avisAcquereur && (
                  <span className={`text-sm font-bold ${
                    visite.avisAcquereur === "OUI" ? "text-green-400" :
                    visite.avisAcquereur === "NON" ? "text-red-400" : "text-yellow-400"
                  }`}>
                    {visite.avisAcquereur === "OUI" ? "Intéressé" : visite.avisAcquereur === "NON" ? "Pas intéressé" : "Réflexion"}
                  </span>
                )}
                {visite.montantOffre && (
                  <p className="text-sm text-primary-400 font-bold mt-1">Offre : {formatPrix(visite.montantOffre)}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {visites.length === 0 && <div className="card text-center text-dark-400 py-8">Aucune visite planifiée</div>}
      </div>

      {showAdd && (
        <AddVisiteModal clientId={clientId} onClose={() => setShowAdd(false)} onCreated={() => { setShowAdd(false); onUpdate(); }} />
      )}
    </>
  );
}

// ============================================
// Modal Ajout Appel
// ============================================
function AddAppelModal({ clientId, onClose, onCreated }: { clientId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ type: "ENTRANT", interlocuteur: "", telephone: "", duree: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/clients/${clientId}/appels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Nouvel appel</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {["ENTRANT", "SORTANT"].map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                  form.type === t ? "border-primary-500 bg-primary-500/10 text-primary-400" : "border-dark-700 text-dark-400"
                }`}>
                {t === "ENTRANT" ? "📞 Entrant" : "📱 Sortant"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Interlocuteur</label>
            <input value={form.interlocuteur} onChange={(e) => setForm({ ...form, interlocuteur: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Téléphone</label>
              <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Durée (min)</label>
              <input type="number" value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-dark-400 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={3} />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Ajout..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal Ajout Visite
// ============================================
function AddVisiteModal({ clientId, onClose, onCreated }: { clientId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    dateVisite: "", creneau: "", visiteurNom: "", visiteurPrenom: "",
    visiteurEmail: "", visiteurTelephone: "", financementOk: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/clients/${clientId}/visites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        financementOk: form.financementOk === "true" ? true : form.financementOk === "false" ? false : null,
      }),
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Planifier une visite</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Date et heure *</label>
              <input type="datetime-local" value={form.dateVisite} onChange={(e) => setForm({ ...form, dateVisite: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Créneau</label>
              <select value={form.creneau} onChange={(e) => setForm({ ...form, creneau: e.target.value })} className="select-field">
                <option value="">Choisir...</option>
                <option value="mardi_matin">Mardi matin</option>
                <option value="mardi_aprem">Mardi après-midi</option>
                <option value="jeudi_matin">Jeudi matin</option>
                <option value="jeudi_aprem">Jeudi après-midi</option>
                <option value="samedi_matin">Samedi matin</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="border-t border-dark-700 pt-4">
            <h3 className="text-sm font-semibold text-dark-300 mb-3">Visiteur (acquéreur potentiel)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Prénom</label>
                <input value={form.visiteurPrenom} onChange={(e) => setForm({ ...form, visiteurPrenom: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Nom</label>
                <input value={form.visiteurNom} onChange={(e) => setForm({ ...form, visiteurNom: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-xs text-dark-400 mb-1">Email</label>
                <input type="email" value={form.visiteurEmail} onChange={(e) => setForm({ ...form, visiteurEmail: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-dark-400 mb-1">Téléphone</label>
                <input value={form.visiteurTelephone} onChange={(e) => setForm({ ...form, visiteurTelephone: e.target.value })} className="input-field" />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs text-dark-400 mb-1">Financement</label>
              <select value={form.financementOk} onChange={(e) => setForm({ ...form, financementOk: e.target.value })} className="select-field">
                <option value="">Non renseigné</option>
                <option value="true">Financement OK</option>
                <option value="false">Pas encore de financement</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Ajout..." : "Planifier"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal Ajout Bien (existant, préservé)
// ============================================
function AddBienModal({ clientId, onClose, onCreated }: { clientId: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ lienAnnonce: "", prixAffiche: "", ville: "", codePostal: "", surface: "", typeBien: "APPARTEMENT" });
  const [vendeurForm, setVendeurForm] = useState({ nom: "", telephone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);

  const handleScrape = async () => {
    if (!form.lienAnnonce) return;
    setScraping(true);
    try {
      const res = await fetch(`/api/scrape-annonce`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: form.lienAnnonce }) });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, prixAffiche: data.prix ? String(data.prix) : prev.prixAffiche, ville: data.ville || prev.ville, codePostal: data.codePostal || prev.codePostal, surface: data.surface ? String(data.surface) : prev.surface, typeBien: data.typeBien || prev.typeBien }));
      }
    } catch {}
    setScraping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/clients/${clientId}/biens`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, vendeur: vendeurForm }) });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ajouter un bien</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Lien de l&apos;annonce</label>
            <div className="flex gap-2">
              <input type="url" value={form.lienAnnonce} onChange={(e) => setForm({ ...form, lienAnnonce: e.target.value })} className="input-field flex-1" placeholder="https://www.leboncoin.fr/..." />
              <button type="button" onClick={handleScrape} disabled={scraping || !form.lienAnnonce} className="btn-secondary px-3 text-sm whitespace-nowrap">
                {scraping ? "..." : "Scraper"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Prix affiché *</label>
              <input type="number" value={form.prixAffiche} onChange={(e) => setForm({ ...form, prixAffiche: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Type de bien</label>
              <select value={form.typeBien} onChange={(e) => setForm({ ...form, typeBien: e.target.value })} className="select-field">
                {Object.entries(TYPE_BIEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dark-300 mb-1">Ville</label>
              <input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Code postal</label>
              <input value={form.codePostal} onChange={(e) => setForm({ ...form, codePostal: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1">Surface m²</label>
              <input type="number" value={form.surface} onChange={(e) => setForm({ ...form, surface: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="border-t border-dark-600 pt-4">
            <h3 className="text-sm font-semibold text-dark-200 mb-3">Vendeur</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm text-dark-300 mb-1">Nom</label><input value={vendeurForm.nom} onChange={(e) => setVendeurForm({ ...vendeurForm, nom: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm text-dark-300 mb-1">Téléphone</label><input value={vendeurForm.telephone} onChange={(e) => setVendeurForm({ ...vendeurForm, telephone: e.target.value })} className="input-field" /></div>
            </div>
            <div className="mt-3"><label className="block text-sm text-dark-300 mb-1">Email</label><input type="email" value={vendeurForm.email} onChange={(e) => setVendeurForm({ ...vendeurForm, email: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "Ajout..." : "Ajouter"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// Section Mandat (préservée)
// ============================================
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
              {client.mandatNumero && <p className="text-xs text-dark-400 font-mono">{client.mandatNumero}</p>}
            </div>
          </div>
          <a href={`/api/clients/${clientId}/mandat/pdf`} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors">PDF</a>
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
            <p className="text-xs text-dark-400">Le client doit signer avant d&apos;ouvrir une négociation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {signUrl ? (
            <div className="flex items-center gap-2">
              <input type="text" readOnly value={signUrl} className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1.5 text-xs text-white w-64 truncate outline-none" />
              <button onClick={copyLink} className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 transition">{copied ? "Copié !" : "Copier"}</button>
            </div>
          ) : (
            <button onClick={generateLink} disabled={generating} className="text-xs bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition">
              {generating ? "Génération..." : "Générer le lien"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

