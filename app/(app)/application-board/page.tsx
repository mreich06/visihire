import type { JobStatus } from '@/generated/prisma/enums';
import JobCard from '@/components/job-card';
import { requireUser } from '@/lib/auth-guard';
import { getBoardJobs } from '@/lib/jobs';

const COLUMNS: { status: JobStatus; label: string }[] = [
  { status: 'WISHLIST', label: 'Wishlist' },
  { status: 'APPLIED', label: 'Applied' },
  { status: 'INTERVIEWING', label: 'Interviewing' },
  { status: 'OFFER', label: 'Offer' },
  { status: 'REJECTED', label: 'Rejected' },
];

const Page = async () => {
  const user = await requireUser();
  const jobs = await getBoardJobs(user.id);

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Application Board</h1>

      <div className="flex gap-4 pb-4">
        {COLUMNS.map(({ status, label }) => (
          <section key={status} className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-600">{label}</h2>
              <span className="rounded-full border border-gray-200 bg-white px-1.5 text-xs text-gray-400 tabular-nums">{jobs[status].length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {jobs[status].map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Page;
