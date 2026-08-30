'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { loginAction, type FormState } from '@/app/actions/auth';

const initialState: FormState = { error: null };

export const LoginForm = ({ justRegistered }: { justRegistered: boolean }) => {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {justRegistered && <p className="text-sm text-green-700">Account created - log in below.</p>}
      <h1 className="text-xl font-semibold">Log in</h1>

      <label className="flex flex-col gap-1 text-sm">
        Email
        <input name="email" type="email" required autoComplete="email" className="rounded border border-black/15 px-3 py-2" />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="rounded border border-black/15 px-3 py-2"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50">
        {pending ? 'Logging in...' : 'Sign in'}
      </button>

      <p className="text-sm text-black/60">
        Need an account?{' '}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </form>
  );
};
