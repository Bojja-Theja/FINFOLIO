/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Collapse,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  AccountBalanceWallet,
  HourglassEmpty,
  Speed,
  SupervisorAccount,
  CheckCircle,
  WarningAmber,
  Shield,
  ExpandMore,
  ExpandLess,
  TrendingDown,
  Bolt,
} from '@mui/icons-material';
import {
  withdrawalService,
  PreTransactionImpact,
  WithdrawalResponse,
} from '../services/withdrawalService';
import { goalService, FinancialGoal } from '../services/goalService';

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (result: WithdrawalResponse) => void;
  currentBalance: number;
  defaultGoalId?: number | undefined;
}

const CATEGORIES = [
  { label: 'Groceries & Food Essentials', value: 'Groceries', tier: 'essential' },
  { label: 'Utilities & Home Bills', value: 'Utilities', tier: 'essential' },
  { label: 'Health & Medical', value: 'Healthcare', tier: 'essential' },
  { label: 'Work & Professional Tools', value: 'Work Equipment', tier: 'important' },
  { label: 'Transportation & Vehicle Gas', value: 'Transportation', tier: 'important' },
  { label: 'Home Repairs & Maintenance', value: 'Maintenance', tier: 'important' },
  { label: 'Dining Out & Takeaway', value: 'Dining & Restaurants', tier: 'discretionary' },
  { label: 'Entertainment & Gaming', value: 'Gaming & Entertainment', tier: 'discretionary' },
  { label: 'Electronics & Gadgets', value: 'Electronics & Gadgets', tier: 'discretionary' },
  { label: 'Travel & Vacations', value: 'Travel & Vacations', tier: 'discretionary' },
  { label: 'Shopping & Apparel', value: 'Clothing & Lifestyle', tier: 'discretionary' },
];

export default function WithdrawalModal({
  open,
  onClose,
  onSuccess,
  currentBalance,
  defaultGoalId,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState<string>('150');
  const [category, setCategory] = useState<string>('Dining & Restaurants');
  const [reason, setReason] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<number | ''>(defaultGoalId || '');
  const [goals, setGoals] = useState<FinancialGoal[]>([]);

  const [impact, setImpact] = useState<PreTransactionImpact | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showScenarios, setShowScenarios] = useState<boolean>(false);

  const [isEmergencyMode, setIsEmergencyMode] = useState<boolean>(false);
  const [anomalyAdvisory, setAnomalyAdvisory] = useState<string | null>(null);
  const [isOverrideSelected, setIsOverrideSelected] = useState<boolean>(false);
  const [ackChecked, setAckChecked] = useState<boolean>(false);

  // Load user goals & emergency patterns
  useEffect(() => {
    if (open) {
      setIsOverrideSelected(false);
      setAckChecked(false);

      goalService
        .getGoals()
        .then(res => setGoals(res.goals || []))
        .catch(() => setGoals([]));

      withdrawalService
        .getEmergencyPatterns()
        .then(patterns => {
          if (patterns && patterns.anomalyDetected && patterns.warnings.length > 0) {
            setAnomalyAdvisory(patterns.warnings[0] || null);
          } else {
            setAnomalyAdvisory(null);
          }
        })
        .catch(() => setAnomalyAdvisory(null));
    }
  }, [open]);

  // Debounced impact calculation
  const runImpactAnalysis = useCallback(async (amtStr: string, catStr: string, gId?: number) => {
    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0 || !catStr) {
      setImpact(null);
      return;
    }

    setAnalyzing(true);
    try {
      const res = await withdrawalService.analyzeImpact(amt, catStr, gId);
      setImpact(res);
      setError(null);
    } catch (err: any) {
      // Don't show critical error for typing
    } finally {
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      runImpactAnalysis(
        amount,
        isEmergencyMode ? 'emergency' : category,
        selectedGoalId === '' ? undefined : Number(selectedGoalId)
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [amount, category, selectedGoalId, open, isEmergencyMode, runImpactAnalysis]);

  const handleQuickPill = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid withdrawal amount.');
      return;
    }

    if (parsedAmount > currentBalance) {
      setError(`Cannot withdraw ₹${parsedAmount.toLocaleString('en-IN')}. Available liquidity is ₹${currentBalance.toLocaleString('en-IN')}.`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a brief reason or purpose for this withdrawal.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let result: WithdrawalResponse;
      if (isEmergencyMode) {
        result = await withdrawalService.executeEmergency({
          amount: parsedAmount,
          reason: reason.trim(),
          category: category || 'emergency',
          goalId: selectedGoalId === '' ? undefined : Number(selectedGoalId),
        });
      } else if (isOverrideSelected) {
        if (!ackChecked) {
          setError('Please check the acknowledgement box to consciously override commitment rules.');
          setSubmitting(false);
          return;
        }
        result = await withdrawalService.executeOverride({
          amount: parsedAmount,
          category,
          reason: reason.trim(),
          acknowledgement: `I understand this discretionary withdrawal may delay my goal by approximately ${impact?.estimatedDelayDays || 0} days and reduce my financial runway.`,
          goalId: selectedGoalId === '' ? undefined : Number(selectedGoalId),
        });
      } else {
        result = await withdrawalService.requestWithdrawal({
          amount: parsedAmount,
          category,
          reason: reason.trim(),
          goalId: selectedGoalId === '' ? undefined : Number(selectedGoalId),
        });
      }

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Withdrawal request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const isInsufficient = parsedAmount > currentBalance;
  const remaining = Math.max(0, currentBalance - parsedAmount);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield color={isEmergencyMode ? 'error' : 'primary'} />
          {isEmergencyMode ? 'FinFolio Emergency Liquidity Access' : 'FinFolio Consequence-Aware Withdrawal'}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Mode Selector */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant={!isEmergencyMode ? 'contained' : 'outlined'}
              color="primary"
              onClick={() => setIsEmergencyMode(false)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Standard Spending
            </Button>
            <Button
              size="small"
              variant={isEmergencyMode ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setIsEmergencyMode(true)}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              🚨 Emergency Mode
            </Button>
          </Box>

          {/* Objective Pattern Anomaly Notice */}
          {anomalyAdvisory && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Notice:</strong> {anomalyAdvisory}
            </Alert>
          )}

          {/* Emergency Mode Disclosure */}
          {isEmergencyMode && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>🚨 Immediate Emergency Access:</strong> Funds execute immediately and bypass partner review. Your active accountability partner will be notified of this transaction upon completion.
            </Alert>
          )}

          {/* Amount & Quick Select Pills */}
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {isEmergencyMode ? 'HOW MUCH EMERGENCY LIQUIDITY DO YOU NEED?' : 'HOW MUCH DO YOU NEED?'}
          </Typography>
          <TextField
            fullWidth
            required
            type="number"
            value={amount}
            onChange={e => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val > 10000000) {
                setAmount('10000000');
              } else if (!isNaN(val) && val < 0) {
                setAmount('0');
              } else {
                setAmount(e.target.value);
              }
            }}
            error={isInsufficient}
            helperText={
              isInsufficient
                ? `Exceeds available balance (₹${currentBalance.toLocaleString('en-IN')})`
                : `Available liquidity: ₹${currentBalance.toLocaleString('en-IN')} • Max: ₹1 Cr`
            }
            inputProps={{ min: 1, max: Math.min(10000000, currentBalance) }}
            InputProps={{
              startAdornment: (
                <Typography variant="h6" sx={{ mr: 1, color: 'text.secondary', fontWeight: 700 }}>
                  ₹
                </Typography>
              ),
            }}
            sx={{ mb: 1, mt: 0.5 }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[500, 1000, 2500, 5000].map(val => (
              <Chip
                key={val}
                label={`+₹${val.toLocaleString('en-IN')}`}
                onClick={() => handleQuickPill(val)}
                clickable
                variant={parsedAmount === val ? 'filled' : 'outlined'}
                color={parsedAmount === val ? 'primary' : 'default'}
                size="small"
              />
            ))}
          </Box>

          {/* Category & Reason */}
          <TextField
            fullWidth
            select
            label="Expense Category"
            value={category}
            onChange={e => setCategory(e.target.value)}
            sx={{ mb: 2 }}
          >
            {CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{cat.label}</span>
                  <Chip
                    size="small"
                    label={cat.tier.toUpperCase()}
                    color={
                      cat.tier === 'essential'
                        ? 'success'
                        : cat.tier === 'important'
                        ? 'warning'
                        : 'error'
                    }
                    variant="outlined"
                    sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                  />
                </Box>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            required
            label="What is this purchase for? (Purpose & Context)"
            placeholder="e.g. Need replacement work headset or dinner with visiting family"
            value={reason}
            onChange={e => setReason(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          {goals.length > 0 && (
            <TextField
              fullWidth
              select
              label="Impacted Goal (Optional)"
              value={selectedGoalId}
              onChange={e => setSelectedGoalId(e.target.value === '' ? '' : Number(e.target.value))}
              helperText="Attribute this withdrawal directly to a specific savings target"
              sx={{ mb: 3 }}
            >
              <MenuItem value="">General Savings (No Specific Goal)</MenuItem>
              {goals.map(g => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name} (${g.currentAmount.toLocaleString()} / ${g.targetAmount.toLocaleString()})
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* REAL-TIME PRE-TRANSACTION IMPACT ANALYSIS */}
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
                PROJECTED FINANCIAL IMPACT
              </Typography>
              {analyzing && <CircularProgress size={16} />}
            </Box>

            {impact && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {/* 1. Friction & Approval Rule Banner */}
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: impact.requiresApproval ? 'warning.main' : 'success.main',
                    bgcolor: impact.requiresApproval ? 'warning.light' : 'success.light',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {impact.requiresApproval ? (
                      <SupervisorAccount sx={{ color: 'warning.dark' }} />
                    ) : (
                      <CheckCircle sx={{ color: 'success.dark' }} />
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {impact.requiresApproval
                          ? 'ACCOUNTABILITY PARTNER REVIEW REQUIRED'
                          : 'INSTANT EXECUTION PERMITTED'}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {impact.ruleReason}
                      </Typography>
                      {impact.assignedPartnerName && (
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          Assigned Mentor: {impact.assignedPartnerName} ({impact.assignedPartnerRelationship})
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>

                {/* 2. Balance & Goal Delay Cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      WALLET LIQUIDITY
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                      ₹{currentBalance.toLocaleString('en-IN')} → ₹{remaining.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Remaining after deduction
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        ESTIMATED GOAL DELAY
                      </Typography>
                      <HourglassEmpty fontSize="small" color="warning" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: 'warning.dark' }}>
                      {impact.delayReliable ? `+${impact.estimatedDelayDays} days` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {impact.delayExplanation}
                    </Typography>
                  </Paper>
                </Box>

                {/* 3. Runway Impact & Multi-Scenarios */}
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                        FINANCIAL RUNWAY IMPACT
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                        {impact.runwayBeforeMonths.toFixed(1)} mo → {impact.runwayAfterMonths.toFixed(1)} mo
                        <Chip
                          size="small"
                          label={`-${impact.runwayImpactMonths.toFixed(1)} mo`}
                          color={impact.runwayImpactMonths > 0.4 ? 'error' : 'default'}
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => setShowScenarios(!showScenarios)}
                      endIcon={showScenarios ? <ExpandLess /> : <ExpandMore />}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      {showScenarios ? 'Hide Scenarios' : 'View Scenarios'}
                    </Button>
                  </Box>

                  <Collapse in={showScenarios}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {impact.runwayScenarios.map(sc => (
                        <Box key={sc.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {sc.name}:
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {sc.months.toFixed(1)} months
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>

                {/* 4. Savings Rate Shift */}
                <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      MONTHLY SAVINGS RATE SHIFT
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {impact.savingsRateBefore.toFixed(1)}% → {impact.savingsRateAfter.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    icon={<TrendingDown />}
                    label={`-${impact.savingsRateChange.toFixed(1)}%`}
                    color={impact.savingsRateChange > 5 ? 'warning' : 'default'}
                  />
                </Paper>

                {/* 5. Conscious Override Option (when review required) */}
                {impact.requiresApproval && !isEmergencyMode && (
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isOverrideSelected ? 'warning.main' : 'divider',
                      bgcolor: isOverrideSelected ? 'rgba(255, 152, 0, 0.05)' : 'background.paper',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isOverrideSelected}
                          onChange={(e) => {
                            setIsOverrideSelected(e.target.checked);
                            if (!e.target.checked) setAckChecked(false);
                          }}
                          color="warning"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Bolt sx={{ color: 'warning.main', fontSize: 20 }} />
                            Consciously Override Partner Review
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            You retain sovereign control of your funds. Overriding executes immediately, records a transparent audit log, and notifies your partner of your conscious decision.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />

                    {isOverrideSelected && (
                      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={ackChecked}
                              onChange={(e) => setAckChecked(e.target.checked)}
                              color="warning"
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                              I acknowledge that I understand this discretionary withdrawal may delay my goal by approximately {impact.estimatedDelayDays || 0} days and reduce my financial runway from {impact.runwayBeforeMonths.toFixed(1)} to {impact.runwayAfterMonths.toFixed(1)} months.
                            </Typography>
                          }
                          sx={{ alignItems: 'flex-start', m: 0 }}
                        />
                      </Box>
                    )}
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={
              isEmergencyMode
                ? 'error'
                : isOverrideSelected
                ? 'warning'
                : impact?.requiresApproval
                ? 'warning'
                : 'primary'
            }
            disabled={
              submitting ||
              isInsufficient ||
              parsedAmount <= 0 ||
              (isOverrideSelected && !ackChecked)
            }
            startIcon={
              submitting ? (
                <CircularProgress size={18} />
              ) : isEmergencyMode ? (
                <WarningAmber />
              ) : isOverrideSelected ? (
                <Bolt />
              ) : impact?.requiresApproval ? (
                <SupervisorAccount />
              ) : (
                <CheckCircle />
              )
            }
          >
            {submitting
              ? 'Processing...'
              : isEmergencyMode
              ? `Execute Emergency Withdrawal (₹${parsedAmount.toLocaleString('en-IN')})`
              : isOverrideSelected
              ? `⚡ Conscious Override (₹${parsedAmount.toLocaleString('en-IN')})`
              : impact?.requiresApproval
              ? 'Request Partner Review'
              : 'Confirm Instant Withdrawal'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
