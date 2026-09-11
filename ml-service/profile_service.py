#!/usr/bin/env python3
"""
Profile the ML service to identify performance bottlenecks.
"""

import cProfile
import pstats
import io
from app.main import app
from fastapi.testclient import TestClient

def profile_endpoints():
    """Profile key endpoints for performance analysis."""
    client = TestClient(app)

    # Profile risk score endpoint
    print("Profiling risk-score endpoint...")
    pr = cProfile.Profile()
    pr.enable()

    for _ in range(100):  # Run multiple times for better stats
        response = client.post("/risk-score", json={
            "income": 50000,
            "expenses": 30000,
            "savings": 10000,
            "debt": 5000
        })
        assert response.status_code == 200

    pr.disable()
    s = io.StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
    ps.print_stats(20)  # Top 20 functions
    print("Risk Score Profile:")
    print(s.getvalue())

    # Profile predictive analytics
    print("\nProfiling predictive-analytics endpoint...")
    pr = cProfile.Profile()
    pr.enable()

    for _ in range(100):
        response = client.post("/predictive-analytics", json={
            "user_data": {
                "emergency_months": 4,
                "debt_ratio": 0.3,
                "savings_rate": 15,
                "industry": "IT",
                "experience_years": 5,
                "current_savings": 10000,
                "monthly_savings": 1000,
                "expected_return": 7
            },
            "prediction_type": "layoff_risk",
            "time_horizon": "90day"
        })
        assert response.status_code == 200

    pr.disable()
    s = io.StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats('cumulative')
    ps.print_stats(20)
    print("Predictive Analytics Profile:")
    print(s.getvalue())

if __name__ == "__main__":
    profile_endpoints()