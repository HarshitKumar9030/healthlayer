import { Footer } from "@/components/landing/Footer";
import { Nav } from "@/components/landing/Nav";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-[40px] md:text-[56px] font-bold text-[#2C2C2C] leading-tight tracking-[-1.6px] mb-8">Privacy Policy</h1>
        
        <div className="text-[#4A4A4A] space-y-8">
          <p className="text-[18px] leading-[1.6]">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">1. Data Storage & Security</h2>
            <p className="text-[16px] leading-[1.6]">Your health data is sensitive. We use enterprise-grade encryption to ensure your medical reports and observations remain secure. Your data is stored securely in MongoDB and isolated strictly by your user ID.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">2. AI Processing</h2>
            <p className="text-[16px] leading-[1.6]">We use Google Gemini to process uploaded medical reports and extract structured data. This data is processed temporarily during extraction and is not used to train global AI models without your explicit consent.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">3. Third-Party Integrations</h2>
            <p className="text-[16px] leading-[1.6]">Our capabilities are exposed via the Model Context Protocol (MCP). If you connect external agents (such as Prompt Opinion) using your API key, you are authorizing those agents to access your health data according to their respective privacy terms.</p>
          </section>

          <section>
            <h2 className="text-[24px] font-semibold text-[#2C2C2C] mb-4">4. FHIR Protocol</h2>
            <p className="text-[16px] leading-[1.6]">If you authorize SHARP extensions, we temporarily utilize your FHIR server credentials to fetch context for risk analysis. We do not permanently store your FHIR tokens beyond your active session scope.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}