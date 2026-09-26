import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button, buttonClasses } from './button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('defaults to the primary variant', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });

  it.each([
    ['secondary', 'bg-zinc-900'],
    ['tertiary', 'bg-primary-200'],
    ['outline', 'border-zinc-200'],
    ['ghost', 'text-zinc-600'],
    ['danger', 'text-danger'],
  ] as const)('applies the %s variant classes', (variant, expectedClass) => {
    render(<Button variant={variant}>Save</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('is disabled and gets the disabled cursor class when disabled', () => {
    render(<Button disabled>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });

  it('merges a custom className with the variant classes', () => {
    render(<Button className="mt-auto">Save</Button>);
    expect(screen.getByRole('button')).toHaveClass('mt-auto', 'bg-primary-600');
  });
});

describe('buttonClasses', () => {
  it('produces the same classes a real Button with the same variant would render', () => {
    render(<Button variant="secondary">Save</Button>);
    const rendered = screen.getByRole('button').className;

    expect(buttonClasses('secondary')).toBe(rendered);
  });

  it('defaults to the primary variant and md size', () => {
    expect(buttonClasses()).toContain('bg-primary-600');
    expect(buttonClasses()).toContain('px-4');
  });

  it('merges in a custom className', () => {
    expect(buttonClasses('primary', 'md', 'w-full')).toContain('w-full');
  });
});
