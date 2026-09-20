'use client';

import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';

import { ResumeUpload } from '@/components/resume-upload';
import { cn } from '@/lib/cn';

interface ResumeSourceTabsProps {
  resumeFileName: string | null;
  resumeText: string | null;
}

type Tab = 'upload' | 'saved';

const TABS: { id: Tab; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Upload PDF', icon: Upload },
  { id: 'saved', label: 'Use a saved resume', icon: FileText },
];

export const ResumeSourceTabs = ({ resumeFileName, resumeText }: ResumeSourceTabsProps) => {
  const [tab, setTab] = useState<Tab>('upload');

  return (
    <div>
      <div className="flex gap-4 border-b border-zinc-200 text-sm font-medium">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 border-b-2 px-1 pb-2 transition-colors',
              tab === id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {tab === 'upload' ? (
          <ResumeUpload resumeFileName={resumeFileName} resumeText={resumeText} withFile={false} />
        ) : resumeFileName ? (
          <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{resumeFileName}</p>
              {resumeText && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{resumeText}</p>}
            </div>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
            No saved resume yet. Upload one on your profile page first.
          </p>
        )}
      </div>
    </div>
  );
};
