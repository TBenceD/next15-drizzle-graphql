import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '@/config/common';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db/connection'; // You'll need to create this
import { user, session, account, verification } from './db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  plugins: [nextCookies()]
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
