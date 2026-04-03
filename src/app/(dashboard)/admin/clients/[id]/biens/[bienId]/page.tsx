"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  formatPrix,
  calculerEconomie,
  calculerCommission,
  STATUT_BIEN_LABELS,
  TYPE_BIEN_LABELS,
} from "@/lib/types";

// ============================================================
// NÉGOCIATION PING-PONG v4 - Acquéreur LEFT, Vendeur RIGHT
// ============================================================

export default function BienDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bien, setBien] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [uiMode, setUiMode] = useState<"idle" | "counter" | "editing" | "newOffer">("idle");
  const [editingMoveId, setEditingMoveId] = useState<string | null>(null);
  const [commentingMoveId, setCommentingMoveId] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [newOfferAmount, setNewOfferAmount] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [commentText, setCommentText] = useState("");
  const [firstOfferAmount, setFirstOfferAmount] = useState("");
  const [waitingNewOfferFrom, setWaitingNewOfferFrom] = useState<string | null>(null);
  const [pendingCounterCamp, setPendingCounterCamp] = useState<string | null>(null);

  // Vendeur edit
  const [editVendeur, setEditVendeur] = useState(false);
  const [vendeurForm, setVendeurForm] = useState<any>({});

  // Bien edit
  const [editBien, setEditBien] = useState(false);
  const [bienForm, setBienForm] = useState<any>({});

  const fetchData = useCallback(async () => {
    const [bienRes, clientRes] = await Promise.all([
      fetch(`/api/biens/${params.bienId}`),
      fetch(`/api/clients/${params.id}`),
    ]);
    if (bienRes.ok) {
      const b = await bienRes.json();
      setBien(b);
      setBienForm({
        lienAnnonce: b.lienAnnonce || "",
        prixAffiche: b.prixAffiche,
        ville: b.ville || "",
        codePostal: b.codePostal || "",
        surface: b.surface || "",
        typeBien: b.typeBien || "",
        statut: b.statut,
        commentaireFinal: b.commentaireFinal || "",
      });
      setVendeurForm({
        nom: b.vendeur?.nom || "",
        telephone: b.vendeur?.telephone || "",
        email: b.vendeur?.email || "",
        notes: b.vendeur?.notes || "",
        contexte: b.vendeur?.contexte || "",
      });
    }
    if (clientRes.ok) {
      setClient(await clientRes.json());
    }
    setLoading(false);
  }, [params.bienId, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===== API CALLS =====

  const addMove = async (camp: string, typeMove: string, montant: string | null, statut: string | null, commentaire?: string) => {
    await fetch(`/api/biens/${params.bienId}/negociation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camp, typeMove, montant, statut, commentaire: commentaire || null, interne: false }),
    });
    await fetchData();
  };

  const updateMoveComment = async (moveId: string, commentaire: string) => {
    await fetch(`/api/biens/${params.bienId}/negociation/${moveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentaire }),
    });
    await fetchData();
  };

  const updateMoveStatut = async (moveId: string, statut: string) => {
    await fetch(`/api/biens/${params.bienId}/negociation/${moveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });
    await fetchData();
  };

  const updateMoveMontant = async (moveId: string, montant: string) => {
    await fetch(`/api/biens/${params.bienId}/negociation/${moveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montant: parseFloat(montant) }),
    });
    await fetchData();
  };

  const saveBien = async () => {
    await fetch(`/api/biens/${params.bienId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bienForm),
    });
    setEditBien(false);
    fetchData();
  };

  const saveVendeur = async () => {
    await fetch(`/api/biens/${params.bienId}/vendeur`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendeurForm),
    });
    setEditVendeur(false);
    fetchData();
  };

  // ===== ACTIONS BIEN =====

  const deleteBien = async () => {
    if (!confirm("Supprimer ce bien et toute sa négociation ? Cette action est irréversible.")) return;
    await fetch(`/api/biens/${params.bienId}`, { method: "DELETE" });
    router.push(`/admin/clients/${params.id}`);
  };

  const resetNego = async () => {
    if (!confirm("Remettre à zéro toute la négociation ? Tous les échanges seront supprimés.")) return;
    await fetch(`/api/biens/${params.bienId}/negociation`, { method: "DELETE" });
    setUiMode("idle");
    setWaitingNewOfferFrom(null);
    setPendingCounterCamp(null);
    setEditingMoveId(null);
    setCommentingMoveId(null);
    await fetchData();
  };

  // ===== PING-PONG ACTIONS =====

  const handleFirstOffer = async () => {
    if (!firstOfferAmount) return;
    await addMove("ACQUEREUR", "OFFRE", firstOfferAmount, null);
    setFirstOfferAmount("");
  };

  const handleAccept = async (moveId: string) => {
    await updateMoveStatut(moveId, "ACCEPTE");
    setUiMode("idle");
    setWaitingNewOfferFrom(null);
  };

  const handleRefuse = async (moveId: string, moveCamp: string) => {
    await updateMoveStatut(moveId, "REFUS");
    // La balle passe au camp OPPOSÉ : si l'acquéreur est refusé, c'est au vendeur de répondre
    setWaitingNewOfferFrom(moveCamp === "ACQUEREUR" ? "VENDEUR" : "ACQUEREUR");
    setUiMode("newOffer");
  };

  const handleCounterOffer = (moveId: string) => {
    // Find who is responding (opposite of the move's camp)
    const move = bien?.negociations.find((m: any) => m.id === moveId);
    if (!move) return;
    setPendingCounterCamp(move.camp === "ACQUEREUR" ? "VENDEUR" : "ACQUEREUR");
    setUiMode("counter");
    setCounterAmount("");
  };

  const submitCounterOffer = async () => {
    if (!counterAmount || !pendingCounterCamp) return;
    // First: mark the current active offer as refused
    const activeMove = getLastActiveMove();
    if (activeMove) {
      await updateMoveStatut(activeMove.id, "REFUS");
    }
    // Then add the counter-offer
    await addMove(pendingCounterCamp, "CONTRE_OFFRE", counterAmount, null);
    setUiMode("idle");
    setPendingCounterCamp(null);
    setCounterAmount("");
  };

  const submitNewOffer = async () => {
    if (!newOfferAmount || !waitingNewOfferFrom) return;
    await addMove(waitingNewOfferFrom, "CONTRE_OFFRE", newOfferAmount, null);
    setWaitingNewOfferFrom(null);
    setUiMode("idle");
    setNewOfferAmount("");
  };

  const startEdit = (moveId: string, currentAmount: number) => {
    setEditingMoveId(moveId);
    setEditAmount(String(currentAmount));
    setUiMode("editing");
  };

  const saveEdit = async () => {
    if (!editingMoveId || !editAmount) return;
    await updateMoveMontant(editingMoveId, editAmount);
    setEditingMoveId(null);
    setUiMode("idle");
    setEditAmount("");
  };

  const startComment = (moveId: string, currentComment: string) => {
    setCommentingMoveId(moveId);
    setCommentText(currentComment || "");
  };

  const saveComment = async () => {
    if (!commentingMoveId) return;
    await updateMoveComment(commentingMoveId, commentText);
    setCommentingMoveId(null);
    setCommentText("");
  };

  const cancelUI = () => {
    setUiMode("idle");
    setEditingMoveId(null);
    setPendingCounterCamp(null);
    setCounterAmount("");
    setEditAmount("");
  };

  // ===== HELPERS =====

  const getLastActiveMove = () => {
    if (!bien?.negociations) return null;
    const actives = bien.negociations.filter((m: any) => m.statut !== "REFUS" && m.statut !== "SANS_SUITE");
    return actives.length > 0 ? actives[actives.length - 1] : null;
  };

  const isDone = () => {
    return bien?.negociations?.some((m: any) => m.statut === "ACCEPTE");
  };

  // ===== RENDER =====

  if (loading) return <div className="text-gray-400 p-8">Chargement...</div>;
  if (!bien || !client) return <div className="text-red-400 p-8">Non trouvé</div>;

  const eco = bien.prixActuel ? calculerEconomie(bien.prixAffiche, bien.prixActuel) : 0;
  const comm = calculerCommission(eco);
  const negotiationDone = isDone();
  const activeMove = getLastActiveMove();
  const chronoMoves = [...(bien.negociations || [])].sort((a: any, b: any) => a.ordre - b.ordre);

  // Calcul de l'écart : dernière offre acquéreur vs dernière offre vendeur (ou prix affiché)
  const lastAcqMove = [...chronoMoves].reverse().find((m: any) => m.camp === "ACQUEREUR" && m.montant && m.statut !== "SANS_SUITE");
  const lastVendMove = [...chronoMoves].reverse().find((m: any) => m.camp === "VENDEUR" && m.montant && m.statut !== "SANS_SUITE");
  const prixDemande = lastVendMove?.montant || bien.prixAffiche;
  const prixOffre = lastAcqMove?.montant || 0;
  const ecart = prixOffre > 0 ? Math.abs(prixDemande - prixOffre) : 0;

  // Commentaires de la négociation (chronologiques)
  const negoComments = chronoMoves.filter((m: any) => m.commentaire);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb + Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin/clients" className="hover:text-indigo-400">Clients</Link>
          <span>/</span>
          <Link href={`/admin/clients/${params.id}`} className="hover:text-indigo-400">
            {client.prenom} {client.nom}
          </Link>
          <span>/</span>
          <span className="text-white">{bien.ville || "Bien"} - {formatPrix(bien.prixAffiche)}</span>
        </div>
        <div className="flex items-center gap-2">
          {chronoMoves.length > 0 && (
            <button onClick={resetNego} className="text-[11px] text-yellow-500 border border-yellow-500/30 px-2.5 py-1.5 rounded-lg hover:bg-yellow-500/10 transition">
              RAZ Négo
            </button>
          )}
          <button onClick={deleteBien} className="text-[11px] text-red-500 border border-red-500/30 px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 transition">
            Supprimer
          </button>
        </div>
      </div>

      {/* ===== EN-TÊTE 3 COLONNES : ACQUÉREUR | PRIX + ÉCART | VENDEUR ===== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* LEFT: Acquéreur */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Acquéreur
          </p>
          <p className="font-semibold text-white text-sm">{client.prenom} {client.nom}</p>
          <div className="space-y-1 mt-2">
            {client.telephone && (
              <p className="text-xs text-gray-400"><span className="text-gray-600">Tél:</span> {client.telephone}</p>
            )}
            {client.email && (
              <p className="text-xs text-gray-400"><span className="text-gray-600">Email:</span> {client.email}</p>
            )}
            {client.budgetMax && (
              <p className="text-xs text-gray-400"><span className="text-gray-600">Budget:</span> {formatPrix(client.budgetMax)}</p>
            )}
          </div>
        </div>

        {/* CENTER: Prix affiché + Écart */}
        <div className="text-center flex flex-col items-center justify-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Prix affiché</p>
          <p className="text-3xl font-extrabold text-white mt-1">{formatPrix(bien.prixAffiche)}</p>
          <p className="text-xs text-gray-500 mt-1">
            {bien.typeBien ? TYPE_BIEN_LABELS[bien.typeBien as keyof typeof TYPE_BIEN_LABELS] || bien.typeBien : ""}
            {bien.surface ? ` · ${bien.surface}m²` : ""}
            {bien.ville ? ` · ${bien.ville}` : ""}
          </p>
          {ecart > 0 && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
              <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-bold">Écart</p>
              <p className="text-2xl font-extrabold text-yellow-400">{formatPrix(ecart)}</p>
            </div>
          )}
        </div>

        {/* RIGHT: Vendeur */}
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-orange-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
              Vendeur
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            </p>
            <button onClick={() => setEditVendeur(!editVendeur)} className="text-[10px] text-gray-500 hover:text-white">
              {editVendeur ? "✕" : "✏️"}
            </button>
          </div>
          {editVendeur ? (
            <div className="space-y-2">
              <input value={vendeurForm.nom} onChange={(e) => setVendeurForm({ ...vendeurForm, nom: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-orange-500" placeholder="Nom" />
              <input value={vendeurForm.telephone} onChange={(e) => setVendeurForm({ ...vendeurForm, telephone: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-orange-500" placeholder="Téléphone" />
              <input value={vendeurForm.email} onChange={(e) => setVendeurForm({ ...vendeurForm, email: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-orange-500" placeholder="Email" />
              <button onClick={saveVendeur} className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded w-full">Sauvegarder</button>
            </div>
          ) : (
            <>
              <p className="font-semibold text-white text-sm">{bien.vendeur?.nom || "Non renseigné"}</p>
              <div className="space-y-1 mt-2">
                {bien.vendeur?.telephone && (
                  <p className="text-xs text-gray-400"><span className="text-gray-600">Tél:</span> {bien.vendeur.telephone}</p>
                )}
                {bien.vendeur?.email && (
                  <p className="text-xs text-gray-400"><span className="text-gray-600">Email:</span> {bien.vendeur.email}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===== LÉGENDE ===== */}
      <div className="flex justify-between items-center px-4 mb-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Acquéreur
        </div>
        <span className="text-xs text-gray-600">← balle →</span>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400">
          Vendeur
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
        </div>
      </div>

      {/* ===== TIMELINE PING-PONG ===== */}
      <div className="relative min-h-[100px]">
        {/* Ligne centrale */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2 z-0"></div>

        {/* Moves chronologiques */}
        {chronoMoves.map((m: any) => {
          const isFromAcq = m.camp === "ACQUEREUR";
          const isRefused = m.statut === "REFUS" || m.statut === "SANS_SUITE";
          const isAccepted = m.statut === "ACCEPTE";
          const isActive = activeMove && m.id === activeMove.id && !negotiationDone && !waitingNewOfferFrom;

          let posClass = isFromAcq ? "justify-start" : "justify-end";
          if (isAccepted) posClass = "justify-center";

          let borderClass = isFromAcq ? "border-l-4 border-l-indigo-500" : "border-r-4 border-r-orange-500";
          let bgClass = isFromAcq ? "bg-indigo-500/5 border-indigo-500/20" : "bg-orange-500/5 border-orange-500/20";
          if (isAccepted) {
            borderClass = "border-2 border-green-500";
            bgClass = "bg-green-500/10";
          }
          let opacityClass = isRefused ? "opacity-40" : "";

          let amountColor = isFromAcq ? "text-indigo-400" : "text-orange-400";
          if (isRefused) amountColor = "text-gray-500 line-through";
          if (isAccepted) amountColor = "text-green-400";

          let textAlign = isFromAcq ? "text-left" : "text-right";
          if (isAccepted) textAlign = "text-center";

          const campTag = isFromAcq
            ? <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">ACQ</span>
            : <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">VEND</span>;

          const typeLabel = m.ordre === 1 ? "Offre" : m.statut === "ACCEPTE" ? "ACCORD" : "Contre-offre";

          return (
            <div key={m.id} className={`relative z-10 py-2 flex ${posClass}`}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className={`w-3 h-3 rounded-full border-2 ${
                  isRefused ? "w-2 h-2 border-red-500 bg-red-500 opacity-40" :
                  isAccepted ? "border-green-500 bg-green-500" :
                  isFromAcq ? "border-indigo-500 bg-indigo-500" : "border-orange-500 bg-orange-500"
                }`}></div>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-1 text-[9px] text-gray-600 bg-gray-950 px-1 z-30">{m.ordre}</div>

              <div className={`w-[46%] rounded-xl px-4 py-3 border ${borderClass} ${bgClass} ${opacityClass} ${textAlign}`}>
                {m.montant && (
                  <p className={`text-2xl font-extrabold ${amountColor}`}>
                    {formatPrix(m.montant)}
                  </p>
                )}

                <div className={`flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 flex-wrap ${isFromAcq && !isAccepted ? "justify-start" : !isAccepted ? "justify-end" : "justify-center"}`}>
                  {campTag}
                  <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">#{m.ordre}</span>
                  <span>{typeLabel}</span>
                  {isRefused && <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded font-semibold">Refusé</span>}
                  {isAccepted && <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded font-semibold">Accepté</span>}
                </div>

                {/* Comment section */}
                <div style={{ opacity: 1 }}>
                  {commentingMoveId === m.id ? (
                    <div className="flex gap-1 mt-2 items-center">
                      <input type="text" className="bg-gray-950 border border-gray-700 rounded-md px-2 py-1.5 text-xs text-white flex-1 outline-none focus:border-indigo-500" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Raison du refus, note, contexte..." autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveComment(); if (e.key === "Escape") setCommentingMoveId(null); }} />
                      <button onClick={saveComment} className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-md">OK</button>
                      <button onClick={() => setCommentingMoveId(null)} className="text-gray-500 text-xs border border-gray-700 px-2 py-1.5 rounded-md">✗</button>
                    </div>
                  ) : m.commentaire ? (
                    <div className="mt-2 text-xs text-gray-400 italic bg-white/5 px-2 py-1.5 rounded border-l-2 border-gray-700 cursor-pointer hover:border-indigo-500" onClick={() => startComment(m.id, m.commentaire)} title="Cliquer pour modifier">
                      &ldquo;{m.commentaire}&rdquo;
                    </div>
                  ) : (
                    <button className="mt-2 text-[11px] text-gray-500 bg-gray-800/50 border border-gray-700/50 px-2 py-1 rounded hover:text-white hover:border-gray-500 transition-colors" onClick={() => startComment(m.id, "")}>
                      Commentaire
                    </button>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                {isActive && (
                  <div className="mt-3">
                    {editingMoveId === m.id ? (
                      <div className={`flex gap-1.5 items-center ${isFromAcq ? "justify-start" : "justify-end"}`}>
                        <input type="number" className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-base font-bold text-white w-36 text-center outline-none focus:border-indigo-500" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} autoFocus onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelUI(); }} />
                        <button onClick={saveEdit} className="bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">OK</button>
                        <button onClick={cancelUI} className="text-gray-500 text-xs border border-gray-700 px-2 py-1.5 rounded-lg">Annuler</button>
                      </div>
                    ) : uiMode === "counter" ? (
                      <div className={`flex gap-1.5 items-center mt-1 ${isFromAcq ? "justify-start" : "justify-end"}`}>
                        <input type="number" className={`bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-base font-bold text-white w-36 text-center outline-none ${pendingCounterCamp === "VENDEUR" ? "focus:border-orange-500" : "focus:border-indigo-500"}`} value={counterAmount} onChange={(e) => setCounterAmount(e.target.value)} placeholder="Montant" autoFocus onKeyDown={(e) => { if (e.key === "Enter") submitCounterOffer(); if (e.key === "Escape") cancelUI(); }} />
                        <button onClick={submitCounterOffer} className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg ${pendingCounterCamp === "VENDEUR" ? "bg-orange-500" : "bg-indigo-500"}`}>Envoyer</button>
                        <button onClick={cancelUI} className="text-gray-500 text-xs border border-gray-700 px-2 py-1.5 rounded-lg">Annuler</button>
                      </div>
                    ) : (
                      <div className={`flex gap-1.5 flex-wrap ${isFromAcq ? "justify-start" : "justify-end"}`}>
                        <button onClick={() => handleAccept(m.id)} className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-600 transition">Accepter</button>
                        <button onClick={() => handleRefuse(m.id, m.camp)} className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition">Refuser</button>
                        <button onClick={() => handleCounterOffer(m.id)} className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition">Contre-offre</button>
                        <button onClick={() => startEdit(m.id, m.montant)} className="text-gray-500 text-[10px] hover:text-white" title="Modifier">✏️</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* NEW OFFER zone (after refuse) */}
        {waitingNewOfferFrom && !negotiationDone && (
          <div className={`relative z-10 py-2 flex ${waitingNewOfferFrom === "ACQUEREUR" ? "justify-start" : "justify-end"}`}>
            <div className={`w-[46%] rounded-xl px-4 py-3 border-2 border-dashed ${
              waitingNewOfferFrom === "ACQUEREUR" ? "border-indigo-500/50 bg-indigo-500/5 text-left" : "border-orange-500/50 bg-orange-500/5 text-right"
            }`}>
              <p className="text-xs text-gray-400 mb-2">
                Au tour de <strong className={waitingNewOfferFrom === "ACQUEREUR" ? "text-indigo-400" : "text-orange-400"}>
                  {waitingNewOfferFrom === "ACQUEREUR" ? "l'acquéreur" : "du vendeur"}
                </strong>
              </p>
              <div className={`flex gap-1.5 items-center ${waitingNewOfferFrom === "VENDEUR" ? "justify-end" : "justify-start"}`}>
                <input type="number" className={`bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-base font-bold text-white w-36 text-center outline-none ${waitingNewOfferFrom === "VENDEUR" ? "focus:border-orange-500" : "focus:border-indigo-500"}`} value={newOfferAmount} onChange={(e) => setNewOfferAmount(e.target.value)} placeholder="Montant" autoFocus onKeyDown={(e) => { if (e.key === "Enter") submitNewOffer(); if (e.key === "Escape") { setWaitingNewOfferFrom(null); setUiMode("idle"); } }} />
                <button onClick={submitNewOffer} className={`text-white text-xs font-bold px-3 py-1.5 rounded-lg ${waitingNewOfferFrom === "VENDEUR" ? "bg-orange-500" : "bg-indigo-500"}`}>Offrir</button>
              </div>
            </div>
          </div>
        )}

        {/* FIRST OFFER */}
        {chronoMoves.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">L&apos;acquéreur fait sa première offre</p>
            <div className="flex gap-2 justify-center items-center">
              <input type="number" className="bg-gray-950 border-2 border-indigo-500 rounded-xl px-4 py-2.5 text-xl font-bold text-indigo-400 w-44 text-center outline-none" value={firstOfferAmount} onChange={(e) => setFirstOfferAmount(e.target.value)} placeholder="350000" autoFocus onKeyDown={(e) => { if (e.key === "Enter") handleFirstOffer(); }} />
              <button onClick={handleFirstOffer} className="bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm">Offrir</button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {negotiationDone && (() => {
          const accepted = bien.negociations.find((m: any) => m.statut === "ACCEPTE");
          if (!accepted) return null;
          const ecoFinal = calculerEconomie(bien.prixAffiche, accepted.montant || bien.prixActuel);
          const commFinal = calculerCommission(ecoFinal);
          return (
            <div className="mt-4 p-6 bg-green-500/10 border-2 border-green-500 rounded-2xl text-center max-w-md mx-auto">
              <p className="text-xs text-green-400 font-bold uppercase tracking-widest">Accord trouvé !</p>
              <p className="text-4xl font-extrabold text-green-400 mt-1">{formatPrix(accepted.montant || bien.prixActuel)}</p>
              <div className="flex justify-center gap-8 mt-3">
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Économie</p>
                  <p className="text-base font-bold text-green-400">{formatPrix(ecoFinal)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Commission</p>
                  <p className="text-base font-bold text-indigo-400">{formatPrix(commFinal + 500)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Prix initial</p>
                  <p className="text-base font-bold text-gray-500 line-through">{formatPrix(bien.prixAffiche)}</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ===== PANNEAUX COMMENTAIRES : NÉGO (gauche) | VENDEUR (droite) ===== */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* LEFT: Fil chronologique des commentaires de négociation */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 max-h-80 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
            Fil de négociation
          </h3>
          {negoComments.length === 0 ? (
            <p className="text-xs text-gray-600 italic">Aucun commentaire pour le moment</p>
          ) : (
            <div className="space-y-2">
              {negoComments.map((m: any) => (
                <div key={m.id} className={`text-xs px-3 py-2 rounded-lg border-l-2 ${
                  m.camp === "ACQUEREUR" ? "border-l-indigo-500 bg-indigo-500/5" : "border-l-orange-500 bg-orange-500/5"
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-bold uppercase ${m.camp === "ACQUEREUR" ? "text-indigo-400" : "text-orange-400"}`}>
                      {m.camp === "ACQUEREUR" ? "ACQ" : "VEND"} #{m.ordre}
                    </span>
                    {m.montant && <span className="text-gray-500">{formatPrix(m.montant)}</span>}
                    {m.statut === "REFUS" && <span className="text-red-400 text-[9px]">Refusé</span>}
                    {m.statut === "ACCEPTE" && <span className="text-green-400 text-[9px]">Accepté</span>}
                  </div>
                  <p className="text-gray-300 italic">&ldquo;{m.commentaire}&rdquo;</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Notes et contexte vendeur */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 max-h-80 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Notes vendeur
          </h3>
          {editVendeur ? (
            <div className="space-y-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Notes</label>
                <textarea value={vendeurForm.notes} onChange={(e) => setVendeurForm({ ...vendeurForm, notes: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500" rows={4} placeholder="Notes sur le vendeur..." />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Contexte de vente</label>
                <textarea value={vendeurForm.contexte} onChange={(e) => setVendeurForm({ ...vendeurForm, contexte: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500" rows={3} placeholder="Pourquoi vend-il ? Urgence ? Divorce ? Succession ?..." />
              </div>
              <button onClick={saveVendeur} className="bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg w-full">Sauvegarder</button>
            </div>
          ) : (
            <div>
              {bien.vendeur?.notes ? (
                <p className="text-xs text-gray-300 whitespace-pre-wrap mb-3">{bien.vendeur.notes}</p>
              ) : (
                <p className="text-xs text-gray-600 italic mb-2">Aucune note</p>
              )}
              {bien.vendeur?.contexte && (
                <div className="border-t border-gray-800 pt-2 mt-2">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Contexte</p>
                  <p className="text-xs text-gray-400 italic">{bien.vendeur.contexte}</p>
                </div>
              )}
              <button onClick={() => setEditVendeur(true)} className="mt-3 text-[11px] text-orange-400 hover:text-orange-300 border border-orange-500/30 px-3 py-1 rounded-lg hover:bg-orange-500/10 transition">
                Modifier les notes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== INFO BIEN ===== */}
      <div className="mt-4 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold">Informations du bien</h3>
          <button onClick={() => setEditBien(!editBien)} className="text-xs text-indigo-400 hover:underline">
            {editBien ? "Annuler" : "Modifier"}
          </button>
        </div>
        {editBien ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Statut</label>
                <select value={bienForm.statut} onChange={(e) => setBienForm({ ...bienForm, statut: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none">
                  {Object.entries(STATUT_BIEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Type</label>
                <select value={bienForm.typeBien} onChange={(e) => setBienForm({ ...bienForm, typeBien: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none">
                  {Object.entries(TYPE_BIEN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Surface m²</label>
                <input type="number" value={bienForm.surface} onChange={(e) => setBienForm({ ...bienForm, surface: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Ville</label>
                <input value={bienForm.ville} onChange={(e) => setBienForm({ ...bienForm, ville: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Code postal</label>
                <input value={bienForm.codePostal} onChange={(e) => setBienForm({ ...bienForm, codePostal: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Lien annonce</label>
              <input value={bienForm.lienAnnonce} onChange={(e) => setBienForm({ ...bienForm, lienAnnonce: e.target.value })} className="w-full bg-gray-950 border border-gray-700 rounded-lg px-2 py-1.5 text-sm text-white outline-none" />
            </div>
            <button onClick={saveBien} className="bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">Sauvegarder</button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-[10px] text-gray-600">Statut</p>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                bien.statut.includes("ACCORD") ? "bg-green-500/15 text-green-400" :
                bien.statut.includes("EN_") ? "bg-indigo-500/15 text-indigo-400" :
                "bg-gray-700/30 text-gray-400"
              }`}>
                {STATUT_BIEN_LABELS[bien.statut as keyof typeof STATUT_BIEN_LABELS] || bien.statut}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Type</p>
              <p className="text-gray-300">{TYPE_BIEN_LABELS[bien.typeBien as keyof typeof TYPE_BIEN_LABELS] || bien.typeBien || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Ville</p>
              <p className="text-gray-300">{bien.ville || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-600">Surface</p>
              <p className="text-gray-300">{bien.surface ? bien.surface + " m²" : "-"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}