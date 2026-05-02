import { NextResponse } from 'next/server';
import { MCP } from '@/lib/mcp.server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

export async function POST(request: Request) {
  const response = await MCP.handlePost(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}
