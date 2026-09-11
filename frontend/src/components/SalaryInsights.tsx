import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Slider,
    Grid,
    Card,
    CardContent,
    alpha,
} from '@mui/material';
import {
    TrendingUp,
    AttachMoney,
    Timeline,
    WorkOutline,
    Search as SearchIcon,
} from '@mui/icons-material';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TextField, InputAdornment, IconButton, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import GlassCard from './ui/GlassCard';
import AnimatedCounter from './ui/AnimatedCounter';
import LoadingSkeleton from './ui/LoadingSkeleton';
import axios from 'axios';
import ClientOnly from './ClientOnly';

interface SalaryData {
    yearsExperience: number;
    salary: number;
}

interface SalaryStats {
    avgSalary: number;
    minSalary: number;
    maxSalary: number;
    avgExperience: number;
    dataPoints: number;
}

interface SalaryInsightsProps {
    initialExperience?: number;
}

const SalaryInsights: React.FC<SalaryInsightsProps> = ({ initialExperience = 5 }) => {
    const [experience, setExperience] = useState(initialExperience);
    const [predictedSalary, setPredictedSalary] = useState(0);
    const [stats, setStats] = useState<SalaryStats | null>(null);
    const [chartData, setChartData] = useState<SalaryData[]>([]);
    const [h1bStats, setH1BStats] = useState<any[]>([]);
    const [h1bSearch, setH1BSearch] = useState('');
    const [h1bResults, setH1BResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchSalaryPrediction = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/insights/salary-prediction?experience=${experience}`);

                if (response.data.success) {
                    setPredictedSalary(response.data.data.predictedSalary);
                    setStats(response.data.data.stats);
                    setChartData(response.data.data.chartData);
                }

                // Fetch H1B stats too
                const h1bResponse = await axios.get('/api/insights/h1b-stats');
                if (h1bResponse.data.success) {
                    setH1BStats(h1bResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSalaryPrediction();
    }, [experience]);

    const handleH1BSearch = async () => {
        if (!h1bSearch.trim()) return;
        try {
            setSearching(true);
            const response = await axios.get(`/api/insights/h1b-search?q=${h1bSearch}`);
            if (response.data.success) {
                setH1BResults(response.data.data);
            }
        } catch (error) {
            console.error('Error searching H1B:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleExperienceChange = (_event: Event, newValue: number | number[]) => {
        setExperience(newValue as number);
    };

    if (loading && !stats) {
        return <LoadingSkeleton variant="rectangular" height={400} />;
    }

    const salaryGrowth = stats ? ((predictedSalary - stats.avgSalary) / stats.avgSalary) * 100 : 0;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    💰 Salary Insights
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Predict your salary based on years of experience
                </Typography>
            </Box>

            {/* Experience Slider */}
            <GlassCard sx={{ p: 3, mb: 3 }} borderGlow>
                <Typography variant="h6" gutterBottom>
                    Years of Experience
                </Typography>
                <Box sx={{ px: 2, pt: 2 }}>
                    <Slider
                        value={experience}
                        onChange={handleExperienceChange}
                        min={0}
                        max={15}
                        step={0.5}
                        marks={[
                            { value: 0, label: '0' },
                            { value: 5, label: '5' },
                            { value: 10, label: '10' },
                            { value: 15, label: '15+' },
                        ]}
                        valueLabelDisplay="on"
                        sx={{
                            '& .MuiSlider-thumb': {
                                width: 24,
                                height: 24,
                                background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                                boxShadow: '0 4px 12px rgba(0, 122, 247, 0.4)',
                            },
                            '& .MuiSlider-track': {
                                background: 'linear-gradient(90deg, #007AF7 0%, #6C63FF 100%)',
                                height: 6,
                            },
                            '& .MuiSlider-rail': {
                                height: 6,
                                opacity: 0.3,
                            },
                            '& .MuiSlider-valueLabel': {
                                background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                            },
                        }}
                    />
                </Box>
            </GlassCard>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Predicted Salary */}
                <Grid item xs={12} md={6}>
                    <GlassCard
                        sx={{
                            p: 3,
                            background: 'linear-gradient(135deg, rgba(0, 122, 247, 0.1) 0%, rgba(108, 99, 255, 0.1) 100%)',
                        }}
                        borderGlow
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #007AF7 0%, #6C63FF 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                }}
                            >
                                <AttachMoney sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Predicted Salary
                                </Typography>
                                <AnimatedCounter
                                    value={predictedSalary}
                                    prefix="$"
                                    separator=","
                                    variant="h4"
                                    fontWeight={700}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp
                                sx={{
                                    color: salaryGrowth >= 0 ? 'success.main' : 'error.main',
                                    fontSize: 20,
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    color: salaryGrowth >= 0 ? 'success.main' : 'error.main',
                                    fontWeight: 600,
                                }}
                            >
                                {salaryGrowth >= 0 ? '+' : ''}{salaryGrowth.toFixed(1)}% vs average
                            </Typography>
                        </Box>
                    </GlassCard>
                </Grid>

                {/* Average Salary */}
                <Grid item xs={12} md={6}>
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 2,
                                }}
                            >
                                <Timeline sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Market Average
                                </Typography>
                                <AnimatedCounter
                                    value={stats?.avgSalary || 0}
                                    prefix="$"
                                    separator=","
                                    variant="h4"
                                    fontWeight={700}
                                />
                            </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Based on {stats?.dataPoints || 0} data points
                        </Typography>
                    </GlassCard>
                </Grid>

                {/* Salary Range */}
                <Grid item xs={12} md={6}>
                    <GlassCard sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Salary Range
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Minimum
                                </Typography>
                                <Typography variant="h6" fontWeight={600}>
                                    ${stats?.minSalary.toLocaleString() || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Maximum
                                </Typography>
                                <Typography variant="h6" fontWeight={600}>
                                    ${stats?.maxSalary.toLocaleString() || 0}
                                </Typography>
                            </Box>
                        </Box>
                        <Box
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 50%, #10B981 100%)',
                                position: 'relative',
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -4,
                                    left: stats ? `${((predictedSalary - stats.minSalary) / (stats.maxSalary - stats.minSalary)) * 100}%` : '50%',
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: 'white',
                                    border: '3px solid #007AF7',
                                    boxShadow: '0 2px 8px rgba(0, 122, 247, 0.4)',
                                }}
                            />
                        </Box>
                    </GlassCard>
                </Grid>

                {/* Career Progression */}
                <Grid item xs={12} md={6}>
                    <GlassCard sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Career Progression
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <WorkOutline sx={{ fontSize: 40, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Average Experience
                                </Typography>
                                <Typography variant="h5" fontWeight={600}>
                                    {stats?.avgExperience.toFixed(1) || 0} years
                                </Typography>
                            </Box>
                        </Box>
                    </GlassCard>
                </Grid>
            </Grid>

            {/* Salary Trend Chart */}
            <GlassCard sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    Salary Trend Analysis
                </Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                    <ClientOnly>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007AF7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha('#000', 0.1)} />
                                <XAxis
                                    dataKey="yearsExperience"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: alpha('#000', 0.5) }}
                                    label={{ value: 'Years of Experience', position: 'insideBottom', offset: -5, fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: alpha('#000', 0.5) }}
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    }}
                                    formatter={(value: any) => [value ? `$${value.toLocaleString()}` : '$0', 'Salary']}
                                    labelFormatter={(label) => `${label} Years Experience`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="salary"
                                    stroke="#007AF7"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSalary)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ClientOnly>
                </Box>
            </GlassCard>

            {/* H1B Benchmarks Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                🏢 Real-world H1B Benchmarks
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder="Search Job Title..."
                                    value={h1bSearch}
                                    onChange={(e) => setH1BSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleH1BSearch()}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleH1BSearch} edge="end" disabled={searching}>
                                                    <SearchIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                            {(h1bResults.length > 0 ? h1bResults : h1bStats.slice(0, 10)).map((item, index) => (
                                <Box key={index}>
                                    <ListItem
                                        secondaryAction={
                                            <Typography variant="h6" color="primary.main" fontWeight={700}>
                                                ${item.avgWage.toLocaleString()}
                                            </Typography>
                                        }
                                    >
                                        <ListItemText
                                            primary={item.jobTitle}
                                            secondary={`${item.count.toLocaleString()} data points`}
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </Box>
                            ))}
                            {h1bResults.length === 0 && h1bSearch && !searching && (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                    No results found for &quot;{h1bSearch}&quot;
                                </Typography>
                            )}
                        </List>
                    </GlassCard>
                </Grid>

                <Grid item xs={12} md={5}>
                    <GlassCard sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Market Distribution
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <ClientOnly>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={h1bStats.slice(0, 5)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="jobTitle" hide />
                                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                        <Tooltip formatter={(val: any) => [`$${val.toLocaleString()}`, 'Avg Salary']} />
                                        <Bar dataKey="avgWage" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ClientOnly>
                        </Box>
                        <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 2 }}>
                            Comparison of top H1B job categories by average wage
                        </Typography>
                    </GlassCard>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SalaryInsights;
