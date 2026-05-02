import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { NextJS_SSE_Transport } from './mcp-transport';
import { connectDB } from './db';
import { Report } from '@/models/Report';
import { queryObservations } from './ai';
import { authenticateRequest } from './auth';
import { uploadAndProcessReport } from '@/actions/upload';
import type { Observation } from '@/types';

type FhirContext = {
  serverUrl?: string;
  accessToken?: string;
  patientId?: string;
  refreshToken?: string;
  refreshUrl?: string;
};

type SessionContext = {
  auth: {
    userId: string;
  };
  fhir?: FhirContext;
};

type RiskAssessment = {
  risk_level: 'low' | 'moderate' | 'high';
  factors: string[];
  explanation: string;
  patient_id?: string;
  source: 'fhir-context' | 'stored-reports' | 'merged';
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getObservationValue(resource: any): { value: number | string | null; unit?: string } {
  const quantity = resource?.valueQuantity;
  if (quantity && typeof quantity === 'object') {
    return {
      value: quantity.value ?? null,
      unit: quantity.unit || quantity.code || undefined,
    };
  }

  if (resource?.valueString != null) return { value: resource.valueString };
  if (resource?.valueCodeableConcept?.text != null) return { value: resource.valueCodeableConcept.text };
  if (resource?.valueInteger != null) return { value: resource.valueInteger };
  if (resource?.valueBoolean != null) return { value: resource.valueBoolean ? 'true' : 'false' };
  return { value: null };
}

function mapFhirObservation(resource: any): Observation | null {
  if (!resource || resource.resourceType !== 'Observation') return null;
  const codeText = resource?.code?.text || resource?.code?.coding?.[0]?.display || resource?.code?.coding?.[0]?.code;
  if (!codeText) return null;

  const { value, unit } = getObservationValue(resource);
  const flag = (() => {
    const interpretation = resource?.interpretation?.[0]?.coding?.[0]?.code?.toLowerCase();
    if (interpretation === 'h') return 'high';
    if (interpretation === 'l') return 'low';
    if (interpretation === 'crit' || interpretation === 'critical') return 'critical';
    return 'normal';
  })();

  return {
    name: String(codeText),
    value: value ?? '',
    unit,
    flag,
    date: resource?.effectiveDateTime ? new Date(resource.effectiveDateTime) : undefined,
  };
}

function scoreRiskFromObservations(observations: Observation[], patientId?: string): RiskAssessment {
  const factors: string[] = [];
  let score = 0;

  for (const observation of observations) {
    const name = observation.name.toLowerCase();
    const numericValue = toNumber(observation.value);

    if (observation.flag === 'critical') {
      score += 3;
      factors.push(`${observation.name} flagged critical`);
      continue;
    }

    if (observation.flag === 'high') {
      score += 2;
      factors.push(`${observation.name} flagged high`);
    }

    if (observation.flag === 'low') {
      score += 1;
      factors.push(`${observation.name} flagged low`);
    }

    if (name.includes('cholesterol') || name.includes('ldl')) {
      if (numericValue !== null && numericValue >= 160) {
        score += 2;
        factors.push(`elevated ${observation.name.toLowerCase()}`);
      }
      if (numericValue !== null && numericValue >= 190) {
        score += 1;
      }
    }

    if (name.includes('hdl')) {
      if (numericValue !== null && numericValue < 40) {
        score += 2;
        factors.push('low HDL');
      }
    }

    if (name.includes('glucose') || name.includes('a1c') || name.includes('hba1c')) {
      if (numericValue !== null && numericValue >= 126) {
        score += 2;
        factors.push(`elevated ${observation.name.toLowerCase()}`);
      }
      if (numericValue !== null && numericValue >= 6.5 && name.includes('a1c')) {
        score += 1;
      }
    }

    if (name.includes('blood pressure') || name.includes('systolic')) {
      if (numericValue !== null && numericValue >= 140) {
        score += 2;
        factors.push(`elevated ${observation.name.toLowerCase()}`);
      }
    }
  }

  const uniqueFactors = Array.from(new Set(factors));
  const risk_level: RiskAssessment['risk_level'] = score >= 5 ? 'high' : score >= 2 ? 'moderate' : 'low';
  const explanation =
    risk_level === 'high'
      ? 'Patient context shows multiple elevated or critical findings consistent with higher clinical risk.'
      : risk_level === 'moderate'
        ? 'Patient context shows one or more abnormal findings that merit follow-up.'
        : 'Patient context does not currently show major abnormal findings in the available data.';

  return {
    risk_level,
    factors: uniqueFactors,
    explanation,
    patient_id: patientId,
    source: 'merged',
  };
}

async function loadSessionObservations(userId: string, fhir?: FhirContext): Promise<Observation[]> {
  const storedReports = await Report.find({ userId }).lean();
  const storedObservations = storedReports.flatMap((r) => (r.structuredData?.observations || []) as Observation[]);

  const patientId = fhir?.patientId;
  const serverUrl = fhir?.serverUrl?.replace(/\/$/, '');
  const accessToken = fhir?.accessToken;
  const fhirObservations: Observation[] = [];

  if (serverUrl && patientId && accessToken) {
    try {
      const response = await fetch(`${serverUrl}/Observation?patient=${encodeURIComponent(patientId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/fhir+json',
        },
      });

      if (response.ok) {
        const bundle = await response.json();
        const entries = Array.isArray(bundle?.entry) ? bundle.entry : [];
        for (const entry of entries) {
          const observation = mapFhirObservation(entry?.resource);
          if (observation) {
            fhirObservations.push(observation);
          }
        }
      }
    } catch {
      // Best-effort FHIR fetch; fall back to stored reports only.
    }
  }

  return [...storedObservations, ...fhirObservations];
}

function createServer(sessionContext: SessionContext) {
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
              { name: 'patient/Observation.rs', required: true },
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
          name: 'analyze_patient_risk',
          description: 'Analyze patient risk using context injected via FHIR headers and stored reports.',
          inputSchema: {
            type: 'object',
            properties: {},
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

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { userId } = sessionContext.auth;
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

    if (request.params.name === 'analyze_patient_risk') {
      const observations = await loadSessionObservations(userId, sessionContext.fhir);
      const assessment = scoreRiskFromObservations(observations, sessionContext.fhir?.patientId);
      return {
        content: [{ type: 'text', text: JSON.stringify(assessment, null, 2) }],
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
const activeSessionContexts = new Map<string, SessionContext>();

export const MCP = {
  handleGet: async (request: Request) => {
    const authResult = await authenticateRequest(request as any);
    if (!authResult) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (!authResult.userId) {
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
    activeSessionContexts.set(transport.sessionId, {
      auth: { userId: authResult.userId },
    });
    
    // Auto-cleanup on close
    transport.onclose = () => {
      activeTransports.delete(transport.sessionId);
      activeSessionContexts.delete(transport.sessionId);
    };

    // Connect the transport to our server singleton!
    // Since MCP server `.connect()` sets up the onmessage listeners.
    // Wait, Server handles ONE transport at a time usually? 
    // No, new Server can connect to multiple transports or we need to instantiate Server per transport?
    // Actually, Server.connect() accepts one transport. If we need multiple clients, we must create a new Server instance per connection!
    const sessionContext = activeSessionContexts.get(transport.sessionId)!;
    const sessionServer = createServer(sessionContext);
    
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
    const sessionContext = activeSessionContexts.get(sessionId);
    if (!sessionContext?.auth?.userId) {
      return new Response('Unauthorized session context', { status: 401 });
    }

    try {
      const body = await request.json();

      // Extract PromptOpinion FHIR headers if present and forward them as extra info
      const fhirServer = request.headers.get('x-fhir-server-url') || undefined;
      const fhirAccessToken = request.headers.get('x-fhir-access-token') || undefined;
      const fhirPatientId = request.headers.get('x-patient-id') || undefined;
      const fhirRefreshToken = request.headers.get('x-fhir-refresh-token') || undefined;
      const fhirRefreshUrl = request.headers.get('x-fhir-refresh-url') || undefined;

      sessionContext.fhir = {
        serverUrl: fhirServer,
        accessToken: fhirAccessToken,
        patientId: fhirPatientId,
        refreshToken: fhirRefreshToken,
        refreshUrl: fhirRefreshUrl,
      };

      await transport.handlePostMessage(body);
      return new Response('Accepted', { status: 202 });
    } catch (err) {
      return new Response('Error parsing message', { status: 400 });
    }
  }
};