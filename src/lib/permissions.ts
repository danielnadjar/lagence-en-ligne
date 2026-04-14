import { UserRole } from "./types";

// Permissions par rôle
export const permissions = {
  ADMIN: {
    canViewAllClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: true,
    canCreateSubAdmin: true,
    canManageBiens: true,
    canManageVendeurs: true,
    canManageNegociations: true,
    canChangeStatuts: true,
    canViewInternalNotes: true,
    canCloturer: true,
    canViewCommissions: true,
    canConfigureSystem: true,
    canAssignClients: true,
    canManageVisites: true,
    canManageAppels: true,
    canViewKanbanGlobal: true,
    canManageCMS: true,
    canManageEquipe: true,
  },
  SOUS_ADMIN: {
    canViewAllClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: true,
    canManageVendeurs: true,
    canManageNegociations: true,
    canChangeStatuts: true,
    canViewInternalNotes: true,
    canCloturer: true,
    canViewCommissions: true,
    canConfigureSystem: false,
    canAssignClients: true,
    canManageVisites: true,
    canManageAppels: true,
    canViewKanbanGlobal: true,
    canManageCMS: false,
    canManageEquipe: false,
  },
  DIRECTEUR: {
    canViewAllClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: true,
    canManageVendeurs: true,
    canManageNegociations: true,
    canChangeStatuts: true,
    canViewInternalNotes: true,
    canCloturer: true,
    canViewCommissions: true,
    canConfigureSystem: false,
    canAssignClients: true,
    canManageVisites: true,
    canManageAppels: true,
    canViewKanbanGlobal: true,
    canManageCMS: false,
    canManageEquipe: true,
  },
  MANAGER: {
    canViewAllClients: true,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: true,
    canManageVendeurs: true,
    canManageNegociations: true,
    canChangeStatuts: true,
    canViewInternalNotes: true,
    canCloturer: false,
    canViewCommissions: true,
    canConfigureSystem: false,
    canAssignClients: true,
    canManageVisites: true,
    canManageAppels: true,
    canViewKanbanGlobal: true,
    canManageCMS: false,
    canManageEquipe: false,
  },
  NEGOCIATEUR: {
    canViewAllClients: false,
    canCreateClient: true,
    canEditClient: true,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: true,
    canManageVendeurs: true,
    canManageNegociations: true,
    canChangeStatuts: true,
    canViewInternalNotes: true,
    canCloturer: false,
    canViewCommissions: true,
    canConfigureSystem: false,
    canAssignClients: false,
    canManageVisites: true,
    canManageAppels: true,
    canViewKanbanGlobal: false,
    canManageCMS: false,
    canManageEquipe: false,
  },
  CLIENT_ACQUEREUR: {
    canViewAllClients: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: false,
    canManageVendeurs: false,
    canManageNegociations: false,
    canChangeStatuts: false,
    canViewInternalNotes: false,
    canCloturer: false,
    canViewCommissions: false,
    canConfigureSystem: false,
    canAssignClients: false,
    canManageVisites: false,
    canManageAppels: false,
    canViewKanbanGlobal: false,
    canManageCMS: false,
    canManageEquipe: false,
  },
  CLIENT_VENDEUR: {
    canViewAllClients: false,
    canCreateClient: false,
    canEditClient: false,
    canDeleteClient: false,
    canCreateSubAdmin: false,
    canManageBiens: false,
    canManageVendeurs: false,
    canManageNegociations: false,
    canChangeStatuts: false,
    canViewInternalNotes: false,
    canCloturer: false,
    canViewCommissions: false,
    canConfigureSystem: false,
    canAssignClients: false,
    canManageVisites: false,
    canManageAppels: false,
    canViewKanbanGlobal: false,
    canManageCMS: false,
    canManageEquipe: false,
  },
} as const;

type PermissionKey = keyof (typeof permissions)["ADMIN"];

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return permissions[role]?.[permission] ?? false;
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "SOUS_ADMIN";
}

export function isManager(role: string): boolean {
  return role === "SOUS_ADMIN" || role === "MANAGER" || role === "DIRECTEUR";
}

export function isNegociateur(role: string): boolean {
  return role === "NEGOCIATEUR";
}

export function isClientRole(role: string): boolean {
  return role === "CLIENT_ACQUEREUR" || role === "CLIENT_VENDEUR";
}

export function canAccessCRM(role: string): boolean {
  return ["ADMIN", "SOUS_ADMIN", "DIRECTEUR", "MANAGER", "NEGOCIATEUR"].includes(role);
}

export function canAccessClientPortal(role: string): boolean {
  return role === "CLIENT_ACQUEREUR" || role === "CLIENT_VENDEUR";
}
