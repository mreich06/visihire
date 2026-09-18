import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-xl border border-zinc-200 bg-white shadow-sm', className)}
    {...props}
  />
);
