import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
}

export const Field = ({ label, children }: FieldProps) => (
  <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
    {label}
    {children}
  </label>
);
