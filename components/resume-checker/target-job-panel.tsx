'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Dropdown, DropdownItem } from '@/components/ui/dropdown';
import { Input, Textarea } from '@/components/ui/input';
import type { Job } from '@/generated/prisma/client';

interface TargetJobPanelProps {
  jobs: Job[];
}

const MAX_RESULTS = 6;

export const TargetJobPanel = ({ jobs }: TargetJobPanelProps) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Job | null>(null);
  const [title, setTitle] = useState('');
  const [jdText, setJdText] = useState('');

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pool = query ? jobs.filter((job) => job.company.toLowerCase().includes(query) || job.title.toLowerCase().includes(query)) : jobs;
    return pool.slice(0, MAX_RESULTS);
  }, [jobs, search]);

  const selectJob = (job: Job) => {
    setSelected(job);
    setTitle(job.title);
    setJdText(job.jdText ?? '');
  };

  return (
    <div className="flex flex-col gap-3">
      {jobs.length > 0 && (
        <Dropdown label={selected ? `${selected.company} — ${selected.title}` : 'Fill from a tracked job (optional)'}>
          <div className="border-b border-zinc-100 p-2">
            <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-2 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company or title"
                className="w-full text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>

          {results.length > 0 ? (
            results.map((job) => (
              <DropdownItem key={job.id} onClick={() => selectJob(job)}>
                <span className="font-medium text-zinc-900">{job.company}</span>
                <span className="text-zinc-400">·</span>
                <span className="truncate text-zinc-500">{job.title}</span>
              </DropdownItem>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-zinc-400">No jobs match that search.</p>
          )}
        </Dropdown>
      )}

      <Input name="jobTitle" type="text" placeholder="Target job title" value={title} onChange={(event) => setTitle(event.target.value)} />
      <Textarea
        name="jobDescription"
        placeholder="Job description"
        className="min-h-30"
        value={jdText}
        onChange={(event) => setJdText(event.target.value)}
      />
    </div>
  );
};
