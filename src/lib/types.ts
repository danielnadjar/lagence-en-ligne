// L'Agence en Ligne — Types et interfaces centralisés

// ============================================
// RÔLES UTILISATEURS (étendu)
// ============================================

export type UserRole =
  | "ADMIN"
  | "SOUS_ADMIN"
  | "DIRECTEUR"
  | "MANAGER"
  | "NEGOCIATEUR"
  | "CLIENT_ACQUEREUR"
  | "CLIENT_VENDEUR";

export type LeadSource =
  | "QCM"
  | "SITE"
  | "CRM"
  | "EXTERIEUR"
  | "LOVABLE"
  | "MANUEL"
  | "CHATBOT"
  | "FORMULAIRE"
  | "AUTRE";

export type TypeClient = "ACQUEREUR" | "VENDEUR";

// ============================================
// STATUTS PIPELINE KANBAN
// ============================================

export type ClientStatut =
  // Communs
  | "PROSPECT"
  | "AFFECTE"
  // Vendeur
  | "COMMERCIALISATION"
  | "EN_ATTENTE_VISITES"
  | "VISITES_EN_COURS"
  | "COMPTE_RENDU"
  // Acquéreur
  | "ATTENTE_ANNONCE"
  | "ANALYSE"
  // Communs fin de pipeline
  | "NEGOCIATION"
  | "OFFRE_EN_COURS"
  | "ADMIN_JURIDIQUE"
  | "VENDU"
  | "SANS_SUITE"
  | "INACTIF";

export const PIPELINE_VENDEUR: ClientStatut[] = [
  "PROSPECT",
  "AFFECTE",
  "COMMERCIALISATION",
  "EN_ATTENTE_VISITES",
  "VISITES_EN_COURS",
  "COMPTE_RENDU",
  "NEGOCIATION",
  "OFFRE_EN_COURS",
  "ADMIN_JURIDIQUE",
  "VENDU",
  "SANS_SUITE",
];

export const PIPELINE_ACQUEREUR: ClientStatut[] = [
  "PROSPECT",
  "AFFECTE",
  "ATTENTE_ANNONCE",
  "ANALYSE",
  "NEGOCIATION",
  "OFFRE_EN_COURS",
  "ADMIN_JURIDIQUE",
  "VENDU",
  "SANS_SUITE",
];

export const PIPELINE_MANAGER: ClientStatut[] = [
  "PROSPECT",
  "AFFECTE",
  "COMMERCIALISATION",
  "EN_ATTENTE_VISITES",
  "VISITES_EN_COURS",
  "COMPTE_RENDU",
  "ATTENTE_ANNONCE",
  "ANALYSE",
  "NEGOCIATION",
  "OFFRE_EN_COURS",
  "ADMIN_JURIDIQUE",
  "VENDU",
  "SANS_SUITE",
];

export type BienStatut =
  | "NOUVEAU"
  | "A_ANALYSER"
  | "EN_ATTENTE_INFOS"
  | "NEGO_DEMARREE"
  | "EN_COURS_NEGO"
  | "EN_ATTENTE_VENDEUR"
  | "EN_ATTENTE_ACQUEREUR"
  | "ACCORD_TROUVE"
  | "REFUS"
  | "SANS_SUITE"
  | "CLOTURE"
  | "ABANDONNE";

export type TypeBien =
  | "APPARTEMENT"
  | "MAISON"
  | "IMMEUBLE"
  | "FONDS_COMMERCE"
  | "LOCAL_COMMERCIAL"
  | "AUTRE";

export type NegoCamp = "ACQUEREUR" | "VENDEUR";
export type NegoType = "OFFRE" | "CONTRE_OFFRE" | "REPONSE" | "COMMENTAIRE";
export type NegoStatut = "ACCEPTE" | "REFLECHIR" | "REFUS" | "SANS_SUITE";
export type VisiteStatut = "PLANIFIEE" | "REALISEE" | "ANNULEE" | "REPORT";
export type AvisVisite = "OUI" | "NON" | "REFLEXION";
export type DocumentType = "MANDAT" | "OFFRE" | "COMPROMIS" | "PIECE_DOSSIER" | "AUTRE";

// ============================================
// LABELS FRANÇAIS
// ============================================

export const STATUT_CLIENT_LABELS: Record<ClientStatut, string> = {
  PROSPECT: "Prospect",
  AFFECTE: "Affect\u00e9",
  COMMERCIALISATION: "Commercialisation",
  EN_ATTENTE_VISITES: "Attente visites",
  VISITES_EN_COURS: "Visites en cours",
  COMPTE_RENDU: "Compte-rendu",
  ATTENTE_ANNONCE: "Attente annonce",
  ANALYSE: "Analyse",
  NEGOCIATION: "N\u00e9gociation",
  OFFRE_EN_COURS: "Offre en cours",
  ADMIN_JURIDIQUE: "Admin / Juridique",
  VENDU: "Vendu",
  SANS_SUITE: "Sans suite",
  INACTIF: "Inactif",
};

export const STATUT_CLIENT_COLORS: Record<ClientStatut, string> = {
  PROSPECT: "bg-zinc-500",
  AFFECTE: "bg-blue-500",
  COMMERCIALISATION: "bg-indigo-500",
  EN_ATTENTE_VISITES: "bg-violet-500",
  VISITES_EN_COURS: "bg-purple-500",
  COMPTE_RENDU: "bg-fuchsia-500",
  ATTENTE_ANNONCE: "bg-amber-500",
  ANALYSE: "bg-sky-500",
  NEGOCIATION: "bg-orange-500",
  OFFRE_EN_COURS: "bg-yellow-500",
  ADMIN_JURIDIQUE: "bg-cyan-500",
  VENDU: "bg-emerald-500",
  SANS_SUITE: "bg-red-500",
  INACTIF: "bg-zinc-400",
};

export const STATUT_BIEN_LABELS: Record<BienStatut, string> = {
  NOUVEAU: "Nouveau",
  A_ANALYSER: "A analyser",
  EN_ATTENTE_INFOS: "En attente d'infos",
  NEGO_DEMARREE: "N\u00e9gociation d\u00e9marr\u00e9e",
  EN_COURS_NEGO: "En cours de n\u00e9gociation",
  EN_ATTENTE_VENDEUR: "En attente vendeur",
  EN_ATTENTE_ACQUEREUR: "En attente acqu\u00e9reur",
  ACCORD_TROUVE: "Accord trouv\u00e9",
  REFUS: "Refus",
  SANS_SUITE: "Sans suite",
  CLOTURE: "Cl\u00f4tur\u00e9",
  ABANDONNE: "Abandonn\u00e9",
};

export const TYPE_BIEN_LABELS: Record<TypeBien, string> = {
  APPARTEMENT: "Appartement",
  MAISON: "Maison",
  IMMEUBLE: "Immeuble",
  FONDS_COMMERCE: "Fonds de commerce",
  LOCAL_COMMERCIAL: "Local commercial",
  AUTRE: "Autre",
};

export const SOURCE_LABELS: Record<LeadSource, string> = {
  QCM: "QCM",
  SITE: "Site du service",
  CRM: "CRM (manuel)",
  EXTERIEUR: "Ext\u00e9rieur",
  LOVABLE: "Site Lovable",
  MANUEL: "Manuel",
  CHATBOT: "Chatbot",
  FORMULAIRE: "Formulaire site",
  AUTRE: "Autre",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  SOUS_ADMIN: "Sous-administrateur",
  DIRECTEUR: "Directeur d'agence",
  MANAGER: "Manager",
  NEGOCIATEUR: "N\u00e9gociateur",
  CLIENT_ACQUEREUR: "Client acqu\u00e9reur",
  CLIENT_VENDEUR: "Client vendeur",
};

export const TYPE_CLIENT_LABELS: Record<TypeClient, string> = {
  ACQUEREUR: "Acqu\u00e9reur",
  VENDEUR: "Vendeur",
};

export const VISITE_STATUT_LABELS: Record<VisiteStatut, string> = {
  PLANIFIEE: "Planifi\u00e9e",
  REALISEE: "R\u00e9alis\u00e9e",
  ANNULEE: "Annul\u00e9e",
  REPORT: "Report\u00e9e",
};

// ============================================
// RÔLES — PERMISSIONS
// ============================================

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 100,
  SOUS_ADMIN: 90,
  DIRECTEUR: 80,
  MANAGER: 70,
  NEGOCIATEUR: 50,
  CLIENT_ACQUEREUR: 10,
  CLIENT_VENDEUR: 10,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isInternalRole(role: UserRole): boolean {
  return ["ADMIN", "SOUS_ADMIN", "DIRECTEUR", "MANAGER", "NEGOCIATEUR"].includes(role);
}

export function isClientRole(role: UserRole): boolean {
  return ["CLIENT_ACQUEREUR", "CLIENT_VENDEUR"].includes(role);
}

// ============================================
// CALCULS MÉTIER
// ============================================

export function calculerEconomie(prixAffiche: number, prixActuel: number): number {
  return Math.max(0, prixAffiche - prixActuel);
}

export function calculerCommission(economie: number): number {
  return Math.round(economie * 0.1); // 10% des économies
}

export const FORFAIT_ACQUEREUR = 500; // EUR

export function calculerTotalAcquereur(economie: number): number {
  return FORFAIT_ACQUEREUR + calculerCommission(economie);
}

export function formatPrix(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}
