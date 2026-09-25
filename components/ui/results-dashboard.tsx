import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import type { AuditResult } from '@/lib/audit';
import { ScoreSummaryCard, type ScoreCategory } from './score-summary-card';

interface ResultsDashboardProps extends HTMLAttributes<HTMLDivElement> {
  result: AuditResult;
}

const gradeLabel = (score: number) => (score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work');

const buildCategories = (result: AuditResult): ScoreCategory[] => {
  const { checks, matchedKeywords, missingKeywords, sectionFeedback } = result;

  const searchabilityChecks = [checks.hasEmail, checks.hasPhone, checks.hasEducationSection, checks.hasExperienceSection, checks.hasDateRange];
  const searchabilityIssues = searchabilityChecks.filter((passed) => !passed).length;

  const quantifiedRatio = checks.totalLineCount === 0 ? 0 : checks.quantifiedLineCount / checks.totalLineCount;
  const actionVerbRatio = checks.totalLineCount === 0 ? 0 : checks.actionVerbLineCount / checks.totalLineCount;
  const impactIssues = (quantifiedRatio < 0.15 ? 1 : 0) + (actionVerbRatio < 0.3 ? 1 : 0);

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const skillsScore = totalKeywords === 0 ? 100 : Math.round((matchedKeywords.length / totalKeywords) * 100);

  return [
    {
      label: 'Searchability',
      score: Math.round(((searchabilityChecks.length - searchabilityIssues) / searchabilityChecks.length) * 100),
      issueCount: searchabilityIssues,
    },
    {
      label: 'Impact & Metrics',
      score: Math.round(((quantifiedRatio + actionVerbRatio) / 2) * 100),
      issueCount: impactIssues,
    },
    {
      label: 'Skills Match',
      score: skillsScore,
      issueCount: missingKeywords.length,
    },
    // TODO: Add dedicated field on AuditLLMResultSchema for spelling/grammar
    { label: 'Grammar and Spelling', score: 100, issueCount: 0 },
    // stand-in using the general feedback count until sectionFeedback
    // carries its own category/severity - see lib/audit.ts.
    {
      label: 'Structure & Clarity',
      score: Math.max(0, 100 - sectionFeedback.length * 15),
      issueCount: sectionFeedback.length,
    },
  ];
};

const ResultsDashboard = ({ className, result, ...props }: ResultsDashboardProps) => {
  return (
    <div className={cn('flex flex-col gap-4 rounded-xl bg-zinc-50 p-4', className)} {...props}>
      <ScoreSummaryCard score={result.score} grade={gradeLabel(result.score)} summary={result.summary} categories={buildCategories(result)} />
    </div>
  );
};

export default ResultsDashboard;
