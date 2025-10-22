import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../../src/server/router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// Minimal context creator. Extend with auth/session later if needed.
const createContext = async () => ({});

const ENDPOINT = '/api/trpc';

async function handle(req: NextRequest) {
  try {
    // eslint-disable-next-line no-console
    console.log('[trpc][catch-all] incoming', req.method, req.url);
    return await fetchRequestHandler({ req: req as unknown as Request, router: appRouter, createContext, endpoint: ENDPOINT });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[trpc][catch-all] handler error', err);
    return NextResponse.json({ error: 'tRPC catch-all handler error' }, { status: 500 });
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
