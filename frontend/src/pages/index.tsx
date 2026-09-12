import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  useTheme,
  Avatar,
  Paper,
  Slider,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Security,
  TrendingDown,
  AccountBalanceWallet,
  Psychology,
  ArrowForward,
  Shield,
  BarChart,
  Bolt,
  Check,
  Close,
  Star,
  Speed,
  Storage,
  Lock,
  PhoneIphone,
  School,
  WorkOutline,
} from '@mui/icons-material';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function Home() {
  const theme = useTheme();
  const { currency, currencyInfo, setCurrency, formatAmount } = useCurrency();

  // Interactive Hero Runway Calculator state
  const [calcIncome, setCalcIncome] = useState(5500);
  const [calcExpenses, setCalcExpenses] = useState(3200);
  const [calcSavings, setCalcSavings] = useState(12000);

  const calculatedRunway = calcExpenses > 0 ? (calcSavings / calcExpenses).toFixed(1) : '0';
  const runwayNumber = Number(calculatedRunway);

  const runwayStatus =
    runwayNumber >= 6
      ? { label: 'Fortress Safety (6+ Months)', color: 'success' as const }
      : runwayNumber >= 3
        ? { label: 'Standard Buffer (3-6 Months)', color: 'primary' as const }
        : { label: 'High Layoff Vulnerability (<3 Months)', color: 'error' as const };

  return (
    <>
      <Head>
        <title>FINFOLIO | AI Financial Resilience &amp; Safety Net Platform</title>
        <meta
          name="description"
          content="Production-ready financial resilience platform. Calculate your layoff runway, optimize zero-based budgets, simulate debt avalanche payoffs, and pivot tech careers."
        />
      </Head>

      {/* HERO SECTION */}
      <Box
        sx={{
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #f8fafc 0%, rgba(238, 242, 255, 0.7) 100%)'
              : 'linear-gradient(135deg, #080c14 0%, #0f172a 100%)',
          pt: { xs: 6, md: 10 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={5} alignItems="center">
            {/* Hero Left Copy */}
            <Grid item xs={12} lg={6}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<Bolt sx={{ fontSize: 16 }} />}
                    label="Deterministic Financial Defense"
                    sx={{
                      fontWeight: 800,
                      background: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  />
                  {/* Strictly Indian Currency Indicator */}
                  <Chip
                    size="small"
                    label="₹ INR (Indian Rupee Only)"
                    sx={{
                      fontWeight: 800,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: 'success.main',
                      border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                      fontSize: '0.75rem',
                      px: 0.5,
                    }}
                  />
                </Box>

                <Typography
                  variant="h2"
                  component="h1"
                  fontWeight="900"
                  sx={{
                    fontSize: { xs: '2.4rem', md: '3.5rem' },
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                  }}
                >
                  Build Your Safety Net
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Before the Market Shifts
                  </Box>
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.75 }}>
                  In volatile macroeconomic times, FINFOLIO transforms scattered personal finances into an airtight safety net. Calculate exact layoff runway, automate zero-based cash flow, eliminate high-interest debt, and pivot into high-demand career skills.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    href="/dashboard"
                    endIcon={<ArrowForward />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 800 }}
                  >
                    Open Live Command Center
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    href="/assessment"
                    sx={{ px: 3.5, py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Run Layoff Audit
                  </Button>
                </Stack>

                {/* Trust Badges */}
                <Stack direction="row" spacing={3} sx={{ pt: 2, opacity: 0.85 }} flexWrap="wrap">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Lock sx={{ fontSize: 18, color: 'success.main' }} />
                    <Typography variant="caption" fontWeight={700}>AES-256 Storage</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Storage sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight={700}>PostgreSQL Persistence</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <PhoneIphone sx={{ fontSize: 18, color: 'info.main' }} />
                    <Typography variant="caption" fontWeight={700}>Installable PWA</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            {/* Hero Right: Interactive Live Runway Calculator */}
            <Grid item xs={12} lg={6}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: { xs: 2.5, md: 4 },
                  bgcolor: 'background.paper',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 25px 50px -12px rgba(0,0,0,0.7)'
                      : '0 25px 50px -12px rgba(0,0,0,0.1)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Shield color="primary" />
                    <Typography variant="subtitle1" fontWeight={800}>
                      Interactive Runway Tester
                    </Typography>
                  </Stack>
                  <Chip
                    label={runwayStatus.label}
                    color={runwayStatus.color}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                {/* Big Metric Display */}
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(30,58,138,0.2)' : '#eff6ff',
                    border: '1px solid',
                    borderColor: 'primary.main',
                    mb: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight="700">
                    CALCULATED SURVIVAL RUNWAY
                  </Typography>
                  <Typography variant="h2" fontWeight="900" color="primary.main" sx={{ my: 0.5 }}>
                    {calculatedRunway} <Typography component="span" variant="h5">Months</Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on {formatAmount(calcSavings)} emergency savings against {formatAmount(calcExpenses)}/mo burn
                  </Typography>
                </Paper>

                {/* Sliders */}
                <Stack spacing={2.5}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight="700">Monthly Net Income</Typography>
                      <Typography variant="caption" fontWeight="800" color="primary.main">
                        {formatAmount(calcIncome)}
                      </Typography>
                    </Stack>
                    <Slider
                      size="small"
                      value={calcIncome}
                      min={1000}
                      max={15000}
                      step={250}
                      onChange={(_, val) => setCalcIncome(val as number)}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight="700">Monthly Living Expenses</Typography>
                      <Typography variant="caption" fontWeight="800" color="error.main">
                        {formatAmount(calcExpenses)}
                      </Typography>
                    </Stack>
                    <Slider
                      size="small"
                      value={calcExpenses}
                      min={800}
                      max={10000}
                      step={100}
                      onChange={(_, val) => setCalcExpenses(val as number)}
                      color="error"
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" fontWeight="700">Liquid Emergency Reserves</Typography>
                      <Typography variant="caption" fontWeight="800" color="success.main">
                        {formatAmount(calcSavings)}
                      </Typography>
                    </Stack>
                    <Slider
                      size="small"
                      value={calcSavings}
                      min={0}
                      max={50000}
                      step={500}
                      onChange={(_, val) => setCalcSavings(val as number)}
                      color="success"
                    />
                  </Box>
                </Stack>

                <Button
                  fullWidth
                  variant="contained"
                  component={Link}
                  href="/assessment"
                  sx={{ mt: 3, py: 1.2, borderRadius: 2.5, fontWeight: 800 }}
                >
                  Run Deep Resilience Stress-Test ➔
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4 CRITICAL CRISIS SCENARIOS */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="caption" color="primary.main" fontWeight="800" letterSpacing={1.5}>
              CRITICAL SCENARIO READINESS
            </Typography>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 0.5 }}>
              Engineered for Real-World Financial Emergencies
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
                  <TrendingDown />
                </Avatar>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  1. Tech Layoff Defense
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instant survival mode cuts discretionary burn by 35%, stretching 3-month savings to 5.2 months while you interview.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mb: 2 }}>
                  <BarChart />
                </Avatar>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  2. Inflation &amp; Rate Shock
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Stress-test grocery, fuel, and utility bills against 10% inflation spikes with dynamic purchasing power protection.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                  <AccountBalanceWallet />
                </Avatar>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  3. Debt Avalanche Engine
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prioritize balances by APR to eliminate costly interest drag, freeing up monthly cash flow for emergency savings.
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 3 }}>
                <Avatar sx={{ bgcolor: 'success.main', mb: 2 }}>
                  <School />
                </Avatar>
                <Typography variant="h6" fontWeight="800" gutterBottom>
                  4. Career Pivot &amp; Skills
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect your financial runway to high-demand technical roles, quantifying missing skills and learning roadmaps.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* PLATFORM COMPARISON MATRIX */}
      <Box sx={{ py: 10, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="caption" color="primary.main" fontWeight="800" letterSpacing={1.5}>
              WHY FINFOLIO WINS
            </Typography>
            <Typography variant="h4" fontWeight="800" sx={{ mt: 0.5 }}>
              Spreadsheets vs Traditional Apps vs FINFOLIO
            </Typography>
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Feature / Capability</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Spreadsheets</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Traditional Banking Apps</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'primary.main' }}>FINFOLIO AI Platform</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { feature: 'Layoff Runway & Emergency Stress-Testing', sheets: false, banks: false, finfolio: true },
                  { feature: 'Zero-Based Cash Flow Budgeting (50/30/20)', sheets: 'Manual', banks: false, finfolio: true },
                  { feature: 'Debt Avalanche vs Snowball Simulator', sheets: 'Complex formulas', banks: false, finfolio: true },
                  { feature: 'AI Career Resilience & Skill Gap Trainer', sheets: false, banks: false, finfolio: true },
                  { feature: 'Multi-Currency Conversion (USD, INR, EUR, GBP)', sheets: 'Fragile', banks: 'No', finfolio: true },
                  { feature: 'Data Privacy & Zero Ad Tracking', sheets: true, banks: false, finfolio: true },
                ].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 600 }}>{row.feature}</TableCell>
                    <TableCell align="center">
                      {typeof row.sheets === 'boolean' ? (
                        row.sheets ? <Check color="success" /> : <Close color="error" />
                      ) : (
                        <Typography variant="caption">{row.sheets}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {typeof row.banks === 'boolean' ? (
                        row.banks ? <Check color="success" /> : <Close color="error" />
                      ) : (
                        <Typography variant="caption">{row.banks}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Check color="primary" sx={{ fontWeight: 900 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* ARCHITECTURE & PRODUCTION CREDENTIALS */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} textAlign="center">
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight="900" color="primary.main">
                  27
                </Typography>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  POSTGRES TABLES
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight="900" color="success.main">
                  &lt;50ms
                </Typography>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  API LATENCY
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight="900" color="warning.main">
                  100%
                </Typography>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  OFFLINE PWA
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h4" fontWeight="900" color="info.main">
                  3 ML
                </Typography>
                <Typography variant="caption" fontWeight="700" color="text.secondary">
                  PREDICTIVE MODELS
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

