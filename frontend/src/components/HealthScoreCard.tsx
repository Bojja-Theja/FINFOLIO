import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Box, 
  Chip, 
  Stack, 
  Alert,
  CircularProgress,
  keyframes,
  alpha,
} from '@mui/material';
import { 
  Shield as ShieldIcon, 
  TrendingUp as TrendingUpIcon, 
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Bolt as BoltIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface HealthScoreCardProps {
  score: number; // 0 to 100
  category: string; // e.g., "Savings", "Investments", "Debt Ratio"
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
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.3) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  position: 'relative',
  overflow: 'visible',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 0.3s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: theme.palette.primary.main,
  },
}));

const ScoreCircle = styled(Box)(({ theme }) => ({
  width: 140,
  height: 140,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  margin: '0 auto 20px',
  boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
    animation: `${pulse} 2s ease-in-out infinite`,
  },
}));

const StatusBadge = styled(Chip)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '0.85rem',
  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
  border: `2px solid ${theme.palette.success.main}`,
  '&.warning': {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
    borderColor: theme.palette.warning.main,
  },
  '&.error': {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
    borderColor: theme.palette.error.main,
  },
}));

const AnimatedScore = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayValue((prev) => {
          if (prev < value) {
            return Math.min(prev + Math.ceil(value / 20), value);
          }
          return prev;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <Typography variant="h2" fontWeight="800" color="white" sx={{ position: 'relative', zIndex: 1 }}>
      {displayValue}
      <Typography component="span" variant="h5" color="white" sx={{ ml: 0.5, opacity: 0.9 }}>
        {suffix}
      </Typography>
    </Typography>
  );
};

const HealthScoreCard = React.memo(function HealthScoreCard({ score, category }: HealthScoreCardProps) {
  
  const getStatus = (score: number) => {
    if (score >= 80) {
      return {
        color: 'success',
        label: 'Secure',
        icon: <CheckCircleIcon fontSize="small" />,
        className: '',
      };
    }
    if (score >= 50) {
      return {
        color: 'warning',
        label: 'At Risk',
        icon: <BoltIcon fontSize="small" />,
        className: 'warning',
      };
    }
    return {
      color: 'error',
      label: 'Critical',
      icon: <WarningIcon fontSize="small" />,
      className: 'error',
    };
  };

  const getRecommendation = (score: number) => {
    if (score >= 80) return "Excellent! Your emergency fund allocation is optimal. Keep maintaining this healthy balance.";
    if (score >= 50) return "Consider increasing your SIP allocation to build a stronger safety net and improve your financial resilience.";
    return "Action Needed: Your expense data indicates high vulnerability. Review your spending and establish an emergency fund.";
  };

  const status = getStatus(score);

  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        {/* Header: Category and Status Badge */}
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
            {category}
          </Typography>
          <StatusBadge 
            icon={status.icon} 
            label={status.label} 
            color={status.color as 'success' | 'warning' | 'error'}
            variant="outlined"
            className={status.className}
          />
        </Stack>

        {/* Score Display with Circle */}
        <ScoreCircle>
          <AnimatedScore value={score} suffix="/100" />
        </ScoreCircle>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            fontWeight: 500,
            fontSize: '0.95rem',
          }}
        >
          Financial Health Score
        </Typography>

        {/* Progress Bar with Gradient */}
        <Box sx={{ width: '100%', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" fontWeight="600" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight="600" color="primary">
              {score}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            color={status.color as 'success' | 'warning' | 'error'}
            sx={{ 
              height: 12, 
              borderRadius: 10,
              backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.5),
            }} 
          />
        </Box>

        {/* Actionable Insight */}
        <Alert
          severity={status.color as 'success' | 'warning' | 'error'}
          icon={false}
          sx={{
            borderRadius: 12,
            background: (theme) => alpha(
              theme.palette[status.color as 'success' | 'warning' | 'error'].main,
              0.08
            ),
            border: (theme) => `1px solid ${alpha(theme.palette[status.color as 'success' | 'warning' | 'error'].main, 0.2)}`,
            backdropFilter: 'blur(10px)',
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
              color: `${status.color}.main`,
            }}
          >
            💡 AI RECOMMENDATION:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: status.color === 'success' ? '#059669' : status.color === 'warning' ? '#D97706' : '#DC2626',
            }}
          >
            {getRecommendation(score)}
          </Typography>
        </Alert>
      </CardContent>
    </StyledCard>
  );
});

export default HealthScoreCard;