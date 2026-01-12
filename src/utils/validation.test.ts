import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeString,
  validateContactForm,
  checkRateLimit
} from './validation';

describe('isValidEmail', () => {
  it('should return true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('should return true for valid phone numbers', () => {
    expect(isValidPhone('+32 477 94 28 65')).toBe(true);
    expect(isValidPhone('+1-234-567-8900')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('0477942865')).toBe(true);
  });

  it('should return true for empty phone (optional field)', () => {
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone('   ')).toBe(true);
  });

  it('should return false for invalid phone numbers', () => {
    expect(isValidPhone('abc')).toBe(false);
    expect(isValidPhone('123-abc-4567')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidPhone(null as unknown as string)).toBe(false);
    expect(isValidPhone(undefined as unknown as string)).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('should return true for valid URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://test.org/path')).toBe(true);
    expect(isValidUrl('example.com')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('should escape special characters', () => {
    expect(sanitizeString('test & value')).toBe('test &amp; value');
    expect(sanitizeString('a < b > c')).toBe('a &lt; b &gt; c');
    expect(sanitizeString("it's a test")).toBe('it&#x27;s a test');
  });

  it('should handle empty/null values', () => {
    expect(sanitizeString('')).toBe('');
    expect(sanitizeString(null as unknown as string)).toBe('');
    expect(sanitizeString(undefined as unknown as string)).toBe('');
  });

  it('should not modify safe strings', () => {
    expect(sanitizeString('Hello World')).toBe('Hello World');
    expect(sanitizeString('Simple text 123')).toBe('Simple text 123');
  });
});

describe('validateContactForm', () => {
  it('should validate a correct form', () => {
    const result = validateContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a test message that is long enough.',
      company: 'Test Company'
    });

    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should reject invalid email', () => {
    const result = validateContactForm({
      name: 'John Doe',
      email: 'invalid-email',
      message: 'This is a test message.'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('should reject short name', () => {
    const result = validateContactForm({
      name: 'J',
      email: 'john@example.com',
      message: 'This is a test message.'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('should reject short message', () => {
    const result = validateContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Short'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });

  it('should sanitize input data', () => {
    const result = validateContactForm({
      name: '<script>John</script>',
      email: 'john@example.com',
      message: 'This is a test message with <b>HTML</b>.'
    });

    expect(result.sanitizedData.name).not.toContain('<script>');
    expect(result.sanitizedData.message).not.toContain('<b>');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset rate limit state between tests by using unique keys
  });

  it('should allow requests within limit', () => {
    const key = `test-${Date.now()}-1`;
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
    expect(checkRateLimit(key, 3, 60000)).toBe(true);
  });

  it('should block requests over limit', () => {
    const key = `test-${Date.now()}-2`;
    checkRateLimit(key, 2, 60000);
    checkRateLimit(key, 2, 60000);
    expect(checkRateLimit(key, 2, 60000)).toBe(false);
  });

  it('should use separate limits for different keys', () => {
    const key1 = `test-${Date.now()}-3a`;
    const key2 = `test-${Date.now()}-3b`;

    checkRateLimit(key1, 1, 60000);
    expect(checkRateLimit(key1, 1, 60000)).toBe(false);
    expect(checkRateLimit(key2, 1, 60000)).toBe(true);
  });
});
