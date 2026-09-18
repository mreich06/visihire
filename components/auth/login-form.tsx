'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { loginAction, type FormState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/fade-in';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const initialState: FormState = { error: null };

export const LoginForm = ({ justRegistered }: { justRegistered: boolean }) => {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <FadeIn className="w-full max-w-sm">
      <Card className="p-6">
        <form action={formAction} className="flex flex-col gap-4">
          {justRegistered && (
            <p className="text-sm text-success">Account created — log in below.</p>
          )}
          <h1 className="text-xl font-semibold text-zinc-900">Log in</h1>

          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>

          <Field label="Password">
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </Field>

          {state.error && (
            <p role="alert" className="text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Logging in…' : 'Sign in'}
          </Button>

          <p className="text-sm text-zinc-500">
            Need an account?{' '}
            <Link href="/signup" className="font-medium text-primary-600 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </Card>
    </FadeIn>
  );
};
