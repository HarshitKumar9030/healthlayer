import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Report } from '@/models/Report';
import { queryObservations } from '@/lib/ai';
import { MCP } from '@/lib/mcp.server'; // We will create this

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization, x-api-key, x-patient-id, x-fhir-server-url, x-fhir-access-token, x-fhir-refresh-token, x-fhir-refresh-url, mcp-protocol-version, mcp-session-id',
  'Access-Control-Expose-Headers': 'x-patient-id, x-fhir-server-url',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(request: Request) {
  // Start the SSE stream
  const response = await MCP.handleGet(request);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

