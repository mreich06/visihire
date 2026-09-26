import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ReportTabs, type TabId } from './report-tabs';
import type { ScoreCategory } from './score-summary-card';

const CATEGORIES: ScoreCategory[] = [
  { label: 'Searchability', score: 60, issueCount: 1 },
  { label: 'Skills Match', score: 100, issueCount: 0 },
];

const SECTION_FEEDBACK = [
  {
    category: 'Searchability' as const,
    severity: 'Critical' as const,
    section: 'Contact Info',
    issue: 'No email found.',
    suggestion: 'Add one.',
  },
];

const MISSING_KEYWORDS = [{ keyword: 'Kubernetes', importance: 'High' as const, reason: 'Listed as a core requirement.' }];

const REWRITE_SUGGESTIONS = [{ before: 'Worked on stuff', after: 'Led a 3-person team', rationale: 'More specific and quantified.' }];

const renderTabs = (overrides: Partial<Parameters<typeof ReportTabs>[0]> = {}) =>
  render(
    <ReportTabs
      categories={CATEGORIES}
      sectionFeedback={SECTION_FEEDBACK}
      missingKeywords={MISSING_KEYWORDS}
      rewriteSuggestions={REWRITE_SUGGESTIONS}
      active="breakdown"
      onActiveChange={vi.fn()}
      scrollRequest={null}
      {...overrides}
    />,
  );

describe('ReportTabs', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('calls onActiveChange with the clicked tab id, not switching state itself', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    renderTabs({ onActiveChange });

    await user.click(screen.getByRole('button', { name: 'Missing keywords' }));

    expect(onActiveChange).toHaveBeenCalledWith('keywords');
    // Still showing the breakdown panel content - it's a controlled
    // component, so the click alone doesn't change what's rendered.
    expect(screen.getByText('Searchability')).toBeInTheDocument();
  });

  it('groups sectionFeedback under its own category on the breakdown tab', () => {
    renderTabs({ active: 'breakdown' });

    expect(screen.getByText('No email found.')).toBeInTheDocument();
    expect(screen.getByText('No issues found.')).toBeInTheDocument(); // Skills Match has none
  });

  it('shows the flat sectionFeedback list on the suggestions tab', () => {
    renderTabs({ active: 'suggestions' });

    expect(screen.getByText('Contact Info')).toBeInTheDocument();
    expect(screen.getByText('No email found.')).toBeInTheDocument();
  });

  it('renders missing keywords as a table with importance and reason', () => {
    renderTabs({ active: 'keywords' });

    expect(screen.getByRole('columnheader', { name: 'Keyword' })).toBeInTheDocument();
    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Listed as a core requirement.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no missing keywords', () => {
    renderTabs({ active: 'keywords', missingKeywords: [] });

    expect(screen.getByText('No missing keywords found.')).toBeInTheDocument();
  });

  it('renders before/after rewrite suggestions', () => {
    renderTabs({ active: 'rewrites' });

    expect(screen.getByText('Worked on stuff')).toBeInTheDocument();
    expect(screen.getByText('Led a 3-person team')).toBeInTheDocument();
    expect(screen.getByText('More specific and quantified.')).toBeInTheDocument();
  });

  it('scrolls to the matching category element when a scrollRequest arrives on the breakdown tab', () => {
    const { rerender } = renderTabs({ active: 'breakdown', scrollRequest: null });

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();

    rerender(
      <ReportTabs
        categories={CATEGORIES}
        sectionFeedback={SECTION_FEEDBACK}
        missingKeywords={MISSING_KEYWORDS}
        rewriteSuggestions={REWRITE_SUGGESTIONS}
        active="breakdown"
        onActiveChange={vi.fn()}
        scrollRequest={{ label: 'Skills Match', token: 1 }}
      />,
    );

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does not scroll when the active tab is not breakdown, even with a pending scrollRequest', () => {
    renderTabs({ active: 'keywords', scrollRequest: { label: 'Skills Match', token: 1 } });

    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it.each(['breakdown', 'suggestions', 'keywords', 'rewrites'] as TabId[])('renders without crashing when active is %s', (active) => {
    renderTabs({ active });
    expect(screen.getByText('Explore your report')).toBeInTheDocument();
  });
});
