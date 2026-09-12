import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'light',
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('dark');

    useEffect(() => {
        // Load theme preference from localStorage, default to dark for fintech aesthetic
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode) {
            setMode(savedMode);
        } else {
            setMode('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
    };

    const theme = createTheme({
        palette: {
            contrastThreshold: 4.5,
            mode,
            primary: {
                main: mode === 'light' ? '#2563eb' : '#3b82f6',
                light: mode === 'light' ? '#3b82f6' : '#60a5fa',
                dark: mode === 'light' ? '#1d4ed8' : '#1e40af',
                contrastText: '#ffffff',
            },
            secondary: {
                main: mode === 'light' ? '#4f46e5' : '#818cf8',
                light: mode === 'light' ? '#6366f1' : '#a5b4fc',
                dark: mode === 'light' ? '#3730a3' : '#4f46e5',
                contrastText: '#ffffff',
            },
            success: {
                main: mode === 'light' ? '#059669' : '#10b981',
                light: mode === 'light' ? '#34d399' : '#34d399',
                dark: mode === 'light' ? '#047857' : '#059669',
                contrastText: '#ffffff',
            },
            warning: {
                main: mode === 'light' ? '#d97706' : '#f59e0b',
                light: mode === 'light' ? '#fbbf24' : '#fbbf24',
                dark: mode === 'light' ? '#b45309' : '#d97706',
                contrastText: '#ffffff',
            },
            error: {
                main: mode === 'light' ? '#dc2626' : '#ef4444',
                light: mode === 'light' ? '#f87171' : '#f87171',
                dark: mode === 'light' ? '#b91c1c' : '#dc2626',
                contrastText: '#ffffff',
            },
            info: {
                main: mode === 'light' ? '#0284c7' : '#38bdf8',
                light: mode === 'light' ? '#38bdf8' : '#38bdf8',
                dark: mode === 'light' ? '#0369a1' : '#0284c7',
                contrastText: '#ffffff',
            },
            background: {
                default: mode === 'light' ? '#f1f5f9' : '#080c14',
                paper: mode === 'light' ? '#ffffff' : '#0f172a',
            },
            text: {
                primary: mode === 'light' ? '#0f172a' : '#f8fafc',
                secondary: mode === 'light' ? '#475569' : '#94a3b8',
            },
            divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
        },
        typography: {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            h1: { fontWeight: 800, letterSpacing: '-0.025em' },
            h2: { fontWeight: 700, letterSpacing: '-0.02em' },
            h3: { fontWeight: 700, letterSpacing: '-0.015em' },
            h4: { fontWeight: 700, letterSpacing: '-0.01em' },
            h5: { fontWeight: 600, letterSpacing: '-0.005em' },
            h6: { fontWeight: 600 },
            subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
            subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
            body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
            body2: { fontSize: '0.85rem', lineHeight: 1.5 },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: {
            borderRadius: 10,
        },
        components: {
            MuiCard: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.08)'}`,
                        boxShadow: mode === 'light'
                            ? '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)'
                            : '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        backgroundImage: 'none',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: mode === 'light'
                                ? '0 10px 20px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
                                : '0 10px 20px -4px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
                        },
                    },
                },
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 8,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    containedPrimary: {
                        background: mode === 'light' ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                        '&:hover': {
                            background: mode === 'light' ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                        borderRadius: 6,
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: {
                        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.07)',
                        padding: '12px 16px',
                    },
                    head: {
                        fontWeight: 600,
                        color: mode === 'light' ? '#475569' : '#94a3b8',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.05em',
                    },
                },
            },
        },
    });

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};
