import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/components/workflow-section', () => ({
  default: () => <div data-testid="workflow-section" />,
}));

import Home from './page';

describe('Home', () => {
  it('renders the hero headline', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: /this one helps you stand out/i }),
    ).toBeInTheDocument();
  });

  it('links the primary CTAs to signup and login', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '/signup');
    expect(screen.getAllByRole('link', { name: 'Log in' })[0]).toHaveAttribute('href', '/login');
  });

  it('renders all three feature cards', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'Application Tracker' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'ATS Scoring & Resumé Feedback' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Personalized Outreach' })).toBeInTheDocument();
  });

  it('renders the workflow section', () => {
    render(<Home />);
    expect(screen.getByTestId('workflow-section')).toBeInTheDocument();
  });
});
