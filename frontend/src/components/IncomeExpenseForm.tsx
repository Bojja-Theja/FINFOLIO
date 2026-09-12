import { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  Tooltip,
  IconButton,
  alpha,
  keyframes,
} from '@mui/material';
import {
  AttachMoney,
  TrendingDown,
  Calculate,
  Info,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface IncomeExpenseFormProps {
  onSubmit: (data: { income: number; expenses: number }) => void;
  isLoading?: boolean;
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

const StyledCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #f8fafc 0%, rgba(241, 245, 249, 0.8) 100%)'
    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, rgba(30, 41, 59, 0.7) 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  animation: `${slideInUp} 0.6s ease-out`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    },
    '&.Mui-focused': {
      backgroundColor: alpha(theme.palette.primary.main, 0.06),
    },
  },
}));

export default function IncomeExpenseForm({
  onSubmit,
  isLoading = false,
}: IncomeExpenseFormProps) {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [errors, setErrors] = useState<{ income?: string; expenses?: string }>({});

  const incomeNum = income ? parseFloat(income) : 0;
  const expensesNum = expenses ? parseFloat(expenses) : 0;
  const savings = incomeNum - expensesNum;
  const savingsRate = incomeNum > 0 ? parseFloat(((savings / incomeNum) * 100).toFixed(1)) : 0;

  const validateForm = (): boolean => {
    const newErrors: { income?: string; expenses?: string } = {};

    if (!income || parseFloat(income) <= 0) {
      newErrors.income = 'Please enter a valid income amount';
    }
    if (!expenses || parseFloat(expenses) < 0) {
      newErrors.expenses = 'Please enter a valid expense amount';
    }
    if (parseFloat(expenses) > parseFloat(income || '0')) {
      newErrors.expenses = 'Expenses cannot exceed income';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        income: parseFloat(income),
        expenses: parseFloat(expenses),
      });
    }
  };

  const handleReset = () => {
    setIncome('');
    setExpenses('');
    setErrors({});
  };

  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography
            variant="h6"
            fontWeight="700"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Calculate sx={{ fontSize: 24, color: 'primary.main' }} />
            Financial Data Entry
          </Typography>
          <Tooltip title="Enter your monthly income and expenses to calculate your financial health">
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Income Input */}
            <StyledTextField
              fullWidth
              label="Monthly Income"
              type="number"
              inputProps={{
                step: '100',
                min: '0',
              }}
              value={income}
              onChange={(e) => {
                setIncome(e.target.value);
                setErrors((prev) => { const { income, ...rest } = prev; return rest; });
              }}
              error={!!errors.income}
              helperText={errors.income || 'Your total monthly income'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney sx={{ color: 'primary.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            {/* Expenses Input */}
            <StyledTextField
              fullWidth
              label="Monthly Expenses"
              type="number"
              inputProps={{
                step: '100',
                min: '0',
              }}
              value={expenses}
              onChange={(e) => {
                setExpenses(e.target.value);
                setErrors((prev) => { const { expenses, ...rest } = prev; return rest; });
              }}
              error={!!errors.expenses}
              helperText={errors.expenses || 'Your total monthly spending'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              disabled={isLoading}
            />

            {/* Summary Cards */}
            {income && expenses && (
              <Alert
                severity={savings >= 0 ? 'success' : 'error'}
                icon={false}
                sx={{
                  borderRadius: 2,
                  background: (theme) =>
                    savings >= 0
                      ? alpha(theme.palette.success.main, 0.08)
                      : alpha(theme.palette.error.main, 0.08),
                  border: (theme) =>
                    `1px solid ${
                      savings >= 0
                        ? alpha(theme.palette.success.main, 0.2)
                        : alpha(theme.palette.error.main, 0.2)
                    }`,
                }}
              >
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Monthly Savings
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      sx={{
                        color: savings >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      ₹{savings.toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="600" color="text.secondary">
                      Savings Rate
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="700"
                      sx={{
                        color: savingsRate >= 20 ? 'success.main' : savingsRate >= 10 ? 'warning.main' : 'error.main',
                      }}
                    >
                      {savingsRate}%
                    </Typography>
                  </Box>
                </Stack>
              </Alert>
            )}

            {/* Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading || !income || !expenses}
                sx={{
                  background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                  borderRadius: 2,
                  fontWeight: 700,
                  py: 1.5,
                }}
                startIcon={isLoading && <CircularProgress size={20} />}
              >
                {isLoading ? 'Calculating...' : 'Calculate Financial Health'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                size="large"
                onClick={handleReset}
                disabled={isLoading}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  py: 1.5,
                }}
              >
                Clear
              </Button>
            </Stack>

            {/* Info Alert */}
            <Alert severity="info" icon={false} sx={{ borderRadius: 2, py: 1.5 }}>
              <Typography variant="caption" fontWeight="600">
                💡 Tip: A healthy savings rate is at least 20% of your income. Aim for 3-6 months of expenses in your
                emergency fund.
              </Typography>
            </Alert>
          </Stack>
        </Box>
      </CardContent>
    </StyledCard>
  );
}