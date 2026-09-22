import { requireUser } from '@/lib/auth-guard';
import { getJobs } from '@/lib/jobs';
import { getResumes } from '@/lib/resumes';
import CheckerDescription from '@/components/resume-checker/checker-description';
import AuditForm from './audit-form';

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

      <AuditForm resumes={resumes} jobs={jobs} />
      <CheckerDescription />
    </div>
  );
};

export default Page;
