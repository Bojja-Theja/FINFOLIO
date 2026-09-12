import React, { useState, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
    Chip,
    Stack,
    Divider,
    LinearProgress,
    Alert,
    Tooltip as MuiTooltip,
    IconButton,
    Paper
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useCurrency } from '../context/CurrencyContext';

interface DeductionState {
    section80C: number;
    section80D: number;
    homeLoan: number;
    nps: number;
}

const MAX_LIMITS: Record<keyof DeductionState, number> = {
    section80C: 150000,
    section80D: 25000,
    homeLoan: 200000,
    nps: 50000,
};

const TaxCalculator = () => {
    const { currency, currencyInfo, formatAmount } = useCurrency();
    const [income, setIncome] = useState(1200000);
    const [deductions, setDeductions] = useState<DeductionState>({
        section80C: 150000,
        section80D: 25000,
        homeLoan: 200000,
        nps: 50000,
    });

    // Convert INR to USD base for formatAmount
    const formatINR = (valInINR: number, compact = false) => {
        const valInUSD = (valInINR || 0) / 83.5;
        return formatAmount(valInUSD, { compact });
    };

    const calculateTaxForRegime = (
        regime: 'old' | 'new',
        grossIncome: number,
        customDeductions?: DeductionState
    ) => {
        const currentDeductions = customDeductions || deductions;
        let taxableIncome = grossIncome;
        let totalDeductionsClaimed = 0;

        if (regime === 'old') {
            const c80 = Math.min(Math.max(0, currentDeductions.section80C), MAX_LIMITS.section80C);
            const d80 = Math.min(Math.max(0, currentDeductions.section80D), MAX_LIMITS.section80D);
            const loan = Math.min(Math.max(0, currentDeductions.homeLoan), MAX_LIMITS.homeLoan);
            const npsVal = Math.min(Math.max(0, currentDeductions.nps), MAX_LIMITS.nps);

            totalDeductionsClaimed = c80 + d80 + loan + npsVal;
            taxableIncome -= totalDeductionsClaimed;
        }

        // Standard deduction of ₹50,000 for salaried employees
        taxableIncome -= 50000;
        taxableIncome = Math.max(0, taxableIncome);

        let tax = 0;
        if (regime === 'new') {
            // New regime slabs (FY 2024-25 / Budget 2024)
            if (taxableIncome <= 300000) tax = 0;
            else if (taxableIncome <= 700000) tax = (taxableIncome - 300000) * 0.05;
            else if (taxableIncome <= 1000000) tax = 20000 + (taxableIncome - 700000) * 0.10;
            else if (taxableIncome <= 1200000) tax = 50000 + (taxableIncome - 1000000) * 0.15;
            else if (taxableIncome <= 1500000) tax = 80000 + (taxableIncome - 1200000) * 0.20;
            else tax = 140000 + (taxableIncome - 1500000) * 0.30;

            // Full tax rebate under Section 87A for income up to ₹7L in New Regime
            if (taxableIncome <= 700000) tax = 0;
        } else {
            // Old regime slabs
            if (taxableIncome <= 250000) tax = 0;
            else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
            else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.20;
            else tax = 112500 + (taxableIncome - 1000000) * 0.30;

            // Rebate under Section 87A for income up to ₹5L in Old Regime
            if (taxableIncome <= 500000) tax = 0;
        }

        tax = tax * 1.04; // 4% Health and Education Cess

        return {
            taxableIncome,
            tax: Math.round(tax),
            totalDeductionsClaimed,
            effectiveRate: grossIncome > 0 ? ((tax / grossIncome) * 100).toFixed(1) : '0.0',
            takeHome: Math.max(0, grossIncome - Math.round(tax)),
        };
    };

    const newRegimeData = useMemo(() => calculateTaxForRegime('new', income), [income]);
    const oldRegimeData = useMemo(() => calculateTaxForRegime('old', income, deductions), [income, deductions]);

    const betterRegime = newRegimeData.tax < oldRegimeData.tax ? 'new' : oldRegimeData.tax < newRegimeData.tax ? 'old' : 'tie';
    const savings = Math.abs(newRegimeData.tax - oldRegimeData.tax);
    const monthlyTakeHomeDiff = Math.round(savings / 12);

    const totalDeductionsSum =
        Math.min(deductions.section80C, MAX_LIMITS.section80C) +
        Math.min(deductions.section80D, MAX_LIMITS.section80D) +
        Math.min(deductions.homeLoan, MAX_LIMITS.homeLoan) +
        Math.min(deductions.nps, MAX_LIMITS.nps);

    const maxTotalDeductions =
        MAX_LIMITS.section80C + MAX_LIMITS.section80D + MAX_LIMITS.homeLoan + MAX_LIMITS.nps;

    // Break-even deduction calculation
    const breakEvenDeduction = useMemo(() => {
        if (income <= 700000) return 0; // New regime tax is 0 anyway
        const targetTax = calculateTaxForRegime('new', income).tax;
        for (let d = 0; d <= 600000; d += 5000) {
            const simOld = calculateTaxForRegime('old', income, {
                section80C: Math.min(d, 150000),
                section80D: Math.min(Math.max(0, d - 150000), 25000),
                homeLoan: Math.min(Math.max(0, d - 175000), 200000),
                nps: Math.min(Math.max(0, d - 375000), 50000),
            });
            if (simOld.tax <= targetTax) {
                return d;
            }
        }
        return null;
    }, [income]);

    const comparisonData = [
        {
            name: 'Old Regime',
            tax: oldRegimeData.tax,
            takeHome: oldRegimeData.takeHome,
        },
        {
            name: 'New Regime',
            tax: newRegimeData.tax,
            takeHome: newRegimeData.takeHome,
        },
    ];

    const handleQuickPreset = (preset: 'max' | 'zero' | 'salaried') => {
        if (preset === 'max') {
            setDeductions({
                section80C: MAX_LIMITS.section80C,
                section80D: MAX_LIMITS.section80D,
                homeLoan: MAX_LIMITS.homeLoan,
                nps: MAX_LIMITS.nps,
            });
        } else if (preset === 'zero') {
            setDeductions({
                section80C: 0,
                section80D: 0,
                homeLoan: 0,
                nps: 0,
            });
        } else if (preset === 'salaried') {
            setDeductions({
                section80C: 150000,
                section80D: 25000,
                homeLoan: 0,
                nps: 0,
            });
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Banner */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">
                        🧾 Tax Regime Optimizer &amp; Deduction Maximizer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Compare New vs Old Tax Regimes with live deduction sensitivity and take-home projections.
                    </Typography>
                </Box>
                {savings > 0 && betterRegime !== 'tie' && (
                    <Chip
                        label={`Save ${formatINR(savings)}/yr (${formatINR(monthlyTakeHomeDiff)}/mo) with ${betterRegime === 'new' ? 'New' : 'Old'} Regime`}
                        color="success"
                        sx={{ fontWeight: 800, px: 2, py: 2.5, height: 'auto', borderRadius: 3, fontSize: '0.95rem' }}
                    />
                )}
            </Box>

            {/* Winner Recommendation Banner */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: betterRegime === 'new' ? 'primary.main' : 'success.main',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? betterRegime === 'new' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)'
                            : betterRegime === 'new' ? '#eff6ff' : '#ecfdf5',
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Chip
                                label={betterRegime === 'new' ? '🏆 NEW REGIME RECOMMENDED' : '🏆 OLD REGIME RECOMMENDED'}
                                color={betterRegime === 'new' ? 'primary' : 'success'}
                                size="small"
                                sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                                Displaying in {currencyInfo.name} ({currencyInfo.symbol})
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight="700">
                            {betterRegime === 'new'
                                ? `The New Regime saves you ${formatINR(savings)} per year in direct taxes.`
                                : `The Old Regime saves you ${formatINR(savings)} per year thanks to your deductions.`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {breakEvenDeduction !== null
                                ? `Break-even deduction threshold: You need at least ${formatINR(breakEvenDeduction)} in eligible deductions for the Old Regime to yield lower taxes than the New Regime.`
                                : 'For this income bracket, the New Regime remains universally advantageous across legal deduction limits.'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        EXTRA MONTHLY CASH
                                    </Typography>
                                    <Typography variant="h6" fontWeight="800" color="success.main">
                                        +{formatINR(monthlyTakeHomeDiff)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        per month
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6}>
                                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        EFFECTIVE RATE DELTA
                                    </Typography>
                                    <Typography variant="h6" fontWeight="800" color="primary.main">
                                        {Math.abs(Number(newRegimeData.effectiveRate) - Number(oldRegimeData.effectiveRate)).toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        lower tax liability
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                {/* Inputs & Deduction Maximizer Checklist */}
                <Grid item xs={12} lg={5}>
                    <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 3.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="700">
                                    Financial Inputs
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    FY 2024-25
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                label="Annual Gross Salary / CTC"
                                type="number"
                                value={income}
                                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                                InputProps={{
                                    startAdornment: (
                                        <Typography sx={{ mr: 1, color: 'primary.main', fontWeight: 700 }}>
                                            ₹
                                        </Typography>
                                    ),
                                }}
                                helperText={`Equivalent to ${formatINR(income)} in your selected currency`}
                                sx={{ mb: 3 }}
                            />

                            <Box sx={{ mb: 2 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="700">
                                        Smart Deduction Checklist (Old Regime)
                                    </Typography>
                                    <Typography variant="caption" fontWeight="700" color="primary.main">
                                        {formatINR(totalDeductionsSum)} / {formatINR(maxTotalDeductions)}
                                    </Typography>
                                </Stack>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(100, (totalDeductionsSum / maxTotalDeductions) * 100)}
                                    sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                                />
                                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleQuickPreset('max')}
                                        sx={{ fontSize: '0.75rem', py: 0.4, borderRadius: 2 }}
                                    >
                                        ⚡ Maximize All
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => handleQuickPreset('salaried')}
                                        sx={{ fontSize: '0.75rem', py: 0.4, borderRadius: 2 }}
                                    >
                                        💼 Standard 80C+80D
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="inherit"
                                        onClick={() => handleQuickPreset('zero')}
                                        sx={{ fontSize: '0.75rem', py: 0.4, borderRadius: 2 }}
                                    >
                                        ↺ Clear
                                    </Button>
                                </Stack>
                            </Box>

                            <Stack spacing={2.5}>
                                <TextField
                                    label="Section 80C (PPF, ELSS, EPF, LIC)"
                                    type="number"
                                    value={deductions.section80C}
                                    onChange={(e) =>
                                        setDeductions({ ...deductions, section80C: Math.max(0, Number(e.target.value)) })
                                    }
                                    helperText={`Max deductible: ₹1,50,000 (${formatINR(150000)})`}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="Medical Health Insurance (Section 80D)"
                                    type="number"
                                    value={deductions.section80D}
                                    onChange={(e) =>
                                        setDeductions({ ...deductions, section80D: Math.max(0, Number(e.target.value)) })
                                    }
                                    helperText={`Self & family: ₹25,000 (${formatINR(25000)})`}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="Home Loan Interest (Section 24b)"
                                    type="number"
                                    value={deductions.homeLoan}
                                    onChange={(e) =>
                                        setDeductions({ ...deductions, homeLoan: Math.max(0, Number(e.target.value)) })
                                    }
                                    helperText={`Self-occupied property cap: ₹2,00,000 (${formatINR(200000)})`}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                                        ),
                                    }}
                                />
                                <TextField
                                    label="NPS Additional Tier-1 (Section 80CCD 1B)"
                                    type="number"
                                    value={deductions.nps}
                                    onChange={(e) =>
                                        setDeductions({ ...deductions, nps: Math.max(0, Number(e.target.value)) })
                                    }
                                    helperText={`Exclusive NPS benefit cap: ₹50,000 (${formatINR(50000)})`}
                                    InputProps={{
                                        startAdornment: (
                                            <Typography sx={{ mr: 1, color: 'text.secondary' }}>₹</Typography>
                                        ),
                                    }}
                                />
                            </Stack>

                            <Alert severity="info" sx={{ mt: 3, borderRadius: 2, fontSize: '0.8rem' }}>
                                Both regimes include a standard deduction of <strong>₹50,000</strong> for salaried individuals. Surcharge and 4% Health &amp; Education Cess are included.
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Comparison Results & Graphs */}
                <Grid item xs={12} lg={7}>
                    <Grid container spacing={3}>
                        {/* New Regime Card */}
                        <Grid item xs={12} md={6}>
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    border: betterRegime === 'new' ? '2px solid' : '1px solid',
                                    borderColor: betterRegime === 'new' ? 'primary.main' : 'divider',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    height: '100%',
                                }}
                            >
                                {betterRegime === 'new' && (
                                    <Box
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            py: 0.6,
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            fontSize: '0.75rem',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        RECOMMENDED OPTION
                                    </Box>
                                )}
                                <CardContent sx={{ p: 3.5 }}>
                                    <Typography variant="h6" fontWeight="700">
                                        New Regime (Default)
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Lower slab tax rates, zero deduction paperwork
                                    </Typography>

                                    <Box sx={{ mt: 2.5, mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Annual Tax Payable
                                        </Typography>
                                        <Typography variant="h4" fontWeight="900" color="primary">
                                            {formatINR(newRegimeData.tax)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Effective Tax Rate: <strong>{newRegimeData.effectiveRate}%</strong> (INR ₹{newRegimeData.tax.toLocaleString()})
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Net Annual Take-Home
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700">
                                                {formatINR(newRegimeData.takeHome)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Monthly Take-Home
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color="success.main">
                                                {formatINR(Math.round(newRegimeData.takeHome / 12))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Taxable Base
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatINR(newRegimeData.taxableIncome)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Old Regime Card */}
                        <Grid item xs={12} md={6}>
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    border: betterRegime === 'old' ? '2px solid' : '1px solid',
                                    borderColor: betterRegime === 'old' ? 'success.main' : 'divider',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    height: '100%',
                                }}
                            >
                                {betterRegime === 'old' && (
                                    <Box
                                        sx={{
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            py: 0.6,
                                            textAlign: 'center',
                                            fontWeight: 800,
                                            fontSize: '0.75rem',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        RECOMMENDED OPTION
                                    </Box>
                                )}
                                <CardContent sx={{ p: 3.5 }}>
                                    <Typography variant="h6" fontWeight="700">
                                        Old Regime
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        With 80C, 80D, Sec 24, and NPS deductions
                                    </Typography>

                                    <Box sx={{ mt: 2.5, mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Total Annual Tax Payable
                                        </Typography>
                                        <Typography variant="h4" fontWeight="900" color={betterRegime === 'old' ? 'success.main' : 'text.primary'}>
                                            {formatINR(oldRegimeData.tax)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Effective Tax Rate: <strong>{oldRegimeData.effectiveRate}%</strong> (INR ₹{oldRegimeData.tax.toLocaleString()})
                                        </Typography>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    <Stack spacing={1.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Net Annual Take-Home
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700">
                                                {formatINR(oldRegimeData.takeHome)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Monthly Take-Home
                                            </Typography>
                                            <Typography variant="body2" fontWeight="700" color={betterRegime === 'old' ? 'success.main' : 'text.primary'}>
                                                {formatINR(Math.round(oldRegimeData.takeHome / 12))}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Deductions Claimed
                                            </Typography>
                                            <Typography variant="body2" fontWeight="600" color="primary.main">
                                                {formatINR(oldRegimeData.totalDeductionsClaimed)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Chart Comparison */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 3.5 }}>
                                    <Typography variant="h6" fontWeight="700" gutterBottom>
                                        Take-Home vs Tax Comparison ({currencyInfo.code})
                                    </Typography>
                                    <Box sx={{ height: 280, mt: 2 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={comparisonData.map(d => ({
                                                    name: d.name,
                                                    taxUSD: d.tax / 83.5,
                                                    takeHomeUSD: d.takeHome / 83.5,
                                                }))}
                                            >
                                                <XAxis dataKey="name" stroke="#94a3b8" />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    tickFormatter={(v) => formatAmount(v, { compact: true })}
                                                />
                                                <Tooltip
                                                    formatter={(v: any) => formatAmount(Number(v))}
                                                    contentStyle={{
                                                        backgroundColor: '#0f172a',
                                                        borderColor: '#334155',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                    }}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="taxUSD"
                                                    name="Tax Payable"
                                                    fill="#ef4444"
                                                    radius={[6, 6, 0, 0]}
                                                />
                                                <Bar
                                                    dataKey="takeHomeUSD"
                                                    name="Net Take-Home"
                                                    fill="#10b981"
                                                    radius={[6, 6, 0, 0]}
                                                />
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

