"use client";

import { useEffect, useState } from "react";
import { ROLE_LABELS } from "@/lib/types";

interface UserRow {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone: string | null;
  role: string;
  actif: boolean;
  createdAt: string;
  _count: { clientsAssignes: number };
}

export default function EquipePage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    role: "NEGOCIATEUR",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setForm({ prenom: "", nom: "", email: "", telephone: "", password: "", role: "NEGOCIATEUR" });
    setShowCreate(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Mise à jour
      const payload: any = { ...form };
      if (!payload.password) delete payload.password; // Ne pas envoyer un mot de passe vide
      await fetch(`/api/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Création
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    resetForm();
    fetchUsers();
  };

  const startEdit = (user: UserRow) => {
    setForm({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || "",
      password: "",
      role: user.role,
    });
    setEditingId(user.id);
    setShowCreate(true);
  };

  const toggleActif = async (user: UserRow) => {
    await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !user.actif }),
    });
    fetchUsers();
  };

  const deleteUser = async (user: UserRow) => {
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ? Ses clients seront désassignés.`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    fetchUsers();
  };

  const roleColor = (role: string) => {
    if (role === "ADMIN") return "bg-red-500/20 text-red-400";
    if (role === "SOUS_ADMIN") return "bg-purple-500/20 text-purple-400";
    return "bg-indigo-500/20 text-indigo-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Équipe</h1>
        <button
          onClick={() => { resetForm(); setShowCreate(true); }}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
        >
          + Nouveau négociateur
        </button>
      </div>

      {/* Formulaire création/édition */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? "Modifier l'utilisateur" : "Nouveau négociateur"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Prénom *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Nom *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</label>
                <input
                  type="text"
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">
                  {editingId ? "Nouveau mot de passe (laisser vide si inchangé)" : "Mot de passe *"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider">Rôle</label>
                <select
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white mt-1 outline-none focus:border-indigo-500"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="NEGOCIATEUR">Négociateur</option>
                  <option value="SOUS_ADMIN">Sous-admin</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition">
                {editingId ? "Enregistrer" : "Créer"}
              </button>
              <button type="button" onClick={resetForm} className="text-gray-400 border border-gray-700 px-4 py-2 rounded-lg text-sm hover:text-white transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p className="text-gray-500 text-sm">Chargement...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">Nom</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Rôle</th>
                <th className="text-center px-4 py-3">Clients</th>
                <th className="text-center px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{u.prenom} {u.nom}</span>
                    {u.telephone && <p className="text-[11px] text-gray-500">{u.telephone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>
                      {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-white font-semibold">{u._count.clientsAssignes}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActif(u)}
                      className={`text-[11px] px-2 py-0.5 rounded-full cursor-pointer ${
                        u.actif ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {u.actif ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => startEdit(u)}
                        className="text-[11px] text-gray-400 hover:text-indigo-400 border border-gray-700 px-2 py-1 rounded transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteUser(u)}
                        className="text-[11px] text-gray-400 hover:text-red-400 border border-gray-700 px-2 py-1 rounded transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
