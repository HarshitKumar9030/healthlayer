import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import { Observation } from '@/models/Observation';
import ReportClient from './ReportClient';

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await connectDB();

  const resolvedParams = await params;

  const report = await Report.findOne({ _id: resolvedParams.id, userId }).lean();

  if (!report) {
    redirect('/dashboard');
  }

  const observations = await Observation.find({ reportId: resolvedParams.id, userId }).sort({ name: 1 }).lean();
  const reportDate = report.structuredData?.hospitalInfo?.date || new Date(report.createdAt).toLocaleDateString();
  const reportTitle = report.structuredData?.hospitalInfo?.name || report.originalFileName;
  const hospitalName = report.structuredData?.hospitalInfo?.name || 'Not available';
  const hospitalAddress = report.structuredData?.hospitalInfo?.address || 'Not available';
  const abnormalObservations = observations.filter((observation) => observation.flag && observation.flag !== 'normal');

  // Convert ObjectIds to strings to pass to client component securely
  const safeReport = JSON.parse(JSON.stringify(report));
  const safeObservations = JSON.parse(JSON.stringify(observations));
  const safeAbnormalObservations = JSON.parse(JSON.stringify(abnormalObservations));

  return (
    <ReportClient 
      report={safeReport}
      observations={safeObservations}
      abnormalObservations={safeAbnormalObservations}
      hospitalName={hospitalName}
      hospitalAddress={hospitalAddress}
      reportTitle={reportTitle}
      reportDate={reportDate}
    />
  );
}
