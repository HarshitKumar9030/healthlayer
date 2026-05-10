'use client';

import { useState, useRef } from 'react';
import { uploadAndProcessReport } from '@/actions/upload';
import { useRouter } from 'next/navigation';

interface FileStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileStatus[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const fileArray = Array.from(selectedFiles);
    if (fileArray.length === 0) return;

    const newFiles: FileStatus[] = fileArray.map((file) => ({
      file,
      status: 'pending' as const,
    }));

    setFiles(newFiles);
    setUploading(true);

    let hasSuccess = false;

    for (let i = 0; i < newFiles.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'uploading' } : f))
      );

      try {
        const formData = new FormData();
        formData.append('file', newFiles[i].file);

        const res = await uploadAndProcessReport(formData);

        if (res.success) {
          
          hasSuccess = true;
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'success' } : f))
          );
        } else {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'error', error: res.error || 'Failed' } : f
            )
          );
        }
      } catch (err: unknown) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: 'error', error: err instanceof Error ? err.message : 'Unexpected error' }
              : f
          )
        );
      }
    }

    setUploading(false);

    if (hasSuccess) {
      router.refresh();
      // Clear list after a short delay so user sees the results
      setTimeout(() => setFiles([]), 3000);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (idx: number) => {
    if (uploading) return;
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const allDone = files.length > 0 && files.every((f) => f.status === 'success' || f.status === 'error');
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
          isDragging ? 'border-[#f1ccff] bg-[#fdf5ff]' : 'border-[#d6d6d6] bg-white'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{ boxShadow: 'rgba(0, 0, 0, 0.04) 0px 8px 16px 0px' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          accept=".pdf,image/png,image/jpeg,image/webp"
          multiple
        />
        {uploading && files.length > 0 ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <svg className="w-5 h-5 animate-spin text-[#6B85A8]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-[#333333] font-medium text-lg leading-[1.4] tracking-[-0.02em] font-sans">
                Processing {files.filter(f => f.status === 'uploading').length > 0
                  ? `report ${files.findIndex(f => f.status === 'uploading') + 1} of ${files.length}`
                  : 'reports'}…
              </p>
            </div>
            <p className="text-[#7b7b7b] text-sm">This may take a moment per file</p>
          </div>
        ) : (
          <>
            <svg className="w-12 h-12 text-[#91e0ff] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <p className="text-[#000000] font-semibold text-xl leading-[1.2] tracking-[-0.02em] font-sans text-center mb-2">Drop your medical reports here</p>
            <p className="text-[#7b7b7b] text-[16px] leading-[1.4] tracking-[-0.16px] font-sans text-center">or click to browse — PDF, PNG, JPG · <span className="font-medium text-[#6B85A8]">multiple files supported</span></p>
          </>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-[20px] border border-[#eee] overflow-hidden" style={{ boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 12px 0px' }}>
          <div className="px-5 py-3 border-b border-[#f0f0f0] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#333]">
              {allDone
                ? `${successCount} uploaded${errorCount > 0 ? `, ${errorCount} failed` : ''}`
                : `${files.length} file${files.length > 1 ? 's' : ''}`
              }
            </span>
            {!uploading && files.length > 0 && (
              <button
                onClick={() => setFiles([])}
                className="text-xs text-[#999] hover:text-[#666] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="divide-y divide-[#f5f5f5]">
            {files.map((f, idx) => (
              <li key={`${f.file.name}-${idx}`} className="px-5 py-3 flex items-center gap-3">
                {/* Status icon */}
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: f.status === 'success' ? '#EAF6ED'
                      : f.status === 'error' ? '#FFF0F0'
                      : f.status === 'uploading' ? '#E8F0FE'
                      : '#f5f5f5'
                  }}
                >
                  {f.status === 'success' && '✓'}
                  {f.status === 'error' && '✕'}
                  {f.status === 'uploading' && (
                    <svg className="w-4 h-4 animate-spin text-[#6B85A8]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {f.status === 'pending' && '📄'}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#333] truncate">{f.file.name}</p>
                  <p className="text-xs text-[#999]">
                    {f.status === 'uploading' && 'Processing…'}
                    {f.status === 'success' && 'Uploaded & analyzed'}
                    {f.status === 'error' && (
                      <span className="text-red-400">{f.error || 'Failed'}</span>
                    )}
                    {f.status === 'pending' && formatSize(f.file.size)}
                  </p>
                </div>

                {/* Remove button (only when not uploading) */}
                {!uploading && f.status !== 'uploading' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="shrink-0 text-[#ccc] hover:text-[#999] transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}