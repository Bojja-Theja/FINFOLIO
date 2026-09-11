import { useState, useEffect } from 'react';

export const useHealthScore = () => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealthScore = async () => {
    setLoading(true);
    try {
      // TODO: Call backend API
      // const response = await apiClient.get('/finance/healthscore');
      // setScore(response.data.score);
      setScore(75); // Mock data
    } catch (error) {
      console.error('Error fetching health score:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthScore();
  }, []);

  return { score, loading, refetch: fetchHealthScore };
};