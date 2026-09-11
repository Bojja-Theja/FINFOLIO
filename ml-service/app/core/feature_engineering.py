# TODO: Implement feature engineering for ML models
# Extract and transform features from raw financial data

def extract_features(income, expenses, savings, debt):
    """
    Extract features for risk scoring and predictions.
    """
    expense_ratio = expenses / income if income > 0 else 1
    savings_ratio = savings / income if income > 0 else 0
    debt_ratio = debt / income if income > 0 else 1

    return {
        'expense_ratio': expense_ratio,
        'savings_ratio': savings_ratio,
        'debt_ratio': debt_ratio,
        'net_income': income - expenses
    }