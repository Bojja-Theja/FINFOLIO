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
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    zIndex: 1000,
                }}
                onClick={() => setOpen(true)}
            >
                <SmartToy />
            </Fab>

            {/* Chat Drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: isMobile ? '100%' : 400,
                        maxWidth: '100%',
                    },
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'white', color: '#667eea' }}>
                                <SmartToy />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    AI Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Online • Ready to help
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Messages */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2,
                            backgroundColor: '#f9fafb',
                        }}
                    >
                        {messages.map((message) => (
                            <Box key={message.id} sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                        mb: 0.5,
                                    }}
                                >
                                    {message.sender === 'bot' && (
                                        <Avatar sx={{ mr: 1, width: 32, height: 32, bgcolor: '#667eea' }}>
                                            <SmartToy sx={{ fontSize: 20 }} />
                                        </Avatar>
                                    )}
                                    <Box
                                        sx={{
                                            maxWidth: '75%',
                                            p: 1.5,
                                            borderRadius: 2,
                                            backgroundColor: message.sender === 'user' ? '#667eea' : 'white',
                                            color: message.sender === 'user' ? 'white' : 'text.primary',
                                            boxShadow: 1,
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        <Typography variant="body2">{message.text}</Typography>
                                    </Box>
                                </Box>

                                {/* Suggestions */}
                                {message.suggestions && (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: 5 }}>
                                        {message.suggestions.map((suggestion, index) => (
                                            <Chip
                                                key={index}
                                                label={suggestion}
                                                size="small"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { backgroundColor: '#e5e7eb' },
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
                    <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Ask me anything about your finances..."
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
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                                    },
                                    '&:disabled': {
                                        background: '#e5e7eb',
                                        color: '#9ca3af',
                                    },
                                }}
                            >
                                <Send />
                            </IconButton>
                        </Box>

                        {/* Quick Actions */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            <Chip
                                icon={<TrendingUp />}
                                label="Budget Tips"
                                size="small"
                                onClick={() => handleSend('Give me budget tips')}
                                clickable
                            />
                            <Chip
                                icon={<AccountBalance />}
                                label="Invest"
                                size="small"
                                onClick={() => handleSend('How should I invest?')}
                                clickable
                            />
                            <Chip
                                icon={<Lightbulb />}
                                label="Save More"
                                size="small"
                                onClick={() => handleSend('How can I save more money?')}
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
