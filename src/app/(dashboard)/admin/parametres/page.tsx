"use client";

import { useEffect, useState } from "react";

export default function ParametresPage() {
  const [mandatTexte, setMandatTexte] = useState("");
  const [original, setOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/parametres")
      .then((r) => r.json())
      .then((data) => {
        setMandatTexte(data.mandatTexte || "");
        setOriginal(data.mandatTexte || "");
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mandatTexte }),
    });

    if (res.ok) {
      setOriginal(mandatTexte);
      setMessage("Texte du mandat sauvegardé avec succès !");
    } else {
      setMessage("Erreur lors de la sauvegarde.");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  };

  const handleReset = () => {
    setMandatTexte(original);
  };

  const hasChanged = mandatTexte !== original;

  // Compter les variables {{...}} dans le texte
  const variables = mandatTexte.match(/\{\{[A-Z_]+\}\}/g) || [];
  const uniqueVars = Array.from(new Set(variables));

  if (loading) {
    return (
      <div className="p-8 text-dark-400">Chargement des paramètres...</div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-2">Paramètres</h1>
      <p className="text-dark-400 mb-8">
        Configuration générale du CRM
      </p>

      {/* Section : Texte du mandat */}
      <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Texte du mandat de recherche
            </h2>
            <p className="text-sm text-dark-400 mt-1">
              Ce texte est affiché au client lors de la signature du mandat.
              Utilisez les variables entre {"{{"}...{"}}"} pour les données dynamiques.
            </p>
          </div>
        </div>

        {/* Variables disponibles */}
        <div className="mb-4 p-3 bg-dark-900 rounded-lg border border-dark-600">
          <p className="text-xs font-semibold text-dark-300 mb-2">
            Variables disponibles (remplacées automatiquement) :
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { var: "MANDAT_NUMERO", desc: "Numéro du mandat" },
              { var: "CLIENT_PRENOM", desc: "Prénom du client" },
              { var: "CLIENT_NOM", desc: "Nom du client" },
              { var: "CLIENT_EMAIL", desc: "Email du client" },
              { var: "CLIENT_TELEPHONE", desc: "Téléphone" },
              { var: "DATE_SIGNATURE", desc: "Date de signature" },
            ].map((v) => (
              <span
                key={v.var}
                className="inline-flex items-center gap-1 px-2 py-1 bg-dark-700 rounded text-xs"
              >
                <code className="text-primary-400">{`{{${v.var}}}`}</code>
                <span className="text-dark-400">— {v.desc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Éditeur texte */}
        <textarea
          value={mandatTexte}
          onChange={(e) => setMandatTexte(e.target.value)}
          rows={28}
          className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-sm text-dark-200 font-mono leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
          placeholder="Entrez le texte du mandat de recherche..."
        />

        {/* Variables détectées */}
        <div className="mt-3 flex items-center gap-4 text-xs text-dark-400">
          <span>
            {uniqueVars.length} variable{uniqueVars.length > 1 ? "s" : ""} détectée{uniqueVars.length > 1 ? "s" : ""} : {uniqueVars.map(v => (
              <code key={v} className="text-primary-400 mx-0.5">{v}</code>
            ))}
          </span>
        </div>

        {/* Boutons */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!hasChanged || saving}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          {hasChanged && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-dark-700 hover:bg-dark-600 text-dark-300 rounded-lg text-sm transition-colors"
            >
              Annuler les modifications
            </button>
          )}
          {message && (
            <span
              className={`text-sm font-medium ${
                message.includes("succès") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
