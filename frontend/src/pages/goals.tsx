/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Slider,
  alpha,
} from '@mui/material';
import {
  Add,
  Delete,
  AccountBalanceWallet,
  TrendingUp,
  Savings as SavingsIcon,
  Refresh,
  EventNote,
  AttachMoney,
  RocketLaunch,
  AutoGraph,
} from '@mui/icons-material';
import { useCurrency } from '@/context/CurrencyContext';
import {
  goalService,
  FinancialGoal,
  FinancialFoundationSummary,
} from '../services/goalService';

const GridTyped = Grid as any;

const categoryOptions = [
  { value: 'housing', label: 'Housing / Real Estate', icon: '🏠', color: '#3b82f6' },
  { value: 'vehicle', label: 'Vehicle / Transport', icon: '🚗', color: '#10b981' },
  { value: 'emergency', label: 'Emergency Fund', icon: '🛡️', color: '#6366f1' },
  { value: 'vacation', label: 'Vacation & Travel', icon: '✈️', color: '#f59e0b' },
  { value: 'retirement', label: 'Retirement Wealth', icon: '🏖️', color: '#8b5cf6' },
  { value: 'education', label: 'Education / Upskilling', icon: '🎓', color: '#ec4899' },
  { value: 'general', label: 'General Savings', icon: '🎯', color: '#06b6d4' },
];

const priorityOptions: { value: 'low' | 'medium' | 'high'; label: string; color: string }[] = [
  { value: 'high', label: 'High Priority', color: '#ef4444' },
  { value: 'medium', label: 'Medium Priority', color: '#f59e0b' },
  { value: 'low', label: 'Low Priority', color: '#10b981' },
];

const Goals = () => {
  const { currency, currencyInfo, formatAmount } = useCurrency();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [summary, setSummary] = useState<FinancialFoundationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Advanced Goals Simulation State
  const [inflationHedge, setInflationHedge] = useState<boolean>(false);
  const [whatIfBoost, setWhatIfBoost] = useState<Record<number, number>>({});

  // Milestone Badge Helper
  const getMilestoneBadge = (pct: number) => {
    if (pct >= 100) return { label: 'Diamond (100%)', color: '#06b6d4', icon: '💎' };
    if (pct >= 75) return { label: 'Gold (75%)', color: '#eab308', icon: '🥇' };
    if (pct >= 50) return { label: 'Silver (50%)', color: '#94a3b8', icon: '🥈' };
    if (pct >= 25) return { label: 'Bronze (25%)', color: '#d97706', icon: '🥉' };
    return null;
  };

  // Dialog states
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [createSubmitting, setCreateSubmitting] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('0');
  const [targetDate, setTargetDate] = useState<string>('');
  const [category, setCategory] = useState<string>('emergency');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Contribution dialog
  const [openContribute, setOpenContribute] = useState<boolean>(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState<string>('');
  const [contributeSubmitting, setContributeSubmitting] = useState<boolean>(false);

  const fetchGoalsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await goalService.getGoals();
      setGoals(data.goals || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error('Failed to load goals:', err);
      setError('Could not connect to backend financial_goals service. Displaying available state.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoalsData();
  }, [fetchGoalsData]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || Number(targetAmount) <= 0) {
      setError('Please provide a valid goal name and target amount.');
      return;
    }

    setCreateSubmitting(true);
    setError(null);
    try {
      await goalService.createGoal({
        name: name.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        targetDate: targetDate || null,
        category,
        priority,
      });

      setSuccessMsg(`Goal "${name.trim()}" created successfully.`);
      setOpenCreate(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('');
      fetchGoalsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create goal.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !contributeAmount || Number(contributeAmount) <= 0) return;

    setContributeSubmitting(true);
    setError(null);
    try {
      await goalService.contributeToGoal(selectedGoal.id, Number(contributeAmount));
      setSuccessMsg(`Contributed $${Number(contributeAmount).toLocaleString()} to "${selectedGoal.name}".`);
      setOpenContribute(false);
      setSelectedGoal(null);
      setContributeAmount('');
      fetchGoalsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record contribution.');
    } finally {
      setContributeSubmitting(false);
    }
  };

  const handleDeleteGoal = async (goalId: number, goalName: string) => {
    if (!confirm(`Are you sure you want to delete the goal "${goalName}"?`)) return;

    try {
      await goalService.deleteGoal(goalId);
      setSuccessMsg(`Goal "${goalName}" removed.`);
      fetchGoalsData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete goal.');
    }
  };

  const getCategoryMeta = (cat: string) => {
    return categoryOptions.find((c) => c.value === cat) || {
      value: cat,
      label: cat,
      icon: '🎯',
      color: '#3b82f6',
    };
  };

  const getPriorityMeta = (p: string) => {
    return priorityOptions.find((x) => x.value === p) || {
      value: p,
      label: p.toUpperCase(),
      color: '#6b7280',
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            🎯 Financial Goals & Resilience
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Deterministic progress tracking grounded in your real monthly income, expenses, and savings capacity.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchGoalsData()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreate(true)}
            sx={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)' },
              fontWeight: 600,
            }}
          >
            Add New Goal
          </Button>
        </Box>
      </Box>

      {/* Notifications */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Financial Foundation Banner */}
      {summary && (
        <Card
          sx={{
            mb: 4,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: '#38bdf8' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8' }}>
                DETERMINISTIC FINANCIAL FOUNDATION
              </Typography>
            </Box>
            <GridTyped container spacing={3}>
              <GridTyped item xs={6} sm={4} md={2.4}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Monthly Income
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {formatAmount(summary.monthlyIncome)}
                </Typography>
              </GridTyped>
              <GridTyped item xs={6} sm={4} md={2.4}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Monthly Expenses
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                  {formatAmount(summary.monthlyExpenses)}
                </Typography>
              </GridTyped>
              <GridTyped item xs={6} sm={4} md={2.4}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Monthly Net Savings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#34d399' }}>
                  {formatAmount(summary.monthlySavings)}
                </Typography>
              </GridTyped>
              <GridTyped item xs={6} sm={4} md={2.4}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Savings Rate
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                  {summary.savingsRate}%
                </Typography>
              </GridTyped>
              <GridTyped item xs={6} sm={4} md={2.4}>
                <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase' }}>
                  Simulated Wallet Balance
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fbbf24' }}>
                  {formatAmount(summary.walletBalance)}
                </Typography>
              </GridTyped>
            </GridTyped>
          </CardContent>
        </Card>
      )}

      {/* Metric Summary Cards */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Active Goals</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>{goals.length}</Typography>
            </CardContent>
          </Card>
        </GridTyped>
        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Goal Target</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatAmount(goals.reduce((sum, g) => sum + g.targetAmount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Accumulated</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                {formatAmount(goals.reduce((sum, g) => sum + g.currentAmount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Overall Goal Completion</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                {summary?.overallGoalProgress || 0}%
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Simulation & Purchasing Power Controller */}
      <Card sx={{ mb: 4, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoGraph color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Dynamic Goal Simulation & Purchasing Power Protection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Simulate real purchasing power preservation with a 6% p.a. inflation hedge and test contribution accelerations.
              </Typography>
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={inflationHedge}
                onChange={(e) => setInflationHedge(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" fontWeight={700} color={inflationHedge ? 'warning.main' : 'text.primary'}>
                  Inflation Hedge (6% p.a.)
                </Typography>
              </Box>
            }
            sx={{ m: 0, bgcolor: inflationHedge ? alpha('#f59e0b', 0.1) : 'transparent', px: 1.5, py: 0.5, borderRadius: 2 }}
          />
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Goals Grid */}
      {!loading && goals.length === 0 && (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            You haven't created a financial goal yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: 'auto' }}>
            Establish your targets for emergency funds, debt payoff, or long-term wealth to activate automated progress tracking.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreate(true)} sx={{ borderRadius: 2, px: 3 }}>
            Create First Goal
          </Button>
        </Card>
      )}

      <GridTyped container spacing={3}>
        {goals.map((goal) => {
          const categoryMeta = getCategoryMeta(goal.category);
          const priorityMeta = getPriorityMeta(goal.priority);
          const calc = goal.calculations || {
            progressPercent: Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)),
            remainingAmount: Math.max(0, goal.targetAmount - goal.currentAmount),
            monthsRemaining: 0,
            monthlySavingsNeeded: 0,
            estimatedCompletionDate: 'N/A',
            isOnTrack: false,
            status: 'in_progress',
          };

          const milestone = getMilestoneBadge(calc.progressPercent);
          const effectiveTarget = inflationHedge
            ? Math.round(goal.targetAmount * Math.pow(1.06, Math.max(1, (calc.monthsRemaining || 12) / 12)))
            : goal.targetAmount;
          const effectiveRemaining = Math.max(0, effectiveTarget - goal.currentAmount);
          const extraMonthly = whatIfBoost[goal.id] || 0;
          const acceleratedMonthly = (calc.monthlySavingsNeeded || 0) + extraMonthly;
          const acceleratedMonthsLeft = acceleratedMonthly > 0 ? Math.ceil(effectiveRemaining / acceleratedMonthly) : calc.monthsRemaining;
          const monthsAccelerated = Math.max(0, (calc.monthsRemaining || 0) - acceleratedMonthsLeft);

          return (
            <GridTyped item xs={12} md={6} key={goal.id}>
              <Card sx={{ height: '100%', borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', position: 'relative' }}>
                {/* Category Icon Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: `${categoryMeta.color}15`,
                    fontSize: '1.4rem',
                  }}
                >
                  {categoryMeta.icon}
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ pr: 6, mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                      {goal.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Chip
                        label={priorityMeta.label}
                        size="small"
                        sx={{
                          backgroundColor: priorityMeta.color,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                        }}
                      />
                      {milestone && (
                        <Chip
                          label={`${milestone.icon} ${milestone.label}`}
                          size="small"
                          sx={{
                            backgroundColor: alpha(milestone.color, 0.15),
                            color: milestone.color,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            border: `1px solid ${alpha(milestone.color, 0.3)}`,
                          }}
                        />
                      )}
                      {calc.monthsRemaining > 0 && (
                        <Chip
                          icon={<EventNote sx={{ fontSize: '1rem !important' }} />}
                          label={`${acceleratedMonthsLeft} months left`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      <Chip
                        label={calc.status.replace('_', ' ').toUpperCase()}
                        size="small"
                        color={calc.status === 'completed' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* Progress Bar */}
                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="body2" color="textSecondary">
                        Goal Completion
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: categoryMeta.color }}>
                        {calc.progressPercent}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calc.progressPercent}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: (theme) => alpha(theme.palette.divider, 0.4),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: categoryMeta.color,
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>

                  {/* Amounts */}
                  <GridTyped container spacing={2} sx={{ mb: 2 }}>
                    <GridTyped item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Current Saved
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: categoryMeta.color }}>
                        {formatAmount(goal.currentAmount)}
                      </Typography>
                    </GridTyped>
                    <GridTyped item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        {inflationHedge ? 'Target (Inflation Adj.)' : 'Target Amount'}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {formatAmount(effectiveTarget)}
                      </Typography>
                      {inflationHedge && (
                        <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600, display: 'block' }}>
                          +6% p.a. hedge
                        </Typography>
                      )}
                    </GridTyped>
                  </GridTyped>

                  {/* Deterministic Forecast Box */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: `${categoryMeta.color}08`,
                      border: `1px solid ${categoryMeta.color}25`,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
                      MONTHLY REQUIRED CONTRIBUTION
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: categoryMeta.color }}>
                      {formatAmount(acceleratedMonthly)} / month
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Estimated completion:{' '}
                      <span style={{ fontWeight: 600 }}>
                        {acceleratedMonthsLeft > 0 ? `In ~${acceleratedMonthsLeft} months (${calc.estimatedCompletionDate})` : calc.estimatedCompletionDate}
                      </span>
                    </Typography>
                  </Box>

                  {/* What-If Contribution Slider */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
                      border: (theme) => `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <RocketLaunch sx={{ fontSize: 14, color: 'primary.main' }} />
                        What-If Extra Monthly Savings:
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color="primary.main">
                        +{formatAmount(extraMonthly)}/mo
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      value={extraMonthly}
                      min={0}
                      max={500}
                      step={25}
                      onChange={(_, val) => setWhatIfBoost(prev => ({ ...prev, [goal.id]: val as number }))}
                    />
                    {extraMonthly > 0 && monthsAccelerated > 0 ? (
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700, display: 'block', mt: 0.5 }}>
                        🚀 Reach goal {monthsAccelerated} months sooner! ({acceleratedMonthsLeft} mo left)
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Drag slider to test accelerated goal completion timelines
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SavingsIcon />}
                      onClick={() => {
                        setSelectedGoal(goal);
                        setContributeAmount('');
                        setOpenContribute(true);
                      }}
                      sx={{ borderColor: categoryMeta.color, color: categoryMeta.color }}
                    >
                      Contribute
                    </Button>
                    <Tooltip title="Delete Goal">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteGoal(goal.id, goal.name)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </GridTyped>
          );
        })}
      </GridTyped>

      {/* Modal: Create New Goal */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Savings Goal</DialogTitle>
          <DialogContent dividers>
            <TextField
              fullWidth
              required
              label="Goal Name"
              placeholder="e.g. Down Payment on Home"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <GridTyped container spacing={2} sx={{ mb: 2 }}>
              <GridTyped item xs={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Target Amount (₹)"
                  value={targetAmount}
                  helperText="Min: ₹1,000 • Max: ₹50 Cr"
                  inputProps={{ min: 1000, max: 500000000 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'primary.main' }}>₹</Typography>,
                  }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 500000000) {
                      setTargetAmount('500000000');
                    } else {
                      setTargetAmount(e.target.value);
                    }
                  }}
                />
              </GridTyped>
              <GridTyped item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Initial Amount (₹)"
                  value={currentAmount}
                  helperText="Min: ₹0 • Max: Target"
                  inputProps={{ min: 0, max: 500000000 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'text.secondary' }}>₹</Typography>,
                  }}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 500000000) {
                      setCurrentAmount('500000000');
                    } else {
                      setCurrentAmount(e.target.value);
                    }
                  }}
                />
              </GridTyped>
            </GridTyped>
            <TextField
              fullWidth
              type="date"
              label="Target Completion Date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <GridTyped container spacing={2}>
              <GridTyped item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categoryOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </GridTyped>
              <GridTyped item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                >
                  {priorityOptions.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </TextField>
              </GridTyped>
            </GridTyped>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCreate(false)} disabled={createSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createSubmitting}
              sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}
            >
              {createSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Contribute to Goal */}
      <Dialog open={openContribute} onClose={() => setOpenContribute(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleContributeSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Contribute to Goal</DialogTitle>
          <DialogContent dividers>
            {selectedGoal && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Contributing towards:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedGoal.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                  Current: ₹{selectedGoal.currentAmount.toLocaleString('en-IN')} / Target: ₹{selectedGoal.targetAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
            )}
            <TextField
              fullWidth
              required
              autoFocus
              type="number"
              label="Contribution Amount (₹)"
              value={contributeAmount}
              helperText="Min: ₹100 • Max: ₹1 Cr • Advances goal completion date"
              inputProps={{ min: 100, max: 10000000 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: 'success.main' }}>₹</Typography>,
              }}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 10000000) {
                  setContributeAmount('10000000');
                } else {
                  setContributeAmount(e.target.value);
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenContribute(false)} disabled={contributeSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={contributeSubmitting}
              sx={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              {contributeSubmitting ? 'Recording...' : 'Record Contribution'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Goals;
