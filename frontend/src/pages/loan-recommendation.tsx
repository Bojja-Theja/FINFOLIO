import React, { useEffect, useMemo, useState } from 'react';
import api from '@/utils/axiosClient';
import {
  buildRecommendationSummary,
  calculateEmi,
  formatInr,
  getCreditBand,
  getDecisionBadgeClass,
  getFoirBand,
  normalizeLoanRequest,
  validateLoanRequest,
  type LoanRecommendationRequest,
  type LoanRecommendationResponse,
  type ValidationErrors,
} from '@/utils/loanRecommendation';

const initialForm: LoanRecommendationRequest = {
  annualIncome: 1200000,
  monthlyExpenses: 35000,
  existingEmi: 5000,
  desiredLoanAmount: 700000,
  tenureMonths: 60,
  creditScore: 740,
  employmentYears: 4,
  loanType: 'personal_loan',
};

export default function LoanRecommendationPage() {
  const [form, setForm] = useState<LoanRecommendationRequest>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [result, setResult] = useState<LoanRecommendationResponse | null>(null);

  const PROFILE_PRESETS: Array<{ label: string; data: LoanRecommendationRequest }> = [
    {
      label: 'Salaried Starter',
      data: {
        annualIncome: 720000,
        monthlyExpenses: 28000,
        existingEmi: 2000,
        desiredLoanAmount: 300000,
        tenureMonths: 48,
        creditScore: 705,
        employmentYears: 2,
        loanType: 'personal_loan',
      },
    },
    {
      label: 'Home Buyer',
      data: {
        annualIncome: 1800000,
        monthlyExpenses: 52000,
        existingEmi: 6000,
        desiredLoanAmount: 4200000,
        tenureMonths: 240,
        creditScore: 770,
        employmentYears: 7,
        loanType: 'home_loan',
      },
    },
    {
      label: 'Business Expansion',
      data: {
        annualIncome: 2400000,
        monthlyExpenses: 85000,
        existingEmi: 15000,
        desiredLoanAmount: 2500000,
        tenureMonths: 84,
        creditScore: 730,
        employmentYears: 5,
        loanType: 'business_loan',
      },
    },
  ];

  const TENURE_PRESETS = [12, 24, 36, 60, 84, 120, 240];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cached = localStorage.getItem('loanRecommendation:lastProfile');
    if (!cached) return;

    try {
      const parsed = JSON.parse(cached) as LoanRecommendationRequest;
      setForm(parsed);
    } catch {
      // Ignore corrupted cache values.
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('loanRecommendation:lastProfile', JSON.stringify(form));
  }, [form]);

  const currentFoir = useMemo(() => {
    const monthlyIncome = form.annualIncome / 12;
    if (monthlyIncome <= 0) return 0;
    return Number((((form.monthlyExpenses + (form.existingEmi || 0)) / monthlyIncome) * 100).toFixed(1));
  }, [form]);

  const currentCreditBand = useMemo(() => getCreditBand(form.creditScore), [form.creditScore]);
  const currentFoirBand = useMemo(() => getFoirBand(currentFoir), [currentFoir]);

  const estimatedRate = useMemo(() => {
    if (form.creditScore >= 760) return 8.8;
    if (form.creditScore >= 720) return 10.2;
    if (form.creditScore >= 680) return 11.9;
    return 13.8;
  }, [form.creditScore]);

  const estimatedEmi = useMemo(() => {
    return Math.round(calculateEmi(form.desiredLoanAmount, estimatedRate, form.tenureMonths));
  }, [form.desiredLoanAmount, estimatedRate, form.tenureMonths]);

  const stressScenario = useMemo(() => {
    if (!result) return null;
    const stressedRate = result.recommendedInterestRate + 1;
    const stressedEmi = Math.round(calculateEmi(form.desiredLoanAmount, stressedRate, form.tenureMonths));
    const monthlyIncome = form.annualIncome / 12;
    const stressedFoir = monthlyIncome > 0
      ? (((form.monthlyExpenses * 1.1) + (form.existingEmi || 0) + stressedEmi) / monthlyIncome) * 100
      : 100;

    return {
      stressedRate: Number(stressedRate.toFixed(2)),
      stressedEmi,
      stressedFoir: Number(stressedFoir.toFixed(1)),
    };
  }, [form, result]);

  // Refinancing Break-Even Calculator State & Memo
  const [refinanceBalance, setRefinanceBalance] = useState(600000);
  const [currentRate, setCurrentRate] = useState(13.5);
  const [newRate, setNewRate] = useState(9.25);
  const [refinanceTenure, setRefinanceTenure] = useState(48);
  const [closingFeePercent, setClosingFeePercent] = useState(1.0);

  const refinanceCalc = useMemo(() => {
    const currentEmi = calculateEmi(refinanceBalance, currentRate, refinanceTenure);
    const newEmi = calculateEmi(refinanceBalance, newRate, refinanceTenure);
    const monthlySavings = currentEmi - newEmi;
    const upfrontFee = (refinanceBalance * closingFeePercent) / 100;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(upfrontFee / monthlySavings) : 0;
    const totalCurrentPayment = currentEmi * refinanceTenure;
    const totalNewPayment = newEmi * refinanceTenure + upfrontFee;
    const netSavings = Math.max(0, totalCurrentPayment - totalNewPayment);

    return {
      currentEmi: Math.round(currentEmi),
      newEmi: Math.round(newEmi),
      monthlySavings: Math.round(monthlySavings),
      upfrontFee: Math.round(upfrontFee),
      breakEvenMonths,
      netSavings: Math.round(netSavings),
      isViable: monthlySavings > 0 && breakEvenMonths <= refinanceTenure,
    };
  }, [refinanceBalance, currentRate, newRate, refinanceTenure, closingFeePercent]);

  const onNumberChange = (key: keyof LoanRecommendationRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const rawValue = event.target.value;
    setForm((prev) => ({ ...prev, [key]: Number(rawValue) }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, loanType: event.target.value as LoanRecommendationRequest['loanType'] }));
  };

  const submitRecommendation = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationResult = validateLoanRequest(form);
    setFormErrors(validationResult);
    if (Object.keys(validationResult).length > 0) {
      setError('Please fix form validation errors before generating recommendation.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = normalizeLoanRequest(form);
      const response = await api.post<LoanRecommendationResponse>('/finance/loan-recommendation', payload);
      setResult(response.data);
    } catch (requestError: any) {
      setResult(null);
      setError(requestError?.response?.data?.error || 'Unable to generate recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: LoanRecommendationRequest) => {
    setForm(preset);
    setError('');
    setFormErrors({});
  };

  const resetProfile = () => {
    setForm(initialForm);
    setResult(null);
    setError('');
    setFormErrors({});
  };

  const exportResultAsJson = () => {
    if (!result || typeof window === 'undefined') return;
    const fileName = `loan-recommendation-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify({ profile: form, result }, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    if (!result || typeof navigator === 'undefined' || !navigator.clipboard) {
      setCopyState('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(buildRecommendationSummary(result));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="p-4 p-md-5 rounded-4 text-white mb-4" style={{ background: 'linear-gradient(120deg, #0a4f8f 0%, #0d9488 100%)' }}>
        <h1 className="display-6 fw-bold mb-2">Loan Recommendation Engine</h1>
        <p className="mb-0 fs-5">
          Real-world underwriting check using affordability, credit behavior, and historical default trends.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <h2 className="h4 fw-bold mb-3">Applicant Profile</h2>

              <div className="mb-3">
                <div className="small text-muted mb-2">Quick Profiles</div>
                <div className="d-flex flex-wrap gap-2">
                  {PROFILE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => applyPreset(preset.data)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={submitRecommendation}>
                <div className="mb-3">
                  <label htmlFor="loanType" className="form-label">Loan Type</label>
                  <select id="loanType" className="form-select" value={form.loanType} onChange={onTypeChange}>
                    <option value="personal_loan">Personal Loan</option>
                    <option value="home_loan">Home Loan</option>
                    <option value="car_loan">Car Loan</option>
                    <option value="education_loan">Education Loan</option>
                    <option value="business_loan">Business Loan</option>
                  </select>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="annualIncome" className="form-label">Annual Income (INR)</label>
                    <input id="annualIncome" type="number" className="form-control" value={form.annualIncome} onChange={onNumberChange('annualIncome')} min={0} />
                    {formErrors.annualIncome && <div className="text-danger small mt-1">{formErrors.annualIncome}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="monthlyExpenses" className="form-label">Monthly Expenses (INR)</label>
                    <input id="monthlyExpenses" type="number" className="form-control" value={form.monthlyExpenses} onChange={onNumberChange('monthlyExpenses')} min={0} />
                    {formErrors.monthlyExpenses && <div className="text-danger small mt-1">{formErrors.monthlyExpenses}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="existingEmi" className="form-label">Existing EMI Obligations (INR)</label>
                    <input id="existingEmi" type="number" className="form-control" value={form.existingEmi} onChange={onNumberChange('existingEmi')} min={0} />
                    {formErrors.existingEmi && <div className="text-danger small mt-1">{formErrors.existingEmi}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="desiredLoanAmount" className="form-label">Desired Loan Amount (INR)</label>
                    <input id="desiredLoanAmount" type="number" className="form-control" value={form.desiredLoanAmount} onChange={onNumberChange('desiredLoanAmount')} min={10000} />
                    {formErrors.desiredLoanAmount && <div className="text-danger small mt-1">{formErrors.desiredLoanAmount}</div>}
                  </div>
                  <div className="col-6">
                    <label htmlFor="tenureMonths" className="form-label">Tenure (Months)</label>
                    <input id="tenureMonths" type="number" className="form-control" value={form.tenureMonths} onChange={onNumberChange('tenureMonths')} min={6} max={360} />
                    {formErrors.tenureMonths && <div className="text-danger small mt-1">{formErrors.tenureMonths}</div>}
                  </div>
                  <div className="col-6">
                    <label htmlFor="creditScore" className="form-label">Credit Score</label>
                    <input id="creditScore" type="number" className="form-control" value={form.creditScore} onChange={onNumberChange('creditScore')} min={300} max={900} />
                    {formErrors.creditScore && <div className="text-danger small mt-1">{formErrors.creditScore}</div>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="employmentYears" className="form-label">Employment Stability (Years)</label>
                    <input id="employmentYears" type="number" className="form-control" value={form.employmentYears} onChange={onNumberChange('employmentYears')} min={0} max={40} />
                    {formErrors.employmentYears && <div className="text-danger small mt-1">{formErrors.employmentYears}</div>}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="small text-muted mb-2">Tenure Presets</div>
                  <div className="d-flex flex-wrap gap-2">
                    {TENURE_PRESETS.map((months) => (
                      <button
                        key={months}
                        type="button"
                        className={`btn btn-sm ${form.tenureMonths === months ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setForm((prev) => ({ ...prev, tenureMonths: months }))}
                      >
                        {months}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="alert alert-info mt-3 mb-3" role="status">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Current FOIR before new loan: <strong>{currentFoir}%</strong></span>
                    <span className={`badge ${currentFoirBand.className}`}>{currentFoirBand.label}</span>
                  </div>
                  <div className="progress mt-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={currentFoir}>
                    <div className={`progress-bar ${currentFoir > 45 ? 'bg-danger' : currentFoir > 35 ? 'bg-warning' : 'bg-success'}`} style={{ width: `${Math.min(currentFoir, 100)}%` }} />
                  </div>
                </div>

                <div className="alert alert-light border mb-3" role="status">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Live EMI Estimate</span>
                    <span className={`badge ${currentCreditBand.className}`}>Credit: {currentCreditBand.label}</span>
                  </div>
                  <div className="fw-bold mt-1">{formatInr(estimatedEmi)} / month</div>
                  <div className="small text-muted">Estimated using {estimatedRate}% annual rate for quick preview.</div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary w-100 fw-semibold" disabled={loading}>
                    {loading ? 'Generating Recommendation...' : 'Get Recommendation'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetProfile}>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-7">
          {!result && !error && (
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 d-flex align-items-center justify-content-center text-center">
                <div>
                  <h3 className="h5 fw-bold">Ready for a lending decision</h3>
                  <p className="text-muted mb-0">
                    Submit profile details to generate approval probability, expected EMI, and actionable risk improvements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger rounded-4" role="alert">
              {error}
            </div>
          )}

          {result && (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <h2 className="h4 fw-bold mb-0">Recommendation Result</h2>
                  <div className="d-flex gap-2 align-items-center">
                    <span className={`badge ${getDecisionBadgeClass(result.decision)} text-uppercase px-3 py-2`}>
                      {result.decision}
                    </span>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copySummary}>Copy</button>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={exportResultAsJson}>Export</button>
                  </div>
                </div>

                {copyState !== 'idle' && (
                  <div className={`alert ${copyState === 'copied' ? 'alert-success' : 'alert-warning'} py-2`} role="status">
                    {copyState === 'copied' ? 'Summary copied to clipboard.' : 'Copy not available in this browser context.'}
                  </div>
                )}

                <div className="row g-3 mb-3">
                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="text-muted small">Approval Odds</div>
                      <div className="fw-bold fs-5">{result.approvalProbability}%</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="text-muted small">Rate</div>
                      <div className="fw-bold fs-5">{result.recommendedInterestRate}%</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="text-muted small">Expected EMI</div>
                      <div className="fw-bold fs-5">{formatInr(result.expectedEmi)}</div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="border rounded-3 p-3 h-100">
                      <div className="text-muted small">Max Eligible</div>
                      <div className="fw-bold fs-5">{formatInr(result.maxEligibleLoanAmount)}</div>
                    </div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                      <h3 className="h6 fw-bold">Affordability Snapshot</h3>
                      <ul className="mb-0 small">
                        <li>FOIR after loan: {result.affordability.foirAfterLoan}%</li>
                        <li>Target FOIR limit: {result.affordability.maxAllowedFoir}%</li>
                        <li>Max affordable EMI: {formatInr(result.affordability.maxAffordableEmi)}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                      <h3 className="h6 fw-bold">Historical Benchmarks</h3>
                      <ul className="mb-0 small">
                        <li>Default rate in similar cohort: {result.historicalSignals.historicalDefaultRate}%</li>
                        <li>Benchmark approval rate: {result.historicalSignals.benchmarkApprovalRate}%</li>
                        <li>Analyzed sample size: {result.historicalSignals.sampleSize.toLocaleString('en-IN')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {stressScenario && (
                  <div className="border rounded-3 p-3 mb-3 bg-warning-subtle">
                    <h3 className="h6 fw-bold mb-2">Stress Scenario (Expenses +10%, Rate +1%)</h3>
                    <div className="row g-2 small">
                      <div className="col-4">Repriced EMI: <strong>{formatInr(stressScenario.stressedEmi)}</strong></div>
                      <div className="col-4">Repriced Rate: <strong>{stressScenario.stressedRate}%</strong></div>
                      <div className="col-4">FOIR Under Stress: <strong>{stressScenario.stressedFoir}%</strong></div>
                    </div>
                  </div>
                )}

                <div className="border rounded-3 p-3 mb-3 bg-light">
                  <h3 className="h6 fw-bold">10 Smart Features Active</h3>
                  <div className="small text-muted">
                    Validation, profile presets, tenure shortcuts, FOIR meter, live EMI preview, credit banding, autosave,
                    stress testing, copy summary, and JSON export.
                  </div>
                </div>

                <h3 className="h6 fw-bold">Key Reasons</h3>
                <ul>
                  {result.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>

                <h3 className="h6 fw-bold">Action Plan</h3>
                <ul className="mb-0">
                  {result.recommendations.map((recommendation) => (
                    <li key={recommendation}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Production Underwriting & Refinancing Module */}
      <div className="row g-4 mt-2">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h3 className="h5 fw-bold mb-0">🔄 Loan Refinancing &amp; Debt Break-Even Calculator</h3>
                <span className={`badge ${refinanceCalc.isViable ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                  {refinanceCalc.isViable ? 'Refinancing Lucrative' : 'Evaluate Closely'}
                </span>
              </div>
              <p className="text-muted small mb-4">
                Calculate real interest savings and payback timeline when switching from high-cost debt (credit lines/old personal loans) to a lower-rate facility.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Outstanding Loan Balance (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={refinanceBalance}
                    onChange={(e) => setRefinanceBalance(Number(e.target.value))}
                    min={10000}
                    step={10000}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Remaining Tenure (Months)</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={refinanceTenure}
                    onChange={(e) => setRefinanceTenure(Number(e.target.value))}
                    min={6}
                    max={360}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Current Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={currentRate}
                    onChange={(e) => setCurrentRate(Number(e.target.value))}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">New Refinanced Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control form-control-sm"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    className="form-control form-control-sm"
                    value={closingFeePercent}
                    onChange={(e) => setClosingFeePercent(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Metrics Output Grid */}
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-3 bg-light text-center">
                    <div className="text-muted small">Current EMI</div>
                    <div className="fw-bold fs-6 text-danger">{formatInr(refinanceCalc.currentEmi)}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-3 bg-light text-center">
                    <div className="text-muted small">New EMI</div>
                    <div className="fw-bold fs-6 text-success">{formatInr(refinanceCalc.newEmi)}</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-3 bg-light text-center">
                    <div className="text-muted small">Monthly Relief</div>
                    <div className="fw-bold fs-6 text-primary">+{formatInr(refinanceCalc.monthlySavings)}/mo</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="border rounded-3 p-3 bg-light text-center">
                    <div className="text-muted small">Break-Even Point</div>
                    <div className="fw-bold fs-6 text-dark">{refinanceCalc.breakEvenMonths} Months</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-3 border bg-light-subtle d-flex align-items-center justify-content-between">
                <div>
                  <div className="small text-muted">Estimated Net Lifetime Interest Saved (after ₹{refinanceCalc.upfrontFee.toLocaleString('en-IN')} fee)</div>
                  <div className="fw-bold fs-5 text-success">
                    {formatInr(refinanceCalc.netSavings)}
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary px-3 py-2">
                  Rate Delta: {(currentRate - newRate).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <h3 className="h5 fw-bold mb-3">🏛️ Institutional Underwriting Standards</h3>
              <p className="text-muted small mb-3">
                How commercial banks (Tier-1, NBFCs, and Digital Lenders) evaluate debt capacity:
              </p>

              <div className="list-group list-group-flush mb-3">
                <div className="list-group-item px-0 py-2 border-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small">Tier-1 Banks (SBI, HDFC, ICICI)</span>
                    <span className="badge bg-success-subtle text-success border border-success">Max 45-50% FOIR</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    Strict collateral and CIBIL &gt; 750 required. Rejects unsecured debt if existing EMIs exceed 50% net income.
                  </p>
                </div>
                <div className="list-group-item px-0 py-2 border-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small">Top NBFCs (Bajaj, Tata Capital)</span>
                    <span className="badge bg-primary-subtle text-primary border border-primary">Max 55% FOIR</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    Accommodates self-employed and variable incentive structures; prices +1.5% to +2.5% higher APR.
                  </p>
                </div>
                <div className="list-group-item px-0 py-2 border-0">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold small">Fintech / Peer-to-Peer</span>
                    <span className="badge bg-warning-subtle text-warning border border-warning">Max 60% FOIR</span>
                  </div>
                  <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                    High APR (16-24%), short tenure. Recommended only for bridge emergency funding or immediate high-cost debt consolidation.
                  </p>
                </div>
              </div>

              <div className="alert alert-info py-2 px-3 mb-0 small" role="note">
                💡 <strong>Underwriter Tip:</strong> Paying off smaller high-interest personal loans 3 months prior to applying for a home loan significantly drops your FOIR and unlocks the prime lending rate.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
