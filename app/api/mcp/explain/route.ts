import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
const model = 'gemini-3-flash-preview';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { text, context } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400, headers: corsHeaders });
    }

    // Call Gemini to explain the text
    const prompt = `You are a medical AI assistant. Explain the following medical term, metric, or statement in simple, easy-to-understand terms for a patient. Keep the explanation concise (2-3 sentences max).
    
${context ? `Context from the report:\n"${context}"\n\n` : ''}Text to explain: "${text}"`;

    const result = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const explanation = result.text || 'No explanation could be generated.';

    return NextResponse.json({ explanation }, { headers: corsHeaders });
  } catch (error) {
    console.error('MCP Explain error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
