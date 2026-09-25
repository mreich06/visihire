'use client';

import { useState } from 'react';
import { Briefcase, FileText, Printer } from 'lucide-react';

import { ResumeSourceTabs } from '@/components/resume-source-tabs';
import { TargetJobPanel } from '@/components/resume-checker/target-job-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Audit, Job, Resume } from '@/generated/prisma/client';
import { LoadingModal, StatusType } from '@/components/ui/loading-modal';
import AuditResults from '@/components/ui/audit-results';
import CheckerDescription from '@/components/resume-checker/checker-description';
import OutreachCta from '@/components/resume-checker/outreach-cta';
import { AuditResult } from '@/lib/audit';

// /api/audit returns the raw Prisma Audit row: score sits at the top
// level, everything else (summary, keywords, checks, ...) is nested under
// result. This is what actually comes back, as opposed to the flat
// AuditResult shape the rest of the UI is built around.
type AuditApiResponse = Omit<Audit, 'result'> & { result: Omit<AuditResult, 'score'> };

interface AuditFormProps {
  jobs: Job[];
  resumes: Resume[];
}
const AuditForm = ({ jobs, resumes }: AuditFormProps) => {
  const [scoring, setScoring] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState(false);

  const status: StatusType = scoring ? 'loading' : result ? 'success' : error ? 'error' : 'idle';

  const handleGetScore = async () => {
    setScoring(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResume?.id, jobId: selectedJob?.id }),
      });
      if (res.ok) {
        const raw: AuditApiResponse = await res.json();
        setResult({ ...raw.result, score: raw.score });
      } else {
        setError(true);
      }
    } finally {
      setScoring(false);
    }
  };
  return (
    <>
      <div className="mb-3 flex w-full max-w-5xl items-start justify-between gap-4">
        <div className="text-left">
          <h1 className="text-xl font-semibold text-zinc-900">Resume Checker</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">
            Get a free ATS check of your resume on its own, or match it against a job posting. Paste a job description in or pick from your saved
            jobs.
          </p>
        </div>

        {result && (
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
      </div>

      {result ? (
        <AuditResults
          audit={result}
          onCheckAnother={() => setResult(null)}
          onSaveToJob={
            selectedJob
              ? () => {
                  // TODO: no backend yet for saving an audit to a job's
                  // records (cover letters/messages live there too) - wire
                  // this up once that model exists.
                  console.log('save audit to job', selectedJob.id);
                }
              : undefined
          }
        />
      ) : (
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
      )}

      {!result && <CheckerDescription />}

      <OutreachCta />

      <LoadingModal
        open={scoring}
        status={status}
        title={status === 'error' ? 'Your resumé could not be evaluated' : undefined}
        description={status === 'error' ? 'Please try again.' : undefined}
      />
    </>
  );
};

export default AuditForm;
