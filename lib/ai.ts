import { GoogleGenAI } from '@google/genai';
import { ParsedMedicalReport, Observation } from '@/types';

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const model = 'gemini-3-flash-preview';

interface ParseResult {
  hospitalInfo?: {
    name: string;
    address?: string;
    date?: string;
  };
  observations: Array<{
    name: string;
    value: number | string;
    unit?: string;
    referenceRange?: string;
    flag: 'normal' | 'high' | 'low' | 'critical';
  }>;
  summary: string;
}

export async function parseMedicalReport(text: string): Promise<ParsedMedicalReport> {
  try {
    const prompt = `You are a medical data extraction expert. Parse the following medical report text and extract structured health observations.

Return ONLY valid JSON in this exact format, no markdown code blocks or extra text:
{
  "hospitalInfo": {
    "name": "Name of the hospital or lab",
    "address": "Address if present",
    "date": "Date of the report if present"
  },
  "observations": [
    {
      "name": "Lab Test Name",
      "value": 13.5,
      "unit": "g/dL",
      "referenceRange": "13-17",
      "flag": "normal"
    }
  ],
  "summary": "Brief patient-friendly summary of key findings"
}

Flag values must be: "normal", "high", "low", or "critical"
Value must be a number if it's a measurement, string if text-based.
Extract ALL observations from the report.

Medical Report Text:
${text}

Return only the JSON object, no other text.`;

    const result = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const responseText = result.text;
    
    // Clean up response - remove markdown code blocks if present
    let cleanedText = responseText ? responseText.trim() : '';
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed: ParseResult = JSON.parse(cleanedText);

    // Validate and normalize the response
    const normalizedObservations: Observation[] = parsed.observations
      .filter((obs) => obs.name && obs.value !== undefined && obs.flag)
      .map((obs) => ({
        name: obs.name.trim(),
        value: obs.value,
        unit: obs.unit?.trim(),
        referenceRange: obs.referenceRange?.trim(),
        flag: obs.flag as 'normal' | 'high' | 'low' | 'critical',
      }));

    return {
      hospitalInfo: parsed.hospitalInfo,
      observations: normalizedObservations,
      summary: parsed.summary || 'Medical report processed successfully.',
    };
  } catch (error) {
    console.error('Error parsing medical report:', error);
    // Return a fallback with basic extraction
    return {
      observations: [],
      summary: 'Failed to parse report. Please try uploading again.',
    };
  }
}

export async function queryObservations(
  observations: Observation[],
  query: string
): Promise<string> {
  try {
    const observationText = observations
      .map(
        (obs) =>
          `${obs.name}: ${obs.value} ${obs.unit || ''} (${obs.flag}) - Reference: ${obs.referenceRange || 'N/A'}`
      )
      .join('\n');

    const prompt = `You are a medical assistant. Based on the following health observations, answer the user's question in simple, patient-friendly language.
Feel free to use Markdown formatting (like bold, bullet points) to structure your answer.

Health Observations:
${observationText}

User Question: ${query}

Provide a brief, clear answer. If the question cannot be answered from the observations, say so.`;

    const result = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return result.text || '';
  } catch (error) {
    console.error('Error querying observations:', error);
    return 'Unable to process your query. Please try again.';
  }
}
