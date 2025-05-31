import { createYoga } from 'graphql-yoga';
import { schema } from '@/lib/graphql/schema';
import type { NextRequest } from 'next/server';

interface RouteContext {
  params: Promise<Record<string, string>>;
}

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response }
});

export async function GET(request: NextRequest, _context: RouteContext) {
  return await handleRequest(request, {});
}

export async function POST(request: NextRequest, _context: RouteContext) {
  return await handleRequest(request, {});
}

export async function OPTIONS(request: NextRequest, _context: RouteContext) {
  return await handleRequest(request, {});
}
