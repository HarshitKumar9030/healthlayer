'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronLeft } from 'lucide-react';

export default function ReportClient({ report, observations, hospitalName, hospitalAddress, reportTitle, reportDate, abnormalObservations }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;
    
    // GSAP animation for header and stats
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
        <motion.div whileHover="hover">
          <Link href="/dashboard" className="text-[#8B8B8B] hover:text-[#2C2C2C] text-[16px] font-medium flex items-center gap-1 transition-colors">
            <motion.span variants={{ hover: { x: -4 } }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
              <ChevronLeft size={20} />
            </motion.span>
            Back to Dashboard
          </Link>
        </motion.div>
        <div className="flex gap-4 items-center">
          <UserButton />
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 mt-8 flex flex-col gap-8">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF8F3] rounded-3xl p-8 md:p-10" // Soft warm pastel
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-[#F0EAE5] pb-8">
            <div className="max-w-[600px]">
              <p className="text-[#A28A8A] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Report Overview</p>
              <h1 className="text-[#2C2C2C] text-[48px] font-bold leading-tight tracking-[-0.8px] font-serif mb-4">{reportTitle}</h1>
              <p className="text-[#4A4A4A] text-[16px] leading-[1.6] tracking-[-0.16px] max-w-[500px]">{report.structuredData.summary}</p>
            </div>

            <div className="w-full max-w-[340px] rounded-3xl bg-[#FFFFFF] overflow-hidden">
              <div className="h-2 bg-[#E8F0FE]" /> {/* Pastel blue accent top */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Hospital Details</p>
                    <h2 className="text-[#2C2C2C] text-[20px] font-semibold leading-[1.2] tracking-[-0.4px]">Report Snapshot</h2>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-[#E8F0FE] text-[#6B85A8] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em]">
                    {reportDate}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-2xl bg-[#FDFBF7] p-4">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#FFFFFF] text-[#2C2C2C] text-[14px] font-bold">
                      H
                    </div>
                    <div className="min-w-0">
                      <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-1 font-medium">Hospital</p>
                      <p className="text-[#2C2C2C] text-[16px] font-medium leading-[1.4] tracking-[-0.16px] break-words">{hospitalName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#FDFBF7] p-4">
                      <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Upload Date</p>
                      <p className="text-[#2C2C2C] text-[16px] font-medium leading-[1.4] tracking-[-0.16px]">
                        {mounted ? new Date(report.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#FDFBF7] p-4">
                      <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Metrics</p>
                      <p className="text-[#2C2C2C] text-[16px] font-medium leading-[1.4] tracking-[-0.16px]">{observations.length} extracted</p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#FDFBF7] p-4">
                    <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Address</p>
                    <p className="text-[#4A4A4A] text-[16px] leading-[1.6] tracking-[-0.16px]">{hospitalAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#FFFFFF] rounded-3xl p-6">
              <p className="text-[#8B8B8B] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Metrics extracted</p>
              <p className="text-[#2C2C2C] text-[32px] font-semibold tracking-[-0.4px]">{observations.length}</p>
            </div>
            <div className="bg-[#FFE8E8] rounded-3xl p-6">
              <p className="text-[#A26D6D] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Abnormal flags</p>
              <p className="text-[#4A2D2D] text-[32px] font-semibold tracking-[-0.4px]">{abnormalObservations.length}</p>
            </div>
            <div className="bg-[#EAF6ED] rounded-3xl p-6">
              <p className="text-[#6D9578] text-[13px] uppercase tracking-[0.08em] mb-2 font-medium">Upload date</p>
              <p className="text-[#2B4B34] text-[32px] font-semibold tracking-[-0.4px]">{mounted ? new Date(report.createdAt).toLocaleDateString() : ''}</p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#E8F0FE] rounded-3xl p-8 md:p-10" // Soft pastel blue
          >
            <h2 className="text-[#2A3F5C] text-[32px] font-bold leading-[1.44] tracking-[-0.8px] mb-6">Metrics Detail</h2>
            <div className="space-y-4">
              {observations.length > 0 ? observations.map((observation: any) => {
                const isAbnormal = observation.flag && observation.flag !== 'normal';

                return (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    key={observation._id} 
                    className={`rounded-2xl p-5 flex items-center justify-between gap-4 ${isAbnormal ? 'bg-[#FFE8E8]' : 'bg-[#FFFFFF]'}`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-[#2C2C2C] font-semibold text-[16px] leading-[1.4] tracking-[-0.16px]">{observation.name}</h3>
                        {isAbnormal && (
                          <span className="text-[#D35D5D] text-[12px] uppercase font-bold tracking-[0.08em] bg-[#FFFFFF] rounded-full px-3 py-1">
                            {observation.flag}
                          </span>
                        )}
                      </div>
                      <p className="text-[#8B8B8B] text-[13px] leading-[1.4] font-medium">Reference: {observation.referenceRange || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-[22px] leading-[1.2] tracking-[-0.4px] ${isAbnormal ? 'text-[#D35D5D]' : 'text-[#2C2C2C]'}`}>
                        {observation.value} <span className="text-[16px] font-medium">{observation.unit}</span>
                      </p>
                      <p className="text-[#8B8B8B] text-[13px] leading-[1.4] mt-1">
                        {mounted ? (observation.date ? new Date(observation.date).toLocaleDateString() : reportDate) : ''}
                      </p>
                    </div>
                  </motion.div>
                );
              }) : (
                <p className="text-[#6B85A8] text-[16px] leading-[1.4] tracking-[-0.16px]">No specific metrics extracted.</p>
              )}
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#F0E6FF] rounded-3xl p-8 md:p-10" // Soft pastel purple
          >
            <h2 className="text-[#3A2C55] text-[32px] font-bold leading-[1.44] tracking-[-0.8px] mb-6">Report Summary</h2>
            <div className="bg-[#FFFFFF] rounded-3xl p-8 text-[#4A4A4A] leading-[1.8] tracking-[-0.16px] prose prose-p:mb-4 prose-ul:list-disc prose-ul:pl-5 prose-li:mb-2 prose-h1:text-[24px] prose-h1:font-bold prose-h1:mb-4 prose-h1:text-[#2C2C2C] prose-h2:text-[20px] prose-h2:font-bold prose-h2:text-[#2C2C2C] prose-h2:mb-3 prose-strong:text-[#2C2C2C]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.structuredData.summary}
              </ReactMarkdown>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}