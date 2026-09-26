'use client';

import { motion } from 'motion/react';

import type { Job } from '@/generated/prisma/client';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

const JobCard = ({ job, onClick }: JobCardProps) => {
  return (
    <motion.div
      layout="position"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="flex cursor-pointer flex-col gap-0.5 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:border-primary-200 hover:shadow-md"
      onClick={onClick}
    >
      <p className="text-sm font-semibold text-zinc-900">{job.company}</p>
      <p className="text-sm text-zinc-600">{job.title}</p>

      {job.appliedAt && (
        <p className="mt-1 text-xs text-zinc-400 tabular-nums">
          Applied {job.appliedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}

      {job.notes && (
        <p className="mt-1.5 truncate border-t border-zinc-100 pt-1.5 text-xs text-zinc-500">
          {job.notes}
        </p>
      )}
    </motion.div>
  );
};

export default JobCard;
