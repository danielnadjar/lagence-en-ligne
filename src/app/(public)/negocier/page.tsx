"use client";

import { useState } from "react";
import Link from "next/link";

export default function NegocierPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    budgetMax: "",
    notes: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/public/acquereur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.exists) {
          setError("Vous avez déjà un compte. Connectez-vous pour accéder à votre espace.");
        } else {
          setSuccess(true);
        }
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
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2">Compte créé !</h1>
          <p className="text-dark-400 mb-4">
            Votre demande a été enregistrée. Un négociateur vous contactera pour discuter de votre projet d&apos;achat.
          </p>
          <p className="text-dark-500 text-sm mb-6">
            Une fois votre espace activé, vous pourrez soumettre des liens d&apos;annonces directement depuis votre tableau de bord.
          </p>
          <Link href="/login" className="btn-primary inline-block">
            Se connecter
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

      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Service Négociation</h1>
        <p className="text-dark-400 mb-8">
          Vous souhaitez acheter un bien immobilier au meilleur prix ? Créez votre compte et un négociateur professionnel vous accompagnera dans toutes vos démarches.
        </p>

        {/* Avantages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: "🎯", text: "Négociation experte" },
            { icon: "💰", text: "Économies garanties" },
            { icon: "📋", text: "Suivi personnalisé" },
          ].map((item) => (
            <div key={item.text} className="bg-dark-900 border border-dark-800 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-dark-400">{item.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-white">Créer votre compte</h2>

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

          <div>
            <label className="block text-sm text-dark-300 mb-1">Budget maximum</label>
            <input
              type="number"
              value={form.budgetMax}
              onChange={(e) => update("budgetMax", e.target.value)}
              className="input-field"
              placeholder="300000"
            />
          </div>

          <div>
            <label className="block text-sm text-dark-300 mb-1">
              Décrivez votre projet (optionnel)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="input-field"
              rows={3}
              placeholder="Type de bien recherché, quartier, nombre de pièces..."
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
              {error.includes("Connectez-vous") && (
                <Link href="/login" className="block mt-2 text-primary-400 hover:underline">
                  → Se connecter
                </Link>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-xs text-dark-500 text-center">
            Vous avez déjà un compte ?{" "}
            <Link href="/login" className="text-primary-400 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
