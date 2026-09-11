// TODO: Define Expense model
export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: string;
  date: Date;
  isEssential: boolean;
}

// Placeholder
export const createExpense = (expense: Omit<Expense, 'id'>) => {
  // TODO: Implement
  return { ...expense, id: 1 };
};