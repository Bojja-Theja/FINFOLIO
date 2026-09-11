import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid } from '@mui/material';
import { Add, Edit, Delete, Repeat, CalendarToday } from '@mui/icons-material';

interface RecurringTransaction {
    id: number;
    name: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    category: string;
    type: 'income' | 'expense';
    nextDate: string;
    status: 'active' | 'paused';
}

interface RecurringTransactionsProps {
    onClose?: () => void;
}

const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({ onClose }) => {
    const [open, setOpen] = useState(false);
    const [transactions, setTransactions] = useState<RecurringTransaction[]>([
        {
            id: 1,
            name: 'Salary',
            amount: 75000,
            frequency: 'monthly',
            category: 'Income',
            type: 'income',
            nextDate: '2024-02-01',
            status: 'active',
        },
        {
            id: 2,
            name: 'Rent',
            amount: 15000,
            frequency: 'monthly',
            category: 'Housing',
            type: 'expense',
            nextDate: '2024-02-05',
            status: 'active',
        },
        {
            id: 3,
            name: 'Netflix Subscription',
            amount: 649,
            frequency: 'monthly',
            category: 'Entertainment',
            type: 'expense',
            nextDate: '2024-02-10',
            status: 'active',
        },
        {
            id: 4,
            name: 'Gym Membership',
            amount: 2000,
            frequency: 'monthly',
            category: 'Health',
            type: 'expense',
            nextDate: '2024-02-15',
            status: 'active',
        },
    ]);

    const getFrequencyColor = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return '#ef4444';
            case 'weekly':
                return '#f59e0b';
            case 'monthly':
                return '#10b981';
            case 'yearly':
                return '#3b82f6';
            default:
                return '#6b7280';
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Repeat sx={{ mr: 1, color: '#667eea' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Recurring Transactions
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpen(true)}
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Add Recurring
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Next Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {transaction.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {transaction.category}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: transaction.type === 'income' ? '#10b981' : '#ef4444',
                                            }}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transaction.frequency}
                                            size="small"
                                            sx={{
                                                backgroundColor: getFrequencyColor(transaction.frequency),
                                                color: 'white',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarToday sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                                {new Date(transaction.nextDate).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={transaction.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: transaction.status === 'active' ? '#10b981' : '#6b7280',
                                                color: 'white',
                                                textTransform: 'capitalize',
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" color="primary">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error">
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Summary */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                                Monthly Income
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                                +₹{transactions.filter(t => t.type === 'income' && t.frequency === 'monthly').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">
                                Monthly Expenses
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                -₹{transactions.filter(t => t.type === 'expense' && t.frequency === 'monthly').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Add Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add Recurring Transaction</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth label="Name" sx={{ mt: 2, mb: 2 }} />
                        <TextField fullWidth label="Amount" type="number" sx={{ mb: 2 }} />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Type</InputLabel>
                            <Select label="Type">
                                <MenuItem value="income">Income</MenuItem>
                                <MenuItem value="expense">Expense</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Frequency</InputLabel>
                            <Select label="Frequency">
                                <MenuItem value="daily">Daily</MenuItem>
                                <MenuItem value="weekly">Weekly</MenuItem>
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField fullWidth label="Category" sx={{ mb: 2 }} />
                        <TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={() => setOpen(false)}>Add</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

export default RecurringTransactions;
