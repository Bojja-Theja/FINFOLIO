import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, Button, InputAdornment } from '@mui/material';
import { ExpandMore, Search, Email, Phone, Chat, VideoLibrary, Article } from '@mui/icons-material';
import Layout from '../components/Layout';

const Help = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            question: 'How do I create a budget?',
            answer: 'Navigate to the Budget Planner page from the main menu. Click "Add Category" to create budget categories, set your monthly income, and allocate amounts to each category. The system will track your spending against these allocations automatically.',
        },
        {
            question: 'How does the Financial Health Score work?',
            answer: 'Your Financial Health Score is calculated based on multiple factors including income stability, expense management, savings rate, debt-to-income ratio, and emergency fund coverage. The score ranges from 0-100, with higher scores indicating better financial health.',
        },
        {
            question: 'Can I export my financial data?',
            answer: 'Yes! Go to the Reports page and click on any of the export buttons (PDF, CSV, or Excel) to download your financial data. You can customize the date range and select specific categories to include in your export.',
        },
        {
            question: 'How do I set financial goals?',
            answer: 'Visit the Goals page and click "Add New Goal". Enter your goal name, target amount, deadline, and priority. The system will calculate how much you need to save monthly to reach your goal and track your progress automatically.',
        },
        {
            question: 'Is my financial data secure?',
            answer: 'Absolutely! We use bank-level AES-256 encryption for all your data, both in transit and at rest, along with ML-based fraud detection to protect your account.',
        },
        {
            question: 'How do I enable dark mode?',
            answer: 'Go to Settings and toggle the "Dark Mode" switch. Your preference will be saved automatically and applied across all pages.',
        },
        {
            question: 'Can I track multiple currencies?',
            answer: 'Yes! In Settings > Preferences, you can select your preferred currency. The system supports INR, USD, EUR, GBP, and more.',
        },
        {
            question: 'How do I delete my account?',
            answer: 'Go to Settings > Security and click "Delete Account". Please note that this action is irreversible and will permanently delete all your financial data.',
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                ❓ Help & Support
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Find answers to common questions or get in touch with our support team
            </Typography>

            {/* Search */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {/* Quick Links */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Quick Links
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <VideoLibrary sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Video Tutorials
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Watch step-by-step guides
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Article sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Documentation
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Read detailed guides
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Chat sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Live Chat
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Chat with support
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Email sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Email Support
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Get help via email
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* FAQs */}
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                        Frequently Asked Questions
                    </Typography>
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, index) => (
                            <Accordion key={index} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography color="textSecondary">{faq.answer}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" textAlign="center">
                                    No results found for &quot;{searchQuery}&quot;. Try a different search term or contact support.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Contact Support */}
                <Grid item xs={12}>
                    <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Still Need Help?
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3 }}>
                                Our support team is available 24/7 to assist you with any questions or issues.
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Email />
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Email</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>support@finfolio.com</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Phone />
                                        <Box>
                                            <Typography variant="caption" sx={{ opacity: 0.9 }}>Phone</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>+91 1800-123-4567</Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<Chat />}
                                        sx={{
                                            backgroundColor: 'white',
                                            color: 'primary.main',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' },
                                        }}
                                    >
                                        Start Live Chat
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Help;
