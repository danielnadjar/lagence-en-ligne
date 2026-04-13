"use client";

import { useState, useEffect } from "react";

interface Negociateur {
  id: string;
  prenom: string;
  nom: string;
  role: string;
  _count?: { clientsAssignes: number };
}

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (negociateurId: string) => Promise<void>;
  clientName: string;
}

export default function AssignModal({
  isOpen,
  onClose,
  onAssign,
  clientName,
}: AssignModalProps) {
  const [negociateurs, setNegociateurs] = useState<Negociateur[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/users?role=NEGOCIATEUR")
        .then((r) => r.json())
        .then((data) => {
          // Inclure aussi les SOUS_ADMIN (managers) et ADMIN
          setNegociateurs(Array.isArray(data) ? data : []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAssign = async (negociateurId: string) => {
    setAssigning(true);
    try {
      await onAssign(negociateurId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-white mb-1">Affecter le dossier</h3>
        <p className="text-sm text-dark-400 mb-4">
          Choisissez qui prendra en charge <span className="text-white">{clientName}</span>
        </p>

        {loading ? (
          <div className="text-center py-8 text-dark-500">Chargement...</div>
        ) : negociateurs.length === 0 ? (
          <div className="text-center py-8 text-dark-500">
            Aucun négociateur disponible
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {negociateurs.map((neg) => (
              <button
                key={neg.id}
                onClick={() => handleAssign(neg.id)}
                disabled={assigning}
                className="w-full flex items-center justify-between px-4 py-3 bg-dark-900 hover:bg-dark-700 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {neg.prenom[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors">
                      {neg.prenom} {neg.nom}
                    </div>
                    <div className="text-xs text-dark-500">{neg.role}</div>
                  </div>
                </div>
                {neg._count && (
                  <span className="text-xs text-dark-500">
                    {neg._count.clientsAssignes} client{neg._count.clientsAssignes > 1 ? "s" : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t border-dark-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-dark-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
