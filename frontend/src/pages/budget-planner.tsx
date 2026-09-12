import React, { useState, useMemo } from 'react';
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
  Alert,
  Chip,
  Stack,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingDown as LeakageIcon,
  Bolt as ShockIcon,
  RestartAlt as ResetIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material';
import { useCurrency } from '../context/CurrencyContext';

type CategoryType = 'needs' | 'wants' | 'savings';

interface BudgetCategory {
  id: string;
  name: string;
  type: CategoryType;
  allocated: number;
  spent: number;
  color: string;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Housing & Rent', type: 'needs', allocated: 2200, spent: 2200, color: '#3b82f6' },
  { id: '2', name: 'Groceries & Utilities', type: 'needs', allocated: 900, spent: 850, color: '#10b981' },
  { id: '3', name: 'Transportation & Fuel', type: 'needs', allocated: 450, spent: 480, color: '#f59e0b' },
  { id: '4', name: 'Dining Out & Entertainment', type: 'wants', allocated: 600, spent: 780, color: '#8b5cf6' },
  { id: '5', name: 'Shopping & Leisure', type: 'wants', allocated: 450, spent: 390, color: '#ec4899' },
  { id: '6', name: 'Emergency Fund & Investments', type: 'savings', allocated: 1200, spent: 1200, color: '#06b6d4' },
  { id: '7', name: 'Debt Prepayment', type: 'savings', allocated: 700, spent: 700, color: '#6366f1' },
];

const PRESETS: Record<string, { label: string; income: number; categories: BudgetCategory[] }> = {
  balanced: {
    label: 'Balanced 50/30/20',
    income: 6500,
    categories: [
      { id: '1', name: 'Housing & Rent', type: 'needs', allocated: 2200, spent: 2200, color: '#3b82f6' },
      { id: '2', name: 'Groceries & Utilities', type: 'needs', allocated: 700, spent: 680, color: '#10b981' },
      { id: '3', name: 'Healthcare & Transport', type: 'needs', allocated: 350, spent: 340, color: '#f59e0b' },
      { id: '4', name: 'Dining & Entertainment', type: 'wants', allocated: 1150, spent: 1050, color: '#8b5cf6' },
      { id: '5', name: 'Personal & Subscriptions', type: 'wants', allocated: 800, spent: 720, color: '#ec4899' },
      { id: '6', name: 'Emergency Fund & Savings', type: 'savings', allocated: 800, spent: 800, color: '#06b6d4' },
      { id: '7', name: 'Investments / Retirement', type: 'savings', allocated: 500, spent: 500, color: '#6366f1' },
    ],
  },
  fire: {
    label: 'Frugal FIRE (30/15/55)',
    income: 7000,
    categories: [
      { id: '1', name: 'Minimal Housing', type: 'needs', allocated: 1400, spent: 1400, color: '#3b82f6' },
      { id: '2', name: 'Groceries & Essentials', type: 'needs', allocated: 500, spent: 480, color: '#10b981' },
      { id: '3', name: 'Basic Transit', type: 'needs', allocated: 200, spent: 180, color: '#f59e0b' },
      { id: '4', name: 'Modest Leisure', type: 'wants', allocated: 600, spent: 550, color: '#8b5cf6' },
      { id: '5', name: 'Aggressive Index Fund Stash', type: 'savings', allocated: 3000, spent: 3000, color: '#06b6d4' },
      { id: '6', name: 'Emergency Treasury Buffer', type: 'savings', allocated: 1300, spent: 1300, color: '#6366f1' },
    ],
  },
  debtPayoff: {
    label: 'Aggressive Debt Avalanche',
    income: 6000,
    categories: [
      { id: '1', name: 'Housing & Utilities', type: 'needs', allocated: 2000, spent: 2000, color: '#3b82f6' },
      { id: '2', name: 'Survival Groceries', type: 'needs', allocated: 600, spent: 580, color: '#10b981' },
      { id: '3', name: 'Discretionary Bare Bones', type: 'wants', allocated: 400, spent: 380, color: '#8b5cf6' },
      { id: '4', name: 'Highest APR Debt Attack', type: 'savings', allocated: 2200, spent: 2200, color: '#ef4444' },
      { id: '5', name: 'Starter Emergency Buffer', type: 'savings', allocated: 800, spent: 800, color: '#06b6d4' },
    ],
  },
};

const BudgetPlanner = () => {
  const { currencyInfo, formatAmount } = useCurrency();
  const [totalIncome, setTotalIncome] = useState(6500);
  const [categories, setCategories] = useState<BudgetCategory[]>(DEFAULT_CATEGORIES);

  // Crisis shocks
  const [inflationShock, setInflationShock] = useState(false);
  const [surpriseExpense, setSurpriseExpense] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>('needs');
  const [newCatAllocated, setNewCatAllocated] = useState(300);

  // Calculations
  const effectiveCategories = useMemo(() => {
    return categories.map((cat) => {
      let allocated = cat.allocated;
      let spent = cat.spent;
      if (inflationShock && cat.type === 'needs') {
        spent = Math.round(spent * 1.1);
      }
      return { ...cat, allocated, spent };
    });
  }, [categories, inflationShock]);

  const shockExpenseAmount = surpriseExpense ? (currencyInfo.code === 'INR' ? 40000 : 500) : 0;
  const totalAllocated = effectiveCategories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalSpent = effectiveCategories.reduce((sum, cat) => sum + cat.spent, 0) + shockExpenseAmount;
  const remaining = totalIncome - totalAllocated;

  // 50/30/20 Allocation Totals
  const needsAllocated = effectiveCategories.filter((c) => c.type === 'needs').reduce((s, c) => s + c.allocated, 0);
  const wantsAllocated = effectiveCategories.filter((c) => c.type === 'wants').reduce((s, c) => s + c.allocated, 0);
  const savingsAllocated = effectiveCategories.filter((c) => c.type === 'savings').reduce((s, c) => s + c.allocated, 0);

  const needsPct = totalIncome > 0 ? Math.round((needsAllocated / totalIncome) * 100) : 0;
  const wantsPct = totalIncome > 0 ? Math.round((wantsAllocated / totalIncome) * 100) : 0;
  const savingsPct = totalIncome > 0 ? Math.round((savingsAllocated / totalIncome) * 100) : 0;

  // Discretionary Leakage Detection
  const leakages = effectiveCategories.filter(
    (c) => c.type === 'wants' && c.spent > c.allocated
  );

  // Run-Rate Projection (assuming middle of monthly cycle ~ day 15 of 30)
  const daysInMonth = 30;
  const currentDay = 15;
  const projectedMonthEndSpend = Math.round((totalSpent / currentDay) * daysInMonth);
  const projectedNetCashflow = totalIncome - projectedMonthEndSpend;

  const handleCategoryUpdate = (id: string, field: 'allocated' | 'spent', value: number) => {
    setCategories(
      categories.map((cat) => (cat.id === id ? { ...cat, [field]: Math.max(0, value) } : cat))
    );
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
    const newCat: BudgetCategory = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      type: newCatType,
      allocated: newCatAllocated,
      spent: 0,
      color: colors[categories.length % colors.length] ?? '#3b82f6',
    };
    setCategories([...categories, newCat]);
    setDialogOpen(false);
    setNewCatName('');
    setNewCatAllocated(300);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleApplyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setTotalIncome(preset.income);
    setCategories(preset.categories);
    setInflationShock(false);
    setSurpriseExpense(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Bar */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="800">
            💰 Zero-Based Budget &amp; Cash Flow Forecaster
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enforce the 50/30/20 standard, detect discretionary leakages, and stress-test month-end cash flows.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {Object.entries(PRESETS).map(([key, p]) => (
            <Button
              key={key}
              size="small"
              variant="outlined"
              onClick={() => handleApplyPreset(key)}
              sx={{ borderRadius: 2, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {p.label}
            </Button>
          ))}
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ borderRadius: 2, fontSize: '0.75rem', textTransform: 'none' }}
          >
            Add Line Item
          </Button>
        </Stack>
      </Box>

      {/* Top 4 KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                MONTHLY NET INCOME
              </Typography>
              <Typography variant="h4" fontWeight="900" color="primary.main">
                {formatAmount(totalIncome)}
              </Typography>
              <TextField
                size="small"
                type="number"
                value={totalIncome}
                onChange={(e) => setTotalIncome(Math.max(0, Number(e.target.value)))}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1, fontSize: '0.8rem', color: 'text.secondary' }}>{currencyInfo.symbol}</Typography>,
                }}
                sx={{ mt: 1.5, '& input': { py: 0.6, fontSize: '0.85rem' } }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                TOTAL ALLOCATED
              </Typography>
              <Typography variant="h4" fontWeight="900">
                {formatAmount(totalAllocated)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {((totalAllocated / (totalIncome || 1)) * 100).toFixed(0)}% of income planned
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                MTD ACTUAL SPENT
              </Typography>
              <Typography variant="h4" fontWeight="900" color={totalSpent > totalAllocated ? 'error.main' : 'text.primary'}>
                {formatAmount(totalSpent)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Day {currentDay} of {daysInMonth} burn rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: remaining === 0 ? 'success.main' : remaining > 0 ? 'info.main' : 'error.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? remaining === 0
                    ? 'rgba(16,185,129,0.08)'
                    : remaining > 0
                      ? 'rgba(59,130,246,0.08)'
                      : 'rgba(239,68,68,0.08)'
                  : remaining === 0
                    ? '#ecfdf5'
                    : remaining > 0
                      ? '#eff6ff'
                      : '#fef2f2',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                ZERO-BASED UNALLOCATED
              </Typography>
              <Typography variant="h4" fontWeight="900" color={remaining === 0 ? 'success.main' : remaining > 0 ? 'info.main' : 'error.main'}>
                {formatAmount(remaining)}
              </Typography>
              <Typography variant="caption" fontWeight="700" color={remaining === 0 ? 'success.main' : remaining > 0 ? 'info.main' : 'error.main'}>
                {remaining === 0 ? '✓ Every Dollar Assigned!' : remaining > 0 ? `Assign ${formatAmount(remaining)} to reach zero` : '⚠️ Budget over-allocated!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 50/30/20 Standard Rule Benchmark Bar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="800">
            📊 50 / 30 / 20 Rule Audit
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Target: 50% Needs • 30% Wants • 20% Savings &amp; Debt
          </Typography>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="700">
                  Needs ({formatAmount(needsAllocated)})
                </Typography>
                <Chip
                  size="small"
                  label={`${needsPct}% (Goal: 50%)`}
                  color={needsPct <= 50 ? 'success' : needsPct <= 60 ? 'warning' : 'error'}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, needsPct)}
                sx={{ height: 6, borderRadius: 3, mt: 1.5 }}
                color={needsPct <= 50 ? 'success' : 'warning'}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="700">
                  Wants ({formatAmount(wantsAllocated)})
                </Typography>
                <Chip
                  size="small"
                  label={`${wantsPct}% (Goal: 30%)`}
                  color={wantsPct <= 30 ? 'success' : wantsPct <= 35 ? 'warning' : 'error'}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, wantsPct)}
                sx={{ height: 6, borderRadius: 3, mt: 1.5 }}
                color={wantsPct <= 30 ? 'primary' : 'error'}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="700">
                  Savings &amp; Debt ({formatAmount(savingsAllocated)})
                </Typography>
                <Chip
                  size="small"
                  label={`${savingsPct}% (Goal: 20%)`}
                  color={savingsPct >= 20 ? 'success' : 'warning'}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, savingsPct)}
                sx={{ height: 6, borderRadius: 3, mt: 1.5 }}
                color={savingsPct >= 20 ? 'success' : 'warning'}
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Discretionary Leakage Alerts */}
      {leakages.length > 0 && (
        <Alert
          severity="error"
          icon={<LeakageIcon />}
          sx={{ mb: 4, borderRadius: 3, fontWeight: 600 }}
        >
          <strong>⚠️ Discretionary Spending Leakage Detected:</strong>{' '}
          {leakages.map((l) => `${l.name} is ${formatAmount(l.spent - l.allocated)} over allocated limit`).join(', ')}.
          Consider trimming non-essential dining/subscriptions for the remainder of this month.
        </Alert>
      )}

      {/* Stress-Tester & Cash Flow Forecast Bar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle1" fontWeight="800" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShockIcon color="warning" />
              Real-Time Crisis Shock Stress-Tester
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Test how sudden macroeconomic shocks impact your monthly cash flow before they happen.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant={inflationShock ? 'contained' : 'outlined'}
                color="warning"
                onClick={() => setInflationShock(!inflationShock)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {inflationShock ? '✓ 10% Inflation Active' : '+10% Essentials Inflation'}
              </Button>
              <Button
                size="small"
                variant={surpriseExpense ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setSurpriseExpense(!surpriseExpense)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                {surpriseExpense ? `✓ ${formatAmount(shockExpenseAmount)} Shock Active` : `+${formatAmount(shockExpenseAmount || (currencyInfo.code === 'INR' ? 40000 : 500))} Surprise Emergency`}
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                PROJECTED MONTH-END CASH FLOW (AT CURRENT BURN RATE)
              </Typography>
              <Typography variant="h5" fontWeight="900" color={projectedNetCashflow >= 0 ? 'success.main' : 'error.main'} sx={{ mt: 0.5 }}>
                {projectedNetCashflow >= 0 ? `+${formatAmount(projectedNetCashflow)} Surplus` : `${formatAmount(projectedNetCashflow)} Deficit`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Projected total spend: {formatAmount(projectedMonthEndSpend)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts: Allocation Pie + Budget vs Actual Bar */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Planned Allocation Breakdown
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={effectiveCategories.map((c) => ({ name: c.name, value: c.allocated }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {effectiveCategories.map((c, i) => (
                        <Cell key={i} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatAmount(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="700" gutterBottom>
                Budget Allocated vs Actual Spent ({currencyInfo.code})
              </Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={effectiveCategories.map((c) => ({
                      name: c.name.split(' ')[0],
                      allocated: c.allocated,
                      spent: c.spent,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v) => formatAmount(v, { compact: true })} />
                    <Tooltip formatter={(v: any) => formatAmount(Number(v))} />
                    <Legend />
                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="#10b981" name="Actual Spent" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Details & Interactive Controls */}
      <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 3.5 }}>
          <Typography variant="h6" fontWeight="800" gutterBottom>
            Interactive Budget Line Items
          </Typography>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {effectiveCategories.map((category) => {
              const percentSpent = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0;
              const isOverBudget = category.spent > category.allocated;
              const isWarning = percentSpent >= 80 && !isOverBudget;

              return (
                <Paper
                  key={category.id}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: isOverBudget ? 'error.main' : isWarning ? 'warning.main' : 'divider',
                    bgcolor: 'background.default',
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: category.color }} />
                        <Typography variant="subtitle2" fontWeight="700">
                          {category.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={category.type.toUpperCase()}
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                      </Stack>
                      <Typography variant="caption" color={isOverBudget ? 'error.main' : 'text.secondary'} sx={{ mt: 0.5, display: 'block' }}>
                        {percentSpent.toFixed(0)}% utilized • {isOverBudget ? `Over by ${formatAmount(category.spent - category.allocated)}` : `${formatAmount(category.allocated - category.spent)} remaining`}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, percentSpent)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: isOverBudget ? '#ef4444' : isWarning ? '#f59e0b' : category.color,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
                        <TextField
                          size="small"
                          type="number"
                          label="Plan"
                          value={category.allocated}
                          onChange={(e) => handleCategoryUpdate(category.id, 'allocated', Number(e.target.value))}
                          sx={{ width: 100, '& input': { py: 0.6, fontSize: '0.8rem' } }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Spent"
                          value={category.spent}
                          onChange={(e) => handleCategoryUpdate(category.id, 'spent', Number(e.target.value))}
                          sx={{ width: 100, '& input': { py: 0.6, fontSize: '0.8rem' } }}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Budget Line Item</DialogTitle>
        <DialogContent sx={{ minWidth: 320, pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Category Name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Pet Care, Cloud Subscriptions"
            />

            <FormControl fullWidth>
              <InputLabel>Category Type</InputLabel>
              <Select
                value={newCatType}
                label="Category Type"
                onChange={(e) => setNewCatType(e.target.value as CategoryType)}
              >
                <MenuItem value="needs">Needs (Essential Living)</MenuItem>
                <MenuItem value="wants">Wants (Discretionary)</MenuItem>
                <MenuItem value="savings">Savings / Debt Repayment</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label={`Monthly Plan (${currencyInfo.symbol})`}
              value={newCatAllocated}
              onChange={(e) => setNewCatAllocated(Number(e.target.value))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCategory}>
            Save Line Item
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BudgetPlanner;

