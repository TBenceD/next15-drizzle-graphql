import { pgTable, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userRoles } from './rbac';
import { posts } from './content';

// Enhanced Users table for Better Auth
export const user = pgTable('user', {
  // Better Auth expects 'user' (singular)
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  name: varchar('name', { length: 255 }).notNull(),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Sessions table (required by Better Auth)
export const session = pgTable('session', {
  id: varchar('id', { length: 255 }).primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  ipAddress: varchar('ipAddress', { length: 255 }),
  userAgent: varchar('userAgent', { length: 255 }),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id)
});

// Accounts table (for OAuth providers)
export const account = pgTable('account', {
  id: varchar('id', { length: 255 }).primaryKey(),
  accountId: varchar('accountId', { length: 255 }).notNull(),
  providerId: varchar('providerId', { length: 255 }).notNull(),
  userId: varchar('userId', { length: 255 })
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: varchar('scope', { length: 255 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Verification table (for email verification, password reset, etc.)
export const verification = pgTable('verification', {
  id: varchar('id', { length: 255 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Relations (Note: Relations to other schemas will be defined in the main index file)
export const userRelations = relations(user, ({ many }) => ({
  session: many(session),
  account: many(account)
  // posts and userRoles relations will be added in the main schema index
}));

export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  })
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}));

export const userExtendedRelations = relations(user, ({ many }) => ({
  // From auth schema
  sessions: many(session),
  accounts: many(account),
  // From rbac schema
  userRoles: many(userRoles),
  // From content schema
  posts: many(posts)
}));

// Type definitions
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
