// TODO: Define Alert model
export interface Alert {
  id: number;
  userId: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  createdAt: Date;
}

// Placeholder
export const createAlert = (alert: Omit<Alert, 'id' | 'createdAt'>) => {
  // TODO: Implement
  return { ...alert, id: 1, createdAt: new Date() };
};