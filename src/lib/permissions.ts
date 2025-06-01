import { eq, and } from 'drizzle-orm';
import { db } from './db/connection';
import { users, roles, permissions, userRoles, rolePermissions, type User } from './db/schema';

export interface UserWithPermissions extends User {
  permissions: string[];
}

/**
 * Get all permissions for a user based on their roles
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const userPermissions = await db
      .select({
        permission: permissions.name
      })
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(eq(userRoles.userId, userId));

    return userPermissions.map((p) => p.permission);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const result = await db
      .select({ count: permissions.id })
      .from(permissions)
      .innerJoin(rolePermissions, eq(permissions.id, rolePermissions.permissionId))
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .innerJoin(userRoles, eq(roles.id, userRoles.roleId))
      .where(and(eq(userRoles.userId, userId), eq(permissions.name, permission)))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Get user with their permissions
 */
export async function getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user[0]) return null;

    const userPermissions = await getUserPermissions(userId);

    return {
      ...user[0],
      permissions: userPermissions
    };
  } catch (error) {
    console.error('Error fetching user with permissions:', error);
    return null;
  }
}

/**
 * Seed initial permissions and roles
 */
export async function seedPermissions() {
  try {
    // Create basic permissions
    const basicPermissions = [
      { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
      { name: 'users.write', description: 'Create and update users', resource: 'users', action: 'write' },
      { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
      { name: 'posts.read', description: 'Read posts', resource: 'posts', action: 'read' },
      { name: 'posts.write', description: 'Create and update posts', resource: 'posts', action: 'write' },
      { name: 'posts.delete', description: 'Delete posts', resource: 'posts', action: 'delete' }
    ];

    await db.insert(permissions).values(basicPermissions).onConflictDoNothing().returning();

    // Create basic roles
    const basicRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user with limited access' },
      { name: 'editor', description: 'Can manage posts' }
    ];

    await db.insert(roles).values(basicRoles).onConflictDoNothing().returning();

    // Get all permissions and roles for mapping
    const allPermissions = await db.select().from(permissions);
    const allRoles = await db.select().from(roles);

    const adminRole = allRoles.find((r) => r.name === 'admin');
    const userRole = allRoles.find((r) => r.name === 'user');
    const editorRole = allRoles.find((r) => r.name === 'editor');

    if (adminRole) {
      // Admin gets all permissions
      const adminRolePermissions = allPermissions.map((p) => ({
        roleId: adminRole.id,
        permissionId: p.id
      }));
      await db.insert(rolePermissions).values(adminRolePermissions).onConflictDoNothing();
    }

    if (userRole) {
      // User gets read permissions only
      const readPermissions = allPermissions.filter((p) => p.action === 'read');
      const userRolePermissions = readPermissions.map((p) => ({
        roleId: userRole.id,
        permissionId: p.id
      }));
      await db.insert(rolePermissions).values(userRolePermissions).onConflictDoNothing();
    }

    if (editorRole) {
      // Editor gets all post permissions and user read permission
      const editorPermissions = allPermissions.filter((p) => p.resource === 'posts' || (p.resource === 'users' && p.action === 'read'));
      const editorRolePermissions = editorPermissions.map((p) => ({
        roleId: editorRole.id,
        permissionId: p.id
      }));
      await db.insert(rolePermissions).values(editorRolePermissions).onConflictDoNothing();
    }

    console.log('Permissions and roles seeded successfully');
  } catch (error) {
    console.error('Error seeding permissions:', error);
  }
}

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, roleName: string): Promise<boolean> {
  try {
    const role = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (!role[0]) return false;

    await db.insert(userRoles).values({ userId, roleId: role[0].id }).onConflictDoNothing();

    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

// GraphQL permission guard function
export async function requirePermissionGuard(permission: string, context: { user?: { id: string } }): Promise<void> {
  if (!context?.user?.id) {
    throw new Error('Authentication required');
  }

  const hasUserPermission = await hasPermission(context.user.id, permission);
  if (!hasUserPermission) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}
