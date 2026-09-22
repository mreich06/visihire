'use client';

import { useState } from 'react';
import { Briefcase, FileText } from 'lucide-react';

import { ResumeSourceTabs } from '@/components/resume-source-tabs';
import { TargetJobPanel } from '@/components/resume-checker/target-job-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Job, Resume } from '@/generated/prisma/client';
import { LoadingModal } from '@/components/ui/loading-modal';

interface AuditFormProps {
  jobs: Job[];
  resumes: Resume[];
}
const AuditForm = ({ jobs, resumes }: AuditFormProps) => {
  const [scoring, setScoring] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleGetScore = async () => {
    setScoring(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResume?.id, jobId: selectedJob?.id }),
      });
      const audit = await res.json();
      console.log('audit', audit);
    } finally {
      setScoring(false);
    }
  };
  return (
    <>
      <Card className="w-full max-w-5xl p-6 text-left">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-zinc-900">Choose your resume</p>
            </div>
            <ResumeSourceTabs resumes={resumes} selected={selectedResume} setSelected={setSelectedResume} />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-zinc-900">Target job</p>
              <Badge>Optional</Badge>
            </div>
            <TargetJobPanel jobs={jobs} selected={selectedJob} setSelected={setSelectedJob} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" onClick={() => handleGetScore()}>
            Get my ATS score
          </Button>
        </div>
      </Card>
      <LoadingModal open={scoring} />
    </>
  );
};

export default AuditForm;
