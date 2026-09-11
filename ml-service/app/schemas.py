from pydantic import BaseModel

class RiskScoreRequest(BaseModel):
    income: float
    expenses: float
    savings: float
    debt: float

class RiskScoreResponse(BaseModel):
    risk_score: float
    level: str
    insights: list[str] = []

class HealthScoreRequest(BaseModel):
    income: float
    expenses: float
    savings: float
    debt: float

class HealthScoreResponse(BaseModel):
    score: float
    category: str

class SurvivalRequest(BaseModel):
    emergency_fund: float
    monthly_expenses: float
    income_stability: float

class SurvivalResponse(BaseModel):
    months: float
    category: str