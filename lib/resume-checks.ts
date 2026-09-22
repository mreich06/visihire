export interface ResumeChecks {
  hasEmail: boolean;
  hasPhone: boolean;
  hasEducationSection: boolean;
  hasExperienceSection: boolean;
  hasDateRange: boolean;
  quantifiedLineCount: number;
  totalLineCount: number;
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const EDUCATION_RE = /\beducation\b/i;
const EXPERIENCE_RE = /\b(experience|work history|employment)\b/i;
const DATE_RANGE_RE = /\b(19|20)\d{2}\b.{0,15}(present|current|(19|20)\d{2})/i;
const QUANTIFIED_RE = /\d+(\.\d+)?\s?(%|percent|\+|k\b|m\b|million|thousand|\$)/i;

// Heuristic, regex-based checks
// fast, free, and fully deterministic, no need to cache
export const runResumeChecks = (resumeText: string): ResumeChecks => {
  const lines = resumeText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    hasEmail: EMAIL_RE.test(resumeText),
    hasPhone: PHONE_RE.test(resumeText),
    hasEducationSection: EDUCATION_RE.test(resumeText),
    hasExperienceSection: EXPERIENCE_RE.test(resumeText),
    hasDateRange: DATE_RANGE_RE.test(resumeText),
    quantifiedLineCount: lines.filter((line) => QUANTIFIED_RE.test(line)).length,
    totalLineCount: lines.length,
  };
};
