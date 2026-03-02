import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Suppress console.error for expected errors in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

function ProblemChild(): JSX.Element {
  throw new Error('Test error');
}

function GoodChild() {
  return <div>All good</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('should render error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Oups')).toBeInTheDocument();
    expect(screen.getByText('Une erreur est survenue')).toBeInTheDocument();
  });

  it('should show refresh and home buttons on error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText('Rafraîchir')).toBeInTheDocument();
    expect(screen.getByText('Accueil')).toBeInTheDocument();
  });

  it('should link home button to root', () => {
    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    const homeLink = screen.getByText('Accueil').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
