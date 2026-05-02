import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NextJS_SSE_Transport } from './mcp-transport';
import { connectDB } from './db';
import { Report } from '@/models/Report';
import { queryObservations } from './ai';
import { authenticateRequest } from './auth';
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
    // We use a relative path so the client resolves it safely across proxies.
    const transport = new NextJS_SSE_Transport('/api/mcp/messages');
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
      await transport.handlePostMessage(body);
      return new Response('Accepted', { status: 202 });
    } catch (err) {
      return new Response('Error parsing message', { status: 400 });
    }
  }
};