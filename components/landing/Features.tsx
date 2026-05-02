'use client';

import { motion } from 'motion/react';

export function Features() {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-[80px]" id="demo">
      <div className="text-center mb-[56px]">
        <h2 className="text-[#000000] font-serif text-[48px] leading-[1.25] mb-[16px]">Everything you need to build health apps.</h2>
        <p className="text-[#333333] text-[20px] leading-[1.2] -tracking-[0.4px] max-w-2xl mx-auto">From messy PDFs to structured, agent-ready JSON in seconds.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] w-full text-left">
        <motion.div 
          whileHover={{ y: -5 }}
          className="flex flex-col bg-[#ffffff] p-[40px] rounded-[24px] shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px] transition-shadow hover:shadow-[rgba(16,24,40,0.08)_0px_12px_24px_0px]"
        >
          <div className="self-start px-4 py-1.5 bg-[#fdf5ff] border border-[#f1ccff] rounded-[10px] text-[#000000] font-bold text-[13px] mb-[24px] tracking-widest uppercase">UPLOAD</div>
          <h3 className="text-[#000000] text-[20px] font-semibold leading-[1.2] -tracking-[0.4px] mb-[12px]">Simple Upload</h3>
          <p className="text-[#333333] text-[16px] leading-[1.4] -tracking-[0.16px]">Drop your PDF lab results, discharge summaries, or imaging reports. We handle the rest.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="flex flex-col bg-[#ffffff] p-[40px] rounded-[24px] shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px] transition-shadow hover:shadow-[rgba(16,24,40,0.08)_0px_12px_24px_0px]"
        >
          <div className="self-start px-4 py-1.5 bg-[#ebf8ff] border border-[#91e0ff] rounded-[10px] text-[#000000] font-bold text-[13px] mb-[24px] tracking-widest uppercase">PROCESS</div>
          <h3 className="text-[#000000] text-[20px] font-semibold leading-[1.2] -tracking-[0.4px] mb-[12px]">AI Processing</h3>
          <p className="text-[#333333] text-[16px] leading-[1.4] -tracking-[0.16px]">Gemini Vision OCR extracts text deterministically, converting complex medical data into structured JSON.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="flex flex-col bg-[#ffffff] p-[40px] rounded-[24px] shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px] transition-shadow hover:shadow-[rgba(16,24,40,0.08)_0px_12px_24px_0px]"
        >
          <div className="self-start px-4 py-1.5 bg-[#f5f2f0] border border-[#d6d6d6] rounded-[10px] text-[#000000] font-bold text-[13px] mb-[24px] tracking-widest uppercase">CONNECT</div>
          <h3 className="text-[#000000] text-[20px] font-semibold leading-[1.2] -tracking-[0.4px] mb-[12px]">Agent-Ready API</h3>
          <p className="text-[#333333] text-[16px] leading-[1.4] -tracking-[0.16px]">Use our MCP-compatible API layer to instantly connect your patient data to AI agents and external tools.</p>
        </motion.div>
      </div>
    </section>
  );
}
