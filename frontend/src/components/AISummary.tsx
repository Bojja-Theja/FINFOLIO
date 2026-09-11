import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Collapse, IconButton } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import api from '@/utils/axiosClient';

const AISummary: React.FC = () => {
  const [summary, setSummary] = useState<string>('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/finance/ai-summary');
        setSummary(response.data.summary);
      } catch (error) {
        setSummary('Unable to generate AI summary at this time.');
      }
    };
    fetchSummary();
  }, []);

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">AI Financial Insights</Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </div>
        <Collapse in={expanded}>
          <Typography variant="body1" style={{ marginTop: '16px' }}>
            {summary}
          </Typography>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AISummary;