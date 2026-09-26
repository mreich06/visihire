'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth-guard';
import { db } from '@/lib/db';
import { extractPdfText } from '@/lib/pdf';
import type { Resume } from '@/generated/prisma/client';

export type FormState = { error: string | null; resume?: Resume };

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export const uploadResume = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  const user = await requireUser();
  const file = formData.get('resume');

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Choose a PDF file to upload.' };
  }

  if (file.type !== 'application/pdf') {
    return { error: 'Only PDF files are supported.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'File is too large. Max size is 8MB.' };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const resumeText = await extractPdfText(buffer);

  if (!resumeText) {
    return { error: "Couldn't read any text from that PDF. Try a different file." };
  }

  const title = file.name.replace(/\.pdf$/i, '');

  const resume = await db.resume.create({
    data: { userId: user.id, title, text: resumeText, resumeFileName: file.name },
  });

  revalidatePath('/profile');
  revalidatePath('/resume-checker');
  return { error: null, resume };
};
