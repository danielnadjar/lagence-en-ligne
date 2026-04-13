// Types et interfaces du CRM Négociateur

export type UserRole = "ADMIN" | "SOUS_ADMIN" | "NEGOCIATEUR";

export type LeadSource = "QCM" | "SITE" | "CRM" | "EXTERIEUR" | "LOVABLE" | "MANUEL" | "CHATBOT" | "FORMULAIRE" | "AUTRE";

export type TypeClient = "ACQUEREUR" | "VENDEUR";

// ============================================
// STATUTS PIPELINE KANBAN
// ============================================

// Statuts communs + spécifiques vendeur + spécifiques acquéreur
export type ClientStatut =
  // Communs
  | "PROSPECT"           // Nouveau lead, pas encore affecté
  | "AFFECTE"            // Assigné à un négociateur
  // Vendeur
  | "COMMERCIALISATION"  // Création des annonces
  | "EN_ATTENTE_VISITES" // Annonces publiées, attente de visiteurs
  | "VISITES_EN_COURS"   // Des visites sont planifiées/en cours
  // Acquéreur (service négociation)
  | "ATTENTE_ANNONCE"    // L'acquéreur cherche un bien
  // Communs fin de pipeline
  | "NEGOCIATION"        // Offre/contre-offre en cours
  | "OFFRE_EN_COURS"     // Offre soumise, en attente de réponse
  | "ADMIN_JURIDIQUE"    // Offre acceptée, processus administratif/juridique
  | "VENDU"              // Clôturé - vendu/acheté avec succès
  | "SANS_SUITE"         // Clôturé - pas de suite
  | "INACTIF";           // Mis en pause

// Colonnes Kanban par type de client
export const PIPELINE_VENDEUR: ClientStatut[] = [
  "PROSPECT",
  "AFFECTE",
  "COMMERCIALISATION",
  "EN_ATTENTE_VISITES",
  "VISITES_EN_COURS",
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
  "NEGOCIATION",
  "OFFRE_EN_COURS",
  "ADMIN_JURIDIQUE",
  "VENDU",
  "SANS_SUITE",
];

// Pipeline Manager (vue globale tous types confondus)
export const PIPELINE_MANAGER: ClientStatut[] = [
  "PROSPECT",
  "AFFECTE",
  "COMMERCIALISATION",
  "EN_ATTENTE_VISITES",
  "VISITES_EN_COURS",
  "ATTENTE_ANNONCE",
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

// ============================================
// LABELS FRANÇAIS
// ============================================

export const STATUT_CLIENT_LABELS: Record<ClientStatut, string> = {
  PROSPECT: "Prospect",
  AFFECTE: "Affecté",
  COMMERCIALISATION: "Commercialisation",
  EN_ATTENTE_VISITES: "Attente visites",
  VISITES_EN_COURS: "Visites en cours",
  ATTENTE_ANNONCE: "Attente annonce",
  NEGOCIATION: "Négociation",
  OFFRE_EN_COURS: "Offre en cours",
  ADMIN_JURIDIQUE: "Admin / Juridique",
  VENDU: "Vendu",
  SANS_SUITE: "Sans suite",
  INACTIF: "Inactif",
};

export const STATUT_CLIENT_COLORS: Record<ClientStatut, string> = {
  PROSPECT: "bg-gray-500",
  AFFECTE: "bg-blue-500",
  COMMERCIALISATION: "bg-indigo-500",
  EN_ATTENTE_VISITES: "bg-purple-500",
  VISITES_EN_COURS: "bg-violet-500",
  ATTENTE_ANNONCE: "bg-amber-500",
  NEGOCIATION: "bg-orange-500",
  OFFRE_EN_COURS: "bg-yellow-500",
  ADMIN_JURIDIQUE: "bg-cyan-500",
  VENDU: "bg-green-500",
  SANS_SUITE: "bg-red-500",
  INACTIF: "bg-gray-400",
};

export const STATUT_BIEN_LABELS: Record<BienStatut, string> = {
  NOUVEAU: "Nouveau",
  A_ANALYSER: "A analyser",
  EN_ATTENTE_INFOS: "En attente d'infos",
  NEGO_DEMARREE: "Négociation démarrée",
  EN_COURS_NEGO: "En cours de négociation",
  EN_ATTENTE_VENDEUR: "En attente vendeur",
  EN_ATTENTE_ACQUEREUR: "En attente acquéreur",
  ACCORD_TROUVE: "Accord trouvé",
  REFUS: "Refus",
  SANS_SUITE: "Sans suite",
  CLOTURE: "Clôturé",
  ABANDONNE: "Abandonné",
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
  EXTERIEUR: "Extérieur",
  LOVABLE: "Site Lovable",
  MANUEL: "Manuel",
  CHATBOT: "Chatbot",
  FORMULAIRE: "Formulaire site",
  AUTRE: "Autre",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  SOUS_ADMIN: "Manager",
  NEGOCIATEUR: "Négociateur",
};

export const TYPE_CLIENT_LABELS: Record<TypeClient, string> = {
  ACQUEREUR: "Acquéreur",
  VENDEUR: "Vendeur",
};

export const VISITE_STATUT_LABELS: Record<VisiteStatut, string> = {
  PLANIFIEE: "Planifiée",
  REALISEE: "Réalisée",
  ANNULEE: "Annulée",
  REPORT: "Reportée",
};

// ============================================
// CALCULS MÉTIER
// ============================================

export function calculerEconomie(prixAffiche: number, prixActuel: number): number {
  return Math.max(0, prixAffiche - prixActuel);
}

export function calculerCommission(economie: number): number {
  // 10% des économies sur des tranches complètes de 5000€
  const tranches = Math.floor(economie / 5000);
  return tranches * 500; // 10% de 5000 = 500 par tranche
}

export function formatPrix(montant: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}
