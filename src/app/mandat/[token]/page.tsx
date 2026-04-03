"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SignaturePad from "@/components/SignaturePad";

export default function MandatSignPage() {
  const params = useParams();
  const [client, setClient] = useState<any>(null);
  const [mandatText, setMandatText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [signDate, setSignDate] = useState("");
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Charger les infos du client
      const res = await fetch(`/api/mandat/${params.token}`);
      if (!res.ok) {
        setError("Ce lien de signature est invalide ou a expiré.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setClient(data);

      if (data.mandatSigne) {
        setSigned(true);
        setSignDate(data.mandatDate);
      }

      // Charger le texte du mandat
      const tRes = await fetch(`/api/mandat/${params.token}/texte`);
      if (tRes.ok) {
        const tData = await tRes.json();
        setMandatText(tData.texte);
      }

      setLoading(false);
    };
    load();
  }, [params.token]);

  const handleSignature = async (signatureDataUrl: string) => {
    setSigning(true);
    const res = await fetch(`/api/mandat/${params.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signature: signatureDataUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      setSigned(true);
      setSignDate(data.mandatDate);
    } else {
      const err = await res.json();
      setError(err.error || "Erreur lors de la signature");
    }
    setSigning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement du mandat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-500 text-lg font-semibold mb-2">Erreur</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (signed) {
    const d = new Date(signDate);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mandat signé</h1>
          <p className="text-gray-600 mb-4">
            Merci {client?.prenom}, votre mandat de recherche a été signé avec succès.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
            <p>Date de signature : <strong className="text-gray-700">{d.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong></p>
            <p>Heure : <strong className="text-gray-700">{d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong></p>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Un exemplaire PDF de votre mandat est conservé dans votre dossier. Vous pouvez fermer cette page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">L&apos;Agence en Ligne</h1>
          <p className="text-gray-500 mt-1">Mandat de recherche immobilière</p>
        </div>

        {/* Contrat */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {mandatText}
          </div>
        </div>

        {/* Zone de signature */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Signature du Mandant</h2>
          <p className="text-sm text-gray-500 mb-1">
            <strong>{client?.prenom} {client?.nom}</strong> — {client?.email}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            En signant ci-dessous, vous acceptez les termes du mandat de recherche ci-dessus.
            Date et heure de signature enregistrées automatiquement.
          </p>

          {signing ? (
            <div className="text-center py-8">
              <p className="text-indigo-600 font-semibold">Enregistrement de votre signature...</p>
            </div>
          ) : (
            <SignaturePad onSignature={handleSignature} />
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Document électronique ayant valeur contractuelle conformément aux articles 1366 et 1367 du Code civil.
        </p>
      </div>
    </div>
  );
}
