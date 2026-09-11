import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  alpha,
  keyframes,
  Divider,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface SavingsLockCardProps {
  lockedAmount: number;
  availableAmount: number;
  onLock: (amount: number) => void;
  onUnlock: (amount: number) => void;
}

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 247, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 122, 247, 0);
  }
`;

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
  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.3) 100%)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  animation: `${slideInUp} 0.6s ease-out 0.1s backwards`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const LockIndicator = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: 40,
  margin: '0 auto 20px',
  boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
  animation: `${pulse} 2s infinite`,
}));

export default function SavingsLockCard({
  lockedAmount,
  availableAmount,
  onLock,
  onUnlock,
}: SavingsLockCardProps) {
  const [openLockDialog, setOpenLockDialog] = useState(false);
  const [openUnlockDialog, setOpenUnlockDialog] = useState(false);
  const [lockAmount, setLockAmount] = useState('');
  const [unlockAmount, setUnlockAmount] = useState('');

  const totalSavings = lockedAmount + availableAmount;
  const lockedPercentage = totalSavings > 0 ? (lockedAmount / totalSavings) * 100 : 0;

  const handleLockSubmit = () => {
    if (lockAmount && parseFloat(lockAmount) > 0 && parseFloat(lockAmount) <= availableAmount) {
      onLock(parseFloat(lockAmount));
      setLockAmount('');
      setOpenLockDialog(false);
    }
  };

  const handleUnlockSubmit = () => {
    if (unlockAmount && parseFloat(unlockAmount) > 0 && parseFloat(unlockAmount) <= lockedAmount) {
      onUnlock(parseFloat(unlockAmount));
      setUnlockAmount('');
      setOpenUnlockDialog(false);
    }
  };

  const presetAmounts = [1000, 5000, 10000];

  return (
    <>
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
              <SavingsIcon sx={{ fontSize: 24, color: 'primary.main' }} />
              Savings Lock
            </Typography>
            <Chip
              icon={<LockIcon sx={{ fontSize: 16 }} />}
              label="Secure"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                border: '1px solid #10B981',
                color: 'success.main',
                fontWeight: 700,
              }}
            />
          </Stack>

          {/* Lock Indicator */}
          <LockIndicator>
            <LockIcon sx={{ fontSize: 40 }} />
          </LockIndicator>

          <Divider sx={{ mb: 3 }} />

          {/* Stats */}
          <Stack spacing={3} mb={3}>
            {/* Locked Amount */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body2" fontWeight="600" color="text.secondary">
                  Locked Amount (Protected)
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="800"
                  sx={{
                    background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  ₹{lockedAmount.toLocaleString('en-IN')}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={lockedPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha('#E2E8F0', 0.5),
                }}
              />
            </Box>

            {/* Available Amount */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="body2" fontWeight="600" color="text.secondary">
                  Available Amount (Can be locked)
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="800"
                  sx={{
                    color: 'text.primary',
                  }}
                >
                  ₹{availableAmount.toLocaleString('en-IN')}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={100 - lockedPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha('#E2E8F0', 0.5),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                  },
                }}
              />
            </Box>

            {/* Total Savings */}
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
                <TrendingUpIcon />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Total Savings
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="700"
                  color="text.primary"
                >
                  ₹{totalSavings.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setOpenLockDialog(true)}
              disabled={availableAmount === 0}
              sx={{
                background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                borderRadius: 2,
                fontWeight: 700,
                py: 1.25,
              }}
              startIcon={<LockIcon />}
            >
              Lock Savings
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setOpenUnlockDialog(true)}
              disabled={lockedAmount === 0}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                py: 1.25,
              }}
              startIcon={<LockOpenIcon />}
            >
              Unlock
            </Button>
          </Stack>

          {/* Info Alert */}
          <Alert severity="info" icon={false} sx={{ borderRadius: 2, mt: 2, py: 1 }}>
            <Typography variant="caption" fontWeight="600">
              🔒 Locked savings are protected from accidental spending. Unlock only when necessary.
            </Typography>
          </Alert>
        </CardContent>
      </StyledCard>

      {/* Lock Dialog */}
      <Dialog open={openLockDialog} onClose={() => setOpenLockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Lock Additional Savings</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            How much would you like to lock? Available: ₹{availableAmount.toLocaleString('en-IN')}
          </Typography>
          <TextField
            fullWidth
            label="Amount to Lock"
            type="number"
            value={lockAmount}
            onChange={(e) => setLockAmount(e.target.value)}
            inputProps={{ min: 0, max: availableAmount, step: 100 }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: '₹',
            }}
          />
          <Stack direction="row" spacing={1} mb={2}>
            {presetAmounts.map(
              (amount) =>
                amount <= availableAmount && (
                  <Button
                    key={amount}
                    variant="outlined"
                    size="small"
                    onClick={() => setLockAmount(amount.toString())}
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </Button>
                )
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLockDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleLockSubmit} disabled={!lockAmount}>
            Lock
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlock Dialog */}
      <Dialog open={openUnlockDialog} onClose={() => setOpenUnlockDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Unlock Savings</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            How much would you like to unlock? Locked: ₹{lockedAmount.toLocaleString('en-IN')}
          </Typography>
          <TextField
            fullWidth
            label="Amount to Unlock"
            type="number"
            value={unlockAmount}
            onChange={(e) => setUnlockAmount(e.target.value)}
            inputProps={{ min: 0, max: lockedAmount, step: 100 }}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: '₹',
            }}
          />
          <Stack direction="row" spacing={1}>
            {presetAmounts.map(
              (amount) =>
                amount <= lockedAmount && (
                  <Button
                    key={amount}
                    variant="outlined"
                    size="small"
                    onClick={() => setUnlockAmount(amount.toString())}
                  >
                    ₹{amount.toLocaleString('en-IN')}
                  </Button>
                )
            )}
          </Stack>
          <Alert severity="warning" icon={false} sx={{ borderRadius: 2, mt: 2, py: 1 }}>
            <Typography variant="caption" fontWeight="600">
              ⚠️ Unlocking savings makes them available for regular spending. Be mindful!
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnlockDialog(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={handleUnlockSubmit} disabled={!unlockAmount}>
            Unlock
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}