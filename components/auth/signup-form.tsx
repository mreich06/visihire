'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { registerUser, type FormState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const initialState: FormState = { error: null };

export const SignupForm = () => {
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  return (
    <FadeIn className="w-full max-w-sm">
      <Card className="p-6">
        <form action={formAction} className="flex flex-col gap-4">
          <h1 className="text-xl font-semibold text-zinc-900">Create your account</h1>

          <Field label="Name">
            <Input name="name" type="text" autoComplete="name" />
          </Field>

          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>

          <Field label="Password">
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>

          {state.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Creating…' : 'Sign up'}
          </Button>

          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </Card>
    </FadeIn>
  );
};
