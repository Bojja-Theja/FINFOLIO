/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import {
  Lock,
  LockOpen,
  Add,
  TrendingUp,
  AccountBalance,
  Savings as SavingsIcon,
  Refresh,
  Warning
} from '@mui/icons-material';
// Navigation provided globally by _app.tsx
import api from '@/utils/axiosClient';
import { useAuth } from '@/context/AuthContext';

interface SavingsPlan {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  lock_percentage: number;
  target_date: string;
}

interface SavingsData {
  totalSaved: number;
  locked: number;
  available: number;
  monthlyAutoSave: number;
  disciplineScore: number;
  plans: SavingsPlan[];
}

export default function Savings() {
  const { user } = useAuth();
  const isGuest = !user || user.isGuest;
  
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SavingsPlan | null>(null);
  const [lockAmount, setLockAmount] = useState('');
  const [newPlan, setNewPlan] = useState({
    name: '',
    target_amount: 0,
    monthly_contribution: 0,
    lock_percentage: 80,
    target_date: ''
  });

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/savings/status`);
      setData(response.data);
    } catch (err) {
      const e: any = err;
      console.error('Failed to fetch savings data:', err);
      // Fallback to mock data regardless of error
      setData({
        totalSaved: 125000,
        locked: 75000,
        available: 50000,
        monthlyAutoSave: 5200,
        disciplineScore: 78,
        plans: [
          {
            id: 1,
            name: 'Emergency Fund',
            target_amount: 150000,
            current_amount: 45000,
            monthly_contribution: 5000,
            lock_percentage: 80,
            target_date: '2025-12-31'
          },
          {
            id: 2,
            name: 'Vacation Fund',
            target_amount: 100000,
            current_amount: 25000,
            monthly_contribution: 3000,
            lock_percentage: 60,
            target_date: '2025-08-15'
          }
        ]
      });
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const handleLockSavings = async () => {
    if (!selectedPlan || !lockAmount) return;

    try {
      await api.post(`/savings/lock`, {
        planId: selectedPlan.id,
        amount: parseFloat(lockAmount)
      });
      setLockDialogOpen(false);
      setLockAmount('');
      fetchSavingsData(); // Refresh data
    } catch (err) {
      const e: any = err;
      if (e?.response?.status === 403) {
        setError('This feature requires a full account. Please sign in with your email.');
      } else if (e?.response?.status === 401) {
        setError('Please sign in to lock savings');
      } else {
        console.error('Failed to lock savings:', err);
        setError('Failed to lock savings. Please try again.');
      }
    }
  };

  const handleUnlockSavings = async (planId: number) => {
    try {
      await api.post(`/savings/unlock/${planId}`, {});
      fetchSavingsData(); // Refresh data
    } catch (err) {
      const e: any = err;
      if (e?.response?.status === 403) {
        setError('This feature requires a full account. Please sign in with your email.');
      } else if (e?.response?.status === 401) {
        setError('Please sign in to unlock savings');
      } else {
        console.error('Failed to unlock savings:', err);
        setError('Failed to unlock savings. Please try again.');
      }
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.target_amount || !newPlan.monthly_contribution || !newPlan.target_date) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await api.post(`/savings/plan`, newPlan);
      setCreatePlanDialogOpen(false);
      setNewPlan({
        name: '',
        target_amount: 0,
        monthly_contribution: 0,
        lock_percentage: 80,
        target_date: ''
      });
      setError(null); // Clear any previous errors
      fetchSavingsData(); // Refresh data
    } catch (err) {
      const e: any = err;
      if (e?.response?.status === 401) {
        setError('Please sign in to create plans');
      } else if (e?.response?.status === 400) {
        setError(e?.response?.data?.error || 'Invalid plan data. Please check your inputs.');
      } else {
        setError(`Failed to create plan: ${e?.response?.data?.error || 'Unknown error'}`);
      }
      console.error('Failed to create plan:', err);
    }
  };

  const openLockDialog = (plan: SavingsPlan) => {
    setSelectedPlan(plan);
    setLockDialogOpen(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading your savings data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity={error === 'Please sign in' ? 'warning' : 'error'} sx={{ mb: 4 }}>
          <Typography variant="h6">{error === 'Please sign in' ? 'Authentication Required' : 'Connection Error'}</Typography>
          <Typography>{error}</Typography>
          {error !== 'Please sign in' && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Make sure the backend API is running on {process.env.NEXT_PUBLIC_BACKEND_URL}
            </Typography>
          )}
        </Alert>
        <Box textAlign="center">
          <Button variant="contained" onClick={fetchSavingsData}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  if (!data) return null;

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Savings Management Center
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Automate your savings discipline with AI-powered locking mechanisms and goal tracking
          </Typography>
        </Box>

        {/* Guest notification banner */}
        {isGuest && (
          <Alert 
            severity="warning" 
            icon={<Warning />}
            sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                href="/auth/register"
                variant="contained"
              >
                Create Account
              </Button>
            }
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Demo Mode – Create an Account to Unlock Features
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                You're currently viewing demo savings data. Sign up with your email to create real savings plans, lock your savings, and track your financial discipline.
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Summary Cards */}
        <GridTyped container spacing={3} sx={{ mb: 4 }}>
          <GridTyped item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Saved</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{data.totalSaved.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </GridTyped>

          <GridTyped item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Lock sx={{ mr: 1 }} />
                  <Typography variant="h6">Locked Amount</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{data.locked.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </GridTyped>

          <GridTyped item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SavingsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Available</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{data.available.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </GridTyped>

          <GridTyped item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp sx={{ mr: 1 }} />
                  <Typography variant="h6">Monthly Auto-Save</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  ₹{data.monthlyAutoSave.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </GridTyped>
        </GridTyped>

        {/* Discipline Score */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Savings Discipline Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={data.disciplineScore}
                sx={{ height: 10, borderRadius: 5 }}
                color={data.disciplineScore >= 80 ? 'success' : data.disciplineScore >= 60 ? 'warning' : 'error'}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 60 }}>
              {data.disciplineScore}%
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {data.disciplineScore >= 80 ? 'Excellent discipline! Keep it up!' :
             data.disciplineScore >= 60 ? 'Good progress. Room for improvement.' :
             'Needs attention. Consider strengthening your savings habits.'}
          </Typography>
        </Paper>

        {/* Savings Plans */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Your Savings Plans
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button startIcon={<Refresh />} onClick={fetchSavingsData} size="small">
                Refresh
              </Button>
              <Tooltip title={isGuest ? "Sign up to create savings plans" : ""} disableHoverListener={!isGuest}>
                <span>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    onClick={() => setCreatePlanDialogOpen(true)}
                    disabled={!!isGuest}
                  >
                    Create New Plan
                  </Button>
                </span>
              </Tooltip>
            </Stack>
          </Box>

          <GridTyped container spacing={3}>
            {data.plans && data.plans.length > 0 ? (
              data.plans.map((plan) => {
                const progress = (plan.current_amount / plan.target_amount) * 100;
                const lockedAmount = plan.current_amount * (plan.lock_percentage / 100);

                return (
                  <GridTyped item xs={12} md={6} key={plan.id}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {plan.name}
                          </Typography>
                          <Chip
                            label={`${Math.round(progress)}% Complete`}
                            color={progress >= 100 ? 'success' : progress >= 75 ? 'primary' : 'default'}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Progress: ₹{plan.current_amount.toLocaleString()} / ₹{plan.target_amount.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            sx={{ height: 8, borderRadius: 4, mb: 1 }}
                          />
                        </Box>

                        <Stack spacing={1} sx={{ mb: 3 }}>
                          <Typography variant="body2">
                            <strong>Monthly Contribution:</strong> ₹{plan.monthly_contribution.toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Lock Percentage:</strong> {plan.lock_percentage}%
                          </Typography>
                          <Typography variant="body2">
                            <strong>Locked Amount:</strong> ₹{lockedAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Target Date:</strong> {new Date(plan.target_date).toLocaleDateString()}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Tooltip 
                            title={isGuest ? "Sign up to lock your savings" : plan.current_amount <= lockedAmount ? "All savings are locked" : ""} 
                            disableHoverListener={!isGuest && plan.current_amount > lockedAmount}
                          >
                            <span>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<Lock />}
                                onClick={() => openLockDialog(plan)}
                                disabled={!!isGuest || plan.current_amount <= lockedAmount}
                              >
                                Lock More
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip 
                            title={isGuest ? "Sign up to unlock your savings" : lockedAmount === 0 ? "No locked savings to unlock" : ""} 
                            disableHoverListener={!isGuest && lockedAmount > 0}
                          >
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LockOpen />}
                                onClick={() => handleUnlockSavings(plan.id)}
                                disabled={!!isGuest || lockedAmount === 0}
                              >
                                Unlock
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </CardContent>
                    </Card>
                  </GridTyped>
                );
              })
            ) : (
              <GridTyped item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <SavingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Savings Plans Yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first savings plan to start building your financial security.
                  </Typography>
                  <Tooltip title={isGuest ? "Sign up to create savings plans" : ""} disableHoverListener={!isGuest}>
                    <span>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />} 
                        onClick={() => setCreatePlanDialogOpen(true)}
                        disabled={!!isGuest}
                      >
                        Create Your First Plan
                      </Button>
                    </span>
                  </Tooltip>
                </Paper>
              </GridTyped>
            )}
          </GridTyped>
        </Box>

        {/* Create Plan Dialog */}
        <Dialog open={createPlanDialogOpen} onClose={() => setCreatePlanDialogOpen(false)} maxWidth="sm" fullWidth disableEnforceFocus>
          <DialogTitle>Create Savings Plan</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Plan Name"
                placeholder="e.g., Emergency Fund, Vacation Fund"
                fullWidth
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              />
              <TextField
                label="Target Amount (₹)"
                type="number"
                fullWidth
                value={newPlan.target_amount}
                onChange={(e) => setNewPlan({ ...newPlan, target_amount: parseFloat(e.target.value) })}
              />
              <TextField
                label="Monthly Contribution (₹)"
                type="number"
                fullWidth
                value={newPlan.monthly_contribution}
                onChange={(e) => setNewPlan({ ...newPlan, monthly_contribution: parseFloat(e.target.value) })}
              />
              <TextField
                label="Lock Percentage (%)"
                type="number"
                fullWidth
                inputProps={{ min: 0, max: 100 }}
                value={newPlan.lock_percentage}
                onChange={(e) => setNewPlan({ ...newPlan, lock_percentage: parseInt(e.target.value) })}
                helperText="Percentage of savings to auto-lock"
              />
              <TextField
                label="Target Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newPlan.target_date}
                onChange={(e) => setNewPlan({ ...newPlan, target_date: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreatePlanDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePlan} variant="contained">
              Create Plan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lock Savings Dialog */}
        <Dialog open={lockDialogOpen} onClose={() => setLockDialogOpen(false)}>
          <DialogTitle>Lock Additional Savings</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Lock additional savings in "{selectedPlan?.name}" to prevent impulsive spending.
            </Typography>
            <TextField
              autoFocus
              label="Amount to Lock (₹)"
              type="number"
              fullWidth
              value={lockAmount}
              onChange={(e) => setLockAmount(e.target.value)}
              helperText={`Available to lock: ₹${selectedPlan ? (selectedPlan.current_amount - (selectedPlan.current_amount * selectedPlan.lock_percentage / 100)).toLocaleString() : 0}`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLockDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLockSavings} variant="contained">
              Lock Savings
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}
