import { AlertTriangle, Bookmark, CheckCircle2, ChevronRight, Lightbulb, RefreshCw } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';

export interface ScoreCategory {
  label: string;
  score: number;
  issueCount: number;
}

export interface TriageCounts {
  critical: number;
  improvements: number;
  strengths: number;
}

interface ScoreSummaryCardProps {
  score: number;
  grade: string;
  summary: string;
  categories: ScoreCategory[];
  triage: TriageCounts;
  onCheckAnother: () => void;
  // Only shown when provided - i.e. when the audit was run against a
  // selected job, not a general (job-less) check.
  onSaveToJob?: () => void;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const gradeTone = (score: number) => (score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger');
const gradeColor = (score: number) => (score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger');

const ScoreRing = ({ score }: { score: number }) => {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={RADIUS} strokeWidth="10" className="fill-none stroke-zinc-100" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          stroke="currentColor"
          className={cn('fill-none transition-[stroke-dashoffset] duration-700 ease-out', gradeColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-zinc-900">{score}</span>
        <span className="text-xs text-zinc-400">/100</span>
      </div>
    </div>
  );
};

const CategoryBar = ({ label, score, issueCount }: ScoreCategory) => {
  const barColor = issueCount === 0 ? 'bg-success' : issueCount <= 3 ? 'bg-primary-500' : 'bg-danger';
  const labelColor = issueCount === 0 ? 'text-success' : issueCount <= 3 ? 'text-primary-600' : 'text-danger';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className={cn('shrink-0 text-xs font-medium', labelColor)}>
          {issueCount === 0 ? 'No issues' : `${issueCount} issue${issueCount === 1 ? '' : 's'} to fix`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor)}
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
};

const TRIAGE_CONFIG = [
  {
    key: 'critical' as const,
    label: 'Must Fix',
    description: 'Needs your attention first',
    icon: AlertTriangle,
    tone: 'danger' as const,
  },
  {
    key: 'improvements' as const,
    label: 'Suggestions',
    description: 'Could meaningfully boost your score',
    icon: Lightbulb,
    tone: 'warning' as const,
  },
  {
    key: 'strengths' as const,
    label: 'Working Well',
    description: "Already solid, don't touch these",
    icon: CheckCircle2,
    tone: 'success' as const,
  },
];

const triageToneClasses: Record<'danger' | 'warning' | 'success', { bg: string; text: string }> = {
  danger: { bg: 'bg-danger-soft', text: 'text-danger' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning' },
  success: { bg: 'bg-success-soft', text: 'text-success' },
};

const TriageList = ({ counts }: { counts: TriageCounts }) => (
  <div className="flex flex-col gap-1">
    {TRIAGE_CONFIG.map(({ key, label, description, icon: Icon, tone }) => (
      <div key={key} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-50">
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', triageToneClasses[tone].bg)}>
          <Icon className={cn('h-4 w-4', triageToneClasses[tone].text)} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">
            {counts[key]} {label}
          </p>
          <p className="truncate text-xs text-zinc-500">{description}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" />
      </div>
    ))}
  </div>
);

export const ScoreSummaryCard = ({
  score,
  grade,
  summary,
  categories,
  triage,
  onCheckAnother,
  onSaveToJob,
}: ScoreSummaryCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-col items-center gap-3">
          <ScoreRing score={score} />
          <Badge tone={gradeTone(score)}>{grade}</Badge>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {categories.map((category) => (
            <CategoryBar key={category.label} {...category} />
          ))}
        </div>

        <div className="w-full shrink-0 border-t border-zinc-100 pt-6 lg:w-64 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <TriageList counts={triage} />
        </div>
      </div>

      <p className="mt-6 border-t border-zinc-100 pt-6 text-sm leading-relaxed text-zinc-600">{summary}</p>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-6">
        <Button variant="outline" onClick={onCheckAnother}>
          <RefreshCw className="h-4 w-4" />
          Check another resume
        </Button>

        {onSaveToJob && (
          <Button variant="primary" onClick={onSaveToJob}>
            <Bookmark className="h-4 w-4" />
            Save to job
          </Button>
        )}
      </div>
    </Card>
  );
};
