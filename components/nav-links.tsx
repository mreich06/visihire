'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const LINKS = [
  { href: '/application-board', label: 'Applications' },
  { href: '/resume-checker', label: 'Resume Checker' },
];

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <div className="hidden items-center gap-6 text-sm md:flex">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'transition-colors',
              active ? 'font-medium text-primary-600' : 'text-zinc-500 hover:text-zinc-900',
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
};
