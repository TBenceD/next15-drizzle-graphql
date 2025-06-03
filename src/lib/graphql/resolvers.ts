import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { user, type User } from '../db/schema';
import { auth } from '../auth';
import { requirePermissionGuard, getUserWithPermissions, getUserPermissions, type UserWithPermissions } from '../auth/permissions';
import crypto from 'node:crypto';

interface GraphQLContext {
  user?: UserWithPermissions;
  session?: { id: string; expiresAt: Date; token: string; userId: string };
}

export const resolvers = {
  Query: {
    users: async (_: unknown, __: unknown, context: GraphQLContext): Promise<User[]> => {
      await requirePermissionGuard('users.read', context);
      return await db.select().from(user);
    },

    user: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<User | undefined> => {
      await requirePermissionGuard('users.read', context);
      const result = await db.select().from(user).where(eq(user.id, id));
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
        .insert(user)
        .values({
          id: crypto.randomUUID(),
          email,
          name,
          emailVerified: false
        })
        .returning({
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
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

      const result = await db.update(user).set(updateData).where(eq(user.id, id)).returning();
      return result[0];
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext): Promise<boolean> => {
      await requirePermissionGuard('users.delete', context);
      await db.delete(user).where(eq(user.id, id));
      return true;
    }
  },

  User: {
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
