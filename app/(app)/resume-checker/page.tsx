import { requireUser } from '@/lib/auth-guard';
import { getJobs } from '@/lib/jobs';
import { getResumes } from '@/lib/resumes';
import AuditForm from './audit-form';

const Page = async () => {
  const user = await requireUser();
  const resumes = await getResumes(user.id);
  const jobs = await getJobs(user.id);

  return (
    <div className="flex flex-col items-center gap-2">
      <AuditForm resumes={resumes} jobs={jobs} />
    </div>
  );
};

export default Page;
