import { describe, expect, it } from 'vitest';

import { runResumeChecks } from './resume-checks';

const GOOD_RESUME = `Maya Reich
maya@example.com | +1 555-123-4567

EXPERIENCE
Acme Corp | Jan 2022 - Present
- Led a team of 5 engineers, increasing deployment speed by 40%
- Reduced infrastructure costs by $50k annually
- Built a CI/CD pipeline using GitHub Actions

EDUCATION
State University 2018 - 2022
Bachelor of Science in Computer Science`;

describe('runResumeChecks', () => {
  it('detects an email address', () => {
    expect(runResumeChecks(GOOD_RESUME).hasEmail).toBe(true);
    expect(runResumeChecks('No contact info here').hasEmail).toBe(false);
  });

  it('detects a phone number', () => {
    expect(runResumeChecks(GOOD_RESUME).hasPhone).toBe(true);
    expect(runResumeChecks('No phone here').hasPhone).toBe(false);
  });

  it('detects an education section', () => {
    expect(runResumeChecks(GOOD_RESUME).hasEducationSection).toBe(true);
    expect(runResumeChecks('No sections here').hasEducationSection).toBe(false);
  });

  it('detects an experience section by any of its common headings', () => {
    expect(runResumeChecks('EXPERIENCE\nDid stuff').hasExperienceSection).toBe(true);
    expect(runResumeChecks('WORK HISTORY\nDid stuff').hasExperienceSection).toBe(true);
    expect(runResumeChecks('EMPLOYMENT\nDid stuff').hasExperienceSection).toBe(true);
    expect(runResumeChecks('No such heading here').hasExperienceSection).toBe(false);
  });

  it('detects a date range with Present/Current or a second year', () => {
    expect(runResumeChecks('Jan 2022 - Present').hasDateRange).toBe(true);
    expect(runResumeChecks('2018 - 2022').hasDateRange).toBe(true);
    expect(runResumeChecks('no dates at all')).toEqual(expect.objectContaining({ hasDateRange: false }));
  });

  it('counts lines with a quantified result (%, $, or multiplier) but not bare numbers', () => {
    const text = ['Increased revenue by 40%', 'Saved $50k annually', 'Worked with 5x more clients', 'Attended 3 meetings'].join('\n');

    // First 3 lines are quantified (%, $, x-multiplier); "3 meetings" is a
    // bare number, deliberately not counted, so this also guards against
    // the regex being loosened back to matching any digit.
    expect(runResumeChecks(text).quantifiedLineCount).toBe(3);
  });

  it('does not count a bare year as a quantified result', () => {
    expect(runResumeChecks('Graduated in 2022').quantifiedLineCount).toBe(0);
  });

  it('counts lines starting with a known action verb', () => {
    const text = ['Led the migration project', 'Built a new API', 'Was responsible for onboarding'].join('\n');

    expect(runResumeChecks(text).actionVerbLineCount).toBe(2);
  });

  it('strips a leading bullet character before checking for an action verb', () => {
    expect(runResumeChecks('- Led the migration project').actionVerbLineCount).toBe(1);
    expect(runResumeChecks('• Built a new API').actionVerbLineCount).toBe(1);
  });

  it('counts total non-empty lines, ignoring blank ones', () => {
    const text = 'Line one\n\n   \nLine two\n';
    expect(runResumeChecks(text).totalLineCount).toBe(2);
  });
});
