import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

import { NavLinks } from './nav-links';

describe('NavLinks', () => {
  it('highlights the link matching the current path', () => {
    usePathnameMock.mockReturnValue('/application-board');
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Applications' })).toHaveClass('text-primary-600');
    expect(screen.getByRole('link', { name: 'Resume Checker' })).not.toHaveClass('text-primary-600');
  });

  it('highlights nothing when the current path matches no link', () => {
    usePathnameMock.mockReturnValue('/profile');
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Applications' })).not.toHaveClass('text-primary-600');
    expect(screen.getByRole('link', { name: 'Resume Checker' })).not.toHaveClass('text-primary-600');
  });

  it('links to the right routes', () => {
    usePathnameMock.mockReturnValue('/application-board');
    render(<NavLinks />);

    expect(screen.getByRole('link', { name: 'Applications' })).toHaveAttribute(
      'href',
      '/application-board',
    );
    expect(screen.getByRole('link', { name: 'Resume Checker' })).toHaveAttribute(
      'href',
      '/resume-checker',
    );
  });
});
