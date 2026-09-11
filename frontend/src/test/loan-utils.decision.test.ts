import { describe, expect, test } from 'vitest';
import { getDecisionBadgeClass } from '@/utils/loanRecommendation';

describe('loanRecommendation getDecisionBadgeClass', () => {
  test('maps decision states to bootstrap badge styles', () => {
    expect(getDecisionBadgeClass('approved')).toBe('bg-success');
    expect(getDecisionBadgeClass('review')).toContain('bg-warning');
    expect(getDecisionBadgeClass('declined')).toBe('bg-danger');
  });
});
