import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../test/test-utils';
import Footer from './Footer';

// Mock Newsletter to isolate Footer tests
vi.mock('./Newsletter', () => ({
  default: () => <div data-testid="newsletter-mock">Newsletter</div>,
}));

describe('Footer', () => {
  it('should render company name', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('AInspiration')).toBeInTheDocument();
  });

  it('should render contact info', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('+32 477 94 28 65')).toBeInTheDocument();
    expect(screen.getByText('info@ainspiration.eu')).toBeInTheDocument();
  });

  it('should render address', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText('Chaussée Brunehault 27')).toBeInTheDocument();
    expect(screen.getByText('7041 Givry')).toBeInTheDocument();
    expect(screen.getByText('Belgique')).toBeInTheDocument();
  });

  it('should render legal links', () => {
    renderWithProviders(<Footer />);
    const privacyLink = screen.getByText('Confidentialité');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');

    const cguLink = screen.getByText('CGU');
    expect(cguLink).toBeInTheDocument();
    expect(cguLink.closest('a')).toHaveAttribute('href', '/cgu');
  });

  it('should render current year in copyright', () => {
    renderWithProviders(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${year}`))).toBeInTheDocument();
  });

  it('should render Newsletter component', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByTestId('newsletter-mock')).toBeInTheDocument();
  });

  it('should render feature links', () => {
    renderWithProviders(<Footer />);
    const auditLink = screen.getByText('Audit IA');
    expect(auditLink.closest('a')).toHaveAttribute('href', '#audit');
  });
});
