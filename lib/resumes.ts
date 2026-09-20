import 'server-only';

import { db } from '@/lib/db';

export const getResumes = (userId: string) => {
  return db.resume.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
};
