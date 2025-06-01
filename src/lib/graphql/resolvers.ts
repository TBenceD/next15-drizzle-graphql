import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users, posts, type User, type Post } from '../db/schema';
import { auth } from '../auth';
import { requirePermissionGuard, getUserWithPermissions, getUserPermissions, type UserWithPermissions } from '../permissions';
import crypto from 'node:crypto';

interface GraphQLContext {
  user?: UserWithPermissions;
  session?: { id: string; expiresAt: Date; token: string; userId: string };
}

export const resolvers = {
  Query: {
    users: async (_: unknown, __: unknown, context: GraphQLContext): Promise<User[]> => {
      await requirePermissionGuard('users.read', context);
      return await db.select().from(users);
    },

    user: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<User | undefined> => {
      await requirePermissionGuard('users.read', context);
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    },

    posts: async (_: unknown, __: unknown, context: GraphQLContext): Promise<Post[]> => {
      await requirePermissionGuard('posts.read', context);
      return await db.select().from(posts);
    },

    post: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<Post | undefined> => {
      await requirePermissionGuard('posts.read', context);
      const result = await db.select().from(posts).where(eq(posts.id, id));
      return result[0];
    },

    // New query to get current user's permissions
    me: (_: unknown, __: unknown, context: GraphQLContext): UserWithPermissions | null => {
      if (!context.user?.id) {
        throw new Error('Authentication required');
      }
      return context.user;
    }
  },

  Mutation: {
    createUser: async (_: unknown, { email, name }: { email: string; name: string }, context: GraphQLContext): Promise<User> => {
      await requirePermissionGuard('users.write', context);
      const result = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          email,
          name,
          emailVerified: false
        })
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          emailVerified: users.emailVerified,
          image: users.image,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        });
      return result[0];
    },

    updateUser: async (_: unknown, { id, email, name }: { id: string; email?: string; name?: string }, context: GraphQLContext): Promise<User> => {
      await requirePermissionGuard('users.write', context);

      // Users can update their own profile even without users.write permission
      if (context.user?.id !== id) {
        await requirePermissionGuard('users.write', context);
      }

      const updateData: { email?: string; name?: string } = {};
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;

      const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
      return result[0];
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      await requirePermissionGuard('users.delete', context);
      await db.delete(users).where(eq(users.id, id));
      return true;
    },

    createPost: async (
      _: unknown,
      { title, content, authorId }: { title: string; content?: string; authorId: string },
      context: GraphQLContext
    ): Promise<Post> => {
      await requirePermissionGuard('posts.write', context);

      // Users can only create posts for themselves unless they have admin permissions
      if (context.user?.id !== authorId && !context.user?.permissions?.includes('users.write')) {
        throw new Error('You can only create posts for yourself');
      }

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

    updatePost: async (_: unknown, { id, title, content }: { id: string; title?: string; content?: string }, context: GraphQLContext): Promise<Post> => {
      await requirePermissionGuard('posts.write', context);

      // Check if user owns the post or has admin permissions
      const existingPost = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (!existingPost[0]) {
        throw new Error('Post not found');
      }

      if (context.user?.id !== existingPost[0].authorId && !context.user?.permissions?.includes('users.write')) {
        throw new Error('You can only update your own posts');
      }

      const updateData: { title?: string; content?: string } = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;

      const result = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();
      return result[0];
    },

    deletePost: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      await requirePermissionGuard('posts.delete', context);

      // Check if user owns the post or has admin permissions
      const existingPost = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (!existingPost[0]) {
        throw new Error('Post not found');
      }

      if (context.user?.id !== existingPost[0].authorId && !context.user?.permissions?.includes('users.delete')) {
        throw new Error('You can only delete your own posts');
      }

      await db.delete(posts).where(eq(posts.id, id));
      return true;
    }
  },

  User: {
    posts: async (user: User, _: unknown, context: GraphQLContext): Promise<Post[]> => {
      // Users can see their own posts, others need posts.read permission
      if (context.user?.id !== user.id) {
        await requirePermissionGuard('posts.read', context);
      }
      return await db.select().from(posts).where(eq(posts.authorId, user.id));
    },

    permissions: async (user: User, _: unknown, context: GraphQLContext): Promise<string[]> => {
      // Only return permissions if it's the current user or if the requester has admin permissions
      if (context.user?.id === user.id) {
        return context.user.permissions || [];
      }

      // Admin can see other users' permissions
      if (context.user?.permissions?.includes('users.write')) {
        const userPermissions = await getUserPermissions(user.id);
        return userPermissions;
      }

      // Others can't see permissions
      return [];
    }
  },

  Post: {
    author: async (post: Post, _: unknown, context: GraphQLContext): Promise<User | undefined> => {
      await requirePermissionGuard('users.read', context);
      const result = await db.select().from(users).where(eq(users.id, post.authorId));
      return result[0];
    }
  }
};

// Enhanced context creation with user permissions
export const createContext = async (req: Request): Promise<GraphQLContext> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user?.id) {
      return { user: undefined, session: undefined };
    }

    // Get user with permissions
    const userWithPermissions = await getUserWithPermissions(session.user.id);

    return {
      user: userWithPermissions || undefined,
      session: session.session
    };
  } catch (error) {
    console.error('Error creating GraphQL context:', error);
    return { user: undefined, session: undefined };
  }
};
