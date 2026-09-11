"""
CAPSTACK ML Service - Advanced Financial AI Engine
Production-ready ML service with model management and evaluation
"""

import logging
import os
import math
import random
import time
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field, field_validator, ConfigDict
from pydantic import FieldValidationInfo

from .models import load_all_models, risk_model, layoff_model, savings_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FINFOLIO ML Service",
    version="2.0.0",
    description="Advanced AI/ML Engine for Financial Insights",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Model and data directories
MODEL_DIR = "app/models"
os.makedirs(MODEL_DIR, exist_ok=True)
FAVICON_BYTES = b""


@app.on_event("startup")
async def startup_event():
    """Load ML models on startup if they exist."""
    logger.info("Loading ML models on startup...")
    try:
        load_all_models()
        logger.info("ML models loaded successfully")
    except Exception as e:
        logger.warning("Failed to load ML models: %s", str(e))


# ============================================================================
# ENUMS & VALIDATION
# ============================================================================

class RiskLevel(str, Enum):
    """Risk level classification."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskTolerance(str, Enum):
    """User risk tolerance level."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class MarketCondition(str, Enum):
    """Market condition classification."""

    BULL = "bull"
    BEAR = "bear"
    NEUTRAL = "neutral"


class PredictionType(str, Enum):
    """Type of predictive analysis."""

    SURVIVAL_PROBABILITY = "survival_probability"
    LAYOFF_RISK = "layoff_risk"
    SAVINGS_TRAJECTORY = "savings_trajectory"


class TimeHorizon(str, Enum):
    """Time horizon for predictions."""

    SHORT_TERM = "30day"
    MID_TERM = "60day"
    LONG_TERM = "90day"


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class RiskScoreRequest(BaseModel):
    """Request model for risk score calculation."""

    income: float = Field(..., gt=0, description="Monthly income")
    expenses: float = Field(..., ge=0, description="Monthly expenses")
    savings: float = Field(..., ge=0, description="Current savings amount")
    debt: float = Field(..., ge=0, description="Current debt amount")

    @field_validator("income", "expenses", "savings", "debt")
    @classmethod
    def validate_financial_values(cls, v: float) -> float:
        if not math.isfinite(v):
            raise ValueError("Financial values must be finite numbers")
        if v < 0 or v > 1e10:
            raise ValueError("Financial values must be non-negative and reasonable")
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "income": 50000,
                "expenses": 30000,
                "savings": 10000,
                "debt": 5000
            }
        }
    )


class RiskScoreResponse(BaseModel):
    """Response model for risk score."""

    risk_score: float
    level: RiskLevel
    factors: Dict[str, float]
    timestamp: str


class AllocationOptimizationRequest(BaseModel):
    """Request model for asset allocation optimization."""

    income: float = Field(..., gt=0, description="Monthly income")
    expenses: float = Field(..., ge=0, description="Monthly expenses")
    emergency_fund: float = Field(
        ...,
        ge=0,
        description="Emergency fund amount"
    )
    debt: float = Field(..., ge=0, description="Total debt")
    age: int = Field(..., ge=18, le=100, description="User age")
    risk_tolerance: RiskTolerance
    job_stability: float = Field(
        ...,
        ge=1,
        le=10,
        description="Job stability score"
    )
    market_conditions: MarketCondition
    inflation_rate: float = Field(
        default=3.5,
        ge=0,
        le=20,
        description="Expected inflation rate"
    )

    @field_validator(
        "income",
        "expenses",
        "emergency_fund",
        "debt",
        "job_stability",
        "inflation_rate"
    )
    @classmethod
    def validate_numeric_fields(cls, v: float, info: FieldValidationInfo) -> float:
        if not math.isfinite(v):
            raise ValueError(f"{info.field_name} must be a finite number")
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "income": 50000,
                "expenses": 30000,
                "emergency_fund": 60000,
                "debt": 10000,
                "age": 35,
                "risk_tolerance": "medium",
                "job_stability": 8,
                "market_conditions": "neutral",
                "inflation_rate": 3.5
            }
        }
    )


class AllocationResponse(BaseModel):
    """Response model for asset allocation."""

    sip_percentage: float
    stocks_percentage: float
    bonds_percentage: float
    lifestyle_percentage: float
    emergency_fund_percentage: float
    reasoning: List[str]
    confidence: float
    market_context: str
    risk_adjustment: str


class PredictiveAnalyticsRequest(BaseModel):
    """Request model for predictive analytics."""

    user_data: Dict[str, Any] = Field(
        ...,
        description="User financial data"
    )
    prediction_type: PredictionType
    time_horizon: TimeHorizon

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_data": {
                    "emergency_months": 4,
                    "debt_ratio": 0.3,
                    "savings_rate": 15,
                    "industry": "IT",
                    "experience_years": 5
                },
                "prediction_type": "survival_probability",
                "time_horizon": "90day"
            }
        }
    )


class PredictionResponse(BaseModel):
    """Response model for predictions."""

    prediction_type: str
    time_horizon: str
    predicted_value: float
    confidence_score: float
    factors: List[str]
    recommendations: List[str]
    timestamp: str


class WhatIfScenario(str, Enum):
    """What-if scenario types."""

    JOB_LOSS = "job_loss"
    RAISE = "raise"
    EXPENSE_INCREASE = "expense_increase"
    INVESTMENT_RETURN = "investment_return"


class WhatIfSimulationRequest(BaseModel):
    """Request model for What-If Monte Carlo simulation."""

    current_income: float = Field(..., gt=0, description="Current monthly income")
    current_expenses: float = Field(..., ge=0, description="Current monthly expenses")
    current_savings: float = Field(..., ge=0, description="Current savings amount")
    current_debt: float = Field(..., ge=0, description="Current debt amount")
    age: int = Field(..., ge=18, le=100, description="Current age")
    risk_tolerance: RiskTolerance = Field(..., description="Risk tolerance level")
    scenarios: Dict[str, Any] = Field(
        default_factory=dict,
        description="What-if scenarios with parameters"
    )
    simulation_years: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Number of years to simulate"
    )
    num_simulations: int = Field(
        default=1000,
        ge=100,
        le=10000,
        description="Number of Monte Carlo simulations"
    )

    @field_validator("current_income", "current_expenses", "current_savings", "current_debt")
    @classmethod
    def validate_financial_values(cls, v: float) -> float:
        if not math.isfinite(v):
            raise ValueError("Financial values must be finite numbers")
        if v < 0 or v > 1e10:
            raise ValueError("Financial values must be non-negative and reasonable")
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "current_income": 50000,
                "current_expenses": 30000,
                "current_savings": 100000,
                "current_debt": 50000,
                "age": 35,
                "risk_tolerance": "medium",
                "scenarios": {
                    "job_loss": {"probability": 0.1, "duration_months": 6},
                    "raise": {"percentage": 0.1, "probability": 0.3},
                    "expense_increase": {"percentage": 0.05, "probability": 0.2}
                },
                "simulation_years": 10,
                "num_simulations": 1000
            }
        }
    )


class WhatIfSimulationResponse(BaseModel):
    """Response model for What-If simulation results."""

    net_worth_projection: List[Dict[str, float]]  # List of {year: net_worth} for percentiles
    survival_probability: float
    average_net_worth: float
    median_net_worth: float
    worst_case_net_worth: float
    best_case_net_worth: float
    recommendations: List[str]
    timestamp: str


class HealthCheckResponse(BaseModel):
    """Response model for health check."""

    status: str
    version: str
    timestamp: str
    models_loaded: int


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_timestamp() -> str:
    """Get current timestamp in ISO format."""
    return datetime.utcnow().isoformat() + "Z"


def normalize_allocation(allocation: Dict[str, float]) -> Dict[str, float]:
    """Normalize allocation percentages to sum to 100."""
    total = sum(allocation.values())
    if abs(total) < 0.01:
        return allocation
    return {k: (v / total) * 100 for k, v in allocation.items()}


def calculate_emergency_fund_months(
    emergency_fund: float,
    monthly_expenses: float
) -> float:
    """Calculate how many months emergency fund covers."""
    if monthly_expenses <= 0:
        return 0
    return emergency_fund / monthly_expenses


def ensure_finite_number(
    value: Any,
    name: str,
    min_value: float | None = None,
    max_value: float | None = None
) -> float:
    """Validate numeric input is finite and within optional bounds."""
    if not isinstance(value, (int, float)) or not math.isfinite(value):
        raise HTTPException(
            status_code=400,
            detail=f"{name} must be a finite number"
        )
    if min_value is not None and value < min_value:
        raise HTTPException(
            status_code=400,
            detail=f"{name} must be >= {min_value}"
        )
    if max_value is not None and value > max_value:
        raise HTTPException(
            status_code=400,
            detail=f"{name} must be <= {max_value}"
        )
    return float(value)


# ============================================================================
# HEALTH CHECK & INFO ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    logger.info("Health check requested")
    return HealthCheckResponse(
        status="healthy",
        version="2.0.0",
        timestamp=get_timestamp(),
        models_loaded=3
    )


@app.get("/")
def read_root():
    """Root endpoint - API information."""
    return {
        "service": "CAPSTACK ML Service",
        "version": "2.0.0",
        "status": "operational",
        "endpoints": {
            "health": "/health",
            "risk_score": "/risk-score",
            "allocation_optimize": "/allocation-optimize",
            "predictive_analytics": "/predictive-analytics",
            "docs": "/docs"
        }
    }


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Serve an empty favicon to avoid 404 errors."""
    return Response(content=FAVICON_BYTES, media_type="image/x-icon")


# ============================================================================
# FINANCIAL RISK SCORING
# ============================================================================

@app.post(
    "/risk-score",
    response_model=RiskScoreResponse,
    tags=["Risk Analysis"]
)
def calculate_risk_score(request: RiskScoreRequest):
    """
    Calculate financial risk score using multi-factor analysis.

    Risk Score = (Expense Ratio * 0.5) + (1 - Savings Ratio) * 0.3 +
                  (Debt Ratio * 0.2)

    Score Range: 0-100 (0 = low risk, 100 = high risk)
    """
    start_time = time.time()
    try:
        logger.info("Calculating risk score for income: %s", request.income)

        # Use ML model if available, otherwise fallback to rule-based
        data = {
            "income": request.income,
            "expenses": request.expenses,
            "savings": request.savings,
            "debt": request.debt
        }
        risk_score = risk_model.predict(data)

        # Calculate ratios for factors
        expense_ratio = (
            request.expenses / request.income
            if request.income > 0
            else 1.0
        )
        savings_ratio = (
            request.savings / request.income
            if request.income > 0
            else 0.0
        )
        debt_ratio = (
            request.debt / request.income
            if request.income > 0
            else 1.0
        )

        # Determine risk level
        if risk_score < 30:
            level = RiskLevel.LOW
        elif risk_score < 70:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.HIGH

        duration = time.time() - start_time
        logger.info("Risk score calculated: %s, level: %s, duration: %.3fs", risk_score, level, duration)

        return RiskScoreResponse(
            risk_score=round(risk_score, 2),
            level=level,
            factors={
                "expense_ratio": round(expense_ratio * 100, 2),
                "savings_ratio": round(savings_ratio * 100, 2),
                "debt_ratio": round(debt_ratio * 100, 2)
            },
            timestamp=get_timestamp()
        )

    except Exception as e:  # pylint: disable=broad-except
        logger.error("Risk calculation failed: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Risk calculation failed: {str(e)}"
        ) from e


# ============================================================================
# ASSET ALLOCATION OPTIMIZATION
# ============================================================================

@app.post(
    "/allocation-optimize",
    response_model=AllocationResponse,
    tags=["Asset Allocation"]
)
def optimize_asset_allocation(
    request: AllocationOptimizationRequest
):
    """
    Optimize asset allocation using multi-factor AI analysis.

    Factors considered:
    - Age-based life cycle investing
    - Risk tolerance and profile
    - Job stability and income risk
    - Market conditions
    - Emergency fund adequacy
    - Debt burden

    Returns recommended allocation percentages with confidence score.
    """
    try:
        logger.info("Optimizing allocation for user age: %s", request.age)

        # Initialize base allocation
        allocation = {
            "sip_percentage": 30.0,
            "stocks_percentage": 15.0,
            "bonds_percentage": 20.0,
            "lifestyle_percentage": 25.0,
            "emergency_fund_percentage": 10.0
        }

        reasoning = []

        # Age-based adjustment (life-cycle investing)
        if request.age < 30:
            allocation["sip_percentage"] += 5
            allocation["stocks_percentage"] += 3
            allocation["lifestyle_percentage"] -= 8
            reasoning.append(
                "Age < 30: Increased long-term investment allocation"
            )
        elif request.age > 50:
            allocation["sip_percentage"] -= 5
            allocation["stocks_percentage"] -= 5
            allocation["bonds_percentage"] += 10
            reasoning.append("Age > 50: More conservative allocation")

        # Risk tolerance adjustment
        if request.risk_tolerance == RiskTolerance.LOW:
            allocation["stocks_percentage"] = max(
                10,
                allocation["stocks_percentage"] - 5
            )
            allocation["bonds_percentage"] += 5
            reasoning.append(
                "Low risk tolerance: Conservative allocation"
            )
        elif request.risk_tolerance == RiskTolerance.HIGH:
            allocation["stocks_percentage"] = min(
                20,
                allocation["stocks_percentage"] + 5
            )
            allocation["bonds_percentage"] -= 5
            reasoning.append(
                "High risk tolerance: Aggressive allocation"
            )

        # Job stability adjustment
        if request.job_stability < 5:
            allocation["emergency_fund_percentage"] += 5
            allocation["lifestyle_percentage"] -= 5
            reasoning.append(
                "Low job stability: Prioritize emergency fund"
            )

        # Market condition adjustment
        if request.market_conditions == MarketCondition.BULL:
            allocation["stocks_percentage"] += 3
            allocation["bonds_percentage"] -= 3
            reasoning.append("Bull market: Increased equity exposure")
        elif request.market_conditions == MarketCondition.BEAR:
            allocation["stocks_percentage"] -= 3
            allocation["bonds_percentage"] += 3
            reasoning.append("Bear market: Reduced equity exposure")

        # Emergency fund adequacy check
        monthly_expenses = request.expenses
        current_months = calculate_emergency_fund_months(
            request.emergency_fund,
            monthly_expenses
        )
        target_months = 6

        if current_months < target_months:
            additional = min(10, (target_months - current_months) * 2)
            allocation["emergency_fund_percentage"] += additional
            allocation["lifestyle_percentage"] -= additional
            months_needed = round(target_months - current_months, 1)
            reasoning.append(
                f"Emergency fund needs {months_needed} months coverage"
            )

        # Debt burden assessment
        debt_to_income = (
            request.debt / (request.income * 12)
            if request.income > 0
            else 1.0
        )
        if debt_to_income > 0.5:
            allocation["lifestyle_percentage"] -= 5
            allocation["emergency_fund_percentage"] += 5
            reasoning.append("High debt burden: Conservative spending")

        # Normalize allocation to 100%
        allocation = normalize_allocation(allocation)

        logger.info("Allocation optimized: %s", allocation)

        return AllocationResponse(
            sip_percentage=round(allocation["sip_percentage"], 2),
            stocks_percentage=round(allocation["stocks_percentage"], 2),
            bonds_percentage=round(allocation["bonds_percentage"], 2),
            lifestyle_percentage=round(
                allocation["lifestyle_percentage"],
                2
            ),
            emergency_fund_percentage=round(
                allocation["emergency_fund_percentage"],
                2
            ),
            reasoning=reasoning,
            confidence=0.85,
            market_context=request.market_conditions.value,
            risk_adjustment=request.risk_tolerance.value
        )

    except Exception as e:  # pylint: disable=broad-except
        logger.error(
            "Allocation optimization failed: %s",
            str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Allocation optimization failed: {str(e)}"
        ) from e


# ============================================================================
# PREDICTIVE ANALYTICS
# ============================================================================

@app.post(
    "/predictive-analytics",
    response_model=PredictionResponse,
    tags=["Predictions"]
)
def predictive_analytics(
    request: PredictiveAnalyticsRequest
):
    """
    Generate predictive financial analytics using ML models.

    Prediction Types:
    - survival_probability: Probability of financial survival
    - layoff_risk: Risk of job loss
    - savings_trajectory: Future savings projection

    Returns prediction with confidence score, factors, and recommendations.
    """
    start_time = time.time()
    try:
        logger.info(
            "Generating %s prediction for horizon %s",
            request.prediction_type,
            request.time_horizon
        )

        prediction_type = request.prediction_type
        time_horizon = request.time_horizon
        user_data = request.user_data

        if not isinstance(user_data, dict):
            raise HTTPException(
                status_code=400,
                detail="user_data must be an object"
            )

        # Survival probability prediction
        if prediction_type == PredictionType.SURVIVAL_PROBABILITY:
            # Use rule-based for now, as no specific survival model
            base_probability = 0.8
            factors_list = []

            emergency_months = ensure_finite_number(
                user_data.get("emergency_months", 0),
                "emergency_months",
                min_value=0
            )
            debt_ratio = ensure_finite_number(
                user_data.get("debt_ratio", 0),
                "debt_ratio",
                min_value=0
            )
            savings_rate = ensure_finite_number(
                user_data.get("savings_rate", 0),
                "savings_rate",
                min_value=0
            )

            if emergency_months < 3:
                base_probability -= 0.2
                factors_list.append("Low emergency fund")

            if debt_ratio > 0.5:
                base_probability -= 0.15
                factors_list.append("High debt ratio")

            if savings_rate < 10:
                base_probability -= 0.1
                factors_list.append("Low savings rate")

            predicted_value = max(0.1, base_probability)

            duration = time.time() - start_time
            logger.info("Survival prediction completed in %.3fs", duration)

            return PredictionResponse(
                prediction_type=prediction_type.value,
                time_horizon=time_horizon.value,
                predicted_value=round(predicted_value, 3),
                confidence_score=0.75,
                factors=factors_list or ["Financial data analyzed"],
                recommendations=[
                    "Build emergency fund to 6 months",
                    "Reduce debt-to-income ratio below 50%",
                    "Increase savings rate to 20%+"
                ],
                timestamp=get_timestamp()
            )

        # Job loss risk prediction
        elif prediction_type == PredictionType.LAYOFF_RISK:
            # Use ML model
            predicted_value = layoff_model.predict(user_data)

            duration = time.time() - start_time
            logger.info("Layoff risk prediction completed in %.3fs", duration)

            return PredictionResponse(
                prediction_type=prediction_type.value,
                time_horizon=time_horizon.value,
                predicted_value=round(predicted_value, 3),
                confidence_score=0.7,
                factors=[
                    f"Industry: {user_data.get('industry', 'IT')}",
                    f"Experience: {user_data.get('experience_years', 1)} years"
                ],
                recommendations=[
                    "Build emergency fund (6-12 months)",
                    "Diversify income sources",
                    "Update resume and professional skills",
                    "Network actively in your industry"
                ],
                timestamp=get_timestamp()
            )

        # Savings trajectory prediction
        elif prediction_type == PredictionType.SAVINGS_TRAJECTORY:
            # Use ML model
            predicted_value = savings_model.predict(user_data)

            duration = time.time() - start_time
            logger.info("Savings trajectory prediction completed in %.3fs", duration)

            return PredictionResponse(
                prediction_type=prediction_type.value,
                time_horizon=time_horizon.value,
                predicted_value=round(predicted_value, 2),
                confidence_score=0.8,
                factors=[
                    f"Current savings: {user_data.get('current_savings', 0)}",
                    f"Monthly contribution: {user_data.get('monthly_savings', 0)}",
                    f"Expected return: {user_data.get('expected_return', 7)}%"
                ],
                recommendations=[
                    "Increase monthly savings by 10%",
                    "Consider higher return investments",
                    "Automate savings transfers",
                    "Review investment allocation"
                ],
                timestamp=get_timestamp()
            )

        else:
            logger.warning(
                "Unknown prediction type requested: %s",
                prediction_type
            )
            raise HTTPException(
                status_code=400,
                detail=f"Unknown prediction type: {prediction_type}"
            )

    except HTTPException:
        raise
    except Exception as e:  # pylint: disable=broad-except
        logger.error(
            "Predictive analytics failed: %s",
            str(e),
            exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail=f"Predictive analytics failed: {str(e)}"
        ) from e


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError):  # pylint: disable=unused-argument
    """Handle ValueError exceptions."""
    logger.error("ValueError: %s", str(exc))
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(_: Request, exc: Exception):  # pylint: disable=unused-argument
    """Handle general exceptions."""
    logger.error("Unhandled exception: %s", str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
