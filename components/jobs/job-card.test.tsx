import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import JobCard from './job-card';
import { makeJob } from '@/test/fixtures';

const handleClick = vi.fn();
const mockJob = makeJob();

describe('JobCard', () => {
  it('renders the company and title', async () => {
    const user = userEvent.setup();

    render(<JobCard job={mockJob} onClick={handleClick} />);
    expect(screen.getByText(mockJob.company)).toBeInTheDocument();
    expect(screen.getByText(mockJob.title)).toBeInTheDocument();

    await user.click(screen.getByText(mockJob.company));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
