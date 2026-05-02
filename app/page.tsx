import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf9f8] selection:bg-[#f1ccff] selection:text-[#000000]">
      <Nav />
      
      <main className="pt-[140px] pb-[80px] flex flex-col items-center justify-center space-y-[80px]">
        <Hero />
        <ProblemSolution />
        <Features />
        <CTA />
      </main>
      
      <Footer />
    </div>
  );
}
