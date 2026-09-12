'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingDown,
  AttachMoney,
  CalendarToday,
  Speed,
  RocketLaunch,
} from '@mui/icons-material';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useCurrency } from '@/context/CurrencyContext';

const GridTyped = Grid as any;

interface DebtItem {
  id: number;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  type: string;
}

const initialDebts: DebtItem[] = [
  { id: 1, name: 'High-APR Credit Card 1', balance: 3500, rate: 22.9, minPayment: 110, type: 'Credit Card' },
  { id: 2, name: 'Store Retail Card', balance: 1800, rate: 25.4, minPayment: 75, type: 'Credit Card' },
  { id: 3, name: 'Personal Consolidation Loan', balance: 8000, rate: 12.5, minPayment: 220, type: 'Personal Loan' },
  { id: 4, name: 'Auto Financing', balance: 14500, rate: 7.2, minPayment: 320, type: 'Auto Loan' },
];

const DebtDashboard = () => {
  const theme = useTheme();
  const { currency, formatAmount } = useCurrency();
  const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('avalanche');
  const [extraPaymentUSD, setExtraPaymentUSD] = useState<number>(150);

  const debts = initialDebts;
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const weightedAvgRate = debts.reduce((sum, debt) => sum + debt.rate * debt.balance, 0) / (totalDebt || 1);

  // Simulation engine
  const simulateStrategy = (strategy: 'snowball' | 'avalanche', extraAmount: number) => {
    const list = debts.map((d) => ({ ...d }));
    list.sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance;
      }
      return b.rate - a.rate;
    });

    let months = 0;
    let totalInterestPaid = 0;
    let extraAvailable = extraAmount;
    const projection: { month: number; remaining: number }[] = [];

    while (list.some((d) => d.balance > 0) && months < 120) {
      months++;
      let extraThisMonth = extraAvailable;

      for (const item of list) {
        if (!item || item.balance <= 0) continue;

        const monthlyRate = item.rate / 1200;
        const interest = item.balance * monthlyRate;
        totalInterestPaid += interest;

        const payment = Math.min(item.balance + interest, item.minPayment);
        item.balance = item.balance + interest - payment;

        if (item.balance <= 0) {
          extraAvailable += item.minPayment;
        }
      }

      // Apply extra payment to top prioritized active debt
      const targetDebt = list.find((d) => d.balance > 0);
      if (targetDebt && extraThisMonth > 0) {
        const principalPay = Math.min(targetDebt.balance, extraThisMonth);
        targetDebt.balance -= principalPay;
        if (targetDebt.balance <= 0) {
          extraAvailable += targetDebt.minPayment;
        }
      }

      const currentRemaining = list.reduce((sum, d) => sum + Math.max(0, d.balance), 0);
      if (months <= 36 || currentRemaining <= 0) {
        projection.push({ month: months, remaining: Math.round(currentRemaining) });
      }

      if (currentRemaining <= 0) break;
    }

    return {
      months,
      totalInterestPaid: Math.round(totalInterestPaid),
      projection,
    };
  };

  const currentResult = simulateStrategy(payoffStrategy, extraPaymentUSD);
  const baselineResult = simulateStrategy(payoffStrategy, 0);
  const avalancheResult = simulateStrategy('avalanche', extraPaymentUSD);
  const snowballResult = simulateStrategy('snowball', extraPaymentUSD);

  const interestSavedByPrepayment = Math.max(0, baselineResult.totalInterestPaid - currentResult.totalInterestPaid);
  const monthsSavedByPrepayment = Math.max(0, baselineResult.months - currentResult.months);
  const interestSavedByAvalanche = Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid);

  // Sorted debts for the table
  const sortedDebts = [...debts].sort((a, b) => {
    if (payoffStrategy === 'snowball') {
      return a.balance - b.balance;
    }
    return b.rate - a.rate;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
          💳 Debt Optimization & Accelerated Payoff
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Mathematically eliminate high-cost liabilities using automated Avalanche and Snowball algorithms with prepayment acceleration.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'error.main' }}>
                <AttachMoney sx={{ mr: 0.5 }} />
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Total Principal Debt
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="error.main">
                {formatAmount(totalDebt)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {debts.length} active credit accounts
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'warning.main' }}>
                <Speed sx={{ mr: 0.5 }} />
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Weighted Avg APR
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="warning.main">
                {weightedAvgRate.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Blended across all credit lines
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'primary.main' }}>
                <CalendarToday sx={{ mr: 0.5 }} />
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Debt-Free Timeline
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="primary.main">
                {currentResult.months} <Typography component="span" variant="h6" fontWeight={700}>Mo</Typography>
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                {monthsSavedByPrepayment > 0 ? `🚀 Saves ${monthsSavedByPrepayment} months vs minimums` : 'At scheduled minimums'}
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'info.main' }}>
                <TrendingDown sx={{ mr: 0.5 }} />
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase' }}>
                  Total Projected Interest
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={900} color="info.main">
                {formatAmount(currentResult.totalInterestPaid)}
              </Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                {interestSavedByPrepayment > 0 ? `💰 Saved ${formatAmount(interestSavedByPrepayment)} in APR charges` : 'Total borrowing cost'}
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Prepayment Simulator & Strategy Switcher Controller */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: 'background.paper',
        }}
      >
        <GridTyped container spacing={3} alignItems="center">
          <GridTyped item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunch color="primary" sx={{ fontSize: 18 }} />
                Extra Monthly Principal Prepayment:
              </Typography>
              <Chip
                label={`+${formatAmount(extraPaymentUSD)} / month`}
                color="primary"
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Box>
            <Slider
              value={extraPaymentUSD}
              min={0}
              max={600}
              step={25}
              onChange={(_: any, val: any) => setExtraPaymentUSD(val as number)}
              marks={[
                { value: 0, label: 'Min Only' },
                { value: 200, label: `+${formatAmount(200)}` },
                { value: 400, label: `+${formatAmount(400)}` },
                { value: 600, label: `+${formatAmount(600)}` },
              ]}
              sx={{ my: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Directing excess cash flow to principal permanently truncates interest compounding.
            </Typography>
          </GridTyped>

          <GridTyped item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  Payoff Methodology
                </Typography>
                <ToggleButtonGroup
                  value={payoffStrategy}
                  exclusive
                  onChange={(_: any, value: any) => value && setPayoffStrategy(value)}
                  size="small"
                >
                  <ToggleButton value="avalanche" sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}>
                    🏔️ Avalanche (Math Optimal)
                  </ToggleButton>
                  <ToggleButton value="snowball" sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}>
                    ⛄ Snowball (Quick Wins)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              >
                <Typography variant="body2" color="text.primary" fontWeight={600}>
                  {payoffStrategy === 'avalanche'
                    ? `Avalanche prioritizes highest APR first. It saves you ${formatAmount(interestSavedByAvalanche)} more than Snowball!`
                    : 'Snowball eliminates smallest balances first to generate immediate psychological dopamine and reduce billing accounts.'}
                </Typography>
              </Box>
            </Box>
          </GridTyped>
        </GridTyped>
      </Paper>

      {/* Data Table & Visualization */}
      <GridTyped container spacing={3}>
        {/* Debt List */}
        <GridTyped item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Prioritized Payoff Order ({payoffStrategy.toUpperCase()})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Every extra dollar is directed to Debt #1 while keeping minimum payments active on all others.
              </Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: (t: any) => `1px solid ${t.palette.divider}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: (t: any) => alpha(t.palette.primary.main, 0.03) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Liability Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Balance</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>APR Rate</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Minimum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedDebts.map((debt, index) => (
                      <TableRow key={debt.id} hover>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            color={index === 0 ? 'success' : 'default'}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {debt.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {debt.type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>{formatAmount(debt.balance)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${debt.rate}%`}
                            size="small"
                            sx={{
                              bgcolor: debt.rate > 18 ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.warning.main, 0.15),
                              color: debt.rate > 18 ? 'error.main' : 'warning.main',
                              fontWeight: 800,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatAmount(debt.minPayment)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </GridTyped>

        {/* Payoff Projection Chart */}
        <GridTyped item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, border: (t: any) => `1px solid ${t.palette.divider}`, bgcolor: 'background.paper', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} gutterBottom>
                Principal Paydown Trajectory
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Simulated month-by-month debt reduction curve.
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={currentResult.projection}>
                  <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                  <Tooltip formatter={(value: any) => [formatAmount(Number(value)), 'Remaining Debt']} />
                  <Line type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>
    </Container>
  );
};

export default DebtDashboard;
