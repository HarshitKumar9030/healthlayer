'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ReportsClient({ reports, currentPage, totalPages }: { reports: any[], currentPage: number, totalPages: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.gsap-fade-in', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFBF7] font-sans pb-20 selection:bg-[#FDFBF7] selection:text-[#2C2C2C]">
      <header className="w-full max-w-5xl mx-auto px-4 py-8 flex justify-between items-center gsap-fade-in">
        <div>
          <motion.div whileHover="hover">
            <Link href="/dashboard" className="text-[#8B8B8B] hover:text-[#2C2C2C] text-[16px] font-medium flex items-center gap-1 transition-colors">
              <motion.span variants={{ hover: { x: -4 } }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                <ChevronLeft size={20} />
              </motion.span>
              Back to Dashboard
            </Link>
          </motion.div>
        </div>
        <div className="flex gap-4 items-center">
          <UserButton />
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 mt-8 flex flex-col gap-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF8F3] p-10 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[#2C2C2C] text-[40px] font-bold leading-[1.2] tracking-[-0.8px]">All Reports</h1>
            <p className="text-[#A28A8A] text-[13px] uppercase tracking-[0.08em] font-medium">Page {currentPage} of {totalPages || 1}</p>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <motion.div whileHover={{ scale: 1.01 }} key={report._id.toString()}>
                <Link 
                  href={`/reports/${report._id.toString()}`} 
                  className="block bg-[#FFFFFF] rounded-2xl p-6 hover:bg-[#FDFBF7] transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[#2C2C2C] font-semibold text-[20px] leading-[1.2] tracking-[-0.4px] group-hover:text-[#000000]">
                      {report.originalFileName}
                    </h3>
                    <span className="text-[#8B8B8B] text-[13px] leading-[1.4] bg-[#F0EAE5] px-3 py-1 rounded-full">View</span>
                  </div>
                  <p className="text-[#8B8B8B] text-[13px] leading-[1.4] mb-4">
                    {mounted ? (report.structuredData?.hospitalInfo?.date || new Date(report.createdAt).toLocaleDateString()) : ''}
                    {report.structuredData?.hospitalInfo?.name && ` • ${report.structuredData.hospitalInfo.name}`}
                  </p>
                  <p className="text-[#4A4A4A] text-[16px] leading-[1.4] tracking-[-0.16px] line-clamp-2">
                    {report.structuredData.summary || 'Contextual summary processing...'}
                  </p>
                </Link>
              </motion.div>
            ))}
            
            {reports.length === 0 && (
              <p className="text-[#8B8B8B] text-[16px] leading-[1.4] tracking-[-0.16px]">No reports uploaded yet.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-4">
              <Link 
                href={currentPage > 1 ? `/reports?page=${currentPage - 1}` : '#'} 
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  currentPage > 1 ? 'bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#E8F0FE]' : 'bg-[#F0EAE5] text-[#A28A8A] cursor-not-allowed'
                }`}
              >
                Previous
              </Link>
              <Link 
                href={currentPage < totalPages ? `/reports?page=${currentPage + 1}` : '#'} 
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  currentPage < totalPages ? 'bg-[#FFFFFF] text-[#2C2C2C] hover:bg-[#E8F0FE]' : 'bg-[#F0EAE5] text-[#A28A8A] cursor-not-allowed'
                }`}
              >
                Next
              </Link>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}