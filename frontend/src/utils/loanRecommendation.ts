export type LoanDecision = 'approved' | 'review' | 'declined';

export interface LoanRecommendationRequest {
  annualIncome: number;
  monthlyExpenses: number;
  existingEmi?: number;
  desiredLoanAmount: number;
  tenureMonths: number;
  creditScore: number;
  employmentYears: number;
  loanType: 'personal_loan' | 'home_loan' | 'car_loan' | 'education_loan' | 'business_loan';
}

export interface LoanRecommendationResponse {
  decision: LoanDecision;
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
    loanType: string;
    historicalDefaultRate: number;
    benchmarkApprovalRate: number;
    sampleSize: number;
  };
  reasons: string[];
  recommendations: string[];
}

export type ValidationErrors = Partial<Record<keyof LoanRecommendationRequest, string>>;

export function getDecisionBadgeClass(decision: LoanDecision): string {
  if (decision === 'approved') return 'bg-success';
  if (decision === 'declined') return 'bg-danger';
  return 'bg-warning text-dark';
}

export function formatInr(amount: number): string {
  return `Rs.${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
}

export function getCreditBand(creditScore: number): { label: string; className: string } {
  if (creditScore >= 780) return { label: 'Excellent', className: 'bg-success' };
  if (creditScore >= 740) return { label: 'Very Good', className: 'bg-primary' };
  if (creditScore >= 700) return { label: 'Good', className: 'bg-info text-dark' };
  if (creditScore >= 650) return { label: 'Fair', className: 'bg-warning text-dark' };
  return { label: 'High Risk', className: 'bg-danger' };
}

export function getFoirBand(foir: number): { label: string; className: string } {
  if (foir <= 35) return { label: 'Healthy', className: 'bg-success' };
  if (foir <= 45) return { label: 'Borderline', className: 'bg-warning text-dark' };
  return { label: 'Stretched', className: 'bg-danger' };
}

export function validateLoanRequest(input: LoanRecommendationRequest): ValidationErrors {
  const errors: ValidationErrors = {};

  if (input.annualIncome <= 0) errors.annualIncome = 'Annual income must be greater than 0.';
  if (input.monthlyExpenses < 0) errors.monthlyExpenses = 'Monthly expenses cannot be negative.';
  if ((input.existingEmi || 0) < 0) errors.existingEmi = 'Existing EMI cannot be negative.';
  if (input.desiredLoanAmount < 10000) errors.desiredLoanAmount = 'Loan amount should be at least Rs.10,000.';
  if (input.tenureMonths < 6 || input.tenureMonths > 360) errors.tenureMonths = 'Tenure must be between 6 and 360 months.';
  if (input.creditScore < 300 || input.creditScore > 900) errors.creditScore = 'Credit score must be between 300 and 900.';
  if (input.employmentYears < 0 || input.employmentYears > 45) errors.employmentYears = 'Employment years must be between 0 and 45.';

  const monthlyIncome = input.annualIncome / 12;
  if (monthlyIncome > 0 && input.monthlyExpenses > monthlyIncome * 0.95) {
    errors.monthlyExpenses = 'Monthly expenses are too high versus income for a realistic underwriting profile.';
  }

  return errors;
}

export function buildRecommendationSummary(result: LoanRecommendationResponse): string {
  return [
    `Decision: ${result.decision.toUpperCase()}`,
    `Approval Odds: ${result.approvalProbability}%`,
    `Expected EMI: ${formatInr(result.expectedEmi)}`,
    `Recommended Rate: ${result.recommendedInterestRate}%`,
    `Max Eligible Amount: ${formatInr(result.maxEligibleLoanAmount)}`,
  ].join('\n');
}

export function normalizeLoanRequest(input: LoanRecommendationRequest): LoanRecommendationRequest {
  return {
    ...input,
    annualIncome: Number(input.annualIncome),
    monthlyExpenses: Number(input.monthlyExpenses),
    existingEmi: Number(input.existingEmi || 0),
    desiredLoanAmount: Number(input.desiredLoanAmount),
    tenureMonths: Number(input.tenureMonths),
    creditScore: Number(input.creditScore),
    employmentYears: Number(input.employmentYears),
  };
}
