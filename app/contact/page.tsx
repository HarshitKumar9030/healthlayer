import { Footer } from "@/components/landing/Footer";
import { Nav } from "@/components/landing/Nav";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      <Nav />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-16 md:py-24">
        <h1 className="text-[40px] md:text-[56px] font-bold text-[#2C2C2C] leading-tight tracking-[-1.6px] mb-8">Contact Us</h1>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E5E5E5] shadow-sm">
          <p className="text-[18px] text-[#4A4A4A] leading-[1.6] mb-8">
            Have questions, feedback, or need support? We'd love to hear from you. 
          </p>

          <div className="space-y-6 text-[#4A4A4A]">
            <div>
              <h2 className="text-[14px] uppercase tracking-wider font-semibold text-[#8B8B8B] mb-2">Email Support</h2>
              <a href="mailto:hello@healthlayer.com" className="text-[#2C2C2C] font-semibold text-[20px] hover:text-[#2A3F5C] transition-colors">
                hello@healthlayer.com
              </a>
            </div>

            <div className="pt-4 border-t border-[#F0F0F0]">
              <h2 className="text-[14px] uppercase tracking-wider font-semibold text-[#8B8B8B] mb-2">Developer Inquiries & MCP</h2>
              <p className="text-[16px] leading-relaxed">
                For questions related to the Model Context Protocol (MCP), FHIR integrations, or API access, please reach out to the support email above with the subject line <strong>[Developer API]</strong>.
              </p>
            </div>
            
            <div className="pt-4 border-t border-[#F0F0F0]">
              <h2 className="text-[14px] uppercase tracking-wider font-semibold text-[#8B8B8B] mb-2">Data & Privacy Requests</h2>
              <p className="text-[16px] leading-relaxed">
                If you wish to request an entire export of your health data, or if you would like your account and all associated documents permanently deleted, please email us referencing the email address connected to your account.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}