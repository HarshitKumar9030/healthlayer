'use server';

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import { Observation } from '@/models/Observation';
import { GoogleGenAI } from '@google/genai';
import { parseMedicalReport } from '@/lib/ai';
import { buildPatientKey, buildPatientLabel, type PatientIdentity } from '@/lib/patient';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });
const model = 'gemini-3-flash-preview';

export async function uploadAndProcessReport(formData: FormData, explicitUserId?: string) {
  let userId = explicitUserId;
  if (!userId) {
    const session = await auth();
    userId = session?.userId ?? undefined;
  }
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  try {
    await connectDB();

    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;

    // Step 1: Extract text using Gemini (acting as OCR)
    const ocrPrompt = 'Extract all the text from this medical report document exactly as it is written. Preserve the structure and tables as much as possible.';
    
    // Different format for newer/older @google/genai library. Standard way with inlineData:
    const ocrResult = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: ocrPrompt },
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    const extractedText = ocrResult.text;
    if (!extractedText) {
       throw new Error("Could not extract text from document");
    }

    // Step 2: Parse text to JSON
    const parsedData = await parseMedicalReport(extractedText);

    const patientIdentity: PatientIdentity = {
      name: parsedData.patientInfo?.name,
      dob: parsedData.patientInfo?.dob,
      identifier: parsedData.patientInfo?.identifier,
      pointer: parsedData.patientInfo?.pointer,
    };
    const patientKey = buildPatientKey(patientIdentity, file.name);
    const patientLabel = buildPatientLabel(patientIdentity);

    // Step 3: Save Report
    const report = await Report.create({
      userId,
      patientKey,
      patientInfo: {
        ...patientIdentity,
        pointer: patientKey,
      },
      originalFileName: file.name,
      originalFileUrl: 'local', // Or placeholder/s3 url
      extractedText,
      structuredData: {
        ...parsedData,
        patientInfo: {
          ...patientIdentity,
          pointer: patientKey,
        },
      },
    });

    // Step 4: Save Observations independently for easier querying
    if (parsedData.observations && parsedData.observations.length > 0) {
      const observationDocs = parsedData.observations.map((obs) => ({
        ...obs,
        userId,
        reportId: report._id,
      }));
      await Observation.insertMany(observationDocs);
    }

    return { success: true, reportId: report._id.toString(), patientKey, patientLabel };
  } catch (error) {
    console.error('Error processing upload:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
