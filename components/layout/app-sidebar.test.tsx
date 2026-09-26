import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { usePathnameMock } = vi.hoisted(() => ({ usePathnameMock: vi.fn() }));

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

import { AppSidebar } from './app-sidebar';

describe('AppSidebar', () => {
  it('renders every nav item', () => {
    usePathnameMock.mockReturnValue('/application-board');
    render(<AppSidebar />);

    expect(screen.getByRole('link', { name: /applications/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resume checker/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /hiring outreach/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /saved documents/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('marks the link matching the current route as active', () => {
    usePathnameMock.mockReturnValue('/resume-checker');
    render(<AppSidebar />);

    expect(screen.getByRole('link', { name: /resume checker/i })).toHaveClass('text-zinc-900');
    expect(screen.getByRole('link', { name: /applications/i })).toHaveClass('text-zinc-500');
  });

  it('marks no link as active when the route matches none of them', () => {
    usePathnameMock.mockReturnValue('/profile');
    render(<AppSidebar />);

    for (const name of [/applications/i, /resume checker/i, /hiring outreach/i, /saved documents/i, /settings/i]) {
      expect(screen.getByRole('link', { name })).toHaveClass('text-zinc-500');
    }
  });

  it('points each link at its own route', () => {
    usePathnameMock.mockReturnValue('/application-board');
    render(<AppSidebar />);

    expect(screen.getByRole('link', { name: /applications/i })).toHaveAttribute('href', '/application-board');
    expect(screen.getByRole('link', { name: /hiring outreach/i })).toHaveAttribute('href', '/hiring-outreach');
  });
});
