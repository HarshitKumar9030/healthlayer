import { Footer } from "@/components/landing/Footer";
import { Nav } from "@/components/landing/Nav";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-[40px] md:text-[56px] font-bold text-[#2C2C2C] leading-tight tracking-[-1.6px] mb-8">Terms of Service</h1>
        
        <div className="text-[#4A4A4A] space-y-8">
          <p className="text-[18px] leading-[1.6]">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">1. Not Medical Advice</h2>
            <p className="text-[16px] leading-[1.6]">HealthLayer is an AI-powered tool for organizing and summarizing medical records. It does not provide medical diagnosis, treatment, or advice. Always consult with a qualified healthcare professional before making any healthcare decisions based on insights from this application.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">2. Accuracy of Data</h2>
            <p className="text-[16px] leading-[1.6]">While we use advanced Optical Character Recognition (OCR) and Large Language Models (LLMs) to parse your reports, we cannot guarantee 100% accuracy. You are absolutely responsible for verifying the extracted metrics against your original printed records.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">3. Account Security</h2>
            <p className="text-[16px] leading-[1.6]">You are responsible for safeguarding your account credentials and API keys. Any actions taken using your API key are assumed to be authorized by you. If you suspect your key has been compromised, you must immediately generate a new one from your dashboard.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">4. Acceptable Use</h2>
            <p className="text-[16px] leading-[1.6]">You agree to only upload your own personal health records, or the records of someone you are legally authorized to manage. You may not use HealthLayer to store illegal content or attempt to exploit the application's infrastructure.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}