const DEFAULT_REDIRECT_URL = '/';
const COOKIE_NAME = 'LANG';
const ALL_PERMISSIONS = [''];
const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE || 'false';
const DATABASE_URL = process.env.DATABASE_URL || 'http://localhost:5432';
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL || 'http://localhost:3000';
const SUPABASE_SECRET = process.env.SUPABASE_SECRET || 'secret';
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/api/graphql';
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'secret';
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';
const NEXT_PUBLIC_BETTER_AUTH_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';

export {
  DEFAULT_REDIRECT_URL,
  COOKIE_NAME,
  ALL_PERMISSIONS,
  MAINTENANCE_MODE,
  DATABASE_URL,
  SUPABASE_PROJECT_URL,
  SUPABASE_SECRET,
  GRAPHQL_ENDPOINT,
  BETTER_AUTH_SECRET,
  BETTER_AUTH_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL
};
