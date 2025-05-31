import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

console.log('connectionString', connectionString);
// Disable prefetch as it's not supported in serverless environments
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
