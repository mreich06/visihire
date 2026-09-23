import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

const ResultsDashboard = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('rounded-xl bg-zinc-100', className)} {...props} />;
};

export default ResultsDashboard;
