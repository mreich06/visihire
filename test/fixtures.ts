import type { Job } from '@/generated/prisma/client';

export const makeJob = (overrides?: Partial<Job>): Job => ({
  id: '1',
  userId: 'u1',
  company: 'Stripe',
  title: 'Software Engineer',
  url: null,
  jdText: null,
  status: 'APPLIED',
  position: 0,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  appliedAt: null,
  ...overrides,
});
