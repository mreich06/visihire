import 'server-only';

import { z } from 'zod';

import { db } from '@/lib/db';
import { generateStructured, LLM_MODEL } from '@/lib/llm';
import { runResumeChecks, type ResumeChecks } from '@/lib/resume-checks';
import type { Job, Prisma, Resume } from '@/generated/prisma/client';

const AuditLLMResultSchema = z.object({
  summary: z.string(),
  matchedKeywords: z.array(
    z.object({
      keyword: z.string(),
      contextFound: z.enum(['Strong', 'Mentioned Only', 'Keyword Stuffed']),
    }),
  ),
  missingKeywords: z.array(
    z.object({
      keyword: z.string(),
      importance: z.enum(['High', 'Medium', 'Low']),
      reason: z.string(),
    }),
  ),
  sectionFeedback: z.array(
    z.object({
      category: z.enum(['Searchability', 'Impact & Metrics', 'Skills Match', 'Grammar and Spelling', 'Structure & Clarity']),
      severity: z.enum(['Critical', 'Important', 'Minor']),
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

const JobKeywordsSchema = z.object({
  coreCompetencies: z
    .array(z.string())
    .describe("Core skills, domains, or methodologies required (e.g., 'Project Management', 'Patient Care', 'Inventory Control')"),
  requirements: z
    .array(z.string())
    .describe("Certifications, licenses, tools, or physical/legal requirements (e.g., 'CPR Certified', 'Forklift License', 'Excel', 'OSHA Safety')"),
});

type JobKeywords = z.infer<typeof JobKeywordsSchema>;

type AuditLLMResult = z.infer<typeof AuditLLMResultSchema>;

export interface AuditResult extends AuditLLMResult {
  score: number;
  checks: ResumeChecks;
}

// Counting is something llms are unreliable at doing, so this
// gets computed in code and handed to the model
const countOccurrences = (text: string, term: string): number => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = text.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
  return matches ? matches.length : 0;
};

// llm are bad at extracting comprehensive keyword lists, so run Gemini pass on JD
// to extract the key words
const buildPrompt = (resume: Resume, checks: ResumeChecks, job: Job | null, targetKeywords?: JobKeywords | null) => {
  const checksSummary = [
    `Email found: ${checks.hasEmail}`,
    `Phone number found: ${checks.hasPhone}`,
    `Education section found: ${checks.hasEducationSection}`,
    `Experience section found: ${checks.hasExperienceSection}`,
    `Consistent date range found: ${checks.hasDateRange}`,
    `Lines with a quantified result (numbers, %, $): ${checks.quantifiedLineCount} of ${checks.totalLineCount}`,
    `Lines starting with strong professional action verbs: ${checks.actionVerbLineCount} of ${checks.totalLineCount}`,
  ].join('\n');

  let jobSection = '';

  if (job) {
    jobSection = `The candidate is targeting this specific job:
Title: ${job.title}
Company: ${job.company}
Job description:
${job.jdText ?? '(no job description provided)'}`;

    // Inject the structured keywords if they were successfully extracted by the first pass
    if (targetKeywords) {
      const allTerms = [...targetKeywords.coreCompetencies, ...targetKeywords.requirements];
      const occurrenceCounts = allTerms.map((term) => `${term}: ${countOccurrences(resume.text, term)}`).join(', ');

      jobSection += `\n\nHere is a pre-extracted checklist of the target keywords found in this job description. Use these EXACT terms to cross-reference against the resume:
- Core Competencies: ${JSON.stringify(targetKeywords.coreCompetencies)}
- Hard Requirements/Tools: ${JSON.stringify(targetKeywords.requirements)}

Here is how many times each term literally appears in the resume text, computed automatically - treat these counts as ground truth, do not recount them yourself:
${occurrenceCounts}`;
    }
  } else {
    jobSection =
      'No specific job was provided - give general ATS and resume-quality feedback, not job-specific keyword matching. Return empty arrays for matchedKeywords and missingKeywords.';
  }

  return `You are an ATS (Applicant Tracking System) resume reviewer. Ground your review in the resume text below - it is complete and final, do not assume information that isn't in it, and never invent experience, metrics, or skills the candidate doesn't already claim.

A set of automated formatting checks already ran against this resume. Treat them as ground truth, do not re-derive them yourself:
${checksSummary}

${jobSection}

Resume text:
${resume.text}

Write a short (2-3 sentence) summary of the resume's overall strength. 

If a job was given:
1. Cross-reference the resume text directly against the Core Competencies and Hard Requirements lists provided above.
2. For each term that appears at least once, classify it in "contextFound" using the occurrence counts given above:
   - "Strong": used within a concrete achievement or experience bullet (e.g. "Led a team using React to ship...", not just listed on its own).
   - "Mentioned Only": appears once, only in a skills list or passing mention, with no supporting example of actually using it.
   - "Keyword Stuffed": the occurrence count is unusually high (roughly 4 or more) relative to how substantively it's used, or it's crammed into a list without natural sentence context. This is a red flag to call out, not a bonus.
3. For terms with an occurrence count of 0, add them to "missingKeywords" with an "importance" (High/Medium/Low - how central this term is to THIS job's requirements) and a one-sentence "reason" grounded in this specific JD and this specific resume, not generic advice.
4. Do not invent new keywords outside of the provided lists.

Give 2-4 pieces of section-level feedback, grounded in the automated checks above where relevant (e.g., commenting if they lack quantified metrics or start too few lines with action verbs). For each one, set "category" to the ATS category it most affects (Searchability, Impact & Metrics, Skills Match, Grammar and Spelling, or Structure & Clarity) and "severity" (Critical = blocks ATS parsing or clearly costs points, Important = meaningfully affects it, Minor = small polish).

Give 1-3 concrete rewrite suggestions: quote the actual "before" text from the resume exactly, propose an "after" version, and explain why it's stronger. The "before" block MUST be a literal word-for-word string match from the resume text so it can be located by the frontend.`;
};

const scoreChecks = (checks: ResumeChecks): number => {
  const passes = [checks.hasEmail, checks.hasPhone, checks.hasEducationSection, checks.hasExperienceSection, checks.hasDateRange];
  const passRate = passes.filter(Boolean).length / passes.length;

  // Expect roughly 20% of lines to have a quantifiable metric
  const quantifiedTarget = Math.max(4, Math.round(checks.totalLineCount * 0.2));
  const quantifiedRatio = checks.totalLineCount === 0 ? 0 : Math.min(1, checks.quantifiedLineCount / quantifiedTarget);

  // Expect roughly 40% of lines to start with strong action verbs (standard bullet metrics)
  const actionVerbTarget = Math.max(6, Math.round(checks.totalLineCount * 0.4));
  const actionVerbRatio = checks.totalLineCount === 0 ? 0 : Math.min(1, checks.actionVerbLineCount / actionVerbTarget);

  // Balance out structural basics, metrics, and verb choices
  return passRate * 0.5 + quantifiedRatio * 0.25 + actionVerbRatio * 0.25;
};

type MatchedKeyword = AuditLLMResult['matchedKeywords'][number];

// String match = full credit
// Mentioned Only = half credit
// Keyword Stuffed = penalty
const KEYWORD_CONTEXT_WEIGHTS: Record<MatchedKeyword['contextFound'], number> = {
  Strong: 1,
  'Mentioned Only': 0.5,
  'Keyword Stuffed': -0.5,
};

type MissingKeyword = AuditLLMResult['missingKeywords'][number];

const IMPORTANCE_ORDER: Record<MissingKeyword['importance'], number> = { High: 0, Medium: 1, Low: 2 };

type SectionFeedbackItem = AuditLLMResult['sectionFeedback'][number];

const SEVERITY_ORDER: Record<SectionFeedbackItem['severity'], number> = { Critical: 0, Important: 1, Minor: 2 };

const scoreKeywords = (matched: MatchedKeyword[], missing: MissingKeyword[]): number => {
  const total = matched.length + missing.length;
  if (total === 0) return 1;

  const weightedScore = matched.reduce((sum, { contextFound }) => sum + KEYWORD_CONTEXT_WEIGHTS[contextFound], 0);
  // Clamp so a bunch of stuffed keywords can't drag the ratio below 0, and
  // also can't push it above a full match
  return Math.max(0, Math.min(total, weightedScore)) / total;
};

// The numeric score is computed here, deterministically
// not from LLM bc an LLM-generated score is inconsistent between runs
// The LLM only produces the qualitative parts (summary, keyword lists, feedback)
const computeScore = (checks: ResumeChecks, llmResult: AuditLLMResult, hasJob: boolean): number => {
  const checksScore = scoreChecks(checks);
  if (!hasJob) return Math.round(checksScore * 100);

  const keywordScore = scoreKeywords(llmResult.matchedKeywords, llmResult.missingKeywords);
  return Math.round((checksScore * 0.4 + keywordScore * 0.6) * 100);
};

export const runAudit = async (resume: Resume, job: Job | null): Promise<AuditResult> => {
  const checks = runResumeChecks(resume.text);

  let targetKeywords = null;

  // Only extract keywords if a job description actually exists
  if (job?.jdText) {
    const keywordPrompt = `Extract the core competencies and hard requirements from this job description:\n\n${job.jdText}`;
    targetKeywords = await generateStructured(keywordPrompt, JobKeywordsSchema);
  }

  // Pass targetKeywords into your prompt builder so the LLM has a strict checklist
  const prompt = buildPrompt(resume, checks, job, targetKeywords);
  const llmResult = await generateStructured(prompt, AuditLLMResultSchema);
  const score = computeScore(checks, llmResult, job !== null);

  // Sort deterministically in code rather than trusting the model's
  // ordering - High/Medium/Low, highest first.
  const missingKeywords = [...llmResult.missingKeywords].sort(
    (a, b) => IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance],
  );

  // Same for feedback - Critical first, then Important, then Minor.
  const sectionFeedback = [...llmResult.sectionFeedback].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return { ...llmResult, missingKeywords, sectionFeedback, score, checks };
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
    model: LLM_MODEL,
  };

  if (existing) {
    return db.audit.update({ where: { id: existing.id }, data });
  }
  return db.audit.create({ data });
};
