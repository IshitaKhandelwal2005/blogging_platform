import { NextRequest, NextResponse } from 'next/server';
import { appRouter } from '../../../src/server/router';

export async function POST(req: NextRequest) {
  // tRPC adapter integration would go here; placeholder response
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true });
}
