'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  Divider,
  useTheme,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  Grow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import { styled } from '@mui/material/styles';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
  Warning,
  CheckCircle,
  Notifications,
  Refresh,
  Timeline,
  PieChart,
  BarChart,
  ArrowForward,
  ShowChart,
  Shield,
  Assessment,
  AccountBalanceWallet,
  SupervisorAccount,
  Psychology,
  Security,
  AddCircleOutline,
  RemoveCircleOutline,
  HourglassEmpty,
  Bolt,
  TrackChanges,
  CheckCircleOutline,
  WarningAmber,
  Flag,
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
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

import HealthScoreCard from '@/components/HealthScoreCard';
import EnhancedHealthScoreCard from '@/components/EnhancedHealthScoreCard';
import FinancialCrisisSimulator from '@/components/FinancialCrisisSimulator';
import AlertsPanel from '@/components/AlertsPanel';
import ClientOnly from '@/components/ClientOnly';
import WithdrawalModal from '@/components/WithdrawalModal';
import { useAuth } from '@/context/AuthContext';
import { walletService, Wallet } from '@/services/walletService';
import { goalService, FinancialGoal } from '@/services/goalService';
import { accountabilityService, AccountabilityPartner } from '@/services/accountabilityService';
import { withdrawalService, EmergencyAnomalyResult } from '@/services/withdrawalService';
import { resilienceService, AIResilienceSummary } from '@/services/resilienceService';

// 🔥 Use token-enabled axios client
import api from "@/utils/axiosClient";


// --------- DASHBOARD ---------


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

// Helper function to get color based on priority
const getPriorityColor = (priority: 'high' | 'medium' | 'low', theme: any): string => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main
  };
  return colors[priority];
};

// Helper function to get category color
const getCategoryColor = (category: string, theme: any): 'error' | 'warning' | 'info' | 'success' => {
  const colorMap: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
    savings: 'success',
    emergency: 'error',
    investment: 'info',
    expense: 'warning',
    general: 'info'
  };
  return colorMap[category] || 'info';
};

// Helper function to get category icon
const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    savings: '💰',
    emergency: '🛡️',
    investment: '📈',
    expense: '📊',
    general: '💡'
  };
  return iconMap[category] || '💡';
};

// --------- DASHBOARD ---------

interface DashboardData {
  healthScore: any;
  survival: any;
  incomeScore: any;
  savings: any;
  insights: any;
}

interface FinancialSuggestion {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'savings' | 'emergency' | 'investment' | 'expense' | 'general';
  action?: string;
  actionLink?: string;
}

export default function Dashboard() {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isGuest = user && user.isGuest === true;
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<FinancialSuggestion[]>([]);

  // FinFolio Resilience Subsystem States
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [resilience, setResilience] = useState<AIResilienceSummary | null>(null);
  const [emergencyPatterns, setEmergencyPatterns] = useState<EmergencyAnomalyResult | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [isDepositing, setIsDepositing] = useState(false);

  // AI-Powered Financial Suggestions Generator
  const generateFinancialSuggestions = useCallback((data: DashboardData): FinancialSuggestion[] => {
    const suggestions: FinancialSuggestion[] = [];

    // Defensive programming - check if data is valid
    if (!data || !data.healthScore || !data.survival || !data.savings) {
      console.warn('Dashboard data is not fully loaded yet');
      return suggestions;
    }

    // Health Score Analysis
    const healthScore = data.healthScore.score || 0;
    if (healthScore < 60) {
      suggestions.push({
        id: 1,
        title: "Improve Your Financial Health",
        description: `Your financial health score of ${healthScore}/100 indicates room for improvement. Focus on building emergency savings and reducing expenses.`,
        priority: 'high',
        category: 'general',
        action: 'Take Assessment',
        actionLink: '/assessment'
      });
    } else if (healthScore < 80) {
      suggestions.push({
        id: 2,
        title: "Good Progress!",
        description: `Your financial health score of ${healthScore}/100 is good. Consider optimizing your investments and increasing emergency fund coverage.`,
        priority: 'medium',
        category: 'general',
        action: 'Optimize Allocation',
        actionLink: '/allocation'
      });
    } else {
      suggestions.push({
        id: 3,
        title: "Excellent Financial Health!",
        description: `Your financial health score of ${healthScore}/100 is excellent. Maintain your discipline and consider advanced investment strategies.`,
        priority: 'low',
        category: 'general',
        action: 'Explore Insights',
        actionLink: '/insights'
      });
    }

    // Emergency Fund Analysis
    const emergencyMonths = data.survival.months || 0;
    if (emergencyMonths < 3) {
      suggestions.push({
        id: 4,
        title: "Critical: Build Emergency Fund",
        description: `Your emergency fund covers only ${emergencyMonths.toFixed(1)} months. Aim for at least 6 months of expenses.`,
        priority: 'high',
        category: 'emergency',
        action: 'Emergency Fund Setup',
        actionLink: '/emergency'
      });
    } else if (emergencyMonths < 6) {
      suggestions.push({
        id: 5,
        title: "Increase Emergency Fund",
        description: `Your emergency fund covers ${emergencyMonths.toFixed(1)} months. Consider increasing to 6-12 months for better security.`,
        priority: 'medium',
        category: 'emergency',
        action: 'Review Emergency Fund',
        actionLink: '/emergency'
      });
    }

    // Savings Analysis
    const monthlySavings = data.savings.monthlyAutoSave || 0;
    if (monthlySavings < 5000) {
      suggestions.push({
        id: 6,
        title: "Boost Your Savings",
        description: `Your current monthly savings of ₹${monthlySavings.toLocaleString()} could be increased. Aim for at least 20% of your income.`,
        priority: 'medium',
        category: 'savings',
        action: 'Set Savings Goals',
        actionLink: '/savings'
      });
    } else {
      suggestions.push({
        id: 7,
        title: "Great Savings Habit!",
        description: `You're saving ₹${monthlySavings.toLocaleString()} monthly. Consider locking a portion for long-term goals.`,
        priority: 'low',
        category: 'savings',
        action: 'Lock Savings',
        actionLink: '/savings'
      });
    }

    // Category-specific suggestions
    const categoryScores = data.healthScore.categoryScores || {};
    if (categoryScores.stability < 70) {
      suggestions.push({
        id: 8,
        title: "Improve Income Stability",
        description: `Your income stability score of ${categoryScores.stability}/100 suggests inconsistent income. Consider building a larger emergency fund.`,
        priority: 'high',
        category: 'investment'
      });
    }

    if (categoryScores.expenseManagement < 70) {
      suggestions.push({
        id: 9,
        title: "Optimize Expenses",
        description: `Your expense management score of ${categoryScores.expenseManagement}/100 indicates high spending. Review discretionary expenses.`,
        priority: 'high',
        category: 'expense'
      });
    }

    return suggestions;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        healthRes,
        survivalRes,
        incomeRes,
        savingsRes,
        insightsRes,
        walletRes,
        goalsRes,
        partnersRes,
        resilienceRes,
        patternsRes,
      ] = await Promise.allSettled([
        api.get("/finance/healthscore"),
        api.get("/finance/survival"),
        api.get("/finance/incomescore"),
        api.get("/savings/status"),
        api.get("/finance/insights"),
        walletService.getWallet(),
        goalService.getGoals(),
        accountabilityService.getPartners(),
        resilienceService.getResilienceSummary(),
        withdrawalService.getEmergencyPatterns(),
      ]);

      const healthData =
        healthRes.status === 'fulfilled'
          ? healthRes.value.data
          : {
              score: 75,
              categoryScores: {
                stability: 80,
                expenseManagement: 70,
                savings: 75,
                emergencyPreparedness: 72,
              },
            };
      const survivalData =
        survivalRes.status === 'fulfilled' ? survivalRes.value.data : { months: 4.2 };
      const incomeData =
        incomeRes.status === 'fulfilled'
          ? incomeRes.value.data
          : { categoryScores: { growth: 78 } };
      const savingsData =
        savingsRes.status === 'fulfilled' ? savingsRes.value.data : { monthlyAutoSave: 5200 };
      const insightsData =
        insightsRes.status === 'fulfilled' ? insightsRes.value.data : { alerts: [] };

      if (walletRes.status === 'fulfilled' && walletRes.value?.wallet) {
        setWallet(walletRes.value.wallet);
      }
      if (goalsRes.status === 'fulfilled' && goalsRes.value?.goals) {
        setGoals(goalsRes.value.goals);
      }
      if (partnersRes.status === 'fulfilled' && Array.isArray(partnersRes.value)) {
        setPartners(partnersRes.value);
      }
      if (resilienceRes.status === 'fulfilled' && resilienceRes.value) {
        setResilience(resilienceRes.value);
      }
      if (patternsRes.status === 'fulfilled' && patternsRes.value) {
        setEmergencyPatterns(patternsRes.value);
      }

      const dashboardData = {
        healthScore: healthData,
        survival: survivalData,
        incomeScore: incomeData,
        savings: savingsData,
        insights: insightsData,
      };
      setData(dashboardData);
      setSuggestions(generateFinancialSuggestions(dashboardData));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [generateFinancialSuggestions]);

  const handleDeposit = async () => {
    const val = parseFloat(depositAmount);
    if (!val || val <= 0) return;
    try {
      setIsDepositing(true);
      await walletService.deposit(val, 'savings_deposit', 'Simulated deposit to wallet');
      setIsDepositDialogOpen(false);
      await fetchDashboardData();
    } catch (err) {
      console.error('Deposit error:', err);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawalSuccess = async () => {
    await fetchDashboardData();
  };

  // Define handleRefresh before useEffect
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setTimeout(() => setRefreshing(false), 800);
  };

  // Fetch dashboard data when auth is ready (authenticated or guest)
  useEffect(() => {
    if (authLoading) return;
    fetchDashboardData();
  }, [authLoading, fetchDashboardData]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Loading your financial dashboard...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="h6">Connection Error</Typography>
          {error}
        </Alert>
        <Box textAlign="center">
          <Button variant="contained" onClick={fetchDashboardData}>Retry</Button>
        </Box>
      </Container>
    );
  }

  if (!data) return null;

  // Transform alerts for AlertsPanel
  const alerts = data.insights.alerts.map((alert: { id: number; message: string; type: string; timestamp: string }) => ({
    id: Number(alert.id),
    message: alert.message,
    type: alert.type,
    timestamp: alert.timestamp
  }));

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.grey[100]})`,
          minHeight: "100vh"
        }}
      >
        {isGuest && (
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }} action={<Button color="inherit" size="small" href="/auth/register" variant="contained">Create Account</Button>}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Demo Mode – Create an Account to Unlock Features</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>You&apos;re currently viewing demo financial data. Create an account to get personalized recommendations based on your actual financial situation.</Typography>
            </Box>
          </Alert>
        )}

        {/* HEADER */}
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
              <Timeline sx={{ fontSize: 180 }} />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h3" fontWeight="800">
                  Financial Command Center
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  AI-Powered Financial Intelligence at Your Fingertips
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Tooltip title="Refresh Data">
                  <IconButton onClick={handleRefresh} sx={{ color: "white" }}>
                    <Refresh sx={{ transform: refreshing ? "rotate(360deg)" : "none", transition: "0.5s" }} />
                  </IconButton>
                </Tooltip>
                <Avatar sx={{ bgcolor: "rgba(255, 255, 255, 0.2)" }}>
                  <AccountBalance />
                </Avatar>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* ---- TOP METRICS GRID (FINFOLIO 4 PILLARS) ---- */}
        <GridTyped container spacing={3} sx={{ mb: 4 }}>
          {/* 1. Health Score */}
          <GridTyped item xs={12} sm={6} lg={3}>
            <Grow in timeout={500}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s ease',
                background: (theme: any) => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme: any) => theme.shadows[8],
                  borderColor: (theme: any) => theme.palette.primary.main
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      FINANCIAL HEALTH SCORE
                    </Typography>
                    <Chip
                      label={`Grade ${resilience?.deterministicBase?.healthGrade || 'A'}`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                  <AnimatedNumber value={resilience?.deterministicBase?.healthScore || data.healthScore?.score || 78} suffix="/100" />
                  <StatusChip value={resilience?.deterministicBase?.healthScore || data.healthScore?.score || 78} />
                </CardContent>
              </Card>
            </Grow>
          </GridTyped>

          {/* 2. Simulated Wallet Balance */}
          <GridTyped item xs={12} sm={6} lg={3}>
            <Grow in timeout={700}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s ease',
                background: (theme: any) => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme: any) => theme.shadows[8],
                  borderColor: (theme: any) => theme.palette.success.main
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      WALLET LIQUIDITY
                    </Typography>
                    <AccountBalanceWallet color="success" />
                  </Box>
                  <Typography variant="h4" fontWeight={800} color="success.dark" sx={{ my: 1 }}>
                    ${(wallet?.balance ?? resilience?.deterministicBase?.walletBalance ?? 2450).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<AddCircleOutline />}
                      onClick={() => setIsDepositDialogOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, flex: 1 }}
                    >
                      Deposit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<RemoveCircleOutline />}
                      onClick={() => setIsWithdrawalModalOpen(true)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, flex: 1 }}
                    >
                      Withdraw
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </GridTyped>

          {/* 3. Emergency Runway & Multi-Scenarios */}
          <GridTyped item xs={12} sm={6} lg={3}>
            <Grow in timeout={900}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s ease',
                background: (theme: any) => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme: any) => theme.shadows[8],
                  borderColor: (theme: any) => theme.palette.warning.main
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      ESSENTIAL RUNWAY
                    </Typography>
                    <HourglassEmpty color="warning" />
                  </Box>
                  <AnimatedNumber
                    value={Math.round((resilience?.deterministicBase?.runwayMonths ?? data.survival?.months ?? 4.8) * 10) / 10}
                    suffix=" Mo"
                  />
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                    <Chip
                      size="small"
                      label={`Conservative: ${(resilience?.deterministicBase?.runwayScenarios?.conservativeMonths ?? 3.8).toFixed(1)}m`}
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Chip
                      size="small"
                      label={`Moderate: ${(resilience?.deterministicBase?.runwayScenarios?.baselineMonths ?? 4.8).toFixed(1)}m`}
                      color="primary"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </GridTyped>

          {/* 4. Savings Rate & Goals Progress */}
          <GridTyped item xs={12} sm={6} lg={3}>
            <Grow in timeout={1100}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: '0.3s ease',
                background: (theme: any) => `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[100]})`,
                border: (theme: any) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme: any) => theme.shadows[8],
                  borderColor: (theme: any) => theme.palette.info.main
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      SAVINGS DISCIPLINE
                    </Typography>
                    <TrackChanges color="info" />
                  </Box>
                  <AnimatedNumber
                    value={Math.round(resilience?.deterministicBase?.savingsRate ?? 40.4)}
                    suffix="%"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mt: 1 }}>
                    🎯 {resilience?.deterministicBase?.goalsOnTrackCount ?? (goals.length > 0 ? goals.filter(g => g.calculations?.isOnTrack).length : 2)} of {goals.length || resilience?.deterministicBase?.totalGoalsCount || 3} goals on track
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </GridTyped>
        </GridTyped>

        {/* ---- FINFOLIO ACCOUNTABILITY & COMMITMENT RULES BAR ---- */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: partners.length > 0 ? 'primary.light' : 'divider',
            bgcolor: partners.length > 0 ? 'rgba(33, 150, 243, 0.04)' : 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <SupervisorAccount />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                Accountability Partnership
                <Chip
                  size="small"
                  label={partners.length > 0 ? 'Active' : 'Self-Directed'}
                  color={partners.length > 0 ? 'primary' : 'default'}
                  sx={{ fontWeight: 700, height: 22 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {partners.length > 0
                  ? `Mentor: ${partners[0]?.name || 'Accountability Mentor'} (${partners[0]?.relationship || 'Accountability Partner'}) • 3-Tier Commitment Thresholds Active`
                  : '3-tier commitment thresholds protect your essential runway with conscious friction before discretionary spending.'}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.push('/accountability')}
            endIcon={<ArrowForward />}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Manage Partners & Rules
          </Button>
        </Paper>

        {/* ---- NON-JUDGMENTAL PATTERN ANOMALY ADVISORIES (IF ANY) ---- */}
        {(emergencyPatterns?.warnings?.length || resilience?.anomalies?.length || 0) > 0 && (
          <Fade in timeout={500}>
            <Box sx={{ mb: 4 }}>
              <Alert
                severity="info"
                icon={<WarningAmber />}
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'info.main',
                  bgcolor: 'rgba(2, 136, 209, 0.05)',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  FinFolio Pattern Advisories
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {(emergencyPatterns?.warnings || resilience?.anomalies?.map(a => a.observation) || []).map((warn, i) => (
                    <Typography key={i} variant="body2">
                      • {warn}
                    </Typography>
                  ))}
                </Box>
              </Alert>
            </Box>
          </Fade>
        )}

        {/* ---- AI RESILIENCE INTELLIGENCE & CONTEXTUAL EXPLANATIONS ---- */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Psychology color="primary" sx={{ fontSize: 30 }} />
              AI Resilience Intelligence & Contextual Explanations
            </Typography>
            <Chip
              size="small"
              icon={<Security />}
              label={`Deterministic Base (${Math.round((resilience?.mlConfidence || 0.9) * 100)}% Confidence)`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(67, 56, 202, 0.05), rgba(79, 70, 229, 0.1))',
              border: '1px solid',
              borderColor: 'primary.light',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.6 }}>
              {resilience?.executiveSummary ||
                'FinFolio Resilience Assessment: Your portfolio demonstrates solid financial footing. With your current emergency runway and savings rate, your foundational milestones are actively protected.'}
            </Typography>
          </Paper>

          {/* Contextual Cards Grid */}
          <GridTyped container spacing={3}>
            {(resilience?.contextualInsights || [
              {
                id: '1',
                title: 'Financial Runway Outlook',
                fact: 'You currently have 4.8 months of essential expenses secured in liquid reserves ($2,450.00 wallet liquidity).',
                consequence: 'Under stress conditions with sudden expense shocks, your runway adjusts to 3.8 months.',
                actionableGuidance: 'Maintaining steady monthly allocations ensures your emergency buffer remains insulated.',
                sentiment: 'positive',
              },
              {
                id: '2',
                title: 'Savings Trajectory & Goal Attainment',
                fact: '2 of 3 target savings goals are currently on track, with an overall portfolio progress of 44.1%.',
                consequence: 'At your steady savings rate of 40.4%, you are adding $21,000 toward financial resilience every month.',
                actionableGuidance: 'Continue automated transfers to preserve projected completion dates.',
                sentiment: 'positive',
              },
              {
                id: '3',
                title: 'Accountability Framework',
                fact: 'Accountability rules are active with 3 commitment tiers protecting your financial foundation.',
                consequence: 'Large discretionary withdrawals trigger consequence evaluation and mentor review before execution.',
                actionableGuidance: 'Transparent friction protects your long-term wealth without restricting sovereign control.',
                sentiment: 'positive',
              },
            ]).map((insight) => (
              <GridTyped item xs={12} md={4} key={insight.id}>
                <Paper
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: '0.3s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[6],
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutline fontSize="small" />
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      {insight.fact}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
                      Impact: {insight.consequence}
                    </Typography>
                  </Box>
                  <Box sx={{ pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.dark' }}>
                      💡 {insight.actionableGuidance}
                    </Typography>
                  </Box>
                </Paper>
              </GridTyped>
            ))}
          </GridTyped>
        </Box>

        {/* ---- CANONICAL FINANCIAL GOALS SHOWCASE ---- */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Flag color="primary" sx={{ fontSize: 28 }} />
              Active Financial Goals
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push('/goals')}
              startIcon={<AddCircleOutline />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Add New Goal
            </Button>
          </Box>

          <GridTyped container spacing={3}>
            {(goals.length > 0
              ? goals
              : [
                  {
                    id: 1,
                    name: 'Emergency Fund Reserve',
                    targetAmount: 200000,
                    currentAmount: 120000,
                    targetDate: '2026-12-31',
                    category: 'emergency',
                    priority: 'high' as const,
                    calculations: {
                      progressPercent: 60,
                      remainingAmount: 80000,
                      monthsRemaining: 4,
                      monthlySavingsNeeded: 20000,
                      estimatedCompletionDate: '2026-12-31',
                      isOnTrack: true,
                      status: 'in_progress' as const,
                    },
                    userId: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: 2,
                    name: 'Home Renovation',
                    targetAmount: 500000,
                    currentAmount: 180000,
                    targetDate: '2027-06-30',
                    category: 'housing',
                    priority: 'medium' as const,
                    calculations: {
                      progressPercent: 36,
                      remainingAmount: 320000,
                      monthsRemaining: 10,
                      monthlySavingsNeeded: 32000,
                      estimatedCompletionDate: '2027-06-30',
                      isOnTrack: true,
                      status: 'in_progress' as const,
                    },
                    userId: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]
            ).map((goal) => {
              const progress =
                goal.calculations?.progressPercent ??
                Math.min(100, Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100));
              const isOnTrack = goal.calculations?.isOnTrack ?? true;

              return (
                <GridTyped item xs={12} md={6} lg={4} key={goal.id}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: '0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[6],
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          {goal.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={isOnTrack ? 'On Track' : 'Behind'}
                          color={isOnTrack ? 'success' : 'warning'}
                          sx={{ fontWeight: 700, height: 22 }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {goal.category} • Priority: {goal.priority}
                      </Typography>

                      <Box sx={{ my: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            ${goal.currentAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${goal.targetAmount.toLocaleString()} ({progress}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color={isOnTrack ? 'primary' : 'warning'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ pt: 1.5, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Target: {goal.targetDate || 'Flexible'}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => router.push('/goals')}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        View Goal →
                      </Button>
                    </Box>
                  </Paper>
                </GridTyped>
              );
            })}
          </GridTyped>
        </Box>

        {/* ----- DETAILS + ALERTS ----- */}
        <GridTyped container spacing={4}>
          {/* Detailed Health Score */}
          <GridTyped item xs={12} lg={8}>
            <Fade in timeout={1300}>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  Detailed Health Analysis
                </Typography>

                <GridTyped container spacing={3}>
                  <GridTyped item xs={12} md={6}>
                    <EnhancedHealthScoreCard
                      score={Math.round(data.healthScore?.categoryScores?.stability || 0)}
                      category="Income Stability"
                      previousScore={Math.round((data.healthScore?.categoryScores?.stability || 0) * 0.9)}
                      insights={[
                        "Your income stability has improved by 10% this quarter",
                        "Industry growth trends favor your skill set",
                        "Consider diversifying income sources"
                      ]}
                      recommendations={[
                        "Maintain current employment stability",
                        "Update skills quarterly",
                        "Build professional network"
                      ]}
                      trend="up"
                    />
                  </GridTyped>
                  <GridTyped item xs={12} md={6}>
                    <EnhancedHealthScoreCard
                      score={Math.round(data.healthScore?.categoryScores?.expenseManagement || 0)}
                      category="Expense Control"
                      previousScore={Math.round((data.healthScore?.categoryScores?.expenseManagement || 0) * 0.95)}
                      insights={[
                        "Expense ratio within optimal range",
                        "Discretionary spending reduced by 15%",
                        "Fixed costs well managed"
                      ]}
                      recommendations={[
                        "Review subscription services quarterly",
                        "Implement 50/30/20 budget rule",
                        "Track expenses with mobile app"
                      ]}
                      trend="up"
                    />
                  </GridTyped>
                  <GridTyped item xs={12} md={6}>
                    <EnhancedHealthScoreCard
                      score={Math.round(data.healthScore?.categoryScores?.savings || 0)}
                      category="Savings Discipline"
                      previousScore={Math.round((data.healthScore?.categoryScores?.savings || 0) * 1.05)}
                      insights={[
                        "Savings rate above recommended 20%",
                        "Emergency fund growing steadily",
                        "Investment contributions consistent"
                      ]}
                      recommendations={[
                        "Automate savings transfers",
                        "Increase savings by 1% annually",
                        "Review investment portfolio quarterly"
                      ]}
                      trend="down"
                    />
                  </GridTyped>
                  <GridTyped item xs={12} md={6}>
                    <EnhancedHealthScoreCard
                      score={Math.round(data.healthScore?.categoryScores?.emergencyPreparedness || 0)}
                      category="Emergency Preparedness"
                      previousScore={Math.round((data.healthScore?.categoryScores?.emergencyPreparedness || 0) * 0.85)}
                      insights={[
                        "Emergency fund covers 4+ months",
                        "Insurance coverage adequate",
                        "Emergency contacts updated"
                      ]}
                      recommendations={[
                        "Target 6 months emergency fund",
                        "Review insurance policies annually",
                        "Create emergency action plan"
                      ]}
                      trend="stable"
                    />
                  </GridTyped>
                </GridTyped>
              </Box>
            </Fade>
          </GridTyped>

          {/* AI Alerts */}
          <GridTyped item xs={12} lg={4}>
            <Fade in timeout={1500}>
              <Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                  AI Alerts & Insights
                </Typography>
                <AlertsPanel alerts={alerts} />
              </Box>
            </Fade>
          </GridTyped>
        </GridTyped>

        {/* ----- CRISIS SIMULATOR SECTION ----- */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
            Financial Crisis Simulator
          </Typography>
          <FinancialCrisisSimulator />
        </Box>

        {/* ----- CHARTS SECTION ----- */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
            Financial Visualization
          </Typography>

          <GridTyped container spacing={4}>
            {/* Health Score Breakdown - Pie Chart */}
            <GridTyped item xs={12} md={6}>
              <Fade in timeout={1700}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Health Score Breakdown
                    </Typography>
                    <ClientOnly>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPie>
                          <Pie
                            data={[
                              { name: 'Stability', value: Math.round(data.healthScore?.categoryScores?.stability || 0) },
                              { name: 'Expense Mgmt', value: Math.round(data.healthScore?.categoryScores?.expenseManagement || 0) },
                              { name: 'Emergency', value: Math.round(data.healthScore?.categoryScores?.emergencyPreparedness || 0) },
                              { name: 'Debt', value: Math.round(data.healthScore?.categoryScores?.debtBurden || 0) },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => `${name}: ${value}%`}
                            outerRadius={100}
                            dataKey="value"
                          >
                            <Cell fill={theme.palette.primary.main} />
                            <Cell fill={theme.palette.success.main} />
                            <Cell fill={theme.palette.warning.main} />
                            <Cell fill={theme.palette.error.main} />
                          </Pie>
                        </RechartsPie>
                      </ResponsiveContainer>
                    </ClientOnly>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Income vs Expenses - Bar Chart */}
            <GridTyped item xs={12} md={6}>
              <Fade in timeout={1900}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Income vs Expenses
                    </Typography>
                    <ClientOnly>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsBar data={[
                          {
                            name: 'Monthly',
                            income: (data.healthScore?.categoryScores?.stability || 0) * 100,
                            expenses: (100 - (data.healthScore?.categoryScores?.expenseManagement || 0)) * 100
                          }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="income" fill={theme.palette.success.main} />
                          <Bar dataKey="expenses" fill={theme.palette.error.main} />
                        </RechartsBar>
                      </ResponsiveContainer>
                    </ClientOnly>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Savings Progress - Line Chart */}
            <GridTyped item xs={12}>
              <Fade in timeout={2100}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Savings Progress Trend
                    </Typography>
                    <ClientOnly>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={[
                          { month: 'Month 1', savings: (data.savings?.monthlyAutoSave || 0) * 0.8 },
                          { month: 'Month 2', savings: (data.savings?.monthlyAutoSave || 0) * 0.9 },
                          { month: 'Month 3', savings: (data.savings?.monthlyAutoSave || 0) }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip formatter={(value: any) => `₹${Number(value || 0).toLocaleString()}`} />
                          <Legend />
                          <Line type="monotone" dataKey="savings" stroke={theme.palette.primary.main} strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ClientOnly>
                  </CardContent >
                </Card >
              </Fade >
            </GridTyped >
          </GridTyped >
        </Box >

        {/* ----- AI-POWERED SUGGESTIONS SECTION ----- */}
        < Box sx={{ mt: 8, mb: 6 }
        }>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShowChart sx={{ fontSize: 32, color: theme.palette.primary.main }} />
            AI-Powered Financial Recommendations
          </Typography>

          <GridTyped container spacing={3}>
            {suggestions.map((suggestion) => (
              <GridTyped item xs={12} md={6} lg={4} key={suggestion.id}>
                <Fade in timeout={800}>
                  <Card
                    sx={{
                      height: '100%',
                      borderLeft: `4px solid ${getPriorityColor(suggestion.priority, theme)}`,
                      transition: '0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[6]
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{
                          color: getPriorityColor(suggestion.priority, theme),
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {suggestion.priority} Priority • {getCategoryIcon(suggestion.category)}
                        </Typography>
                        <Chip
                          label={suggestion.category}
                          size="small"
                          color={getCategoryColor(suggestion.category, theme)}
                        />
                      </Box>

                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                        {suggestion.title}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {suggestion.description}
                      </Typography>

                      {suggestion.action && suggestion.actionLink && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => router.push(suggestion.actionLink!)}
                          sx={{ mt: 1 }}
                        >
                          {suggestion.action}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </GridTyped>
            ))}
          </GridTyped>
        </Box >

        {/* ----- Navigation Quick Actions ----- */}
        < Box sx={{ mt: 8, mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 4 }}>
            Quick Actions & Navigation
          </Typography>

          <GridTyped container spacing={3}>
            {/* Assessment Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={200}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/assessment')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Assessment sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Financial Assessment
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Evaluate your financial stability
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'info.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Allocation Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={300}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/allocation')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <PieChart sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Asset Allocation
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      AI-powered portfolio optimization
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'secondary.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Emergency Fund Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={500}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/emergency')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Shield sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Emergency Fund
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Monitor your safety net
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'warning.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Savings Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={700}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/savings')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Savings sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Savings Plans
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Manage and lock your savings
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'primary.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Insights Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={700}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/insights')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <BarChart sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Insights & Analytics
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Deep dive into your finances
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'success.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Emergency Fund Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={900}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={() => router.push('/dashboard')}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Notifications sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Emergency Fund
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {data.survival.months} months coverage
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <ArrowForward sx={{ fontSize: 20, color: 'warning.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>

            {/* Export / Download Button */}
            <GridTyped item xs={12} sm={6} md={3}>
              <Fade in timeout={1100}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: '0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12]
                    }
                  }}
                  onClick={handleRefresh}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Refresh sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Refresh Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Update all metrics
                    </Typography>
                    <Stack direction="row" justifyContent="center">
                      <CheckCircle sx={{ fontSize: 20, color: 'info.main' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </GridTyped>
          </GridTyped>
        </Box >

        {/* ---- FINFOLIO WITHDRAWAL MODAL ---- */}
        <WithdrawalModal
          open={isWithdrawalModalOpen}
          onClose={() => setIsWithdrawalModalOpen(false)}
          onSuccess={handleWithdrawalSuccess}
          currentBalance={wallet?.balance ?? resilience?.deterministicBase?.walletBalance ?? 2450}
        />

        {/* ---- QUICK DEPOSIT DIALOG ---- */}
        <Dialog open={isDepositDialogOpen} onClose={() => setIsDepositDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Deposit Simulated Funds</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add simulated funds into your FinFolio wallet to boost your liquid emergency runway, savings rate, and goal progress.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Deposit Amount ($)"
              type="number"
              fullWidth
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setIsDepositDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeposit}
              variant="contained"
              color="success"
              disabled={isDepositing || parseFloat(depositAmount) <= 0}
            >
              {isDepositing ? 'Depositing...' : 'Confirm Deposit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container >
    </>
  );
}
