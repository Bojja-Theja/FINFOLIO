import { useState, useEffect } from 'react';

export const useSavings = () => {
  const [savings, setSavings] = useState({ locked: 0, available: 0 });
  const [loading, setLoading] = useState(false);

  const fetchSavings = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API
      // const response = await apiClient.get('/savings/status');
      // setSavings(response.data);
      setSavings({ locked: 2500, available: 2000 }); // Mock data
    } catch (error) {
      console.error('Error fetching savings:', error);
    } finally {
      setLoading(false);
    }
  };

  const lockSavings = async (amount: number) => {
    // TODO: Call backend API
    setSavings(prev => ({ ...prev, locked: prev.locked + amount, available: prev.available - amount }));
  };

  const unlockSavings = async (amount: number) => {
    // TODO: Call backend API
    setSavings(prev => ({ ...prev, locked: prev.locked - amount, available: prev.available + amount }));
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  return { savings, loading, lockSavings, unlockSavings, refetch: fetchSavings };
};