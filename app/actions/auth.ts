'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

export type FormState = {
  error: string | null;
};

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.email(),
  password: z.string().min(8),
});

export async function registerUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = schema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') });

  if (!parsed.success) return { error: 'Check your details and try again' };

  const emailExisting = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (emailExisting) {
    return { error: 'An account with that email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, hashedPassword } });

  redirect('/login?registered=1');
}
