"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from 'next/link';
import { motion } from "motion/react";

export function CTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-[116px]">
      <div 
        ref={containerRef}
        className="bg-[#f1ccff] rounded-[42px] p-[60px] text-center flex flex-col items-center justify-center shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px]"
      >
        <h2 className="text-[#000000] font-serif text-[48px] leading-[1.25] mb-[24px]">Start building today.</h2>
        <p className="text-[#000000] text-[20px] leading-[1.43] -tracking-[0.020em] max-w-xl mx-auto mb-[40px]">
          Join thousands of developers using HealthLayer to bridge the gap between legacy medical systems and modern AI agents.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href="/sign-up" className="bg-[#000000] text-[#ffffff] px-[32px] py-[18px] rounded-[10px] text-[20px] leading-[1.2] -tracking-[0.4px] font-semibold hover:bg-[#333333] transition-colors shadow-[rgba(16,24,40,0.05)_0px_1px_2px_0px] inline-block">
            Create free account
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
