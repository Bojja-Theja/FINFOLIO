// TODO: Implement EMI, ratios, scoring formulas

export const calculateEMI = (principal: number, rate: number, tenure: number) => {
  // EMI formula: [P x R x (1+R)^N] / [(1+R)^N-1]
  // R is monthly rate, N is months
  const monthlyRate = rate / 100 / 12;
  const numPayments = tenure;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  return emi;
};

export const calculateRatios = (income: number, expenses: number) => {
  return {
    expenseRatio: expenses / income,
    savingsRatio: (income - expenses) / income
  };
};

export const scoreFinancialHealth = (_ratios: any) => {
  // TODO: Scoring logic
  return 75; // Dummy score
};