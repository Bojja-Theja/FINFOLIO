'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  Stack,
  Avatar,
  Paper,
  Fade,
  Grow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import {
  Assessment as AssessmentIcon,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Warning,
  CheckCircle,
  Calculate,
  ExpandMore,
  Info,
  Lightbulb,
  Compare,
  Group,
  Security,
  LocalHospital,
  Home,
  CreditCard,
  Work,
  AutoGraph,
  ReceiptLong,
  Timer,
  ContentCopy,
  Download,
  RestartAlt,
  Psychology
} from '@mui/icons-material';
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell
} from 'recharts';

import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  investments: number;
  debt: number;
  debtInterestRate: number;
  monthlyHousingCost: number;
  healthInsuranceCover: number;
  monthlyWants: number;
  monthlySubscriptions: number;
  monthlySip: number;
  age: number;
  dependents: number;
  employmentType: 'salaried' | 'contract' | 'self-employed' | 'business';
  careerField: 'tech_software' | 'finance' | 'sales_marketing' | 'operations' | 'healthcare';
  riskTolerance: number;
}

export const INPUT_LIMITS = {
  monthlyIncome: { min: 0, max: 100000000, label: 'Min: ₹0 • Max: ₹10 Cr' },
  monthlyExpenses: { min: 0, max: 50000000, label: 'Min: ₹0 • Max: ₹5 Cr' },
  emergencyFund: { min: 0, max: 500000000, label: 'Min: ₹0 • Max: ₹50 Cr' },
  investments: { min: 0, max: 1000000000, label: 'Min: ₹0 • Max: ₹100 Cr' },
  debt: { min: 0, max: 500000000, label: 'Min: ₹0 • Max: ₹50 Cr' },
  debtInterestRate: { min: 0, max: 60, label: 'Min: 0% • Max: 60%' },
  monthlyHousingCost: { min: 0, max: 20000000, label: 'Min: ₹0 • Max: ₹2 Cr' },
  healthInsuranceCover: { min: 0, max: 100000000, label: 'Min: ₹0 • Max: ₹10 Cr' },
  monthlyWants: { min: 0, max: 20000000, label: 'Min: ₹0 • Max: ₹2 Cr' },
  monthlySubscriptions: { min: 0, max: 5000000, label: 'Min: ₹0 • Max: ₹50 L' },
  monthlySip: { min: 0, max: 50000000, label: 'Min: ₹0 • Max: ₹5 Cr' },
  age: { min: 18, max: 100, label: 'Min: 18 • Max: 100 Yrs' },
  dependents: { min: 0, max: 15, label: 'Min: 0 • Max: 15' },
  riskTolerance: { min: 1, max: 10, label: 'Min: 1 • Max: 10' },
};

export const clamp = (val: number, min: number, max: number): number => {
  if (isNaN(val)) return min;
  return Math.min(max, Math.max(min, val));
};

export interface AssessmentResult {
  stabilityScore: number;
  riskBand: 'Conservative' | 'Balanced' | 'Growth' | 'Aggressive';
  standardRunwayMonths: number;
  standardRunwayDays: number;
  survivalRunwayMonths: number;
  survivalRunwayDays: number;
  emergencyDeficit3M: number;
  emergencyDeficit6M: number;
  emergencyDeficit12M: number;
  dtiRatio: number;
  dtiStatus: string;
  frontEndDti: number;
  savingsRate: number;
  netWorth: number;
  netWorthProjection5Y: number;
  netWorthProjection10Y: number;
  netWorthProjection20Y: number;
  realNetWorthProjection10Y: number;
  careerLayoffRiskPct: number;
  recommendedSwitchRole: string;
  missingSkillsCount: number;
  leanFireTarget: number;
  standardFireTarget: number;
  fatFireTarget: number;
  fireAttainmentPct: number;
  yearsToFire: number;
  healthInsuranceAdequacyPct: number;
  healthInsuranceDeficit: number;
  discretionaryLeakageRatio: number;
  wantsVsNeedsRatio: number;
  taxInefficiencyScore: number;
  recommendedTaxRegime: 'New Regime' | 'Old Regime';
  taxSavingsPotential: number;
  avalancheMonthsSaved: number;
  avalancheInterestSaved: number;
  housingBurdenRatio: number;
  liquidConcentrationRatio: number;
  tenYearSubscriptionCost: number;
  creditUtilizationEst: number;
  cibilScoreImpact: string;
  impulseSpendingScore: number;
  termInsuranceNeed: number;
  familyProtectionFloor: number;
  breakdown: {
    liquidity: number;
    solvency: number;
    savingsDiscipline: number;
    careerShield: number;
  };
  triagePlaybook: Array<{ priority: 'P1' | 'P2' | 'P3'; title: string; detail: string }>;
}

export default function Assessment() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [debtStrategy, setDebtStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [fireMode, setFireMode] = useState<'standard' | 'lean' | 'fat'>('standard');

  // Crisis What-If Shocks
  const [incomeShockPct, setIncomeShockPct] = useState<number>(0);
  const [expenseShockPct, setExpenseShockPct] = useState<number>(0);

  // Default Production Demo Profile: Indian Tech Professional
  const [data, setData] = useState<FinancialData>({
    monthlyIncome: 85000,
    monthlyExpenses: 42000,
    emergencyFund: 250000,
    investments: 550000,
    debt: 320000,
    debtInterestRate: 13.5,
    monthlyHousingCost: 18000,
    healthInsuranceCover: 500000,
    monthlyWants: 15000,
    monthlySubscriptions: 3500,
    monthlySip: 18000,
    age: 28,
    dependents: 1,
    employmentType: 'salaried',
    careerField: 'tech_software',
    riskTolerance: 7
  });

  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleNumberChange = (field: keyof FinancialData, rawVal: string) => {
    if (rawVal === '' || rawVal === undefined) {
      setData(prev => ({ ...prev, [field]: 0 }));
      return;
    }
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;
    const limit = (INPUT_LIMITS as Record<string, { min: number; max: number; label: string }>)[field];
    if (limit) {
      let bounded = Math.max(0, num);
      if (bounded > limit.max) {
        bounded = limit.max;
      }
      setData(prev => ({ ...prev, [field]: bounded }));
    } else {
      setData(prev => ({ ...prev, [field]: Math.max(0, num) }));
    }
  };

  const handleBlur = (field: keyof FinancialData) => {
    const limit = (INPUT_LIMITS as Record<string, { min: number; max: number; label: string }>)[field];
    if (limit) {
      setData(prev => ({
        ...prev,
        [field]: clamp(Number(prev[field] || 0), limit.min, limit.max),
      }));
    }
  };

  const getHelperText = (field: keyof typeof INPUT_LIMITS, val: number) => {
    const limit = INPUT_LIMITS[field];
    if (val >= limit.max) {
      return `⚠️ Max limit reached (${limit.label})`;
    }
    return limit.label;
  };

  // Calculate 20 Advanced Analytical Features
  const calculateAssessment = () => {
    setLoading(true);

    setTimeout(() => {
      // 1. Shocks applied
      const effectiveIncome = Math.max(1, data.monthlyIncome * (1 - incomeShockPct / 100));
      const effectiveExpenses = Math.max(1, data.monthlyExpenses * (1 + expenseShockPct / 100));

      // 2. Dual Runway Engine with Exact Days of Survival
      const standardRunwayMonths = Math.round((data.emergencyFund / effectiveExpenses) * 10) / 10;
      const standardRunwayDays = Math.round(standardRunwayMonths * 30.417);
      const survivalMonthlyExpenses = Math.max(1, effectiveExpenses * 0.65);
      const survivalRunwayMonths = Math.round((data.emergencyFund / survivalMonthlyExpenses) * 10) / 10;
      const survivalRunwayDays = Math.round(survivalRunwayMonths * 30.417);

      // 3. Tiered Emergency Deficit Engine
      const target3M = effectiveExpenses * 3;
      const target6M = effectiveExpenses * 6;
      const target12M = effectiveExpenses * 12;
      const emergencyDeficit3M = Math.max(0, target3M - data.emergencyFund);
      const emergencyDeficit6M = Math.max(0, target6M - data.emergencyFund);
      const emergencyDeficit12M = Math.max(0, target12M - data.emergencyFund);

      // 4. DTI & FOIR Stress Gauge
      const estimatedMonthlyDebtPayment = Math.round(data.debt * 0.035);
      const dtiRatio = Math.round(((estimatedMonthlyDebtPayment) / effectiveIncome) * 100);
      const frontEndDti = Math.round((data.monthlyHousingCost / effectiveIncome) * 100);
      const dtiStatus =
        dtiRatio <= 30
          ? 'Healthy (<30%)'
          : dtiRatio <= 40
          ? 'Manageable (30-40%)'
          : dtiRatio <= 50
          ? 'High Risk (40-50%)'
          : 'Critical Debt Overburden (>50%)';

      // 5. Savings Rate & Net Worth Projections
      const savingsRate = Math.round(((effectiveIncome - effectiveExpenses) / effectiveIncome) * 100);
      const netWorth = data.emergencyFund + data.investments - data.debt;
      const annualSavings = Math.max(0, (effectiveIncome - effectiveExpenses) * 12);
      const nominalCagr = 0.12; // 12% equity/mutual fund CAGR in India
      const inflationRate = 0.06; // 6% Indian inflation
      const realCagr = nominalCagr - inflationRate;

      const projectNetWorth = (years: number, rate: number) => {
        let val = Math.max(0, data.investments + data.emergencyFund);
        for (let y = 0; y < years; y++) {
          val = val * (1 + rate) + annualSavings;
        }
        return Math.round(val - Math.max(0, data.debt * Math.pow(0.85, years)));
      };

      const netWorthProjection5Y = projectNetWorth(5, nominalCagr);
      const netWorthProjection10Y = projectNetWorth(10, nominalCagr);
      const netWorthProjection20Y = projectNetWorth(20, nominalCagr);
      const realNetWorthProjection10Y = projectNetWorth(10, realCagr);

      // 6. Career & Automation Layoff Vulnerability Index
      const careerRiskMap: Record<string, { risk: number; switchRole: string; skills: number }> = {
        tech_software: { risk: 28, switchRole: 'Full-Stack AI Application Architect', skills: 3 },
        finance: { risk: 35, switchRole: 'Quantitative FinTech Analyst', skills: 4 },
        sales_marketing: { risk: 42, switchRole: 'AI-Driven Growth Operations Lead', skills: 5 },
        operations: { risk: 48, switchRole: 'Automated Supply Chain Specialist', skills: 4 },
        healthcare: { risk: 18, switchRole: 'Clinical Health Informatics Lead', skills: 2 }
      };
      const careerProfile = careerRiskMap[data.careerField] || { risk: 30, switchRole: 'AI Cloud Specialist', skills: 3 };

      // 7. Dynamic Risk Profile Classifier
      const riskBand =
        data.riskTolerance >= 8
          ? 'Aggressive'
          : data.riskTolerance >= 6
          ? 'Growth'
          : data.riskTolerance >= 4
          ? 'Balanced'
          : 'Conservative';

      // 8. Goal Feasibility & Milestone Vulnerability
      const monthlyInvestableSurplus = Math.max(0, effectiveIncome - effectiveExpenses);

      // 9. Retirement & FIRE Readiness Engine (25x annual expenses rule)
      const annualEssentialExpenses = effectiveExpenses * 0.75 * 12;
      const annualTotalExpenses = effectiveExpenses * 12;
      const leanFireTarget = Math.round(annualEssentialExpenses * 25);
      const standardFireTarget = Math.round(annualTotalExpenses * 25);
      const fatFireTarget = Math.round(annualTotalExpenses * 35);
      const fireAttainmentPct = Math.min(100, Math.round(((data.investments + data.emergencyFund) / standardFireTarget) * 100));
      const yearsToFire = monthlyInvestableSurplus > 0
        ? Math.round(Math.max(1, (standardFireTarget - (data.investments + data.emergencyFund)) / (annualSavings || 1)))
        : 99;

      // 10. Healthcare & Medical Safety Floor (Min ₹10 Lakhs floater)
      const targetHealthCover = 1000000;
      const healthInsuranceAdequacyPct = Math.min(100, Math.round((data.healthInsuranceCover / targetHealthCover) * 100));
      const healthInsuranceDeficit = Math.max(0, targetHealthCover - data.healthInsuranceCover);

      // 11. Discretionary Spending Leakage
      const discretionaryLeakageRatio = Math.round((data.monthlyWants / effectiveIncome) * 100);
      const wantsVsNeedsRatio = Math.round((data.monthlyWants / (data.monthlyExpenses || 1)) * 100);

      // 12. Tax Inefficiency Score
      const recommendedTaxRegime = (data.monthlyIncome * 12 > 1200000 && data.monthlyHousingCost > 20000) ? 'Old Regime' : 'New Regime';
      const taxSavingsPotential = recommendedTaxRegime === 'New Regime' ? 24500 : 38200;
      const taxInefficiencyScore = Math.round(Math.min(100, (taxSavingsPotential / (data.monthlyIncome * 12)) * 800));

      // 13. Debt Payoff Acceleration Engine
      const avalancheMonthsSaved = data.debt > 0 ? Math.round(Math.min(36, (data.debt / 10000) * 1.5)) : 0;
      const avalancheInterestSaved = data.debt > 0 ? Math.round(data.debt * (data.debtInterestRate / 100) * 0.45) : 0;

      // 14. Housing Cost Affordability (28% Golden Rule)
      const housingBurdenRatio = Math.round((data.monthlyHousingCost / effectiveIncome) * 100);

      // 15. Liquid Concentration Ratio
      const totalAssets = data.emergencyFund + data.investments;
      const liquidConcentrationRatio = totalAssets > 0 ? Math.round((data.emergencyFund / totalAssets) * 100) : 50;

      // 16. Zombie Subscription 10-Year Opportunity Cost (12% CAGR SIP)
      let subCompound = 0;
      for (let m = 0; m < 120; m++) {
        subCompound = (subCompound + data.monthlySubscriptions) * (1 + 0.12 / 12);
      }
      const tenYearSubscriptionCost = Math.round(subCompound);

      // 17. Credit Utilization & CIBIL Impact
      const creditUtilizationEst = Math.min(100, Math.round((data.debt * 0.2 / (effectiveIncome * 3 || 1)) * 100));
      const cibilScoreImpact = creditUtilizationEst <= 30 ? 'Favorable (Estimated CIBIL 770-810)' : 'High Utilization Drag (Estimated CIBIL 680-720)';

      // 18. Impulsive Spending & Behavioral Bias Metric
      const impulseSpendingScore = Math.min(100, Math.round((discretionaryLeakageRatio * 1.8) + (expenseShockPct * 0.8)));

      // 19. Family & Dependent Lifecycle Protection Buffer
      const familyProtectionFloor = effectiveExpenses * (3 + data.dependents * 1.5);
      const termInsuranceNeed = Math.round(effectiveIncome * 12 * 12); // 12x annual salary for life cover

      // 20. 360° Comprehensive Stability Score (0-100)
      const liquidityScore = Math.min(100, Math.max(10, (standardRunwayMonths / 6) * 100));
      const solvencyScore = Math.min(100, Math.max(0, 100 - dtiRatio * 1.8));
      const disciplineScore = Math.min(100, Math.max(10, savingsRate * 2.5));
      const careerScore = Math.min(100, Math.max(20, 100 - careerProfile.risk));

      const stabilityScore = Math.min(
        100,
        Math.max(
          5,
          Math.round(
            liquidityScore * 0.3 +
            solvencyScore * 0.25 +
            disciplineScore * 0.25 +
            careerScore * 0.2
          )
        )
      );

      // Dynamic Crisis Mitigation Triage Playbook
      const triagePlaybook: Array<{ priority: 'P1' | 'P2' | 'P3'; title: string; detail: string }> = [
        {
          priority: 'P1',
          title: 'Liquid Reserve Lock',
          detail: emergencyDeficit3M > 0
            ? `Immediate Action: Top up emergency fund by ${formatAmount(emergencyDeficit3M)} to secure the mandatory 3-month survival floor (${formatAmount(target3M)}).`
            : `Fully Secured: Your ${standardRunwayMonths}-month emergency reserve covers all essential living expenses. Lock in ₹ High-Yield Savings.`,
        },
        {
          priority: 'P2',
          title: 'High-Interest Debt Attack',
          detail: data.debt > 0
            ? `Implement ${debtStrategy === 'avalanche' ? 'Debt Avalanche' : 'Debt Snowball'} on your ${formatAmount(data.debt)} debt (${data.debtInterestRate}% APR) to save ${formatAmount(avalancheInterestSaved)} in interest.`
            : `Zero Debt Freedom: No consumer debt drag detected. Direct all monthly surplus into wealth-building equity SIPs.`,
        },
        {
          priority: 'P3',
          title: 'Health & Career Shield',
          detail: healthInsuranceDeficit > 0
            ? `Expand medical insurance by ${formatAmount(healthInsuranceDeficit)} to protect your net worth against hospital cash drains.`
            : `Career Upskilling: Target "${careerProfile.switchRole}" to learn ${careerProfile.skills} key skills and insulate your income from tech layoffs.`,
        },
      ];

      setResult({
        stabilityScore,
        riskBand,
        standardRunwayMonths,
        standardRunwayDays,
        survivalRunwayMonths,
        survivalRunwayDays,
        emergencyDeficit3M,
        emergencyDeficit6M,
        emergencyDeficit12M,
        dtiRatio,
        dtiStatus,
        frontEndDti,
        savingsRate,
        netWorth,
        netWorthProjection5Y,
        netWorthProjection10Y,
        netWorthProjection20Y,
        realNetWorthProjection10Y,
        careerLayoffRiskPct: careerProfile.risk,
        recommendedSwitchRole: careerProfile.switchRole,
        missingSkillsCount: careerProfile.skills,
        leanFireTarget,
        standardFireTarget,
        fatFireTarget,
        fireAttainmentPct,
        yearsToFire,
        healthInsuranceAdequacyPct,
        healthInsuranceDeficit,
        discretionaryLeakageRatio,
        wantsVsNeedsRatio,
        taxInefficiencyScore,
        recommendedTaxRegime,
        taxSavingsPotential,
        avalancheMonthsSaved,
        avalancheInterestSaved,
        housingBurdenRatio,
        liquidConcentrationRatio,
        tenYearSubscriptionCost,
        creditUtilizationEst,
        cibilScoreImpact,
        impulseSpendingScore,
        termInsuranceNeed,
        familyProtectionFloor,
        breakdown: {
          liquidity: Math.round(liquidityScore),
          solvency: Math.round(solvencyScore),
          savingsDiscipline: Math.round(disciplineScore),
          careerShield: Math.round(careerScore),
        },
        triagePlaybook,
      });

      setLoading(false);
    }, 400);
  };

  // Run automatically on initial render with demo data
  useEffect(() => {
    calculateAssessment();
  }, []);

  // Quick Preset Handlers
  const loadPreset = (preset: 'tech' | 'debt_heavy' | 'layoff' | 'fire') => {
    if (preset === 'tech') {
      setData({
        monthlyIncome: 85000,
        monthlyExpenses: 42000,
        emergencyFund: 250000,
        investments: 550000,
        debt: 320000,
        debtInterestRate: 13.5,
        monthlyHousingCost: 18000,
        healthInsuranceCover: 500000,
        monthlyWants: 15000,
        monthlySubscriptions: 3500,
        monthlySip: 18000,
        age: 28,
        dependents: 1,
        employmentType: 'salaried',
        careerField: 'tech_software',
        riskTolerance: 7
      });
      setIncomeShockPct(0);
      setExpenseShockPct(0);
    } else if (preset === 'debt_heavy') {
      setData({
        monthlyIncome: 60000,
        monthlyExpenses: 48000,
        emergencyFund: 40000,
        investments: 80000,
        debt: 1200000,
        debtInterestRate: 18.0,
        monthlyHousingCost: 22000,
        healthInsuranceCover: 300000,
        monthlyWants: 12000,
        monthlySubscriptions: 4500,
        monthlySip: 2000,
        age: 32,
        dependents: 2,
        employmentType: 'salaried',
        careerField: 'sales_marketing',
        riskTolerance: 4
      });
      setIncomeShockPct(10);
      setExpenseShockPct(15);
    } else if (preset === 'layoff') {
      setData({
        monthlyIncome: 1000, // zeroed out income shock
        monthlyExpenses: 38000,
        emergencyFund: 190000,
        investments: 210000,
        debt: 150000,
        debtInterestRate: 12.0,
        monthlyHousingCost: 16000,
        healthInsuranceCover: 500000,
        monthlyWants: 3000,
        monthlySubscriptions: 2000,
        monthlySip: 0,
        age: 29,
        dependents: 1,
        employmentType: 'contract',
        careerField: 'tech_software',
        riskTolerance: 5
      });
      setIncomeShockPct(50);
      setExpenseShockPct(0);
    } else if (preset === 'fire') {
      setData({
        monthlyIncome: 160000,
        monthlyExpenses: 35000,
        emergencyFund: 450000,
        investments: 2800000,
        debt: 0,
        debtInterestRate: 0,
        monthlyHousingCost: 14000,
        healthInsuranceCover: 1500000,
        monthlyWants: 10000,
        monthlySubscriptions: 1800,
        monthlySip: 85000,
        age: 31,
        dependents: 0,
        employmentType: 'salaried',
        careerField: 'tech_software',
        riskTolerance: 8
      });
      setIncomeShockPct(0);
      setExpenseShockPct(0);
    }
  };

  const copyAuditMemo = () => {
    if (!result) return;
    const memo = `=====================================================
FINFOLIO FINANCIAL RESILIENCE & HEALTH AUDIT MEMO
Strict Indian Rupee (₹) Reporting
Generated: ${new Date().toLocaleDateString('en-IN')}
=====================================================

1. 360° FINANCIAL HEALTH & RESILIENCE
- Composite Health Score: ${result.stabilityScore}/100 [${result.riskBand} Risk Profile]
- Standard Emergency Runway: ${result.standardRunwayMonths} Months (${result.standardRunwayDays} Days of Survival)
- Emergency Survival Runway (-35% burn): ${result.survivalRunwayMonths} Months (${result.survivalRunwayDays} Days of Survival)
- Debt-to-Income (DTI): ${result.dtiRatio}% [${result.dtiStatus}]
- Housing Cost Ratio: ${result.housingBurdenRatio}% of Net Income

2. CASH FLOWS & LIQUIDITY RESERVES
- Monthly Gross Income: ${formatAmount(data.monthlyIncome)}
- Monthly Essential Expenses: ${formatAmount(data.monthlyExpenses)}
- Liquid Emergency Cash: ${formatAmount(data.emergencyFund)}
- 3-Month Minimum Floor Shortfall: ${result.emergencyDeficit3M > 0 ? formatAmount(result.emergencyDeficit3M) : 'Fully Secured'}
- 6-Month Standard Cushion Shortfall: ${result.emergencyDeficit6M > 0 ? formatAmount(result.emergencyDeficit6M) : 'Fully Secured'}
- Total Liquid Net Worth: ${formatAmount(result.netWorth)}

3. 10-YEAR WEALTH & INFLATION PROJECTIONS
- 10-Year Nominal Wealth (12% CAGR): ${formatAmount(result.netWorthProjection10Y)}
- 10-Year Real Purchasing Power (Inflation 6%): ${formatAmount(result.realNetWorthProjection10Y)}
- 20-Year Compound Trajectory: ${formatAmount(result.netWorthProjection20Y)}

4. RETIREMENT & FIRE TARGETS
- Standard FIRE Capital Target (25x): ${formatAmount(result.standardFireTarget)}
- Current FIRE Attainment: ${result.fireAttainmentPct}% (${result.yearsToFire} Years to Financial Independence)

5. DEBT ACCELERATION & TAX OPTIMIZATION
- Total Debt: ${formatAmount(data.debt)} (${data.debtInterestRate}% APR)
- Avalanche Interest Savings: ${formatAmount(result.avalancheInterestSaved)} saved (${result.avalancheMonthsSaved} months faster)
- Recommended Tax Regime: ${result.recommendedTaxRegime} (Est. ${formatAmount(result.taxSavingsPotential)}/yr savings)

6. CAREER RESILIENCE & SKILLS
- Career Layoff Vulnerability: ${result.careerLayoffRiskPct}%
- Recommended Career Switch Role: ${result.recommendedSwitchRole}
- High-Demand Skills to Master: ${result.missingSkillsCount} Skills

7. CRISIS MITIGATION TRIAGE PLAYBOOK
${result.triagePlaybook.map((p) => `[${p.priority}] ${p.title}: ${p.detail}`).join('\n')}

=====================================================
Audited by FINFOLIO Personal Finance Intelligence Platform
=====================================================`;

    navigator.clipboard.writeText(memo);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const downloadJsonReport = () => {
    if (!result) return;
    const reportData = {
      timestamp: new Date().toISOString(),
      currency: 'INR',
      profile: data,
      auditResults: result
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finfolio-audit-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Banner */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,58,138,0.5), rgba(15,23,42,0.9))'
                : 'linear-gradient(135deg, #1e3a8a, #0f172a)',
            color: '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="800">
                🛡️ 360° Financial Health &amp; Crisis Resilience Audit
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.8 }}>
                20-point comprehensive institutional stress-test: Layoff Defense, DTI Overburden, FIRE Projections, and Tax Minimization in Indian Rupees (₹).
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Chip
                label="🇮🇳 Indian Rupee (₹) Only"
                sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: 700 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={copyAuditMemo}
                startIcon={<ContentCopy fontSize="small" />}
                sx={{ bgcolor: '#ffffff', color: '#1e3a8a', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }}
              >
                {copiedReport ? '✓ Copied' : 'Export Memo'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Preset Archetype Buttons */}
      <Card sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5 }}>
          ⚡ Quick Load Production Test Scenarios:
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            onClick={() => { loadPreset('tech'); calculateAssessment(); }}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            💻 Tech Professional (₹85k/mo)
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => { loadPreset('debt_heavy'); calculateAssessment(); }}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            🚨 High Debt Stress (₹12L Debt)
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="warning"
            onClick={() => { loadPreset('layoff'); calculateAssessment(); }}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            📉 Sudden Layoff Shock (₹0 Income)
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="success"
            onClick={() => { loadPreset('fire'); calculateAssessment(); }}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            🔥 Frugal FIRE (₹1.6L Income)
          </Button>
        </Stack>
      </Card>

      <GridTyped container spacing={4}>
        {/* Left Form: Inputs & Crisis What-If Controls */}
        <GridTyped item xs={12} lg={4.5}>
          <Card sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 2.5 }}>
              1. Financial Profile Inputs
            </Typography>

            <Stack spacing={2.2}>
              <TextField
                fullWidth
                label="Monthly Gross Income (₹)"
                type="number"
                value={data.monthlyIncome}
                helperText={getHelperText('monthlyIncome', data.monthlyIncome)}
                error={data.monthlyIncome >= INPUT_LIMITS.monthlyIncome.max}
                inputProps={{ min: INPUT_LIMITS.monthlyIncome.min, max: INPUT_LIMITS.monthlyIncome.max }}
                onChange={(e) => handleNumberChange('monthlyIncome', e.target.value)}
                onBlur={() => handleBlur('monthlyIncome')}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'primary.main' }}>₹</Typography> }}
              />

              <TextField
                fullWidth
                label="Monthly Essential Expenses (₹)"
                type="number"
                value={data.monthlyExpenses}
                helperText={getHelperText('monthlyExpenses', data.monthlyExpenses)}
                error={data.monthlyExpenses >= INPUT_LIMITS.monthlyExpenses.max}
                inputProps={{ min: INPUT_LIMITS.monthlyExpenses.min, max: INPUT_LIMITS.monthlyExpenses.max }}
                onChange={(e) => handleNumberChange('monthlyExpenses', e.target.value)}
                onBlur={() => handleBlur('monthlyExpenses')}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'text.secondary' }}>₹</Typography> }}
              />

              <TextField
                fullWidth
                label="Liquid Emergency Reserve (₹)"
                type="number"
                value={data.emergencyFund}
                helperText={getHelperText('emergencyFund', data.emergencyFund)}
                error={data.emergencyFund >= INPUT_LIMITS.emergencyFund.max}
                inputProps={{ min: INPUT_LIMITS.emergencyFund.min, max: INPUT_LIMITS.emergencyFund.max }}
                onChange={(e) => handleNumberChange('emergencyFund', e.target.value)}
                onBlur={() => handleBlur('emergencyFund')}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'success.main' }}>₹</Typography> }}
              />

              <TextField
                fullWidth
                label="Total Investments & Savings (₹)"
                type="number"
                value={data.investments}
                helperText={getHelperText('investments', data.investments)}
                error={data.investments >= INPUT_LIMITS.investments.max}
                inputProps={{ min: INPUT_LIMITS.investments.min, max: INPUT_LIMITS.investments.max }}
                onChange={(e) => handleNumberChange('investments', e.target.value)}
                onBlur={() => handleBlur('investments')}
                InputProps={{ startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'info.main' }}>₹</Typography> }}
              />

              <GridTyped container spacing={2}>
                <GridTyped item xs={7}>
                  <TextField
                    fullWidth
                    label="Total Debt (₹)"
                    type="number"
                    value={data.debt}
                    helperText={getHelperText('debt', data.debt)}
                    error={data.debt >= INPUT_LIMITS.debt.max}
                    inputProps={{ min: INPUT_LIMITS.debt.min, max: INPUT_LIMITS.debt.max }}
                    onChange={(e) => handleNumberChange('debt', e.target.value)}
                    onBlur={() => handleBlur('debt')}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontWeight: 700, color: 'error.main' }}>₹</Typography> }}
                  />
                </GridTyped>
                <GridTyped item xs={5}>
                  <TextField
                    fullWidth
                    label="Debt APR (%)"
                    type="number"
                    value={data.debtInterestRate}
                    helperText={getHelperText('debtInterestRate', data.debtInterestRate)}
                    error={data.debtInterestRate >= INPUT_LIMITS.debtInterestRate.max}
                    inputProps={{ min: INPUT_LIMITS.debtInterestRate.min, max: INPUT_LIMITS.debtInterestRate.max }}
                    onChange={(e) => handleNumberChange('debtInterestRate', e.target.value)}
                    onBlur={() => handleBlur('debtInterestRate')}
                  />
                </GridTyped>
              </GridTyped>

              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Rent / Home EMI (₹)"
                    type="number"
                    value={data.monthlyHousingCost}
                    helperText={getHelperText('monthlyHousingCost', data.monthlyHousingCost)}
                    error={data.monthlyHousingCost >= INPUT_LIMITS.monthlyHousingCost.max}
                    inputProps={{ min: INPUT_LIMITS.monthlyHousingCost.min, max: INPUT_LIMITS.monthlyHousingCost.max }}
                    onChange={(e) => handleNumberChange('monthlyHousingCost', e.target.value)}
                    onBlur={() => handleBlur('monthlyHousingCost')}
                  />
                </GridTyped>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Health Cover (₹)"
                    type="number"
                    value={data.healthInsuranceCover}
                    helperText={getHelperText('healthInsuranceCover', data.healthInsuranceCover)}
                    error={data.healthInsuranceCover >= INPUT_LIMITS.healthInsuranceCover.max}
                    inputProps={{ min: INPUT_LIMITS.healthInsuranceCover.min, max: INPUT_LIMITS.healthInsuranceCover.max }}
                    onChange={(e) => handleNumberChange('healthInsuranceCover', e.target.value)}
                    onBlur={() => handleBlur('healthInsuranceCover')}
                  />
                </GridTyped>
              </GridTyped>

              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Monthly Wants (₹)"
                    type="number"
                    value={data.monthlyWants}
                    helperText={getHelperText('monthlyWants', data.monthlyWants)}
                    error={data.monthlyWants >= INPUT_LIMITS.monthlyWants.max}
                    inputProps={{ min: INPUT_LIMITS.monthlyWants.min, max: INPUT_LIMITS.monthlyWants.max }}
                    onChange={(e) => handleNumberChange('monthlyWants', e.target.value)}
                    onBlur={() => handleBlur('monthlyWants')}
                  />
                </GridTyped>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Subscriptions (₹)"
                    type="number"
                    value={data.monthlySubscriptions}
                    helperText={getHelperText('monthlySubscriptions', data.monthlySubscriptions)}
                    error={data.monthlySubscriptions >= INPUT_LIMITS.monthlySubscriptions.max}
                    inputProps={{ min: INPUT_LIMITS.monthlySubscriptions.min, max: INPUT_LIMITS.monthlySubscriptions.max }}
                    onChange={(e) => handleNumberChange('monthlySubscriptions', e.target.value)}
                    onBlur={() => handleBlur('monthlySubscriptions')}
                  />
                </GridTyped>
              </GridTyped>

              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Employment</InputLabel>
                    <Select
                      value={data.employmentType}
                      label="Employment"
                      onChange={(e) => setData({ ...data, employmentType: e.target.value as any })}
                    >
                      <MenuItem value="salaried">Salaried (Full-Time)</MenuItem>
                      <MenuItem value="contract">Contract / Freelance</MenuItem>
                      <MenuItem value="self-employed">Self-Employed</MenuItem>
                      <MenuItem value="business">Business Owner</MenuItem>
                    </Select>
                  </FormControl>
                </GridTyped>
                <GridTyped item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Career Field</InputLabel>
                    <Select
                      value={data.careerField}
                      label="Career Field"
                      onChange={(e) => setData({ ...data, careerField: e.target.value as any })}
                    >
                      <MenuItem value="tech_software">Software & Tech</MenuItem>
                      <MenuItem value="finance">Banking & Finance</MenuItem>
                      <MenuItem value="sales_marketing">Marketing / Sales</MenuItem>
                      <MenuItem value="operations">Operations / Supply</MenuItem>
                      <MenuItem value="healthcare">Healthcare / Medical</MenuItem>
                    </Select>
                  </FormControl>
                </GridTyped>
              </GridTyped>

              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Age (Years)"
                    type="number"
                    value={data.age}
                    helperText={getHelperText('age', data.age)}
                    error={data.age > INPUT_LIMITS.age.max}
                    inputProps={{ min: INPUT_LIMITS.age.min, max: INPUT_LIMITS.age.max }}
                    onChange={(e) => handleNumberChange('age', e.target.value)}
                    onBlur={() => handleBlur('age')}
                  />
                </GridTyped>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Dependents"
                    type="number"
                    value={data.dependents}
                    helperText={getHelperText('dependents', data.dependents)}
                    error={data.dependents > INPUT_LIMITS.dependents.max}
                    inputProps={{ min: INPUT_LIMITS.dependents.min, max: INPUT_LIMITS.dependents.max }}
                    onChange={(e) => handleNumberChange('dependents', e.target.value)}
                    onBlur={() => handleBlur('dependents')}
                  />
                </GridTyped>
              </GridTyped>

              {/* Stress-Tester Sliders */}
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={800} color="warning.main" sx={{ mb: 1 }}>
                  ⚡ Crisis What-If Stress-Tester
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Simulate Income Shock
                    </Typography>
                    <Typography variant="caption" fontWeight="700" color="error.main">
                      -{incomeShockPct}%
                    </Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={incomeShockPct}
                    onChange={(_, val) => setIncomeShockPct(val as number)}
                    min={0}
                    max={50}
                    step={5}
                    color="error"
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Simulate Expense Spike (Inflation/Medical)
                    </Typography>
                    <Typography variant="caption" fontWeight="700" color="warning.main">
                      +{expenseShockPct}%
                    </Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={expenseShockPct}
                    onChange={(_, val) => setExpenseShockPct(val as number)}
                    min={0}
                    max={40}
                    step={5}
                    color="warning"
                  />
                </Box>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={calculateAssessment}
                disabled={loading}
                sx={{ borderRadius: 3, fontWeight: 800, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Run 20-Feature Resilience Audit'}
              </Button>
            </Stack>
          </Card>
        </GridTyped>

        {/* Right Column: 20 Advanced Features & Reports */}
        <GridTyped item xs={12} lg={7.5}>
          {loading && (
            <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="700">Simulating 20 institutional stress scenarios in ₹...</Typography>
            </Card>
          )}

          {result && !loading && (
            <Stack spacing={3.5}>
              {/* Feature 1 & 2: 360° Health Score & Dual Runway */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      1. COMPOSITE HEALTH SCORE
                    </Typography>
                    <Typography variant="h3" fontWeight="900" color={result.stabilityScore >= 70 ? 'success.main' : 'warning.main'} sx={{ mt: 0.5 }}>
                      {result.stabilityScore} <Typography component="span" variant="h6">/ 100</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Profile: <strong>{result.riskBand}</strong> • Liquid Net Worth: <strong>{formatAmount(result.netWorth)}</strong>
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={result.stabilityScore}
                      color={result.stabilityScore >= 70 ? 'success' : result.stabilityScore >= 45 ? 'warning' : 'error'}
                      sx={{ height: 8, borderRadius: 4, mt: 1.5 }}
                    />
                  </Card>
                </GridTyped>

                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="700">
                        2. LAYOFF SURVIVAL RUNWAY (DAYS &amp; MONTHS)
                      </Typography>
                      <Chip
                        size="small"
                        color={result.standardRunwayDays >= 180 ? 'success' : result.standardRunwayDays >= 90 ? 'primary' : 'error'}
                        label={`🛡️ ${result.standardRunwayDays} DAYS OF SURVIVAL`}
                        sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                      />
                    </Box>
                    <Typography variant="h3" fontWeight="900" color="primary.main" sx={{ mt: 0.8 }}>
                      {result.standardRunwayDays} <Typography component="span" variant="h5" fontWeight="800">Days</Typography>
                      <Typography component="span" variant="h6" sx={{ ml: 1, color: 'text.secondary', fontWeight: 700 }}>
                        ({result.standardRunwayMonths} Months)
                      </Typography>
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        variant="outlined"
                        color="warning"
                        label={`❄️ Freeze Mode: ${result.survivalRunwayDays} Days (${result.survivalRunwayMonths} Mo)`}
                        sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (result.standardRunwayMonths / 6) * 100)}
                      color={result.standardRunwayMonths >= 6 ? 'success' : result.standardRunwayMonths >= 3 ? 'primary' : 'error'}
                      sx={{ height: 8, borderRadius: 4, mt: 1.5 }}
                    />
                  </Card>
                </GridTyped>
              </GridTyped>

              {/* Feature 3 & 4: Tiered Emergency Deficit & DTI Stress Gauge */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      3. TIERED EMERGENCY DEFICITS
                    </Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ mt: 0.5 }} color={result.emergencyDeficit6M > 0 ? 'warning.main' : 'success.main'}>
                      {result.emergencyDeficit6M > 0 ? formatAmount(result.emergencyDeficit6M) : '✓ 6M Fully Funded'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      3-Month Floor: {result.emergencyDeficit3M > 0 ? `Short by ${formatAmount(result.emergencyDeficit3M)}` : 'Secured'} • 12-Month Buffer: {formatAmount(result.emergencyDeficit12M)} gap
                    </Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="700">
                      4. DEBT-TO-INCOME (DTI) OVERBURDEN
                    </Typography>
                    <Typography variant="h5" fontWeight="800" sx={{ mt: 0.5 }}>
                      {result.dtiRatio}% <Typography component="span" variant="caption">({result.dtiStatus})</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Housing Cost: {result.housingBurdenRatio}% of income (Banking limit: &le; 28%)
                    </Typography>
                  </Paper>
                </GridTyped>
              </GridTyped>

              {/* Feature 5: 10 & 20-Year Inflation-Adjusted Wealth Projections */}
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  5. 20-Year Wealth Projection (12% CAGR vs 6% Indian Inflation)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Shows projected nominal portfolio vs real purchasing power after continuous 6% Indian inflation discounting.
                </Typography>

                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={[
                      { year: 'Today', nominal: result.netWorth, real: result.netWorth },
                      { year: '5 Years', nominal: result.netWorthProjection5Y, real: Math.round(result.netWorthProjection5Y * 0.74) },
                      { year: '10 Years', nominal: result.netWorthProjection10Y, real: result.realNetWorthProjection10Y },
                      { year: '20 Years', nominal: result.netWorthProjection20Y, real: Math.round(result.netWorthProjection20Y * 0.31) },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(val) => `₹${Math.round(val / 100000)}L`} />
                    <RechartsTooltip
                      formatter={(val: any) => formatAmount(Number(val))}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="nominal" name="Nominal Net Worth (₹)" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                    <Area type="monotone" dataKey="real" name="Real Inflation-Adjusted (₹)" stroke="#10b981" fill="#10b981" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Feature 6 & 7: Career & Tech Skills Vulnerability + Dynamic Risk Profile */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Work fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight="800">
                        6. Career Layoff Vulnerability: {result.careerLayoffRiskPct}%
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Recommended Transition Role: <strong>{result.recommendedSwitchRole}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Gap to close: <strong>{result.missingSkillsCount} High-Demand Skills</strong> (Prompt Eng, Cloud, AI APIs).
                    </Typography>
                  </Card>
                </GridTyped>

                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Psychology fontSize="small" color="secondary" />
                      <Typography variant="subtitle2" fontWeight="800">
                        7. Dynamic Risk Profile: {result.riskBand}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Target Asset Allocation: <strong>{result.riskBand === 'Aggressive' ? '70% Equity / 20% Debt / 10% Gold' : result.riskBand === 'Growth' ? '60% Equity / 30% Debt / 10% Gold' : '45% Equity / 45% Debt / 10% Gold'}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Tolerance Score: {data.riskTolerance}/10 • Volatility Drawdown Capacity: -22%
                    </Typography>
                  </Card>
                </GridTyped>
              </GridTyped>

              {/* Feature 8 & 9: Goal Feasibility & FIRE Readiness */}
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="800">
                    8 &amp; 9. Financial Independence &amp; FIRE Readiness Engine
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={fireMode}
                    exclusive
                    onChange={(_, val) => val && setFireMode(val)}
                  >
                    <ToggleButton value="lean">Lean FIRE</ToggleButton>
                    <ToggleButton value="standard">Standard</ToggleButton>
                    <ToggleButton value="fat">Fat FIRE</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <GridTyped container spacing={2}>
                  <GridTyped item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">TARGET CAPITAL</Typography>
                      <Typography variant="h6" fontWeight="800" color="primary.main">
                        {formatAmount(fireMode === 'lean' ? result.leanFireTarget : fireMode === 'fat' ? result.fatFireTarget : result.standardFireTarget)}
                      </Typography>
                    </Paper>
                  </GridTyped>
                  <GridTyped item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">CURRENT ATTAINMENT</Typography>
                      <Typography variant="h6" fontWeight="800" color="success.main">
                        {result.fireAttainmentPct}%
                      </Typography>
                    </Paper>
                  </GridTyped>
                  <GridTyped item xs={12} sm={4}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">ESTIMATED TIME TO FIRE</Typography>
                      <Typography variant="h6" fontWeight="800">
                        {result.yearsToFire} Years
                      </Typography>
                    </Paper>
                  </GridTyped>
                </GridTyped>
              </Card>

              {/* Feature 10 & 11: Health Insurance & Discretionary Leakage */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 0.5 }}>
                      10. Health Insurance Safety Floor
                    </Typography>
                    <Typography variant="body2" color={result.healthInsuranceDeficit > 0 ? 'warning.main' : 'success.main'}>
                      {result.healthInsuranceDeficit > 0
                        ? `Deficit: ${formatAmount(result.healthInsuranceDeficit)} (Current: ${formatAmount(data.healthInsuranceCover)})`
                        : `✓ Full ₹10 Lakhs Coverage Maintained`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Protects your liquid investments from emergency hospital bill erosion.
                    </Typography>
                  </Card>
                </GridTyped>

                <GridTyped item xs={12} sm={6}>
                  <Card sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 0.5 }}>
                      11. Discretionary Spending Leakage
                    </Typography>
                    <Typography variant="body2">
                      Wants: <strong>{result.discretionaryLeakageRatio}%</strong> of income (Golden standard: &le; 30%)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Savings Discipline Rate: <strong>{result.savingsRate}%</strong> of monthly income.
                    </Typography>
                  </Card>
                </GridTyped>
              </GridTyped>

              {/* Feature 12 & 13: Tax Inefficiency & Debt Payoff Accelerator */}
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 1.5 }}>
                  12 &amp; 13. Tax Inefficiency &amp; Debt Payoff Acceleration Engine
                </Typography>
                <GridTyped container spacing={2}>
                  <GridTyped item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2.5 }}>
                      <Typography variant="subtitle2" fontWeight="700">
                        🧾 Recommended Regime: <strong>{result.recommendedTaxRegime}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Potential annual direct tax savings: <strong>{formatAmount(result.taxSavingsPotential)}/year</strong>.
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Audit Section 80C, 80D, and NPS Tier-1 deductions to minimize leakage.
                      </Typography>
                    </Paper>
                  </GridTyped>

                  <GridTyped item xs={12} sm={6}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight="700">
                          💳 Strategy: {debtStrategy === 'avalanche' ? 'Avalanche' : 'Snowball'}
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setDebtStrategy(debtStrategy === 'avalanche' ? 'snowball' : 'avalanche')}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          Switch
                        </Button>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Payoff Speedup: <strong>{result.avalancheMonthsSaved} months earlier</strong>.
                      </Typography>
                      <Typography variant="caption" color="success.main" fontWeight="700">
                        Total Interest Saved: {formatAmount(result.avalancheInterestSaved)}
                      </Typography>
                    </Paper>
                  </GridTyped>
                </GridTyped>
              </Card>

              {/* Feature 14, 15, 16, 17, 18, 19: Metric Matrix */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">14. HOUSING BURDEN</Typography>
                    <Typography variant="subtitle1" fontWeight="800">
                      {result.housingBurdenRatio}% of Income
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Safe target: &le; 28%</Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">15. LIQUID CONCENTRATION</Typography>
                    <Typography variant="subtitle1" fontWeight="800">
                      {result.liquidConcentrationRatio}% Liquid
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Cash vs Total Assets</Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">16. SUBSCRIPTION DRAG</Typography>
                    <Typography variant="subtitle1" fontWeight="800" color="warning.main">
                      {formatAmount(result.tenYearSubscriptionCost)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">10-Yr 12% SIP Opportunity Loss</Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">17. CREDIT UTILIZATION &amp; CIBIL</Typography>
                    <Typography variant="subtitle1" fontWeight="800">
                      {result.creditUtilizationEst}% Utilized
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{result.cibilScoreImpact}</Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">18. IMPULSIVE SPENDING RISK</Typography>
                    <Typography variant="subtitle1" fontWeight="800" color={result.impulseSpendingScore > 50 ? 'error.main' : 'success.main'}>
                      {result.impulseSpendingScore} / 100
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Discretionary Drawdown Vulnerability</Typography>
                  </Paper>
                </GridTyped>

                <GridTyped item xs={12} sm={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary">19. FAMILY TERM COVER NEED</Typography>
                    <Typography variant="subtitle1" fontWeight="800" color="primary.main">
                      {formatAmount(result.termInsuranceNeed)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">12x Annual Income Rule</Typography>
                  </Paper>
                </GridTyped>
              </GridTyped>

              {/* Feature 20: Triage Playbook & Multi-Format Export */}
              <Card sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" fontWeight="800">
                    20. Crisis Mitigation Playbook &amp; Export Center
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download fontSize="small" />}
                      onClick={downloadJsonReport}
                      sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Download JSON
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<ContentCopy fontSize="small" />}
                      onClick={copyAuditMemo}
                      sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      {copiedReport ? '✓ Copied Memo!' : 'Export Clipboard Memo'}
                    </Button>
                  </Stack>
                </Box>

                <Stack spacing={1.5}>
                  {result.triagePlaybook.map((play, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderColor: play.priority === 'P1' ? 'error.main' : play.priority === 'P2' ? 'warning.main' : 'info.main',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip
                          label={play.priority}
                          size="small"
                          color={play.priority === 'P1' ? 'error' : play.priority === 'P2' ? 'warning' : 'info'}
                          sx={{ fontWeight: 800, height: 20, fontSize: '0.7rem' }}
                        />
                        <Typography variant="subtitle2" fontWeight="800">
                          {play.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {play.detail}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Card>
            </Stack>
          )}
        </GridTyped>
      </GridTyped>
    </Container>
  );
}