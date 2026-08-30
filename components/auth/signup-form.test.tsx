import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { registerUserMock } = vi.hoisted(() => ({ registerUserMock: vi.fn() }));

vi.mock('@/app/actions/auth', () => ({
  registerUser: registerUserMock,
}));

import { SignupForm } from './signup-form';

describe('SignupForm', () => {
  beforeEach(() => {
    registerUserMock.mockReset();
    registerUserMock.mockResolvedValue({ error: null });
  });

  it('renders the fields and the submit button', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows no error message before submitting', () => {
    render(<SignupForm />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('passes the typed values to the action as FormData', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('Name'), 'Maya');
    await user.type(screen.getByLabelText('Email'), 'maya@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(registerUserMock).toHaveBeenCalledOnce();
    const formData = registerUserMock.mock.calls[0][1] as FormData;
    expect(formData.get('email')).toBe('maya@example.com');
    expect(formData.get('password')).toBe('supersecret');
  });

  it('renders the error the action returns', async () => {
    registerUserMock.mockResolvedValue({
      error: 'An account with that email already exists.',
    });
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText('Email'), 'taken@example.com');
    await user.type(screen.getByLabelText('Password'), 'supersecret');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText('An account with that email already exists.')).toBeInTheDocument();
  });
});
