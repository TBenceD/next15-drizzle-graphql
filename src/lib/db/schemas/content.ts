import { pgTable, text, timestamp, varchar, uuid } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { user } from './auth';

// Posts table
export const posts = pgTable('posts', {
  id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  authorId: varchar('authorId', { length: 255 })
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
});

// Relations
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id]
  })
}));

// Type definitions
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
