import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loginActionMock } = vi.hoisted(() => ({ loginActionMock: vi.fn() }));

vi.mock('@/app/actions/auth', () => ({
  loginAction: loginActionMock,
}));

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  beforeEach(() => {
    loginActionMock.mockReset();
    loginActionMock.mockResolvedValue({ error: null });
  });

  it('renders the fields, the banner, and the button when just registered', () => {
    render(<LoginForm justRegistered />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Account created — log in below.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('hides the banner when not just registered', () => {
    render(<LoginForm justRegistered={false} />);

    expect(
      screen.queryByText('Account created — log in below.'),
    ).not.toBeInTheDocument();
  });

  it('shows no error message before submitting', () => {
    render(<LoginForm justRegistered={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('passes the typed values to the action as FormData', async () => {
    const user = userEvent.setup();
    render(<LoginForm justRegistered={false} />);

    await user.type(screen.getByLabelText('Email'), 'maya@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(loginActionMock).toHaveBeenCalledOnce();
    const formData = loginActionMock.mock.calls[0][1] as FormData;
    expect(formData.get('email')).toBe('maya@example.com');
    expect(formData.get('password')).toBe('supersecret');
  });

  it('renders the error the action returns', async () => {
    loginActionMock.mockResolvedValue({ error: 'Invalid email or password' });
    const user = userEvent.setup();
    render(<LoginForm justRegistered={false} />);

    await user.type(screen.getByLabelText('Email'), 'maya@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText('Invalid email or password'),
    ).toBeInTheDocument();
  });
});
