# Risk scoring using ML model

from ..models import risk_model

def calculate_risk_level(features):
    """
    Calculate financial risk level based on features using ML model.
    Returns risk level and insights.
    """
    risk_score = risk_model.predict(features)

    if risk_score > 70:
        risk_level = 'high'
        insights = ['High risk score indicates potential financial stress', 'Consider reducing debt and expenses']
    elif risk_score > 30:
        risk_level = 'medium'
        insights = ['Moderate risk, monitor expenses closely']
    else:
        risk_level = 'low'
        insights = ['Good financial health']

    return {
        'risk_level': risk_level,
        'insights': insights
    }