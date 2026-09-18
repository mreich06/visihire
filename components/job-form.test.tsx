import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JobForm from './job-form';
import { makeJob } from '@/test/fixtures';

const mockJob = makeJob();
const onSuccess = vi.fn();

const { createJobMock, updateJobMock, deleteJobMock } = vi.hoisted(() => ({
  createJobMock: vi.fn(),
  updateJobMock: vi.fn(),
  deleteJobMock: vi.fn(),
}));

vi.mock('@/app/actions/jobs', () => ({
  createJob: createJobMock,
  updateJob: updateJobMock,
  deleteJob: deleteJobMock,
}));

describe('JobForm', () => {
  beforeEach(() => {
    createJobMock.mockReset().mockResolvedValue({ error: null });
    updateJobMock.mockReset().mockResolvedValue({ error: null });
    deleteJobMock.mockReset().mockResolvedValue({ error: null });
    onSuccess.mockReset();
  });

  it('Shows the Add Job form if Add Job is clicked', async () => {
    const user = userEvent.setup();
    render(<JobForm onSuccess={onSuccess} />);

    expect(screen.getByRole('heading', { name: 'Add job' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('Company'), 'Some company');
    await user.type(screen.getByLabelText('Title'), 'Software engineer');
    await user.type(screen.getByLabelText('Job URL'), 'https://example.com');
    await user.type(screen.getByLabelText('Job description'), 'A job description');
    await user.type(screen.getByLabelText('Notes'), 'Requires relocation');
    await user.click(screen.getByRole('button', { name: /Add job/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('Shows the Update job form if a job is clicked with filled in fields', async () => {
    const user = userEvent.setup();
    render(<JobForm job={mockJob} onSuccess={onSuccess} />);

    expect(screen.getByRole('heading', { name: 'Update job' })).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toHaveValue('Stripe');
    expect(screen.getByLabelText('Title')).toHaveValue('Software Engineer');

    await user.type(screen.getByLabelText('Notes'), 'Requires relocation');
    await user.click(screen.getByRole('button', { name: /Update job/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('Can delete job on an Update job form', async () => {
    const user = userEvent.setup();
    render(<JobForm job={mockJob} onSuccess={onSuccess} />);

    expect(screen.getByRole('heading', { name: 'Update job' })).toBeInTheDocument();
    expect(screen.getByLabelText('Company')).toHaveValue('Stripe');
    expect(screen.getByLabelText('Title')).toHaveValue('Software Engineer');
    await user.click(screen.getByRole('button', { name: /Delete job/i }));
    await user.click(screen.getByRole('button', { name: /yes, delete/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
});
