"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAuth, UserButton } from "@clerk/nextjs";

export function Nav() {
  const navRef = useRef<HTMLHeadingElement>(null);
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <header
      ref={navRef}
      className="w-[calc(100%-2rem)] md:w-full max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-6 flex justify-between items-center fixed top-4 rounded-[16px] border border-neutral-200/50 left-[1rem] md:left-0 right-[1rem] md:right-0 z-50 bg-white/60 backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 90 }}
          className="w-6 h-6 bg-[#f1ccff] rounded-[10px]"
        ></motion.div>
        <span className="font-semibold text-[#000000] text-[18px] md:text-[20px] leading-[1.2] -tracking-[0.4px]">
          HealthLayer
        </span>
      </div>
      <nav className="flex gap-3 md:gap-4 items-center">
        {isLoaded && !userId && (
          <>
            <Link
              href="/sign-in"
              className="text-[#333333] hover:text-[#000000] text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.16px] font-medium transition-colors"
            >
              Log in
            </Link>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Link
                href="/sign-up"
                className="bg-[#000000] text-[#ffffff] px-4 md:px-5 py-2 md:py-2.5 rounded-[10px] text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.16px] font-medium hover:bg-[#333333] transition-colors shadow-sm"
              >
                Sign up
              </Link>
            </motion.div>
          </>
        )}
        {isLoaded && userId && (
          <>
            <Link
              href="/dashboard"
              className="text-[#333333] hover:text-[#000000] text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.16px] font-medium transition-colors mr-2"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-[36px] h-[36px] rounded-[10px]",
                },
              }}
            />
          </>
        )}
      </nav>
    </header>
  );
}
