import { Router } from "express";
import {
  calculateFinance,
  getHealthScore,
  getSurvival,
  getIncomeScore,
  getWhatIfProjection,
  getAISummary,
  getResilienceSummary,
  getBenchmark,
  getCashFlow,
  getDebtRecommendation,
  getLoanRecommendation,
} from "../controllers/financeController.js";
import {
  getActionPlan,
  getBudgetHealth,
  getCashReservePlan,
  getDebtPayoffPlan,
  getEmergencyFundPlan,
  getExpenseStressTest,
  getFinancialSnapshot,
  getIncomeStabilitySummary,
  getRiskProfileSummary,
  getSavingsGoalPlan,
} from "../controllers/financialPlanningController.js";
import {
  sendAlert,
  sendAchievementNotification,
} from "../services/notificationService.js";
import { generateComprehensiveInsights } from "../services/insightsService.js";
import { AssetAllocationService } from "../services/assetAllocationService.js";
import { EmergencyFundService } from "../services/emergencyFundService.js";
import { DatabaseService } from "../services/databaseService.js";
import { optionalAuthMiddleware, requireAuthMiddleware } from "../middleware/optionalAuthMiddleware.js";

const router = Router();

/* -------------------------------------------
   Basic finance routes (allow guest access)
-------------------------------------------- */
router.post("/calculate", optionalAuthMiddleware, calculateFinance);
router.get("/healthscore", optionalAuthMiddleware, getHealthScore);
router.get("/survival", optionalAuthMiddleware, getSurvival);
router.get("/incomescore", optionalAuthMiddleware, getIncomeScore);

router.get("/insights", optionalAuthMiddleware, async (req, res): Promise<void> => {
  const userId = (req as any).userId;
  const isGuest = (req as any).isGuest;

  if (!userId || isGuest) {
    res.json({
      alerts: [
        {
          id: "1",
          type: "warning",
          priority: "high",
          category: "savings",
          title: "Low Emergency Fund",
          message:
            "Your emergency fund covers only 1.8 months of expenses. Aim for 6 months.",
          actionable: true,
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          type: "info",
          priority: "medium",
          category: "budget",
          title: "Spending Trend",
          message:
            "Your monthly expenses have increased by 8% compared to last quarter.",
          actionable: false,
          timestamp: new Date().toISOString(),
        },
      ],
      insights: [
        {
          id: "1",
          type: "opportunity",
          category: "investment",
          title: "SIP Investment Opportunity",
          description:
            "Based on your risk profile, consider increasing SIP investments by 20%.",
          impact: "high",
          confidence: 0.85,
        },
        {
          id: "2",
          type: "risk",
          category: "debt",
          title: "Debt Management",
          description: "Your debt-to-income ratio is 23%. Consider debt consolidation.",
          impact: "medium",
          confidence: 0.75,
        },
      ],
      summary: {
        criticalCount: 1,
        warningCount: 1,
        opportunityCount: 1,
        achievementsCount: 0,
      },
      trends: {
        spendingTrend: "increasing",
        savingsTrend: "stable",
        healthTrend: "improving",
      },
      isGuest: true,
      note: "Demo insights for guest users. Sign up to see personalized analytics.",
    });
    return;
  }

  const result = await generateComprehensiveInsights(userId);
  res.json(result);
});

/* -------------------------------------------
   Asset Allocation Route (Advanced Feature)
-------------------------------------------- */
router.get("/asset-allocation", optionalAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const isGuest = (req as any).isGuest;

    // If guest or no user, return a demo allocation so the UI can render
    if (!userId || isGuest) {
      const guestInput = {
        monthlyIncome: 52000,
        monthlyExpenses: 31000,
        emergencyFund: 186000,
        debtAmount: 50000,
        age: 30,
        riskTolerance: "medium" as const,
        jobStability: 7,
        marketConditions: "neutral" as const,
        inflationRate: 6.0,
      };

      const allocation = await AssetAllocationService.calculateOptimalAllocation(guestInput);

      const formulas = {
        sipCagr: AssetAllocationService.calculateSipCagr(
          allocation.allocatedAmounts.sip,
          10,
          12
        ),
        emergencyMonths: AssetAllocationService.calculateEmergencyFundMonths(
          allocation.allocatedAmounts.emergency,
          guestInput.monthlyExpenses
        ),
        debtToIncome: AssetAllocationService.calculateDebtToIncomeRatio(
          guestInput.debtAmount,
          guestInput.monthlyIncome * 12
        ),
        savingsRate: AssetAllocationService.calculateSavingsRate(
          guestInput.monthlyIncome,
          guestInput.monthlyExpenses
        ),
        investmentRiskScore: AssetAllocationService.calculateInvestmentRiskScore(allocation),
        stabilityIndex: 70,
      };

      res.json({
        allocation: {
          sipPercentage: allocation.sipPercentage,
          stocksPercentage: allocation.stocksPercentage,
          bondsPercentage: allocation.bondsPercentage,
          lifestylePercentage: allocation.lifestylePercentage,
          emergencyFundPercentage: allocation.emergencyFundPercentage,
          allocatedAmounts: allocation.allocatedAmounts,
          reasoning: allocation.reasoning,
        },
        formulas,
        isGuest: true,
        note: "Demo allocation shown. Create an account to save your personalized plan.",
      });
      return;
    }

    const existingAllocation = await DatabaseService.getAssetAllocation(userId);

    if (existingAllocation) {
      const formulas = {
        sipCagr: AssetAllocationService.calculateSipCagr(
          existingAllocation.sipAmount,
          10,
          12
        ),
        emergencyMonths:
          existingAllocation.emergencyAmount /
          (existingAllocation.emergencyAmount /
            existingAllocation.emergencyFundPercentage /
            100),
        debtToIncome: 0,
        savingsRate: 0,
        investmentRiskScore:
          AssetAllocationService.calculateInvestmentRiskScore({
            sipPercentage: existingAllocation.sipPercentage,
            stocksPercentage: existingAllocation.stocksPercentage,
            bondsPercentage: existingAllocation.bondsPercentage,
            lifestylePercentage: existingAllocation.lifestylePercentage,
            emergencyFundPercentage: existingAllocation.emergencyFundPercentage,
            allocatedAmounts: {
              sip: existingAllocation.sipAmount,
              stocks: existingAllocation.stocksAmount,
              bonds: existingAllocation.bondsAmount,
              lifestyle: existingAllocation.lifestyleAmount,
              emergency: existingAllocation.emergencyAmount,
            },
            reasoning: existingAllocation.reasoning,
          }),
        stabilityIndex: 0,
      };

      res.json({
        allocation: {
          sipPercentage: existingAllocation.sipPercentage,
          stocksPercentage: existingAllocation.stocksPercentage,
          bondsPercentage: existingAllocation.bondsPercentage,
          lifestylePercentage: existingAllocation.lifestylePercentage,
          emergencyFundPercentage: existingAllocation.emergencyFundPercentage,
          allocatedAmounts: {
            sip: existingAllocation.sipAmount,
            stocks: existingAllocation.stocksAmount,
            bonds: existingAllocation.bondsAmount,
            lifestyle: existingAllocation.lifestyleAmount,
            emergency: existingAllocation.emergencyAmount,
          },
          reasoning: existingAllocation.reasoning,
        },
        formulas,
      });
      return;
    }

    const userData = await DatabaseService.getUserFinancialData(userId);
    if (!userData) {
      // User authenticated but hasn't completed onboarding - return demo data with prompt
      const guestInput = {
        monthlyIncome: 52000,
        monthlyExpenses: 31000,
        emergencyFund: 186000,
        debtAmount: 50000,
        age: 30,
        riskTolerance: "medium" as const,
        jobStability: 7,
        marketConditions: "neutral" as const,
        inflationRate: 6.0,
      };

      const allocation = await AssetAllocationService.calculateOptimalAllocation(guestInput);

      const formulas = {
        sipCagr: AssetAllocationService.calculateSipCagr(
          allocation.allocatedAmounts.sip,
          10,
          12
        ),
        emergencyMonths: AssetAllocationService.calculateEmergencyFundMonths(
          allocation.allocatedAmounts.emergency,
          guestInput.monthlyExpenses
        ),
        debtToIncome: AssetAllocationService.calculateDebtToIncomeRatio(
          guestInput.debtAmount,
          guestInput.monthlyIncome * 12
        ),
        savingsRate: AssetAllocationService.calculateSavingsRate(
          guestInput.monthlyIncome,
          guestInput.monthlyExpenses
        ),
        investmentRiskScore: AssetAllocationService.calculateInvestmentRiskScore(allocation),
        stabilityIndex: 70,
      };

      res.json({
        allocation: {
          sipPercentage: allocation.sipPercentage,
          stocksPercentage: allocation.stocksPercentage,
          bondsPercentage: allocation.bondsPercentage,
          lifestylePercentage: allocation.lifestylePercentage,
          emergencyFundPercentage: allocation.emergencyFundPercentage,
          allocatedAmounts: allocation.allocatedAmounts,
          reasoning: allocation.reasoning,
        },
        formulas,
        requiresOnboarding: true,
        note: "Complete your profile to get personalized allocation recommendations.",
      });
      return;
    }

    const allocation =
      await AssetAllocationService.calculateOptimalAllocation(userData);

    const allocationData = {
      userId,
      sipPercentage: allocation.sipPercentage,
      stocksPercentage: allocation.stocksPercentage,
      bondsPercentage: allocation.bondsPercentage,
      lifestylePercentage: allocation.lifestylePercentage,
      emergencyFundPercentage: allocation.emergencyFundPercentage,
      sipAmount: allocation.allocatedAmounts.sip,
      stocksAmount: allocation.allocatedAmounts.stocks,
      bondsAmount: allocation.allocatedAmounts.bonds,
      lifestyleAmount: allocation.allocatedAmounts.lifestyle,
      emergencyAmount: allocation.allocatedAmounts.emergency,
      reasoning: allocation.reasoning,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await DatabaseService.saveAssetAllocation(allocationData);

    res.json({
      allocation,
      formulas: {
        sipCagr: AssetAllocationService.calculateSipCagr(
          allocation.allocatedAmounts.sip,
          10,
          12
        ),
        emergencyMonths:
          AssetAllocationService.calculateEmergencyFundMonths(
            userData.emergencyFund,
            userData.monthlyExpenses
          ),
        debtToIncome:
          AssetAllocationService.calculateDebtToIncomeRatio(
            userData.debtAmount,
            userData.monthlyIncome * 12
          ),
        savingsRate: AssetAllocationService.calculateSavingsRate(
          userData.monthlyIncome,
          userData.monthlyExpenses
        ),
        investmentRiskScore:
          AssetAllocationService.calculateInvestmentRiskScore(allocation),
        stabilityIndex: AssetAllocationService.calculateStabilityIndex(
          userData.emergencyFund / userData.monthlyExpenses,
          AssetAllocationService.calculateSavingsRate(
            userData.monthlyIncome,
            userData.monthlyExpenses
          ),
          AssetAllocationService.calculateDebtToIncomeRatio(
            userData.debtAmount,
            userData.monthlyIncome * 12
          ),
          userData.jobStability
        ),
      },
    });
  } catch (error) {
    console.error("Asset allocation error:", error);
    res.status(500).json({ error: "Failed to calculate asset allocation" });
  }
});

/* -------------------------------------------
   Update Asset Allocation (Advanced Feature)
-------------------------------------------- */
router.post("/asset-allocation/update", requireAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { allocation } = req.body;

    const existing = await DatabaseService.getAssetAllocation(userId);
    const createdAt = existing ? existing.createdAt : new Date();

    const allocationData = {
      userId,
      sipPercentage: allocation.sipPercentage,
      stocksPercentage: allocation.stocksPercentage,
      bondsPercentage: allocation.bondsPercentage,
      lifestylePercentage: allocation.lifestylePercentage,
      emergencyFundPercentage: allocation.emergencyFundPercentage,
      sipAmount: allocation.allocatedAmounts.sip,
      stocksAmount: allocation.allocatedAmounts.stocks,
      bondsAmount: allocation.allocatedAmounts.bonds,
      lifestyleAmount: allocation.allocatedAmounts.lifestyle,
      emergencyAmount: allocation.allocatedAmounts.emergency,
      reasoning: allocation.reasoning || [],
      createdAt,
      updatedAt: new Date(),
    };

    const success = await DatabaseService.saveAssetAllocation(allocationData);

    if (!success) {
      res
        .status(500)
        .json({ error: "Failed to save asset allocation to database" });
      return;
    }

    res.json({
      success: true,
      message: "Asset allocation updated successfully",
      allocation,
    });
  } catch (error) {
    console.error("Asset allocation update error:", error);
    res.status(500).json({ error: "Failed to update asset allocation" });
  }
});

/* -------------------------------------------
   Emergency Fund Routes (Advanced Feature)
-------------------------------------------- */
router.get("/emergency-status", optionalAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const isGuest = (req as any).isGuest;

    // Provide demo emergency fund data to guests/unauthenticated users so UI can render
    if (!userId || isGuest) {
      const guestExpenses = 31000;
      const guestFund = 186000;

      const emergencyStatus = EmergencyFundService.calculateEmergencyFundStatus(
        guestFund,
        guestExpenses
      );

      const simulations = EmergencyFundService.simulateEmergencyScenarios(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7
      );

      const optimalContribution = EmergencyFundService.calculateOptimalContribution(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7
      );

      const depletionRisk = EmergencyFundService.monitorDepletionRisk(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7,
        7
      );

      res.json({
        status: emergencyStatus,
        simulations,
        optimalContribution,
        depletionRisk,
        recommendations: [
          "Maintain emergency fund at 6 months of expenses",
          "Contribute monthly to build fund gradually",
          "Review and adjust based on life changes",
        ],
        isGuest: true,
        note: "Demo emergency fund status. Sign up to save and track your own data.",
      });
      return;
    }

    const existingData = await DatabaseService.getEmergencyFundData(userId);
    const userFinData = await DatabaseService.getUserFinancialData(userId);

    // User authenticated but hasn't completed onboarding - return demo data
    if (!userFinData && !existingData) {
      const guestExpenses = 31000;
      const guestFund = 186000;

      const emergencyStatus = EmergencyFundService.calculateEmergencyFundStatus(
        guestFund,
        guestExpenses
      );

      const simulations = EmergencyFundService.simulateEmergencyScenarios(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7
      );

      const optimalContribution = EmergencyFundService.calculateOptimalContribution(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7
      );

      const depletionRisk = EmergencyFundService.monitorDepletionRisk(
        guestFund,
        guestExpenses,
        guestExpenses * 1.7,
        7
      );

      res.json({
        status: emergencyStatus,
        simulations,
        optimalContribution,
        depletionRisk,
        recommendations: [
          "Complete your profile to get personalized emergency fund recommendations",
          "Maintain emergency fund at 6 months of expenses",
          "Contribute monthly to build fund gradually",
        ],
        requiresOnboarding: true,
        note: "Complete your profile to see your actual emergency fund status.",
      });
      return;
    }

    if (existingData) {
      const monthlyExpenses = userFinData
        ? userFinData.monthlyExpenses
        : existingData.monthlyBurnRate;
      const monthlyIncome = userFinData
        ? userFinData.monthlyIncome
        : existingData.monthlyBurnRate * 2;

      const simulations = EmergencyFundService.simulateEmergencyScenarios(
        existingData.currentBalance,
        monthlyExpenses,
        monthlyIncome
      );

      const optimalContribution =
        EmergencyFundService.calculateOptimalContribution(
          existingData.currentBalance,
          monthlyExpenses,
          monthlyIncome
        );

      const depletionRisk = EmergencyFundService.monitorDepletionRisk(
        existingData.currentBalance,
        monthlyExpenses,
        monthlyIncome,
        7
      );

      res.json({
        status: {
          currentBalance: existingData.currentBalance,
          targetMonths: existingData.targetMonths,
          monthlyBurnRate: existingData.monthlyBurnRate,
          monthsCoverage: existingData.monthsCoverage,
          status: existingData.status,
          recommendedAction: existingData.recommendedAction,
          alerts: existingData.alerts,
        },
        simulations,
        optimalContribution,
        depletionRisk,
        recommendations: [
          "Maintain emergency fund at 6 months of expenses",
          "Contribute monthly to build fund gradually",
          "Review and adjust based on life changes",
        ],
      });
      return;
    }

    if (!userFinData) {
      res.status(404).json({
        error: "User financial data not found. Please complete your profile.",
      });
      return;
    }

    const status = EmergencyFundService.calculateEmergencyFundStatus(
      userFinData.emergencyFund,
      userFinData.monthlyExpenses
    );

    const simulations = EmergencyFundService.simulateEmergencyScenarios(
      userFinData.emergencyFund,
      userFinData.monthlyExpenses,
      userFinData.monthlyIncome
    );

    const optimalContribution =
      EmergencyFundService.calculateOptimalContribution(
        userFinData.emergencyFund,
        userFinData.monthlyExpenses,
        userFinData.monthlyIncome
      );

    const depletionRisk = EmergencyFundService.monitorDepletionRisk(
      userFinData.emergencyFund,
      userFinData.monthlyExpenses,
      userFinData.monthlyIncome,
      userFinData.jobStability
    );

    const emergencyData = {
      userId,
      currentBalance: userFinData.emergencyFund,
      targetMonths: 6,
      monthlyBurnRate: userFinData.monthlyExpenses,
      monthsCoverage: status.monthsCoverage,
      status: status.status,
      recommendedAction: status.recommendedAction,
      alerts: status.alerts,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await DatabaseService.saveEmergencyFundData(emergencyData);

    res.json({
      status,
      simulations,
      optimalContribution,
      depletionRisk,
      recommendations: [
        "Maintain emergency fund at 6 months of expenses",
        "Contribute monthly to build fund gradually",
        "Review and adjust based on life changes",
      ],
    });
  } catch (error) {
    console.error("Emergency fund status error:", error);
    res.status(500).json({ error: "Failed to get emergency fund status" });
  }
});

router.post("/emergency-simulation", optionalAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const { scenario, currentBalance, monthlyExpenses, monthlyIncome } =
      req.body;

    const userId = (req as any).userId;
    const isGuest = (req as any).isGuest;

    if (!userId || isGuest) {
      const defaultBalance = currentBalance || 186000;
      const defaultExpenses = monthlyExpenses || 31000;
      const defaultIncome = monthlyIncome || defaultExpenses * 1.7;

      const simulations = EmergencyFundService.simulateEmergencyScenarios(
        defaultBalance,
        defaultExpenses,
        defaultIncome
      );

      const specificSimulation =
        simulations.find((s) => s.scenario === scenario) || simulations[0];

      res.json({
        simulation: specificSimulation,
        allScenarios: simulations,
        isGuest: true,
        note: "Demo simulation. Sign up to run simulations on your own data.",
      });
      return;
    }

    const simulations = EmergencyFundService.simulateEmergencyScenarios(
      currentBalance,
      monthlyExpenses,
      monthlyIncome
    );

    const specificSimulation =
      simulations.find((s) => s.scenario === scenario) || simulations[0];

    res.json({
      simulation: specificSimulation,
      allScenarios: simulations,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to run emergency simulation" });
  }
});

/* -------------------------------------------
   Trend Analysis (Advanced Feature)
-------------------------------------------- */
router.get("/trends/:period", requireAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { period } = req.params;

    const trends = {
      spendingTrend: "stable",
      savingsTrend: "improving",
      incomeTrend: "stable",
      emergencyFundTrend: "growing",
      investmentTrend: "stable",
      period,
      data: {
        spending: { current: 31000, previous: 30500, change: 1.6 },
        savings: { current: 21000, previous: 19500, change: 7.7 },
        income: { current: 52000, previous: 52000, change: 0 },
        emergencyFund: { current: 45000, previous: 40000, change: 12.5 },
      },
    };

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: "Failed to get trend analysis" });
  }
});

/* -------------------------------------------
   SIP Calculator Route
-------------------------------------------- */
router.post("/sip-plan", async (req, res): Promise<void> => {
  try {
    const { monthlyInvestment, years, expectedReturn } = req.body;

    const futureValue = AssetAllocationService.calculateSipCagr(
      monthlyInvestment,
      years,
      expectedReturn
    );

    const totalInvested = monthlyInvestment * years * 12;
    const wealthGained = (futureValue * totalInvested) / 100 - totalInvested;

    res.json({
      monthlyInvestment,
      years,
      expectedReturn,
      futureValue: Math.round(futureValue),
      totalInvested,
      wealthGained: Math.round(wealthGained),
      cagr: futureValue.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate SIP plan" });
  }
});

/* -------------------------------------------
   Notification Routes (Advanced Feature)
-------------------------------------------- */
router.post("/notify/alert", requireAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const { email, message, type } = req.body;
    const userId = (req as any).userId;

    const result = await sendAlert(userId, email, message, type);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to send alert" });
  }
});

router.post("/notify/achievement", requireAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const { email, achievement, details } = req.body;
    const userId = (req as any).userId;

    const result = await sendAchievementNotification(
      userId,
      email,
      achievement,
      details
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to send achievement notification" });
  }
});

/* -------------------------------------------
   New Advanced Features Routes
-------------------------------------------- */
router.post("/what-if", optionalAuthMiddleware, getWhatIfProjection);
router.get("/ai-summary", optionalAuthMiddleware, getAISummary);
router.get("/resilience-summary", optionalAuthMiddleware, getResilienceSummary);
router.get("/benchmark", optionalAuthMiddleware, getBenchmark);
router.get("/cashflow", optionalAuthMiddleware, getCashFlow);
router.get("/debt-recommendation", optionalAuthMiddleware, getDebtRecommendation);
router.post("/loan-recommendation", optionalAuthMiddleware, getLoanRecommendation);
router.post("/budget-health", optionalAuthMiddleware, getBudgetHealth);
router.post("/emergency-fund-plan", optionalAuthMiddleware, getEmergencyFundPlan);
router.post("/debt-payoff-plan", optionalAuthMiddleware, getDebtPayoffPlan);
router.post("/savings-goal-plan", optionalAuthMiddleware, getSavingsGoalPlan);
router.post("/expense-stress-test", optionalAuthMiddleware, getExpenseStressTest);
router.post("/income-stability-summary", optionalAuthMiddleware, getIncomeStabilitySummary);
router.post("/financial-snapshot", optionalAuthMiddleware, getFinancialSnapshot);
router.post("/risk-profile-summary", optionalAuthMiddleware, getRiskProfileSummary);
router.post("/cash-reserve-plan", optionalAuthMiddleware, getCashReservePlan);
router.post("/action-plan", optionalAuthMiddleware, getActionPlan);

export default router;
