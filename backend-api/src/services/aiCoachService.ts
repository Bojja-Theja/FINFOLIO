import { DatabaseService } from './databaseService';

export const getDebtSnowballRecommendation = async (userId: number) => {
  // Mock debts for demo - in real app, this would come from database
  const mockDebts = [
    { name: 'Credit Card', amount: 25000, interestRate: 0.24, monthlyPayment: 1000 },
    { name: 'Car Loan', amount: 300000, interestRate: 0.12, monthlyPayment: 8000 },
    { name: 'Personal Loan', amount: 50000, interestRate: 0.18, monthlyPayment: 2000 }
  ];

  // Sort debts by amount (smallest first for snowball)
  const sortedDebts = mockDebts.sort((a: any, b: any) => a.amount - b.amount);

  const recommendation = {
    method: 'snowball',
    priorityOrder: sortedDebts.map((debt: any) => ({
      name: debt.name,
      amount: debt.amount,
      interestRate: debt.interestRate,
      monthlyPayment: debt.monthlyPayment
    })),
    estimatedPayoffTime: calculatePayoffTime(sortedDebts),
    potentialSavings: calculateInterestSavings(sortedDebts)
  };

  return recommendation;
};

const calculatePayoffTime = (debts: any[]) => {
  // Simplified calculation
  let totalTime = 0;
  const extraPayment = 500; // Assume user can pay extra

  for (const debt of debts) {
    const months = Math.log(1 + (debt.amount * debt.interestRate / 12) / extraPayment) / Math.log(1 + debt.interestRate / 12);
    totalTime += months;
  }

  return Math.ceil(totalTime / 12); // Years
};

const calculateInterestSavings = (debts: any[]) => {
  // Calculate total interest if paid minimum vs. accelerated payoff
  return debts.reduce((total, debt) => total + (debt.amount * debt.interestRate * 5), 0); // Rough estimate
};