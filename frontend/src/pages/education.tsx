import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Chip, TextField, InputAdornment, Tabs, Tab, LinearProgress, Button } from '@mui/material';
import { Search, PlayCircle, Article, TrendingUp, School, Timer } from '@mui/icons-material';
import Layout from '../components/Layout';

interface Course {
    id: number;
    title: string;
    description: string;
    category: string;
    duration: string;
    level: string;
    progress: number;
    image: string;
}

interface Article {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
}

const EducationHub = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const courses: Course[] = [
        {
            id: 1,
            title: 'Personal Finance Basics',
            description: 'Learn the fundamentals of managing your money, budgeting, and saving.',
            category: 'Beginner',
            duration: '2 hours',
            level: 'Beginner',
            progress: 65,
            image: '/course-finance-basics.jpg',
        },
        {
            id: 2,
            title: 'Investment Strategies',
            description: 'Understand different investment options and how to build a diversified portfolio.',
            category: 'Intermediate',
            duration: '3 hours',
            level: 'Intermediate',
            progress: 30,
            image: '/course-investments.jpg',
        },
        {
            id: 3,
            title: 'Tax Planning & Optimization',
            description: 'Master tax-saving strategies and deductions to minimize your tax liability.',
            category: 'Advanced',
            duration: '2.5 hours',
            level: 'Advanced',
            progress: 0,
            image: '/course-tax.jpg',
        },
        {
            id: 4,
            title: 'Retirement Planning',
            description: 'Plan for a comfortable retirement with smart savings and investment strategies.',
            category: 'Intermediate',
            duration: '2 hours',
            level: 'Intermediate',
            progress: 0,
            image: '/course-retirement.jpg',
        },
    ];

    const articles: Article[] = [
        {
            id: 1,
            title: '10 Ways to Save Money on Daily Expenses',
            excerpt: 'Discover practical tips to reduce your daily spending without sacrificing quality of life.',
            category: 'Budgeting',
            readTime: '5 min',
            date: '2024-02-01',
        },
        {
            id: 2,
            title: 'Understanding Mutual Funds vs ETFs',
            excerpt: 'A comprehensive comparison to help you choose the right investment vehicle.',
            category: 'Investing',
            readTime: '8 min',
            date: '2024-01-28',
        },
        {
            id: 3,
            title: 'Emergency Fund: How Much Do You Need?',
            excerpt: 'Calculate the ideal emergency fund size for your financial situation.',
            category: 'Savings',
            readTime: '6 min',
            date: '2024-01-25',
        },
        {
            id: 4,
            title: 'Credit Score Improvement Guide',
            excerpt: 'Step-by-step strategies to boost your credit score and maintain good credit health.',
            category: 'Credit',
            readTime: '10 min',
            date: '2024-01-20',
        },
    ];

    const videos = [
        { id: 1, title: 'How to Create a Budget in 5 Minutes', duration: '5:23', views: '12K' },
        { id: 2, title: 'Stock Market Basics for Beginners', duration: '8:45', views: '25K' },
        { id: 3, title: 'Understanding Compound Interest', duration: '6:12', views: '18K' },
        { id: 4, title: 'Debt Payoff Strategies Explained', duration: '7:30', views: '15K' },
    ];

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Beginner':
                return '#10b981';
            case 'Intermediate':
                return '#f59e0b';
            case 'Advanced':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                📚 Financial Education Hub
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Expand your financial knowledge with courses, articles, and video tutorials
            </Typography>

            {/* Search Bar */}
            <TextField
                fullWidth
                placeholder="Search courses, articles, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 4 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
                <Tab label="Courses" icon={<School />} iconPosition="start" />
                <Tab label="Articles" icon={<Article />} iconPosition="start" />
                <Tab label="Videos" icon={<PlayCircle />} iconPosition="start" />
            </Tabs>

            {/* Courses Tab */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} md={6} key={course.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box
                                    sx={{
                                        height: 200,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                >
                                    <School sx={{ fontSize: 80, opacity: 0.3 }} />
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={course.level}
                                            size="small"
                                            sx={{
                                                backgroundColor: getLevelColor(course.level),
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                        <Chip
                                            label={course.duration}
                                            size="small"
                                            icon={<Timer />}
                                            variant="outlined"
                                        />
                                    </Box>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        {course.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {course.description}
                                    </Typography>
                                    {course.progress > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Progress
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {course.progress}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={course.progress}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        </Box>
                                    )}
                                    <Button
                                        fullWidth
                                        variant={course.progress > 0 ? 'outlined' : 'contained'}
                                        sx={{
                                            background: course.progress === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined,
                                        }}
                                    >
                                        {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Articles Tab */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {articles.map((article) => (
                        <Grid item xs={12} md={6} key={article.id}>
                            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, cursor: 'pointer' }}>
                                <CardContent>
                                    <Chip label={article.category} size="small" sx={{ mb: 2 }} />
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                        {article.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        {article.excerpt}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            {article.readTime} read
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            •
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(article.date).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Videos Tab */}
            {activeTab === 2 && (
                <Grid container spacing={3}>
                    {videos.map((video) => (
                        <Grid item xs={12} sm={6} md={3} key={video.id}>
                            <Card sx={{ '&:hover': { boxShadow: 6 }, cursor: 'pointer' }}>
                                <Box
                                    sx={{
                                        height: 180,
                                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <PlayCircle sx={{ fontSize: 60, color: 'white', opacity: 0.9 }} />
                                    <Chip
                                        label={video.duration}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                        }}
                                    />
                                </Box>
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                        {video.title}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {video.views} views
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Learning Stats */}
            <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        📊 Your Learning Progress
                    </Typography>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                2
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Courses in Progress
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                12
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Articles Read
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                8
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Videos Watched
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default EducationHub;
