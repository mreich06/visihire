import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// ResumeSourceTabs renders ResumeUpload, which imports the uploadResume from @app/actions/profile
// so it must be mocked
vi.mock('@/app/actions/profile', () => ({
  uploadResume: vi.fn(),
}));

import { ResumeSourceTabs } from './resume-source-tabs';
import { Resume } from '@/generated/prisma/client';

const mockResumes: Resume[] = [
  {
    id: 'resume-1',
    userId: 'user-1',
    title: 'Backend roles',
    text: 'Experienced backend engineer...',
    resumeFileName: 'backend-resume.pdf',
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    id: 'resume-2',
    userId: 'user-1',
    title: 'Frontend roles',
    text: 'Experienced frontend engineer...',
    resumeFileName: 'frontend-resume.pdf',
    createdAt: new Date('2026-09-15T10:00:00Z'),
    updatedAt: new Date('2026-09-15T10:00:00Z'),
  },
];

describe('ResumeSourceTabs', () => {
  it('Does not show the dropdown if no resumes are saved', async () => {
    render(<ResumeSourceTabs resumes={[]} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Use a saved resume/i }));

    expect(screen.getByText('No saved resumes yet. Upload one to save it here.')).toBeInTheDocument();
  });

  it('Shows the dropdown and the resumes belonging to user', async () => {
    render(<ResumeSourceTabs resumes={mockResumes} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Use a saved resume/i }));
    await user.click(screen.getByRole('button', { name: /Choose a saved resume/i }));

    expect(screen.getByText('Backend roles')).toBeInTheDocument();
    expect(screen.getByText('Frontend roles')).toBeInTheDocument();
  });

  it('Shows the selected resume when the user clicks on it in the dropdown', async () => {
    render(<ResumeSourceTabs resumes={mockResumes} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Use a saved resume/i }));
    await user.click(screen.getByRole('button', { name: /Choose a saved resume/i }));

    expect(screen.getByText('Backend roles')).toBeInTheDocument();
    await user.click(screen.getByText('Backend roles'));

    expect(screen.getByRole('button', { name: /Backend roles/i })).toBeInTheDocument();
  });
});
