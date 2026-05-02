import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NextJS_SSE_Transport } from './mcp-transport';
import { connectDB } from './db';
import { Report } from '@/models/Report';
import { queryObservations } from './ai';
import { authenticateRequest } from './auth';
import { uploadAndProcessReport } from '@/actions/upload';
import type { Observation } from '@/types';

function createServer() {
  const server = new Server(
    {
      name: 'healthlayer-reports-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        extensions: {
          'ai.promptopinion/fhir-context': {
            scopes: [
              { name: 'patient/Patient.rs', required: true },
              { name: 'patient/Condition.rs' },
              { name: 'offline_access' }
            ]
          }
        }
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_summaries',
          description: 'Get AI summaries and key details of all available medical reports for the user.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_abnormal_findings',
          description: 'Get all critical or abnormal laboratory test results and flags from the user\'s reports.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'chat_with_reports',
          description: 'Ask the Medical AI an open-ended question about the user\'s medical reports using RAG.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The question to ask about the reports' },
            },
            required: ['query'],
          },
        },
        {
          name: 'upload_report',
          description: 'Upload a report by URL for processing (server will fetch the file).',
          inputSchema: {
            type: 'object',
            properties: {
              fileUrl: { type: 'string', description: 'Publicly accessible URL to download the report file' },
              filename: { type: 'string', description: 'Optional filename to save' },
            },
            required: ['fileUrl'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    // Auth check via custom passed properties?
    // Extra should contain our authenticated user info we injected!
    const { userId } = (extra as any).auth || {};
    if (!userId) {
      throw new Error('Unauthorized or unauthenticated context in CallToolRequest');
    }

    await connectDB();

    if (request.params.name === 'get_summaries') {
      const reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean();
      return {
        content: [{ type: 'text', text: JSON.stringify(reports.map(r => ({
          filename: r.originalFileName,
          date: r.createdAt,
          summary: r.structuredData?.summary || 'No summary',
        })), null, 2) }],
      };
    } 
    
    if (request.params.name === 'get_abnormal_findings') {
      const reports = await Report.find({ userId }).lean();
      const abnormal = reports.flatMap(r => 
        (r.structuredData?.observations || [])
        .filter((o: Observation) => o.flag === 'high' || o.flag === 'low' || o.flag === 'critical')
        .map((o: Observation) => ({
          report: r.originalFileName,
          ...o
        }))
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(abnormal, null, 2) }],
      };
    } 
    
    if (request.params.name === 'chat_with_reports') {
      const { query } = request.params.arguments as { query: string };
      const reports = await Report.find({ userId }).lean();
      const allObservations = reports.flatMap(r => r.structuredData?.observations || []);
      
      const answer = await queryObservations(allObservations as Observation[], query);
      return {
        content: [{ type: 'text', text: answer }],
      };
    }

    if (request.params.name === 'upload_report') {
      const { fileUrl, filename } = request.params.arguments as { fileUrl: string; filename?: string };
      if (!fileUrl) throw new Error('fileUrl is required');

      // Download the file server-side and create a FormData compatible object
      const resp = await fetch(fileUrl);
      if (!resp.ok) throw new Error(`Failed to download file: ${resp.status}`);
      const arrayBuffer = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'application/octet-stream';

      const blob = new Blob([arrayBuffer], { type: contentType });
      const name = filename || (() => { try { return new URL(fileUrl).pathname.split('/').pop() || 'upload.bin'; } catch { return 'upload.bin'; } })();
      const file = new File([blob], name, { type: contentType });

      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadAndProcessReport(formData, userId);
      return {
        content: [{ type: 'text', text: JSON.stringify({ success: result.success, reportId: result.reportId ?? null }) }],
      };
    }
    
    throw new Error(`Tool not found: ${request.params.name}`);
  });

  return server;
}

// Global state to store active SSE connections in development/serverless
const activeTransports = new Map<string, NextJS_SSE_Transport>();
const mcpServer = createServer();

export const MCP = {
  handleGet: async (request: Request) => {
    const authResult = await authenticateRequest(request as any);
    if (!authResult) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Endpoint where POST messages should be sent.
    // We construct an absolute URL using the request headers to ensure clients like Cursor/Claude can resolve it.
    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;
    const transport = new NextJS_SSE_Transport(`${baseUrl}/api/mcp/messages`);
    activeTransports.set(transport.sessionId, transport);
    
    // Auto-cleanup on close
    transport.onclose = () => {
      activeTransports.delete(transport.sessionId);
    };

    // Connect the transport to our server singleton!
    // Since MCP server `.connect()` sets up the onmessage listeners.
    // Wait, Server handles ONE transport at a time usually? 
    // No, new Server can connect to multiple transports or we need to instantiate Server per transport?
    // Actually, Server.connect() accepts one transport. If we need multiple clients, we must create a new Server instance per connection!
    const sessionServer = createServer();
    
    // We can inject auth context
    const originalOnMessage = transport.onmessage;
    transport.onmessage = (message, extra) => {
      if (originalOnMessage) {
        originalOnMessage(message, Object.assign({}, extra, { auth: authResult }));
      }
    };
    
    sessionServer.connect(transport);
    
    return transport.getStreamResponse();
  },

  handlePost: async (request: Request) => {
    const urlObj = new URL(request.url);
    const sessionId = urlObj.searchParams.get('sessionId');
    if (!sessionId) {
      return new Response(`Missing sessionId. Target URL: ${request.url}`, { status: 400 });
    }

    const transport = activeTransports.get(sessionId);
    if (!transport) {
      return new Response('Session not found', { status: 404 });
    }

    try {
      const body = await request.json();

      // Extract PromptOpinion FHIR headers if present and forward them as extra info
      const fhirServer = request.headers.get('x-fhir-server-url') || undefined;
      const fhirAccessToken = request.headers.get('x-fhir-access-token') || undefined;
      const fhirPatientId = request.headers.get('x-patient-id') || undefined;
      const fhirRefreshToken = request.headers.get('x-fhir-refresh-token') || undefined;
      const fhirRefreshUrl = request.headers.get('x-fhir-refresh-url') || undefined;

      const extra: any = {
        fhir: {
          serverUrl: fhirServer,
          accessToken: fhirAccessToken,
          patientId: fhirPatientId,
          refreshToken: fhirRefreshToken,
          refreshUrl: fhirRefreshUrl,
        },
        headers: Object.fromEntries(request.headers.entries()),
      };

      await transport.handlePostMessage(body, extra as any);
      return new Response('Accepted', { status: 202 });
    } catch (err) {
      return new Response('Error parsing message', { status: 400 });
    }
  }
};