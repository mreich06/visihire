import { JobStatus } from '@/generated/prisma/enums';
import { db } from './db';

export const getJobs = async (userId: string) => {
  return db.job.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
};

export const getBoardJobs = async (userId: string) => {
  // return in ascending  so cards come back in column order

  const rows = await db.job.findMany({ where: { userId }, orderBy: { position: 'asc' } });

  const grouped: Record<JobStatus, typeof rows> = {
    WISHLIST: [],
    APPLIED: [],
    INTERVIEWING: [],
    OFFER: [],
    REJECTED: [],
  };

  // fill grouped with jobs, categorized by job status
  for (const job of rows) grouped[job.status].push(job);

  return grouped;
};
