import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import type { AuditResult } from '@/lib/audit';
import { ReportTabs } from './report-tabs';
import { ScoreSummaryCard, type ScoreCategory, type TriageCounts } from './score-summary-card';

interface ResultsDashboardProps extends HTMLAttributes<HTMLDivElement> {
  result: AuditResult;
  onCheckAnother: () => void;
  onSaveToJob?: () => void;
}

const gradeLabel = (score: number) => (score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work');

const structuralChecks = (checks: AuditResult['checks']) => [
  checks.hasEmail,
  checks.hasPhone,
  checks.hasEducationSection,
  checks.hasExperienceSection,
  checks.hasDateRange,
];

const buildCategories = (result: AuditResult): ScoreCategory[] => {
  const { checks, matchedKeywords, missingKeywords, sectionFeedback } = result;

  const searchabilityChecks = structuralChecks(checks);
  const searchabilityIssues = searchabilityChecks.filter((passed) => !passed).length;

  const quantifiedRatio = checks.totalLineCount === 0 ? 0 : checks.quantifiedLineCount / checks.totalLineCount;
  const actionVerbRatio = checks.totalLineCount === 0 ? 0 : checks.actionVerbLineCount / checks.totalLineCount;
  const impactIssues = (quantifiedRatio < 0.15 ? 1 : 0) + (actionVerbRatio < 0.3 ? 1 : 0);

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const skillsScore = totalKeywords === 0 ? 100 : Math.round((matchedKeywords.length / totalKeywords) * 100);

  const feedbackByCategory = (category: ScoreCategory['label']) =>
    sectionFeedback.filter((item) => item.category === category).length;

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
    {
      label: 'Grammar and Spelling',
      score: Math.max(0, 100 - feedbackByCategory('Grammar and Spelling') * 20),
      issueCount: feedbackByCategory('Grammar and Spelling'),
    },
    {
      label: 'Structure & Clarity',
      score: Math.max(0, 100 - feedbackByCategory('Structure & Clarity') * 15),
      issueCount: feedbackByCategory('Structure & Clarity'),
    },
  ];
};

const buildTriage = (result: AuditResult): TriageCounts => {
  const { checks, matchedKeywords, sectionFeedback } = result;
  const checksList = structuralChecks(checks);

  return {
    critical: checksList.filter((passed) => !passed).length,
    improvements: sectionFeedback.length,
    strengths: checksList.filter(Boolean).length + matchedKeywords.filter((k) => k.contextFound === 'Strong').length,
  };
};

const ResultsDashboard = ({ className, result, onCheckAnother, onSaveToJob, ...props }: ResultsDashboardProps) => {
  const categories = buildCategories(result);

  return (
    <div className={cn('flex flex-col gap-4 rounded-xl bg-zinc-50 p-4', className)} {...props}>
      <ScoreSummaryCard
        score={result.score}
        grade={gradeLabel(result.score)}
        summary={result.summary}
        categories={categories}
        triage={buildTriage(result)}
        onCheckAnother={onCheckAnother}
        onSaveToJob={onSaveToJob}
      />

      <ReportTabs
        categories={categories}
        sectionFeedback={result.sectionFeedback}
        missingKeywords={result.missingKeywords}
        rewriteSuggestions={result.rewriteSuggestions}
      />
    </div>
  );
};

export default ResultsDashboard;
