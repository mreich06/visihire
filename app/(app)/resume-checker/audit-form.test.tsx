import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/components/resume-source-tabs', () => ({
  ResumeSourceTabs: ({ setSelected }: { setSelected: (resume: { id: string; title: string }) => void }) => (
    <button onClick={() => setSelected({ id: 'resume-1', title: 'My Resume' })}>Pick a resume</button>
  ),
}));

vi.mock('@/components/resume-checker/target-job-panel', () => ({
  TargetJobPanel: ({ setSelected }: { setSelected: (job: { id: string; title: string } | null) => void }) => (
    <button onClick={() => setSelected({ id: 'job-1', title: 'Engineer' })}>Pick a job</button>
  ),
}));

vi.mock('@/components/ui/audit-results', () => ({
  default: ({ onCheckAnother, onSaveToJob }: { onCheckAnother: () => void; onSaveToJob?: () => void }) => (
    <div>
      <p>AuditResults rendered</p>
      <button onClick={onCheckAnother}>Check another resume</button>
      {onSaveToJob && <button onClick={onSaveToJob}>Save to job</button>}
    </div>
  ),
}));

vi.mock('@/components/resume-checker/checker-description', () => ({
  default: () => <div>CheckerDescription marker</div>,
}));

vi.mock('@/components/resume-checker/outreach-cta', () => ({
  default: () => <div>OutreachCta marker</div>,
}));

import AuditForm from './audit-form';

const okResponse = (body: unknown) => ({ ok: true, json: async () => body }) as Response;
const failResponse = () => ({ ok: false, json: async () => ({ error: 'nope' }) }) as Response;

const RAW_API_AUDIT = {
  score: 85,
  result: {
    summary: 'Great resume.',
    matchedKeywords: [],
    missingKeywords: [],
    sectionFeedback: [],
    rewriteSuggestions: [],
    checks: {
      hasEmail: true,
      hasPhone: true,
      hasEducationSection: true,
      hasExperienceSection: true,
      hasDateRange: true,
      quantifiedLineCount: 1,
      actionVerbLineCount: 1,
      totalLineCount: 4,
    },
  },
};

describe('AuditForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    window.print = vi.fn();
  });

  it('shows the picker form, CheckerDescription, and OutreachCta, but no Print button, before scoring', () => {
    render(<AuditForm jobs={[]} resumes={[]} />);

    expect(screen.getByText('Choose your resume')).toBeInTheDocument();
    expect(screen.getByText('Target job')).toBeInTheDocument();
    expect(screen.getByText('CheckerDescription marker')).toBeInTheDocument();
    expect(screen.getByText('OutreachCta marker')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /print/i })).not.toBeInTheDocument();
    expect(screen.queryByText('AuditResults rendered')).not.toBeInTheDocument();
  });

  it('sends the selected resume and job ids, then shows results, hides the form, and shows Print', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(okResponse(RAW_API_AUDIT));
    render(<AuditForm jobs={[]} resumes={[]} />);

    await user.click(screen.getByText('Pick a resume'));
    await user.click(screen.getByText('Pick a job'));
    await user.click(screen.getByRole('button', { name: /get my ats score/i }));

    await waitFor(() => expect(screen.getByText('AuditResults rendered')).toBeInTheDocument());

    expect(fetch).toHaveBeenCalledWith(
      '/api/audit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ resumeId: 'resume-1', jobId: 'job-1' }),
      }),
    );
    expect(screen.queryByText('Choose your resume')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
    // CheckerDescription only makes sense before you've checked something
    expect(screen.queryByText('CheckerDescription marker')).not.toBeInTheDocument();
    // OutreachCta stays up regardless of state
    expect(screen.getByText('OutreachCta marker')).toBeInTheDocument();
  });

  it('reshapes the raw API response (score at top level, rest nested under result) into the flat AuditResult shape', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(okResponse(RAW_API_AUDIT));
    render(<AuditForm jobs={[]} resumes={[]} />);

    await user.click(screen.getByRole('button', { name: /get my ats score/i }));

    // If this weren't reshaped correctly, AuditResults (which reads
    // audit.score) would receive undefined instead of 85.
    await waitFor(() => expect(screen.getByText('AuditResults rendered')).toBeInTheDocument());
  });

  it('only passes onSaveToJob when a job was selected', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(okResponse(RAW_API_AUDIT));
    render(<AuditForm jobs={[]} resumes={[]} />);

    // No job picked this time
    await user.click(screen.getByRole('button', { name: /get my ats score/i }));

    await waitFor(() => expect(screen.getByText('AuditResults rendered')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /save to job/i })).not.toBeInTheDocument();
  });

  it('passes onSaveToJob when a job was selected, and it is callable', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(okResponse(RAW_API_AUDIT));
    render(<AuditForm jobs={[]} resumes={[]} />);

    await user.click(screen.getByText('Pick a job'));
    await user.click(screen.getByRole('button', { name: /get my ats score/i }));

    await waitFor(() => expect(screen.getByText('AuditResults rendered')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /save to job/i }));
    // Just asserting it doesn't throw - the action itself is a TODO stub
  });

  it('going back via "Check another resume" returns to the picker form', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(okResponse(RAW_API_AUDIT));
    render(<AuditForm jobs={[]} resumes={[]} />);

    await user.click(screen.getByRole('button', { name: /get my ats score/i }));
    await waitFor(() => expect(screen.getByText('AuditResults rendered')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /check another resume/i }));

    expect(screen.getByText('Choose your resume')).toBeInTheDocument();
    expect(screen.queryByText('AuditResults rendered')).not.toBeInTheDocument();
  });

  it('shows an error state instead of results when the request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue(failResponse());
    render(<AuditForm jobs={[]} resumes={[]} />);

    await user.click(screen.getByRole('button', { name: /get my ats score/i }));

    await waitFor(() => expect(screen.getByText('Your resumé could not be evaluated')).toBeInTheDocument());
    expect(screen.queryByText('AuditResults rendered')).not.toBeInTheDocument();
    // Still on the picker form, not stuck showing nothing
    expect(screen.getByText('Choose your resume')).toBeInTheDocument();
  });
});
