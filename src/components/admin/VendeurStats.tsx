"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrix } from "@/lib/types";

interface VendeurStatsProps {
  clientId: string;
  appels: { id: string; date: string; type: string; notes: string | null }[];
  historiquePrix: { id: string; prix: number; prixPrecedent: number | null; commentaire: string | null; createdAt: string }[];
  prixVente: number | null;
  onUpdate: () => void;
}

export default function VendeurStats({ clientId, appels, historiquePrix, prixVente, onUpdate }: VendeurStatsProps) {
  const [totalAppels, setTotalAppels] = useState(appels.length);
  const [appelsAujourdhui, setAppelsAujourdhui] = useState(0);
  const [adding, setAdding] = useState(false);
  const [showBaissePrix, setShowBaissePrix] = useState(false);
  const [nouveauPrix, setNouveauPrix] = useState("");
  const [commentairePrix, setCommentairePrix] = useState("");

  // Calculer les appels du jour
  useEffect(() => {
    const today = new Date().toDateString();
    const todayCount = appels.filter((a) => new Date(a.date).toDateString() === today).length;
    setAppelsAujourdhui(todayCount);
    setTotalAppels(appels.length);
  }, [appels]);

  // Bouton +1 appel rapide
  const handleAppelRapide = async () => {
    setAdding(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/appel-rapide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setTotalAppels(data.totalAppels);
        setAppelsAujourdhui((prev) => prev + 1);
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  // Enregistrer une baisse de prix
  const handleBaissePrix = async () => {
    if (!nouveauPrix) return;
    try {
      const res = await fetch(`/api/clients/${clientId}/historique-prix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prix: nouveauPrix, commentaire: commentairePrix }),
      });
      if (res.ok) {
        setShowBaissePrix(false);
        setNouveauPrix("");
        setCommentairePrix("");
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculer les stats d'appels par jour (7 derniers jours)
  const getAppelsParJour = () => {
    const jours: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const label = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
      const count = appels.filter((a) => new Date(a.date).toDateString() === dateStr).length;
      jours.push({ date: label, count });
    }
    return jours;
  };

  const appelsParJour = getAppelsParJour();
  const maxAppels = Math.max(...appelsParJour.map((j) => j.count), 1);

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Statistiques commercialisation</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total appels */}
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-400">{totalAppels}</p>
          <p className="text-xs text-dark-400 mt-1">Appels total</p>
        </div>

        {/* Appels aujourd'hui */}
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{appelsAujourdhui}</p>
          <p className="text-xs text-dark-400 mt-1">Aujourd&apos;hui</p>
        </div>

        {/* Bouton +1 */}
        <div className="bg-dark-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <button
            onClick={handleAppelRapide}
            disabled={adding}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 text-white text-2xl font-bold transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
          >
            {adding ? "..." : "+1"}
          </button>
          <p className="text-xs text-dark-400 mt-2">Appel reçu</p>
        </div>

        {/* Prix actuel + baisse */}
        <div className="bg-dark-800 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">
            {prixVente ? formatPrix(prixVente) : "-"}
          </p>
          <p className="text-xs text-dark-400 mt-1">Prix actuel</p>
          <button
            onClick={() => setShowBaissePrix(!showBaissePrix)}
            className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors"
          >
            Baisser le prix
          </button>
        </div>
      </div>

      {/* Formulaire baisse de prix */}
      {showBaissePrix && (
        <div className="bg-dark-800 rounded-lg p-4 mb-6 border border-red-500/20">
          <h4 className="text-sm font-semibold text-red-400 mb-3">Nouvelle baisse de prix</h4>
          <div className="flex gap-3">
            <input
              type="number"
              value={nouveauPrix}
              onChange={(e) => setNouveauPrix(e.target.value)}
              placeholder="Nouveau prix"
              className="input-field flex-1"
            />
            <input
              type="text"
              value={commentairePrix}
              onChange={(e) => setCommentairePrix(e.target.value)}
              placeholder="Raison (optionnel)"
              className="input-field flex-1"
            />
            <button onClick={handleBaissePrix} className="btn-primary text-sm whitespace-nowrap">
              Valider
            </button>
          </div>
          {prixVente && nouveauPrix && parseFloat(nouveauPrix) < prixVente && (
            <p className="text-xs text-red-400 mt-2">
              Baisse de {formatPrix(prixVente - parseFloat(nouveauPrix))} ({((prixVente - parseFloat(nouveauPrix)) / prixVente * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      )}

      {/* Mini graphe appels 7 jours */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-dark-300 mb-3">Appels - 7 derniers jours</h4>
        <div className="flex items-end gap-1 h-20">
          {appelsParJour.map((jour, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary-500/30 hover:bg-primary-500/50 rounded-t transition-all relative group"
                style={{ height: `${(jour.count / maxAppels) * 100}%`, minHeight: jour.count > 0 ? "4px" : "0" }}
              >
                {jour.count > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-primary-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {jour.count}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-dark-500 mt-1 truncate w-full text-center">{jour.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des prix */}
      {historiquePrix.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-dark-300 mb-3">Historique des prix</h4>

          {/* Mini graphe prix */}
          <div className="flex items-end gap-1 h-16 mb-3">
            {historiquePrix.map((h, i) => {
              const allPrix = historiquePrix.map((p) => p.prix);
              const maxP = Math.max(...allPrix);
              const minP = Math.min(...allPrix) * 0.9;
              const range = maxP - minP || 1;
              const height = ((h.prix - minP) / range) * 100;

              return (
                <div key={h.id} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full bg-orange-500/30 hover:bg-orange-500/50 rounded-t transition-all relative"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-orange-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatPrix(h.prix)}
                    </span>
                  </div>
                  <span className="text-[8px] text-dark-500 mt-1">
                    {new Date(h.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Liste des changements */}
          <div className="space-y-1">
            {historiquePrix.map((h) => (
              <div key={h.id} className="flex items-center gap-2 text-xs">
                <span className="text-dark-500">{new Date(h.createdAt).toLocaleDateString("fr-FR")}</span>
                <span className="text-orange-400 font-medium">{formatPrix(h.prix)}</span>
                {h.prixPrecedent && (
                  <span className="text-red-400">
                    (-{formatPrix(h.prixPrecedent - h.prix)})
                  </span>
                )}
                {h.commentaire && <span className="text-dark-500">{h.commentaire}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
