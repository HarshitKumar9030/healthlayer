"use server";

import { auth } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { Observation } from '@/models/Observation';
import { queryObservations } from '@/lib/ai';

export async function askHealthData(query: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await connectDB();
  
  // RAG-lite: Fetch all of user's observations, or we could limit by recent
  const observations = await Observation.find({ userId })
    .sort({ date: -1 })
    .lean();

  if (!observations.length) {
    return 'No health data found to answer your question. Upload some reports first!';
  }

  // Pass to AI function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await queryObservations(observations as any, query);
  
  return response;
}
