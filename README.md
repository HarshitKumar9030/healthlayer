# HealthLayer — MCP Superpower

**Publisher**: Harshit Singh  
**Contact**: harshitkumar9030@gmail.com

---

## Overview

**Context-Aware Clinical Intelligence Layer** — A standards-based MCP Superpower that integrates patient FHIR data with medical report analysis to enable truly interoperable healthcare AI agents.

HealthLayer exposes five tools that dynamically adapt outputs based on injected patient FHIR context. Unlike static tools, outputs change per patient—demonstrating real clinical interoperability.

### Tagline
*"Clinical AI that adapts to your patient. One tool, infinite context."*

---

### What Makes This Different

- **Context-Driven**: Tools receive patient context via SHARP headers, not explicit parameters
- **FHIR-Native**: Fetches and reasons over FHIR Observations in real-time
- **Interoperable**: Works with any FHIR server; no custom integration per EHR
- **Standards-Based**: Full MCP + SHARP + FHIR compliance
- **Marketplace-Ready**: Clean APIs, structured I/O, production-hardened

---

## Key concepts

- **MCP (Model Context Protocol)**: Open standard JSON-RPC + streamable SSE transport for AI agents. Enables declarative tool discovery and invocation across heterogeneous systems.
- **SHARP Extension** (`ai.promptopinion/fhir-context`): Prompt Opinion's healthcare context propagation standard. Allows agents to request and receive patient-scoped FHIR access via headers.
- **FHIR Context Injection**: PromptOpinion injects patient-specific credentials via headers:
  - `X-FHIR-Server-URL`: FHIR server endpoint
  - `X-FHIR-Access-Token`: Bearer token (SMART-on-FHIR)
  - `X-Patient-ID`: Current patient identifier
  - `X-FHIR-Refresh-Token` (optional): Offline access token
  - `X-FHIR-Refresh-Url` (optional): Token refresh endpoint
- **Context-Aware Tools**: Tools are bound to a session's FHIR context and adapt outputs per patient without requiring explicit patient ID inputs.

---

## What this superpower exposes

### Endpoints

- **REST Upload**: `POST /api/mcp/reports` — multipart file ingestion (for UI or direct agent uploads). Returns `reportId` on success.
- **MCP Discovery**: `GET /api/mcp` — SSE stream initialization. Emits `event: endpoint` containing the session-bound message URL.
- **MCP Messages**: `POST /api/mcp/messages?sessionId=...` — JSON-RPC message handler (tool calls, responses). Accepts SHARP headers.

### Tools (Superpower Capabilities)

All tools are context-driven: they adapt outputs based on the injected patient FHIR context (via SHARP headers) and/or the authenticated user's stored reports.

- **`get_summaries`** — Retrieve summaries of authenticated user's stored reports. Returns filename, date, and AI-generated summary.
- **`get_abnormal_findings`** — Surface critical/high/low flagged observations across reports. Useful for alerting agents to patient anomalies.
- **`chat_with_reports`** — Conversational RAG over stored reports. Pass a query string; get Gemini-reasoned answer with report context.
- **`upload_report`** — Server-side fetch and ingest a remote PDF/file from a URL. Useful for agents to pull reports from external systems.
- **`analyze_patient_risk` ⭐ (SHARP-Aware)** — **The flagship tool**. Dynamically analyzes patient risk by:
  1. Fetching FHIR `Observation` resources from the injected FHIR server (if SMART scopes are authorized).
  2. Merging FHIR observations with the user's locally stored reports.
  3. Computing a patient-specific risk score and returning `{risk_level, factors, explanation, patient_id, source}`.
  - **This is the showcase**: Same tool, different patient → different output. Demonstrates true interoperability.

---

## Important files

- `lib/mcp.server.ts` — MCP server implementation, tool handlers, session management, and FHIR context wiring.
- `lib/mcp-transport.ts` — SSE transport implementation that sends the initial `endpoint` event and handles streaming JSON-RPC messages.
- `app/api/mcp/reports/route.ts` — REST upload and listing endpoint used by UI and direct clients.
- `actions/upload.ts` — `uploadAndProcessReport` implementation: file -> OCR/extraction -> parse -> store in MongoDB.
- `lib/ai.ts`, `actions/*` — AI helpers and report parsing pipeline.

---

## Environment / prerequisites

- Node 18+ (Next.js App Router)
- pnpm (recommended; `npm`/`yarn` will also work)
- MongoDB instance and `MONGODB_URI` env var
- Google GenAI key: `GOOGLE_GENAI_API_KEY` (used by `uploadAndProcessReport` for text extraction)
- Clerk (optional) or another auth provider — the repo uses `@clerk/nextjs` for server-side access in `uploadAndProcessReport`. Configure Clerk as needed for user auth.

Suggested environment variables (example `.env.local`):

```
MONGODB_URI=mongodb+srv://user:pass@cluster.example/mydb
GOOGLE_GENAI_API_KEY=ya29.xxxxxx
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CLERK_API_KEY=... (if using Clerk on server)
CLERK_JWT_KEY=... (or other Clerk envs as required)
```

---

## Run locally

1. Install deps

```bash
pnpm install
```

2. Start dev server

```bash
pnpm dev
```

3. Build for production

```bash
pnpm build
pnpm start
```

---

## How MCP initialization & FHIR extension works

1. A client adds your MCP server (pointing at `/api/mcp`). The client sends an `initialize` JSON-RPC request to your MCP server.
2. Your server responds with a `capabilities` object that includes the `ai.promptopinion/fhir-context` extension and requested SMART scopes. Example:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "capabilities": {
      "extensions": {
        "ai.promptopinion/fhir-context": {
          "scopes": [
            { "name": "patient/Patient.rs", "required": true },
            { "name": "patient/Observation.rs", "required": true },
            { "name": "offline_access" }
          ]
        }
      }
    }
  }
}
```

3. If the platform and user grant the FHIR scopes, when a tool is called the platform will inject the following headers on the POST messages to the session endpoint: `X-FHIR-Server-URL`, `X-FHIR-Access-Token`, `X-Patient-ID` and (optionally) `X-FHIR-Refresh-Token`, `X-FHIR-Refresh-Url`.

4. The server stores those values in session context for the session (by `sessionId`) and tools can `fetch` FHIR resources (e.g., `Observation`) from the provided FHIR server to produce patient-specific outputs.

---

## Example usage

- REST Upload (UI or curl):

```bash
curl -X POST "http://localhost:3000/api/mcp/reports" \
  -H "Authorization: Bearer <token>" \
  -F file=@/path/to/report.pdf
```

- MCP flow (high-level):
  1. Open SSE to `GET /api/mcp` — server returns an SSE stream and emits an `event: endpoint` with the full POST URL containing `sessionId`.
  2. Client POSTs JSON-RPC messages to the provided endpoint URL (e.g. `/api/mcp/messages?sessionId=...`) with `Authorization` and, if approved, `X-FHIR-*` headers. The server will accept tool calls and return results via the SSE stream.

Note: use an MCP-compatible client library (e.g. `@modelcontextprotocol/sdk`) or a platform like PromptOpinion / Cursor / Claude to manage the connect/handshake. The server is intentionally implemented to be compatible with typical MCP client behaviors (SSE + POST pairing).

---

## Security and hardening notes

- Validate and restrict `fileUrl` values when using `upload_report` to avoid SSRF. Accept only whitelisted domains or perform server-side URL safety checks.
- Enforce size limits and timeouts for remote downloads.
- Persist FHIR access tokens securely (if offline processing is required) and rotate them using the refresh token flow (the server supports the `offline_access` scope and will receive refresh headers if permitted).
- Ensure production builds run behind TLS and that `x-forwarded-*` headers are trusted only from your proxy layer.

---

## Next steps / recommended features

- Add `analyze_patient_trend` to compute longitudinal trends (time series over Observations).
- Improve `analyze_patient_risk` using a stronger clinical model and more clinical rules (or call Gemini for a final narrative).
- Add demo scripts and Postman collection showing MCP initialize → SSE connect → tool calls → sample outputs.

---

If you want, I can also add a short demo script (Node) that uses the official MCP SDK to connect to `GET /api/mcp`, listens for the `endpoint` event, and posts a sample `analyze_patient_risk` call — would you like that next?
