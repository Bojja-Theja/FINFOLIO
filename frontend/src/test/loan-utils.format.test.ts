import { describe, expect, test } from 'vitest';
import { formatInr } from '@/utils/loanRecommendation';

describe('loanRecommendation formatInr', () => {
  test('formats integers as INR labels', () => {
    expect(formatInr(125000)).toBe('Rs.1,25,000');
  });
});
