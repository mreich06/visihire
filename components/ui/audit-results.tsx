'use client';

import { Search, SpellCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import type { AuditResult } from '@/lib/audit';
import ResultsDashboard from './results-dashboard';
import SideMenu, { type MenuItem } from './side-menu';

interface AuditResultsProps {
  audit: AuditResult;
}

const AUDIT_MENU_ITEMS: MenuItem[] = [
  { id: 'searchability', title: 'Searchability', icon: Search },
  { id: 'quantifying-impact', title: 'Quantifying Impact', icon: TrendingUp },
  { id: 'spelling-and-grammar', title: 'Spelling and Grammar', icon: SpellCheck },
];

const AuditResults = ({ audit }: AuditResultsProps) => {
  const [selectedId, setSelectedId] = useState(AUDIT_MENU_ITEMS[0].id);

  // create ui for audit
  return (
    <div className="flex w-full max-w-5xl gap-6">
      <ResultsDashboard className="min-w-0 flex-1" result={audit} />
    </div>
  );
};

export default AuditResults;
