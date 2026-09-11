import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  alpha,
  keyframes,
  Tooltip,
} from '@mui/material';
import {
  ErrorOutline as EmergencyIcon,
  TrendingDown as TrendingDownIcon,
  Event as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface SurvivalCalculatorCardProps {
  months?: number;
  category?: string;
  survivalDays?: number;
  monthlyExpenses?: number;
  emergencyFund?: number;
}

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.3) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 0.6s ease-out 0.2s backwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 50px ${alpha(theme.palette.error.main, 0.15)}`,
    borderColor: theme.palette.error.main,
  },
}));

const SurvivalIndicator = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  margin: '0 auto 20px',
  boxShadow: `0 15px 40px ${alpha(theme.palette.error.main, 0.3)}`,
  animation: `${pulse} 2s infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -2,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)}, ${alpha(theme.palette.error.dark, 0.1)})`,
  },
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.8rem',
  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
  border: `2px solid ${theme.palette.error.main}`,
  color: theme.palette.error.dark,
}));

export default function SurvivalCalculatorCard({
  months = 0,
  category = 'Unknown',
  survivalDays = 0,
  monthlyExpenses = 0,
  emergencyFund = 0,
}: SurvivalCalculatorCardProps) {
  const [animatedDays, setAnimatedDays] = useState(0);

  // Support both old and new props
  const displayDays = survivalDays || months * 30;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedDays((prev) => {
        if (prev < displayDays) {
          return Math.min(prev + Math.ceil(displayDays / 30), displayDays);
        }
        return prev;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [displayDays]);

  const survivalMonths = (displayDays / 30).toFixed(1);
  const riskLevel = displayDays < 30 ? 'Critical' : displayDays < 90 ? 'Low' : 'Healthy';
  const riskColor =
    displayDays < 30 ? 'error' : displayDays < 90 ? 'warning' : 'success';

  // If new props are provided, show enhanced view
  if (survivalDays && monthlyExpenses && emergencyFund) {
    return (
      <StyledCard elevation={0}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography
              variant="subtitle1"
              fontWeight="600"
              color="text.secondary"
              sx={{
                fontSize: '0.95rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Financial Survival
            </Typography>
            <StatusBadge
              icon={<EmergencyIcon />}
              label={riskLevel}
              variant="outlined"
            />
          </Stack>

          {/* Survival Days Indicator */}
          <SurvivalIndicator>
            <Typography
              variant="h3"
              fontWeight="800"
              color="white"
              sx={{ position: 'relative', zIndex: 1 }}
            >
              {animatedDays}
            </Typography>
            <Typography
              variant="caption"
              color="white"
              sx={{ position: 'relative', zIndex: 1, opacity: 0.9, fontSize: '0.75rem' }}
            >
              DAYS
            </Typography>
          </SurvivalIndicator>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            How long you can survive financially
          </Typography>

          {/* Metrics Grid */}
          <Stack spacing={2} mb={3}>
            <Box
              sx={{
                p: 2,
                borderRadius: 12,
                background: alpha('#F8FAFC', 0.5),
                border: `1px solid ${alpha('#E2E8F0', 0.5)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <TrendingDownIcon />
              </Box>
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Monthly Expenses
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  color="text.primary"
                >
                  ₹{monthlyExpenses?.toLocaleString('en-IN') || '0'}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 12,
                background: alpha('#F8FAFC', 0.5),
                border: `1px solid ${alpha('#E2E8F0', 0.5)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'success.main',
                }}
              >
                <AttachMoneyIcon />
              </Box>
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Emergency Fund
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  color="text.primary"
                >
                  ₹{emergencyFund?.toLocaleString('en-IN') || '0'}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 12,
                background: alpha('#F8FAFC', 0.5),
                border: `1px solid ${alpha('#E2E8F0', 0.5)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.1), rgba(108, 99, 255, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'secondary.main',
                }}
              >
                <CalendarIcon />
              </Box>
              <Box sx={{ flex: 1, textAlign: 'left' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Survival Period
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  color="text.primary"
                >
                  ~{survivalMonths} months
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Recommendation */}
          <Box
            sx={{
              p: 3,
              borderRadius: 12,
              background: (theme) => alpha(theme.palette.error.main, 0.08),
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              backdropFilter: 'blur(10px)',
              textAlign: 'left',
            }}
          >
            <Typography
              variant="caption"
              fontWeight="700"
              display="block"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 0.5,
                color: 'error.main',
              }}
            >
              ⚡ TARGET: 6 MONTHS
            </Typography>
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.6,
                color: 'text.primary',
              }}
            >
              {survivalDays < 30
                ? '🚨 Critical! Build your emergency fund immediately to cover at least 3-6 months of expenses.'
                : survivalDays < 180
                ? '📈 Good progress! Aim to increase your emergency fund to cover 6 months of expenses.'
                : '✅ Excellent! Your emergency fund provides strong financial security.'}
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  // Fallback to old simple view for backward compatibility
  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Emergency Survival
          </Typography>
          <Chip label={category} size="small" color="primary" variant="outlined" />
        </Stack>
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 1,
          }}
        >
          {months} months
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Coverage: {category}
        </Typography>
      </CardContent>
    </StyledCard>
  );
}