import { beforeEach, describe, expect, it, vi } from 'vitest';

const { generateStructuredMock, dbMock } = vi.hoisted(() => ({
  generateStructuredMock: vi.fn(),
  dbMock: {
    resume: { findUnique: vi.fn() },
    job: { findUnique: vi.fn() },
    audit: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('@/lib/llm', () => ({
  generateStructured: generateStructuredMock,
  LLM_MODEL: 'test-model',
}));

vi.mock('@/lib/db', () => ({ db: dbMock }));

import { getOrCreateAudit, runAudit } from './audit';
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

describe('getOrCreateAudit', () => {
  beforeEach(() => {
    generateStructuredMock.mockReset().mockResolvedValue(EMPTY_LLM_RESULT);
    dbMock.resume.findUnique.mockReset();
    dbMock.job.findUnique.mockReset();
    dbMock.audit.findFirst.mockReset();
    dbMock.audit.create.mockReset().mockResolvedValue({ id: 'audit-new' });
    dbMock.audit.update.mockReset().mockResolvedValue({ id: 'audit-updated' });
  });

  it('throws if the resume does not exist', async () => {
    dbMock.resume.findUnique.mockResolvedValue(null);

    await expect(getOrCreateAudit({ userId: 'user-1', resumeId: 'missing' })).rejects.toThrow('Resume not found.');
  });

  it('throws if the resume belongs to a different user', async () => {
    dbMock.resume.findUnique.mockResolvedValue(makeResume({ userId: 'someone-else' }));

    await expect(getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1' })).rejects.toThrow('Resume not found.');
  });

  it('throws if the job does not exist', async () => {
    dbMock.resume.findUnique.mockResolvedValue(makeResume());
    dbMock.job.findUnique.mockResolvedValue(null);

    await expect(getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1', jobId: 'missing' })).rejects.toThrow('Job not found.');
  });

  it('throws if the job belongs to a different user', async () => {
    dbMock.resume.findUnique.mockResolvedValue(makeResume());
    dbMock.job.findUnique.mockResolvedValue(makeJob({ userId: 'someone-else' }));

    await expect(getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1', jobId: 'job-1' })).rejects.toThrow('Job not found.');
  });

  it('returns the cached audit without calling the LLM when it is fresh', async () => {
    const resume = makeResume({ updatedAt: new Date('2026-01-01') });
    const existing = { id: 'audit-cached', updatedAt: new Date('2026-01-02') };
    dbMock.resume.findUnique.mockResolvedValue(resume);
    dbMock.audit.findFirst.mockResolvedValue(existing);

    const result = await getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1' });

    expect(result).toBe(existing);
    expect(generateStructuredMock).not.toHaveBeenCalled();
    expect(dbMock.audit.create).not.toHaveBeenCalled();
    expect(dbMock.audit.update).not.toHaveBeenCalled();
  });

  it('regenerates and updates the cached row when the resume changed since it was cached', async () => {
    const resume = makeResume({ updatedAt: new Date('2026-02-01') });
    const existing = { id: 'audit-cached', updatedAt: new Date('2026-01-01') };
    dbMock.resume.findUnique.mockResolvedValue(resume);
    dbMock.audit.findFirst.mockResolvedValue(existing);

    await getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1' });

    expect(generateStructuredMock).toHaveBeenCalled();
    expect(dbMock.audit.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'audit-cached' } }));
    expect(dbMock.audit.create).not.toHaveBeenCalled();
  });

  it('creates a new row when nothing is cached yet', async () => {
    const resume = makeResume();
    dbMock.resume.findUnique.mockResolvedValue(resume);
    dbMock.audit.findFirst.mockResolvedValue(null);

    await getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1' });

    expect(dbMock.audit.create).toHaveBeenCalledOnce();
    expect(dbMock.audit.update).not.toHaveBeenCalled();
  });

  it('looks up the cache with jobId null for a general, job-less audit', async () => {
    const resume = makeResume();
    dbMock.resume.findUnique.mockResolvedValue(resume);
    dbMock.audit.findFirst.mockResolvedValue(null);

    await getOrCreateAudit({ userId: 'user-1', resumeId: 'resume-1' });

    expect(dbMock.audit.findFirst).toHaveBeenCalledWith({ where: { resumeId: 'resume-1', jobId: null } });
  });
});
