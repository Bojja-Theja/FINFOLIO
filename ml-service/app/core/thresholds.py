# TODO: Define thresholds for risk levels and alerts
# Configurable thresholds for different risk categories

RISK_THRESHOLDS = {
    'low': {'expense_ratio': 0.5, 'debt_ratio': 0.2, 'savings_ratio': 0.2},
    'medium': {'expense_ratio': 0.7, 'debt_ratio': 0.4, 'savings_ratio': 0.1},
    'high': {'expense_ratio': 0.9, 'debt_ratio': 0.6, 'savings_ratio': 0.05}
}

SCORE_THRESHOLDS = {
    'excellent': 80,
    'good': 60,
    'fair': 40,
    'poor': 20
}

SURVIVAL_THRESHOLDS = {
    'critical': 1,  # Less than 1 month
    'low': 3,       # 1-3 months
    'adequate': 6,  # 3-6 months
    'good': 12      # 6+ months
}