'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Tooltip,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Avatar,
  Paper,
  Fade,
  Grow,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  Divider,
  Switch,
  FormControlLabel,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Notifications,
  NotificationsNone,
  Warning,
  Error,
  Info,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Security,
  Lightbulb,
  Assessment,
  Close,
  Settings,
  MarkEmailRead,
  Delete,
  PriorityHigh,
  Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '@/hooks/useNotification';

// Styled Components
const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: -3,
    padding: '0 4px',
    height: 16,
    minWidth: 16,
    fontSize: '0.6rem',
    fontWeight: 'bold',
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    border: `2px solid ${theme.palette.background.paper}`,
    animation: 'pulse 2s infinite'
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' }
  }
}));

const NotificationPaper = styled(Paper)<{ severity: 'info' | 'warning' | 'error' | 'success' }>(({ theme, severity }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette[severity].main, 0.05)}, ${alpha(theme.palette.background.paper, 0.9)})`,
  border: `1px solid ${alpha(theme.palette[severity].main, 0.2)}`,
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: theme.shadows[4],
    border: `1px solid ${alpha(theme.palette[severity].main, 0.4)}`
  }
}));

const NotificationAvatar = styled(Avatar)<{ severity: 'info' | 'warning' | 'error' | 'success' }>(({ theme, severity }) => ({
  backgroundColor: alpha(theme.palette[severity].main, 0.1),
  color: theme.palette[severity].main,
  width: 40,
  height: 40
}));

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'security' | 'system' | 'insight';
  action?: {
    label: string;
    handler: () => void;
  };
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  maxNotifications?: number;
  enableSound?: boolean;
  enableDesktop?: boolean;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxNotifications = 50,
  enableSound = true,
  enableDesktop = true
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settings, setSettings] = useState({
    sound: enableSound,
    desktop: enableDesktop,
    financial: true,
    security: true,
    system: true,
    insights: true
  });

  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  } = useNotification();

  // Get notification icon based on type
  const getNotificationIcon = (type: string, category: string) => {
    switch (category) {
      case 'financial':
        return type === 'error' ? <TrendingDown /> : <AccountBalance />;
      case 'security':
        return <Security />;
      case 'system':
        return <Info />;
      case 'insight':
        return <Lightbulb />;
      default:
        return <Info />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (settings.sound) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [settings.sound]);

  // Show desktop notification
  const showDesktopNotification = useCallback((notification: Notification) => {
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'critical'
      });
    }
  }, [settings.desktop]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.action) {
      notification.action.handler();
    }
  };

  // Handle settings menu
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Filter notifications based on settings
  const filteredNotifications = notifications.filter(notification => {
    switch (notification.category) {
      case 'financial': return settings.financial;
      case 'security': return settings.security;
      case 'system': return settings.system;
      case 'insight': return settings.insights;
      default: return true;
    }
  });

  // Sort notifications by priority and timestamp
  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  // Request permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // Auto-refresh notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new notifications
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const sampleNotifications = [
          {
            type: 'info' as const,
            title: 'Market Update',
            message: 'Your portfolio gained 2.3% this week',
            category: 'financial' as const,
            priority: 'low' as const
          },
          {
            type: 'warning' as const,
            title: 'Expense Alert',
            message: 'Your dining expenses are 15% higher this month',
            category: 'financial' as const,
            priority: 'medium' as const
          },
          {
            type: 'success' as const,
            title: 'Goal Achieved',
            message: 'Congratulations! You reached your savings goal',
            category: 'insight' as const,
            priority: 'high' as const
          }
        ];

        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        if (randomNotification) {
          addNotification(randomNotification);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <>
      {/* Notification Bell */}
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={() => setIsOpen(!isOpen)}
          sx={{ position: 'relative' }}
        >
          <NotificationBadge
            badgeContent={unreadCount}
            invisible={unreadCount === 0}
          >
            {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
          </NotificationBadge>
        </IconButton>
      </Tooltip>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                right: 0,
                top: 60,
                width: 380,
                maxHeight: 500,
                overflow: 'hidden',
                zIndex: 1300,
                borderRadius: 2
              }}
            >
              {/* Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Notifications
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Settings">
                      <IconButton size="small" onClick={handleSettingsClick}>
                        <Settings />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark all as read">
                      <IconButton size="small" onClick={markAllAsRead}>
                        <MarkEmailRead />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear all">
                      <IconButton size="small" onClick={clearAll}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Notifications List */}
              <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {sortedNotifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'grey.200', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                      <NotificationsNone sx={{ fontSize: 30, color: 'grey.500' }} />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 1 }}>
                    {sortedNotifications.slice(0, maxNotifications).map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <NotificationPaper
                          severity={notification.type}
                          onClick={() => handleNotificationClick(notification)}
                          sx={{
                            opacity: notification.read ? 0.7 : 1,
                            borderLeft: notification.read ? 'none' : `4px solid ${getPriorityColor(notification.priority)}`
                          }}
                        >
                          <ListItem sx={{ p: 2, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <NotificationAvatar severity={notification.type}>
                                {getNotificationIcon(notification.type, notification.category)}
                              </NotificationAvatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {notification.title}
                                  </Typography>
                                  {!notification.read && (
                                    <Chip
                                      size="small"
                                      label="New"
                                      color="primary"
                                      sx={{ height: 16, fontSize: '0.6rem' }}
                                    />
                                  )}
                                  {notification.priority === 'critical' && (
                                    <PriorityHigh sx={{ fontSize: 16, color: 'error.main' }} />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    {notification.message}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatTimestamp(notification.timestamp)}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={notification.category}
                                      variant="outlined"
                                      sx={{ height: 16, fontSize: '0.6rem' }}
                                    />
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                          {notification.action && (
                            <Box sx={{ px: 2, pb: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.action!.handler();
                                }}
                                fullWidth
                              >
                                {notification.action.label}
                              </Button>
                            </Box>
                          )}
                        </NotificationPaper>
                      </motion.div>
                    ))}
                  </List>
                )}
              </Box>

              {/* Footer */}
              {sortedNotifications.length > maxNotifications && (
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {maxNotifications} of {sortedNotifications.length} notifications
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        PaperProps={{ sx: { width: 250 } }}
      >
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.sound}
                onChange={(e) => setSettings({ ...settings, sound: e.target.checked })}
                size="small"
              />
            }
            label="Sound Alerts"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.desktop}
                onChange={(e) => setSettings({ ...settings, desktop: e.target.checked })}
                size="small"
              />
            }
            label="Desktop Notifications"
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.financial}
                onChange={(e) => setSettings({ ...settings, financial: e.target.checked })}
                size="small"
              />
            }
            label="Financial Alerts"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.security}
                onChange={(e) => setSettings({ ...settings, security: e.target.checked })}
                size="small"
              />
            }
            label="Security Alerts"
          />
        </MenuItem>
        <MenuItem>
          <FormControlLabel
            control={
              <Switch
                checked={settings.insights}
                onChange={(e) => setSettings({ ...settings, insights: e.target.checked })}
                size="small"
              />
            }
            label="Insights"
          />
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter;
