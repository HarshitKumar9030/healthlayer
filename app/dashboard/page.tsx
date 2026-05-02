import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Report } from '@/models/Report';
import { Observation } from '@/models/Observation';
import { User } from '@/models/User';
import DashboardClient from './DashboardClient';

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  await connectDB();

  const reports = await Report.find({ userId }).sort({ createdAt: -1 }).lean();
  const observations = await Observation.find({ userId }).sort({ date: -1 }).lean();
  const abnormalObservations = observations.filter((observation) => observation.flag && observation.flag !== 'normal').slice(0, 10);

  // Fetch or create user
  let user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    user = await User.create({ clerkId: userId, email: 'placeholder@email.com' }); // simplified creation
  }

  // Serialize records fully
  const safeReports = JSON.parse(JSON.stringify(reports));
  const safeAbnormalObservations = JSON.parse(JSON.stringify(abnormalObservations));
  const safeAllObservations = JSON.parse(JSON.stringify(observations));

  return (
    <DashboardClient 
      reports={safeReports} 
      abnormalObservations={safeAbnormalObservations} 
      allObservations={safeAllObservations}
      initialToken={user?.apiKey || null}
    />
  );
}
