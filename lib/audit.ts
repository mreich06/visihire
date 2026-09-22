import 'server-only';

import { z } from 'zod';

import { db } from '@/lib/db';
import { generateStructured, GEMINI_MODEL } from '@/lib/llm';
import { runResumeChecks, type ResumeChecks } from '@/lib/resume-checks';
import type { Job, Prisma, Resume } from '@/generated/prisma/client';

const AuditLLMResultSchema = z.object({
  summary: z.string(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  sectionFeedback: z.array(
    z.object({
      section: z.string(),
      issue: z.string(),
      suggestion: z.string(),
    }),
  ),
  rewriteSuggestions: z.array(
    z.object({
      before: z.string(),
      after: z.string(),
      rationale: z.string(),
    }),
  ),
});

type AuditLLMResult = z.infer<typeof AuditLLMResultSchema>;

export interface AuditResult extends AuditLLMResult {
  score: number;
  checks: ResumeChecks;
}

const buildPrompt = (resume: Resume, checks: ResumeChecks, job: Job | null) => {
  const checksSummary = [
    `Email found: ${checks.hasEmail}`,
    `Phone number found: ${checks.hasPhone}`,
    `Education section found: ${checks.hasEducationSection}`,
    `Experience section found: ${checks.hasExperienceSection}`,
    `Consistent date range found: ${checks.hasDateRange}`,
    `Lines with a quantified result (numbers, %, $): ${checks.quantifiedLineCount} of ${checks.totalLineCount}`,
  ].join('\n');

  const jobSection = job
    ? `The candidate is targeting this specific job:\nTitle: ${job.title}\nCompany: ${job.company}\nJob description:\n${job.jdText ?? '(no job description provided)'}`
    : 'No specific job was provided - give general ATS and resume-quality feedback, not job-specific keyword matching. Return empty arrays for matchedKeywords and missingKeywords.';

  return `You are an ATS (Applicant Tracking System) resume reviewer. Ground your review in the resume text below - it is complete and final, do not assume information that isn't in it, and never invent experience, metrics, or skills the candidate doesn't already claim.

A set of automated formatting checks already ran against this resume. Treat them as ground truth, do not re-derive them yourself:
${checksSummary}

${jobSection}

Resume text:
${resume.text}

Write a short (2-3 sentence) summary of the resume's overall strength. If a job was given, list the important keywords/skills from the job description the resume already covers (matchedKeywords) and the ones it's missing (missingKeywords) - be specific (e.g. "Redux", not "frontend skills"). Give 2-4 pieces of section-level feedback, grounded in the automated checks above where relevant. Give 1-3 concrete rewrite suggestions: quote the actual "before" text from the resume, propose an "after" version, and explain why it's stronger.`;
};

const scoreChecks = (checks: ResumeChecks): number => {
  const passes = [checks.hasEmail, checks.hasPhone, checks.hasEducationSection, checks.hasExperienceSection, checks.hasDateRange];
  const passRate = passes.filter(Boolean).length / passes.length;

  const quantifiedTarget = Math.max(4, Math.round(checks.totalLineCount * 0.2));
  const quantifiedRatio = checks.totalLineCount === 0 ? 0 : Math.min(1, checks.quantifiedLineCount / quantifiedTarget);

  return passRate * 0.7 + quantifiedRatio * 0.3;
};

const scoreKeywords = (matched: string[], missing: string[]): number => {
  const total = matched.length + missing.length;
  return total === 0 ? 1 : matched.length / total;
};

// The numeric score is computed here, deterministically
// not from LLM bc an LLM-generated score is inconsistent between runs
// The LLM only produces the qualitative parts (summary, keyword lists, feedback,

const computeScore = (checks: ResumeChecks, llmResult: AuditLLMResult, hasJob: boolean): number => {
  const checksScore = scoreChecks(checks);
  if (!hasJob) return Math.round(checksScore * 100);

  const keywordScore = scoreKeywords(llmResult.matchedKeywords, llmResult.missingKeywords);
  return Math.round((checksScore * 0.4 + keywordScore * 0.6) * 100);
};

export const runAudit = async (resume: Resume, job: Job | null): Promise<AuditResult> => {
  const checks = runResumeChecks(resume.text);
  const prompt = buildPrompt(resume, checks, job);
  const llmResult = await generateStructured(prompt, AuditLLMResultSchema);
  const score = computeScore(checks, llmResult, job !== null);

  return { ...llmResult, score, checks };
};

interface GetOrCreateAuditParams {
  userId: string;
  resumeId: string;
  jobId?: string | null;
}

// One audit per (resumeId, jobId) pair, cache it or invalidate if the resume or job
// changed since it was cached
export const getOrCreateAudit = async ({ userId, resumeId, jobId = null }: GetOrCreateAuditParams) => {
  const resume = await db.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== userId) throw new Error('Resume not found.');

  const job = jobId ? await db.job.findUnique({ where: { id: jobId } }) : null;
  if (jobId && (!job || job.userId !== userId)) throw new Error('Job not found.');

  // compare resume in the audit with the resume that is stored in resume array, update if needed
  const existing = await db.audit.findFirst({ where: { resumeId, jobId } });
  const isFresh = existing && existing.updatedAt >= resume.updatedAt && (!job || existing.updatedAt >= job.updatedAt);
  if (existing && isFresh) return existing;

  const { score, ...result } = await runAudit(resume, job);
  const data = {
    userId,
    resumeId,
    jobId,
    score,
    result: result as unknown as Prisma.InputJsonValue,
    model: GEMINI_MODEL,
  };

  if (existing) {
    return db.audit.update({ where: { id: existing.id }, data });
  }
  return db.audit.create({ data });
};
