import { UserRole } from "./types";

// Permissions par rôle
// SOUS_ADMIN = Manager (vue globale, affectation des leads, supervision)
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
  },
  NEGOCIATEUR: {
    canViewAllClients: false, // Voit seulement ses clients assignés
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
    canViewKanbanGlobal: false, // Voit uniquement son Kanban
  },
} as const;

export function hasPermission(
  role: UserRole,
  permission: keyof (typeof permissions)["ADMIN"]
): boolean {
  return permissions[role]?.[permission] ?? false;
}

export function isAdmin(role: string): boolean {
  return role === "ADMIN" || role === "SOUS_ADMIN";
}

export function isManager(role: string): boolean {
  return role === "SOUS_ADMIN";
}

export function isNegociateur(role: string): boolean {
  return role === "NEGOCIATEUR";
}

export function canAccessCRM(role: string): boolean {
  return role === "ADMIN" || role === "SOUS_ADMIN" || role === "NEGOCIATEUR";
}
