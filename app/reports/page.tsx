import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import ReportsClient from './ReportsClient';

export default async function AllReportsPage({ searchParams }: { searchParams: { page?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await connectDB();
  
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams?.page || '1', 10);
  const limit = 10;
  const skip = (page - 1) * limit;

  const totalReports = await Report.countDocuments({ userId });
  const totalPages = Math.ceil(totalReports / limit);

  const reports = await Report.find({ userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const safeReports = JSON.parse(JSON.stringify(reports));

  return (
    <ReportsClient 
      reports={safeReports} 
      currentPage={page} 
      totalPages={totalPages} 
    />
  );
}