import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import { NextResponse } from 'next/server';
import { uploadAndProcessReport } from '@/actions/upload'; // Import the action
import { authenticateRequest } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    const { userId } = authResult;

    await connectDB();
    
    // Get all summary reports for this user
    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      reports: reports.map((report) => ({
        id: report._id,
        filename: report.originalFileName,
        date: report.createdAt,
        observationsCount: report.structuredData?.observations?.length || 0,
      })),
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('MCP Reports error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    const { userId } = authResult;

    const formData = await request.formData();
    const result = await uploadAndProcessReport(formData, userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json({ success: true, reportId: result.reportId }, { headers: corsHeaders });
  } catch (error) {
    console.error('MCP Reports upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
