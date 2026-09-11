import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip, Stack, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';

const TaxCalculator = () => {
    const [income, setIncome] = useState(1200000);
    const [deductions, setDeductions] = useState({
        section80C: 150000,
        section80D: 25000,
        homeLoan: 200000,
        nps: 50000,
    });

    const calculateTaxForRegime = (regime: 'old' | 'new', grossIncome: number) => {
        let taxableIncome = grossIncome;
        if (regime === 'old') {
            taxableIncome -= Math.min(deductions.section80C, 150000);
            taxableIncome -= Math.min(deductions.section80D, 25000); // simplified
            taxableIncome -= Math.min(deductions.homeLoan, 200000);
            taxableIncome -= Math.min(deductions.nps, 50000);
        }

        // Standard deduction
        taxableIncome -= 50000;
        taxableIncome = Math.max(0, taxableIncome);

        let tax = 0;
        if (regime === 'new') {
            // New regime slabs (FY 2024-25)
            if (taxableIncome <= 300000) tax = 0;
            else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
            else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.10;
            else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
            else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
            else tax = 150000 + (taxableIncome - 1500000) * 0.30;

            // Rebate under 7L for new regime
            if (taxableIncome <= 700000) tax = 0;
        } else {
            // Old regime slabs
            if (taxableIncome <= 250000) tax = 0;
            else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
            else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
            else tax = 112500 + (taxableIncome - 1000000) * 0.30;

            // Rebate under 5L for old regime
            if (taxableIncome <= 500000) tax = 0;
        }

        tax = tax * 1.04; // Cess

        return {
            taxableIncome,
            tax: Math.round(tax),
            effectiveRate: ((tax / grossIncome) * 100 || 0).toFixed(1),
            takeHome: grossIncome - Math.round(tax),
        };
    };

    const newRegimeData = calculateTaxForRegime('new', income);
    const oldRegimeData = calculateTaxForRegime('old', income);
    const betterRegime = newRegimeData.tax < oldRegimeData.tax ? 'new' : 'old';
    const savings = Math.abs(newRegimeData.tax - oldRegimeData.tax);

    const comparisonData = [
        { name: 'Old Regime', tax: oldRegimeData.tax, takeHome: oldRegimeData.takeHome },
        { name: 'New Regime', tax: newRegimeData.tax, takeHome: newRegimeData.takeHome },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">
                        🧾 Tax Optimizer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Compare and optimize your tax liability between regimes
                    </Typography>
                </Box>
                {savings > 0 && (
                    <Chip
                        label={`Save ₹${savings.toLocaleString()} with ${betterRegime === 'new' ? 'New' : 'Old'} Regime`}
                        color="success"
                        sx={{ fontWeight: 700, px: 1, py: 2, height: 'auto', borderRadius: 2 }}
                    />
                )}
            </Box>

            <Grid container spacing={4}>
                {/* Inputs */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" fontWeight="700" gutterBottom>
                                Financial Inputs
                            </Typography>
                            <Stack spacing={3} sx={{ mt: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Annual Gross Salary"
                                    type="number"
                                    value={income}
                                    onChange={(e) => setIncome(Number(e.target.value))}
                                    InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography> }}
                                />

                                <Divider>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        DEDUCTIONS (OLD REGIME ONLY)
                                    </Typography>
                                </Divider>

                                <TextField
                                    label="Section 80C"
                                    type="number"
                                    value={deductions.section80C}
                                    onChange={(e) => setDeductions({ ...deductions, section80C: Number(e.target.value) })}
                                    helperText="PPF, ELSS, LIC (Max 1.5L)"
                                />
                                <TextField
                                    label="Medical Insurance (80D)"
                                    type="number"
                                    value={deductions.section80D}
                                    onChange={(e) => setDeductions({ ...deductions, section80D: Number(e.target.value) })}
                                />
                                <TextField
                                    label="Home Loan Interest (Sec 24)"
                                    type="number"
                                    value={deductions.homeLoan}
                                    onChange={(e) => setDeductions({ ...deductions, homeLoan: Number(e.target.value) })}
                                />
                                <TextField
                                    label="NPS (80CCD 1B)"
                                    type="number"
                                    value={deductions.nps}
                                    onChange={(e) => setDeductions({ ...deductions, nps: Number(e.target.value) })}
                                    helperText="Additional 50k"
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Comparison Results */}
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        {/* New Regime Card */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                borderRadius: 4,
                                border: betterRegime === 'new' ? '2px solid' : '1px solid',
                                borderColor: betterRegime === 'new' ? 'success.main' : 'divider',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {betterRegime === 'new' && (
                                    <Box sx={{ bgcolor: 'success.main', color: 'white', py: 0.5, textAlign: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                                        RECOMMENDED
                                    </Box>
                                )}
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="700">New Regime</Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>FY 2024-25 Defaut</Typography>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="h3" fontWeight="900" color="primary">
                                            ₹{newRegimeData.tax.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Effective Rate: {newRegimeData.effectiveRate}%
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                                        <Typography variant="body2" fontWeight="600">Monthly Take-home</Typography>
                                        <Typography variant="body2" fontWeight="700">₹{Math.round(newRegimeData.takeHome / 12).toLocaleString()}</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Old Regime Card */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{
                                borderRadius: 4,
                                border: betterRegime === 'old' ? '2px solid' : '1px solid',
                                borderColor: betterRegime === 'old' ? 'success.main' : 'divider',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {betterRegime === 'old' && (
                                    <Box sx={{ bgcolor: 'success.main', color: 'white', py: 0.5, textAlign: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                                        RECOMMENDED
                                    </Box>
                                )}
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="700">Old Regime</Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>With Deductions</Typography>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="h3" fontWeight="900" color="primary">
                                            ₹{oldRegimeData.tax.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Effective Rate: {oldRegimeData.effectiveRate}%
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
                                        <Typography variant="body2" fontWeight="600">Monthly Take-home</Typography>
                                        <Typography variant="body2" fontWeight="700">₹{Math.round(oldRegimeData.takeHome / 12).toLocaleString()}</Typography>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Chart */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: 4 }}>
                                <CardContent sx={{ p: 4 }}>
                                    <Typography variant="h6" fontWeight="700" gutterBottom>Regime Comparison</Typography>
                                    <Box sx={{ height: 300, mt: 2 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={comparisonData}>
                                                <XAxis dataKey="name" />
                                                <YAxis tickFormatter={(v) => `₹${(v / 1000).toLocaleString()}k`} />
                                                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                                                <Legend />
                                                <Bar dataKey="tax" name="Tax Payable" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="takeHome" name="Take Home" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default TaxCalculator;
