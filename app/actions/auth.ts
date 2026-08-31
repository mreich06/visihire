'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
export type FormState = {
  error: string | null;
};

const schema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.email(),
  password: z.string().min(8),
});

export const registerUser = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  const parsed = schema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') });

  if (!parsed.success) return { error: 'Check your details and try again' };

  const emailExisting = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (emailExisting) {
    return { error: 'An account with that email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.user.create({ data: { name: parsed.data.name, email: parsed.data.email, hashedPassword } });

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: '/application-board',
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Account created, but sign-in failed. Try logging in.' };
    throw error;
  }
};

export const loginAction = async (prevState: FormState, formData: FormData): Promise<FormState> => {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/application-board',
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Invalid email or password' };
    throw error;
  }
};

export const logoutAction = async () => {
  await signOut({ redirectTo: '/login' });
};
