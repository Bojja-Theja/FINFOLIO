import React, { useState, useRef, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, IconButton, Avatar, Chip, Fab, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Send, Close, SmartToy, TrendingUp, AccountBalance, Lightbulb } from '@mui/icons-material';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    suggestions?: string[];
}

const AIChatbot: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi! I'm your AI financial assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date(),
            suggestions: [
                'How can I save more money?',
                'Explain my budget',
                'Investment advice',
                'Tax saving tips',
            ],
        },
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages([...messages, userMessage]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            const botResponse = generateResponse(messageText);
            const botMessage: Message = {
                id: messages.length + 2,
                text: botResponse.text,
                sender: 'bot',
                timestamp: new Date(),
                ...(botResponse.suggestions && { suggestions: botResponse.suggestions })
            };
            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };

    const generateResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
            return {
                text: "Great question! Here are some tips to save more:\n\n1. Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n2. Automate your savings with recurring transfers\n3. Cut unnecessary subscriptions\n4. Use the envelope budgeting method\n5. Track every expense\n\nWould you like me to analyze your current spending patterns?",
                suggestions: ['Analyze my spending', 'Set up auto-save', 'Budget tips'],
            };
        }

        if (lowerMessage.includes('budget')) {
            return {
                text: "Your current budget shows:\n\n• Monthly Income: ₹75,000\n• Total Allocated: ₹62,000\n• Remaining: ₹13,000\n\nYou're doing well! Consider allocating the remaining ₹13,000 to your emergency fund or investments.",
                suggestions: ['Optimize budget', 'Emergency fund tips', 'Investment options'],
            };
        }

        if (lowerMessage.includes('invest')) {
            return {
                text: "Based on your profile, I recommend:\n\n1. **Emergency Fund**: Build 6 months of expenses first\n2. **Index Funds**: Low-cost, diversified option (60%)\n3. **Debt Funds**: For stability (30%)\n4. **Gold**: Hedge against inflation (10%)\n\nStart with SIPs of ₹10,000/month. Would you like specific fund recommendations?",
                suggestions: ['Fund recommendations', 'SIP calculator', 'Risk assessment'],
            };
        }

        if (lowerMessage.includes('tax')) {
            return {
                text: "Tax-saving opportunities for you:\n\n• Section 80C: Invest up to ₹1.5L (ELSS, PPF, EPF)\n• Section 80D: Health insurance premiums\n• NPS: Additional ₹50K deduction\n• Home Loan: Interest deduction up to ₹2L\n\nYou could save up to ₹46,800 in taxes! Want to see a detailed breakdown?",
                suggestions: ['Tax breakdown', 'Best 80C options', 'NPS benefits'],
            };
        }

        return {
            text: "I can help you with:\n\n• Budget planning and optimization\n• Investment recommendations\n• Tax saving strategies\n• Debt management\n• Goal planning\n• Expense tracking\n\nWhat would you like to know more about?",
            suggestions: ['Budget help', 'Investment advice', 'Tax tips', 'Debt payoff'],
        };
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    return (
        <>
            {/* Floating Action Button */}
            <Fab
                color="primary"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
                    zIndex: 1000,
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                    },
                }}
                onClick={() => setOpen(true)}
            >
                <SmartToy sx={{ color: '#ffffff' }} />
            </Fab>

            {/* Chat Drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: isMobile ? '100%' : 420,
                        maxWidth: '100%',
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2.5,
                            bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : '#1e293b',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1.8, bgcolor: 'primary.main', color: '#ffffff' }}>
                                <SmartToy sx={{ fontSize: 22 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                                    FINFOLIO AI Copilot
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.6, fontWeight: 600 }}>
                                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981' }} />
                                    Online • Rupee (₹) Financial Advisor
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#ffffff' } }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2.5,
                            bgcolor: theme.palette.mode === 'dark' ? '#080c14' : '#f8fafc',
                        }}
                    >
                        {messages.map((message) => (
                            <Box key={message.id} sx={{ mb: 2.5 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                        mb: 0.8,
                                    }}
                                >
                                    {message.sender === 'bot' && (
                                        <Avatar
                                            sx={{
                                                mr: 1.2,
                                                width: 32,
                                                height: 32,
                                                bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#e0e7ff',
                                                color: 'primary.main',
                                            }}
                                        >
                                            <SmartToy sx={{ fontSize: 18 }} />
                                        </Avatar>
                                    )}
                                    <Box
                                        sx={{
                                            maxWidth: '82%',
                                            p: 2,
                                            borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                                            color: message.sender === 'user' ? '#ffffff' : 'text.primary',
                                            border: '1px solid',
                                            borderColor: message.sender === 'user' ? 'primary.main' : 'divider',
                                            boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 6px rgba(0,0,0,0.06)',
                                            whiteSpace: 'pre-line',
                                            lineHeight: 1.6,
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        <Typography variant="body2">{message.text}</Typography>
                                    </Box>
                                </Box>

                                {/* Suggestions */}
                                {message.suggestions && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.2, ml: 5 }}>
                                        {message.suggestions.map((suggestion, index) => (
                                            <Chip
                                                key={index}
                                                label={suggestion}
                                                size="small"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(37, 99, 235, 0.08)',
                                                    color: 'primary.main',
                                                    border: '1px solid',
                                                    borderColor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.2)',
                                                    '&:hover': {
                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.22)' : 'rgba(37, 99, 235, 0.15)',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Ask about ₹ investments, tax regimes, debt avalanche..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                size="small"
                                multiline
                                maxRows={3}
                            />
                            <IconButton
                                color="primary"
                                onClick={() => handleSend()}
                                disabled={!input.trim()}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: '#ffffff',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '&:disabled': {
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                                        color: 'text.disabled',
                                    },
                                }}
                            >
                                <Send fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* Quick Actions */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<TrendingUp fontSize="small" />}
                                label="₹ Budget Tips"
                                size="small"
                                variant="outlined"
                                onClick={() => handleSend('Give me budget tips for ₹75,000 income')}
                                clickable
                            />
                            <Chip
                                icon={<AccountBalance fontSize="small" />}
                                label="₹ Tax Regimes"
                                size="small"
                                variant="outlined"
                                onClick={() => handleSend('Compare Old vs New Tax Regime for my income')}
                                clickable
                            />
                            <Chip
                                icon={<Lightbulb fontSize="small" />}
                                label="₹ SIP Strategy"
                                size="small"
                                variant="outlined"
                                onClick={() => handleSend('How should I start mutual fund SIPs in India?')}
                                clickable
                            />
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default AIChatbot;
