export function ProblemSolution() {
  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-[80px] flex flex-col gap-[30px]">
      {/* Alternating text-left/visual-right pattern */}
      <div className="flex flex-col md:flex-row gap-[60px] items-center bg-[#ffffff] p-[40px] md:p-[60px] rounded-[42px] shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px]">
        <div className="flex-1">
          <div className="inline-block px-3 py-1 border border-[#d6d6d6] rounded-[10px] text-[#333333] font-semibold text-[13px] mb-[20px] tracking-widest uppercase">THE PROBLEM</div>
          <h2 className="text-[#000000] font-serif text-[48px] leading-[1.25] mb-[24px]">Medical data is trapped in messy documents.</h2>
          <p className="text-[#333333] text-[20px] leading-[1.43] -tracking-[0.020em]">For decades, patient records have been locked inside scanned PDFs, faxes, and unreadable formats. AI agents cannot safely or deterministically read this data without a dedicated parsing layer.</p>
        </div>
        <div className="flex-1 w-full bg-[#f5f2f0] rounded-[24px] h-[300px] border border-[#d6d6d6] flex items-center justify-center p-8 overflow-hidden font-mono text-[13px] text-[#7b7b7b] leading-tight select-none relative">
          <svg className="w-[100px] h-[100px] absolute opacity-10 text-[#d6d6d6] left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          <div className="blur-[2px] opacity-60">
            PATIENT: JOHN DOE<br/>
            DOB: 01/01/1980<br/>
            <br/>
            HEMOGLOBIN... 14.2 g/dL (Ref: 13.8-17.2)<br/>
            CHOLESTEROL .... 210 mg/dL *HIGH*<br/>
            <br/>
            [ SCANNED DOC 48592 - UNREADABLE ]
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-[60px] items-center bg-[#ffffff] p-[40px] md:p-[60px] rounded-[42px] shadow-[rgba(0,0,0,0.04)_0px_8px_16px_0px]">
        <div className="flex-1 w-full order-2 md:order-1 bg-[#282c34] rounded-[24px] h-[300px] flex items-center justify-start p-8 overflow-hidden font-mono text-[14px] text-[#abb2bf] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <pre><code>
<span className="text-[#c678dd]">const</span> <span className="text-[#e5c07b]">HealthData</span> = {'{'}
<br/>  <span className="text-[#e06c75]">"patient_id"</span>: <span className="text-[#98c379]">"usr_8f2a"</span>,
<br/>  <span className="text-[#e06c75]">"observations"</span>: [
<br/>    {'{'}
<br/>      <span className="text-[#e06c75]">"name"</span>: <span className="text-[#98c379]">"Cholesterol"</span>,
<br/>      <span className="text-[#e06c75]">"value"</span>: <span className="text-[#d19a66]">210</span>,
<br/>      <span className="text-[#e06c75]">"flag"</span>: <span className="text-[#e06c75]">"high"</span>
<br/>    {'}'}
<br/>  ]
<br/>{'}'}
          </code></pre>
        </div>
        <div className="flex-1 order-1 md:order-2 md:text-right flex flex-col md:items-end">
          <div className="inline-block px-3 py-1 border border-[#f1ccff] bg-[#fdf5ff] rounded-[10px] text-[#000000] font-semibold text-[13px] mb-[20px] tracking-widest uppercase">THE SOLUTION</div>
          <h2 className="text-[#000000] font-serif text-[48px] leading-[1.25] mb-[24px]">Structured JSON schemas.</h2>
          <p className="text-[#333333] text-[20px] leading-[1.43] -tracking-[0.020em]">HealthLayer instantly digitizes these documents using advanced Vision OCR, converting unreadable faxes into deterministic, beautifully typed JSON that your RAG pipeline or MCP agent can instantly ingest.</p>
        </div>
      </div>
    </section>
  );
}