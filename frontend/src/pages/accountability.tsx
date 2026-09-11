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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SupervisorAccount,
  Security,
  Gavel,
  Add,
  CheckCircle,
  Cancel,
  Refresh,
  Lock,
  Rule,
  VerifiedUser,
  InfoOutlined,
  Delete,
  Send,
  WarningAmber,
} from '@mui/icons-material';
import {
  accountabilityService,
  AccountabilityPartner,
  CommitmentRule,
  PartnerViewRequest,
  CommitmentLevel,
  RuleEvaluationResult,
} from '../services/accountabilityService';
import {
  withdrawalService,
  PartnerNotification,
} from '../services/withdrawalService';

const GridTyped = Grid as any;

const relationshipOptions = [
  'Financial Mentor',
  'Spouse / Partner',
  'Family Member',
  'Trusted Friend',
  'Financial Coach',
  'Accountability Buddy',
];

export default function AccountabilityPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [rules, setRules] = useState<CommitmentRule[]>([]);
  const [partnerInbox, setPartnerInbox] = useState<PartnerViewRequest[]>([]);
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [selectedPartnerEmail, setSelectedPartnerEmail] = useState<string>('');

  // Dialog states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('Financial Mentor');
  const [submittingInvite, setSubmittingInvite] = useState(false);

  // Rule Modal states
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<number | undefined>(undefined);
  const [ruleCategory, setRuleCategory] = useState('');
  const [ruleLevel, setRuleLevel] = useState<CommitmentLevel>('medium');
  const [ruleMaxInstant, setRuleMaxInstant] = useState<number>(100);
  const [rulePartnerId, setRulePartnerId] = useState<number | ''>('');
  const [submittingRule, setSubmittingRule] = useState(false);

  // Decision Modal states
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PartnerViewRequest | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Quick evaluation widget
  const [evalAmount, setEvalAmount] = useState('150');
  const [evalCategory, setEvalCategory] = useState('Electronics & Gadgets');
  const [evalResult, setEvalResult] = useState<RuleEvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedPartners, fetchedRules] = await Promise.all([
        accountabilityService.getPartners(),
        accountabilityService.getRules(),
      ]);

      setPartners(fetchedPartners);
      setRules(fetchedRules);

      // Auto-select first active partner email for partner portal demo
      const activePartner = fetchedPartners.find(p => p.status === 'active');
      const partnerEmailToUse = selectedPartnerEmail || (activePartner ? activePartner.email : '');
      if (activePartner && !selectedPartnerEmail) {
        setSelectedPartnerEmail(activePartner.email);
      }

      if (partnerEmailToUse) {
        try {
          const [inbox, notifs] = await Promise.all([
            accountabilityService.getPartnerInbox(partnerEmailToUse),
            withdrawalService.getNotifications(partnerEmailToUse),
          ]);
          setPartnerInbox(inbox);
          setNotifications(notifs);
        } catch (e) {
          // ignore if none
        }
      } else {
        try {
          const notifs = await withdrawalService.getNotifications();
          setNotifications(notifs);
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load accountability details');
    } finally {
      setLoading(false);
    }
  }, [selectedPartnerEmail]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePartnerEmailChange = async (email: string) => {
    setSelectedPartnerEmail(email);
    if (!email) return;
    try {
      const [inbox, notifs] = await Promise.all([
        accountabilityService.getPartnerInbox(email),
        withdrawalService.getNotifications(email),
      ]);
      setPartnerInbox(inbox);
      setNotifications(notifs);
    } catch (err: any) {
      setPartnerInbox([]);
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await withdrawalService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      // ignore
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setError('Name and email are required.');
      return;
    }

    setSubmittingInvite(true);
    setError(null);
    try {
      const res = await accountabilityService.invitePartner(
        inviteName.trim(),
        inviteEmail.trim(),
        inviteRelationship
      );
      setSuccessMsg(`Invitation sent to ${res.partner.email}!`);
      setInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to invite partner');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleAcceptSimulation = async (partnerId: number, email: string) => {
    try {
      await accountabilityService.acceptInvitation(partnerId, email);
      setSuccessMsg(`Partner ${email} accepted the invitation.`);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to accept invitation');
    }
  };

  const handleRevoke = async (partnerId: number) => {
    if (!window.confirm('Are you sure you want to revoke this partner? They will no longer review your requests.')) {
      return;
    }
    try {
      await accountabilityService.revokePartner(partnerId);
      setSuccessMsg('Partner successfully revoked.');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to revoke partner');
    }
  };

  const openRuleModal = (rule?: CommitmentRule) => {
    if (rule) {
      setEditingRuleId(rule.id);
      setRuleCategory(rule.category);
      setRuleLevel(rule.level);
      setRuleMaxInstant(rule.maxInstantAmount);
      setRulePartnerId(rule.partnerId || '');
    } else {
      setEditingRuleId(undefined);
      setRuleCategory('');
      setRuleLevel('medium');
      setRuleMaxInstant(100);
      setRulePartnerId('');
    }
    setRuleModalOpen(true);
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleCategory.trim()) {
      setError('Category is required.');
      return;
    }

    setSubmittingRule(true);
    setError(null);
    try {
      await accountabilityService.setRule({
        id: editingRuleId,
        category: ruleCategory.trim(),
        level: ruleLevel,
        requiresApproval: ruleLevel !== 'low',
        maxInstantAmount: ruleLevel === 'low' ? 10000 : (ruleLevel === 'medium' ? ruleMaxInstant : 0),
        partnerId: rulePartnerId ? Number(rulePartnerId) : null,
      });

      setSuccessMsg(editingRuleId ? 'Rule updated successfully.' : 'Rule created successfully.');
      setRuleModalOpen(false);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to save rule');
    } finally {
      setSubmittingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!window.confirm('Delete this commitment rule?')) return;
    try {
      await accountabilityService.deleteRule(ruleId);
      setSuccessMsg('Commitment rule removed.');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete rule');
    }
  };

  const handleRunEvaluation = async () => {
    const amt = parseFloat(evalAmount);
    if (isNaN(amt) || amt < 0 || !evalCategory.trim()) return;

    setEvaluating(true);
    try {
      const result = await accountabilityService.evaluateRequirement(amt, evalCategory.trim());
      setEvalResult(result);
    } catch (err: any) {
      setError('Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const openDecisionModal = (req: PartnerViewRequest) => {
    setSelectedRequest(req);
    setDecisionNotes('');
    setDecisionModalOpen(true);
  };

  const handleDecisionSubmit = async (decision: 'approved' | 'declined') => {
    if (!selectedRequest || !selectedPartnerEmail) return;

    setSubmittingDecision(true);
    setError(null);
    try {
      await accountabilityService.recordPartnerDecision(
        selectedRequest.id,
        decision,
        decisionNotes,
        selectedPartnerEmail
      );
      setSuccessMsg(`Request #${selectedRequest.id} marked as ${decision}.`);
      setDecisionModalOpen(false);
      await handlePartnerEmailChange(selectedPartnerEmail);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to record decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const activePartnersCount = partners.filter(p => p.status === 'active').length;
  const pendingPartnersCount = partners.filter(p => p.status === 'pending').length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'primary.dark',
                color: 'primary.contrastText',
                display: 'flex',
                boxShadow: 2,
              }}
            >
              <SupervisorAccount sx={{ fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                FinFolio Accountability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pre-spending friction, 3-tier commitment rules, and mentors with strict privacy boundaries
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              disabled={loading}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setInviteModalOpen(true)}
              size="small"
            >
              Invite Partner
            </Button>
          </Box>
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

      {/* Overview Stat Cards */}
      <GridTyped container spacing={3} sx={{ mb: 4 }}>
        <GridTyped item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  ACTIVE PARTNERS
                </Typography>
                <VerifiedUser color="success" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {activePartnersCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pendingPartnersCount} pending invitation{pendingPartnersCount === 1 ? '' : 's'}
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  COMMITMENT RULES
                </Typography>
                <Rule color="primary" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {rules.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Essential, Important & Discretionary tiers
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>

        <GridTyped item xs={12} sm={4}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  PRIVACY ARCHITECTURE
                </Typography>
                <Lock color="secondary" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                Strict Server Boundary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Partners never see your wallet balance or salary
              </Typography>
            </CardContent>
          </Card>
        </GridTyped>
      </GridTyped>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab icon={<Rule />} iconPosition="start" label="Commitment Rules" />
          <Tab icon={<SupervisorAccount />} iconPosition="start" label="Accountability Partners" />
          <Tab icon={<Security />} iconPosition="start" label="Partner Portal & Privacy Boundary" />
          <Tab icon={<WarningAmber />} iconPosition="start" label="Emergency Alerts Feed" />
        </Tabs>
      </Box>

      {/* TAB 0: COMMITMENT RULES */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                3-Tier Spending Framework
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define your rules to enforce friction where it matters while keeping essentials friction-free.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={() => openRuleModal()}
            >
              Add Custom Rule
            </Button>
          </Box>

          {/* Tier Explanatory Cards */}
          <GridTyped container spacing={2} sx={{ mb: 3 }}>
            <GridTyped item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  🟢 TIER 1: ESSENTIAL (Low Friction)
                </Typography>
                <Typography variant="caption" display="block">
                  Groceries, rent, medical, utility bills. Executes instantly without requiring partner approval.
                </Typography>
              </Paper>
            </GridTyped>

            <GridTyped item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  🟡 TIER 2: IMPORTANT (Configurable)
                </Typography>
                <Typography variant="caption" display="block">
                  Work tools, transit, maintenance. Purchases up to threshold execute instantly; higher amounts require partner approval.
                </Typography>
              </Paper>
            </GridTyped>

            <GridTyped item xs={12} md={4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  🔴 TIER 3: DISCRETIONARY (High Friction)
                </Typography>
                <Typography variant="caption" display="block">
                  Luxury, dining, gaming, travel. Always requires accountability partner review before savings deduction.
                </Typography>
              </Paper>
            </GridTyped>
          </GridTyped>

          {/* Rules Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tier / Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Instant Threshold</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Approval Required</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Assigned Partner</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No commitment rules configured yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map(rule => {
                    const assignedPartner = partners.find(p => p.id === rule.partnerId);
                    return (
                      <TableRow key={rule.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{rule.category}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              rule.level === 'low'
                                ? 'Essential (Low)'
                                : rule.level === 'medium'
                                ? 'Important (Medium)'
                                : 'Discretionary (High/Strict)'
                            }
                            color={
                              rule.level === 'low'
                                ? 'success'
                                : rule.level === 'medium'
                                ? 'warning'
                                : 'error'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {rule.level === 'low'
                            ? 'Unlimited ($10,000)'
                            : rule.level === 'medium'
                            ? `$${rule.maxInstantAmount.toFixed(2)}`
                            : '$0.00 (Zero instant)'}
                        </TableCell>
                        <TableCell>
                          {rule.requiresApproval ? (
                            <Chip size="small" label="Yes (Above Limit)" color="warning" />
                          ) : (
                            <Chip size="small" label="No (Instant)" color="success" />
                          )}
                        </TableCell>
                        <TableCell>
                          {assignedPartner ? (
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {assignedPartner.name} ({assignedPartner.relationship})
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Any active partner
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => openRuleModal(rule)}>
                            Edit
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Interactive Rule Evaluator Simulator */}
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                ⚡ Test Rule Engine Evaluator
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Simulate how FinFolio evaluates an expenditure before any withdrawal occurs.
              </Typography>

              <GridTyped container spacing={2} alignItems="center">
                <GridTyped item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Amount ($)"
                    type="number"
                    value={evalAmount}
                    onChange={e => setEvalAmount(e.target.value)}
                    size="small"
                  />
                </GridTyped>
                <GridTyped item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Category"
                    value={evalCategory}
                    onChange={e => setEvalCategory(e.target.value)}
                    size="small"
                  />
                </GridTyped>
                <GridTyped item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleRunEvaluation}
                    disabled={evaluating}
                    size="medium"
                  >
                    {evaluating ? <CircularProgress size={24} /> : 'Evaluate Friction'}
                  </Button>
                </GridTyped>
              </GridTyped>

              {evalResult && (
                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: evalResult.requiresApproval ? 'warning.light' : 'success.light' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {evalResult.requiresApproval
                      ? '🔒 PARTNER REVIEW REQUIRED BEFORE SPENDING'
                      : '⚡ INSTANT WITHDRAWAL PERMITTED'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tier:</strong> {evalResult.tier.toUpperCase()} | <strong>Instant Limit:</strong> ${evalResult.maxInstantAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Engine Decision:</strong> {evalResult.reason}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* TAB 1: ACCOUNTABILITY PARTNERS */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Trusted Mentors & Accountability Partners
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partners act as sounding boards. They do NOT own your money and cannot access your funds.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={() => setInviteModalOpen(true)}
            >
              Invite New Partner
            </Button>
          </Box>

          <GridTyped container spacing={3}>
            {partners.length === 0 ? (
              <GridTyped item xs={12}>
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                  <SupervisorAccount sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="h6">No accountability partners yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Invite a trusted mentor, spouse, or friend to support your savings commitments.
                  </Typography>
                  <Button variant="contained" onClick={() => setInviteModalOpen(true)}>
                    Invite Partner
                  </Button>
                </Paper>
              </GridTyped>
            ) : (
              partners.map(partner => (
                <GridTyped item xs={12} md={6} key={partner.id}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {partner.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {partner.email}
                          </Typography>
                        </Box>
                        <Chip
                          label={partner.status.toUpperCase()}
                          size="small"
                          color={
                            partner.status === 'active'
                              ? 'success'
                              : partner.status === 'pending'
                              ? 'warning'
                              : 'default'
                          }
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Chip size="small" variant="outlined" label={partner.relationship} />
                        <Typography variant="caption" color="text.secondary">
                          Added on {new Date(partner.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        {partner.status === 'pending' && (
                          <Tooltip title="Simulate the partner accepting this invitation from their email link">
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleAcceptSimulation(partner.id, partner.email)}
                            >
                              Simulate Accept
                            </Button>
                          </Tooltip>
                        )}
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => handleRevoke(partner.id)}
                        >
                          Revoke
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </GridTyped>
              ))
            )}
          </GridTyped>
        </Box>
      )}

      {/* TAB 2: PARTNER PORTAL & PRIVACY BOUNDARY */}
      {activeTab === 2 && (
        <Box>
          {/* Privacy Boundary Banner */}
          <Alert severity="info" icon={<Lock />} sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Strict Server-Side Privacy Boundary Enforced
            </Typography>
            <Typography variant="caption" display="block">
              When reviewing pending discretionary spending requests, accountability partners only see decision-critical metrics:
              withdrawal amount, category, user's stated reason, estimated goal delay, and runway impact.
              <strong> The user's total wallet balance, monthly income, private expenses, and debt are strictly concealed.</strong>
            </Typography>
          </Alert>

          {/* Partner Selector */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Viewing Partner Inbox for:
            </Typography>
            <TextField
              select
              size="small"
              value={selectedPartnerEmail}
              onChange={e => handlePartnerEmailChange(e.target.value)}
              sx={{ minWidth: 260 }}
            >
              {partners
                .filter(p => p.status === 'active')
                .map(p => (
                  <MenuItem key={p.id} value={p.email}>
                    {p.name} ({p.email})
                  </MenuItem>
                ))}
              {partners.filter(p => p.status === 'active').length === 0 && (
                <MenuItem value="" disabled>
                  No active partners found
                </MenuItem>
              )}
            </TextField>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => handlePartnerEmailChange(selectedPartnerEmail)}
              disabled={!selectedPartnerEmail}
            >
              Refresh Inbox
            </Button>
          </Box>

          {/* Requests Table */}
          <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason / Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Goal Delay Impact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Runway Impact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partnerInbox.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedPartnerEmail
                          ? 'No requests assigned to this partner email.'
                          : 'Select an active partner above to view their review inbox.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  partnerInbox.map(req => (
                    <TableRow key={req.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>#{req.id}</TableCell>
                      <TableCell>{req.category}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                        ${req.amount.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220 }}>{req.reason}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`+${req.estimatedDelayDays} days`}
                          color={req.estimatedDelayDays > 14 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`-${req.runwayImpactMonths.toFixed(1)} mo`}
                          color={req.runwayImpactMonths > 0.5 ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={req.status.toUpperCase()}
                          color={
                            req.status === 'approved'
                              ? 'success'
                              : req.status === 'declined'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        {req.status === 'pending' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => openDecisionModal(req)}
                          >
                            Review & Decide
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Decided ({req.status})
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* TAB 3: EMERGENCY ALERTS & NOTIFICATIONS FEED */}
      {activeTab === 3 && (
        <Box>
          <Alert severity="warning" icon={<WarningAmber />} sx={{ mb: 3 }}>
            <strong>Emergency Liquidity Activity:</strong> This feed reflects emergency withdrawals executed immediately by the user. Active partners receive transparent post-execution notifications ensuring full visibility while preserving instant emergency access.
          </Alert>

          {notifications.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                No Emergency Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No emergency withdrawals or unblock events have occurred. All spending has followed standard commitment tiers.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Alert / Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date &amp; Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map(n => (
                    <TableRow key={n.id} hover sx={{ bgcolor: n.read ? 'inherit' : 'rgba(239, 68, 68, 0.04)' }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WarningAmber color="error" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {n.title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{n.partnerEmail}</TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>{n.message}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={n.read ? 'READ' : 'NEW'}
                          color={n.read ? 'default' : 'error'}
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {!n.read && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMarkNotificationRead(n.id)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* DIALOG: INVITE PARTNER */}
      <Dialog open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleInviteSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>Invite Accountability Partner</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your partner will receive requests for discretionary spending that exceeds your commitment rules.
              They cannot access your funds or see your full financial history.
            </Typography>

            <TextField
              fullWidth
              required
              label="Partner's Full Name"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              required
              type="email"
              label="Partner's Email Address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Relationship"
              value={inviteRelationship}
              onChange={e => setInviteRelationship(e.target.value)}
            >
              {relationshipOptions.map(opt => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Send />}
              disabled={submittingInvite}
            >
              {submittingInvite ? <CircularProgress size={24} /> : 'Send Invitation'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: COMMITMENT RULE */}
      <Dialog open={ruleModalOpen} onClose={() => setRuleModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleRuleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingRuleId ? 'Edit Commitment Rule' : 'New Commitment Rule'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure spending boundaries to establish intentional friction for your goals.
            </Typography>

            <TextField
              fullWidth
              required
              label="Expense Category"
              value={ruleCategory}
              onChange={e => setRuleCategory(e.target.value)}
              placeholder="e.g. Dining Out, Video Games, Luxury Tech"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              select
              label="Commitment Tier"
              value={ruleLevel}
              onChange={e => setRuleLevel(e.target.value as CommitmentLevel)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="low">🟢 Essential (Low Friction, Instant Approval)</MenuItem>
              <MenuItem value="medium">🟡 Important (Configurable Instant Limit)</MenuItem>
              <MenuItem value="high">🔴 Discretionary (Strict Approval Required)</MenuItem>
            </TextField>

            {ruleLevel === 'medium' && (
              <TextField
                fullWidth
                label="Instant Purchase Limit ($)"
                type="number"
                value={ruleMaxInstant}
                onChange={e => setRuleMaxInstant(parseFloat(e.target.value) || 0)}
                helperText="Purchases up to this amount execute without friction; amounts above require partner approval."
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              fullWidth
              select
              label="Assigned Accountability Partner (Optional)"
              value={rulePartnerId}
              onChange={e => setRulePartnerId(e.target.value === '' ? '' : Number(e.target.value))}
              helperText="If specified, only this mentor will be requested for approvals in this category."
            >
              <MenuItem value="">Any Active Partner</MenuItem>
              {partners
                .filter(p => p.status === 'active')
                .map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.relationship})
                  </MenuItem>
                ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setRuleModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submittingRule}>
              {submittingRule ? <CircularProgress size={24} /> : 'Save Rule'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: PARTNER DECISION MODAL */}
      <Dialog open={decisionModalOpen} onClose={() => setDecisionModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Review Spending Request #{selectedRequest?.id}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 1 }}>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Category: <strong>{selectedRequest.category}</strong>
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', my: 1 }}>
                  ${selectedRequest.amount.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Reason:</strong> {selectedRequest.reason}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Chip
                    size="small"
                    label={`Delay: +${selectedRequest.estimatedDelayDays} days to goal`}
                    color="warning"
                  />
                  <Chip
                    size="small"
                    label={`Runway Impact: -${selectedRequest.runwayImpactMonths.toFixed(1)} months`}
                    color="error"
                  />
                </Box>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Partner Guidance / Feedback Notes"
                placeholder="Share your perspective, e.g. 'Is there an alternative?' or 'Go for it, you earned this.'"
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => handleDecisionSubmit('declined')}
              disabled={submittingDecision}
            >
              Decline Request
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleDecisionSubmit('approved')}
              disabled={submittingDecision}
            >
              Approve Request
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
