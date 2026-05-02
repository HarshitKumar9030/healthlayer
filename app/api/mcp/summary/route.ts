import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
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
    
    // Get all summary reports for this user
    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .select('structuredData.summary createdAt')
      .lean();

    return NextResponse.json({
      summaries: reports.map((report) => ({
        reportId: report._id,
        date: report.createdAt,
        summary: report.structuredData.summary,
      })),
    });
  } catch (error) {
    console.error('MCP Summary error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
