import { describe, it, expect } from 'vitest';
import { parseMoney, formatINR, formatCompactINR } from '../src/lib/money.js';

describe('money.js Utilities', () => {
  it('parses various Indian currency notations correctly', () => {
    expect(parseMoney('8L')).toBe(800000);
    expect(parseMoney('8 L')).toBe(800000);
    expect(parseMoney('8 lakh')).toBe(800000);
    expect(parseMoney('8.5 lakh')).toBe(850000);
    expect(parseMoney('8.5L')).toBe(850000);
    expect(parseMoney('1.2 cr')).toBe(12000000);
    expect(parseMoney('1.2 crore')).toBe(12000000);
    expect(parseMoney('1 cr')).toBe(10000000);
    expect(parseMoney('45k')).toBe(45000);
    expect(parseMoney('45 thousand')).toBe(45000);
    expect(parseMoney('850000')).toBe(850000);
    expect(parseMoney('₹8,50,000')).toBe(850000);
    expect(parseMoney(150000)).toBe(150000);
  });

  it('handles empty or invalid money inputs gracefully', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney(null)).toBe(0);
    expect(parseMoney(undefined)).toBe(0);
    expect(parseMoney('abc')).toBe(0);
  });

  it('formats amounts in Indian numbering standard', () => {
    expect(formatINR(850000)).toMatch(/₹\s*8,50,000/);
    expect(formatINR(12000000)).toMatch(/₹\s*1,20,00,000/);
  });

  it('formats compact amounts cleanly', () => {
    expect(formatCompactINR(800000)).toBe('₹8 Lakh');
    expect(formatCompactINR(850000)).toBe('₹8.5 Lakh');
    expect(formatCompactINR(12000000)).toBe('₹1.2 Cr');
    expect(formatCompactINR(45000)).toBe('₹45k');
  });
});
