import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { TrendingDown, AttachMoney, CalendarToday, Speed } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Layout from '../components/Layout';

const DebtDashboard = () => {
    const [payoffStrategy, setPayoffStrategy] = useState<'snowball' | 'avalanche'>('avalanche');

    const debts = [
        { id: 1, name: 'Credit Card 1', balance: 45000, rate: 18, minPayment: 2000, type: 'Credit Card' },
        { id: 2, name: 'Personal Loan', balance: 150000, rate: 12, minPayment: 8000, type: 'Personal Loan' },
        { id: 3, name: 'Car Loan', balance: 250000, rate: 9, minPayment: 12000, type: 'Auto Loan' },
        { id: 4, name: 'Credit Card 2', balance: 25000, rate: 21, minPayment: 1500, type: 'Credit Card' },
    ];

    const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0);
    const weightedAvgRate = debts.reduce((sum, debt) => sum + (debt.rate * debt.balance), 0) / totalDebt;

    // Sort debts based on strategy
    const sortedDebts = [...debts].sort((a, b) => {
        if (payoffStrategy === 'snowball') {
            return a.balance - b.balance; // Smallest balance first
        } else {
            return b.rate - a.rate; // Highest rate first
        }
    });

    // Calculate payoff timeline
    const monthlyPayment = totalMinPayment + 5000; // Extra payment
    const calculatePayoffMonths = () => {
        let months = 0;
        let remainingDebts = [...sortedDebts];
        let extraPayment = 5000;

        while (remainingDebts.length > 0 && months < 120) {
            months++;
            remainingDebts = remainingDebts.map(debt => ({
                ...debt,
                balance: debt.balance * (1 + debt.rate / 1200) - debt.minPayment,
            }));

            if (remainingDebts[0]) {
                remainingDebts[0].balance -= extraPayment;
            }

            remainingDebts = remainingDebts.filter(debt => debt.balance > 0);
            const firstRemaining = remainingDebts[0];
            if (firstRemaining && firstRemaining.balance <= 0) {
                extraPayment += firstRemaining.minPayment;
            }
        }

        return months;
    };

    const payoffMonths = calculatePayoffMonths();
    const totalInterest = (monthlyPayment * payoffMonths) - totalDebt;

    const payoffProjection = Array.from({ length: Math.min(payoffMonths, 36) }, (_, i) => ({
        month: i + 1,
        remaining: totalDebt * Math.pow(0.95, i),
    }));

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                💳 Debt Management Dashboard
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AttachMoney sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Debt</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ₹{totalDebt.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Speed sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Avg Interest Rate</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {weightedAvgRate.toFixed(1)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarToday sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Debt-Free In</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                {payoffMonths} months
                            </Typography>
                            <Typography variant="caption">
                                {(payoffMonths / 12).toFixed(1)} years
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrendingDown sx={{ mr: 1 }} />
                                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Total Interest</Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                ₹{Math.round(totalInterest).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Payoff Strategy */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Payoff Strategy
                        </Typography>
                        <ToggleButtonGroup
                            value={payoffStrategy}
                            exclusive
                            onChange={(_, value) => value && setPayoffStrategy(value)}
                            size="small"
                        >
                            <ToggleButton value="avalanche">
                                Avalanche (Highest Rate)
                            </ToggleButton>
                            <ToggleButton value="snowball">
                                Snowball (Smallest Balance)
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {payoffStrategy === 'avalanche'
                            ? '💡 Avalanche method: Pay off debts with highest interest rates first to minimize total interest paid.'
                            : '💡 Snowball method: Pay off smallest debts first for quick wins and motivation.'}
                    </Typography>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Debt List */}
                <Grid item xs={12} md={7}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                                Debt Payoff Order
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Debt</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Min Payment</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedDebts.map((debt, index) => (
                                            <TableRow key={debt.id} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={`#${index + 1}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: index === 0 ? '#10b981' : '#6b7280',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {debt.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {debt.type}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>₹{debt.balance.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${debt.rate}%`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: debt.rate > 15 ? '#ef4444' : debt.rate > 10 ? '#f59e0b' : '#10b981',
                                                            color: 'white',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>₹{debt.minPayment.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payoff Projection */}
                <Grid item xs={12} md={5}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Payoff Projection
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={payoffProjection}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Balance']}
                                    />
                                    <Line type="monotone" dataKey="remaining" stroke="#667eea" strokeWidth={3} name="Remaining Debt" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recommendations */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                🎯 Debt Payoff Recommendations
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Increase your monthly payment by ₹5,000 to become debt-free {Math.round(payoffMonths * 0.2)} months faster.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Focus on {sortedDebts[0]?.name} first - it has the {payoffStrategy === 'avalanche' ? 'highest interest rate' : 'smallest balance'}.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    • Consider consolidating high-interest credit card debt to save ₹{Math.round(totalInterest * 0.3).toLocaleString()} in interest.
                                </Typography>
                                <Typography variant="body2">
                                    • Avoid taking on new debt while paying off existing balances to stay on track.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DebtDashboard;
