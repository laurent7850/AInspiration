import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../test/test-utils';
import Newsletter from './Newsletter';

// Mock the newsletter service
vi.mock('../services/newsletterService', () => ({
  addSubscriber: vi.fn(),
}));

describe('Newsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the newsletter form', () => {
    renderWithProviders(<Newsletter />);
    expect(screen.getByText('Newsletter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByText("S'abonner")).toBeInTheDocument();
  });

  it('should render description and privacy text', () => {
    renderWithProviders(<Newsletter />);
    expect(screen.getByText('Restez informé')).toBeInTheDocument();
    expect(screen.getByText('Respect vie privée')).toBeInTheDocument();
  });

  it('should allow typing in email field', () => {
    renderWithProviders(<Newsletter />);
    const input = screen.getByPlaceholderText('votre@email.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input).toHaveValue('test@example.com');
  });

  it('should show error for invalid email', async () => {
    renderWithProviders(<Newsletter />);
    const input = screen.getByPlaceholderText('votre@email.com');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });

  it('should show error for empty email', async () => {
    renderWithProviders(<Newsletter />);
    const input = screen.getByPlaceholderText('votre@email.com');
    const form = input.closest('form')!;

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText('Email invalide')).toBeInTheDocument();
    });
  });
});
