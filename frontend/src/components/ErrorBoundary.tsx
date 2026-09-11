import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Card, CardContent, Typography, Container } from '@mui/material';
import { Error as ErrorIcon, Refresh } from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // You can also log the error to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Card
                        sx={{
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <ErrorIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
                            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                                Oops! Something went wrong
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                                We&apos;re sorry for the inconvenience. An unexpected error has occurred.
                            </Typography>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                        borderRadius: 2,
                                        textAlign: 'left',
                                        maxHeight: 200,
                                        overflow: 'auto',
                                    }}
                                >
                                    <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Refresh />}
                                    onClick={this.handleReset}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: 'primary.main',
                                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                                    }}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => (window.location.href = '/')}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                                    }}
                                >
                                    Go Home
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
