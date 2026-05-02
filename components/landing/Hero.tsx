"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <section className="w-full max-w-[1200px] px-4 pt-[116px] pb-[80px] flex flex-col items-center text-center">
      <div ref={containerRef}>
        <h1 className="text-[#000000] font-serif text-[62px] leading-[1.3] max-w-4xl mx-auto mb-[24px]">
          Understand your health data. <span className="text-[#7b7b7b]">Instantly.</span>
        </h1>
        
        <p className="text-[#333333] text-[20px] leading-[1.43] -tracking-[0.020em] max-w-2xl mx-auto mb-[56px]">
          Upload your unstructured medical reports and blood tests. We&apos;ll automatically extract, structure, and make them queryable for you and your AI agents.
        </p>
        
        <div className="flex gap-4 items-center justify-center mb-[88px]">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/sign-up" className="bg-[#f1ccff] border border-[#f1ccff] text-[#000000] px-[20px] py-[13px] rounded-[10px] text-[16px] leading-[1.4] -tracking-[0.16px] font-semibold hover:opacity-90 transition-opacity inline-block shadow-[rgba(16,24,40,0.05)_0px_1px_2px_0px]">
              Get Started for Free
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="#demo" className="bg-transparent border border-[#000000] text-[#000000] px-[20px] py-[13px] rounded-[0px] text-[16px] leading-[1.4] -tracking-[0.16px] font-medium hover:bg-[#000000] hover:text-[#ffffff] transition-colors inline-block">
              See how it works
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
