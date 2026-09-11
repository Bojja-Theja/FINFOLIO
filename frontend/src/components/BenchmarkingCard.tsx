import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { apiClient } from '@/services/apiClient';

interface BenchmarkData {
  percentile: number;
  incomeBracket: string;
  ageGroup: string;
  averageScore: number;
  userScore: number;
  trend: 'up' | 'down' | 'stable';
}

const getPercentileColor = (percentile: number): string => {
  if (percentile >= 75) return 'bg-green-500';
  if (percentile >= 50) return 'bg-yellow-500';
  if (percentile >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

const BenchmarkingCard: React.FC = () => {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmarkData = async () => {
      try {
        const response = await apiClient.get('/api/benchmarking');
        const data = response.data || {};
        const safeNumber = (val: any): number | null => {
          const num = Number(val);
          return Number.isFinite(num) ? num : null;
        };

        setBenchmarkData({
          percentile: safeNumber(data.percentile) ?? 0,
          incomeBracket: data.incomeBracket ?? 'N/A',
          ageGroup: data.ageGroup ?? 'N/A',
          averageScore: safeNumber(data.averageScore) ?? 0,
          userScore: safeNumber(data.userScore) ?? 0,
          trend: (data.trend as BenchmarkData['trend']) ?? 'stable',
        });
      } catch (error) {
        console.error('Failed to fetch benchmarking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarkData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!benchmarkData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Benchmark</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Unable to load benchmarking data.</p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Financial Health Benchmark
          {getTrendIcon(benchmarkData.trend)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Your Percentile</span>
          <Badge variant="secondary">{benchmarkData.percentile}th</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>0th</span>
            <span>50th</span>
            <span>100th</span>
          </div>
          <Progress
            value={benchmarkData.percentile}
            className="h-3"
            // Custom color based on percentile
          />
          <div className={`h-3 rounded-full ${getPercentileColor(benchmarkData.percentile)}`} style={{ width: `${benchmarkData.percentile}%` }}></div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Your Score</p>
            <p className="font-semibold">{Number.isFinite(benchmarkData.userScore) ? benchmarkData.userScore.toFixed(1) : '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Average in Group</p>
            <p className="font-semibold">{Number.isFinite(benchmarkData.averageScore) ? benchmarkData.averageScore.toFixed(1) : '—'}</p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Compared to {benchmarkData.ageGroup} in {benchmarkData.incomeBracket} income bracket
        </div>
      </CardContent>
    </Card>
  );
};

export default BenchmarkingCard;