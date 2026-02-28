/*
 * Health Check API Route — src/app/api/health/route.js
 * ──────────────────────────────────────────────────────
 * Next.js 14 App Router uses Route Handlers (route.js files) instead of
 * the old pages/api/*.js pattern. Each exported function name maps to an HTTP method.
 */

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query('SELECT 1');
    return NextResponse.json({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'unreachable', detail: error.message },
      { status: 500 }
    );
  }
}
