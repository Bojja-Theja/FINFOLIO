'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
  Button,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Stack,
  useTheme,
  Grid
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

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
  ResponsiveContainer
} from 'recharts';

import {
  AccountBalance,
  TrendingUp,
  Savings,
  ShowChart,
  Shield,
  Refresh,
  CheckCircle,
  Info,
  Warning
} from '@mui/icons-material';

import { useAuth } from '@/context/AuthContext';
import api from '@/utils/axiosClient';

interface AllocationData {
  allocation: {
    sipPercentage: number;
    stocksPercentage: number;
    bondsPercentage: number;
    lifestylePercentage: number;
    emergencyFundPercentage: number;
    allocatedAmounts: {
      sip: number;
      stocks: number;
      bonds: number;
      lifestyle: number;
      emergency: number;
    };
    reasoning: string[];
  };
  formulas: {
    sipCagr: number;
    emergencyMonths: number;
    debtToIncome: number;
    savingsRate: number;
    investmentRiskScore: number;
    stabilityIndex: number;
  };
  requiresOnboarding?: boolean;
  note?: string;
}

//
// --------------------------- VALIDATION ---------------------------
//

function isValidAllocationResponse(data: any): boolean {
  if (!data?.allocation || !data?.formulas) return false;

  const a = data.allocation;
  const f = data.formulas;

  const allocationKeys = [
    "sipPercentage", "stocksPercentage", "bondsPercentage",
    "lifestylePercentage", "emergencyFundPercentage",
    "allocatedAmounts", "reasoning"
  ];

  const formulaKeys = [
    "sipCagr", "emergencyMonths", "debtToIncome",
    "savingsRate", "investmentRiskScore", "stabilityIndex"
  ];

  for (let k of allocationKeys) if (!(k in a)) return false;
  for (let k of formulaKeys) if (!(k in f)) return false;

  const amountKeys = ["sip", "stocks", "bonds", "lifestyle", "emergency"];
  if (!a.allocatedAmounts) return false;

  for (let k of amountKeys) if (!(k in a.allocatedAmounts)) return false;

  return true;
}

//
// --------------------------- SAMPLE FALLBACK ---------------------------
//

function generateSampleFallback(sample: any): AllocationData {
  const monthlyIncome = Number(sample.monthlyIncome) || 60000;
  const monthlyExpenses = Number(sample.monthlyExpenses) || 25000;
  const emergency = Number(sample.emergencyFund) || 50000;

  return {
    allocation: {
      sipPercentage: 30,
      stocksPercentage: 20,
      bondsPercentage: 15,
      lifestylePercentage: 25,
      emergencyFundPercentage: 10,
      allocatedAmounts: {
        sip: sample.investmentHistory?.sip || 5000,
        stocks: sample.investmentHistory?.stocks || 12000,
        bonds: sample.investmentHistory?.bonds || 4000,
        lifestyle: Math.round(monthlyExpenses * 0.25),
        emergency
      },
      reasoning: ["Using Sample Data (Backend Not Responding)"]
    },
    formulas: {
      sipCagr: sample.estimatedSipCagr || 10,
      emergencyMonths: +(emergency / (monthlyExpenses || 1)).toFixed(1),
      debtToIncome: +(sample.totalDebt / (monthlyIncome || 1) || 0).toFixed(2),
      savingsRate: +(((monthlyIncome - monthlyExpenses) / (monthlyIncome || 1)) * 100).toFixed(1),
      investmentRiskScore: sample.riskScore || 5,
      stabilityIndex: sample.stabilityIndex || 65
    }
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

//
// --------------------------- MAIN COMPONENT ---------------------------
//

export default function Allocation() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user || user.isGuest;

  const [data, setData] = useState<AllocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [requiresRegistration, setRequiresRegistration] = useState(false);

  //
  // --------------------------- FETCH LOGIC ---------------------------
  //

  const fetchAllocationData = async () => {
    try {
      setLoading(true);
      setError(null);
      setRequiresRegistration(false);

      const backendUrl = api.defaults.baseURL || 'https://capstack-2k25-backend.onrender.com';
      const endpoint = '/finance/asset-allocation';
      const fullUrl = new URL(endpoint, backendUrl).toString();
      console.log('Fetching allocation from:', fullUrl);

      try {
        // Use absolute URL to avoid any baseURL/path issues in production bundles
        const response = await api.get(fullUrl);

        // Backend returned an error format
        if (response.data?.error || response.data?.message || response.data?.success === false) {
          throw new Error(response.data.error || response.data.message || "Invalid backend response");
        }

        // Validation failed
        if (!isValidAllocationResponse(response.data)) {
          throw new Error("Backend returned incomplete allocation data");
        }

        // Check if user needs to complete onboarding
        if (response.data.requiresOnboarding) {
          setRequiresRegistration(true);
          setError(response.data.note || "Complete your profile to get personalized allocation recommendations.");
        }

        setData(response.data);
      } catch (apiError: any) {
        // Provide detailed error information
        console.error("Asset Allocation API Error:", apiError);
        console.error("Error details:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          url: apiError.config?.url,
          baseURL: apiError.config?.baseURL,
          message: apiError.message,
          responseData: apiError.response?.data,
        });
        throw apiError;
      }
    } catch (err: any) {
      console.error("Asset Allocation API Failed:", err);

      // Check if this is a 403 error requiring registration
      if (err.response?.status === 403 && err.response?.data?.requiresRegistration) {
        setRequiresRegistration(true);
        setError("This advanced feature requires a full account. Please register with your email to access AI-powered asset allocation.");
        setLoading(false);
        return;
      }

      // Handle connection errors
      if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.message?.includes('timeout')) {
        setError(`Connection Error: Unable to reach the backend server at ${api.defaults.baseURL || 'https://capstack-2k25-backend.onrender.com'}. The server may be starting up. Please try again in a moment.`);
      } else if (err.response?.status === 404) {
        // 404 error - endpoint not found
        const url = err.config?.url || '/finance/asset-allocation';
        const baseUrl = err.config?.baseURL || api.defaults.baseURL || 'https://capstack-2k25-backend.onrender.com';
        console.error("404 Debug Info:", {
          requestUrl: url,
          baseURL: baseUrl,
          fullUrl: new URL(url || '/finance/asset-allocation', baseUrl).toString(),
          availableEndpoints: [
            '/finance/health',
            '/finance/asset-allocation',
            '/auth/guest-login'
          ]
        });
        setError(`Endpoint not found (404): The API endpoint ${url} does not exist on the backend at ${baseUrl}. Available endpoints: /finance/asset-allocation, /finance/health`);
      } else if (err.response?.status >= 500) {
        setError(`Server Error (${err.response?.status}): The backend server encountered an error. Please try again.`);
      } else {
        setError(err.message || `Unknown error occurred. Please ensure the backend is running at ${api.defaults.baseURL || 'https://capstack-2k25-backend.onrender.com'}`);
      }

      // Try sample.json only for non-auth errors
      try {
        const r = await fetch('/data/sample_dataset.json');
        const sample = await r.json();
        setData(generateSampleFallback(sample));
        setError(null); // Clear error since we have sample data
      } catch (fallbackErr) {
        setError("Critical: Unable to load allocation data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocationData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllocationData();
    setTimeout(() => setRefreshing(false), 800);
  };

  //
  // --------------------------- LOADING UI ---------------------------
  //

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6">Calculating your optimal asset allocation...</Typography>
      </Container>
    );
  }

  //
  // --------------------------- ERROR UI ---------------------------
  //

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity={requiresRegistration ? "info" : error.includes("sample") ? "warning" : "error"} sx={{ mb: 4 }}>
          <AlertTitle>
            {requiresRegistration ? "Registration Required" : error.includes("sample") ? "Using Sample Data" : "Backend Error"}
          </AlertTitle>
          {error}
        </Alert>

        <Box textAlign="center">
          {requiresRegistration ? (
            <Stack direction="row" spacing={2} justifyContent="center">
              {data?.requiresOnboarding ? (
                <Button
                  variant="contained"
                  onClick={() => router.push('/onboarding')}
                >
                  Complete Your Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => router.push('/auth/register')}
                  >
                    Register for Full Access
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/auth/login')}
                  >
                    Login
                  </Button>
                </>
              )}
            </Stack>
          ) : (
            <Button variant="contained" onClick={fetchAllocationData}>Retry</Button>
          )}
        </Box>
      </Container>
    );
  }

  if (!data) return null;

  //
  // --------------------------- CHART DATA ---------------------------
  //

  const { allocation, formulas } = data;

  const pieData = [
    { name: 'SIP (Mutual Funds)', value: allocation.sipPercentage, amount: allocation.allocatedAmounts.sip },
    { name: 'Stocks', value: allocation.stocksPercentage, amount: allocation.allocatedAmounts.stocks },
    { name: 'Bonds/FD', value: allocation.bondsPercentage, amount: allocation.allocatedAmounts.bonds },
    { name: 'Lifestyle Spending', value: allocation.lifestylePercentage, amount: allocation.allocatedAmounts.lifestyle },
    { name: 'Emergency Fund', value: allocation.emergencyFundPercentage, amount: allocation.allocatedAmounts.emergency }
  ];

  const barData = [
    { category: 'SIP', amount: allocation.allocatedAmounts.sip },
    { category: 'Stocks', amount: allocation.allocatedAmounts.stocks },
    { category: 'Bonds', amount: allocation.allocatedAmounts.bonds },
    { category: 'Lifestyle', amount: allocation.allocatedAmounts.lifestyle },
    { category: 'Emergency', amount: allocation.allocatedAmounts.emergency }
  ];

  //
  // --------------------------- UI RENDER ---------------------------
  //

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>

      {isGuest && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }} action={<Button color="inherit" size="small" href="/auth/register" variant="contained">Create Account</Button>}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Demo Mode – Create an Account to Unlock Features</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>You&apos;re currently viewing demo asset allocation data. Create an account to get personalized recommendations based on your actual financial profile.</Typography>
          </Box>
        </Alert>
      )}

      {/* ---------------- HEADER ---------------- */}
      <Box sx={{ mb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            position: "relative",
          }}
        >
          <Box sx={{ position: "absolute", top: -40, right: -40, opacity: 0.08 }}>
            <AccountBalance sx={{ fontSize: 180 }} />
          </Box>

          <Typography variant="h3" fontWeight="800">
            AI Asset Allocation
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Personalized portfolio optimization based on your financial profile
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={
                <Refresh
                  sx={{
                    transform: refreshing ? "rotate(360deg)" : "none",
                    transition: "0.6s",
                  }}
                />
              }
              onClick={handleRefresh}
              sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)" }}
            >
              Recalculate
            </Button>
          </Stack>
        </Paper>
      </Box>

      {/* ---------------- METRICS ---------------- */}

      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ShowChart sx={{ mr: 2, color: "primary.main" }} />
                <Typography variant="h6">Investment Risk Score</Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {formulas.investmentRiskScore}/10
              </Typography>
              <LinearProgress
                variant="determinate"
                value={formulas.investmentRiskScore * 10}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Shield sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Financial Stability</Typography>
              </Box>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {formulas.stabilityIndex}/100
              </Typography>
              <LinearProgress
                variant="determinate"
                color="success"
                value={formulas.stabilityIndex}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Savings sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h6">Savings Rate</Typography>
              </Box>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {(formulas?.savingsRate || 0).toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                color="warning"
                value={formulas.savingsRate}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">SIP CAGR Potential</Typography>
              </Box>
              <Typography variant="h3" color="info.main" fontWeight="bold">
                {(formulas?.sipCagr || 0).toFixed(1)}%
              </Typography>
              <Chip label="10 Year Projection" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* ---------------- CHART SECTION ---------------- */}

      <GridTyped container spacing={4} sx={{ mb: 4 }}>
        {/* PIE */}
        <GridTyped item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Asset Allocation Breakdown
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridTyped>

        {/* BAR */}
        <GridTyped item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Monthly Allocation Amounts
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(v) => `₹${((v || 0) / 1000).toFixed(0)}k`} />
                  <RechartsTooltip formatter={(v: any) => v != null ? `₹${Number(v).toLocaleString()}` : ''} />
                  <Bar dataKey="amount" fill={theme.palette.primary.main} />
                </RechartsBar>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* ---------------- DETAILS ---------------- */}

      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        {pieData.map((item, i) => (
          <GridTyped item xs={12} sm={6} md={4} key={item.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: COLORS[i % COLORS.length],
                      mr: 1
                    }}
                  />
                  <Typography variant="h6">{item.name}</Typography>
                </Box>

                <Typography variant="h4" color="primary" fontWeight="bold">
                  {item.value}%
                </Typography>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  ₹{item.amount.toLocaleString()} / month
                </Typography>

                <Chip
                  label={item.value >= 20 ? "Priority" : "Secondary"}
                  size="small"
                  color={item.value >= 20 ? "primary" : "default"}
                />
              </CardContent>
            </Card>
          </GridTyped>
        ))}
      </GridTyped>

      {/* ---------------- AI REASONING ---------------- */}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            AI Allocation Reasoning
          </Typography>

          <Stack spacing={2}>
            {allocation.reasoning.map((r, i) => (
              <Alert key={i} icon={<Info />} severity="info">
                {r}
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* ---------------- ACTION BUTTONS ---------------- */}

      <Box sx={{ textAlign: "center" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<CheckCircle />}
            onClick={() => alert("Allocation Applied")}
          >
            Apply Allocation
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={handleRefresh}
          >
            Recalculate
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
