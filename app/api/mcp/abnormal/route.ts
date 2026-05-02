import { connectDB } from '@/lib/db';
import { Observation } from '@/models/Observation';
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = authResult;

    await connectDB();
    
    // Get all abnormal/critical observations for this user
    const abnormalObservations = await Observation.find({
      userId,
      flag: { $in: ['high', 'low', 'critical'] },
    }).sort({ date: -1 }).lean();

    return NextResponse.json({
      abnormal: abnormalObservations.map((obs) => ({
        name: obs.name,
        value: obs.value,
        unit: obs.unit,
        flag: obs.flag,
        date: obs.date,
        reportId: obs.reportId,
      })),
    });
  } catch (error) {
    console.error('MCP Abnormal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
