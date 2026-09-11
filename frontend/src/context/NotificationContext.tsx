import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Snackbar, Alert, Badge, IconButton, Drawer, Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Button } from '@mui/material';
import { Notifications as NotificationsIcon, Close, CheckCircle, Warning, Info, TrendingUp } from '@mui/icons-material';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'success',
            title: 'Budget Goal Achieved',
            message: 'You stayed under budget this month! Great job! 🎉',
            timestamp: new Date(Date.now() - 3600000),
            read: false,
        },
        {
            id: '2',
            type: 'warning',
            title: 'Bill Due Soon',
            message: 'Electricity bill of ₹1,500 is due in 3 days',
            timestamp: new Date(Date.now() - 7200000),
            read: false,
        },
        {
            id: '3',
            type: 'info',
            title: 'Investment Opportunity',
            message: 'New SIP recommendation available based on your goals',
            timestamp: new Date(Date.now() - 86400000),
            read: true,
        },
    ]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; notification?: Notification }>({ open: false });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date(),
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setSnackbar({ open: true, notification: newNotification });

        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/logo.png',
            });
        }
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Simulate real-time notifications
    useEffect(() => {
        const interval = setInterval(() => {
            const randomNotifications = [
                {
                    type: 'info' as const,
                    title: 'Daily Tip',
                    message: 'Save 20% of your income for long-term goals',
                },
                {
                    type: 'success' as const,
                    title: 'Goal Progress',
                    message: 'You\'re 75% towards your vacation goal!',
                },
                {
                    type: 'warning' as const,
                    title: 'Spending Alert',
                    message: 'You\'ve spent 80% of your dining budget',
                },
            ];

            // 10% chance to add a notification every 30 seconds
            if (Math.random() < 0.1) {
                const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
                if (randomNotif) {
                    addNotification(randomNotif);
                }
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle />;
            case 'warning':
                return <Warning />;
            case 'error':
                return <Warning />;
            default:
                return <Info />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'success':
                return '#10b981';
            case 'warning':
                return '#f59e0b';
            case 'error':
                return '#ef4444';
            default:
                return '#3b82f6';
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearAll,
            }}
        >
            {children}

            {/* Notification Bell Icon (to be placed in Navigation) */}
            <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 80,
                    zIndex: 1200,
                }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            {/* Notification Drawer */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 400, maxWidth: '100vw' }}>
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #e5e7eb',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Notifications
                        </Typography>
                        <Box>
                            {unreadCount > 0 && (
                                <Button size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                                    Mark all read
                                </Button>
                            )}
                            <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>

                    <List sx={{ p: 0 }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    No notifications
                                </Typography>
                            </Box>
                        ) : (
                            notifications.map((notification) => (
                                <React.Fragment key={notification.id}>
                                    <ListItem
                                        sx={{
                                            backgroundColor: notification.read ? 'transparent' : '#f9fafb',
                                            '&:hover': { backgroundColor: '#f3f4f6' },
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: getColor(notification.type) }}>
                                                {getIcon(notification.type)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {notification.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {new Date(notification.timestamp).toLocaleString()}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))
                        )}
                    </List>

                    {notifications.length > 0 && (
                        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
                            <Button fullWidth variant="outlined" onClick={clearAll}>
                                Clear All
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* Toast Snackbar */}
            {snackbar.notification && (
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={5000}
                    onClose={() => setSnackbar({ open: false })}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={() => setSnackbar({ open: false })}
                        severity={snackbar.notification.type}
                        sx={{ width: '100%' }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {snackbar.notification.title}
                        </Typography>
                        <Typography variant="caption">{snackbar.notification.message}</Typography>
                    </Alert>
                </Snackbar>
            )}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
