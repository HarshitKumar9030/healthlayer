'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ChevronRight, Key, Check, Copy, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import UploadArea from '@/components/UploadArea';
import ChatBot from '@/components/ChatBot';
import HealthTimeline from '@/components/HealthTimeline';
import HealthDistribution from '@/components/HealthDistribution';
import { generateApiToken } from '@/actions/token';

export default function DashboardClient({ reports, abnormalObservations, allObservations, initialToken }: { reports: any[], abnormalObservations: any[], allObservations: any[], initialToken?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(initialToken || null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const handleGenerateToken = async () => {
    setGeneratingToken(true);
    const { success, token: newToken } = await generateApiToken();
    if (success && newToken) {
      setToken(newToken);
    }
    setGeneratingToken(false);
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

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

  const timelineGroups = useMemo(() => {
    if (!allObservations) return {};
    
    const groups: { [key: string]: any[] } = {};
    allObservations.forEach((obs) => {
      if (!groups[obs.name]) groups[obs.name] = [];
      groups[obs.name].push(obs);
    });

    const validGroups: { [key: string]: any[] } = {};
    for (const key in groups) {
      if (groups[key].length >= 2) {
        validGroups[key] = groups[key];
      }
    }
    return validGroups;
  }, [allObservations]);

  const groupKeys = Object.keys(timelineGroups);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFBF7] font-sans pb-20">
      <header className="w-full max-w-5xl mx-auto px-4 py-8 flex justify-between items-center gsap-fade-in">
        <div>
          <p className="text-[#8B8B8B] text-[13px] leading-[1.4] tracking-[-0.16px] uppercase font-medium">HealthLayer</p>
          <h1 className="text-[#2C2C2C] text-[32px] font-bold leading-[1.44] tracking-[-0.8px]">Your reports, decoded</h1>
        </div>
        <div className="flex gap-4 items-center">
          <UserButton />
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto px-4 mt-8 flex flex-col gap-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#FFE8E8] rounded-3xl p-8 gsap-fade-in" // Pastel Red/Pink
          >
            <p className="text-[#A26D6D] text-[13px] uppercase tracking-[0.08em] font-medium">Reports</p>
            <p className="text-[#4A2D2D] text-[36px] font-semibold leading-[1.2] tracking-[-0.8px] mt-2">{reports.length}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#E8F0FE] rounded-3xl p-8 gsap-fade-in" // Pastel Blue
          >
            <p className="text-[#6B85A8] text-[13px] uppercase tracking-[0.08em] font-medium">Flagged metrics</p>
            <p className="text-[#2A3F5C] text-[36px] font-semibold leading-[1.2] tracking-[-0.8px] mt-2">{abnormalObservations.length}</p>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-[#EAF6ED] rounded-3xl p-8 gsap-fade-in" // Pastel Green
          >
            <p className="text-[#6D9578] text-[13px] uppercase tracking-[0.08em] font-medium">Data points</p>
            <p className="text-[#2B4B34] text-[36px] font-semibold leading-[1.2] tracking-[-0.8px] mt-2">{allObservations.length}</p>
          </motion.div>
        </section>

        {/* API Token Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="bg-[#2A3F5C] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white cursor-pointer hover:bg-[#1D2B44] transition-colors"
           onClick={() => setIsKeyModalOpen(true)}
         >
           <div>
             <h3 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
               <Key size={20} />
               API Access & Integrations
             </h3>
             <p className="text-[#AEC6E4] text-sm">
               Manage your API keys for the Chrome Extension and Prompt Opinion MCP.
             </p>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[#AEC6E4] text-sm font-medium">Manage Key</span>
              <ChevronRight size={20} className="text-[#AEC6E4]" />
           </div>
        </motion.div>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#FFF4E0] rounded-3xl" // Pastel Orange/Yellow wrapper
        >
          <UploadArea />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F0E6FF] rounded-3xl" // Pastel Purple wrapper
        >
          <ChatBot />
        </motion.section>

        {allObservations?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#EAF6ED] p-10 rounded-3xl" // Extremely light mint
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#2C2C2C] text-[32px] font-bold leading-[1.44] tracking-[-0.8px]">Health Analytics</h2>
              <p className="text-[#6D9578] text-[13px] uppercase tracking-[0.08em] font-medium">{allObservations.length} data points</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <HealthDistribution data={allObservations} />
              {groupKeys.map((key) => (
                <HealthTimeline key={key} title={key} data={timelineGroups[key]} />
              ))}
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: allObservations?.length > 0 ? 0.6 : 0.5 }}
            className="bg-[#FFF8F3] p-10 rounded-3xl" // Very warm soft pastel
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#2C2C2C] text-[32px] font-bold leading-[1.44] tracking-[-0.8px]">Recent Reports</h2>
              <motion.div whileHover="hover">
                <Link href="/reports" className="text-[#8B8B8B] hover:text-[#2C2C2C] text-[14px] font-medium flex items-center gap-1 transition-colors">
                  View All
                  <motion.span variants={{ hover: { x: 4 } }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
                    <ChevronRight size={16} />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
            <div className="space-y-4">
              {reports.map((report) => (
                <Link href={`/reports/${report._id.toString()}`} key={report._id.toString()} className="block bg-[#FFFFFF] rounded-2xl p-6 hover:bg-[#FDFBF7] transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-[#2C2C2C] font-semibold text-[20px] leading-[1.2] tracking-[-0.4px] group-hover:text-[#000000]">{report.originalFileName}</h3>
                    <span className="text-[#8B8B8B] text-[13px] leading-[1.4]">Open</span>
                  </div>
                  <p className="text-[#8B8B8B] text-[13px] leading-[1.4] mb-4">
                    {mounted ? (report.structuredData?.hospitalInfo?.date || new Date(report.createdAt).toLocaleDateString()) : ''}
                    {report.structuredData?.hospitalInfo?.name && ` • ${report.structuredData.hospitalInfo.name}`}
                  </p>
                  <p className="text-[#4A4A4A] text-[16px] leading-[1.4] tracking-[-0.16px] line-clamp-2">{report.structuredData.summary}</p>
                </Link>
              ))}
              {reports.length === 0 && (
                <p className="text-[#8B8B8B] text-[16px] leading-[1.4] tracking-[-0.16px]">No reports uploaded yet.</p>
              )}
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: allObservations?.length > 0 ? 0.7 : 0.6 }}
            className="bg-[#F4F8F7] p-10 rounded-3xl" // Very soft teal/sage
          >
            <h2 className="text-[#2C2C2C] text-[32px] font-bold leading-[1.44] tracking-[-0.8px] mb-6">Key Insights</h2>
            <div className="space-y-4">
              {abnormalObservations.map((obs) => (
                <div key={obs._id.toString()} className="bg-[#FFFFFF] rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-[#2C2C2C] font-semibold text-[16px] leading-[1.4] tracking-[-0.16px]">{obs.name}</h3>
                    <p className="text-[#8B8B8B] text-[13px] leading-[1.4]">Reference: {obs.referenceRange}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#D35D5D] font-bold text-[20px] leading-[1.2] tracking-[-0.4px]">{obs.value} {obs.unit}</p>
                    <span className="text-[#D35D5D] font-medium text-[13px] leading-[1.4] uppercase">{obs.flag}</span>
                  </div>
                </div>
              ))}
              {abnormalObservations.length === 0 && (
                <p className="text-[#8B8B8B] text-[16px] leading-[1.4] tracking-[-0.16px]">No abnormal insights detected.</p>
              )}
            </div>
          </motion.section>
        </div>
      </main>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full relative"
          >
            <button 
              onClick={() => setIsKeyModalOpen(false)}
              className="absolute top-6 right-6 text-[#AEC6E4] hover:text-[#2A3F5C] transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="mb-6 pr-6">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <Key size={24} className="text-[#2A3F5C]" />
                API Integration Key
              </h2>
              <p className="text-[#8B8B8B] text-sm leading-relaxed">
                Use this key to authenticate external services like the Chrome Extension or Prompt Opinion MCP. Treat this key like a password.
              </p>
            </div>

            <div className="bg-[#F4F8F7] rounded-2xl p-6 mb-6 border border-[#E8F0FE]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[#2C2C2C] font-semibold text-sm">Your Secret Key</span>
                {token && (
                  <button onClick={() => setShowKey(!showKey)} className="text-[#6B85A8] hover:text-[#2A3F5C] flex items-center gap-1 text-xs font-medium bg-white px-2 py-1 rounded-md border border-[#D1E0F5]">
                    {showKey ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Reveal</>}
                  </button>
                )}
              </div>
              
              {token ? (
                <div className="flex items-center bg-white rounded-xl overflow-hidden border border-[#D1E0F5]">
                  <div className="flex-1 overflow-x-auto no-scrollbar">
                    <code className="px-4 py-3 text-sm text-[#2A3F5C] bg-[#F7FAFF] font-mono select-all inline-block min-w-full">
                      {showKey ? token : '••••••••••••••••••••••••••••••••••••••••••••••••'}
                    </code>
                  </div>
                  <button
                    onClick={copyToken}
                    className="px-4 py-3 hover:bg-[#E8F0FE] transition-colors bg-white text-[#6B85A8] border-l border-[#D1E0F5] shrink-0"
                    title="Copy token"
                  >
                    {copiedToken ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#D1E0F5] border-dashed p-4 text-center">
                  <p className="text-[#6B85A8] text-sm italic">No key generated yet</p>
                </div>
              )}
            </div>

            <div className="bg-[#FFF4E0] border border-[#FADBA3] rounded-xl p-4 flex gap-3 mb-8">
              <AlertCircle size={20} className="text-[#D39D43] shrink-0 mt-0.5" />
              <p className="text-[#A67527] text-[13px] leading-relaxed">
                Generating a new key will immediately invalidate your old one. All extensions or integrations using the old key will stop working.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsKeyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#6B85A8] hover:bg-[#F4F8F7] transition-colors whitespace-nowrap"
              >
                Close
              </button>
              <button
                onClick={handleGenerateToken}
                disabled={generatingToken}
                className="bg-[#2A3F5C] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1D2B44] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {generatingToken ? 'Generating...' : token ? 'Rotate Key' : 'Generate New Key'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
