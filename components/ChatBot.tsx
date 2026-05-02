'use client';

import { useState } from 'react';
import { askHealthData } from '@/actions/query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatBot() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const answer = await askHealthData(query);
      setResponse(answer);
    } catch (err) {
      console.error(err);
      setResponse('Failed to query health data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#ffffff] border border-[#d6d6d6] p-10 rounded-3xl mt-7.5 font-sans">
      <h2 className="text-[#000000] text-[32px] font-bold leading-[1.44] tracking-[-0.8px] mb-6">Ask Your Data</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          className="flex-1 border border-[#d6d6d6] rounded-[10px] px-4 py-3 text-[16px] text-[#333333] focus:outline-none focus:border-[#000000]"
          placeholder="Ask a question about your recent lab results..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#f1ccff] text-[#000000] px-6 py-3 rounded-[10px] font-medium text-[16px] hover:bg-[#e8bdf8] transition-colors"
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>

      {response && (
        <div className="mt-8 p-6 bg-[#f5f2f0] rounded-2xl border border-[#d6d6d6]">
          <div className="text-[#333333] leading-[1.6] tracking-[-0.16px] [&>p]:mb-4 [&>h1]:text-[24px] [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-[20px] [&>h2]:font-bold [&>h2]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>li]:mb-2 [&>strong]:text-[#000000] [&>strong]:font-semibold last:[&>p]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}