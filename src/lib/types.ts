// Types et interfaces du CRM Négociateur

export type UserRole = "ADMIN" | "SOUS_ADMIN" | "NEGOCIATEUR";

export type LeadSource = "QCM" | "SITE" | "CRM" | "EXTERIEUR" | "LOVABLE" | "MANUEL" | "AUTRE";

export type ClientStatut = "NOUVEAU" | "EN_COURS" | "CLOS" | "INACTIF";

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

// Labels français pour l'interface
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
  AUTRE: "Autre",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  SOUS_ADMIN: "Sous-admin",
  NEGOCIATEUR: "Négociateur",
};

export const STATUT_CLIENT_LABELS: Record<ClientStatut, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours",
  CLOS: "Clôturé",
  INACTIF: "Inactif",
};

// Calculs métier
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
