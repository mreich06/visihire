import { Briefcase, FileText } from 'lucide-react';

import { ResumeSourceTabs } from '@/components/resume-source-tabs';
import { TargetJobPanel } from '@/components/resume-checker/target-job-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { requireUser } from '@/lib/auth-guard';
import { getJobs } from '@/lib/jobs';
import { getResumes } from '@/lib/resumes';
import CheckerDescription from '@/components/resume-checker/checker-description';

const Page = async () => {
  const user = await requireUser();
  const resumes = await getResumes(user.id);
  const jobs = await getJobs(user.id);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Resume Checker</h1>
      <p className="mb-5 max-w-2xl text-sm text-zinc-500">
        Get a free ATS check of your resume on its own, or match it against a job posting. Paste a job description in or pick from your saved jobs.
      </p>

      <Card className="w-full max-w-5xl p-6 text-left">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-zinc-900">Choose your resume</p>
            </div>
            <ResumeSourceTabs resumes={resumes} />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-600" />
              <p className="text-sm font-semibold text-zinc-900">Target job</p>
              <Badge>Optional</Badge>
            </div>
            <TargetJobPanel jobs={jobs} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit">Get my ATS score</Button>
        </div>
      </Card>
      <CheckerDescription />
    </div>
  );
};

export default Page;
