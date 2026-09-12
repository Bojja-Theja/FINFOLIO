import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Fab,
  Drawer,
  useMediaQuery,
  useTheme,
  Stack,
  Divider,
  Alert,
  Paper,
  alpha
} from '@mui/material';
import {
  Send,
  Close,
  SmartToy,
  TrendingUp,
  AccountBalance,
  Shield,
  Warning,
  CheckCircle,
  LocalHospital,
  CreditCard,
  WorkOff,
  ShoppingCart,
  Savings,
  RestartAlt
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import api from '@/utils/axiosClient';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[] | undefined;
  isAlert?: boolean | undefined;
  alertType?: 'error' | 'warning' | 'info' | 'success' | undefined;
}

interface UserFinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFund: number;
  debt: number;
  investments: number;
  healthInsuranceCover: number;
  monthlyWants: number;
  hasCustomProfile: boolean;
}

const DEFAULT_PROFILE: UserFinancialProfile = {
  monthlyIncome: 85000,
  monthlyExpenses: 42000,
  emergencyFund: 250000,
  debt: 320000,
  investments: 550000,
  healthInsuranceCover: 500000,
  monthlyWants: 15000,
  hasCustomProfile: false,
};

const AIChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<UserFinancialProfile>(DEFAULT_PROFILE);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Namaste! I'm your FINFOLIO AI Financial Copilot.\n\nI provide deterministic, mathematically grounded advice for your finances in Indian Rupee (₹). Ask me anything about survival runway, job loss defense, medical emergency planning, debt payoffs, or major purchase affordability.",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        'How many days can I survive without a salary?',
        'Can I afford to leave my current job?',
        'What happens if I lose my job tomorrow?',
        'How much should I save every month?',
        'Am I spending too much on entertainment?',
        'How much emergency fund should I maintain?',
        'Can I afford a ₹75,000 purchase?',
        'Medical emergency plan for ₹5 Lakhs',
      ],
    },
  ]);

  // Fetch real profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data) {
          const d = res.data;
          setProfile((prev) => ({
            ...prev,
            monthlyIncome: Number(d.monthlyIncome) || prev.monthlyIncome,
            monthlyExpenses: Number(d.monthlyExpenses) || prev.monthlyExpenses,
            emergencyFund: Number(d.emergencyFund) || prev.emergencyFund,
            debt: Number(d.totalDebt) || prev.debt,
            hasCustomProfile: Boolean(d.monthlyIncome && d.monthlyExpenses),
          }));
        }
      } catch (err) {
        // Continue with active profile
      }
    };
    fetchProfile();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper to parse numbers like 50000, 50k, 1.5L, 2 Lakhs
  const parseAmountFromText = (text: string): number | null => {
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)/i);
    if (lakhMatch && lakhMatch[1]) {
      return parseFloat(lakhMatch[1]) * 100000;
    }
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k/i);
    if (kMatch && kMatch[1]) {
      return parseFloat(kMatch[1]) * 1000;
    }
    const croreMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)/i);
    if (croreMatch && croreMatch[1]) {
      return parseFloat(croreMatch[1]) * 10000000;
    }
    const standardMatch = text.match(/(?:₹|rs\.?|inr)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,})/i);
    if (standardMatch && standardMatch[1]) {
      return parseFloat(standardMatch[1].replace(/,/g, ''));
    }
    return null;
  };

  // Check if user is trying to set profile figures
  const checkProfileUpdate = (msg: string): string | null => {
    const lower = msg.toLowerCase();
    let updated = false;
    const newProfile = { ...profile };

    if (lower.includes('income is') || lower.includes('salary is') || lower.includes('earning')) {
      const amt = parseAmountFromText(msg);
      if (amt && amt > 0) {
        newProfile.monthlyIncome = amt;
        updated = true;
      }
    }
    if (lower.includes('expense is') || lower.includes('expenses are') || lower.includes('spend')) {
      const amt = parseAmountFromText(msg);
      if (amt && amt > 0) {
        newProfile.monthlyExpenses = amt;
        updated = true;
      }
    }
    if (lower.includes('savings are') || lower.includes('emergency fund is') || lower.includes('have in bank')) {
      const amt = parseAmountFromText(msg);
      if (amt && amt > 0) {
        newProfile.emergencyFund = amt;
        updated = true;
      }
    }
    if (lower.includes('debt is') || lower.includes('loan is') || lower.includes('owe')) {
      const amt = parseAmountFromText(msg);
      if (amt !== null && amt >= 0) {
        newProfile.debt = amt;
        updated = true;
      }
    }

    if (updated) {
      newProfile.hasCustomProfile = true;
      setProfile(newProfile);
      return `✅ Profile updated in active session:\n• Monthly Income: ${formatAmount(newProfile.monthlyIncome)}\n• Monthly Expenses: ${formatAmount(newProfile.monthlyExpenses)}\n• Emergency Fund: ${formatAmount(newProfile.emergencyFund)}\n• Total Debt: ${formatAmount(newProfile.debt)}\n\nWhat would you like me to calculate now?`;
    }
    return null;
  };

  // Main Deterministic AI Engine trained on critical scenarios
  const generateResponse = (userMessage: string): { text: string; suggestions?: string[]; isAlert?: boolean; alertType?: 'error' | 'warning' | 'info' | 'success' } => {
    const updateReply = checkProfileUpdate(userMessage);
    if (updateReply) {
      return {
        text: updateReply,
        suggestions: [
          'How many days can I survive without a salary?',
          'Can I afford to leave my current job?',
          'What happens if I lose my job tomorrow?',
        ]
      };
    }

    const lower = userMessage.toLowerCase();
    const { monthlyIncome, monthlyExpenses, emergencyFund, debt, healthInsuranceCover } = profile;

    // Check missing data
    const isMissingData = monthlyExpenses <= 0 || emergencyFund <= 0;
    if (isMissingData && (lower.includes('survive') || lower.includes('runway') || lower.includes('layoff') || lower.includes('leave') || lower.includes('afford'))) {
      return {
        text: `⚠️ **Missing Financial Profile Data**\n\nTo calculate your exact survival days and stress metrics, I need your financial baseline.\n\nPlease type your details (e.g. *"My income is ₹85,000, expenses are ₹40,000, savings are ₹2,00,000"*), or visit the Financial Assessment page.`,
        suggestions: [
          'My income is ₹85,000, expenses ₹40,000, savings ₹2,50,000',
          'Load standard tech worker baseline',
        ],
        isAlert: true,
        alertType: 'warning'
      };
    }

    // Core Metrics
    const standardCoverageMonths = Math.round((emergencyFund / Math.max(1, monthlyExpenses)) * 10) / 10;
    const standardSurvivalDays = Math.round(standardCoverageMonths * 30.417);
    const freezeExpenses = Math.max(1, monthlyExpenses * 0.65); // -35% freeze
    const freezeCoverageMonths = Math.round((emergencyFund / freezeExpenses) * 10) / 10;
    const freezeSurvivalDays = Math.round(freezeCoverageMonths * 30.417);
    const dti = monthlyIncome > 0 ? Math.round((debt * 0.03 / monthlyIncome) * 100) : 0; // Est. 3% monthly debt obligation

    // 1. "How many days can I survive without a salary?"
    if (lower.includes('how many days') || lower.includes('survival days') || lower.includes('days can i survive') || (lower.includes('days') && lower.includes('survive'))) {
      const riskBand = standardSurvivalDays >= 180 ? 'Fortress Healthy' : standardSurvivalDays >= 90 ? 'Moderate Buffer' : standardSurvivalDays >= 30 ? 'Low Cushion' : 'Critical Hazard';
      return {
        text: `🛡️ **EXACT SURVIVAL RUNWAY REPORT**\n\n` +
          `• **Standard Survival:** **${standardSurvivalDays} DAYS** (${standardCoverageMonths} Months)\n` +
          `• **Emergency Freeze Mode:** **${freezeSurvivalDays} DAYS** (${freezeCoverageMonths} Months)\n` +
          `• **Liquid Cash Reserve:** ${formatAmount(emergencyFund)}\n` +
          `• **Monthly Essential Burn:** ${formatAmount(monthlyExpenses)}\n` +
          `• **Safety Classification:** [${riskBand}]\n\n` +
          `💡 **Insight:** In a sudden zero-salary event, your ₹${emergencyFund.toLocaleString('en-IN')} reserve lasts exactly ${standardSurvivalDays} days under normal living. Cutting discretionary wants (-35% burn) instantly extends your life by **${freezeSurvivalDays - standardSurvivalDays} additional days**.`,
        suggestions: [
          'What happens if I lose my job tomorrow?',
          'Can I afford to leave my current job?',
          'How much emergency fund should I maintain?',
        ]
      };
    }

    // 2. "Can I afford to leave my current job?" / Quit job
    if (lower.includes('leave my') || lower.includes('quit my') || lower.includes('resign') || lower.includes('leave current job')) {
      if (standardSurvivalDays < 90) {
        return {
          text: `🚨 **RED ALERT: DO NOT LEAVE YOUR JOB YET**\n\n` +
            `• **Your Survival Runway:** Only **${standardSurvivalDays} Days** (${standardCoverageMonths} Months)\n` +
            `• **Minimum Safe Floor:** At least 180 Days (6 Months)\n` +
            `• **Current Capital Deficit:** ${formatAmount(Math.max(0, monthlyExpenses * 6 - emergencyFund))}\n\n` +
            `⚠️ Resigning now without an offer creates extreme financial vulnerability. In the current Indian hiring market, tech and corporate rehiring takes an average of 4 to 6 months. If you resign today, your cash will deplete in **${standardSurvivalDays} days**, forcing you into high-interest personal loans or debt default.`,
          suggestions: [
            'How much emergency fund should I maintain?',
            'What happens if I lose my job tomorrow?',
            'How can I save more money?',
          ],
          isAlert: true,
          alertType: 'error'
        };
      } else if (standardSurvivalDays < 180) {
        return {
          text: `⚠️ **CAUTION: BORDERLINE RESIGNATION BUFFER**\n\n` +
            `• **Current Survival:** **${standardSurvivalDays} Days** (${standardCoverageMonths} Months)\n` +
            `• **Target Safe Runway:** 180 Days (6 Months)\n\n` +
            `You have enough funds for ${standardSurvivalDays} days, but leaving without an accepted offer is risky if interviews stretch beyond 3 months. Build an additional ${formatAmount(monthlyExpenses * 6 - emergencyFund)} before handing in your notice.`,
          suggestions: ['How to extend my runway?', 'How much should I save every month?'],
          isAlert: true,
          alertType: 'warning'
        };
      } else {
        return {
          text: `✅ **REASONABLY SECURED TRANSITION BUFFER**\n\n` +
            `• **Current Survival:** **${standardSurvivalDays} Days** (${standardCoverageMonths} Months)\n` +
            `• **Emergency Reserve:** ${formatAmount(emergencyFund)}\n\n` +
            `You meet the fortress standard of 6+ months (${standardSurvivalDays} days). You can afford a planned sabbatical or career transition, provided you enforce a freeze budget of ${formatAmount(freezeExpenses)}/month during the gap.`,
          suggestions: ['What happens if I lose my job tomorrow?', 'How to optimize my budget?'],
          isAlert: true,
          alertType: 'success'
        };
      }
    }

    // 3. "What happens to my finances if I lose my job tomorrow?" / Layoff shock
    if (lower.includes('lose my job') || lower.includes('layoff') || lower.includes('laid off') || lower.includes('fired')) {
      return {
        text: `🚨 **CRITICAL SCENARIO: SUDDEN LAYOFF SHOCK TRIAGE**\n\n` +
          `If you lose your job tomorrow:\n` +
          `1. **Immediate Income Drop:** Monthly cash flow drops to ₹0.\n` +
          `2. **Exact Days of Survival:** You have **${standardSurvivalDays} Days** (${standardCoverageMonths} Months) before insolvency.\n` +
          `3. **Fixed Burn Drag:** You will bleed ${formatAmount(monthlyExpenses)} every 30 days.\n` +
          `4. **Debt Obligation:** Total debt of ${formatAmount(debt)} continues accruing interest.\n\n` +
          `🛡️ **Immediate Action Protocol (Day 1 - Day 7):**\n` +
          `• **Activate Freeze Budget:** Cut all dining, OTT subscriptions, and shopping to extend runway to **${freezeSurvivalDays} Days** (+${freezeSurvivalDays - standardSurvivalDays} days).\n` +
          `• **Preserve Health Cover:** Do not let health insurance lapse; hospital bills without corporate cover are the #1 destroyer of emergency funds.\n` +
          `• **Pause Non-Essential Investments:** Redirect equity SIPs into cash buffer until re-employed.`,
        suggestions: [
          'Can I afford to leave my current job?',
          'How much emergency fund should I maintain?',
          'Recommend career switch roles',
        ],
        isAlert: true,
        alertType: 'error'
      };
    }

    // 4. "Can I afford this purchase?" / Affordability test
    if (lower.includes('afford') && (lower.includes('buy') || lower.includes('purchase') || lower.includes('phone') || lower.includes('car') || lower.includes('laptop') || lower.includes('trip') || parseAmountFromText(userMessage))) {
      const purchaseAmount = parseAmountFromText(userMessage) || 50000;
      const monthlySurplus = Math.max(0, monthlyIncome - monthlyExpenses);
      const remainingEmergencyAfterPurchase = emergencyFund - purchaseAmount;
      const runwayAfterPurchase = Math.round((remainingEmergencyAfterPurchase / Math.max(1, monthlyExpenses)) * 30.417);

      if (purchaseAmount > emergencyFund) {
        return {
          text: `❌ **UNACCEPTABLE PURCHASE RISK: CANNOT AFFORD**\n\n` +
            `• **Purchase Cost:** ${formatAmount(purchaseAmount)}\n` +
            `• **Available Emergency Fund:** ${formatAmount(emergencyFund)}\n\n` +
            `This purchase exceeds your entire liquid cash reserve. Funding this through credit cards (36-42% APR) or personal loans will plunge you into an acute debt trap.`,
          suggestions: ['How to save up for this purchase?', 'How much should I save every month?'],
          isAlert: true,
          alertType: 'error'
        };
      } else if (runwayAfterPurchase < 90) {
        return {
          text: `⚠️ **HIGH RISK: PURCHASING BREACHES CRITICAL SAFETY FLOOR**\n\n` +
            `• **Item Cost:** ${formatAmount(purchaseAmount)}\n` +
            `• **Runway Before:** ${standardSurvivalDays} Days\n` +
            `• **Runway After:** **${runwayAfterPurchase} Days** (Critically low!)\n\n` +
            `Spending ${formatAmount(purchaseAmount)} depletes your safety net to just ${runwayAfterPurchase} days. Instead, use your monthly surplus of ${formatAmount(monthlySurplus)} and save for **${Math.ceil(purchaseAmount / Math.max(1, monthlySurplus))} months** to buy it outright without touching emergency reserves.`,
          suggestions: ['How to budget for this?', 'How many days can I survive?'],
          isAlert: true,
          alertType: 'warning'
        };
      } else {
        return {
          text: `✅ **AFFORDABLE WITH DISCRETION**\n\n` +
            `• **Item Cost:** ${formatAmount(purchaseAmount)}\n` +
            `• **Runway Remaining:** ${runwayAfterPurchase} Days (${(runwayAfterPurchase / 30.417).toFixed(1)} Months)\n` +
            `• **Monthly Surplus:** ${formatAmount(monthlySurplus)}/month\n\n` +
            `Your emergency fund will remain above safe limits (${runwayAfterPurchase} days). For optimal financial hygiene, aim to replenish this ${formatAmount(purchaseAmount)} within ${Math.ceil(purchaseAmount / Math.max(1, monthlySurplus))} months from monthly surplus.`,
          suggestions: ['How much should I save every month?', 'Where is most of my money allocated?'],
          isAlert: true,
          alertType: 'success'
        };
      }
    }

    // 5. "Medical emergency plan for ₹5 Lakhs" / Hospitalization
    if (lower.includes('medical') || lower.includes('hospital') || lower.includes('health insurance') || lower.includes('illness')) {
      const shockCost = 500000;
      const outOfPocket = Math.max(0, shockCost - healthInsuranceCover);
      const remainingCash = emergencyFund - outOfPocket;
      const runwayAfterMedical = Math.round((Math.max(0, remainingCash) / Math.max(1, monthlyExpenses)) * 30.417);

      return {
        text: `🏥 **CRITICAL STRESS TEST: ₹5,00,000 MEDICAL EMERGENCY**\n\n` +
          `• **Simulated Hospitalization Cost:** ${formatAmount(shockCost)}\n` +
          `• **Current Health Insurance Cover:** ${formatAmount(healthInsuranceCover)}\n` +
          `• **Estimated Out-of-Pocket Drain:** ${formatAmount(outOfPocket)}\n` +
          `• **Survival Runway After Shock:** **${runwayAfterMedical} Days**\n\n` +
          `💡 **Actionable Recommendation:**\n` +
          `${healthInsuranceCover < shockCost
            ? `⚠️ Your health insurance has a shortfall of ${formatAmount(shockCost - healthInsuranceCover)}. A single hospital admission would drain your liquid savings by ${formatAmount(outOfPocket)}. Expand your medical cover to at least ₹15,00,000 using a Super Top-up policy (est. ₹4,000/year premium).`
            : `✅ Your medical insurance cover of ${formatAmount(healthInsuranceCover)} successfully shields your liquid reserves from catastrophic hospital bills.`}`,
        suggestions: [
          'How many days can I survive without a salary?',
          'How much emergency fund should I maintain?',
          'Compare Old vs New Tax Regime',
        ]
      };
    }

    // 6. "How much emergency fund should I maintain?"
    if (lower.includes('how much emergency') || lower.includes('emergency fund should') || lower.includes('maintain') && lower.includes('emergency')) {
      const min3M = monthlyExpenses * 3;
      const standard6M = monthlyExpenses * 6;
      const fortress12M = monthlyExpenses * 12;

      return {
        text: `🛡️ **EMERGENCY FUND BENCHMARK RECOMMENDATION**\n\n` +
          `Based on your monthly essential expenses of **${formatAmount(monthlyExpenses)}**:\n\n` +
          `• **3-Month Absolute Minimum Floor:** ${formatAmount(min3M)} (90 Days)\n` +
          `• **6-Month Standard Shield (Recommended):** **${formatAmount(standard6M)}** (180 Days)\n` +
          `• **12-Month Fortress Defense:** ${formatAmount(fortress12M)} (365 Days)\n\n` +
          `• **Your Current Reserve:** ${formatAmount(emergencyFund)} (${standardSurvivalDays} Days)\n` +
          `• **Deficit to 6-Month Target:** ${emergencyFund >= standard6M ? '✅ Fully Funded!' : `⚠️ Deficit of ${formatAmount(standard6M - emergencyFund)}`}\n\n` +
          `💡 Keep this fund in high-liquidity, capital-protected instruments: 50% in a Multi-Option Savings Account / Sweep-in FD, and 50% in an Indian Liquid Mutual Fund.`,
        suggestions: [
          'How many days can I survive without a salary?',
          'How much should I save every month?',
          'What happens if I lose my job tomorrow?',
        ]
      };
    }

    // 7. "How much should I save every month?" / 50/30/20 Rule
    if (lower.includes('how much should i save') || lower.includes('save every month') || lower.includes('how much to save') || lower.includes('savings target')) {
      const needs50 = Math.round(monthlyIncome * 0.50);
      const wants30 = Math.round(monthlyIncome * 0.30);
      const savings20 = Math.round(monthlyIncome * 0.20);
      const aggressive30 = Math.round(monthlyIncome * 0.30);

      return {
        text: `💰 **MONTHLY SAVINGS & BUDGET ALLOCATION BLUEPRINT**\n\n` +
          `For your monthly income of **${formatAmount(monthlyIncome)}**:\n\n` +
          `• **Needs / Essentials (50% max):** ${formatAmount(needs50)} (Rent, food, utilities, EMIs)\n` +
          `• **Wants / Lifestyle (30% max):** ${formatAmount(wants30)} (Dining, shopping, travel)\n` +
          `• **Baseline Savings (20% target):** **${formatAmount(savings20)}/month**\n` +
          `• **Aggressive Wealth Creation (30%):** **${formatAmount(aggressive30)}/month**\n\n` +
          `🚀 **Deployment Strategy:**\n` +
          `1. Direct ${formatAmount(Math.min(savings20, 15000))} into Emergency Fund until 6 months (${formatAmount(monthlyExpenses * 6)}) is full.\n` +
          `2. Direct remainder into Nifty 50 Index Mutual Funds via monthly automated SIP.\n` +
          `3. At 12% CAGR, saving ${formatAmount(savings20)}/month compounds to **${formatAmount(savings20 * 12 * 10 * 1.75)} in 10 years**!`,
        suggestions: [
          'Am I spending too much on entertainment?',
          'Where is most of my money allocated?',
          'How many days can I survive without a salary?',
        ]
      };
    }

    // 8. "Am I spending too much on entertainment?" / Discretionary spend
    if (lower.includes('entertainment') || lower.includes('spending too much') || lower.includes('discretionary') || lower.includes('lifestyle spend')) {
      const allowedWants = Math.round(monthlyIncome * 0.30);
      const currentWants = profile.monthlyWants || Math.round(monthlyExpenses * 0.35);
      const isExcessive = currentWants > allowedWants;

      return {
        text: `🎯 **ENTERTAINMENT & DISCRETIONARY AUDIT**\n\n` +
          `• **Current Estimated Discretionary Spend:** ${formatAmount(currentWants)}/month\n` +
          `• **Healthy Upper Limit (30% of Income):** ${formatAmount(allowedWants)}/month\n` +
          `• **Verdict:** ${isExcessive ? `⚠️ Spending ${formatAmount(currentWants - allowedWants)} above optimal benchmark` : `✅ Well within the healthy 30% ceiling`}\n\n` +
          `💡 **Action Step:** High discretionary leakage is the most common reason users fail to reach their 6-month emergency cushion. Trimming just ₹5,00,0/month from entertainment redirects ₹60,000/year into your survival fortress!`,
        suggestions: [
          'How much should I save every month?',
          'Can I afford a ₹75,000 purchase?',
          'How many days can I survive without a salary?',
        ]
      };
    }

    // 9. "Where is most of my money allocated?" / Asset distribution
    if (lower.includes('allocated') || lower.includes('money allocated') || lower.includes('where is my money') || lower.includes('portfolio breakdown')) {
      const totalAssets = emergencyFund + profile.investments;
      const emergencyPct = totalAssets > 0 ? Math.round((emergencyFund / totalAssets) * 100) : 0;
      const investPct = totalAssets > 0 ? Math.round((profile.investments / totalAssets) * 100) : 0;

      return {
        text: `📊 **ACTIVE ASSET ALLOCATION BREAKDOWN**\n\n` +
          `• **Liquid Emergency Reserves:** ${formatAmount(emergencyFund)} (${emergencyPct}% of assets)\n` +
          `• **Long-term Investments & Equity:** ${formatAmount(profile.investments)} (${investPct}% of assets)\n` +
          `• **Total Liquid Net Worth:** ${formatAmount(totalAssets - debt)}\n` +
          `• **Total Debt / Liabilities:** ${formatAmount(debt)}\n\n` +
          `💡 **Asset Health:** Having ${emergencyPct}% in liquid reserves provides an immediate buffer of **${standardSurvivalDays} Days**. Visit the **Asset Allocation page** to view full breakdown across Cash, Deposits, Equities, Gold, and Liabilities.`,
        suggestions: [
          'How many days can I survive without a salary?',
          'Debt payoff strategy (Avalanche)',
          'How much should I save every month?',
        ]
      };
    }

    // 10. Debt Payoff / Avalanche
    if (lower.includes('debt') || lower.includes('loan') || lower.includes('emi') || lower.includes('avalanche') || lower.includes('snowball')) {
      return {
        text: `💳 **HIGH DEBT STRESS & REPAYMENT ACCELERATOR**\n\n` +
          `• **Total Outstanding Debt:** ${formatAmount(debt)}\n` +
          `• **Estimated DTI Ratio:** ${dti}% [${dti > 40 ? '⚠️ High Debt Stress' : '✅ Manageable'}]\n\n` +
          `⚡ **Recommended Strategy: DEBT AVALANCHE**\n` +
          `1. List all loans by Interest Rate (APR) from highest to lowest.\n` +
          `2. Pay minimum payments on all loans to protect your CIBIL score.\n` +
          `3. Throw every extra rupee into the highest interest debt (e.g. Credit Card at 36-42% APR).\n` +
          `4. Once cleared, avalanche that payment into the next highest loan (e.g. Personal Loan at 14%).\n\n` +
          `💰 **Result:** Saves up to 40% in total interest drain compared to standard EMI schedules!`,
        suggestions: [
          'How many days can I survive without a salary?',
          'Can I afford to leave my current job?',
          'How much emergency fund should I maintain?',
        ]
      };
    }

    // Fallback Comprehensive Guidance
    return {
      text: `FINFOLIO AI is ready to stress-test your finances in Indian Rupee (₹).\n\n` +
        `Ask me any critical question:\n` +
        `• *"How many days can I survive without a salary?"*\n` +
        `• *"What happens if I lose my job tomorrow?"*\n` +
        `• *"Can I afford to leave my current job?"*\n` +
        `• *"Can I afford to buy a ₹75,000 laptop?"*\n` +
        `• *"How much should I save from my ₹${monthlyIncome.toLocaleString('en-IN')} income?"*\n` +
        `• *"Medical emergency plan for ₹5 Lakhs"*\n\n` +
        `Or tell me your details anytime: *"My income is ₹90,000, expenses ₹45,000, emergency fund ₹3,00,000"*.`,
      suggestions: [
        'How many days can I survive without a salary?',
        'Can I afford to leave my current job?',
        'What happens if I lose my job tomorrow?',
        'Can I afford a ₹75,000 purchase?',
      ]
    };
  };

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateResponse(messageText);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: botResponse.suggestions,
        isAlert: botResponse.isAlert,
        alertType: botResponse.alertType,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 400);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        text: "🔄 Chat reset. How can I stress-test your finances today?",
        sender: 'bot',
        timestamp: new Date(),
        suggestions: [
          'How many days can I survive without a salary?',
          'Can I afford to leave my current job?',
          'What happens if I lose my job tomorrow?',
          'Can I afford a ₹75,000 purchase?',
        ],
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="Open AI Financial Copilot"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
          zIndex: 1000,
          border: '2px solid rgba(255,255,255,0.2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
        }}
        onClick={() => setOpen(true)}
      >
        <SmartToy sx={{ color: '#ffffff', fontSize: 28 }} />
      </Fab>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 460,
            maxWidth: '100%',
            bgcolor: theme.palette.mode === 'dark' ? '#080c14' : '#f8fafc',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2.5,
              bgcolor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  mr: 1.8,
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  boxShadow: '0 0 12px rgba(37,99,235,0.5)',
                }}
              >
                <SmartToy sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>
                  FINFOLIO AI Copilot
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.6,
                    fontWeight: 700,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      bgcolor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                  Live Indian Rupee (₹) Financial Advisor
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={handleResetChat}
                title="Reset Chat"
                sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#ffffff' } }}
              >
                <RestartAlt fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)', '&:hover': { color: '#ffffff' } }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* User Active Context Pill */}
          <Box
            sx={{
              px: 2.5,
              py: 1,
              bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#f1f5f9',
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Active Baseline: <strong>₹{(profile.monthlyIncome / 1000).toFixed(0)}k/mo</strong> Income • <strong>₹{(profile.emergencyFund / 100000).toFixed(1)}L</strong> Cash
            </Typography>
            <Chip
              label="🇮🇳 INR Native"
              size="small"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'primary.main', color: '#ffffff' }}
            />
          </Box>

          {/* Messages Feed */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2.5,
              bgcolor: theme.palette.mode === 'dark' ? '#080c14' : '#f8fafc',
            }}
          >
            {messages.map((message) => (
              <Box key={message.id} sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 0.8,
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar
                      sx={{
                        mr: 1.2,
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#e0e7ff',
                        color: 'primary.main',
                        border: '1px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      <SmartToy sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}

                  <Box
                    sx={{
                      maxWidth: '85%',
                      p: 2,
                      borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background:
                        message.sender === 'user'
                          ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                          : theme.palette.mode === 'dark'
                            ? '#1e293b'
                            : '#ffffff',
                      color:
                        message.sender === 'user'
                          ? '#ffffff'
                          : theme.palette.mode === 'dark'
                            ? '#f1f5f9'
                            : '#0f172a',
                      border: '1px solid',
                      borderColor:
                        message.sender === 'user'
                          ? '#1d4ed8'
                          : theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : '#e2e8f0',
                      boxShadow:
                        theme.palette.mode === 'dark'
                          ? '0 4px 14px rgba(0,0,0,0.5)'
                          : '0 4px 12px rgba(0,0,0,0.05)',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.65,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'inherit',
                        fontWeight: message.sender === 'user' ? 500 : 400,
                        '& strong': {
                          fontWeight: 700,
                          color: message.sender === 'user' ? '#ffffff' : theme.palette.mode === 'dark' ? '#38bdf8' : '#1d4ed8',
                        },
                      }}
                    >
                      {message.text}
                    </Typography>
                  </Box>
                </Box>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.2, ml: message.sender === 'bot' ? 5 : 0 }}>
                    {message.suggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        size="small"
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.15)' : '#ffffff',
                          color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8',
                          border: '1px solid',
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.35)' : '#bfdbfe',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.3)' : '#eff6ff',
                            borderColor: '#2563eb',
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff',
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Quick Action Crisis Pills */}
            <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
              <Chip
                icon={<WorkOff sx={{ fontSize: 16 }} />}
                label="🚨 Layoff Shock"
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleSend('What happens if I lose my job tomorrow?')}
                clickable
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Chip
                icon={<Shield sx={{ fontSize: 16 }} />}
                label="🛡️ Survival Days"
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => handleSend('How many days can I survive without a salary?')}
                clickable
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Chip
                icon={<LocalHospital sx={{ fontSize: 16 }} />}
                label="🏥 Medical Crisis"
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => handleSend('Medical emergency plan for ₹5 Lakhs')}
                clickable
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
              <Chip
                icon={<CreditCard sx={{ fontSize: 16 }} />}
                label="💳 Debt Triage"
                size="small"
                variant="outlined"
                onClick={() => handleSend('How can I accelerate debt payoff with avalanche?')}
                clickable
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask: 'Can I afford ₹75k purchase?', 'Quit my job?'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                size="small"
                multiline
                maxRows={3}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                sx={{
                  bgcolor: '#2563eb',
                  color: '#ffffff',
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#1d4ed8',
                  },
                  '&:disabled': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                    color: 'text.disabled',
                  },
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIChatbot;
