'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  LinearProgress,
  Stack,
  Badge
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  PieChart,
  Timeline,
  Assessment,
  Download,
  Refresh,
  FilterList,
  CalendarToday,
  Speed,
  MonetizationOn,
  Savings,
  CreditCard,
  AttachMoney,
  Timeline as TimelineIcon,
  BarChart,
  ScatterPlot,
  Leaderboard,
  Insights
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBar,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ErrorBar
} from 'recharts';

// Styled Components
const AnalyticsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 16,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`
  }
}));

const MetricCard = styled(Paper)<{ trend: 'up' | 'down' | 'stable' }>(({ theme, trend }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(theme.palette[trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'primary'].main, 0.1)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  border: `1px solid ${alpha(theme.palette[trend === 'up' ? 'success' : trend === 'down' ? 'error' : 'primary'].main, 0.2)}`,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4]
  }
}));

interface AnalyticsData {
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    savings: number;
    investments: number;
    debt: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  riskMetrics: {
    overall: number;
    market: number;
    credit: number;
    liquidity: number;
    concentration: number;
  };
  predictions: Array<{
    month: string;
    predicted: number;
    confidence: number;
    scenario: 'optimistic' | 'realistic' | 'pessimistic';
  }>;
  benchmarks: Array<{
    metric: string;
    user: number;
    average: number;
    top10: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const AdvancedAnalytics: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('12m');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showPredictions, setShowPredictions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Generate sample analytics data
  const analyticsData: AnalyticsData = useMemo(() => ({
    monthlyData: [
      { month: 'Jan', income: 60000, expenses: 42000, savings: 18000, investments: 8000, debt: 300000 },
      { month: 'Feb', income: 62000, expenses: 41000, savings: 21000, investments: 9000, debt: 295000 },
      { month: 'Mar', income: 58000, expenses: 43000, savings: 15000, investments: 7000, debt: 292000 },
      { month: 'Apr', income: 65000, expenses: 40000, savings: 25000, investments: 10000, debt: 288000 },
      { month: 'May', income: 63000, expenses: 42000, savings: 21000, investments: 9000, debt: 285000 },
      { month: 'Jun', income: 67000, expenses: 41000, savings: 26000, investments: 11000, debt: 280000 },
      { month: 'Jul', income: 69000, expenses: 43000, savings: 26000, investments: 12000, debt: 276000 },
      { month: 'Aug', income: 71000, expenses: 44000, savings: 27000, investments: 13000, debt: 272000 },
      { month: 'Sep', income: 68000, expenses: 42000, savings: 26000, investments: 11000, debt: 268000 },
      { month: 'Oct', income: 72000, expenses: 45000, savings: 27000, investments: 14000, debt: 264000 },
      { month: 'Nov', income: 74000, expenses: 46000, savings: 28000, investments: 15000, debt: 260000 },
      { month: 'Dec', income: 76000, expenses: 47000, savings: 29000, investments: 16000, debt: 256000 }
    ],
    categoryBreakdown: [
      { category: 'Housing', amount: 18000, percentage: 30, trend: 'stable' },
      { category: 'Food', amount: 9000, percentage: 15, trend: 'up' },
      { category: 'Transport', amount: 6000, percentage: 10, trend: 'down' },
      { category: 'Utilities', amount: 4500, percentage: 7.5, trend: 'stable' },
      { category: 'Healthcare', amount: 3000, percentage: 5, trend: 'up' },
      { category: 'Entertainment', amount: 4500, percentage: 7.5, trend: 'down' },
      { category: 'Savings', amount: 12000, percentage: 20, trend: 'up' },
      { category: 'Investments', amount: 3000, percentage: 5, trend: 'up' }
    ],
    riskMetrics: {
      overall: 0.35,
      market: 0.4,
      credit: 0.25,
      liquidity: 0.3,
      concentration: 0.45
    },
    predictions: [
      { month: 'Jan', predicted: 78000, confidence: 0.85, scenario: 'realistic' },
      { month: 'Feb', predicted: 79500, confidence: 0.82, scenario: 'realistic' },
      { month: 'Mar', predicted: 81000, confidence: 0.78, scenario: 'realistic' },
      { month: 'Apr', predicted: 82500, confidence: 0.75, scenario: 'realistic' },
      { month: 'May', predicted: 84000, confidence: 0.72, scenario: 'realistic' },
      { month: 'Jun', predicted: 85500, confidence: 0.70, scenario: 'realistic' }
    ],
    benchmarks: [
      { metric: 'Savings Rate', user: 38, average: 22, top10: 45 },
      { metric: 'Debt-to-Income', user: 0.35, average: 0.42, top10: 0.25 },
      { metric: 'Investment Return', user: 12.5, average: 8.3, top10: 18.2 },
      { metric: 'Emergency Fund', user: 8.5, average: 4.2, top10: 12.0 }
    ]
  }), []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const handleExport = () => {
    // Export functionality
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-analytics.json';
    link.click();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      case 'stable': return <Timeline color="action" />;
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 0.3) return theme.palette.success.main;
    if (risk < 0.6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.info.main];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assessment sx={{ fontSize: 40, color: 'primary.main' }} />
          Advanced Financial Analytics
        </Typography>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="12m">12 Months</MenuItem>
              <MenuItem value="24m">24 Months</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Metrics</InputLabel>
            <Select
              value={selectedMetric}
              label="Metrics"
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <MenuItem value="all">All Metrics</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expenses">Expenses</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="investments">Investments</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <Refresh sx={{
                transform: refreshing ? 'rotate(360deg)' : 'none',
                transition: 'transform 0.5s',
                opacity: refreshing ? 0.7 : 1
              }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export Data">
            <IconButton onClick={handleExport}>
              <Download />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<ShowChart />} label="Overview" />
          <Tab icon={<PieChart />} label="Breakdown" />
          <Tab icon={<Timeline />} label="Trends" />
          <Tab icon={<Assessment />} label="Risk Analysis" />
          <Tab icon={<Leaderboard />} label="Benchmarks" />
          <Tab icon={<Insights />} label="Predictions" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <OverviewTab data={analyticsData} showPredictions={showPredictions} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <BreakdownTab data={analyticsData} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TrendsTab data={analyticsData} />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <RiskAnalysisTab data={analyticsData} />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <BenchmarksTab data={analyticsData} />
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <PredictionsTab data={analyticsData} />
      </TabPanel>
    </Box>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: AnalyticsData; showPredictions: boolean }> = ({ data, showPredictions }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Key Metrics */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <MetricCard trend="up">
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>₹76,000</Typography>
              <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
              <Typography variant="caption" color="success.main">+12% vs last month</Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard trend="down">
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <CreditCard />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>₹47,000</Typography>
              <Typography variant="body2" color="text.secondary">Monthly Expenses</Typography>
              <Typography variant="caption" color="error.main">+5% vs last month</Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard trend="up">
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <Savings />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>₹29,000</Typography>
              <Typography variant="body2" color="text.secondary">Monthly Savings</Typography>
              <Typography variant="caption" color="success.main">+15% vs last month</Typography>
            </MetricCard>
          </Grid>

          <Grid item xs={6} md={3}>
            <MetricCard trend="stable">
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <AccountBalance />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>₹2.56L</Typography>
              <Typography variant="body2" color="text.secondary">Total Debt</Typography>
              <Typography variant="caption" color="text.secondary">-3% vs last month</Typography>
            </MetricCard>
          </Grid>
        </Grid>
      </Grid>

      {/* Cash Flow Chart */}
      <Grid item xs={12} md={8}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Cash Flow Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="income" stackId="1" stroke={theme.palette.success.main} fill={alpha(theme.palette.success.main, 0.3)} name="Income" />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke={theme.palette.error.main} fill={alpha(theme.palette.error.main, 0.3)} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke={theme.palette.primary.main} strokeWidth={3} name="Savings" />
                {showPredictions && (
                  <Line type="monotone" dataKey="investments" stroke={theme.palette.secondary.main} strokeWidth={2} strokeDasharray="5 5" name="Investments" />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} md={4}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Financial Health Score
            </Typography>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={800} color="primary.main">
                78/100
              </Typography>
              <LinearProgress
                variant="determinate"
                value={78}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
                color="primary"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Good Financial Health
              </Typography>
            </Box>
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

// Breakdown Tab Component
const BreakdownTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const theme = useTheme();
  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.info.main];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Expense Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={data.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const entry = data.categoryBreakdown[props.index];
                    return entry ? `${entry.category}: ${entry.percentage}%` : '';
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Category Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={data.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="amount" fill={theme.palette.primary.main} />
              </RechartsBar>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

// Trends Tab Component
const TrendsTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Financial Trends Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke={theme.palette.success.main} strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke={theme.palette.error.main} strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke={theme.palette.primary.main} strokeWidth={2} name="Savings" />
                <Line type="monotone" dataKey="investments" stroke={theme.palette.secondary.main} strokeWidth={2} name="Investments" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

// Risk Analysis Tab Component
const RiskAnalysisTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const theme = useTheme();

  const radarData = [
    { metric: 'Market Risk', value: data.riskMetrics.market * 100 },
    { metric: 'Credit Risk', value: data.riskMetrics.credit * 100 },
    { metric: 'Liquidity Risk', value: data.riskMetrics.liquidity * 100 },
    { metric: 'Concentration', value: data.riskMetrics.concentration * 100 },
    { metric: 'Overall Risk', value: data.riskMetrics.overall * 100 }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Risk Assessment Radar
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Risk Score" dataKey="value" stroke={theme.palette.error.main} fill={alpha(theme.palette.error.main, 0.3)} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Risk Metrics Breakdown
            </Typography>
            {Object.entries(data.riskMetrics).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={value * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.grey[300], 0.3),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: value > 0.6 ? theme.palette.error.main : value > 0.3 ? theme.palette.warning.main : theme.palette.success.main
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {(value * 100).toFixed(1)}%
                </Typography>
              </Box>
            ))}
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

// Benchmarks Tab Component
const BenchmarksTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Performance Benchmarks
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RechartsBar data={data.benchmarks}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="user" fill={theme.palette.primary.main} name="Your Performance" />
                <Bar dataKey="average" fill={theme.palette.grey[400]} name="Average" />
                <Bar dataKey="top10" fill={theme.palette.success.main} name="Top 10%" />
              </RechartsBar>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

// Predictions Tab Component
const PredictionsTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AnalyticsCard>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Income Predictions (6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="predicted" stroke={theme.palette.primary.main} strokeWidth={3} name="Predicted Income" />
                <Line
                  type="monotone"
                  dataKey={(data) => data.predicted * (1 - (1 - data.confidence) * 0.2)}
                  stroke={theme.palette.grey[400]}
                  strokeDasharray="5 5"
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey={(data) => data.predicted * (1 + (1 - data.confidence) * 0.2)}
                  stroke={theme.palette.grey[400]}
                  strokeDasharray="5 5"
                  name="Upper Bound"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </AnalyticsCard>
      </Grid>
    </Grid>
  );
};

export default AdvancedAnalytics;
