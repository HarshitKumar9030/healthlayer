import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage, MessageExtraInfo } from '@modelcontextprotocol/sdk/types.js';

export class NextJS_SSE_Transport implements Transport {
  private controller!: ReadableStreamDefaultController;
  private readonly stream: ReadableStream;
  public sessionId: string;
  public readonly endpoint: string;

  public onclose?: () => void;
  public onerror?: (error: Error) => void;
  public onmessage?: (message: JSONRPCMessage, extra?: MessageExtraInfo) => void;

  constructor(endpoint: string) {
    this.sessionId = crypto.randomUUID();
    this.endpoint = endpoint;
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
        // Send the endpoint event
        const url = new URL(this.endpoint, 'http://localhost');
        url.searchParams.set('sessionId', this.sessionId);
        this.writeEvent('endpoint', url.pathname + url.search);
      },
      cancel: () => {
        this.onclose?.();
      },
    });
  }

  private writeEvent(event: string, data: string) {
    if (!this.controller) return;
    const msg = `event: ${event}\ndata: ${data}\n\n`;
    this.controller.enqueue(new TextEncoder().encode(msg));
  }

  getStreamResponse(): Response {
    return new Response(this.stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  }

  async start(): Promise<void> {
    // the stream is started automatically
  }

  async close(): Promise<void> {
    try {
      this.controller?.close();
    } catch {}
    this.onclose?.();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.writeEvent('message', JSON.stringify(message));
  }

  async handlePostMessage(jsonBody: unknown) {
    if (!jsonBody) throw new Error('No body');
    // Just pass the parsed body to onmessage
    this.onmessage?.(jsonBody as JSONRPCMessage);
  }
}
