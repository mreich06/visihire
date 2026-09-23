'use client';

import { FileText, FolderOpen, KanbanSquare, Send, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/application-board', label: 'Applications', icon: KanbanSquare },
  { href: '/resume-checker', label: 'Resume Checker', icon: FileText },
  { href: '/hiring-outreach', label: 'Hiring Outreach', icon: Send },
  { href: '/saved-documents', label: 'Saved Documents', icon: FolderOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col gap-1 rounded-xl bg-zinc-50 p-2 sm:flex">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {active && (
              <motion.div
                layoutId="app-sidebar-highlight"
                className="absolute inset-0 rounded-lg bg-white shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon className="relative z-10 h-4 w-4 shrink-0" />
            <span className="relative z-10 truncate">{label}</span>
          </Link>
        );
      })}
    </aside>
  );
};
