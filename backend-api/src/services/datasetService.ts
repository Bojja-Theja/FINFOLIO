import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SalaryData {
    yearsExperience: number;
    salary: number;
}

export interface TurnoverData {
    stag: number;
    event: number;
    gender: string;
    age: number;
    industry: string;
    profession: string;
    traffic: string;
    coach: string;
    head_gender: string;
    greywage: string;
    way: string;
    extraversion: number;
    independ: number;
    selfcontrol: number;
    anxiety: number;
    novator: number;
}

export interface StockData {
    date: string;
    AMZN: number;
    DPZ: number;
    BTC: number;
    NFLX: number;
}

export interface BenefitData {
    job_id: string;
    inferred: number;
    type: string;
}

class DatasetService {
    private datasetPath: string;
    private salaryData: SalaryData[] | null = null;
    private turnoverData: TurnoverData[] | null = null;
    private stockData: StockData[] | null = null;
    private benefitsData: BenefitData[] | null = null;

    constructor() {
        // Path to dataset folder (adjust based on your project structure)
        this.datasetPath = path.join(__dirname, '../../../dataset');
    }

    /**
     * Load and parse CSV file
     */
    private loadCSV<T>(filename: string): T[] {
        try {
            const filePath = path.join(this.datasetPath, filename);
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                cast: (value, context) => {
                    // Auto-cast numbers
                    if (context.column !== 'date' && context.column !== 'Date' && !isNaN(Number(value))) {
                        return Number(value);
                    }
                    return value;
                },
            });

            return records as T[];
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return [];
        }
    }

    /**
     * Get salary data
     */
    getSalaryData(): SalaryData[] {
        if (!this.salaryData) {
            const rawData = this.loadCSV<any>('Salary.csv');
            this.salaryData = rawData.map(row => ({
                yearsExperience: row.YearsExperience,
                salary: row.Salary,
            }));
        }
        return this.salaryData;
    }

    /**
     * Predict salary based on years of experience using linear regression
     */
    predictSalary(yearsExperience: number): number {
        const data = this.getSalaryData();

        if (data.length === 0) {
            return 0;
        }

        // Simple linear regression
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        data.forEach(point => {
            sumX += point.yearsExperience;
            sumY += point.salary;
            sumXY += point.yearsExperience * point.salary;
            sumX2 += point.yearsExperience * point.yearsExperience;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return Math.round(slope * yearsExperience + intercept);
    }

    /**
     * Get salary statistics
     */
    getSalaryStats() {
        const data = this.getSalaryData();

        if (data.length === 0) {
            return null;
        }

        const salaries = data.map(d => d.salary);
        const experiences = data.map(d => d.yearsExperience);

        return {
            avgSalary: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
            minSalary: Math.min(...salaries),
            maxSalary: Math.max(...salaries),
            avgExperience: experiences.reduce((a, b) => a + b, 0) / experiences.length,
            dataPoints: data.length,
        };
    }

    /**
     * Get turnover data
     */
    getTurnoverData(): TurnoverData[] {
        if (!this.turnoverData) {
            this.turnoverData = this.loadCSV<TurnoverData>('turnover.csv');
        }
        return this.turnoverData;
    }

    /**
     * Predict turnover risk based on user profile
     */
    predictTurnoverRisk(profile: {
        age: number;
        industry: string;
        profession: string;
        extraversion?: number;
        selfcontrol?: number;
        anxiety?: number;
    }): {
        riskScore: number;
        riskLevel: 'low' | 'medium' | 'high';
        factors: string[];
        recommendations: string[];
    } {
        const data = this.getTurnoverData();

        if (data.length === 0) {
            return {
                riskScore: 0,
                riskLevel: 'low',
                factors: [],
                recommendations: [],
            };
        }

        // Filter similar profiles
        const similarProfiles = data.filter(d =>
            d.industry.toLowerCase() === profile.industry.toLowerCase() &&
            Math.abs(d.age - profile.age) <= 5
        );

        // Calculate turnover rate
        const turnoverRate = similarProfiles.length > 0
            ? similarProfiles.filter(d => d.event === 1).length / similarProfiles.length
            : 0.3; // Default 30%

        // Adjust based on personality factors
        let adjustedRisk = turnoverRate;
        const factors: string[] = [];
        const recommendations: string[] = [];

        if (profile.anxiety && profile.anxiety > 6) {
            adjustedRisk += 0.1;
            factors.push('High anxiety level');
            recommendations.push('Consider stress management techniques');
        }

        if (profile.selfcontrol && profile.selfcontrol < 4) {
            adjustedRisk += 0.05;
            factors.push('Low self-control');
            recommendations.push('Work on goal-setting and discipline');
        }

        if (profile.extraversion && profile.extraversion < 4) {
            adjustedRisk += 0.05;
            factors.push('Low extraversion');
            recommendations.push('Build professional network');
        }

        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high';
        if (adjustedRisk < 0.3) {
            riskLevel = 'low';
        } else if (adjustedRisk < 0.6) {
            riskLevel = 'medium';
        } else {
            riskLevel = 'high';
        }

        return {
            riskScore: Math.round(adjustedRisk * 100),
            riskLevel,
            factors,
            recommendations,
        };
    }

    /**
     * Get stock data
     */
    getStockData(): StockData[] {
        if (!this.stockData) {
            const rawData = this.loadCSV<any>('stock/portfolio_data.csv');
            this.stockData = rawData.map(row => ({
                date: row.Date,
                AMZN: row.AMZN,
                DPZ: row.DPZ,
                BTC: row.BTC,
                NFLX: row.NFLX,
            }));
        }
        return this.stockData;
    }

    /**
     * Get latest stock prices
     */
    getLatestStockPrices() {
        const data = this.getStockData();

        if (data.length === 0) {
            return null;
        }

        const latest = data[data.length - 1];
        const previous = data[data.length - 2];

        return {
            AMZN: {
                price: latest.AMZN,
                change: latest.AMZN - previous.AMZN,
                changePercent: ((latest.AMZN - previous.AMZN) / previous.AMZN) * 100,
            },
            DPZ: {
                price: latest.DPZ,
                change: latest.DPZ - previous.DPZ,
                changePercent: ((latest.DPZ - previous.DPZ) / previous.DPZ) * 100,
            },
            BTC: {
                price: latest.BTC,
                change: latest.BTC - previous.BTC,
                changePercent: ((latest.BTC - previous.BTC) / previous.BTC) * 100,
            },
            NFLX: {
                price: latest.NFLX,
                change: latest.NFLX - previous.NFLX,
                changePercent: ((latest.NFLX - previous.NFLX) / previous.NFLX) * 100,
            },
            date: latest.date,
        };
    }

    /**
     * Get portfolio recommendations based on risk profile
     */
    getPortfolioRecommendations(riskProfile: 'conservative' | 'moderate' | 'aggressive') {
        const allocations = {
            conservative: {
                AMZN: 20,
                DPZ: 30,
                BTC: 10,
                NFLX: 40,
            },
            moderate: {
                AMZN: 30,
                DPZ: 25,
                BTC: 20,
                NFLX: 25,
            },
            aggressive: {
                AMZN: 25,
                DPZ: 15,
                BTC: 40,
                NFLX: 20,
            },
        };

        return {
            allocation: allocations[riskProfile],
            riskProfile,
            description: this.getRiskProfileDescription(riskProfile),
        };
    }

    private getRiskProfileDescription(profile: string): string {
        const descriptions = {
            conservative: 'Lower risk with stable returns. Focus on established companies.',
            moderate: 'Balanced approach with mix of growth and stability.',
            aggressive: 'Higher risk with potential for greater returns. Includes volatile assets.',
        };
        return descriptions[profile as keyof typeof descriptions] || '';
    }

    /**
     * Get benefits data
     */
    getBenefitsData(): BenefitData[] {
        if (!this.benefitsData) {
            this.benefitsData = this.loadCSV<BenefitData>('linkedinbenefits.csv');
        }
        return this.benefitsData;
    }

    /**
     * Get benefits for a specific job
     */
    getJobBenefits(jobId: string) {
        const data = this.getBenefitsData();
        return data.filter(b => b.job_id === jobId);
    }

    /**
     * Get benefits statistics
     */
    getBenefitsStats() {
        const data = this.getBenefitsData();

        if (data.length === 0) {
            return null;
        }

        // Count benefit types
        const benefitCounts: Record<string, number> = {};
        data.forEach(benefit => {
            benefitCounts[benefit.type] = (benefitCounts[benefit.type] || 0) + 1;
        });

        // Sort by frequency
        const sortedBenefits = Object.entries(benefitCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => ({ type, count }));

        return {
            totalBenefits: data.length,
            uniqueJobs: new Set(data.map(b => b.job_id)).size,
            topBenefits: sortedBenefits.slice(0, 10),
            allBenefits: sortedBenefits,
        };
    }

    /**
     * Compare benefits between jobs
     */
    compareBenefits(jobIds: string[]) {
        const comparison = jobIds.map(jobId => ({
            jobId,
            benefits: this.getJobBenefits(jobId),
        }));

        return comparison;
    }
    private h1bSummary: { jobTitle: string; avgWage: number; count: number }[] | null = null;

    /**
     * Get H1B stats (using a sampled or pre-calculated approach for the large file)
     */
    async getH1BSummary(): Promise<{ jobTitle: string; avgWage: number; count: number }[]> {
        if (this.h1bSummary) return this.h1bSummary;

        return new Promise((resolve) => {
            const filePath = path.join(this.datasetPath, 'h1b_kaggle.csv');
            if (!fs.existsSync(filePath)) {
                console.error('H1B dataset not found');
                resolve([]);
                return;
            }

            const stats: Record<string, { total: number; count: number }> = {};
            const stream = fs.createReadStream(filePath, 'utf-8');
            let isFirstLine = true;
            let buffer = '';

            stream.on('data', (chunk: any) => {
                buffer += chunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (isFirstLine) {
                        isFirstLine = false;
                        continue;
                    }

                    // Simple CSV split (not handling escaped commas for speed, assuming quotes are okay)
                    const parts = line.split(',');
                    if (parts.length < 7) continue;

                    const jobTitle = parts[4]?.replace(/"/g, '').trim();
                    const wage = parseFloat(parts[6]?.replace(/"/g, ''));

                    if (jobTitle && !isNaN(wage)) {
                        if (!stats[jobTitle]) {
                            stats[jobTitle] = { total: 0, count: 0 };
                        }
                        stats[jobTitle].total += wage;
                        stats[jobTitle].count += 1;
                    }
                }
            });

            stream.on('end', () => {
                const result = Object.entries(stats)
                    .map(([jobTitle, data]) => ({
                        jobTitle,
                        avgWage: Math.round(data.total / data.count),
                        count: data.count,
                    }))
                    .filter(item => item.count > 100) // Only include significant data
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 100); // Top 100 job titles

                this.h1bSummary = result;
                resolve(result);
            });

            stream.on('error', (err) => {
                console.error('Error reading H1B file:', err);
                resolve([]);
            });
        });
    }

    /**
     * Search H1B data for a specific title
     */
    async searchH1B(query: string) {
        const summary = await this.getH1BSummary();
        return summary.filter(s => s.jobTitle.toLowerCase().includes(query.toLowerCase()));
    }
}

// Export singleton instance
export const datasetService = new DatasetService();
export default datasetService;
