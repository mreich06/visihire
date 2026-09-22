export interface ResumeChecks {
  hasEmail: boolean;
  hasPhone: boolean;
  hasEducationSection: boolean;
  hasExperienceSection: boolean;
  hasDateRange: boolean;
  quantifiedLineCount: number;
  actionVerbLineCount: number;
  totalLineCount: number;
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
const EDUCATION_RE = /\beducation\b/i;
const EXPERIENCE_RE = /\b(experience|work history|employment)\b/i;
const DATE_RANGE_RE = /\b(19|20)\d{2}\b.{0,15}(present|current|(19|20)\d{2})/i;
// Targets percentages, dollar values, and multiplier type values (like 5x, 20%, $50k)
// Avoids catching pure years or standard numbers
const QUANTIFIED_RE = /(?:\d+(?:\.\d+)?\s*(?:%|percent|x|X)\b)|(?:\$\s*\d+)/i;
const ACTION_VERB_RE =
  /^(?:Led|Managed|Developed|Created|Optimized|Organized|Coordinated|Executed|Supervised|Maintained|Assisted|Provided|Designed|Built|Implemented|Increased|Reduced|Improved|Trained|Scheduled|Handled|Formulated|Drafted|Analyzed|Monitored|Reviewed)\b/i;

// Heuristic, regex-based checks
// fast, free, and fully deterministic, no need to cache
export const runResumeChecks = (resumeText: string): ResumeChecks => {
  const lines = resumeText
    .split('\n')
    .map((line) => line.trim())
    // Clean up common bullet point characters so the regex checks the actual word
    .map((line) => line.replace(/^[\u2022\u00b7\u25a0\u2013-]\s*/, '').trim())
    .filter(Boolean);

  return {
    hasEmail: EMAIL_RE.test(resumeText),
    hasPhone: PHONE_RE.test(resumeText),
    hasEducationSection: EDUCATION_RE.test(resumeText),
    hasExperienceSection: EXPERIENCE_RE.test(resumeText),
    hasDateRange: DATE_RANGE_RE.test(resumeText),
    quantifiedLineCount: lines.filter((line) => QUANTIFIED_RE.test(line)).length,
    actionVerbLineCount: lines.filter((line) => ACTION_VERB_RE.test(line)).length,
    totalLineCount: lines.length,
  };
};
