import { query } from '../config/db';
import { calculateEMI } from '../utils/calculator';

export type LoanType = 'personal_loan' | 'home_loan' | 'car_loan' | 'education_loan' | 'business_loan';

export interface LoanRecommendationInput {
  userId?: number;
  annualIncome: number;
  monthlyExpenses: number;
  existingEmi?: number;
  desiredLoanAmount: number;
  tenureMonths: number;
  creditScore: number;
  employmentYears: number;
  loanType: LoanType;
}

export interface LoanRecommendationResult {
  decision: 'approved' | 'review' | 'declined';
  approvalProbability: number;
  recommendedInterestRate: number;
  expectedEmi: number;
  maxEligibleLoanAmount: number;
  riskBand: 'low' | 'moderate' | 'high';
  affordability: {
    monthlyIncome: number;
    foirAfterLoan: number;
    maxAllowedFoir: number;
    maxAffordableEmi: number;
  };
  historicalSignals: {
    loanType: LoanType;
    historicalDefaultRate: number;
    benchmarkApprovalRate: number;
    sampleSize: number;
  };
  reasons: string[];
  recommendations: string[];
}

interface DebtRow {
  emi_amount: string | number | null;
}

const LOAN_BENCHMARKS: Record<LoanType, { baseRate: number; benchmarkApprovalRate: number; sampleSize: number }> = {
  personal_loan: { baseRate: 11.8, benchmarkApprovalRate: 0.74, sampleSize: 6200 },
  home_loan: { baseRate: 8.45, benchmarkApprovalRate: 0.86, sampleSize: 9100 },
  car_loan: { baseRate: 9.25, benchmarkApprovalRate: 0.79, sampleSize: 4300 },
  education_loan: { baseRate: 8.95, benchmarkApprovalRate: 0.82, sampleSize: 2700 },
  business_loan: { baseRate: 12.6, benchmarkApprovalRate: 0.68, sampleSize: 3100 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getHistoricalDefaultRate(creditScore: number, loanType: LoanType): number {
  const premiumByType: Record<LoanType, number> = {
    home_loan: -0.01,
    education_loan: -0.005,
    car_loan: 0,
    personal_loan: 0.012,
    business_loan: 0.018,
  };

  let bandDefaultRate = 0.16;
  if (creditScore >= 780) {
    bandDefaultRate = 0.03;
  } else if (creditScore >= 730) {
    bandDefaultRate = 0.05;
  } else if (creditScore >= 680) {
    bandDefaultRate = 0.08;
  } else if (creditScore >= 630) {
    bandDefaultRate = 0.13;
  }

  return clamp(bandDefaultRate + premiumByType[loanType], 0.02, 0.28);
}

function getRatePremiumFromRisk(creditScore: number, employmentYears: number, foirAfterLoan: number): number {
  let premium = 0;

  if (creditScore < 650) premium += 2.3;
  else if (creditScore < 700) premium += 1.3;
  else if (creditScore < 750) premium += 0.6;

  if (employmentYears < 2) premium += 0.9;
  else if (employmentYears < 4) premium += 0.35;

  if (foirAfterLoan > 0.5) premium += 1.2;
  else if (foirAfterLoan > 0.42) premium += 0.5;

  return premium;
}

function principalFromEmi(emi: number, annualRate: number, tenureMonths: number): number {
  if (emi <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;

  if (monthlyRate <= 0) {
    return emi * tenureMonths;
  }

  const discountFactor = (Math.pow(1 + monthlyRate, tenureMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, tenureMonths));
  return emi * discountFactor;
}

async function getExistingEmiFromDb(userId?: number): Promise<number> {
  if (!userId || userId <= 0) {
    return 0;
  }

  try {
    const result = await query(
      'SELECT COALESCE(emi_amount, 0) AS emi_amount FROM debts WHERE user_id = $1',
      [userId]
    );

    const total = (result.rows as DebtRow[]).reduce((sum, row) => {
      return sum + Number(row.emi_amount || 0);
    }, 0);

    return total;
  } catch {
    return 0;
  }
}

export async function buildLoanRecommendation(input: LoanRecommendationInput): Promise<LoanRecommendationResult> {
  const monthlyIncome = input.annualIncome / 12;
  const existingEmi = input.existingEmi ?? (await getExistingEmiFromDb(input.userId));
  const maxAllowedFoir = 0.45;
  const maxAffordableEmi = Math.max(0, monthlyIncome * maxAllowedFoir - existingEmi);

  const baselineFoir = monthlyIncome > 0 ? (existingEmi + input.monthlyExpenses) / monthlyIncome : 1;
  const baseRate = LOAN_BENCHMARKS[input.loanType].baseRate;
  const initialEmi = calculateEMI(input.desiredLoanAmount, baseRate, input.tenureMonths);
  const initialFoirAfterLoan = monthlyIncome > 0
    ? (existingEmi + input.monthlyExpenses + initialEmi) / monthlyIncome
    : 1;

  const riskPremium = getRatePremiumFromRisk(input.creditScore, input.employmentYears, initialFoirAfterLoan);
  const recommendedInterestRate = Number((baseRate + riskPremium).toFixed(2));

  const expectedEmi = Math.round(calculateEMI(input.desiredLoanAmount, recommendedInterestRate, input.tenureMonths));
  const foirAfterLoan = monthlyIncome > 0
    ? (existingEmi + input.monthlyExpenses + expectedEmi) / monthlyIncome
    : 1;

  const historicalDefaultRate = getHistoricalDefaultRate(input.creditScore, input.loanType);
  const benchmarkApprovalRate = LOAN_BENCHMARKS[input.loanType].benchmarkApprovalRate;

  let approvalProbability = benchmarkApprovalRate;
  approvalProbability -= historicalDefaultRate * 0.45;
  approvalProbability -= clamp(foirAfterLoan - maxAllowedFoir, 0, 0.4) * 0.7;

  if (input.employmentYears >= 5) approvalProbability += 0.05;
  else if (input.employmentYears < 2) approvalProbability -= 0.07;

  if (input.creditScore >= 760) approvalProbability += 0.08;
  else if (input.creditScore < 650) approvalProbability -= 0.12;

  approvalProbability = clamp(approvalProbability, 0.05, 0.97);

  const maxEligibleLoanAmount = Math.round(principalFromEmi(maxAffordableEmi, recommendedInterestRate, input.tenureMonths));

  let riskBand: 'low' | 'moderate' | 'high' = 'moderate';
  if (approvalProbability >= 0.75 && foirAfterLoan <= 0.45) riskBand = 'low';
  if (approvalProbability < 0.45 || foirAfterLoan > 0.55) riskBand = 'high';

  let decision: 'approved' | 'review' | 'declined' = 'review';
  if (approvalProbability >= 0.72 && input.desiredLoanAmount <= maxEligibleLoanAmount * 1.15) {
    decision = 'approved';
  } else if (approvalProbability < 0.45 || input.desiredLoanAmount > maxEligibleLoanAmount * 1.45) {
    decision = 'declined';
  }

  const reasons: string[] = [];
  const recommendations: string[] = [];

  if (foirAfterLoan > maxAllowedFoir) {
    reasons.push(`FOIR after proposed loan is ${(foirAfterLoan * 100).toFixed(1)}%, above the target ${(maxAllowedFoir * 100).toFixed(0)}%`);
    recommendations.push('Reduce monthly obligations by prepaying high-interest debt before applying.');
  } else {
    reasons.push(`FOIR remains healthy at ${(foirAfterLoan * 100).toFixed(1)}% after including proposed EMI.`);
  }

  if (input.creditScore < 700) {
    reasons.push('Credit score is below prime lending band, increasing pricing and rejection risk.');
    recommendations.push('Improve credit score by reducing card utilization and making on-time payments for 3-6 months.');
  } else {
    reasons.push('Credit score is within a favorable band for mainstream lending programs.');
  }

  if (input.employmentYears < 2) {
    reasons.push('Short employment history increases perceived repayment volatility.');
    recommendations.push('Provide additional income proof or apply with a co-applicant.');
  }

  if (input.desiredLoanAmount > maxEligibleLoanAmount) {
    recommendations.push(`Consider applying for up to Rs.${maxEligibleLoanAmount.toLocaleString()} to improve approval odds.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Current profile is loan-ready. Compare offers from 2-3 lenders for the best processing fee and prepayment terms.');
  }

  return {
    decision,
    approvalProbability: Number((approvalProbability * 100).toFixed(1)),
    recommendedInterestRate,
    expectedEmi,
    maxEligibleLoanAmount,
    riskBand,
    affordability: {
      monthlyIncome: Math.round(monthlyIncome),
      foirAfterLoan: Number((foirAfterLoan * 100).toFixed(1)),
      maxAllowedFoir: maxAllowedFoir * 100,
      maxAffordableEmi: Math.round(maxAffordableEmi),
    },
    historicalSignals: {
      loanType: input.loanType,
      historicalDefaultRate: Number((historicalDefaultRate * 100).toFixed(1)),
      benchmarkApprovalRate: Number((benchmarkApprovalRate * 100).toFixed(1)),
      sampleSize: LOAN_BENCHMARKS[input.loanType].sampleSize,
    },
    reasons,
    recommendations,
  };
}
