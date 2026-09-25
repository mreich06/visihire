import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
  secondary: 'bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-400',
  tertiary: 'bg-primary-200 text-zinc-600 hover:bg-orange-200 disabled:bg-orange-50 disabled:text-orange-300',
  outline: 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:text-zinc-400',
  ghost: 'text-zinc-600 hover:bg-zinc-100 disabled:text-zinc-300',
  danger: 'border border-danger/20 text-danger hover:bg-danger-soft disabled:border-transparent disabled:text-danger/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export const buttonClasses = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) =>
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', size = 'md', className, ...props }, ref) => (
  <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
));

Button.displayName = 'Button';
