'use client';

import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { AuditResult } from '@/lib/audit';
import { Badge } from './badge';
import type { ScoreCategory } from './score-summary-card';

type MissingKeyword = AuditResult['missingKeywords'][number];
type SectionFeedbackItem = AuditResult['sectionFeedback'][number];

const importanceTone: Record<MissingKeyword['importance'], 'danger' | 'warning' | 'neutral'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};

const severityConfig: Record<SectionFeedbackItem['severity'], { icon: typeof AlertCircle; color: string }> = {
  Critical: { icon: AlertCircle, color: 'text-danger' },
  Important: { icon: AlertTriangle, color: 'text-warning' },
  Minor: { icon: Info, color: 'text-primary-500' },
};

interface ReportTabsProps {
  categories: ScoreCategory[];
  sectionFeedback: AuditResult['sectionFeedback'];
  missingKeywords: AuditResult['missingKeywords'];
  rewriteSuggestions: AuditResult['rewriteSuggestions'];
}

type TabId = 'breakdown' | 'suggestions' | 'keywords' | 'rewrites';

const TABS: { id: TabId; label: string }[] = [
  { id: 'breakdown', label: 'Score breakdown' },
  { id: 'suggestions', label: 'Suggestions' },
  { id: 'keywords', label: 'Missing keywords' },
  { id: 'rewrites', label: 'Rewrites' },
];

export const ReportTabs = ({ categories, sectionFeedback, missingKeywords, rewriteSuggestions }: ReportTabsProps) => {
  const [active, setActive] = useState<TabId>('breakdown');

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase">Explore your report</p>

      <div className="flex gap-1 rounded-full bg-zinc-50 p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={cn(
              'relative flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active === id ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {active === id && (
              <motion.div
                layoutId="report-tabs-highlight"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {active === 'breakdown' && (
          <div className="flex flex-col gap-6">
            {categories.map((category) => {
              const fixes = sectionFeedback.filter((item) => item.category === category.label);

              return (
                <div key={category.label} className="border-b border-zinc-100 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-bold text-primary-600">{category.label}</h3>

                  {fixes.length > 0 ? (
                    <ul className="mt-3 flex flex-col gap-3">
                      {fixes.map((item, index) => {
                        const { icon: Icon, color } = severityConfig[item.severity];

                        return (
                          <li key={index} className="flex gap-2.5">
                            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', color)} />
                            <div>
                              <p className="text-sm font-semibold text-primary-600">{item.section}</p>
                              <p className="mt-0.5 text-sm font-medium text-zinc-900">{item.issue}</p>
                              <p className="mt-0.5 text-sm text-zinc-500">{item.suggestion}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-zinc-400">No issues found.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {active === 'suggestions' &&
          (sectionFeedback.length > 0 ? (
            <div className="flex flex-col gap-3">
              {sectionFeedback.map((item, index) => (
                <div key={index} className="rounded-lg border border-zinc-100 p-3">
                  <p className="text-sm font-semibold text-primary-600">{item.section}</p>
                  <p className="mt-1 text-sm font-medium text-zinc-900">{item.issue}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.suggestion}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No section feedback - nice work.</p>
          ))}

        {active === 'keywords' &&
          (missingKeywords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs text-zinc-400 uppercase tracking-wide">
                    <th className="pb-2 pr-4 font-semibold">Keyword</th>
                    <th className="pb-2 pr-4 font-semibold">Importance</th>
                    <th className="pb-2 font-semibold">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {missingKeywords.map((item) => (
                    <tr key={item.keyword} className="border-b border-zinc-50 align-top last:border-0">
                      <td className="py-2.5 pr-4 font-medium whitespace-nowrap text-zinc-900">{item.keyword}</td>
                      <td className="py-2.5 pr-4">
                        <Badge tone={importanceTone[item.importance]}>{item.importance}</Badge>
                      </td>
                      <td className="py-2.5 text-zinc-500">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No missing keywords found.</p>
          ))}

        {active === 'rewrites' &&
          (rewriteSuggestions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {rewriteSuggestions.map((item, index) => (
                <div key={index} className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-danger/20 bg-danger-soft p-3">
                    <p className="text-xs font-semibold tracking-wide text-danger uppercase">Before</p>
                    <p className="mt-1 text-sm text-zinc-700">{item.before}</p>
                  </div>
                  <div className="rounded-lg border border-success/20 bg-success-soft p-3">
                    <p className="text-xs font-semibold tracking-wide text-success uppercase">After</p>
                    <p className="mt-1 text-sm text-zinc-700">{item.after}</p>
                  </div>
                  <p className="text-xs text-zinc-500 sm:col-span-2">{item.rationale}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No rewrite suggestions.</p>
          ))}
      </div>
    </div>
  );
};
