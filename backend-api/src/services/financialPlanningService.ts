export interface FinancePlanningInput {
  annualIncome?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  existingEmi?: number;
  currentSavings?: number;
  emergencyFund?: number;
  debtBalance?: number;
  savingsGoal?: number;
  targetMonths?: number;
  creditScore?: number;
  employmentYears?: number;
  jobStability?: number;
  monthlyContribution?: number;
  incomeVolatility?: number;
  expenseGrowthRate?: number;
}

export interface BudgetHealthResult {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEmi: number;
  monthlySurplus: number;
  savingsRate: number;
  expenseRatio: number;
  debtRatio: number;
  score: number;
  status: 'healthy' | 'watch' | 'stretched';
  recommendations: string[];
}

export interface EmergencyFundPlanResult {
  currentReserve: number;
  targetMonths: number;
  targetAmount: number;
  currentCoverageMonths: number;
  shortfall: number;
  monthlyContribution: number;
  monthsToTarget: number;
  status: 'excellent' | 'good' | 'adequate' | 'insufficient' | 'critical';
  recommendations: string[];
}

export interface DebtPayoffPlanResult {
  totalDebt: number;
  minimumMonthlyPayment: number;
  extraMonthlyPayment: number;
  estimatedPayoffMonths: number;
  estimatedInterestDrag: number;
  recommendations: string[];
}

export interface SavingsGoalPlanResult {
  goalAmount: number;
  currentSavings: number;
  gap: number;
  targetMonths: number;
  monthlyRequired: number;
  estimatedCompletionMonths: number;
  progressPercent: number;
  recommendations: string[];
}

export interface ExpenseStressTestResult {
  stressedIncome: number;
  stressedExpenses: number;
  stressedMonthlyBurn: number;
  survivalMonths: number;
  riskBand: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export interface IncomeStabilitySummaryResult {
  score: number;
  band: 'stable' | 'balanced' | 'fragile';
  factors: string[];
  recommendations: string[];
}

export interface RiskProfileSummaryResult {
  score: number;
  band: 'low' | 'moderate' | 'high';
  keyDrivers: string[];
  recommendations: string[];
}

export interface CashReservePlanResult {
  reserveMonths: number;
  targetReserveAmount: number;
  currentReserve: number;
  topUpNeeded: number;
  monthlyTopUp: number;
  recommendations: string[];
}

export interface FinancialSnapshotResult {
  overallScore: number;
  grade: string;
  components: {
    budgetHealth: number;
    emergencyReadiness: number;
    debtPressure: number;
    incomeStability: number;
    riskProfile: number;
  };
  highlights: string[];
  recommendations: string[];
}

export interface ActionPlanResult {
  priorities: string[];
  nextBestAction: string;
  riskBand: 'low' | 'moderate' | 'high';
}

const DEFAULT_PROFILE: Required<Pick<FinancePlanningInput, 'monthlyIncome' | 'monthlyExpenses' | 'existingEmi' | 'currentSavings' | 'emergencyFund' | 'debtBalance' | 'savingsGoal' | 'targetMonths' | 'creditScore' | 'employmentYears' | 'jobStability' | 'monthlyContribution' | 'incomeVolatility' | 'expenseGrowthRate'>> = {
  monthlyIncome: 52000,
  monthlyExpenses: 31000,
  existingEmi: 7000,
  currentSavings: 186000,
  emergencyFund: 186000,
  debtBalance: 50000,
  savingsGoal: 500000,
  targetMonths: 12,
  creditScore: 710,
  employmentYears: 5,
  jobStability: 7,
  monthlyContribution: 10000,
  incomeVolatility: 0.15,
  expenseGrowthRate: 0.12,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveMonthlyIncome(input: FinancePlanningInput): number {
  const monthlyIncome = toNumber(input.monthlyIncome, 0);
  if (monthlyIncome > 0) {
    return monthlyIncome;
  }

  const annualIncome = toNumber(input.annualIncome, 0);
  if (annualIncome > 0) {
    return annualIncome / 12;
  }

  return DEFAULT_PROFILE.monthlyIncome;
}

function resolveReserve(input: FinancePlanningInput): number {
  const reserve = toNumber(input.emergencyFund, NaN);
  if (Number.isFinite(reserve) && reserve >= 0) {
    return reserve;
  }

  const currentSavings = toNumber(input.currentSavings, NaN);
  if (Number.isFinite(currentSavings) && currentSavings >= 0) {
    return currentSavings;
  }

  return DEFAULT_PROFILE.currentSavings;
}

function resolveNormalizedInput(input: FinancePlanningInput): Required<FinancePlanningInput> {
  return {
    annualIncome: toNumber(input.annualIncome, 0),
    monthlyIncome: resolveMonthlyIncome(input),
    monthlyExpenses: Math.max(0, toNumber(input.monthlyExpenses, DEFAULT_PROFILE.monthlyExpenses)),
    existingEmi: Math.max(0, toNumber(input.existingEmi, DEFAULT_PROFILE.existingEmi)),
    currentSavings: Math.max(0, toNumber(input.currentSavings, DEFAULT_PROFILE.currentSavings)),
    emergencyFund: Math.max(0, resolveReserve(input)),
    debtBalance: Math.max(0, toNumber(input.debtBalance, DEFAULT_PROFILE.debtBalance)),
    savingsGoal: Math.max(0, toNumber(input.savingsGoal, DEFAULT_PROFILE.savingsGoal)),
    targetMonths: Math.max(1, Math.round(toNumber(input.targetMonths, DEFAULT_PROFILE.targetMonths))),
    creditScore: clamp(Math.round(toNumber(input.creditScore, DEFAULT_PROFILE.creditScore)), 300, 900),
    employmentYears: Math.max(0, toNumber(input.employmentYears, DEFAULT_PROFILE.employmentYears)),
    jobStability: clamp(toNumber(input.jobStability, DEFAULT_PROFILE.jobStability), 0, 10),
    monthlyContribution: Math.max(0, toNumber(input.monthlyContribution, DEFAULT_PROFILE.monthlyContribution)),
    incomeVolatility: clamp(toNumber(input.incomeVolatility, DEFAULT_PROFILE.incomeVolatility), 0, 1),
    expenseGrowthRate: clamp(toNumber(input.expenseGrowthRate, DEFAULT_PROFILE.expenseGrowthRate), 0, 1),
  };
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
}

function annualRateFromCreditScore(creditScore: number): number {
  if (creditScore >= 780) return 0.11;
  if (creditScore >= 720) return 0.145;
  if (creditScore >= 660) return 0.185;
  return 0.235;
}

function generateBudgetRecommendations(monthlySurplus: number, expenseRatio: number, debtRatio: number): string[] {
  const recommendations: string[] = [];

  if (monthlySurplus < 0) {
    recommendations.push('Reduce fixed expenses or increase income to stop monthly cash burn.');
  }

  if (expenseRatio > 0.7) {
    recommendations.push('Bring monthly expenses below 70% of income to restore savings capacity.');
  }

  if (debtRatio > 0.2) {
    recommendations.push('Accelerate debt repayment to keep EMI pressure under control.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Budget is healthy. Redirect any surplus toward emergency savings or investments.');
  }

  return recommendations;
}

export function calculateBudgetHealth(input: FinancePlanningInput): BudgetHealthResult {
  const normalized = resolveNormalizedInput(input);
  const monthlyIncome = normalized.monthlyIncome;
  const monthlyExpenses = normalized.monthlyExpenses;
  const existingEmi = normalized.existingEmi;

  const monthlySurplus = monthlyIncome - monthlyExpenses - existingEmi;
  const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  const debtRatio = monthlyIncome > 0 ? existingEmi / monthlyIncome : 0;
  const savingsRate = monthlyIncome > 0 ? monthlySurplus / monthlyIncome : 0;

  const score = clamp(
    Math.round(60 + (savingsRate * 100) - (expenseRatio * 35) - (debtRatio * 45)),
    0,
    100
  );

  const status = score >= 75 ? 'healthy' : score >= 50 ? 'watch' : 'stretched';

  return {
    monthlyIncome,
    monthlyExpenses,
    existingEmi,
    monthlySurplus,
    savingsRate: clamp(savingsRate, -1, 1),
    expenseRatio,
    debtRatio,
    score,
    status,
    recommendations: generateBudgetRecommendations(monthlySurplus, expenseRatio, debtRatio),
  };
}

export function buildEmergencyFundPlan(input: FinancePlanningInput): EmergencyFundPlanResult {
  const normalized = resolveNormalizedInput(input);
  const monthlyExpenses = normalized.monthlyExpenses;
  const reserve = normalized.emergencyFund;
  const targetMonths = 6;
  const targetAmount = monthlyExpenses * targetMonths;
  const currentCoverageMonths = monthlyExpenses > 0 ? reserve / monthlyExpenses : targetMonths;
  const shortfall = Math.max(0, targetAmount - reserve);
  const monthlyContribution = shortfall > 0
    ? Math.max(1000, Math.ceil(shortfall / targetMonths))
    : Math.max(1000, Math.ceil((normalized.monthlyIncome - monthlyExpenses - normalized.existingEmi) * 0.15));
  const monthsToTarget = shortfall > 0 ? Math.ceil(shortfall / monthlyContribution) : 0;

  let status: EmergencyFundPlanResult['status'] = 'adequate';
  if (currentCoverageMonths >= 12) {
    status = 'excellent';
  } else if (currentCoverageMonths >= 9) {
    status = 'good';
  } else if (currentCoverageMonths >= 6) {
    status = 'adequate';
  } else if (currentCoverageMonths >= 3) {
    status = 'insufficient';
  } else {
    status = 'critical';
  }

  const recommendations: string[] = [];
  if (status === 'critical') {
    recommendations.push('Prioritize emergency reserves immediately.');
  } else if (status === 'insufficient') {
    recommendations.push('Build coverage up to at least 6 months of expenses.');
  } else {
    recommendations.push('Maintain the reserve and review it after major expense changes.');
  }

  if (shortfall > 0) {
    recommendations.push(`Set aside about Rs.${monthlyContribution.toLocaleString('en-IN')} per month until you reach the target.`);
  }

  return {
    currentReserve: reserve,
    targetMonths,
    targetAmount: Math.round(targetAmount),
    currentCoverageMonths: Math.round(currentCoverageMonths * 10) / 10,
    shortfall: Math.round(shortfall),
    monthlyContribution,
    monthsToTarget,
    status,
    recommendations,
  };
}

export function buildDebtPayoffPlan(input: FinancePlanningInput): DebtPayoffPlanResult {
  const normalized = resolveNormalizedInput(input);
  const totalDebt = normalized.debtBalance;
  const minimumMonthlyPayment = Math.max(0, normalized.existingEmi);
  const extraMonthlyPayment = Math.max(1000, Math.ceil(Math.max(0, normalized.monthlyIncome - normalized.monthlyExpenses - normalized.existingEmi) * 0.4));
  const monthlyPayment = Math.max(1000, minimumMonthlyPayment + extraMonthlyPayment);
  const monthlyRate = annualRateFromCreditScore(normalized.creditScore) / 12;

  let balance = totalDebt;
  let months = 0;
  let totalPaid = 0;

  while (balance > 0 && months < 600) {
    const interest = balance * monthlyRate;
    const payment = Math.min(balance + interest, monthlyPayment);
    balance = balance + interest - payment;
    totalPaid += payment;
    months += 1;

    if (payment <= 0) {
      break;
    }
  }

  const estimatedPayoffMonths = balance > 0 ? 600 : months;
  const estimatedInterestDrag = Math.max(0, Math.round(totalPaid - totalDebt));

  const recommendations: string[] = [];
  if (totalDebt > 0) {
    recommendations.push('Use the smallest balance first to build momentum, then roll payments forward.');
    recommendations.push(`Target at least Rs.${monthlyPayment.toLocaleString('en-IN')} per month toward debt reduction.`);
  } else {
    recommendations.push('No active debt balance detected. Keep payments flowing into savings instead.');
  }

  return {
    totalDebt,
    minimumMonthlyPayment,
    extraMonthlyPayment,
    estimatedPayoffMonths,
    estimatedInterestDrag,
    recommendations,
  };
}

export function buildSavingsGoalPlan(input: FinancePlanningInput): SavingsGoalPlanResult {
  const normalized = resolveNormalizedInput(input);
  const goalAmount = normalized.savingsGoal;
  const currentSavings = normalized.currentSavings;
  const gap = Math.max(0, goalAmount - currentSavings);
  const targetMonths = Math.max(1, normalized.targetMonths);
  const monthlyRequired = gap > 0 ? Math.ceil(gap / targetMonths) : 0;
  const estimatedCompletionMonths = monthlyRequired > 0
    ? Math.ceil(gap / Math.max(1, normalized.monthlyContribution || monthlyRequired))
    : 0;
  const progressPercent = goalAmount > 0 ? clamp((currentSavings / goalAmount) * 100, 0, 100) : 0;

  const recommendations: string[] = [];
  if (gap > 0) {
    recommendations.push(`Save about Rs.${monthlyRequired.toLocaleString('en-IN')} per month to hit the target on time.`);
  } else {
    recommendations.push('Savings goal is already met. Redirect the next surplus toward investments or debt payoff.');
  }

  return {
    goalAmount,
    currentSavings,
    gap,
    targetMonths,
    monthlyRequired,
    estimatedCompletionMonths,
    progressPercent: Math.round(progressPercent * 10) / 10,
    recommendations,
  };
}

export function buildExpenseStressTest(input: FinancePlanningInput): ExpenseStressTestResult {
  const normalized = resolveNormalizedInput(input);
  const incomeShock = clamp(normalized.incomeVolatility, 0, 1);
  const expenseGrowth = clamp(normalized.expenseGrowthRate, 0, 1);

  const stressedIncome = Math.max(0, Math.round(normalized.monthlyIncome * (1 - incomeShock)));
  const stressedExpenses = Math.round(normalized.monthlyExpenses * (1 + expenseGrowth));
  const stressedMonthlyBurn = Math.max(0, stressedExpenses + normalized.existingEmi - stressedIncome);
  const survivalMonths = stressedMonthlyBurn > 0 ? Math.round((normalized.emergencyFund / stressedMonthlyBurn) * 10) / 10 : 99;

  let riskBand: ExpenseStressTestResult['riskBand'] = 'low';
  if (stressedMonthlyBurn > normalized.monthlyIncome * 0.35 || survivalMonths < 3) {
    riskBand = 'high';
  } else if (stressedMonthlyBurn > normalized.monthlyIncome * 0.2 || survivalMonths < 6) {
    riskBand = 'moderate';
  }

  const recommendations: string[] = [];
  if (riskBand === 'high') {
    recommendations.push('Lock down discretionary spending before income or expense shock hits.');
  } else if (riskBand === 'moderate') {
    recommendations.push('Build a small cash buffer to absorb a near-term expense increase.');
  } else {
    recommendations.push('Current profile can absorb a moderate stress scenario. Keep monitoring fixed costs.');
  }

  return {
    stressedIncome,
    stressedExpenses,
    stressedMonthlyBurn,
    survivalMonths,
    riskBand,
    recommendations,
  };
}

export function buildIncomeStabilitySummary(input: FinancePlanningInput): IncomeStabilitySummaryResult {
  const normalized = resolveNormalizedInput(input);
  const employmentComponent = clamp((normalized.employmentYears / 10) * 45, 0, 45);
  const jobComponent = clamp(normalized.jobStability * 4, 0, 40);
  const creditComponent = clamp(((normalized.creditScore - 300) / 600) * 15, 0, 15);
  const score = clamp(Math.round(employmentComponent + jobComponent + creditComponent), 0, 100);

  let band: IncomeStabilitySummaryResult['band'] = 'fragile';
  if (score >= 75) {
    band = 'stable';
  } else if (score >= 50) {
    band = 'balanced';
  }

  const factors: string[] = [];
  if (normalized.employmentYears >= 5) {
    factors.push('employment history is mature');
  }
  if (normalized.jobStability >= 7) {
    factors.push('current job stability is solid');
  }
  if (normalized.creditScore >= 720) {
    factors.push('credit profile supports lending stability');
  }

  const recommendations: string[] = [];
  if (band === 'fragile') {
    recommendations.push('Extend emergency runway and avoid new fixed obligations.');
  } else if (band === 'balanced') {
    recommendations.push('Keep building skills and reserves to reach a more stable band.');
  } else {
    recommendations.push('Maintain the current employment profile and preserve liquidity.');
  }

  return { score, band, factors, recommendations };
}

export function buildRiskProfileSummary(input: FinancePlanningInput): RiskProfileSummaryResult {
  const budget = calculateBudgetHealth(input);
  const emergency = buildEmergencyFundPlan(input);
  const income = buildIncomeStabilitySummary(input);
  const normalized = resolveNormalizedInput(input);

  const creditComponent = clamp(((normalized.creditScore - 300) / 6), 0, 100);
  const emergencyComponent = clamp((emergency.currentCoverageMonths / emergency.targetMonths) * 100, 0, 100);
  const debtComponent = clamp(100 - (budget.debtRatio * 180), 0, 100);
  const stabilityComponent = income.score;
  const budgetComponent = budget.score;

  const score = clamp(
    Math.round(
      (creditComponent * 0.28) +
      (emergencyComponent * 0.22) +
      (debtComponent * 0.18) +
      (stabilityComponent * 0.16) +
      (budgetComponent * 0.16)
    ),
    0,
    100
  );

  let band: RiskProfileSummaryResult['band'] = 'moderate';
  if (score >= 75) {
    band = 'low';
  } else if (score < 45) {
    band = 'high';
  }

  const keyDrivers: string[] = [];
  if (budget.monthlySurplus < 0) {
    keyDrivers.push('monthly cash flow is negative');
  }
  if (normalized.creditScore < 700) {
    keyDrivers.push('credit score is below preferred lending band');
  }
  if (emergency.currentCoverageMonths < 6) {
    keyDrivers.push('reserve coverage is below the 6-month benchmark');
  }

  const recommendations: string[] = [];
  if (band === 'high') {
    recommendations.push('Focus on liquidity, debt reduction, and income stabilization before new commitments.');
  } else if (band === 'moderate') {
    recommendations.push('Keep building reserves and reduce debt pressure to lower overall risk.');
  } else {
    recommendations.push('Risk posture looks manageable. Maintain discipline and monitor major cost changes.');
  }

  return { score, band, keyDrivers, recommendations };
}

export function buildCashReservePlan(input: FinancePlanningInput): CashReservePlanResult {
  const normalized = resolveNormalizedInput(input);
  const budget = calculateBudgetHealth(input);
  const reserveMonths = budget.status === 'healthy' ? 3 : 6;
  const targetReserveAmount = normalized.monthlyExpenses * reserveMonths;
  const currentReserve = normalized.currentSavings > 0 ? normalized.currentSavings : normalized.emergencyFund;
  const topUpNeeded = Math.max(0, targetReserveAmount - currentReserve);
  const monthlyTopUp = topUpNeeded > 0
    ? Math.ceil(topUpNeeded / normalized.targetMonths)
    : Math.max(1000, Math.ceil(budget.monthlySurplus * 0.12));

  const recommendations: string[] = [];
  if (topUpNeeded > 0) {
    recommendations.push(`Top up the reserve by about Rs.${monthlyTopUp.toLocaleString('en-IN')} per month.`);
  } else {
    recommendations.push('Reserve is above the target. Keep it in a high-liquidity account.');
  }

  return {
    reserveMonths,
    targetReserveAmount: Math.round(targetReserveAmount),
    currentReserve,
    topUpNeeded: Math.round(topUpNeeded),
    monthlyTopUp,
    recommendations,
  };
}

export function buildFinancialSnapshot(input: FinancePlanningInput): FinancialSnapshotResult {
  const budget = calculateBudgetHealth(input);
  const emergency = buildEmergencyFundPlan(input);
  const income = buildIncomeStabilitySummary(input);
  const risk = buildRiskProfileSummary(input);

  const emergencyScore = clamp((emergency.currentCoverageMonths / emergency.targetMonths) * 100, 0, 100);
  const debtPressureScore = clamp(100 - (budget.debtRatio * 180), 0, 100);

  const overallScore = clamp(
    Math.round(
      (budget.score * 0.30) +
      (emergencyScore * 0.20) +
      (debtPressureScore * 0.15) +
      (income.score * 0.20) +
      (risk.score * 0.15)
    ),
    0,
    100
  );

  const grade = scoreToGrade(overallScore);
  const highlights: string[] = [
    `Budget status: ${budget.status}`,
    `Emergency fund coverage: ${emergency.currentCoverageMonths} months`,
    `Risk posture: ${risk.band}`,
  ];

  const recommendations = [
    ...budget.recommendations,
    ...emergency.recommendations,
    ...income.recommendations,
  ];

  return {
    overallScore,
    grade,
    components: {
      budgetHealth: budget.score,
      emergencyReadiness: Math.round(emergencyScore),
      debtPressure: Math.round(debtPressureScore),
      incomeStability: income.score,
      riskProfile: risk.score,
    },
    highlights,
    recommendations: Array.from(new Set(recommendations)).slice(0, 6),
  };
}

export function buildActionPlan(input: FinancePlanningInput): ActionPlanResult {
  const budget = calculateBudgetHealth(input);
  const emergency = buildEmergencyFundPlan(input);
  const debt = buildDebtPayoffPlan(input);
  const risk = buildRiskProfileSummary(input);

  const priorities: string[] = [];
  if (budget.monthlySurplus < 0) {
    priorities.push('Close the monthly cash-flow gap before taking on new commitments.');
  }
  if (emergency.shortfall > 0) {
    priorities.push('Automate emergency fund top-ups until the reserve target is met.');
  }
  if (debt.totalDebt > 0) {
    priorities.push('Accelerate debt repayment using the extra monthly cash flow.');
  }
  if (risk.band === 'high') {
    priorities.push('Pause non-essential borrowing and protect liquidity.');
  }

  if (priorities.length === 0) {
    priorities.push('Keep the current plan and redirect new surplus into investments.');
  }

  return {
    priorities: priorities.slice(0, 5),
    nextBestAction: priorities[0],
    riskBand: risk.band,
  };
}
