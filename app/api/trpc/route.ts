import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../src/server/router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// Minimal context creator. If you later add auth/session info, build it here.
const createContext = async () => ({});

const ENDPOINT = '/api/trpc';

async function handle(req: NextRequest) {
  try {
    // Log incoming request for debugging when browser calls the endpoint
    // (visible in the terminal running the dev server)
    // Keep logs minimal to avoid leaking secrets
    // eslint-disable-next-line no-console
    console.log('[trpc] incoming', req.method, req.url);

    // Delegate to tRPC fetch handler
    return await fetchRequestHandler({ req: req as unknown as Request, router: appRouter, createContext, endpoint: ENDPOINT });
  } catch (err) {
    // eslint-disable-next-line no-console
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
