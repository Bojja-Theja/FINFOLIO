import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, Stepper, Step, StepLabel } from '@mui/material';
import { Close, NavigateNext, NavigateBefore, CheckCircle } from '@mui/icons-material';

interface TourStep {
    title: string;
    description: string;
    target?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete?: () => void;
    onSkip?: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has completed the tour
        const tourCompleted = localStorage.getItem('onboardingTourCompleted');
        if (!tourCompleted) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboardingTourCompleted', 'true');
        setIsOpen(false);
        onComplete?.();
    };

    const handleSkip = () => {
        localStorage.setItem('onboardingTourCompleted', 'true');
        setIsOpen(false);
        onSkip?.();
    };

    const currentStepData = steps[currentStep];
    if (!isOpen || !currentStepData) return null;
    const isLastStep = currentStep === steps.length - 1;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 600,
                    width: '100%',
                    position: 'relative',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <IconButton
                        onClick={handleSkip}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                        }}
                    >
                        <Close />
                    </IconButton>

                    <Box sx={{ mb: 3 }}>
                        <Stepper activeStep={currentStep} sx={{ mb: 3 }}>
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel />
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        {isLastStep && (
                            <CheckCircle
                                sx={{
                                    fontSize: 60,
                                    color: 'success.main',
                                    mb: 2,
                                }}
                            />
                        )}
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                            {currentStepData.title}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            {currentStepData.description}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            onClick={handleSkip}
                            sx={{ visibility: isLastStep ? 'hidden' : 'visible' }}
                        >
                            Skip Tour
                        </Button>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                onClick={handleBack}
                                startIcon={<NavigateBefore />}
                                disabled={currentStep === 0}
                                variant="outlined"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleNext}
                                endIcon={isLastStep ? <CheckCircle /> : <NavigateNext />}
                                variant="contained"
                                sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    '&:hover': { background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' },
                                }}
                            >
                                {isLastStep ? 'Get Started' : 'Next'}
                            </Button>
                        </Box>
                    </Box>

                    <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                    >
                        Step {currentStep + 1} of {steps.length}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default OnboardingTour;

// Example usage:
export const defaultTourSteps: TourStep[] = [
    {
        title: 'Welcome to CapStack! 🎉',
        description: 'Your AI-powered personal finance platform. Let\'s take a quick tour to get you started.',
    },
    {
        title: 'Dashboard Overview',
        description: 'Your dashboard shows your financial health score, recent transactions, and key metrics at a glance.',
    },
    {
        title: 'Budget Planner',
        description: 'Create and manage budgets by category. Track your spending and get AI-powered recommendations.',
    },
    {
        title: 'Financial Goals',
        description: 'Set and track financial goals like buying a house, saving for vacation, or retirement planning.',
    },
    {
        title: 'Investment Portfolio',
        description: 'Monitor your investments, view asset allocation, and get rebalancing recommendations.',
    },
    {
        title: 'AI Insights',
        description: 'Get personalized financial insights and recommendations powered by machine learning.',
    },
    {
        title: 'You\'re All Set!',
        description: 'Start exploring your financial dashboard and take control of your finances today!',
    },
];
