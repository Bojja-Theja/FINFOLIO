import express from 'express';
import {
    getSalaryPrediction,
    getCareerStability,
    getPortfolioRecommendations,
    getStockData,
    getBenefitsComparison,
    getInsightsSummary,
    getH1BStats,
    searchH1B,
    getMacroEmployment,
    getIndianFinanceBenchmarks,
    getSpendingSeasonality,
    getCareerSkillGap,
    getResumeDomains,
} from '../controllers/insightsController.js';

const router = express.Router();

/**
 * @route   GET /api/insights/salary-prediction
 * @desc    Get salary prediction based on years of experience
 * @query   experience - Years of experience (number)
 * @access  Public
 */
router.get('/salary-prediction', getSalaryPrediction);

/**
 * @route   GET /api/insights/career-stability
 * @desc    Get career stability prediction
 * @query   age, industry, profession, extraversion, selfcontrol, anxiety
 * @access  Public
 */
router.get('/career-stability', getCareerStability);

/**
 * @route   GET /api/insights/portfolio-recommendations
 * @desc    Get portfolio allocation recommendations
 * @query   riskProfile - conservative, moderate, or aggressive
 * @access  Public
 */
router.get('/portfolio-recommendations', getPortfolioRecommendations);

/**
 * @route   GET /api/insights/stock-data
 * @desc    Get historical stock data
 * @query   limit - Number of records to return (default: 30)
 * @access  Public
 */
router.get('/stock-data', getStockData);

/**
 * @route   GET /api/insights/benefits-comparison
 * @desc    Get benefits comparison
 * @query   jobIds - Comma-separated job IDs (optional)
 * @access  Public
 */
router.get('/benefits-comparison', getBenefitsComparison);

/**
 * @route   GET /api/insights/summary
 * @desc    Get summary of all insights data
 * @access  Public
 */
router.get('/summary', getInsightsSummary);

/**
 * @route   GET /api/insights/h1b-stats
 * @desc    Get H1B statistics
 * @access  Public
 */
router.get('/h1b-stats', getH1BStats);

/**
 * @route   GET /api/insights/h1b-search
 * @desc    Search H1B job titles
 * @query   q - Search query
 * @access  Public
 */
router.get('/h1b-search', searchH1B);

/**
 * @route   GET /api/insights/macro-employment
 * @desc    Get macroeconomic employment risk and World Bank unemployment indicators
 * @access  Public
 */
router.get('/macro-employment', getMacroEmployment);

/**
 * @route   GET /api/insights/indian-finance-benchmarks
 * @desc    Get Indian personal finance benchmarks by city tier (or compare user profile)
 * @query   tier, income, savingsRate, discretionaryRatio
 * @access  Public
 */
router.get('/indian-finance-benchmarks', getIndianFinanceBenchmarks);

/**
 * @route   GET /api/insights/spending-seasonality
 * @desc    Get monthly spending seasonality, inflation indicators, and festival spikes
 * @access  Public
 */
router.get('/spending-seasonality', getSpendingSeasonality);

/**
 * @route   GET /api/insights/career-skill-gap
 * @desc    Get career recommendation, skill gap analysis, and salary progression
 * @query   targetRole, skills
 * @access  Public
 */
router.get('/career-skill-gap', getCareerSkillGap);

/**
 * @route   GET /api/insights/resume-domains
 * @desc    Get resume categories and extracted domain technical keywords
 * @query   category
 * @access  Public
 */
router.get('/resume-domains', getResumeDomains);

export default router;
