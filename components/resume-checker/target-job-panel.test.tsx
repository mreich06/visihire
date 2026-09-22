import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TargetJobPanel } from './target-job-panel';
import { Job } from '@/generated/prisma/client';

const mockJobs: Job[] = [
  {
    id: 'job-1',
    userId: 'user-1',
    company: 'Tinybird',
    title: 'Software Engineer',
    url: 'https://tinybird.co/careers/software-engineer',
    jdText: 'We are looking for a software engineer with experience in TypeScript and Postgres...',
    status: 'APPLIED',
    position: 0,
    notes: null,
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
    appliedAt: new Date('2026-09-02T10:00:00Z'),
  },
  {
    id: 'job-2',
    userId: 'user-1',
    company: 'Vercel',
    title: 'Frontend Engineer',
    url: null,
    jdText: 'Build the future of the web with Next.js and React...',
    status: 'WISHLIST',
    position: 1,
    notes: null,
    createdAt: new Date('2026-09-10T10:00:00Z'),
    updatedAt: new Date('2026-09-10T10:00:00Z'),
    appliedAt: null,
  },
];

describe('TargetJobPanel', () => {
  it('Typing in the search box filters by search term', async () => {
    render(<TargetJobPanel jobs={mockJobs} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fill from a tracked job/i }));
    await user.type(screen.getByPlaceholderText('Search company or title'), 'Vercel');

    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
  });

  it('Shows no result if search term does not match jobs', async () => {
    render(<TargetJobPanel jobs={mockJobs} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fill from a tracked job/i }));
    await user.type(screen.getByPlaceholderText('Search company or title'), 'Some other company');

    expect(screen.getByText('No jobs match that search.')).toBeInTheDocument();
  });

  it('Fills the title and job description fields when a job is selected', async () => {
    render(<TargetJobPanel jobs={mockJobs} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /fill from a tracked job/i }));
    await user.type(screen.getByPlaceholderText('Search company or title'), 'Vercel');
    await user.click(screen.getByText('Frontend Engineer'));

    expect(screen.getByPlaceholderText('Target job title')).toHaveValue('Frontend Engineer');
    expect(screen.getByPlaceholderText('Job description')).toHaveValue('Build the future of the web with Next.js and React...');
    expect(screen.getByRole('button', { name: /Vercel.*Frontend Engineer/i })).toBeInTheDocument();
  });
});
