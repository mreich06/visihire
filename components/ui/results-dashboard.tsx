import { useState } from 'react';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';
import type { AuditResult } from '@/lib/audit';
import { ReportTabs, type CategoryScrollRequest, type TabId } from './report-tabs';
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

// Every category's issue count is itemized sectionFeedback entries
// (Searchability/Impact & Metrics are generated in lib/audit.ts, the rest
// come from the LLM) - But Skills Match's items live in missingKeywords
// (the "Missing keywords" tab) rather than sectionFeedback.
const buildCategories = (result: AuditResult): ScoreCategory[] => {
  const { matchedKeywords, missingKeywords, sectionFeedback } = result;

  const feedbackByCategory = (category: ScoreCategory['label']) => sectionFeedback.filter((item) => item.category === category).length;

  const totalKeywords = matchedKeywords.length + missingKeywords.length;
  const skillsScore = totalKeywords === 0 ? 100 : Math.round((matchedKeywords.length / totalKeywords) * 100);

  const searchabilityIssues = feedbackByCategory('Searchability');
  const impactIssues = feedbackByCategory('Impact & Metrics');
  const grammarIssues = feedbackByCategory('Grammar and Spelling');
  const structureIssues = feedbackByCategory('Structure & Clarity');

  return [
    { label: 'Searchability', score: Math.max(0, 100 - searchabilityIssues * 20), issueCount: searchabilityIssues },
    { label: 'Impact & Metrics', score: Math.max(0, 100 - impactIssues * 25), issueCount: impactIssues },
    { label: 'Skills Match', score: skillsScore, issueCount: missingKeywords.length },
    { label: 'Grammar and Spelling', score: Math.max(0, 100 - grammarIssues * 20), issueCount: grammarIssues },
    { label: 'Structure & Clarity', score: Math.max(0, 100 - structureIssues * 15), issueCount: structureIssues },
  ];
};

const buildTriage = (result: AuditResult): TriageCounts => {
  const { checks, matchedKeywords, sectionFeedback } = result;

  return {
    critical: sectionFeedback.filter((item) => item.severity === 'Critical').length,
    improvements: sectionFeedback.length,
    strengths: structuralChecks(checks).filter(Boolean).length + matchedKeywords.filter((k) => k.contextFound === 'Strong').length,
  };
};

const ResultsDashboard = ({ className, result, onCheckAnother, onSaveToJob, ...props }: ResultsDashboardProps) => {
  const categories = buildCategories(result);
  const [activeTab, setActiveTab] = useState<TabId>('breakdown');
  const [scrollRequest, setScrollRequest] = useState<CategoryScrollRequest | null>(null);

  // Skills Match's items live in the "Missing keywords" tab (they come
  // from missingKeywords, not sectionFeedback), so it switches tabs instead
  // of scrolling within the breakdown panel.
  const handleSelectCategory = (label: string) => {
    if (label === 'Skills Match') {
      setActiveTab('keywords');
    } else {
      setActiveTab('breakdown');
      setScrollRequest({ label, token: Date.now() });
    }
  };

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
        onSelectCategory={handleSelectCategory}
      />

      <ReportTabs
        categories={categories}
        sectionFeedback={result.sectionFeedback}
        missingKeywords={result.missingKeywords}
        rewriteSuggestions={result.rewriteSuggestions}
        active={activeTab}
        onActiveChange={setActiveTab}
        scrollRequest={scrollRequest}
      />
    </div>
  );
};

export default ResultsDashboard;
