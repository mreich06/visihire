import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateStructuredMock } = vi.hoisted(() => ({ generateStructuredMock: vi.fn() }));

vi.mock('@/lib/llm', () => ({
  generateStructured: generateStructuredMock,
  LLM_MODEL: 'test-model',
}));

import { runAudit } from './audit';
import type { Job, Resume } from '@/generated/prisma/client';

const makeResume = (overrides: Partial<Resume> = {}): Resume => ({
  id: 'resume-1',
  userId: 'user-1',
  title: 'My Resume',
  text: [
    'Maya Reich',
    'maya@example.com | 555-123-4567',
    '',
    'EXPERIENCE',
    'Acme Corp | Jan 2022 - Present',
    '- Led a team, increasing revenue by 40%',
    '',
    'EDUCATION',
    'State University 2018 - 2022',
  ].join('\n'),
  resumeFileName: 'resume.pdf',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// No email/phone/education/experience/date-range, but dense enough in
// quantified metrics + action verbs that structuralFeedback's ratio checks
// don't ALSO fire - isolates the test to just the 5 contact/section/date items.
const NO_CONTACT_INFO_TEXT = [
  'Led a project increasing revenue by 40%',
  'Built a new system saving $50k',
  'Managed a team 5x the previous size',
  'Reduced costs by 20%',
].join('\n');

const makeJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-1',
  userId: 'user-1',
  company: 'Acme',
  title: 'Engineer',
  url: null,
  jdText: 'Looking for a React engineer',
  status: 'WISHLIST',
  position: 0,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  appliedAt: null,
  ...overrides,
});

const EMPTY_LLM_RESULT = {
  summary: 'Solid resume.',
  matchedKeywords: [] as { keyword: string; contextFound: 'Strong' | 'Mentioned Only' | 'Keyword Stuffed' }[],
  missingKeywords: [] as { keyword: string; importance: 'High' | 'Medium' | 'Low'; reason: string }[],
  sectionFeedback: [] as {
    category: 'Searchability' | 'Impact & Metrics' | 'Skills Match' | 'Grammar and Spelling' | 'Structure & Clarity';
    severity: 'Critical' | 'Important' | 'Minor';
    section: string;
    issue: string;
    suggestion: string;
  }[],
  rewriteSuggestions: [] as { before: string; after: string; rationale: string }[],
};

describe('runAudit', () => {
  beforeEach(() => {
    generateStructuredMock.mockReset();
  });

  it('merges deterministic structural feedback with the LLM sectionFeedback', async () => {
    const resume = makeResume({ text: NO_CONTACT_INFO_TEXT });
    generateStructuredMock.mockResolvedValue({
      ...EMPTY_LLM_RESULT,
      sectionFeedback: [{ category: 'Grammar and Spelling', severity: 'Minor', section: 'Typos', issue: 'typo', suggestion: 'fix it' }],
    });

    const result = await runAudit(resume, null);

    // 5 deterministic items (no email, no phone, no education, no
    // experience, no date range) + the 1 LLM item
    expect(result.sectionFeedback).toHaveLength(6);
    expect(result.sectionFeedback.filter((item) => item.category === 'Searchability')).toHaveLength(5);
    expect(result.sectionFeedback.some((item) => item.section === 'Typos')).toBe(true);
  });

  it('does not ask the LLM to also generate Searchability feedback that would duplicate the deterministic items', async () => {
    const resume = makeResume();
    generateStructuredMock.mockResolvedValue(EMPTY_LLM_RESULT);

    await runAudit(resume, null);

    const [prompt] = generateStructuredMock.mock.calls[0];
    expect(prompt).toContain('Do NOT repeat');
  });

  it('sorts sectionFeedback Critical first, then Important, then Minor', async () => {
    const resume = makeResume({ text: NO_CONTACT_INFO_TEXT });
    generateStructuredMock.mockResolvedValue({
      ...EMPTY_LLM_RESULT,
      sectionFeedback: [
        { category: 'Structure & Clarity', severity: 'Minor', section: 'A', issue: 'a', suggestion: 'a' },
        { category: 'Grammar and Spelling', severity: 'Critical', section: 'B', issue: 'b', suggestion: 'b' },
      ],
    });

    const result = await runAudit(resume, null);
    const severities = result.sectionFeedback.map((item) => item.severity);
    const lastCritical = severities.lastIndexOf('Critical');
    const firstImportant = severities.indexOf('Important');
    const firstMinor = severities.indexOf('Minor');

    expect(lastCritical).toBeLessThan(firstImportant);
    expect(firstImportant).toBeLessThan(firstMinor);
  });

  it('sorts missingKeywords High to Low importance', async () => {
    const resume = makeResume();
    const job = makeJob();

    generateStructuredMock
      .mockResolvedValueOnce({ coreCompetencies: ['React'], requirements: [] })
      .mockResolvedValueOnce({
        ...EMPTY_LLM_RESULT,
        missingKeywords: [
          { keyword: 'Low one', importance: 'Low', reason: 'r' },
          { keyword: 'High one', importance: 'High', reason: 'r' },
          { keyword: 'Medium one', importance: 'Medium', reason: 'r' },
        ],
      });

    const result = await runAudit(resume, job);

    expect(result.missingKeywords.map((k) => k.importance)).toEqual(['High', 'Medium', 'Low']);
  });

  it('does not call generateStructured a second time for keyword extraction when there is no job', async () => {
    const resume = makeResume();
    generateStructuredMock.mockResolvedValue(EMPTY_LLM_RESULT);

    await runAudit(resume, null);

    expect(generateStructuredMock).toHaveBeenCalledOnce();
  });

  it('does not call generateStructured for keyword extraction when the job has no jdText', async () => {
    const resume = makeResume();
    const job = makeJob({ jdText: null });
    generateStructuredMock.mockResolvedValue(EMPTY_LLM_RESULT);

    await runAudit(resume, job);

    expect(generateStructuredMock).toHaveBeenCalledOnce();
  });

  it('scores based only on structural checks when there is no job', async () => {
    const resume = makeResume();
    generateStructuredMock.mockResolvedValue(EMPTY_LLM_RESULT);

    const result = await runAudit(resume, null);

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('penalizes a keyword-stuffed match instead of scoring it as a full match', async () => {
    const resume = makeResume();
    const job = makeJob();

    generateStructuredMock
      .mockResolvedValueOnce({ coreCompetencies: ['React'], requirements: [] })
      .mockResolvedValueOnce({ ...EMPTY_LLM_RESULT, matchedKeywords: [{ keyword: 'React', contextFound: 'Keyword Stuffed' }] });
    const stuffedResult = await runAudit(resume, job);

    generateStructuredMock.mockReset();
    generateStructuredMock
      .mockResolvedValueOnce({ coreCompetencies: ['React'], requirements: [] })
      .mockResolvedValueOnce({ ...EMPTY_LLM_RESULT, matchedKeywords: [{ keyword: 'React', contextFound: 'Strong' }] });
    const strongResult = await runAudit(resume, job);

    expect(stuffedResult.score).toBeLessThan(strongResult.score);
  });
});
