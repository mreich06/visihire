'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface DropdownProps {
  label: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Dropdown = ({ label, children, className }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none transition-colors hover:border-zinc-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-zinc-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50',
      className,
    )}
    {...props}
  />
);
