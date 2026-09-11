import { describe, it, expect } from 'vitest';
import { datasetService } from '../services/datasetService.js';
import { calculateSurvivalFromInputs } from '../services/survivalService.js';

describe('FinFolio Phase 10: Resilience & Career Datasets Integration', () => {
    describe('Dataset Analytics Summary', () => {
        it('should load precomputed analytics summary for all 6 datasets', () => {
            const summary = datasetService.getAnalyticsSummary();
            expect(summary).toBeDefined();
            expect(summary.datasets).toBeDefined();
            expect(summary.datasets.worldBankUnemployment).toBeDefined();
            expect(summary.datasets.indianPersonalFinance).toBeDefined();
            expect(summary.datasets.monthlySpendingSeasonality).toBeDefined();
            expect(summary.datasets.resumeSkillsExtraction).toBeDefined();
            expect(summary.datasets.jobSkillsRequirements).toBeDefined();
            expect(summary.datasets.aiJobRolePrediction).toBeDefined();
        });
    });

    describe('World Bank India Unemployment Dataset', () => {
        it('should provide accurate macroeconomic labor metrics', () => {
            const macroRisk = datasetService.getMacroUnemploymentRisk();
            expect(macroRisk).toBeDefined();
            expect(macroRisk.latest.year).toBe(2024);
            expect(macroRisk.latest.ratePct).toBeGreaterThan(3.5);
            expect(macroRisk.latest.ratePct).toBeLessThan(6.0);
            expect(macroRisk.laborShockFactor).toBeGreaterThan(1.0);
            expect(macroRisk.recommendedEmergencyBufferMonths).toBeGreaterThanOrEqual(3.0);
        });
    });

    describe('Indian Personal Finance & Spending Habits Dataset', () => {
        it('should provide benchmarks across Tier 1, Tier 2, and Tier 3 cities', () => {
            const benchmarks = datasetService.getIndianFinanceBenchmarks();
            expect(benchmarks.nationalAvgIncomeINR).toBeGreaterThan(50000);
            expect(benchmarks.nationalAvgSavingsRatePct).toBeGreaterThan(20);
            expect(benchmarks.byCityTier['Tier 1']).toBeDefined();
            expect(benchmarks.byCityTier['Tier 2']).toBeDefined();
            expect(benchmarks.byCityTier['Tier 3']).toBeDefined();
        });

        it('should accurately compare a user profile against city-tier benchmarks', () => {
            const comparison = datasetService.compareAgainstBenchmark({
                income: 120000,
                savingsRate: 35,
                discretionaryRatio: 15,
                cityTier: 'Tier 1',
            });
            expect(comparison.cityTier).toBe('Tier 1');
            expect(comparison.comparison.incomePercentOfBenchmark).toBeGreaterThan(100);
            expect(comparison.comparison.isAboveAverageSavings).toBe(true);
            expect(comparison.recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('Monthly Spending Dataset – India', () => {
        it('should detect seasonal expenditure spikes and inflation indicators', () => {
            const spending = datasetService.getMonthlySpendingTrends();
            expect(spending.avgInflationCPIPct).toBeGreaterThan(3.0);
            expect(spending.festivalSpikePct).toBeGreaterThan(15.0);
            expect(spending.festivalPeakMonths).toContain('October');
            expect(spending.festivalPeakMonths).toContain('November');
        });
    });

    describe('Job Skills & AI Resume Role Prediction Datasets', () => {
        it('should perform skill gap analysis against target role requirements', () => {
            const gap = datasetService.getCareerSkillGap('Senior Data Scientist', ['Python', 'SQL', 'Pandas']);
            expect(gap.targetRole).toBe('Senior Data Scientist');
            expect(gap.matchingSkills).toContain('Python');
            expect(gap.missingSkills.length).toBeGreaterThan(0);
            expect(gap.matchPercentage).toBeGreaterThanOrEqual(0);
            expect(gap.matchPercentage).toBeLessThanOrEqual(100);
            expect(gap.upskillingRecommendation).toBeDefined();
        });
    });

    describe('Resume / CV Skills Extraction Dataset', () => {
        it('should expose resume domains and extracted technical keywords', () => {
            const domains = datasetService.getResumeDomainKeywords();
            expect(domains.totalResumes).toBeGreaterThan(500);
            expect(domains.uniqueDomains).toBeGreaterThan(10);
            expect(domains.categoryDistribution['Data Science']).toBeDefined();
        });
    });

    describe('Dynamic Survival Calculation Grounding', () => {
        it('should calculate survival months with macro-adjusted job loss scenario', () => {
            const survival = calculateSurvivalFromInputs({
                emergencyFund: 300000,
                monthlyExpenses: 50000,
                monthlyIncome: 80000,
                incomeStability: 0.8,
                hasSideIncome: false,
                dependents: 1,
                location: 'metro',
                jobSecurity: 0.8,
            });

            expect(survival.months).toBeGreaterThan(0);
            expect(survival.scenarios.jobLoss).toBeGreaterThan(0);
            expect(survival.scenarios.jobLoss).toBeLessThanOrEqual(survival.breakdown.conservativeMonths);
            expect(survival.recommendations.length).toBeGreaterThan(0);
        });
    });
});
