import { useState, useEffect } from 'react';

export const useSurvival = () => {
  const [months, setMonths] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSurvival = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API
      // const response = await apiClient.get('/finance/survival');
      // setMonths(response.data.months);
      setMonths(6); // Mock data
    } catch (error) {
      console.error('Error fetching survival data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurvival();
  }, []);

  return { months, loading, refetch: fetchSurvival };
};