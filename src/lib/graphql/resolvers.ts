import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, posts, type User, type Post } from '../db/schema';

export const resolvers = {
  Query: {
    users: async (): Promise<User[]> => {
      return await db.select().from(users);
    },

    user: async (_: unknown, { id }: { id: string }): Promise<User | undefined> => {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    },

    posts: async (): Promise<Post[]> => {
      return await db.select().from(posts);
    },

    post: async (_: unknown, { id }: { id: string }): Promise<Post | undefined> => {
      const result = await db.select().from(posts).where(eq(posts.id, id));
      return result[0];
    }
  },

  Mutation: {
    createUser: async (_: unknown, { email, name }: { email: string; name: string }): Promise<User> => {
      const result = await db.insert(users).values({ email, name }).returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
      return result[0];
    },

    updateUser: async (_: unknown, { id, email, name }: { id: string; email?: string; name?: string }): Promise<User> => {
      const updateData: { email?: string; name?: string } = {};
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;

      const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
      return result[0];
    },

    deleteUser: async (_: unknown, { id }: { id: string }): Promise<boolean> => {
      await db.delete(users).where(eq(users.id, id));
      return true;
    },

    createPost: async (_: unknown, { title, content, authorId }: { title: string; content?: string; authorId: string }): Promise<Post> => {
      const result = await db.insert(posts).values({ title, content, authorId }).returning({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        authorId: posts.authorId,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt
      });
      return result[0];
    },

    updatePost: async (_: unknown, { id, title, content }: { id: string; title?: string; content?: string }): Promise<Post> => {
      const updateData: { title?: string; content?: string } = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;

      const result = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
      return result[0];
    },

    deletePost: async (_: unknown, { id }: { id: string }): Promise<boolean> => {
      await db.delete(posts).where(eq(posts.id, id));
      return true;
    }
  },

  User: {
    posts: async (user: User): Promise<Post[]> => {
      return await db.select().from(posts).where(eq(posts.authorId, user.id));
    }
  },

  Post: {
    author: async (post: Post): Promise<User | undefined> => {
      const result = await db.select().from(users).where(eq(users.id, post.authorId));
      return result[0];
    }
  }
};
