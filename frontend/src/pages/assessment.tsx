'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  Stack,
  Avatar,
  Paper,
  Fade,
  Grow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import { styled } from '@mui/material/styles';
import { useRouter } from 'next/router';
import {
  Assessment as AssessmentIcon,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Warning,
  CheckCircle,
  Calculate,
  ExpandMore,
  Info,
  Lightbulb,
  Compare,
  Group
} from '@mui/icons-material';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell as RechartsCell,
  LineChart,
  Line
} from 'recharts';

import { useAuth } from '@/context/AuthContext';
import sampleData from '@/data/sample_dataset.json';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: '0.3s ease',
  background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
    borderColor: theme.palette.primary.main
  }
}));

const MetricCardContent = styled(CardContent)({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
});

const AnimatedNumber: React.FC<{ value: number; suffix?: string; prefix?: string }> = ({ value, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 400);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Typography variant="h3" fontWeight="800" color="primary">
      {prefix}
      {displayValue}
      {suffix}
    </Typography>
  );
};

const StatusChip: React.FC<{ value: number; maxValue?: number }> = ({ value, maxValue = 100 }) => {
  type StatusKey = 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';

  const percentage = (value / maxValue) * 100;
  const status: StatusKey =
    percentage >= 80
      ? 'Excellent'
      : percentage >= 60
        ? 'Good'
        : percentage >= 40
          ? 'Fair'
          : 'Needs Attention';

  const statusColors: Record<StatusKey, 'success' | 'primary' | 'warning' | 'error'> = {
    Excellent: 'success',
    Good: 'primary',
    Fair: 'warning',
    'Needs Attention': 'error'
  };

  const linearColor = statusColors[status];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          flexGrow: 1,
          height: 10,
          borderRadius: 5
        }}
        color={linearColor}
      />
      <Chip label={status} size="small" color={linearColor} sx={{ fontWeight: 'bold' }} />
    </Box>
  );
};

interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  savings: number;
  debt: number;
  age: number;
  dependents: number;
  employmentType: string;
  riskTolerance: number;
}

interface AssessmentResult {
  survivalPeriod: number;
  stabilityScore: number;
  recommendations: string[];
  riskLevel: string;
  breakdown: {
    incomeStability: number;
    expenseManagement: number;
    emergencyPreparedness: number;
    debtBurden: number;
  };
}

export default function Assessment() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  // Ensure hooks are declared unconditionally (fix rules-of-hooks)
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [data, setData] = useState<FinancialData>({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    emergencyFund: 0,
    savings: 0,
    debt: 0,
    age: 25,
    dependents: 0,
    employmentType: 'salaried',
    riskTolerance: 5
  });

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  const calculateAssessment = () => {
    setLoading(true);

    // Simulate calculation delay
    setTimeout(() => {
      const survivalPeriod = data.emergencyFund / data.monthlyExpenses;
      const savingsRate = ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100;
      const debtRatio = (data.debt / data.monthlyIncome) * 100;

      // Calculate stability score (0-100)
      const incomeStability = Math.min(100, (data.monthlyIncome / 50000) * 100);
      const expenseManagement = Math.max(0, 100 - (data.monthlyExpenses / data.monthlyIncome) * 100);
      const emergencyPreparedness = Math.min(100, (survivalPeriod / 6) * 100);
      const debtBurden = Math.max(0, 100 - debtRatio);

      const stabilityScore = Math.round(
        (incomeStability * 0.3) +
        (expenseManagement * 0.25) +
        (emergencyPreparedness * 0.25) +
        (debtBurden * 0.2)
      );

      const recommendations: string[] = [];
      if (survivalPeriod < 3) recommendations.push("Build emergency fund to cover at least 3 months of expenses");
      if (savingsRate < 20) recommendations.push("Aim to save at least 20% of your income");
      if (debtRatio > 50) recommendations.push("Reduce debt burden below 50% of monthly income");
      if (stabilityScore < 60) recommendations.push("Focus on expense management and consistent savings");

      const riskLevel = stabilityScore >= 80 ? 'Low' : stabilityScore >= 60 ? 'Medium' : 'High';

      setResult({
        survivalPeriod: Math.round(survivalPeriod * 100) / 100,
        stabilityScore,
        recommendations,
        riskLevel,
        breakdown: {
          incomeStability: Math.round(incomeStability),
          expenseManagement: Math.round(expenseManagement),
          emergencyPreparedness: Math.round(emergencyPreparedness),
          debtBurden: Math.round(debtBurden)
        }
      });

      setLoading(false);
    }, 1500);
  };

  const handleInputChange = (field: keyof FinancialData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setData({
      ...data,
      [field]: parseFloat(event.target.value) || 0
    });
  };

  const handleSelectChange = (field: keyof FinancialData) => (
    event: any
  ) => {
    setData({
      ...data,
      [field]: event.target.value
    });
  };

  const handleSliderChange = (field: keyof FinancialData) => (
    event: Event,
    newValue: number | number[]
  ) => {
    setData({
      ...data,
      [field]: newValue as number
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            position: "relative"
          }}
        >
          <Box sx={{ position: "absolute", top: -40, right: -40, opacity: 0.1 }}>
            <AssessmentIcon sx={{ fontSize: 180 }} />
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h3" fontWeight="800">
                Financial Stability Assessment
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Evaluate your financial health and get personalized recommendations
              </Typography>
            </Box>

            <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}>
              <Calculate />
            </Avatar>
          </Box>
        </Paper>
      </Box>

      <GridTyped container spacing={4}>
        {/* Input Form */}
        <GridTyped item xs={12} lg={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Financial Information
            </Typography>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Monthly Income (₹)"
                type="number"
                value={data.monthlyIncome}
                onChange={handleInputChange('monthlyIncome')}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Monthly Expenses (₹)"
                type="number"
                value={data.monthlyExpenses}
                onChange={handleInputChange('monthlyExpenses')}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Emergency Fund (₹)"
                type="number"
                value={data.emergencyFund}
                onChange={handleInputChange('emergencyFund')}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Current Savings (₹)"
                type="number"
                value={data.savings}
                onChange={handleInputChange('savings')}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Total Debt (₹)"
                type="number"
                value={data.debt}
                onChange={handleInputChange('debt')}
                variant="outlined"
              />

              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    value={data.age}
                    onChange={handleInputChange('age')}
                    variant="outlined"
                  />
                </GridTyped>
                <GridTyped item xs={6}>
                  <TextField
                    fullWidth
                    label="Dependents"
                    type="number"
                    value={data.dependents}
                    onChange={handleInputChange('dependents')}
                    variant="outlined"
                  />
                </GridTyped>
              </GridTyped>

              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={data.employmentType}
                  label="Employment Type"
                  onChange={handleSelectChange('employmentType')}
                >
                  <MenuItem value="salaried">Salaried</MenuItem>
                  <MenuItem value="self-employed">Self-Employed</MenuItem>
                  <MenuItem value="contract">Contract/Gig</MenuItem>
                  <MenuItem value="business">Business Owner</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography gutterBottom>Risk Tolerance (1-10)</Typography>
                <Slider
                  value={data.riskTolerance}
                  onChange={handleSliderChange('riskTolerance')}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={calculateAssessment}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Calculate Assessment'}
              </Button>
            </Stack>
          </Card>
        </GridTyped>

        {/* Results */}
        <GridTyped item xs={12} lg={6}>
          {loading && (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="h6">Analyzing your financial data...</Typography>
            </Card>
          )}

          {result && !loading && (
            <Stack spacing={3}>
              {/* Main Metrics */}
              <GridTyped container spacing={2}>
                <GridTyped item xs={6}>
                  <StyledCard>
                    <MetricCardContent>
                      <Typography variant="h6" fontWeight={600}>
                        Survival Period
                      </Typography>
                      <AnimatedNumber value={result.survivalPeriod} suffix=" Months" />
                      <StatusChip value={result.survivalPeriod} maxValue={6} />
                    </MetricCardContent>
                  </StyledCard>
                </GridTyped>

                <GridTyped item xs={6}>
                  <StyledCard>
                    <MetricCardContent>
                      <Typography variant="h6" fontWeight={600}>
                        Stability Score
                      </Typography>
                      <AnimatedNumber value={result.stabilityScore} suffix="/100" />
                      <StatusChip value={result.stabilityScore} />
                    </MetricCardContent>
                  </StyledCard>
                </GridTyped>
              </GridTyped>

              {/* Risk Level */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Risk Assessment
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`Risk Level: ${result.riskLevel}`}
                    color={
                      result.riskLevel === 'Low' ? 'success' :
                        result.riskLevel === 'Medium' ? 'warning' : 'error'
                    }
                    size="medium"
                  />
                  {result.riskLevel === 'High' && <Warning color="error" />}
                  {result.riskLevel === 'Low' && <CheckCircle color="success" />}
                </Box>
              </Card>

              {/* Score Breakdown */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Score Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsBar data={[
                    { name: 'Income Stability', value: result.breakdown.incomeStability },
                    { name: 'Expense Mgmt', value: result.breakdown.expenseManagement },
                    { name: 'Emergency Prep', value: result.breakdown.emergencyPreparedness },
                    { name: 'Debt Burden', value: result.breakdown.debtBurden }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill={theme.palette.primary.main} />
                  </RechartsBar>
                </ResponsiveContainer>
              </Card>

              {/* Financial Trends */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Financial Trends (Sample Data)
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={sampleData.trends.income.map((item, index) => ({
                    month: item.date,
                    income: item.value,
                    expenses: sampleData.trends.expenses[index]?.value || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value: any, name) => {
                        const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                        return [`₹${numericValue.toLocaleString()}`, name];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke={theme.palette.success.main} strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke={theme.palette.error.main} strokeWidth={2} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Track your income and expense patterns over time
                </Typography>
              </Card>

              {/* Benchmarking Comparison */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  <Compare sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Industry Benchmarking
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Your Score</TableCell>
                        <TableCell align="right">Industry Avg</TableCell>
                        <TableCell align="right">Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Survival Period (Months)</TableCell>
                        <TableCell align="right">{result.survivalPeriod}</TableCell>
                        <TableCell align="right">{sampleData.benchmarks.industry_averages.IT.survival_period}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            color={result.survivalPeriod >= sampleData.benchmarks.industry_averages.IT.survival_period ? 'success' : 'warning'}
                            label={`${(result.survivalPeriod - sampleData.benchmarks.industry_averages.IT.survival_period).toFixed(1)}`}
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Stability Score</TableCell>
                        <TableCell align="right">{result.stabilityScore}</TableCell>
                        <TableCell align="right">{sampleData.benchmarks.industry_averages.IT.stability_score}</TableCell>
                        <TableCell align="right">
                          <Chip
                            size="small"
                            color={result.stabilityScore >= sampleData.benchmarks.industry_averages.IT.stability_score ? 'success' : 'warning'}
                            label={`${result.stabilityScore - sampleData.benchmarks.industry_averages.IT.stability_score}`}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  <Group sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                  Compared to IT professionals with similar profiles
                </Typography>
              </Card>

              {/* Recommendations */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  <Lightbulb sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI Recommendations
                </Typography>
                <Stack spacing={2}>
                  {result.recommendations.map((rec, index) => (
                    <Alert key={index} severity="info" icon={<Info />}>
                      {rec}
                    </Alert>
                  ))}
                </Stack>
              </Card>

              {/* Detailed Analysis */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6" fontWeight={600}>
                    Detailed Analysis
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Income Stability</Typography>
                      <Typography variant="body2">
                        Your income provides {result.breakdown.incomeStability}% stability based on industry standards.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Expense Management</Typography>
                      <Typography variant="body2">
                        You spend {100 - result.breakdown.expenseManagement}% of your income on expenses.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Emergency Preparedness</Typography>
                      <Typography variant="body2">
                        Your emergency fund covers {result.survivalPeriod} months of expenses.
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>Debt Burden</Typography>
                      <Typography variant="body2">
                        Your debt represents {((data.debt / data.monthlyIncome) * 100).toFixed(1)}% of monthly income.
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          )}
        </GridTyped>
      </GridTyped>
    </Container>
  );
}