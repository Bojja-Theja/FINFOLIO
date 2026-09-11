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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  CheckCircle,
  AccountBalance,
} from '@mui/icons-material';
import {
  walletService,
  Wallet,
  WalletTransaction,
} from '../services/walletService';
import {
  withdrawalService,
  WithdrawalRequest,
  WithdrawalResponse,
} from '../services/withdrawalService';
import WithdrawalModal from '../components/WithdrawalModal';
import { HourglassEmpty, PlayArrow, Cancel as CancelIcon, Shield } from '@mui/icons-material';

const GridTyped = Grid as any;

const depositCategories = [
  'Salary Allocation',
  'Emergency Fund Transfer',
  'Bonus / Incentive',
  'Side Gig / Freelance',
  'Expense Savings Surplus',
  'General Deposit',
];

const withdrawalCategories = [
  'Dining & Restaurants',
  'Entertainment & Events',
  'Gadgets & Tech',
  'Travel & Vacation',
  'Clothing & Lifestyle',
  'Emergency Expense',
  'General Withdrawal',
];

const WalletPage = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [totalDeposited, setTotalDeposited] = useState<number>(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [patternAdvisory, setPatternAdvisory] = useState<string | null>(null);

  // Deposit modal
  const [openDeposit, setOpenDeposit] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositCategory, setDepositCategory] = useState<string>('Salary Allocation');
  const [depositReason, setDepositReason] = useState<string>('Monthly personal savings');
  const [depositSubmitting, setDepositSubmitting] = useState<boolean>(false);

  // Withdrawal modal (Consequence-Aware)
  const [openWithdraw, setOpenWithdraw] = useState<boolean>(false);

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, withdrawalsData] = await Promise.all([
        walletService.getWallet(),
        withdrawalService.getWithdrawals(),
      ]);

      setWallet(walletData.wallet);
      setTransactions(walletData.recentTransactions || []);
      setWithdrawalRequests(withdrawalsData || []);
      setTotalDeposited(walletData.totalDeposited || 0);
      setTotalWithdrawn(walletData.totalWithdrawn || 0);

      // Check emergency patterns
      withdrawalService.getEmergencyPatterns().then(p => {
        if (p?.anomalyDetected && p.warnings.length > 0) {
          setPatternAdvisory(p.warnings[0] || null);
        } else {
          setPatternAdvisory(null);
        }
      }).catch(() => setPatternAdvisory(null));
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please provide a positive deposit amount.');
      return;
    }

    setDepositSubmitting(true);
    setError(null);
    try {
      const res = await walletService.deposit(amountNum, depositCategory, depositReason);
      setSuccessMsg(res.message || `Successfully deposited $${amountNum.toLocaleString()}`);
      setOpenDeposit(false);
      fetchWalletData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Deposit failed.');
    } finally {
      setDepositSubmitting(false);
    }
  };

  const handleWithdrawalSuccess = (res: WithdrawalResponse) => {
    setSuccessMsg(res.message);
    fetchWalletData();
  };

  const handleExecuteApproved = async (requestId: number) => {
    try {
      const res = await withdrawalService.executeApproved(requestId);
      setSuccessMsg(res.message);
      fetchWalletData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to execute approved withdrawal');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await withdrawalService.cancelRequest(requestId);
      setSuccessMsg('Withdrawal request cancelled.');
      fetchWalletData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to cancel request');
    }
  };

  const currentBalance = wallet ? wallet.balance : 0;
  const netSavings = Math.round((totalDeposited - totalWithdrawn) * 100) / 100;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            💳 Simulated Savings Wallet
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Manage cash reserves, record deposits, and track intentional withdrawals with an auditable transaction ledger.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchWalletData()}
          disabled={loading}
        >
          Refresh
        </Button>
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

      {patternAdvisory && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setPatternAdvisory(null)}>
          <strong>Notice:</strong> {patternAdvisory}
        </Alert>
      )}

      {/* Hero Wallet Card */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} md={7}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%)',
              color: 'white',
              borderRadius: 4,
              p: 3,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient FinFolio Logo in Background */}
            <Box
              component="img"
              src="/logo.png"
              alt="FinFolio Emblem"
              sx={{
                position: 'absolute',
                right: -20,
                bottom: -30,
                width: 220,
                height: 220,
                opacity: 0.12,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  component="img"
                  src="/logo.png"
                  alt="FinFolio"
                  sx={{ width: 40, height: 40, borderRadius: '50%' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
                    FINFOLIO SIMULATED VAULT
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Non-custodial Educational Simulation
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="SIMULATION ACTIVE"
                size="small"
                sx={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
              Available Liquidity
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: '#f8fafc', my: 1 }}>
              ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
              Currency: <span style={{ fontWeight: 700 }}>{wallet?.currency || 'USD'}</span> • Non-negative constraint enforced
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<ArrowUpward />}
                onClick={() => setOpenDeposit(true)}
                sx={{
                  backgroundColor: '#10b981',
                  '&:hover': { backgroundColor: '#059669' },
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                Deposit Funds
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowDownward />}
                onClick={() => setOpenWithdraw(true)}
                sx={{
                  color: '#f8fafc',
                  borderColor: 'rgba(255,255,255,0.4)',
                  '&:hover': { borderColor: '#f8fafc', backgroundColor: 'rgba(255,255,255,0.08)' },
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                Withdraw Funds
              </Button>
            </Box>
          </Card>
        </GridTyped>

        {/* Breakdown summary cards */}
        <GridTyped item xs={12} md={5}>
          <GridTyped container spacing={2}>
            <GridTyped item xs={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  TOTAL DEPOSITED
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                  +${totalDeposited.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Cumulative savings added
                </Typography>
              </Card>
            </GridTyped>
            <GridTyped item xs={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  TOTAL WITHDRAWN
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#ef4444', mt: 0.5 }}>
                  -${totalWithdrawn.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Discretionary spending
                </Typography>
              </Card>
            </GridTyped>
            <GridTyped item xs={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  NET RETAINED
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#3b82f6', mt: 0.5 }}>
                  ${netSavings.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Total deposits minus outflows
                </Typography>
              </Card>
            </GridTyped>
            <GridTyped item xs={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', p: 2 }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                  TOTAL TRANSACTIONS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366f1', mt: 0.5 }}>
                  {transactions.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Audited ledger records
                </Typography>
              </Card>
            </GridTyped>
          </GridTyped>
        </GridTyped>
      </GridTyped>

      {/* Transaction Ledger Table */}
      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                📜 Auditable Transaction Ledger
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Immutable records of every simulated balance modification.
              </Typography>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <AccountBalanceWallet sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 600 }}>
                No wallet transactions recorded yet
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Deposit your first funds into your simulated wallet to begin.
              </Typography>
              <Button variant="contained" onClick={() => setOpenDeposit(true)}>
                Make First Deposit
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date &amp; Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Reason / Notes</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const isDeposit = tx.type === 'deposit';
                    return (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          <Chip
                            icon={isDeposit ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                            label={tx.type.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: isDeposit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: isDeposit ? '#059669' : '#dc2626',
                              fontWeight: 700,
                            }}
                          />
                          {(tx.category === 'emergency' || tx.reason?.includes('EMERGENCY')) && (
                            <Chip
                              label="EMERGENCY"
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, ml: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                          {tx.category.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b' }}>
                          {tx.reason || '—'}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: isDeposit ? '#10b981' : '#ef4444',
                          }}
                        >
                          {isDeposit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: '0.9rem !important' }} />}
                            label={tx.status.toUpperCase()}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Accountability Withdrawal Requests */}
      <Card sx={{ borderRadius: 4, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Shield color="primary" />
                Accountability Requests & Impact Log
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending mentor reviews, consequence forecasts, and approved withdrawals awaiting execution.
              </Typography>
            </Box>
            <Chip
              label={`${withdrawalRequests.filter(r => r.status === 'pending').length} Pending Review`}
              color={withdrawalRequests.some(r => r.status === 'pending') ? 'warning' : 'default'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          {withdrawalRequests.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No withdrawal requests on record. All your transactions are tracked in the ledger above.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Goal Delay</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Runway Impact</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withdrawalRequests.map((req) => (
                    <TableRow key={req.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>
                        #{req.id}
                        {req.isEmergency && (
                          <Chip
                            label="EMERGENCY"
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, ml: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{req.category.replace(/_/g, ' ')}</TableCell>
                      <TableCell sx={{ color: '#64748b', maxWidth: 200 }}>{req.reason}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#ef4444' }}>
                        ${req.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`+${req.estimatedDelayDays}d`}
                          color={req.estimatedDelayDays > 14 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={`-${req.runwayImpactMonths.toFixed(1)}mo`}
                          color={req.runwayImpactMonths > 0.5 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={req.status.toUpperCase()}
                          size="small"
                          color={
                            req.status === 'executed'
                              ? 'success'
                              : req.status === 'approved'
                              ? 'info'
                              : req.status === 'declined'
                              ? 'error'
                              : req.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {req.status === 'approved' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<PlayArrow />}
                            onClick={() => handleExecuteApproved(req.id)}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                          >
                            Execute
                          </Button>
                        )}
                        {req.status === 'pending' && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelRequest(req.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancel
                          </Button>
                        )}
                        {req.status === 'executed' && (
                          <Typography variant="caption" color="textSecondary">
                            Completed
                          </Typography>
                        )}
                        {req.status === 'declined' && (
                          <Typography variant="caption" color="error">
                            Declined
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal: Deposit Funds */}
      <Dialog open={openDeposit} onClose={() => setOpenDeposit(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleDepositSubmit}>
          <DialogTitle sx={{ fontWeight: 800 }}>Deposit Funds into Simulated Wallet</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Add simulated funds to advance your savings goals and build your liquidity buffer.
            </Typography>

            {/* Quick Amount Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {[100, 500, 1000, 2500].map((amt) => (
                <Button
                  key={amt}
                  variant={depositAmount === amt.toString() ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setDepositAmount(amt.toString())}
                >
                  +${amt}
                </Button>
              ))}
            </Box>

            <TextField
              fullWidth
              required
              type="number"
              label="Deposit Amount ($)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              inputProps={{ min: 1, step: 'any' }}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
              label="Category"
              value={depositCategory}
              onChange={(e) => setDepositCategory(e.target.value)}
              sx={{ mb: 2 }}
            >
              {depositCategories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Reason / Source"
              value={depositReason}
              onChange={(e) => setDepositReason(e.target.value)}
            />

            {/* Balance Preview */}
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700 }}>
                PROJECTED BALANCE
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
                ${(currentBalance + (parseFloat(depositAmount) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenDeposit(false)} disabled={depositSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={depositSubmitting}
              sx={{ backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}
            >
              {depositSubmitting ? 'Depositing...' : 'Confirm Deposit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: Consequence-Aware Withdrawal */}
      <WithdrawalModal
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        onSuccess={handleWithdrawalSuccess}
        currentBalance={currentBalance}
      />
    </Container>
  );
};

export default WalletPage;
