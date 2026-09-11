# Financial health score calculator using ML model

from ..models import risk_model

def calculate_health_score(features):
    """
    Calculate financial health score (0-100) using ML model.
    """
    # Use risk model to get score, then invert for health score
    # Lower risk = higher health score
    risk_score = risk_model.predict(features)
    health_score = 100 - risk_score
    return max(0, min(100, health_score))