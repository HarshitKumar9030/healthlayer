import { NextResponse } from 'next/server';
import { MCP } from '@/lib/mcp.server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, x-patient-id, x-fhir-server-url, x-fhir-access-token, x-fhir-refresh-token, x-fhir-refresh-url, mcp-protocol-version, mcp-session-id',
  'Access-Control-Expose-Headers': 'x-patient-id, x-fhir-server-url',
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
