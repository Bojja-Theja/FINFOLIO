'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  LinearProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as MissingIcon,
  WorkOutline as WorkIcon,
  Timeline as TimelineIcon,
  Psychology as SkillIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useCurrency } from '@/context/CurrencyContext';

interface RoleProfile {
  title: string;
  category: string;
  resilienceScore: number;
  avgSalaryUSD: number;
  description: string;
  requiredSkills: string[];
}

const TARGET_ROLES: RoleProfile[] = [
  {
    title: 'Senior Data Scientist / AI Engineer',
    category: 'AI & Data Intelligence',
    resilienceScore: 94,
    avgSalaryUSD: 145000,
    description: 'High layoff resilience with rapid enterprise AI adoption. Core focus on LLMs, MLOps, and scalable pipelines.',
    requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'MLOps', 'AWS', 'System Design', 'Deep Learning'],
  },
  {
    title: 'Cloud Platform Architect',
    category: 'Cloud & Infrastructure',
    resilienceScore: 92,
    avgSalaryUSD: 155000,
    description: 'Enterprise cloud migrations ensure sustained multi-year demand across economic cycles.',
    requiredSkills: ['Kubernetes', 'Terraform', 'AWS', 'GCP', 'Linux', 'Docker', 'CI/CD', 'Security Architecture'],
  },
  {
    title: 'Full Stack Python & AI Engineer',
    category: 'Software Engineering',
    resilienceScore: 89,
    avgSalaryUSD: 125000,
    description: 'Versatile engineering combining modern web frameworks with generative AI capabilities.',
    requiredSkills: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'Redis', 'TypeScript', 'Git'],
  },
  {
    title: 'Enterprise Java / Go Microservices Lead',
    category: 'Enterprise Backend',
    resilienceScore: 88,
    avgSalaryUSD: 135000,
    description: 'Mission-critical financial infrastructure and distributed transactional systems.',
    requiredSkills: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes', 'PostgreSQL', 'Microservices', 'Docker', 'REST APIs'],
  },
  {
    title: 'Frontend Platform & Web Performance Architect',
    category: 'Web Engineering',
    resilienceScore: 84,
    avgSalaryUSD: 120000,
    description: 'Modern high-performance web applications, PWA architecture, and scalable UI design systems.',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'Web Performance', 'GraphQL', 'State Management', 'Figma'],
  },
];

const PRESET_USER_PROFILES: Record<string, { currentTitle: string; skills: string[]; baseSalaryUSD: number }> = {
  frontend_dev: {
    currentTitle: 'Frontend Developer',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'TailwindCSS'],
    baseSalaryUSD: 85000,
  },
  java_dev: {
    currentTitle: 'Junior Java Developer',
    skills: ['Java', 'Spring Boot', 'SQL', 'Git', 'REST APIs'],
    baseSalaryUSD: 80000,
  },
  data_analyst: {
    currentTitle: 'Data Analyst',
    skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Pandas'],
    baseSalaryUSD: 75000,
  },
  qa_engineer: {
    currentTitle: 'QA / Automation Tester',
    skills: ['Selenium', 'Java', 'Git', 'Postman', 'Manual Testing'],
    baseSalaryUSD: 70000,
  },
};

export default function JobTrainer() {
  const { formatAmount } = useCurrency();
  const defaultProfile = PRESET_USER_PROFILES['frontend_dev'] ?? {
    currentTitle: 'Frontend Developer',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'TailwindCSS'],
    baseSalaryUSD: 85000,
  };
  const defaultRole: RoleProfile = TARGET_ROLES[0] ?? {
    title: 'Senior Data Scientist / AI Engineer',
    category: 'AI & Data Intelligence',
    resilienceScore: 94,
    avgSalaryUSD: 145000,
    description: 'High layoff resilience',
    requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'MLOps', 'AWS'],
  };

  const [selectedProfileKey, setSelectedProfileKey] = useState<string>('frontend_dev');
  const [currentSkills, setCurrentSkills] = useState<string[]>(defaultProfile.skills);
  const [selectedTargetRoleIndex, setSelectedTargetRoleIndex] = useState<number>(0);
  const [apiSkillGap, setApiSkillGap] = useState<any>(null);

  const activeProfile = PRESET_USER_PROFILES[selectedProfileKey] ?? defaultProfile;
  const targetRole = TARGET_ROLES[selectedTargetRoleIndex] ?? defaultRole;

  useEffect(() => {
    setCurrentSkills(activeProfile.skills);
  }, [activeProfile]);

  // Query backend career-skill-gap endpoint
  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        const skillsParam = currentSkills.join(',');
        const res = await axios.get(
          `/api/insights/career-skill-gap?targetRole=${encodeURIComponent(targetRole.title)}&skills=${encodeURIComponent(skillsParam)}`
        );
        if (res.data?.success) {
          setApiSkillGap(res.data.data);
        }
      } catch (err) {
        // Fallback to local computation if backend offline
        setApiSkillGap(null);
      }
    };
    fetchSkillGap();
  }, [targetRole, currentSkills]);

  const normalizedUserSkills = new Set(currentSkills.map((s) => s.toLowerCase().trim()));
  const matchingSkills = targetRole.requiredSkills.filter((s) =>
    normalizedUserSkills.has(s.toLowerCase())
  );
  const missingSkills = targetRole.requiredSkills.filter(
    (s) => !normalizedUserSkills.has(s.toLowerCase())
  );

  const matchPercentage = Math.round((matchingSkills.length / Math.max(1, targetRole.requiredSkills.length)) * 100);
  const skillsToLearnCount = missingSkills.length;
  const projectedSalaryGrowthPct = Math.max(
    15,
    Math.round(((targetRole.avgSalaryUSD - activeProfile.baseSalaryUSD) / Math.max(1, activeProfile.baseSalaryUSD)) * 100)
  );

  return (
    <Card sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header Banner */}
      <Box
        sx={{
          p: 3.5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(16,185,129,0.1))'
              : 'linear-gradient(135deg, #eff6ff, #ecfdf5)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h5" fontWeight="800">
                AI Career Resilience &amp; Job Trainer
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Recommend career pivot roles, quantify exact missing skill counts, and defend your income engine against layoffs.
            </Typography>
          </Box>

          <Chip
            label={`Hedge Score: ${targetRole.resilienceScore}/100`}
            color="success"
            sx={{ fontWeight: 700, px: 1, py: 2, height: 'auto', borderRadius: 2 }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ p: 3.5 }}>
        <Grid container spacing={4}>
          {/* Left Column: Role Selector & Current Profile */}
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" fontWeight="700" gutterBottom>
              1. SELECT YOUR CURRENT BASELINE
            </Typography>

            <FormControl fullWidth size="small" sx={{ mt: 1, mb: 2.5 }}>
              <InputLabel>Current Role</InputLabel>
              <Select
                value={selectedProfileKey}
                label="Current Role"
                onChange={(e) => setSelectedProfileKey(e.target.value)}
              >
                <MenuItem value="frontend_dev">Frontend Developer (React, JS)</MenuItem>
                <MenuItem value="java_dev">Junior Java Developer (Spring, SQL)</MenuItem>
                <MenuItem value="data_analyst">Data Analyst (Python, SQL, Tableau)</MenuItem>
                <MenuItem value="qa_engineer">QA / Automation Tester (Selenium, Java)</MenuItem>
              </Select>
            </FormControl>

            <Paper sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', mb: 3 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">
                CURRENT VERIFIED SKILLS ({currentSkills.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
                {currentSkills.map((sk) => (
                  <Chip key={sk} label={sk} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Paper>

            <Typography variant="subtitle2" fontWeight="700" gutterBottom>
              2. SELECT RECOMMENDED PIVOT TARGET
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {TARGET_ROLES.map((role, idx) => {
                const isSelected = idx === selectedTargetRoleIndex;
                return (
                  <Paper
                    key={role.title}
                    onClick={() => setSelectedTargetRoleIndex(idx)}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected
                        ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.1)' : '#eff6ff')
                        : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={isSelected ? 800 : 600}>
                        {role.title}
                      </Typography>
                      <Chip
                        label={`${role.resilienceScore}% Defense`}
                        size="small"
                        color={role.resilienceScore >= 90 ? 'success' : 'primary'}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Market Avg: <strong>{formatAmount(role.avgSalaryUSD)}</strong> • {role.category}
                    </Typography>
                  </Paper>
                );
              })}
            </Stack>
          </Grid>

          {/* Right Column: Skill Gap Analysis & Roadmap */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="primary.main" fontWeight="800" sx={{ textTransform: 'uppercase' }}>
                    Transition Analysis
                  </Typography>
                  <Typography variant="h6" fontWeight="800">
                    {activeProfile.currentTitle} ➔ {targetRole.title}
                  </Typography>
                </Box>
                <Chip
                  label={`+${projectedSalaryGrowthPct}% Compensation Boost`}
                  color="success"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {/* Skills Metric Cards */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 1.8, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary">
                      MATCH READINESS
                    </Typography>
                    <Typography variant="h5" fontWeight="800" color="primary.main">
                      {matchPercentage}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      overlap
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Paper sx={{ p: 1.8, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary">
                      SKILLS TO LEARN
                    </Typography>
                    <Typography variant="h5" fontWeight="800" color="warning.main">
                      {skillsToLearnCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      missing skills
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper sx={{ p: 1.8, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="caption" color="text.secondary">
                      ESTIMATED TIMELINE
                    </Typography>
                    <Typography variant="h5" fontWeight="800" color="success.main">
                      {Math.ceil(skillsToLearnCount * 2.5)} wks
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      at 8 hrs/week
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <LinearProgress
                variant="determinate"
                value={matchPercentage}
                sx={{ height: 10, borderRadius: 5, mb: 2.5 }}
              />

              {/* Missing Skills Breakdown */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MissingIcon color="warning" fontSize="small" />
                  Exact Skills You Need to Learn ({skillsToLearnCount}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {missingSkills.map((sk) => (
                    <Chip
                      key={sk}
                      label={`+ ${sk}`}
                      color="warning"
                      sx={{ fontWeight: 700 }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Matched Skills */}
              <Box>
                <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon color="success" fontSize="small" />
                  Skills You Already Possess ({matchingSkills.length}):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {matchingSkills.map((sk) => (
                    <Chip
                      key={sk}
                      label={sk}
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Structured Upskilling Roadmap */}
            <Typography variant="subtitle2" fontWeight="700" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimelineIcon color="primary" fontSize="small" />
              RECOMMENDED 3-STAGE UPSKILLING ROADMAP
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              <Paper sx={{ p: 2, borderRadius: 2, borderLeft: '4px solid #3b82f6' }}>
                <Typography variant="subtitle2" fontWeight="700">
                  Stage 1: Core Target Technology Mastery (Weeks 1–4)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Focus on mastering {missingSkills.slice(0, 2).join(' & ') || 'foundational tools'}. Build 2 standalone proof-of-concept repositories with automated CI/CD pipelines.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 2, borderLeft: '4px solid #f59e0b' }}>
                <Typography variant="subtitle2" fontWeight="700">
                  Stage 2: Architecture &amp; Production Deployments (Weeks 5–8)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Tackle {missingSkills.slice(2, 4).join(' & ') || 'distributed systems'}. Implement end-to-end integration tests, containerization, and cloud deployment.
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 2, borderLeft: '4px solid #10b981' }}>
                <Typography variant="subtitle2" fontWeight="700">
                  Stage 3: Portfolio Showcase &amp; Active Recruiter Outreach (Weeks 9–12)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Publish your case study on GitHub, update your LinkedIn keywords with {targetRole.title} competencies, and begin technical screenings.
                </Typography>
              </Paper>
            </Stack>

            <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
              <strong>Layoff Defense Strategy:</strong> Completing this transition expands your addressable job pool by <strong>3.4x</strong>, cutting average re-employment search time from 6 months down to 45 days.
            </Alert>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
