import React, { useState } from 'react';
import { Card, CardContent, Typography, Slider, Button, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/utils/axiosClient';

const WhatIfSimulator: React.FC = () => {
  const [scenarios, setScenarios] = useState({
    jobLoss: 0.05,
    raise: 0.05,
    expenseChange: 0
  });
  const [projection, setProjection] = useState<any[]>([]);

  const runSimulation = async () => {
    try {
      const response = await api.post('/finance/what-if', scenarios);
      setProjection(response.data.projection);
    } catch (error) {
      console.error('Simulation failed', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>What-If Scenario Simulator</Typography>

        <Box sx={{ mb: 3 }}>
          <Typography>Job Loss Probability: {(scenarios.jobLoss * 100).toFixed(1)}%</Typography>
          <Slider
            value={scenarios.jobLoss}
            onChange={(_, value) => setScenarios(prev => ({ ...prev, jobLoss: value as number }))}
            min={0}
            max={0.5}
            step={0.01}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography>Annual Raise: {(scenarios.raise * 100).toFixed(1)}%</Typography>
          <Slider
            value={scenarios.raise}
            onChange={(_, value) => setScenarios(prev => ({ ...prev, raise: value as number }))}
            min={0}
            max={0.2}
            step={0.01}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography>Expense Change: {(scenarios.expenseChange * 100).toFixed(1)}%</Typography>
          <Slider
            value={scenarios.expenseChange}
            onChange={(_, value) => setScenarios(prev => ({ ...prev, expenseChange: value as number }))}
            min={-0.5}
            max={0.5}
            step={0.01}
          />
        </Box>

        <Button variant="contained" onClick={runSimulation} sx={{ mb: 3 }}>
          Run 10-Year Projection
        </Button>

        {projection.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value: any) => value != null ? `₹${Number(value).toLocaleString()}` : ''} />
              <Legend />
              <Line type="monotone" dataKey="netWorth" stroke="#8884d8" />
              <Line type="monotone" dataKey="upperBound" stroke="#82ca9d" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="lowerBound" stroke="#ffc658" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatIfSimulator;