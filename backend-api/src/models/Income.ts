// TODO: Define Income model
export interface Income {
  id: number;
  userId: number;
  amount: number;
  source: string;
  date: Date;
  isStable: boolean;
}

// Placeholder
export const createIncome = (income: Omit<Income, 'id'>) => {
  // TODO: Implement
  return { ...income, id: 1 };
};