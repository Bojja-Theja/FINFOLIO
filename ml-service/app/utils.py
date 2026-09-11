# Shared utilities for ML service

def validate_financial_data(income, expenses, savings, debt):
    """
    Validate financial input data.
    """
    if income < 0 or expenses < 0 or savings < 0 or debt < 0:
        raise ValueError("Financial values cannot be negative")
    if income == 0:
        raise ValueError("Income cannot be zero")
    return True

def categorize_score(score):
    """
    Categorize health score into categories.
    """
    if score >= 80:
        return "excellent"
    elif score >= 60:
        return "good"
    elif score >= 40:
        return "fair"
    else:
        return "poor"

def categorize_survival(months):
    """
    Categorize survival months.
    """
    if months < 1:
        return "critical"
    elif months < 3:
        return "low"
    elif months < 6:
        return "adequate"
    else:
        return "good"