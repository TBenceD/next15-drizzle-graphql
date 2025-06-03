import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { user, roles, permissions, userRoles, rolePermissions, type User } from '../db/schema';
import { tryCatch } from '@/utils/try-catch';
import { BASIC_PERMISSIONS, BASIC_ROLES } from '@/config/common';

export interface UserWithPermissions extends User {
  permissions: string[];
}

/**
 * Get all permissions for a user based on their roles
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const { data: userPermissions, error: dbError } = await tryCatch(
    db
      .select({
        permission: permissions.name
      })
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId))
  );

  if (dbError) {
    console.error('Error fetching user permissions:', dbError);
    return [];
  }

  return userPermissions.map((p) => p.permission);
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const { data: hasPermission, error: dbError } = await tryCatch(
    db
      .select({ count: permissions.id })
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(and(eq(userRoles.userId, userId), eq(permissions.name, permission)))
      .limit(1)
  );

  if (dbError) {
    throw new Error('Error checking permission:', dbError);
  }

  return hasPermission.length > 0;
}

/**
 * Get user with their permissions
 */
export async function getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
  const { data: userData, error: dbError } = await tryCatch(db.select().from(user).where(eq(user.id, userId)).limit(1));

  if (dbError) {
    console.error('Error fetching user with permissions:', dbError);
    return null;
  }

  const { data: userPermissions, error: permissionError } = await tryCatch(getUserPermissions(userId));

  if (permissionError) {
    console.error('Error fetching user permissions:', permissionError);
    return null;
  }

  return {
    ...userData[0],
    permissions: userPermissions
  };
}

/**
 * Seed initial permissions and roles
 */
export async function seedPermissions() {
  const { error: basicPermissionsError } = await tryCatch(db.insert(permissions).values(BASIC_PERMISSIONS).onConflictDoNothing().returning());

  if (basicPermissionsError) {
    console.error('Error seeding basic permissions:', basicPermissionsError);
    return;
  }

  const { error: basicRolesError } = await tryCatch(db.insert(roles).values(BASIC_ROLES).onConflictDoNothing().returning());

  if (basicRolesError) {
    console.error('Error seeding basic roles:', basicRolesError);
    return;
  }

  const { data: allPermissions, error: allPermissionsError } = await tryCatch(db.select().from(permissions));

  if (allPermissionsError) {
    console.error('Error fetching all permissions:', allPermissionsError);
    return;
  }

  const { data: allRoles, error: allRolesError } = await tryCatch(db.select().from(roles));

  if (allRolesError) {
    console.error('Error fetching all roles:', allRolesError);
    return;
  }

  const adminRole = allRoles.find((r) => r.name === 'admin');
  const userRole = allRoles.find((r) => r.name === 'user');
  const editorRole = allRoles.find((r) => r.name === 'editor');

  if (adminRole) {
    // Admin gets all permissions
    const adminRolePermissions = allPermissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id
    }));

    const { error: adminRolePermissionsError } = await tryCatch(db.insert(rolePermissions).values(adminRolePermissions).onConflictDoNothing());

    if (adminRolePermissionsError) {
      console.error('Error seeding admin role permissions:', adminRolePermissionsError);
      return;
    }
  }

  if (userRole) {
    // User gets read permissions only
    const readPermissions = allPermissions.filter((p) => p.action === 'read');
    const userRolePermissions = readPermissions.map((p) => ({
      roleId: userRole.id,
      permissionId: p.id
    }));
    const { error: userRolePermissionsError } = await tryCatch(db.insert(rolePermissions).values(userRolePermissions).onConflictDoNothing());

    if (userRolePermissionsError) {
      console.error('Error seeding user role permissions:', userRolePermissionsError);
      return;
    }
  }

  if (editorRole) {
    // Editor gets all post permissions and user read permission
    const editorPermissions = allPermissions.filter((p) => p.resource === 'posts' || (p.resource === 'users' && p.action === 'read'));
    const editorRolePermissions = editorPermissions.map((p) => ({
      roleId: editorRole.id,
      permissionId: p.id
    }));
    const { error: editorRolePermissionsError } = await tryCatch(db.insert(rolePermissions).values(editorRolePermissions).onConflictDoNothing());

    if (editorRolePermissionsError) {
      console.error('Error seeding editor role permissions:', editorRolePermissionsError);
      return;
    }
  }

  console.log('Permissions and roles seeded successfully');
}

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, roleName: string): Promise<boolean> {
  const { data: role, error: roleError } = await tryCatch(db.select().from(roles).where(eq(roles.name, roleName)).limit(1));

  if (roleError) {
    console.error('Error fetching role:', roleError);
    return false;
  }

  if (!role[0]) return false;

  const { error: userRoleError } = await tryCatch(db.insert(userRoles).values({ userId, roleId: role[0].id }).onConflictDoNothing());

  if (userRoleError) {
    console.error('Error assigning role:', userRoleError);
    return false;
  }

  return true;
}

// GraphQL permission guard function
export async function requirePermissionGuard(permission: string, context: { user?: { id: string } }): Promise<void> {
  if (!context?.user?.id) {
    throw new Error('Authentication required');
  }

  const { data: hasUserPermission, error: hasUserPermissionError } = await tryCatch(hasPermission(context.user.id, permission));

  if (hasUserPermissionError) {
    throw hasUserPermissionError;
  }

  if (!hasUserPermission) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}
