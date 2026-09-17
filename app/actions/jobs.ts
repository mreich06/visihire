'use server';

import { JobStatus } from '@/generated/prisma/enums';
import { requireUser } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { FormState } from './auth';

const schema = z.object({
  company: z.string().trim().min(1),
  title: z.string().trim().min(1),
  url: z
    .url()
    .or(z.literal(''))
    .optional()
    .transform((v) => v || undefined),
  jdText: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const moveJob = async (jobId: string, toStatus: JobStatus, orderIds: string[]): Promise<void> => {
  const user = await requireUser();

  const job = await db.job.findUnique({ where: { id: jobId } });

  if (!job || job.userId !== user.id) {
    throw new Error('Job not found');
  }

  // change the ordered list for the columns
  // $transaction - all writes succeed or none do
  // update the changed card, then re-order the cards in that column
  await db.$transaction([
    db.job.update({ where: { id: jobId, userId: user.id }, data: { status: toStatus } }),
    ...orderIds.map((id, index) => db.job.update({ where: { id, userId: user.id }, data: { position: index } })),
  ]);

  revalidatePath('/application-board');
};

export const createJob = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireUser();
  const parsed = schema.safeParse({
    company: formData.get('company'),
    title: formData.get('title'),
    url: formData.get('url'),
    jdText: formData.get('jdText'),
    notes: formData.get('notes'),
  });

  if (!parsed.success) {
    return { error: 'Please fill in all fields correctly' };
  }

  // Get length of the items in WISHLIST
  const position = await db.job.count({ where: { userId: user.id, status: 'WISHLIST' } });

  // add new job to the end of the wishlist
  await db.job.create({ data: { ...parsed.data, userId: user.id, position: position } });

  revalidatePath('/application-board');

  return { error: null };
};

export const updateJob = async (jobId: string, prevState: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireUser();
  const parsed = schema.safeParse({
    company: formData.get('company'),
    title: formData.get('title'),
    url: formData.get('url'),
    jdText: formData.get('jdText'),
    notes: formData.get('notes'),
  });

  if (!parsed.success) {
    return { error: 'Please fill in all fields correctly' };
  }

  await db.job.update({
    where: {
      id: jobId,
      userId: user.id,
    },
    data: parsed.data,
  });

  revalidatePath('/application-board');

  return { error: null };
};

export const deleteJob = async (jobId: string): Promise<void> => {
  const user = await requireUser();

  await db.job.delete({ where: { id: jobId, userId: user.id } });

  revalidatePath('/application-board');
};
