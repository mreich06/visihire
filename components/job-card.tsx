import type { Job } from '@/generated/prisma/client';

const JobCard = ({ job }: { job: Job }) => {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow">
      <p className="text-sm font-semibold text-gray-900">{job.company}</p>
      <p className="text-sm text-gray-600">{job.title}</p>

      {job.appliedAt && (
        <p className="mt-1 text-xs text-gray-400 tabular-nums">
          Applied{' '}
          {job.appliedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}

      {job.notes && (
        <p className="mt-1.5 truncate border-t border-gray-100 pt-1.5 text-xs text-gray-500">
          {job.notes}
        </p>
      )}
    </div>
  );
};

export default JobCard;
