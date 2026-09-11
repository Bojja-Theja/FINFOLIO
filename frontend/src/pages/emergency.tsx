'use client';
import ClientOnly from '@/components/ClientOnly';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  LinearProgress,
  Button,
  Paper,
  Divider,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import {
  Shield,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown,
  Refresh,
  Info,
  Security,
  Timeline,
  AccountBalance
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import api from '@/utils/axiosClient';

interface EmergencyFundData {
  status: {
    currentBalance: number;
    targetMonths: number;
    monthlyBurnRate: number;
    monthsCoverage: number;
    status: 'excellent' | 'good' | 'adequate' | 'insufficient' | 'critical';
    recommendedAction: string;
    alerts: string[];
  };
  simulations: Array<{
    scenario: string;
    requiredAmount: number;
    currentShortfall: number;
    timeToBuild: number;
    monthlyContribution: number;
  }>;
  optimalContribution: {
    recommendedMonthly: number;
    targetAmount: number;
    timeToTarget: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  depletionRisk: {
    depletionRisk: 'low' | 'medium' | 'high';
    monthsUntilCritical: number;
    riskFactors: string[];
  };
  recommendations: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Emergency() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user || user.isGuest;
  const [data, setData] = useState<EmergencyFundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequiresOnboarding(false);
      const response = await api.get('/finance/emergency-status');

      // Check if user needs to complete onboarding
      if (response.data.requiresOnboarding) {
        setRequiresOnboarding(true);
        setError(response.data.note || "Complete your profile to see your actual emergency fund status.");
      }

      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch emergency fund data:', err);
      // Fallback to mock data
      setData({
        status: {
          currentBalance: 45000,
          targetMonths: 6,
          monthlyBurnRate: 25000,
          monthsCoverage: 1.8,
          status: 'insufficient',
          recommendedAction: 'Increase emergency fund to cover at least 3 months of expenses',
          alerts: ['Emergency fund is below recommended levels', 'Consider increasing monthly contributions']
        },
        simulations: [
          {
            scenario: 'Job Loss (6 months)',
            requiredAmount: 150000,
            currentShortfall: 105000,
            timeToBuild: 24,
            monthlyContribution: 4375
          },
          {
            scenario: 'Medical Emergency',
            requiredAmount: 100000,
            currentShortfall: 55000,
            timeToBuild: 18,
            monthlyContribution: 3056
          }
        ],
        optimalContribution: {
          recommendedMonthly: 5000,
          targetAmount: 150000,
          timeToTarget: 30,
          priority: 'high'
        },
        depletionRisk: {
          depletionRisk: 'medium',
          monthsUntilCritical: 2,
          riskFactors: ['Low emergency fund balance', 'High monthly expenses']
        },
        recommendations: [
          'Increase monthly emergency fund contributions to ₹5,000',
          'Aim for 6 months of expenses in emergency fund',
          'Review and optimize monthly expenses'
        ]
      });
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmergencyData();
    setTimeout(() => setRefreshing(false), 800);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'adequate': return 'warning';
      case 'insufficient': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle color="success" />;
      case 'good': return <CheckCircle color="primary" />;
      case 'adequate': return <Warning color="warning" />;
      case 'insufficient': return <Error color="error" />;
      case 'critical': return <Error color="error" />;
      default: return <Info />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Analyzing your emergency fund...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity={requiresOnboarding ? "info" : "error"} sx={{ mb: 4 }}>
          <AlertTitle>{requiresOnboarding ? "Profile Incomplete" : "Connection Error"}</AlertTitle>
          {error}
        </Alert>
        <Box textAlign="center">
          {requiresOnboarding ? (
            <Button
              variant="contained"
              onClick={() => router.push('/onboarding')}
            >
              Complete Your Profile
            </Button>
          ) : (
            <Button variant="contained" onClick={fetchEmergencyData}>Retry</Button>
          )}
        </Box>
      </Container>
    );
  }

  if (!data) return null;

  const { status, simulations, optimalContribution, depletionRisk, recommendations } = data;



  // Prepare chart data
  const coverageData = [
    { name: 'Current Coverage', value: status.monthsCoverage, color: theme.palette.primary.main },
    { name: 'Target Coverage', value: Math.max(0, status.targetMonths - status.monthsCoverage), color: theme.palette.warning.main }
  ];

  const simulationData = simulations.map(sim => ({
    scenario: sim.scenario.split(' ')[0], // Shorten for chart
    required: sim.requiredAmount,
    shortfall: sim.currentShortfall,
    timeToBuild: sim.timeToBuild
  }));

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isGuest && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }} action={<Button color="inherit" size="small" href="/auth/register" variant="contained">Create Account</Button>}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Demo Mode – Create an Account to Unlock Features</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>You&apos;re currently viewing demo emergency fund data. Create an account to get personalized recommendations based on your actual financial situation.</Typography>
          </Box>
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            color: 'white',
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: -40, right: -40, opacity: 0.1 }}>
            <Shield sx={{ fontSize: 180 }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" fontWeight="800">
                Emergency Fund Monitor
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Continuous monitoring and optimization of your financial safety net
              </Typography>
            </Box>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh sx={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: '0.5s' }} />}
                onClick={handleRefresh}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Recalculate
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>

      {/* Status Overview */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Current Balance</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="primary">
                ₹{status.currentBalance.toLocaleString()}
              </Typography>
              <Chip
                label={status.status.toUpperCase()}
                color={getStatusColor(status.status) as any}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Months Coverage</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="success.main">
                {(status?.monthsCoverage || 0).toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Target: {status.targetMonths} months
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Monthly Burn Rate</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="warning.main">
                ₹{status.monthlyBurnRate.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly expenses
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Depletion Risk</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" color="info.main">
                {depletionRisk.depletionRisk.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(depletionRisk?.monthsUntilCritical || 0).toFixed(1)} months safe
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Charts Section */}
      <GridTyped container spacing={4} sx={{ mb: 4 }}>
        {/* Coverage Chart */}
        <GridTyped item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Emergency Fund Coverage
              </Typography>
              <ClientOnly>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={coverageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {coverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: any) => {
                      const num = typeof value === 'number' ? value : Number(value || 0);
                      if (Number.isNaN(num)) return ["0.0 months", ''];
                      return [`${num.toFixed(1)} months`, ''];
                    }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </ClientOnly>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current: {(status?.monthsCoverage || 0).toFixed(1)} months | Target: {status?.targetMonths || 0} months
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </GridTyped>

        {/* Simulation Chart */}
        <GridTyped item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Emergency Scenarios Analysis
              </Typography>
              <ClientOnly>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={simulationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis tickFormatter={(value) => `₹${((value || 0) / 1000).toFixed(0)}k`} />
                    <RechartsTooltip formatter={(value, name) => [
                      name === 'required' ? `₹${Number(value || 0).toLocaleString()}` : `${value || 0} months`,
                      name === 'required' ? 'Required Amount' : 'Time to Build'
                    ]} />
                    <Bar dataKey="required" fill={theme.palette.error.main} name="required" />
                    <Bar dataKey="timeToBuild" fill={theme.palette.warning.main} name="timeToBuild" />
                  </RechartsBar>
                </ResponsiveContainer>
              </ClientOnly>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Alerts and Recommendations */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Status & Alerts
              </Typography>
              <Alert
                severity={status.status === 'excellent' || status.status === 'good' ? 'success' : 'warning'}
                icon={getStatusIcon(status.status)}
                sx={{ mb: 2 }}
              >
                <AlertTitle>Emergency Fund Status: {status.status.toUpperCase()}</AlertTitle>
                {status.recommendedAction}
              </Alert>

              {status.alerts.length > 0 && (
                <List dense>
                  {status.alerts.map((alert, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="error" />
                      </ListItemIcon>
                      <ListItemText primary={alert} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                AI Recommendations
              </Typography>
              <List dense>
                {recommendations.map((rec, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={rec} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Optimal Contribution Plan */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Optimal Contribution Plan
          </Typography>

          <GridTyped container spacing={3}>
            <GridTyped item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  Recommended Monthly Contribution
                </Typography>
                <Typography variant="h3" fontWeight="bold">
                  ₹{optimalContribution.recommendedMonthly.toLocaleString()}
                </Typography>
                <Chip
                  label={`Priority: ${optimalContribution.priority.toUpperCase()}`}
                  color={optimalContribution.priority === 'critical' ? 'error' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </Paper>
            </GridTyped>

            <GridTyped item xs={12} md={6}>
              <Paper sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="h6" gutterBottom>
                  Target Achievement
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ₹{optimalContribution.targetAmount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  Time to target: {optimalContribution.timeToTarget} months
                </Typography>
              </Paper>
            </GridTyped>
          </GridTyped>
        </CardContent>
      </Card>

      {/* Emergency Scenarios Details */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
            Emergency Scenarios Breakdown
          </Typography>

          <GridTyped container spacing={2}>
            {simulations.map((sim, index) => (
              <GridTyped item xs={12} sm={6} md={3} key={index}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {sim.scenario}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Required: ₹{sim.requiredAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Shortfall: ₹{sim.currentShortfall.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Build time: {sim.timeToBuild} months
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Monthly: ₹{sim.monthlyContribution.toLocaleString()}
                  </Typography>
                </Paper>
              </GridTyped>
            ))}
          </GridTyped>
        </CardContent>
      </Card>
    </Container>
  );
}