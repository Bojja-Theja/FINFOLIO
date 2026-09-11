import { calculateScoreFromData } from '../services/healthScoreService';

describe('healthScoreService', () => {
    test('should calculate a high score for stable financial data', () => {
        const stableData = {
            monthlyIncome: 10000,
            monthlyExpenses: 4000,
            savingsRate: 0.6,
            emergencyFundMonths: 12,
            debtToIncomeRatio: 0.1,
            incomeStability: 0.9,
            investmentDiversification: 0.8
        };

        const result = calculateScoreFromData(stableData);
        expect(result.totalScore).toBeGreaterThanOrEqual(80);
        expect(result.grade).toMatch(/A/);
    });

    test('should calculate a low score for poor financial data', () => {
        const poorData = {
            monthlyIncome: 3000,
            monthlyExpenses: 2800,
            savingsRate: 0.05,
            emergencyFundMonths: 1,
            debtToIncomeRatio: 0.6,
            incomeStability: 0.3,
            investmentDiversification: 0.2
        };

        const result = calculateScoreFromData(poorData);
        expect(result.totalScore).toBeLessThan(50);
        expect(['C', 'D', 'F']).toContain(result.grade.charAt(0));
    });
});
