import { pgTable, text, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { user } from './auth';

// Roles table
export const roles = pgTable('roles', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Permissions table
export const permissions = pgTable('permissions', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 50 }).notNull(), // e.g., 'users', 'posts'
  action: varchar('action', { length: 50 }).notNull(), // e.g., 'read', 'write', 'delete'
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// User roles (many-to-many relationship)
export const userRoles = pgTable('user_roles', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  roleId: uuid('roleId')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

// Role permissions (many-to-many relationship)
export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  roleId: uuid('roleId')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permissionId')
    .notNull()
    .references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull()
});

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions)
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id]
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id]
  })
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id]
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id]
  })
}));

// Type definitions
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
