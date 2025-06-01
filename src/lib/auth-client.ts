import { NEXT_PUBLIC_BETTER_AUTH_URL } from '@/config/common';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: NEXT_PUBLIC_BETTER_AUTH_URL
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
