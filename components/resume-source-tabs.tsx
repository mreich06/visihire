'use client';

import { FileText, Upload } from 'lucide-react';
import { useState } from 'react';

import { ResumeUpload } from '@/components/resume-upload';
import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { cn } from '@/lib/cn';
import type { Resume } from '@/generated/prisma/client';

interface ResumeSourceTabsProps {
  resumes: Resume[];
}

type Tab = 'upload' | 'saved';

const TABS: { id: Tab; label: string; icon: typeof Upload }[] = [
  { id: 'upload', label: 'Upload PDF', icon: Upload },
  { id: 'saved', label: 'Use a saved resume', icon: FileText },
];

export const ResumeSourceTabs = ({ resumes }: ResumeSourceTabsProps) => {
  const [tab, setTab] = useState<Tab>('upload');
  const [selected, setSelected] = useState<Resume | null>(null);

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
              tab === id ? 'border-primary-600 text-primary-600' : 'border-transparent text-zinc-500 hover:text-zinc-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="pt-4">
        {tab === 'upload' ? (
          <ResumeUpload resumeFileName={null} resumeText={null} withFile={false} />
        ) : resumes.length > 0 ? (
          <Dropdown label={selected ? selected.title : 'Choose a saved resume'}>
            {resumes.map((resume) => (
              <DropdownItem key={resume.id} onClick={() => setSelected(resume)}>
                {resume.title}
              </DropdownItem>
            ))}
          </Dropdown>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
            No saved resumes yet. Upload one to save it here.
          </p>
        )}
      </div>
    </div>
  );
};
