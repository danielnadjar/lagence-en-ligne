"use client";

import { useState } from "react";
import Link from "next/link";

const TYPE_BIEN_OPTIONS = [
  { value: "APPARTEMENT", label: "Appartement" },
  { value: "MAISON", label: "Maison" },
  { value: "IMMEUBLE", label: "Immeuble" },
  { value: "FONDS_COMMERCE", label: "Fonds de commerce" },
  { value: "LOCAL_COMMERCIAL", label: "Local commercial" },
  { value: "AUTRE", label: "Autre" },
];

export default function VendrePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    typeBienVente: "",
    prixVente: "",
    villeVente: "",
    adresseBien: "",
    surfaceBien: "",
    descriptionBien: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/public/vendeur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h1>
          <p className="text-dark-400 mb-6">
            Nous avons bien reçu votre demande. Un négociateur vous contactera rapidement pour discuter de la commercialisation de votre bien.
          </p>
          <Link href="/" className="text-primary-400 hover:underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="border-b border-dark-800 bg-dark-900">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            CRM Négociateur
          </Link>
          <Link href="/login" className="text-sm text-dark-400 hover:text-white transition-colors">
            Se connecter
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Vendre votre bien</h1>
        <p className="text-dark-400 mb-8">
          Remplissez ce formulaire pour nous confier la commercialisation de votre bien immobilier. Un négociateur prendra contact avec vous rapidement.
        </p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s
                    ? "bg-primary-600 text-white"
                    : "bg-dark-800 text-dark-500"
                }`}
              >
                {s}
              </div>
              <span className={`text-sm ${step >= s ? "text-white" : "text-dark-500"}`}>
                {s === 1 ? "Vos coordonnées" : "Votre bien"}
              </span>
              {s < 2 && <div className="w-12 h-px bg-dark-700" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Coordonnées */}
          {step === 1 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Vos coordonnées</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => update("prenom", e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => update("nom", e.target.value)}
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
                  onChange={(e) => update("email", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => update("telephone", e.target.value)}
                  className="input-field"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (form.prenom && form.nom && form.email) setStep(2);
                  }}
                  className="btn-primary"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Étape 2: Le bien */}
          {step === 2 && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white">Votre bien</h2>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Type de bien</label>
                <select
                  value={form.typeBienVente}
                  onChange={(e) => update("typeBienVente", e.target.value)}
                  className="select-field"
                >
                  <option value="">Sélectionner...</option>
                  {TYPE_BIEN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Prix souhaité (€)</label>
                  <input
                    type="number"
                    value={form.prixVente}
                    onChange={(e) => update("prixVente", e.target.value)}
                    className="input-field"
                    placeholder="350000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Surface (m²)</label>
                  <input
                    type="number"
                    value={form.surfaceBien}
                    onChange={(e) => update("surfaceBien", e.target.value)}
                    className="input-field"
                    placeholder="85"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Ville *</label>
                  <input
                    type="text"
                    value={form.villeVente}
                    onChange={(e) => update("villeVente", e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={form.adresseBien}
                    onChange={(e) => update("adresseBien", e.target.value)}
                    className="input-field"
                    placeholder="12 rue de la Paix"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1">Description</label>
                <textarea
                  value={form.descriptionBien}
                  onChange={(e) => update("descriptionBien", e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Décrivez votre bien : nombre de pièces, étage, parking, état..."
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  ← Retour
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
