import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
} from '@mui/material';
import { Brightness4, Brightness7, Notifications, Security, Person } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useTheme } from '../components/ThemeProvider';

const Settings = () => {
    const { mode, toggleTheme } = useTheme();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        budgetAlerts: true,
        goalReminders: true,
        currency: 'INR',
        language: 'en',
    });

    const handleSettingChange = (setting: string, value: boolean | string) => {
        setSettings({ ...settings, [setting]: value });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                ⚙️ Settings
            </Typography>

            <Grid container spacing={3}>
                {/* Appearance */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {mode === 'light' ? <Brightness7 sx={{ mr: 1 }} /> : <Brightness4 sx={{ mr: 1 }} />}
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Appearance
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={mode === 'dark'}
                                        onChange={toggleTheme}
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="body1">Dark Mode</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                                        </Typography>
                                    </Box>
                                }
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notifications */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Notifications sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Notifications
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Email Notifications</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Receive updates and alerts via email
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.pushNotifications}
                                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Push Notifications</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Get real-time notifications in your browser
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.budgetAlerts}
                                            onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Budget Alerts</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Get notified when you exceed budget limits
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={settings.goalReminders}
                                            onChange={(e) => handleSettingChange('goalReminders', e.target.checked)}
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1">Goal Reminders</Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Receive reminders about your financial goals
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Preferences */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Person sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Preferences
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Currency</InputLabel>
                                        <Select
                                            value={settings.currency}
                                            label="Currency"
                                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                                        >
                                            <MenuItem value="INR">₹ Indian Rupee (INR)</MenuItem>
                                            <MenuItem value="USD">$ US Dollar (USD)</MenuItem>
                                            <MenuItem value="EUR">€ Euro (EUR)</MenuItem>
                                            <MenuItem value="GBP">£ British Pound (GBP)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Language</InputLabel>
                                        <Select
                                            value={settings.language}
                                            label="Language"
                                            onChange={(e) => handleSettingChange('language', e.target.value)}
                                        >
                                            <MenuItem value="en">English</MenuItem>
                                            <MenuItem value="hi">Hindi</MenuItem>
                                            <MenuItem value="es">Spanish</MenuItem>
                                            <MenuItem value="fr">French</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Security */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Security sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Security
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Change Password
                                </Button>

                                <Button
                                    variant="outlined"
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Enable Two-Factor Authentication
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Delete Account
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Save Button */}
                <Grid item xs={12}>
                    <Alert severity="info">
                        Settings are automatically saved when you make changes.
                    </Alert>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Settings;
