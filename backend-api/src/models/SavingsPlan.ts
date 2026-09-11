// TODO: Define SavingsPlan model
export interface SavingsPlan {
  id: number;
  userId: number;
  targetAmount: number;
  currentAmount: number;
  locked: boolean;
  createdAt: Date;
}

// Placeholder
export const createSavingsPlan = (plan: Omit<SavingsPlan, 'id' | 'createdAt'>) => {
  // TODO: Implement
  return { ...plan, id: 1, createdAt: new Date() };
};