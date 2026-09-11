import { Request, Response } from 'express';
import { datasetService } from '../services/datasetService';
import { logger } from '../utils/logger';

/**
 * Get salary prediction
 */
export const getSalaryPrediction = async (req: Request, res: Response) => {
    try {
        const { experience } = req.query;

        if (!experience) {
            return res.status(400).json({
                success: false,
                message: 'Years of experience is required',
            });
        }

        const yearsExperience = parseFloat(experience as string);

        if (isNaN(yearsExperience) || yearsExperience < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid years of experience',
            });
        }

        const predictedSalary = datasetService.predictSalary(yearsExperience);
        const stats = datasetService.getSalaryStats();
        const allData = datasetService.getSalaryData();

        res.json({
            success: true,
            data: {
                yearsExperience,
                predictedSalary,
                stats,
                chartData: allData.slice(0, 20), // Limit for performance
            },
        });
    } catch (error) {
        logger.error({ message: 'Error in getSalaryPrediction', error });
        res.status(500).json({
            success: false,
            message: 'Failed to predict salary',
        });
    }
};

/**
 * Get career stability prediction
 */
export const getCareerStability = async (req: Request, res: Response) => {
    try {
        const { age, industry, profession, extraversion, selfcontrol, anxiety } = req.query;

        if (!age || !industry || !profession) {
            return res.status(400).json({
                success: false,
                message: 'Age, industry, and profession are required',
            });
        }

        const profile = {
            age: parseInt(age as string),
            industry: industry as string,
            profession: profession as string,
            extraversion: extraversion ? parseFloat(extraversion as string) : undefined,
            selfcontrol: selfcontrol ? parseFloat(selfcontrol as string) : undefined,
            anxiety: anxiety ? parseFloat(anxiety as string) : undefined,
        };

        const prediction = datasetService.predictTurnoverRisk(profile);

        res.json({
            success: true,
            data: prediction,
        });
    } catch (error) {
        logger.error({ message: 'Error in getCareerStability', error });
        res.status(500).json({
            success: false,
            message: 'Failed to predict career stability',
        });
    }
};

/**
 * Get portfolio recommendations
 */
export const getPortfolioRecommendations = async (req: Request, res: Response) => {
    try {
        const { riskProfile } = req.query;

        if (!riskProfile || !['conservative', 'moderate', 'aggressive'].includes(riskProfile as string)) {
            return res.status(400).json({
                success: false,
                message: 'Valid risk profile is required (conservative, moderate, or aggressive)',
            });
        }

        const recommendations = datasetService.getPortfolioRecommendations(
            riskProfile as 'conservative' | 'moderate' | 'aggressive'
        );
        const latestPrices = datasetService.getLatestStockPrices();

        res.json({
            success: true,
            data: {
                ...recommendations,
                currentPrices: latestPrices,
            },
        });
    } catch (error) {
        logger.error({ message: 'Error in getPortfolioRecommendations', error });
        res.status(500).json({
            success: false,
            message: 'Failed to get portfolio recommendations',
        });
    }
};

/**
 * Get stock data
 */
export const getStockData = async (req: Request, res: Response) => {
    try {
        const { limit } = req.query;
        const limitNum = limit ? parseInt(limit as string) : 30;

        const allData = datasetService.getStockData();
        const latestData = allData.slice(-limitNum);
        const latestPrices = datasetService.getLatestStockPrices();

        res.json({
            success: true,
            data: {
                historical: latestData,
                latest: latestPrices,
            },
        });
    } catch (error) {
        logger.error({ message: 'Error in getStockData', error });
        res.status(500).json({
            success: false,
            message: 'Failed to get stock data',
        });
    }
};

/**
 * Get benefits comparison
 */
export const getBenefitsComparison = async (req: Request, res: Response) => {
    try {
        const { jobIds } = req.query;

        if (!jobIds) {
            // Return general benefits statistics
            const stats = datasetService.getBenefitsStats();
            return res.json({
                success: true,
                data: {
                    stats,
                },
            });
        }

        const jobIdArray = (jobIds as string).split(',');
        const comparison = datasetService.compareBenefits(jobIdArray);

        res.json({
            success: true,
            data: {
                comparison,
            },
        });
    } catch (error) {
        logger.error({ message: 'Error in getBenefitsComparison', error });
        res.status(500).json({
            success: false,
            message: 'Failed to get benefits comparison',
        });
    }
};

/**
 * Get all insights data (dashboard summary)
 */
export const getInsightsSummary = async (req: Request, res: Response) => {
    try {
        const salaryStats = datasetService.getSalaryStats();
        const benefitsStats = datasetService.getBenefitsStats();
        const latestStockPrices = datasetService.getLatestStockPrices();

        res.json({
            success: true,
            data: {
                salary: salaryStats,
                benefits: benefitsStats,
                stocks: latestStockPrices,
            },
        });
    } catch (error) {
        logger.error({ message: 'Error in getInsightsSummary', error });
        res.status(500).json({
            success: false,
            message: 'Failed to get insights summary',
        });
    }
};

/**
 * Get H1B stats
 */
export const getH1BStats = async (req: Request, res: Response) => {
    try {
        const stats = await datasetService.getH1BSummary();
        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        logger.error({ message: 'Error in getH1BStats', error });
        res.status(500).json({
            success: false,
            message: 'Failed to get H1B stats',
        });
    }
};

/**
 * Search H1B job titles
 */
export const searchH1B = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }
        const results = await datasetService.searchH1B(q as string);
        res.json({
            success: true,
            data: results,
        });
    } catch (error) {
        logger.error({ message: 'Error in searchH1B', error });
        res.status(500).json({
            success: false,
            message: 'Failed to search H1B data',
        });
    }
};
