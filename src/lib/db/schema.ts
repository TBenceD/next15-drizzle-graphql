import {
  user,
  session,
  account,
  verification,
  userRelations,
  sessionsRelations,
  accountsRelations,
  userExtendedRelations,
  type User,
  type NewUser,
  type Session,
  type Account,
  type Verification
} from './schemas/auth';

import {
  roles,
  permissions,
  userRoles,
  rolePermissions,
  rolesRelations,
  permissionsRelations,
  userRolesRelations,
  rolePermissionsRelations,
  type Role,
  type NewRole,
  type Permission,
  type NewPermission,
  type UserRole,
  type NewUserRole,
  type RolePermission,
  type NewRolePermission
} from './schemas/rbac';

// Export all tables
export { user, session, account, verification, roles, permissions, userRoles, rolePermissions };

// Export all relations
export {
  userRelations,
  sessionsRelations,
  accountsRelations,
  rolesRelations,
  permissionsRelations,
  userRolesRelations,
  rolePermissionsRelations,
  userExtendedRelations
};

// Export all types
export type {
  User,
  NewUser,
  Session,
  Account,
  Verification,
  Role,
  NewRole,
  Permission,
  NewPermission,
  UserRole,
  NewUserRole,
  RolePermission,
  NewRolePermission
};
