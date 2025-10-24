import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../src/server/router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const createContext = async () => ({});

const ENDPOINT = '/api/trpc';

async function handle(req: NextRequest) {
  try {
    console.log('[trpc] incoming', req.method, req.url);
    return await fetchRequestHandler({ req: req as unknown as Request, router: appRouter, createContext, endpoint: ENDPOINT });
  } catch (err) {
    console.error('[trpc] handler error', err);
    return NextResponse.json({ error: 'tRPC handler error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
