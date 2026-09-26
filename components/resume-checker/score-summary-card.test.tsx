import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ScoreSummaryCard, type ScoreCategory, type TriageCounts } from './score-summary-card';

const CATEGORIES: ScoreCategory[] = [
  { label: 'Searchability', score: 90, issueCount: 0 },
  { label: 'Skills Match', score: 40, issueCount: 3 },
];

const TRIAGE: TriageCounts = { critical: 1, improvements: 4, strengths: 5 };

const renderCard = (overrides: Partial<Parameters<typeof ScoreSummaryCard>[0]> = {}) =>
  render(
    <ScoreSummaryCard
      score={85}
      grade="Excellent"
      summary="A strong resume."
      categories={CATEGORIES}
      triage={TRIAGE}
      onCheckAnother={vi.fn()}
      onSelectCategory={vi.fn()}
      {...overrides}
    />,
  );

describe('ScoreSummaryCard', () => {
  it('shows the score, grade, and summary', () => {
    renderCard();

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('A strong resume.')).toBeInTheDocument();
  });

  it('shows "No issues" for a clean category and a count for one with issues', () => {
    renderCard();

    expect(screen.getByText('No issues')).toBeInTheDocument();
    expect(screen.getByText('3 issues to fix')).toBeInTheDocument();
  });

  it('calls onSelectCategory with the clicked category label', async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();
    renderCard({ onSelectCategory });

    await user.click(screen.getByText('Skills Match'));

    expect(onSelectCategory).toHaveBeenCalledWith('Skills Match');
  });

  it('shows the triage counts', () => {
    renderCard();

    expect(screen.getByText('1 Must Fix')).toBeInTheDocument();
    expect(screen.getByText('4 Suggestions')).toBeInTheDocument();
    expect(screen.getByText('5 Working Well')).toBeInTheDocument();
  });

  it('calls onCheckAnother when that button is clicked', async () => {
    const user = userEvent.setup();
    const onCheckAnother = vi.fn();
    renderCard({ onCheckAnother });

    await user.click(screen.getByRole('button', { name: /check another resume/i }));

    expect(onCheckAnother).toHaveBeenCalledOnce();
  });

  it('does not show "Save to job" when onSaveToJob is not provided', () => {
    renderCard();

    expect(screen.queryByRole('button', { name: /save to job/i })).not.toBeInTheDocument();
  });

  it('shows "Save to job" and calls it when provided', async () => {
    const user = userEvent.setup();
    const onSaveToJob = vi.fn();
    renderCard({ onSaveToJob });

    const button = screen.getByRole('button', { name: /save to job/i });
    await user.click(button);

    expect(onSaveToJob).toHaveBeenCalledOnce();
  });

  it.each([
    [95, 'Excellent'],
    [70, 'Good'],
    [30, 'Needs Work'],
  ])('uses a grade-appropriate badge tone for a score of %i', (score, grade) => {
    renderCard({ score, grade });

    const expectedTone = score >= 80 ? 'bg-success-soft' : score >= 60 ? 'bg-warning-soft' : 'bg-danger-soft';
    expect(screen.getByText(grade)).toHaveClass(expectedTone);
  });
});
