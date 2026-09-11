import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Stack,
  Divider,
  Alert,
  IconButton,
  Collapse,
  Button,
  alpha,
  keyframes,
} from '@mui/material';
import {
  Warning,
  Error,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  NotificationsActive,
  TrendingUp,
  TrendingDown,
  Bolt,
  Event,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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
  height: '100%',
  background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(240, 248, 255, 0.3) 100%)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideInUp} 0.3s ease-out 0.2s backwards`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 25px 50px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: theme.palette.primary.main,
  },
}));

interface AlertItem {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
  actionable?: boolean;
  action?: string;
}

interface AlertsPanelProps {
  alerts: AlertItem[];
  onAction?: (alertId: number) => void;
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <Error fontSize="small" />;
    case 'warning':
      return <Warning fontSize="small" />;
    case 'success':
      return <CheckCircle fontSize="small" />;
    default:
      return <Info fontSize="small" />;
  }
};

const getAlertColor = (type: string): 'success' | 'warning' | 'error' | 'info' => {
  switch (type) {
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'info';
  }
};

const AlertItemWrapper = styled(Alert)(({ theme }) => ({
  borderRadius: 12,
  border: '1px solid transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(4px)',
  },
}));

const AlertsPanel = React.memo(function AlertsPanel({ alerts, onAction }: AlertsPanelProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [dismissedAlerts, setDismissedAlerts] = React.useState<number[]>([]);

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.includes(a.id));
  const criticalAlerts = visibleAlerts.filter((alert) => alert.type === 'error' || alert.type === 'warning');
  const otherAlerts = visibleAlerts.filter((alert) => alert.type === 'info' || alert.type === 'success');

  const handleDismiss = (id: number) => {
    setDismissedAlerts([...dismissedAlerts, id]);
  };

  return (
    <StyledCard elevation={0}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(0, 122, 247, 0.1), rgba(108, 99, 255, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <NotificationsActive sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight="700">
              AI Financial Alerts
            </Typography>
          </Stack>
          <Chip
            icon={<Bolt sx={{ fontSize: 16 }} />}
            label={`${visibleAlerts.length} Active`}
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                '#007AF7',
                0.1
              )}, ${alpha('#6C63FF', 0.1)})`,
              border: `1px solid ${alpha('#007AF7', 0.2)}`,
              fontWeight: 700,
              color: 'primary.main',
            }}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Critical Alerts - Always Visible */}
        {criticalAlerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <Bolt sx={{ fontSize: 18, color: 'warning.main' }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: 'warning.main',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: '0.8rem',
                }}
              >
                Requires Attention
              </Typography>
            </Stack>
            <Stack spacing={2}>
              {criticalAlerts.map((alert) => (
                <AlertItemWrapper
                  key={alert.id}
                  severity={getAlertColor(alert.type)}
                  icon={getAlertIcon(alert.type)}
                  {...(!alert.actionable ? { onClose: () => handleDismiss(alert.id) } : {})}
                  action={
                    alert.actionable && (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => onAction?.(alert.id)}
                        sx={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                      >
                        {alert.action || 'Take Action'}
                      </Button>
                    )
                  }
                  sx={{
                    background: (theme) =>
                      alpha(theme.palette[getAlertColor(alert.type)].main, 0.08),
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette[getAlertColor(alert.type)].main, 0.2)}`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {alert.message}
                  </Typography>
                  {alert.timestamp && (
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                      <Event sx={{ fontSize: 14, opacity: 0.6 }} />
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', opacity: 0.7, fontSize: '0.75rem' }}
                      >
                        {alert.timestamp}
                      </Typography>
                    </Stack>
                  )}
                </AlertItemWrapper>
              ))}
            </Stack>
          </Box>
        )}

        {/* Other Alerts - Collapsible */}
        {otherAlerts.length > 0 && (
          <>
            {criticalAlerts.length > 0 && <Divider sx={{ my: 2 }} />}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'success.main',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.8rem',
                    }}
                  >
                    Insights & Updates
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    color: 'text.secondary',
                    transition: 'transform 0.3s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <ExpandMore />
                </IconButton>
              </Box>

              <Collapse in={expanded}>
                <List dense>
                  {otherAlerts.map((alert, index) => (
                    <ListItem
                      key={alert.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        mb: 1,
                        background: alpha('#F8FAFC', 0.5),
                        border: `1px solid ${alpha('#E2E8F0', 0.5)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: alpha('#F8FAFC', 0.8),
                          borderColor: alpha('#007AF7', 0.2),
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 36,
                          color: getAlertColor(alert.type) + '.main',
                        }}
                      >
                        {getAlertIcon(alert.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {alert.message}
                          </Typography>
                        }
                        secondary={
                          alert.timestamp && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                            >
                              <Event sx={{ fontSize: 12 }} />
                              {alert.timestamp}
                            </Typography>
                          )
                        }
                      />
                      <Chip
                        label={alert.type}
                        size="small"
                        color={getAlertColor(alert.type)}
                        variant="outlined"
                        sx={{ ml: 1, fontWeight: 700 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              {!expanded && otherAlerts.length > 0 && (
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  onClick={() => setExpanded(true)}
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Show {otherAlerts.length} Insights
                </Button>
              )}
            </Box>
          </>
        )}

        {visibleAlerts.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: 'success.main',
              }}
            >
              <CheckCircle sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="h6" fontWeight="700" color="text.primary" mb={1}>
              All Clear!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your finances are in great shape. No alerts at the moment.
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
});

export default AlertsPanel;