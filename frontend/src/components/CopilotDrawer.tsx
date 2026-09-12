'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Chip,
  Paper,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  WarningAmber as WarningIcon,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
  WorkOutline as WorkIcon,
} from '@mui/icons-material';
import { useCurrency } from '@/context/CurrencyContext';

interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface CopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  userContext?: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    emergencyFund?: number;
    totalDebt?: number;
    runwayMonths?: number;
  };
}

export default function CopilotDrawer({ open, onClose, userContext }: CopilotDrawerProps) {
  const { currencyInfo, formatAmount } = useCurrency();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultContext = {
    monthlyIncome: userContext?.monthlyIncome || 5500,
    monthlyExpenses: userContext?.monthlyExpenses || 3200,
    emergencyFund: userContext?.emergencyFund || 12000,
    totalDebt: userContext?.totalDebt || 18000,
    runwayMonths: userContext?.runwayMonths || 3.75,
  };

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your FINFOLIO AI Financial Copilot. I analyze your financial health in real time across cash flow, debt, and career resilience. Ask me anything or try one of the critical scenarios below.`,
      timestamp: 'Just now',
    },
  ]);

  const QUICK_SCENARIOS = [
    {
      icon: <WarningIcon fontSize="small" sx={{ color: 'warning.main' }} />,
      label: '🚨 What if I get laid off next month?',
      prompt: 'What happens if I get laid off next month? How long can I survive and what steps should I take?',
    },
    {
      icon: <CreditCardIcon fontSize="small" sx={{ color: 'error.main' }} />,
      label: '💳 Should I use emergency cash for debt?',
      prompt: 'Should I use my emergency fund to pay off my 16% high-interest credit card debt right now?',
    },
    {
      icon: <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />,
      label: '🚗 Can I afford a new loan EMI?',
      prompt: 'Can I afford a new loan with an EMI of ₹35,000/month given my current income and expenses?',
    },
    {
      icon: <WorkIcon fontSize="small" sx={{ color: 'info.main' }} />,
      label: '💼 How do I protect my career from tech layoffs?',
      prompt: 'How do I protect my income against tech layoffs and what high-demand skills should I train for?',
    },
  ];

  const generateScenarioResponse = (prompt: string): string => {
    const p = prompt.toLowerCase();
    const income = defaultContext.monthlyIncome;
    const expenses = defaultContext.monthlyExpenses;
    const efund = defaultContext.emergencyFund;
    const debt = defaultContext.totalDebt;
    const runway = (efund / (expenses || 1)).toFixed(1);
    const survivalExpenses = (expenses * 0.65).toFixed(0);
    const survivalRunway = (efund / (Number(survivalExpenses) || 1)).toFixed(1);

    if (p.includes('laid off') || p.includes('job loss')) {
      return `### 🚨 Layoff Defense Audit

Based on your current profile:
- **Emergency Reserve:** ${formatAmount(efund)}
- **Normal Monthly Burn:** ${formatAmount(expenses)}/mo
- **Standard Runway:** **${runway} months**

#### 🛡️ Recommended Emergency Protocol:
1. **Activate Survival Mode:** Freeze discretionary subscriptions & dining immediately to reduce monthly burn to **${formatAmount(Number(survivalExpenses))}/mo** (-35%).
2. **Extended Runway:** Under Survival Mode, your runway extends from **${runway} months to ${survivalRunway} months**, buying you an extra **${(Number(survivalRunway) - Number(runway)).toFixed(1)} months** to interview.
3. **Debt Pausing:** Request a 90-day hardship forbearance from your lenders before missing any payment.
4. **Income Pivot:** Use our **Job Trainer** to audit your current tech stack against in-demand roles and start upskilling immediately.`;
    }

    if (p.includes('emergency fund') && (p.includes('debt') || p.includes('credit card'))) {
      return `### 💳 Emergency Reserve vs. High-Interest Debt Triage

**The Golden Rule of Financial Resilience:** Never deplete your emergency cushion below **3 months of non-negotiable living expenses** (${formatAmount(expenses * 3)}).

- **Current Emergency Buffer:** ${formatAmount(efund)}
- **Minimum 3-Month Safety Floor:** ${formatAmount(expenses * 3)}
- **Surplus Available for Debt:** ${
        efund > expenses * 3
          ? `**${formatAmount(efund - expenses * 3)}** can be safely deployed today to crush your highest APR debt!`
          : `₹0. Depleting your reserve now leaves you vulnerable to eviction or medical emergency.`
      }

#### Strategy Recommendation:
Adopt the **Debt Avalanche Method**: maintain minimum payments on all accounts and redirect every rupee of fresh monthly surplus to the single highest-interest balance.`;
    }

    if (p.includes('afford') || p.includes('car') || p.includes('emi')) {
      const dtiCurrent = ((debt * 0.03) / income) * 100;
      const emiTest = 35000;
      const dtiNew = (((debt * 0.03) + emiTest) / income) * 100;

      return `### 🚗 Loan Affordability & DTI Impact Analysis

Testing a **${formatAmount(emiTest)}/month** installment against your income of **${formatAmount(income)}/month**:

- **Current Estimated DTI:** **${dtiCurrent.toFixed(1)}%**
- **Projected New DTI:** **${dtiNew.toFixed(1)}%**
- **Safe Banking Ceiling:** **36% to 40%**
- **Net Monthly Free Cash Flow:** ${formatAmount(income - expenses - emiTest)}/month

#### Verdict:
${
  dtiNew <= 40
    ? `✅ **Affordable with Caution:** Your projected DTI (${dtiNew.toFixed(1)}%) remains within prudent institutional limits. However, ensure you still allocate at least 15% of your income toward liquid savings before signing.`
    : `⚠️ **High Risk:** Adding this EMI pushes your debt obligations near/above the 40% risk threshold, increasing your vulnerability to cash flow crunches.`
}`;
    }

    if (p.includes('career') || p.includes('protect') || p.includes('skill') || p.includes('job trainer')) {
      return `### 💼 Career Resilience & Skills Hedge

Financial resilience is only half the battle; defending your primary income engine is paramount in volatile tech markets.

#### Top Recommendations:
1. **Role Transition:** Cloud Architects, MLOps Engineers, and Full-Stack Python/Go specialists are seeing 35–45% higher compensation stability than legacy tech roles.
2. **Skill Gap:** Run our **Job Trainer** module to compare your resume against 900+ real industry job benchmarks.
3. **Emergency Multiplier:** Professionals with 4+ in-demand complementary skills find new placement in under 60 days vs. 180 days industry average.`;
    }

    return `### 💡 Copilot Financial Analysis

Here is a summary of your financial health:
- **Net Monthly Surplus:** **${formatAmount(income - expenses)}** (${(((income - expenses) / income) * 100).toFixed(1)}% savings rate)
- **Current Runway:** **${runway} months** of living expenses
- **Solvency Status:** ${debt > 0 ? `Active debt load of ${formatAmount(debt)}` : 'Debt-free!'}

Feel free to ask specific questions about budgeting, debt payoffs, tax optimization, or layoff planning!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    setTimeout(() => {
      const botResponse = generateScenarioResponse(query);
      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 450);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 24,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc'),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            <BotIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="800">
              FINFOLIO AI Copilot
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time resilience advisor • {currencyInfo.code}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Context Badge */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : '#f1f5f9'),
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Runway: <strong>{defaultContext.runwayMonths} mos</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Burn: <strong>{formatAmount(defaultContext.monthlyExpenses)}/mo</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Reserve: <strong>{formatAmount(defaultContext.emergencyFund)}</strong>
        </Typography>
      </Box>

      {/* Messages Scroll Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2.5 }}>
        <Stack spacing={2.5}>
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                gap: 1.5,
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.sender === 'assistant' && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', mt: 0.5 }}>
                  <BotIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  maxWidth: '85%',
                  bgcolor:
                    msg.sender === 'user'
                      ? 'primary.main'
                      : (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc'),
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  border: '1px solid',
                  borderColor:
                    msg.sender === 'user'
                      ? 'primary.main'
                      : (theme) => (theme.palette.mode === 'dark' ? 'rgba(51, 65, 85, 0.6)' : '#e2e8f0'),
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    '& strong': { fontWeight: 700 },
                    '& h3': { fontSize: '0.95rem', fontWeight: 800, mt: 0, mb: 1 },
                    '& h4': { fontSize: '0.85rem', fontWeight: 700, mt: 1.5, mb: 0.5 },
                    '& ul': { pl: 2, my: 0.5 },
                  }}
                >
                  {msg.text}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    textAlign: 'right',
                    mt: 1,
                    opacity: 0.7,
                    fontSize: '0.65rem',
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                <BotIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <CircularProgress size={16} color="inherit" />
                <Typography variant="caption" color="text.secondary">
                  Analyzing portfolio resilience...
                </Typography>
              </Paper>
            </Box>
          )}
        </Stack>

        {/* Quick Scenario Chips */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ⚡ Instant Crisis &amp; Planning Scenarios
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {QUICK_SCENARIOS.map((scen, idx) => (
              <Button
                key={idx}
                variant="outlined"
                size="small"
                onClick={() => handleSendMessage(scen.prompt)}
                startIcon={scen.icon}
                sx={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 0.8,
                  fontSize: '0.8rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                    borderColor: 'primary.main',
                  },
                }}
              >
                {scen.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#f8fafc'),
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask about layoffs, EMI affordability, debt..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            sx={{ borderRadius: 3, minWidth: 48, px: 2 }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
}
