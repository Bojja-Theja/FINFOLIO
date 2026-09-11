import { DatabaseService } from './databaseService';

export const monteCarloProjection = async (
  userId: number,
  jobLossProb: number,
  annualRaise: number,
  expenseChange: number,
  years: number = 10,
  simulations: number = 1000
) => {
  let userData = await DatabaseService.getUserFinancialData(userId);
  if (!userData) {
    // Fallback to mock data for demo purposes
    userData = {
      userId: 1,
      monthlyIncome: 52000,
      monthlyExpenses: 31000,
      emergencyFund: 186000,
      debtAmount: 50000,
      age: 30,
      riskTolerance: 'medium',
      jobStability: 7,
      marketConditions: 'neutral',
      inflationRate: 6.0
    };
  }

  const projections: number[][] = [];

  for (let sim = 0; sim < simulations; sim++) {
    let netWorth = userData.emergencyFund; // Use emergency fund as starting net worth
    let income = userData.monthlyIncome;
    let expenses = userData.monthlyExpenses;

    const yearlyData: number[] = [];
    for (let year = 0; year < years; year++) {
      // Apply job loss scenario
      if (Math.random() < jobLossProb) {
        income *= 0.5; // 50% income loss
        const monthsUnemployed = Math.floor(Math.random() * 7) + 1;
        for (let month = 0; month < monthsUnemployed; month++) {
          netWorth -= expenses;
        }
        income = userData.monthlyIncome; // Assume recovery
      }

      // Apply raise and expense changes
      income *= (1 + annualRaise);
      expenses *= (1 + expenseChange);

      // Monthly savings
      const monthlySavings = income - expenses;
      netWorth += monthlySavings * 12;

      // Assume 7% annual return on investments
      netWorth *= 1.07;

      yearlyData.push(netWorth);
    }
    projections.push(yearlyData);
  }

  // Calculate averages and confidence intervals
  const avgProjection = [];
  for (let year = 0; year < years; year++) {
    const yearValues = projections.map(sim => sim[year]);
    const mean = yearValues.reduce((a, b) => a + b, 0) / simulations;
    const sorted = yearValues.sort((a, b) => a - b);
    const upperBound = sorted[Math.floor(simulations * 0.95)];
    const lowerBound = sorted[Math.floor(simulations * 0.05)];

    avgProjection.push({
      year: year + 1,
      netWorth: Math.round(mean),
      upperBound: Math.round(upperBound),
      lowerBound: Math.round(lowerBound)
    });
  }

  return { projection: avgProjection };
};