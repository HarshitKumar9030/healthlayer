"use client";

import Link from "next/link";
import { motion } from "motion/react";

export function Footer() {
  return (
    <footer className="bg-[#ffffff] py-8 px-4 border-t border-neutral-200/50 rounded-t-2xl">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-6 h-6 bg-[#f1ccff] rounded-[10px]"
            />
            <span className="font-serif text-[#000000] text-[20px] leading-[1] -tracking-[0.4px]">
              HealthLayer
            </span>
          </div>
          <span className="text-[#7b7b7b] text-[13px] md:hidden">© {new Date().getFullYear()}</span>
        </div>

        <nav className="flex gap-6 md:gap-8 items-center flex-wrap justify-center">
          <motion.div whileHover={{ y: -1 }}>
            <Link href="#features" className="text-[#333333] hover:text-[#000000] text-[14px] font-medium transition-colors">Features</Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/privacy" className="text-[#333333] hover:text-[#000000] text-[14px] font-medium transition-colors">Privacy</Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/terms" className="text-[#333333] hover:text-[#000000] text-[14px] font-medium transition-colors">Terms</Link>
          </motion.div>
          <motion.div whileHover={{ y: -1 }}>
            <Link href="/contact" className="text-[#333333] hover:text-[#000000] text-[14px] font-medium transition-colors">Contact</Link>
          </motion.div>
        </nav>
        
        <span className="text-[#7b7b7b] text-[13px] hidden md:block">© {new Date().getFullYear()} HealthLayer.</span>
      </div>
    </footer>
  );
}
