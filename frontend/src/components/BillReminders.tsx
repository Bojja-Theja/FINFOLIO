import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Switch } from '@mui/material';
import { Notifications, NotificationsActive, Delete, Add } from '@mui/icons-material';
import { Grid } from '@mui/material';

interface BillReminder {
    id: number;
    name: string;
    amount: number;
    dueDate: string;
    category: string;
    status: 'upcoming' | 'due' | 'overdue';
    reminderEnabled: boolean;
    daysBeforeReminder: number;
}

const BillReminders: React.FC = () => {
    const [bills, setBills] = useState<BillReminder[]>([
        {
            id: 1,
            name: 'Electricity Bill',
            amount: 1500,
            dueDate: '2024-02-10',
            category: 'Utilities',
            status: 'upcoming',
            reminderEnabled: true,
            daysBeforeReminder: 3,
        },
        {
            id: 2,
            name: 'Internet Bill',
            amount: 999,
            dueDate: '2024-02-05',
            category: 'Utilities',
            status: 'due',
            reminderEnabled: true,
            daysBeforeReminder: 2,
        },
        {
            id: 3,
            name: 'Credit Card Payment',
            amount: 12500,
            dueDate: '2024-02-15',
            category: 'Credit Card',
            status: 'upcoming',
            reminderEnabled: true,
            daysBeforeReminder: 5,
        },
        {
            id: 4,
            name: 'Insurance Premium',
            amount: 5000,
            dueDate: '2024-02-20',
            category: 'Insurance',
            status: 'upcoming',
            reminderEnabled: false,
            daysBeforeReminder: 7,
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming':
                return '#10b981';
            case 'due':
                return '#f59e0b';
            case 'overdue':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getDaysUntilDue = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsActive sx={{ mr: 1, color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Bill Reminders
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Add Bill
                    </Button>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
                            <Typography variant="caption" color="textSecondary">
                                Due This Week
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                                ₹{bills.filter(b => getDaysUntilDue(b.dueDate) <= 7).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, backgroundColor: '#dbeafe', borderRadius: 2 }}>
                            <Typography variant="caption" color="textSecondary">
                                Total Bills
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                                {bills.length}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 2, backgroundColor: '#dcfce7', borderRadius: 2 }}>
                            <Typography variant="caption" color="textSecondary">
                                Reminders Active
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                                {bills.filter(b => b.reminderEnabled).length}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Bill Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Reminder</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bills.map((bill) => {
                                const daysUntil = getDaysUntilDue(bill.dueDate);
                                return (
                                    <TableRow key={bill.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {bill.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {bill.category}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                ₹{bill.amount.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {new Date(bill.dueDate).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {daysUntil > 0 ? `in ${daysUntil} days` : daysUntil === 0 ? 'Today' : `${Math.abs(daysUntil)} days overdue`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={bill.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getStatusColor(bill.status),
                                                    color: 'white',
                                                    textTransform: 'capitalize',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Switch
                                                    checked={bill.reminderEnabled}
                                                    size="small"
                                                    onChange={() => {
                                                        setBills(bills.map(b =>
                                                            b.id === bill.id ? { ...b, reminderEnabled: !b.reminderEnabled } : b
                                                        ));
                                                    }}
                                                />
                                                {bill.reminderEnabled && (
                                                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                                                        {bill.daysBeforeReminder}d before
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="error">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default BillReminders;
