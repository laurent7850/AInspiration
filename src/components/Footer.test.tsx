import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../test/test-utils';
import Footer from './Footer';

// La newsletter a ete retiree du pied de page le 16/09/2026 : zero abonne actif
// et zero envoi en neuf mois, face a un appel a l'action bien plus fort sur la
// meme page (l'audit gratuit, qui alimente le CRM). Le mock reste en place pour
// que le test ci-dessous constate une ABSENCE et non un import manquant.
vi.mock('./Newsletter', () => ({
  default: () => <div data-testid="newsletter-mock">Newsletter</div>,
}));

describe('Footer', () => {
  it('should render company name', () => {
    renderWithProviders(<Footer />);
    // Brand name is split: "AI" (indigo) + "nspiration" (white)
    expect(
      screen.getByText((_, el) => el?.tagName === 'SPAN' && el.textContent === 'AInspiration')
    ).toBeInTheDocument();
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

  it('ne propose plus la newsletter dans le pied de page', () => {
    renderWithProviders(<Footer />);
    expect(screen.queryByTestId('newsletter-mock')).not.toBeInTheDocument();
  });

  it('should render feature links', () => {
    renderWithProviders(<Footer />);
    const auditLink = screen.getByText('Audit IA');
    expect(auditLink.closest('a')).toHaveAttribute('href', '/contact');
  });
});
