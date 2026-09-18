import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export const GrayCard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('rounded-xl bg-zinc-200', className)} {...props} />
);
