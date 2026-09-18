import 'server-only';

import { db } from '@/lib/db';

export const getProfile = (userId: string) => {
  return db.profile.findUnique({ where: { userId } });
};
