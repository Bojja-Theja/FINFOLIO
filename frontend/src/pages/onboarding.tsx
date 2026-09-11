/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';

// Type workaround for MUI v7 Grid API issues
const GridTyped = Grid as any;

import {
  AccountBalance,
  Savings,
  CheckCircle,
  Person
} from '@mui/icons-material';
import { useRouter } from 'next/router';

// 🔥 Use your axiosClient with token auto-inject
import api from "@/utils/axiosClient";

const steps = ['Personal Info', 'Income & Expenses', 'Savings & Debt', 'Review'];

export default function Onboarding() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: 'metro',
    industry: '',
    experience: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    currentSavings: '',
    emergencyFund: '',
    totalDebt: '',
    savingsGoal: '',
    targetDate: ''
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // 🔥 CLEAN + FIXED SUBMIT HANDLER with VALIDATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.name || !formData.email) {
      setError("Please fill in all required fields (Name, Email).");
      setLoading(false);
      return;
    }

    if (!formData.monthlyIncome || !formData.monthlyExpenses) {
      setError("Please fill in Income and Expenses to continue.");
      setLoading(false);
      return;
    }

    const monthlyIncome = parseFloat(formData.monthlyIncome);
    const monthlyExpenses = parseFloat(formData.monthlyExpenses);

    if (monthlyIncome <= 0 || monthlyExpenses < 0) {
      setError("Income must be positive and expenses cannot be negative.");
      setLoading(false);
      return;
    }

    if (monthlyExpenses > monthlyIncome) {
      setError("Monthly expenses cannot exceed monthly income.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to continue.");
      setLoading(false);
      router.push("/auth/login");
      return;
    }

    try {
      // 1️⃣ Save profile
      await api.put("/user/profile", {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        industry: formData.industry,
        experience_years: parseInt(formData.experience) || 0,
        age: parseInt(formData.experience) > 0 ? (20 + (parseInt(formData.experience) || 0)) : 30, // Rough estimate if not provided
        monthly_income: parseFloat(formData.monthlyIncome) || 0,
        monthly_expenses: parseFloat(formData.monthlyExpenses) || 0,
        emergency_fund: parseFloat(formData.emergencyFund) || 0,
        total_debt: parseFloat(formData.totalDebt) || 0,
        savings_rate:
          ((parseFloat(formData.monthlyIncome) || 0) -
            (parseFloat(formData.monthlyExpenses) || 0)) /
          (parseFloat(formData.monthlyIncome) || 1),
        risk_tolerance: 'medium', // Default to medium
        job_stability_score: 7 // Default to 7
      });

      // 2️⃣ Create savings plan (optional)
      if (formData.savingsGoal) {
        await api.post("/savings/plan", {
          name: "Emergency Fund",
          target_amount: parseFloat(formData.savingsGoal),
          monthly_contribution: Math.max(
            5000,
            (parseFloat(formData.monthlyIncome) || 0) * 0.2
          ),
          target_date: formData.targetDate || "2025-12-31"
        });
      }

      // 3️⃣ Redirect to dashboard
      router.push("/dashboard");

    } catch (err) {
      console.error("Failed to save profile:", err);
      setError("Failed to save your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------- STEP CONTENT -------------------------
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <GridTyped container spacing={3}>
            <GridTyped item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} />
                Personal Information
              </Typography>
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Industry" name="industry" value={formData.industry} onChange={handleChange} />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Years of Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} />
            </GridTyped>
          </GridTyped>
        );

      case 1:
        return (
          <GridTyped container spacing={3}>
            <GridTyped item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1 }} />
                Income & Expenses
              </Typography>
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Monthly Income (₹)" name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} required />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Monthly Expenses (₹)" name="monthlyExpenses" type="number" value={formData.monthlyExpenses} onChange={handleChange} required />
            </GridTyped>
          </GridTyped>
        );

      case 2:
        return (
          <GridTyped container spacing={3}>
            <GridTyped item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Savings sx={{ mr: 1 }} />
                Savings & Debt
              </Typography>
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Current Savings (₹)" name="currentSavings" type="number" value={formData.currentSavings} onChange={handleChange} />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Emergency Fund (₹)" name="emergencyFund" type="number" value={formData.emergencyFund} onChange={handleChange} />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Total Debt (₹)" name="totalDebt" type="number" value={formData.totalDebt} onChange={handleChange} />
            </GridTyped>

            <GridTyped item xs={12} sm={6}>
              <TextField fullWidth label="Savings Goal (₹)" name="savingsGoal" type="number" value={formData.savingsGoal} onChange={handleChange} />
            </GridTyped>
          </GridTyped>
        );

      case 3:
        return (
          <GridTyped container spacing={3}>
            <GridTyped item xs={12}>
              <Typography variant="h6">Review Your Information</Typography>
            </GridTyped>

            <GridTyped item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Personal Info</Typography>
                  <Typography><strong>Name:</strong> {formData.name}</Typography>
                  <Typography><strong>Email:</strong> {formData.email}</Typography>
                  <Typography><strong>Industry:</strong> {formData.industry}</Typography>
                </CardContent>
              </Card>
            </GridTyped>

            <GridTyped item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Financial Overview</Typography>
                  <Typography><strong>Income:</strong> ₹{formData.monthlyIncome}</Typography>
                  <Typography><strong>Expenses:</strong> ₹{formData.monthlyExpenses}</Typography>
                  <Typography><strong>Savings:</strong> ₹{formData.currentSavings}</Typography>
                  <Typography><strong>Emergency Fund:</strong> ₹{formData.emergencyFund}</Typography>
                </CardContent>
              </Card>
            </GridTyped>
          </GridTyped>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center">Welcome to CapStack</Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Let's set up your financial profile to get personalized insights
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error">{error}</Alert>}

        <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Button
              type={activeStep === steps.length - 1 ? "submit" : "button"}
              variant="contained"
              onClick={activeStep === steps.length - 1 ? undefined : handleNext}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            >
              {activeStep === steps.length - 1 ? (loading ? "Setting up..." : "Complete Setup") : "Next"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
