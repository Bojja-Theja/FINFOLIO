'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Warning,
  TrendingDown,
  Timeline,
  Assessment,
  Refresh,
  Info,
  MedicalServices,
  BusinessCenter,
  TrendingUp,
  AccountBalance,
  School,
  Work,
  Savings,
  CrisisAlert,
  Lightbulb,
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Styled Components
const SimulatorCard = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
  borderRadius: 16,
  padding: theme.spacing(3),
  height: '100%',
  transition: 'all 0.3s ease'
}));

const ScenarioChip = styled(Chip)<{ severity: 'low' | 'medium' | 'high' | 'critical' }>(({ theme, severity }) => ({
  fontWeight: 'bold',
  '&.low': {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
  },
  '&.medium': {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
  },
  '&.high': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
    border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
  },
  '&.critical': {
    backgroundColor: alpha(theme.palette.error.dark, 0.2),
    color: theme.palette.error.dark,
    border: `1px solid ${alpha(theme.palette.error.dark, 0.4)}`
  }
}));

interface CrisisScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  baseImpact: number;
  duration: number;
  recoveryFactors: string[];
}

interface UserProfile {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  totalDebt: number;
  jobStability: number;
  skillsRelevance: number;
  industry: string;
}

interface SimulationResult {
  survivalMonths: number;
  worstMonth: number;
  recoveryTime: number;
  totalLoss: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  monthlyProjections: Array<{
    month: number;
    income: number;
    expenses: number;
    savings: number;
    cumulativeLoss: number;
  }>;
}

const crisisScenarios: CrisisScenario[] = [
  {
    id: 'job_loss',
    name: 'Job Loss',
    description: 'Sudden unemployment with industry-specific recovery time',
    icon: <Work />,
    baseImpact: 1.0,
    duration: 6,
    recoveryFactors: ['skills_relevance', 'industry_growth', 'age']
  },
  {
    id: 'medical_emergency',
    name: 'Medical Emergency',
    description: 'Unexpected healthcare costs and potential income reduction',
    icon: <MedicalServices />,
    baseImpact: 0.3,
    duration: 3,
    recoveryFactors: ['insurance_coverage', 'health_status', 'support_system']
  },
  {
    id: 'market_crash',
    name: 'Market Crash',
    description: 'Economic downturn affecting investments and job security',
    icon: <TrendingDown />,
    baseImpact: 0.4,
    duration: 12,
    recoveryFactors: ['diversification', 'risk_tolerance', 'emergency_fund']
  },
  {
    id: 'inflation_spike',
    name: 'Inflation Spike',
    description: 'Rapid increase in cost of living eroding purchasing power',
    icon: <Timeline />,
    baseImpact: 0.2,
    duration: 24,
    recoveryFactors: ['income_growth', 'expense_management', 'investments']
  },
  {
    id: 'debt_crisis',
    name: 'Debt Crisis',
    description: 'Unmanageable debt leading to financial stress',
    icon: <AccountBalance />,
    baseImpact: 0.5,
    duration: 18,
    recoveryFactors: ['debt_to_income', 'interest_rates', 'credit_score']
  },
  {
    id: 'business_failure',
    name: 'Business Failure',
    description: 'Entrepreneurial venture collapse with personal liability',
    icon: <BusinessCenter />,
    baseImpact: 0.8,
    duration: 24,
    recoveryFactors: ['business_assets', 'personal_savings', 'support_network']
  }
];

const FinancialCrisisSimulator: React.FC = () => {
  const theme = useTheme();
  const [selectedScenario, setSelectedScenario] = useState<string>('job_loss');
  const [severity, setSeverity] = useState<number>(50);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 35,
    monthlyIncome: 60000,
    monthlyExpenses: 42000,
    emergencyFund: 252000, // 6 months
    totalDebt: 300000,
    jobStability: 0.7,
    skillsRelevance: 0.8,
    industry: 'technology'
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runSimulation = async () => {
    setIsSimulating(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const scenario = crisisScenarios.find(s => s.id === selectedScenario)!;
    const severityFactor = severity / 100;

    // Calculate crisis impact
    const incomeLoss = scenario.baseImpact * severityFactor;
    const expenseIncrease = selectedScenario === 'medical_emergency' ? 0.5 * severityFactor : 0.1 * severityFactor;

    // Generate monthly projections
    const monthlyProjections: Array<{
      month: number;
      income: number;
      expenses: number;
      savings: number;
      cumulativeLoss: number;
    }> = [];
    let cumulativeSavings = userProfile.emergencyFund;
    let totalLoss = 0;

    for (let month = 0; month < 24; month++) {
      const crisisActive = month < scenario.duration;
      const currentIncome = crisisActive
        ? userProfile.monthlyIncome * (1 - incomeLoss * Math.exp(-month / 6))
        : userProfile.monthlyIncome * (1 + 0.02 * Math.max(0, month - scenario.duration)); // Gradual recovery

      const currentExpenses = userProfile.monthlyIncome *
        (userProfile.monthlyExpenses / userProfile.monthlyIncome) *
        (1 + (crisisActive ? expenseIncrease : 0));

      const monthlySavings = currentIncome - currentExpenses;
      cumulativeSavings += monthlySavings;

      if (monthlySavings < 0) {
        totalLoss += Math.abs(monthlySavings);
      }

      monthlyProjections.push({
        month: month + 1,
        income: currentIncome,
        expenses: currentExpenses,
        savings: monthlySavings,
        cumulativeLoss: totalLoss
      });

      if (cumulativeSavings <= 0 && crisisActive) {
        break; // Can't survive beyond this point
      }
    }

    // Calculate metrics
    const firstProj = monthlyProjections[0] || { month: 1, income: 0, expenses: 0, savings: 0, cumulativeLoss: 0 };
    const worstMonth = monthlyProjections.reduce((min, month) =>
      month.savings < min.savings ? month : min
      , firstProj);

    const survivalMonths = monthlyProjections.findIndex(m => m.cumulativeLoss > userProfile.emergencyFund) ||
      monthlyProjections.length;

    const recoveryTime = scenario.duration * (1 + (1 - userProfile.jobStability) * 0.5);

    // Determine risk level
    const riskScore = (incomeLoss * 0.4 + expenseIncrease * 0.3 + (1 - userProfile.jobStability) * 0.3);
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore > 0.7) riskLevel = 'critical';
    else if (riskScore > 0.5) riskLevel = 'high';
    else if (riskScore > 0.3) riskLevel = 'medium';

    // Generate recommendations
    const recommendations: string[] = [];
    if (survivalMonths < 3) {
      recommendations.push('Build emergency fund to cover at least 6 months of expenses');
      recommendations.push('Consider insurance options for income protection');
    }
    if (incomeLoss > 0.5) {
      recommendations.push('Develop additional income streams');
      recommendations.push('Update skills to improve employability');
    }
    if (userProfile.totalDebt / userProfile.monthlyIncome > 3) {
      recommendations.push('Create debt reduction plan');
      recommendations.push('Consider debt consolidation options');
    }
    if (riskLevel === 'critical') {
      recommendations.push('Seek professional financial advice immediately');
      recommendations.push('Review all expenses and cut non-essential spending');
    }

    setSimulationResult({
      survivalMonths,
      worstMonth: worstMonth.month,
      recoveryTime: Math.round(recoveryTime),
      totalLoss,
      riskLevel,
      recommendations,
      monthlyProjections: monthlyProjections.slice(0, 12) // Show 12 months
    });

    setIsSimulating(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return theme.palette.success.main;
      case 'medium': return theme.palette.warning.main;
      case 'high': return theme.palette.error.main;
      case 'critical': return theme.palette.error.dark;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Grid container spacing={4}>
      {/* Configuration Panel */}
      <Grid item xs={12} md={6}>
        <SimulatorCard elevation={0}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            <CrisisAlert sx={{ mr: 1, verticalAlign: 'middle' }} />
            Crisis Simulator
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Test your financial resilience against real-world scenarios
          </Typography>

          {/* Scenario Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Crisis Scenario</InputLabel>
            <Select
              value={selectedScenario}
              label="Crisis Scenario"
              onChange={(e) => setSelectedScenario(e.target.value)}
            >
              {crisisScenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'error.main', width: 32, height: 32 }}>
                      {scenario.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{scenario.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scenario.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Severity Slider */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Crisis Severity: {severity}%
            </Typography>
            <Slider
              value={severity}
              onChange={(_, value) => setSeverity(value as number)}
              min={10}
              max={100}
              step={10}
              marks={[
                { value: 10, label: 'Mild' },
                { value: 50, label: 'Moderate' },
                { value: 100, label: 'Severe' }
              ]}
              sx={{
                '& .MuiSlider-thumb': {
                  bgcolor: 'error.main'
                },
                '& .MuiSlider-track': {
                  bgcolor: 'error.main'
                }
              }}
            />
          </Box>

          {/* User Profile Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Financial Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Income
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  ₹{userProfile.monthlyIncome.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Emergency Fund
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {Math.round(userProfile.emergencyFund / userProfile.monthlyExpenses)} months
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Job Stability
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={userProfile.jobStability * 100}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Debt-to-Income
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {Math.round((userProfile.totalDebt / userProfile.monthlyIncome / 12) * 100)}%
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Simulate Button */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={runSimulation}
            disabled={isSimulating}
            startIcon={isSimulating ? <Refresh sx={{ animation: 'spin 1s linear infinite' }} /> : <Assessment />}
            sx={{
              py: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`
              }
            }}
          >
            {isSimulating ? 'Simulating Crisis...' : 'Run Crisis Simulation'}
          </Button>
        </SimulatorCard>
      </Grid>

      {/* Results Panel */}
      <Grid item xs={12} md={6}>
        <AnimatePresence mode="wait">
          {simulationResult ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <SimulatorCard elevation={0}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={700}>
                    Simulation Results
                  </Typography>
                  <ScenarioChip
                    severity={simulationResult.riskLevel}
                    label={`${simulationResult.riskLevel.toUpperCase()} RISK`}
                  />
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" fontWeight={800} color="error.main">
                        {simulationResult.survivalMonths}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Months of Survival
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h4" fontWeight={800} color="warning.main">
                        {simulationResult.recoveryTime}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Recovery Time (months)
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Projection Chart */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    12-Month Financial Projection
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={simulationResult.monthlyProjections}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => `₹${Math.round(Number(value)).toLocaleString()}`} />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stackId="1"
                        stroke={theme.palette.success.main}
                        fill={alpha(theme.palette.success.main, 0.3)}
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke={theme.palette.error.main}
                        fill={alpha(theme.palette.error.main, 0.3)}
                        name="Expenses"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>

                {/* Recommendations */}
                {simulationResult.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb color="primary" />
                      AI Recommendations
                    </Typography>
                    <List dense>
                      {simulationResult.recommendations.map((rec, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle color="success" sx={{ fontSize: 20 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={rec}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* View Details Button */}
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setShowDetails(true)}
                  sx={{ mt: 2 }}
                >
                  View Detailed Analysis
                </Button>
              </SimulatorCard>
            </motion.div>
          ) : (
            <SimulatorCard elevation={0}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Avatar sx={{ bgcolor: 'grey.200', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                  <Assessment sx={{ fontSize: 40, color: 'grey.500' }} />
                </Avatar>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Ready to Test Your Financial Resilience?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Select a crisis scenario and run the simulation to see how prepared you are
                </Typography>
              </Box>
            </SimulatorCard>
          )}
        </AnimatePresence>
      </Grid>

      {/* Detailed Analysis Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Detailed Crisis Analysis</DialogTitle>
        <DialogContent>
          {simulationResult && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Monthly Cash Flow Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={simulationResult.monthlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `₹${Math.round(Number(value)).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="savings" fill={theme.palette.primary.main} name="Net Savings" />
                </BarChart>
              </ResponsiveContainer>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                Worst Month Analysis
              </Typography>
              <Alert severity={simulationResult.riskLevel === 'critical' ? 'error' : 'warning'}>
                <Typography variant="body2">
                  Month {simulationResult.worstMonth} shows the highest financial stress with
                  total projected loss of ₹{Math.round(simulationResult.totalLoss).toLocaleString()}
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default FinancialCrisisSimulator;
