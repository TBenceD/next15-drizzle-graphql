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
const LOCALE_REGEX = /^\/[a-z]{2}(?=\/|$)/;
const LOCALE_MATCH_REGEX = /^\/([a-z]{2})\//;

const BASIC_PERMISSIONS = [
  { name: 'users.read', description: 'Read users', resource: 'users', action: 'read' },
  { name: 'users.write', description: 'Create and update users', resource: 'users', action: 'write' },
  { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
  { name: 'posts.read', description: 'Read posts', resource: 'posts', action: 'read' },
  { name: 'posts.write', description: 'Create and update posts', resource: 'posts', action: 'write' },
  { name: 'posts.delete', description: 'Delete posts', resource: 'posts', action: 'delete' }
];

const BASIC_ROLES = [
  { name: 'admin', description: 'Administrator with full access' },
  { name: 'user', description: 'Regular user with limited access' },
  { name: 'editor', description: 'Can manage posts' }
];

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
  NEXT_PUBLIC_BETTER_AUTH_URL,
  LOCALE_REGEX,
  LOCALE_MATCH_REGEX,
  BASIC_PERMISSIONS,
  BASIC_ROLES
};
